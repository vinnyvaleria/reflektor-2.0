<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import {
		gameState,
		helpers,
		helperService,
		gameService,
		userState,
		storyProgress,
		progressService,
		GameGrid,
		GameControls,
		HelperTools,
		GameInfo
	} from '$lib';

	// Get level from URL params
	let selectedLevel = 1;
	let loading = false;
	let error = null;
	let gameStarted = false;
	let playerName = '';
	let showCompletion = false;
	let completionStats = null;
	let feedbackMessage = null;
	let cleanupFunctions = [];

	// Reactive stores
	$: currentSession = $gameState.currentSession;
	$: mapData = $gameState.mapData;
	$: mirroredMapData = $gameState.mirroredMapData;
	$: currentPosition = $gameState.currentPosition;
	$: status = $gameState.status;
	$: selectedHelper = $gameState.selectedHelper;
	$: currentUser = $userState;
	$: progress = $storyProgress;
	$: isGuest = !currentUser?.isLoggedIn;

	// Get level from URL
	$: if ($page.url.searchParams.has('level')) {
		selectedLevel = parseInt($page.url.searchParams.get('level'));
	}

	// Watch for game completion
	$: if (status === 'COMPLETED' && !showCompletion && currentSession) {
		showCompletion = true;
		if ($gameState.completionStats) {
			completionStats = $gameState.completionStats;
		}
	}

	// Start story level
	async function startStoryLevel() {
		loading = true;
		error = null;
		showCompletion = false;
		completionStats = null;

		try {
			await gameService.startStory(selectedLevel, playerName || null);
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
			// console.log('Cannot move - game status:', status);
			return;
		}

		try {
			const result = await gameService.makeMove(direction);

			if (result.success && result.data.storyCompleted) {
				showCompletion = true;
				completionStats = result.data.stats;

				// Update progress
				if (currentUser?.isLoggedIn) {
					await progressService.loadUserProgress(currentUser.user.id);
				} else {
					progressService.updateGuestStoryProgress(result.data.stats);
				}

				showSuccess('Level completed! 🎉');
			}

			if (!result.success && result.collision) {
				showError(`Hit obstacle! Rounds: ${result.data?.gameSession?.roundsUsed}`);
			}
		} catch (err) {
			// console.error('Move failed:', err.message);
			showError('Move failed: ' + err.message);
		}
	}

	// Handle cell click
	async function handleCellClick(row, col, gridType) {
		// Check if interaction is allowed
		if (status !== 'PLAYING') {
			// console.log('Cannot interact - game status:', status);
			return;
		}

		const currentPos = currentPosition;
		const currentMapData = gridType === 'main' ? mapData : mirroredMapData;
		const cellValue = currentMapData[row][col];

		// Case 1: Helper tool selected - try to remove obstacle
		if (selectedHelper) {
			const obstacleCell = currentMapData[row][col];

			try {
				const result = await helperService.useHelper(
					currentSession?.id,
					selectedHelper,
					row,
					col,
					gridType,
					obstacleCell
				);

				// console.log(
					`✅ ${result.helperUsed} used successfully on ${gridType} grid at (${row}, ${col})`
				);

				const helperConfig = helperService.getHelperConfig(result.helperUsed);
				showSuccess(`${helperConfig.emoji} ${result.helperUsed} removed ${gridType} obstacle!`);
			} catch (error) {
				// console.error('Helper tool usage failed:', error);
				showError(error.message || 'Helper tool usage failed');
			}
			return;
		}

		// Case 2: No helper selected - try to move to clicked cell
		if (cellValue !== 0 && cellValue !== 3) {
			showError('Cannot move to that position!');
			return;
		}

		// Calculate if clicked cell is adjacent
		const rowDiff = row - currentPos.row;
		const colDiff = gridType === 'main' ? col - currentPos.col : col - currentPos.mirroredCol;
		const isAdjacent = Math.abs(rowDiff) + Math.abs(colDiff) === 1;

		if (!isAdjacent) {
			showError('Can only move to adjacent cells!');
			return;
		}

		// Determine direction
		let direction;
		if (rowDiff === -1) direction = 'up';
		else if (rowDiff === 1) direction = 'down';
		else if (colDiff === -1) direction = 'left';
		else if (colDiff === 1) direction = 'right';

		if (direction) {
			await handleMove(direction);
		}
	}

	// Helper functions
	function showError(message) {
		// console.error(message);
		feedbackMessage = { type: 'error', text: message, timestamp: Date.now() };
	}

	function showSuccess(message) {
		// console.log(message);
		feedbackMessage = { type: 'success', text: message, timestamp: Date.now() };
	}

	function handleHelperSelect(helperType) {
		if (status !== 'PLAYING') {
			// console.log('Cannot select helper - game not active');
			return;
		}
		helperService.selectHelper(helperType);
	}

	// Star rating calculation
	function getStarRating(stats) {
		if (!stats) return 0;
		return stats.stars || 0;
	}

	function getStarDisplay(stars) {
		const filled = '⭐'.repeat(stars);
		const empty = '☆'.repeat(3 - stars);
		return filled + empty;
	}

	// Navigation functions
	function replayLevel() {
		showCompletion = false;
		completionStats = null;
		gameStarted = false;
		gameService.resetGame();
		startStoryLevel();
	}

	function playNextLevel() {
		if (selectedLevel < 30) {
			goto(`/story?level=${selectedLevel + 1}`);
			selectedLevel++;
			showCompletion = false;
			completionStats = null;
			gameStarted = false;
			gameService.resetGame();
		}
	}

	function goToLevelSelect() {
		goto('/levels');
	}

	// Setup keyboard controls
	function setupKeyboardControls() {
		const handleKeydown = (event) => {
			if (status !== 'PLAYING') return;

			// Arrow keys for movement
			if (event.key === 'ArrowUp') handleMove('up');
			else if (event.key === 'ArrowDown') handleMove('down');
			else if (event.key === 'ArrowLeft') handleMove('left');
			else if (event.key === 'ArrowRight') handleMove('right');
			// Helper keys
			else if (event.key === '1' || event.key === 'h') helperService.selectHelper('hammer');
			else if (event.key === '2' || event.key === 'a') helperService.selectHelper('axe');
			else if (event.key === '3' || event.key === 's') helperService.selectHelper('sickle');
			else if (event.key === 'Escape') helperService.selectHelper(null);
		};

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	}

	// Auto-clear feedback
	$: if (feedbackMessage) {
		setTimeout(() => {
			if (feedbackMessage && Date.now() - feedbackMessage.timestamp >= 3000) {
				feedbackMessage = null;
			}
		}, 3000);
	}

	// Lifecycle
	onMount(() => {
		const cleanup = setupKeyboardControls();
		cleanupFunctions.push(cleanup);
	});

	onDestroy(() => {
		cleanupFunctions.forEach((fn) => fn());
	});
