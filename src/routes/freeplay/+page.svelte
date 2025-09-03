<script>
	import { onMount } from 'svelte';
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

	// local ui state
	let loading = false;
	let error = null;
	let gameStarted = false;
	let timer = null;
	let selectedDifficulty = 'EASY';
	let playerName = '';
	let feedbackMessage = null;

	// reactive game data from store
	$: currentGameState = $gameState;
	$: currentUser = $userState;
	$: currentSession = currentGameState.currentSession;
	$: status = currentGameState.status;

	// start new freeplay session
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

	// handle player movement
	async function handleMove(direction) {
		if (!currentSession || status !== 'PLAYING') return;

		try {
			// use gameservice.makemove (no session id needed)
			const result = await gameService.makeMove(direction);

			if (result.success) {
				if (result.data.nextPuzzle) {
					console.log(
						`puzzle completed! total solved: ${result.data.gameSession.puzzlesCompleted}`
					);
				}
			} else if (result.collision) {
				console.log(`hit obstacle! rounds used: ${result.data?.gameSession?.roundsUsed}`);
			}
		} catch (err) {
			console.error('move failed:', err.message);
		}
	}

	// enhanced handlecellclick function with helper service integration
	async function handleCellClick(row, col, gridType) {
		const currentPos = currentGameState.currentPosition;
		const mapData =
			gridType === 'main' ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData[row][col];

		// case 1: helper tool selected - try to remove obstacle
		if (currentGameState.selectedHelper) {
			// get the actual obstacle cell data for validation
			const obstacleCell = mapData[row][col];

			try {
				// use the helper service with frontend validation
				const result = await helperService.useHelper(
					currentGameState.currentSession?.id,
					currentGameState.selectedHelper,
					row,
					col,
					gridType,
					obstacleCell // pass obstacle cell for frontend validation
				);

				console.log(
					`✅ ${result.helperUsed} used successfully on ${gridType} grid at (${row}, ${col})`
				);

				// show success feedback
				const helperConfig = helperService.getHelperConfig(result.helperUsed);
				showSuccess(
					`${helperConfig.emoji} ${result.helperUsed} removed ${gridType} ${obstacleCell.obstacle}!`
				);
			} catch (error) {
				console.error('helper tool usage failed:', error);
				showError(error.message || 'helper tool usage failed');
			}
			return;
		}

		// case 2: no helper selected - try to move player to clicked cell
		// only allow movement to adjacent empty cells or goal
		if (cellValue !== 0 && cellValue !== 3) {
			showError('cannot move to that position!');
			return;
		}

		// calculate if clicked cell is adjacent to current position
		const rowDiff = row - currentPos.row;
		const colDiff = gridType === 'main' ? col - currentPos.col : col - currentPos.mirroredCol;

		const isAdjacent = Math.abs(rowDiff) + Math.abs(colDiff) === 1; // manhattan distance = 1

		if (!isAdjacent) {
			showError('can only move to adjacent cells!');
			return;
		}

		// determine movement direction based on click position
		let direction;
		if (rowDiff === -1) direction = 'up';
		else if (rowDiff === 1) direction = 'down';
		else if (colDiff === -1) direction = 'left';
		else if (colDiff === 1) direction = 'right';

		if (!direction) {
			showError('invalid movement direction!');
			return;
		}

		// execute the move using existing handlemove function
		try {
			await handleMove(direction);
		} catch (err) {
			console.error('move failed:', err);
			// error handling is already done in handlemove
		}
	}

	// helper functions for user feedback
	function showError(message) {
		console.error(message);
		feedbackMessage = { type: 'error', text: message, timestamp: Date.now() };
	}

	function showSuccess(message) {
		console.log(message);
		feedbackMessage = { type: 'success', text: message, timestamp: Date.now() };
	}

	// helper selection function
	function handleHelperSelect(helperType) {
		helperService.selectHelper(helperType);
	}

	// setup helper keyboard controls
	function setupHelperKeyboardControls() {
		const handleKeydown = (event) => {
			helperService.handleHelperKeyboard(event);
		};

		const handleHelperSelected = (event) => {
			handleHelperSelect(event.detail.helperType);
		};

		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('helperSelected', handleHelperSelected);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('helperSelected', handleHelperSelected);
		};
	}

	// auto-clear feedback after 3 seconds
	$: if (feedbackMessage) {
		setTimeout(() => {
			if (feedbackMessage && Date.now() - feedbackMessage.timestamp > 3000) {
				feedbackMessage = null;
			}
		}, 3000);
	}

	// cleanup timer on page leave
	onMount(() => {
		const cleanup = setupHelperKeyboardControls();

		return () => {
			if (timer) clearInterval(timer);
			cleanup();
		};
	});

	// handle game over states
	$: if (status === 'TIME_UP' || status === 'COMPLETED') {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		if (status === 'TIME_UP') {
			console.log('time up! game over');
		}
	}
</script>

