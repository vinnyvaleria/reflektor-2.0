<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	import {
		gameState,
		userState,
		helpers,
		gameService,
		helperService,
		GameGrid,
		GameControls,
		HelperTools,
		GameTimer,
		GameInfo
	} from '$lib';

	// import StoreTest from '$lib/components/game/StoreTest.svelte';

	// Local UI state
	let loading = false;
	let error = null;
	let gameStarted = false;
	let timer = null;
	let selectedDifficulty = 'EASY';
	let playerName = '';
	let feedbackMessage = null;
	let cleanupFunctions = [];

	// Reactive game data from store
	$: currentGameState = $gameState;
	$: currentUser = $userState;
	$: currentSession = currentGameState.currentSession;
	$: status = currentGameState.status;
	$: mapData = currentGameState.mapData;
	$: mirroredMapData = currentGameState.mirroredMapData;
	$: currentPosition = currentGameState.currentPosition;

	// Start new freeplay session
	async function startGame() {
		loading = true;
		error = null;

		try {
			await gameService.startFreeplay(selectedDifficulty, playerName || null);
			gameStarted = true;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	// Handle player movement
	async function handleMove(direction) {
		// Check if move is allowed
		if (!currentSession || status !== 'PLAYING') {
			console.log('Cannot move - game status:', status);
			return;
		}

		try {
			const result = await gameService.makeMove(direction);

			if (result.success) {
				if (result.data.nextPuzzle) {
					console.log(
						`Puzzle completed! Total solved: ${result.data.gameSession.puzzlesCompleted}`
					);
					showSuccess('Puzzle completed! Moving to next puzzle...');
				}
			} else if (result.collision) {
				console.log(`Hit obstacle! Rounds used: ${result.data?.gameSession?.roundsUsed}`);
				showError('Cannot move there - obstacle in the way!');
			}
		} catch (err) {
			console.error('Move failed:', err.message);
			showError('Move failed: ' + err.message);
		}
	}

	// Enhanced handleCellClick function with helper service integration
	async function handleCellClick(row, col, gridType) {
		// Check if interaction is allowed
		if (status !== 'PLAYING') {
			console.log('Cannot interact - game status:', status);
			return;
		}

		const currentPos = currentGameState.currentPosition;
		const mapData =
			gridType === 'main' ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData[row][col];

		// Case 1: Helper tool selected - try to remove obstacle
		if (currentGameState.selectedHelper) {
			// Get the actual obstacle cell data for validation
			const obstacleCell = mapData[row][col];

			try {
				// Use the helper service with frontend validation
				const result = await helperService.useHelper(
					currentGameState.currentSession?.id,
					currentGameState.selectedHelper,
					row,
					col,
					gridType,
					obstacleCell // Pass obstacle cell for frontend validation
				);

				console.log(
					`✅ ${result.helperUsed} used successfully on ${gridType} grid at (${row}, ${col})`
				);

				// Show success feedback
				const helperConfig = helperService.getHelperConfig(result.helperUsed);
				showSuccess(
					`${helperConfig.emoji} ${result.helperUsed} removed ${gridType} ${obstacleCell.obstacle}!`
				);
			} catch (error) {
				console.error('Helper tool usage failed:', error);
				showError(error.message || 'Helper tool usage failed');
			}
			return;
		}

		// Case 2: No helper selected - try to move player to clicked cell
		// Only allow movement to adjacent empty cells or goal
		if (cellValue !== 0 && cellValue !== 3) {
			showError('Cannot move to that position!');
			return;
		}

		// Calculate if clicked cell is adjacent to current position
		const rowDiff = row - currentPos.row;
		const colDiff = gridType === 'main' ? col - currentPos.col : col - currentPos.mirroredCol;

		const isAdjacent = Math.abs(rowDiff) + Math.abs(colDiff) === 1; // Manhattan distance = 1

		if (!isAdjacent) {
			showError('Can only move to adjacent cells!');
			return;
		}

		// Determine movement direction based on click position
		let direction;
		if (rowDiff === -1) direction = 'up';
		else if (rowDiff === 1) direction = 'down';
		else if (colDiff === -1) direction = 'left';
		else if (colDiff === 1) direction = 'right';

		if (!direction) {
			showError('Invalid movement direction!');
			return;
		}

		// Execute the move using existing handleMove function
		try {
			await handleMove(direction);
		} catch (err) {
			console.error('Move failed:', err);
		}
	}

	// Helper functions for user feedback
	function showError(message) {
		console.error(message);
		feedbackMessage = { type: 'error', text: message, timestamp: Date.now() };
	}

	function showSuccess(message) {
		console.log(message);
		feedbackMessage = { type: 'success', text: message, timestamp: Date.now() };
	}

	// Helper selection function
	function handleHelperSelect(helperType) {
		if (status !== 'PLAYING') {
			console.log('Cannot select helper - game not active');
			return;
		}
		helperService.selectHelper(helperType);
	}

	// Setup helper keyboard controls
	function setupHelperKeyboardControls() {
		const handleKeydown = (event) => {
			if (status !== 'PLAYING') return;
			helperService.handleHelperKeyboard(event);
		};

		const handleHelperSelected = (event) => {
			if (status !== 'PLAYING') return;
			handleHelperSelect(event.detail.helperType);
		};

		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('helperSelected', handleHelperSelected);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('helperSelected', handleHelperSelected);
		};
	}

	// Auto-clear feedback after 3 seconds
	$: if (feedbackMessage) {
		setTimeout(() => {
			if (feedbackMessage && Date.now() - feedbackMessage.timestamp >= 3000) {
				feedbackMessage = null;
			}
		}, 3000);
	}

	// Setup and cleanup
	onMount(() => {
		const cleanup = setupHelperKeyboardControls();
		cleanupFunctions.push(cleanup);
	});

	onDestroy(() => {
		// Cleanup all event listeners
		cleanupFunctions.forEach((fn) => fn());

		// Clear timer if exists
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	});

	// Handle game over states
	$: if (status === 'TIME_UP' || status === 'COMPLETED') {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		if (status === 'TIME_UP') {
			console.log('Time up! Game Over.');
			showError("Time's up! Game Over!");
		}
	}

	// Navigate back to home
	function goHome() {
		goto('/');
	}

	// Reset game
	async function resetGame() {
		gameStarted = false;
		feedbackMessage = null;
		error = null;
		gameService.resetGame();
	}
</script>

<!-- <StoreTest /> -->

<div class="main-game-background min-h-screen">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="text-6xl font-black text-white" style="font-family: 'Jersey 10', sans-serif;">
				FREEPLAY MODE
			</h1>
			{#if currentSession}
				<div class="mt-4 text-xl text-white">
					Score: {currentSession.score || 0} | Puzzles: {currentSession.puzzlesCompleted || 0}
				</div>
			{/if}
		</div>

		<!-- Feedback Messages -->
		{#if feedbackMessage}
			<div
				class="fixed left-1/2 top-20 z-50 -translate-x-1/2 transform rounded-lg px-6 py-3 shadow-lg {feedbackMessage.type ===
				'error'
					? 'bg-red-500'
					: 'bg-green-500'} animate-bounce font-bold text-white"
			>
				{feedbackMessage.text}
			</div>
		{/if}

		<!-- Error Display -->
		{#if error}
			<div class="mb-4 rounded-lg bg-red-500/20 p-4 text-red-200">
				<p class="font-bold">Error:</p>
				<p>{error}</p>
			</div>
		{/if}

		<!-- Game Setup (when not started) -->
		{#if !gameStarted}
			<div class="mx-auto max-w-md">
				<div class="rounded-xl bg-white/10 p-8 backdrop-blur-sm">
					<h2
						class="mb-6 text-3xl font-bold text-white"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						START NEW GAME
					</h2>

					<!-- Difficulty Selection -->
					<div class="mb-6">
						<label class="mb-2 block text-lg text-white">Select Difficulty:</label>
						<select
							bind:value={selectedDifficulty}
							class="w-full rounded-lg bg-game-secondary px-4 py-3 text-white backdrop-blur-sm"
						>
							<option value="EASY">Easy (5x5)</option>
							<option value="MEDIUM">Medium (7x7)</option>
							<option value="HARD">Hard (9x9)</option>
						</select>
					</div>

					<!-- Player Name (for guests) -->
					{#if !currentUser?.isLoggedIn}
						<div class="mb-6">
							<label class="mb-2 block text-lg text-white">Your Name:</label>
							<input
								type="text"
								bind:value={playerName}
								placeholder="Enter your name"
								class="w-full rounded-lg bg-white/20 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm"
							/>
						</div>
					{/if}

					<!-- Start Button -->
					<button
						on:click={startGame}
						disabled={loading || (!currentUser?.isLoggedIn && !playerName)}
						class="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-2xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						{loading ? 'STARTING...' : 'START GAME'}
					</button>

					<!-- Back Button -->
					<button
						on:click={goHome}
						class="mt-4 w-full rounded-xl bg-gray-700 py-3 text-xl text-white hover:bg-gray-600"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						BACK TO MENU
					</button>
				</div>
			</div>
		{:else}
			<!-- Active Game -->
			<div class="space-y-6">
				<!-- Game Info Bar -->
				{#if currentSession}
					<GameInfo
						score={currentSession.score || 0}
						puzzlesCompleted={currentSession.puzzlesCompleted || 0}
						roundsUsed={currentSession.roundsUsed || 0}
						difficulty={currentSession.difficulty}
					/>
				{/if}

				<!-- Timer -->
				{#if currentSession?.timeLimit}
					<GameTimer
						initialTime={currentSession.timeLimit}
						on:timeUp={() => {
							status = 'TIME_UP';
							gameService.endGame('TIME_UP');
						}}
					/>
				{/if}

				<!-- Helper Tools -->
				<HelperTools onHelperSelect={handleHelperSelect} />

				<!-- Game Grid -->
				<GameGrid onCellClick={handleCellClick} />

				<!-- Game Controls -->
				<GameControls onMove={handleMove} disabled={status !== 'PLAYING'} />

				<!-- Game Over Screen -->
				{#if status === 'TIME_UP' || status === 'COMPLETED'}
					<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
						<div class="max-w-md rounded-xl bg-white p-8 text-center">
							<h2 class="mb-4 text-4xl font-bold">
								{status === 'TIME_UP' ? "⏰ TIME'S UP!" : '🎉 GAME COMPLETE!'}
							</h2>
							<div class="mb-6 space-y-2">
								<p class="text-2xl">Final Score: {currentSession?.score || 0}</p>
								<p class="text-xl">Puzzles Completed: {currentSession?.puzzlesCompleted || 0}</p>
							</div>
							<div class="space-y-3">
								<button
									on:click={resetGame}
									class="w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
								>
									PLAY AGAIN
								</button>
								<button
									on:click={goHome}
									class="w-full rounded-lg bg-gray-600 px-6 py-3 font-bold text-white hover:bg-gray-700"
								>
									MAIN MENU
								</button>
							</div>
						</div>
					</div>
				{/if}

				<!-- Bottom Actions -->
				<div class="mt-8 flex justify-center gap-4">
					<button
						on:click={resetGame}
						class="rounded-xl bg-yellow-600 px-8 py-3 text-xl font-bold text-white hover:bg-yellow-500"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						NEW GAME
					</button>
					<button
						on:click={goHome}
						class="rounded-xl bg-gray-700 px-8 py-3 text-xl font-bold text-white hover:bg-gray-600"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						QUIT TO MENU
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