</script>

<div class="main-game-background min-h-screen">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="text-6xl font-black text-white" style="font-family: 'Jersey 10', sans-serif;">
				STORY MODE - LEVEL {selectedLevel}
			</h1>
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

		<!-- Completion Screen -->
		{#if showCompletion && completionStats}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
				<div
					class="max-w-md rounded-xl bg-gradient-to-br from-blue-900 to-purple-900 p-8 text-center"
				>
					<h2
						class="mb-4 text-5xl font-black text-white"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						LEVEL COMPLETE!
					</h2>

					<!-- Stars -->
					<div class="mb-6 text-6xl">
						{getStarDisplay(getStarRating(completionStats))}
					</div>

					<!-- Stats -->
					<div class="mb-8 grid grid-cols-2 gap-4">
						<div class="rounded-lg bg-white/10 p-4">
							<div class="text-3xl font-bold text-blue-400">{completionStats.steps}</div>
							<div class="text-white/70">Steps Taken</div>
							<div class="text-sm text-gray-400">Target: {completionStats.targetSteps}</div>
						</div>
						<div class="rounded-lg bg-white/10 p-4">
							<div class="text-3xl font-bold text-green-400">{completionStats.timeTaken}s</div>
							<div class="text-white/70">Time Taken</div>
							<div class="text-sm text-gray-400">Target: {completionStats.targetTime}s</div>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex gap-4">
						<button
							on:click={replayLevel}
							class="flex-1 rounded-xl bg-yellow-600 py-3 text-xl font-bold text-white hover:bg-yellow-500"
							style="font-family: 'Jersey 10', sans-serif;"
						>
							REPLAY
						</button>

						{#if selectedLevel < 30}
							<button
								on:click={playNextLevel}
								class="flex-1 rounded-xl bg-green-600 py-3 text-xl font-bold text-white hover:bg-green-500"
								style="font-family: 'Jersey 10', sans-serif;"
							>
								NEXT LEVEL
							</button>
						{:else}
							<button
								on:click={goToLevelSelect}
								class="flex-1 rounded-xl bg-purple-600 py-3 text-xl font-bold text-white hover:bg-purple-500"
								style="font-family: 'Jersey 10', sans-serif;"
							>
								LEVEL SELECT
							</button>
						{/if}
					</div>

					<button
						on:click={() => goto('/')}
						class="mt-4 w-full rounded-xl bg-gray-700 py-3 text-xl font-bold text-white hover:bg-gray-600"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						MAIN MENU
					</button>
				</div>
			</div>
		{:else if loading}
			<div class="flex h-96 items-center justify-center">
				<div class="animate-pulse text-3xl text-white">Loading level...</div>
			</div>
		{:else if error}
			<div class="mx-auto max-w-md">
				<div class="rounded-xl bg-red-600/20 p-6 backdrop-blur-sm">
					<h3 class="mb-2 text-2xl font-bold text-red-400">Error</h3>
					<p class="mb-4 text-white">{error}</p>
					<button
						on:click={() => goto('/levels')}
						class="w-full rounded-lg bg-red-600 py-3 font-bold text-white hover:bg-red-700"
					>
						Back to Level Select
					</button>
				</div>
			</div>
		{:else if !gameStarted}
			<!-- Start Level Screen -->
			<div class="mx-auto max-w-md">
				<div class="rounded-xl bg-white/10 p-8 backdrop-blur-sm">
					<h2
						class="mb-6 text-center text-4xl font-bold text-white"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						LEVEL {selectedLevel}
					</h2>

					{#if currentSession?.currentPuzzle?.metadata}
						<div class="mb-6 space-y-3">
							<div class="flex justify-between text-white">
								<span>Target Steps:</span>
								<span class="font-bold">{currentSession.currentPuzzle.metadata.targetSteps}</span>
							</div>
							<div class="flex justify-between text-white">
								<span>Target Time:</span>
								<span class="font-bold">{currentSession.currentPuzzle.metadata.targetTime}s</span>
							</div>
						</div>
					{/if}

					{#if isGuest && !playerName}
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

					<button
						on:click={startStoryLevel}
						disabled={loading || (isGuest && !playerName)}
						class="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-2xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						{loading ? 'LOADING...' : 'START LEVEL'}
					</button>

					<button
						on:click={() => goto('/levels')}
						class="mt-4 w-full rounded-xl bg-gray-700 py-3 text-xl text-white hover:bg-gray-600"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						BACK TO LEVELS
					</button>
				</div>
			</div>
		{:else}
			<!-- Active Game -->
			<div class="space-y-6">
				<!-- Game Info -->
				{#if currentSession}
					<GameInfo
						level={selectedLevel}
						steps={currentSession.totalSteps || 0}
						targetSteps={currentSession.currentPuzzle?.metadata?.targetSteps}
						roundsUsed={currentSession.roundsUsed || 0}
					/>
				{/if}

				<!-- Helper Tools -->
				<HelperTools onHelperSelect={handleHelperSelect} />

				<!-- Game Grid -->
				<GameGrid onCellClick={handleCellClick} />

				<!-- Game Controls -->
				<GameControls onMove={handleMove} disabled={status !== 'PLAYING'} />

				<!-- Bottom Actions -->
				<div class="mt-8 flex justify-center gap-4">
					<button
						on:click={replayLevel}
						class="rounded-xl bg-yellow-600 px-8 py-3 text-xl font-bold text-white hover:bg-yellow-500"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						RESTART LEVEL
					</button>
					<button
						on:click={() => goto('/levels')}
						class="rounded-xl bg-gray-700 px-8 py-3 text-xl font-bold text-white hover:bg-gray-600"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						LEVEL SELECT
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