<svelte:head>
	<title>freeplay mode - reflektor 2.0</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4">
	<!-- header with back button -->
	<div class="mx-auto mb-6 max-w-6xl">
		<div class="flex items-center justify-between">
			<button
				on:click={() => goto('/')}
				class="flex items-center gap-2 rounded-lg border-2 border-blue-500 bg-white px-4 py-2 shadow-lg transition-colors hover:bg-blue-50"
				style="font-family: 'jersey 10', sans-serif;"
			>
				← back to menu
			</button>

			<h1
				class="text-4xl font-bold text-blue-600"
				style="font-family: 'pixelify sans', sans-serif;"
			>
				🎲 freeplay mode
			</h1>

			<div class="w-32"></div>
			<!-- spacer -->
		</div>
	</div>

	<!-- feedback message display -->
	{#if feedbackMessage}
		<div
			class="fixed right-4 top-4 z-50 rounded-lg border-2 p-3 shadow-lg"
			class:bg-red-100={feedbackMessage.type === 'error'}
			class:border-red-400={feedbackMessage.type === 'error'}
			class:text-red-700={feedbackMessage.type === 'error'}
			class:bg-green-100={feedbackMessage.type === 'success'}
			class:border-green-400={feedbackMessage.type === 'success'}
			class:text-green-700={feedbackMessage.type === 'success'}
		>
			{feedbackMessage.text}
		</div>
	{/if}

	{#if !gameStarted}
		<!-- game setup screen -->
		<div class="mx-auto max-w-md">
			<div class="rounded-lg border-2 border-blue-500 bg-white p-6 shadow-lg">
				<h2
					class="mb-6 text-center text-2xl font-bold text-gray-800"
					style="font-family: 'jersey 10', sans-serif;"
				>
					setup your game
				</h2>

				<!-- player name input -->
				{#if !currentUser.isLoggedIn}
					<div class="mb-4">
						<label
							class="mb-2 block text-sm font-bold text-gray-700"
							style="font-family: 'jersey 10', sans-serif;"
						>
							player name (required for guests)
						</label>
						<input
							type="text"
							bind:value={playerName}
							placeholder="enter your name"
							class="w-full rounded-lg border-2 border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
							style="font-family: 'jersey 10', sans-serif;"
							required
						/>
					</div>
				{:else}
					<div class="mb-4 rounded-lg bg-green-100 p-3">
						<p class="text-green-800" style="font-family: 'jersey 10', sans-serif;">
							playing as: <strong
								>{currentUser.user.displayName || currentUser.user.username}</strong
							>
						</p>
					</div>
				{/if}

				<!-- difficulty selection -->
				<div class="mb-6">
					<label
						class="mb-2 block text-sm font-bold text-gray-700"
						style="font-family: 'jersey 10', sans-serif;"
					>
						difficulty level
					</label>
					<div class="grid grid-cols-3 gap-2">
						{#each [['EASY', '5x5'], ['MEDIUM', '7x7'], ['HARD', '9x9']] as [difficulty, size]}
							<button
								class="rounded-lg border-2 p-3 text-center transition-colors"
								class:bg-blue-500={selectedDifficulty === difficulty}
								class:text-white={selectedDifficulty === difficulty}
								class:border-blue-500={selectedDifficulty === difficulty}
								class:bg-white={selectedDifficulty !== difficulty}
								class:text-gray-800={selectedDifficulty !== difficulty}
								class:border-gray-300={selectedDifficulty !== difficulty}
								on:click={() => (selectedDifficulty = difficulty)}
								style="font-family: 'jersey 10', sans-serif;"
							>
								{difficulty.toLowerCase()}
								<div class="mt-1 text-xs">{size}</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- start button -->
				<button
					on:click={startGame}
					disabled={loading || (!currentUser.isLoggedIn && !playerName.trim())}
					class="w-full rounded-lg bg-blue-500 py-4 text-xl font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
					style="font-family: 'jersey 10', sans-serif;"
				>
					{loading ? 'starting game...' : 'start freeplay'}
				</button>

				{#if error}
					<div class="mt-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
						{error}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- main game interface -->
		<div class="mx-auto max-w-7xl">
			{#if status === 'TIME_UP'}
				<!-- game over screen -->
				<div class="mx-auto mb-6 max-w-md">
					<div class="rounded-lg border-2 border-red-500 bg-white p-6 text-center shadow-lg">
						<h2
							class="mb-4 text-3xl font-bold text-red-500"
							style="font-family: 'jersey 10', sans-serif;"
						>
							time's up!
						</h2>
						<div class="mb-4">
							<p class="text-gray-600">
								final score: <span class="font-bold text-blue-600"
									>{currentGameState.currentScore}</span
								>
							</p>
							<p class="text-gray-600">
								puzzles solved: <span class="font-bold"
									>{currentSession?.puzzlesCompleted || 0}</span
								>
							</p>
						</div>
						<div class="flex gap-3">
							<button
								on:click={() => {
									gameStarted = false;
									error = null;
								}}
								class="flex-1 rounded-lg bg-blue-500 py-3 font-bold text-white hover:bg-blue-600"
								style="font-family: 'jersey 10', sans-serif;"
							>
								play again
							</button>
							<button
								on:click={() => goto('/')}
								class="flex-1 rounded-lg bg-gray-500 py-3 font-bold text-white hover:bg-gray-600"
								style="font-family: 'jersey 10', sans-serif;"
							>
								main menu
							</button>
						</div>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- game grid (main area) -->
				<div class="lg:col-span-2">
					<GameGrid onCellClick={handleCellClick} />
				</div>

				<!-- game controls and info (sidebar) -->
				<div class="space-y-4">
					<GameTimer gameMode="FREEPLAY" />
					<GameInfo />
					<GameControls onMove={handleMove} disabled={status !== 'PLAYING'} />
					<HelperTools onHelperSelect={handleHelperSelect} />
				</div>
			</div>
		</div>
	{/if}
</div>
