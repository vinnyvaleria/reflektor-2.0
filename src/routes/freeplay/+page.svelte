<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { gameState, userState } from '$lib/stores/gameStore.js';
	import { gameService } from '$lib/services/gameService.js';
	import { GameGrid, GameControls, HelperTools, GameTimer, GameInfo } from '../../lib';

	// local UI state
	let loading = false;
	let error = null;
	let gameStarted = false;
	let timer = null;
	let selectedDifficulty = 'EASY';
	let playerName = '';

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
			// use gameService.makeMove (no session ID needed)
			const result = await gameService.makeMove(direction);

			if (result.success) {
				if (result.data.nextPuzzle) {
					console.log(
						`Puzzle completed! Total solved: ${result.data.gameSession.puzzlesCompleted}`
					);
				}
			} else if (result.collision) {
				console.log(`Hit obstacle! Rounds used: ${result.data?.gameSession?.roundsUsed}`);
			}
		} catch (err) {
			console.error('Move failed:', err.message);
		}
	}

	async function handleCellClick(row, col, gridType) {
		const currentPos = currentGameState.currentPosition;
		const mapData =
			gridType === 'main' ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData[row][col];

		// case 1: Helper tool selected - try to remove obstacle
		if (currentGameState.selectedHelper) {
			// only allow helper usage on obstacles (value = 1)
			if (cellValue !== 1) {
				showError('Helper tools can only be used on obstacles!');
				return;
			}

			try {
				console.log(
					`Using ${currentGameState.selectedHelper} on ${gridType} grid at (${row}, ${col})`
				);

				// call helper API to remove obstacle
				const response = await fetch('/api/game/helper', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						gameSessionId: currentGameState.currentSession?.id,
						helperType: currentGameState.selectedHelper,
						targetRow: row,
						targetCol: col,
						gridType: gridType
					})
				});

				const result = await response.json();

				if (response.ok) {
					// update game state with modified map
					await gameActions.refreshGameState(result.gameSession);

					// update helper usage in store
					helpers.update((h) => {
						h[currentGameState.selectedHelper].used += 1;
						return h;
					});

					// auto-deselect helper after use
					currentGameState = { ...currentGameState, selectedHelper: null };
					showSuccess(`${currentGameState.selectedHelper} used successfully!`);
				} else {
					showError(result.error || 'Helper tool failed');
				}
			} catch (err) {
				console.error('Helper tool usage failed:', err);
				showError('Helper tool usage failed');
			}
			return;
		}

		// case 2: No helper selected - try to move player to clicked cell
		// only allow movement to adjacent empty cells or goal
		if (cellValue !== 0 && cellValue !== 3) {
			showError('Cannot move to that position!');
			return;
		}

		// calculate if clicked cell is adjacent to current position
		const rowDiff = row - currentPos.row;
		const colDiff = col - currentPos.col;
		const isAdjacent = Math.abs(rowDiff) + Math.abs(colDiff) === 1; // Manhattan distance = 1

		if (!isAdjacent) {
			showError('Can only move to adjacent cells!');
			return;
		}

		// determine movement direction based on click position
		let direction;
		if (rowDiff === -1) direction = 'up';
		else if (rowDiff === 1) direction = 'down';
		else if (colDiff === -1) direction = 'left';
		else if (colDiff === 1) direction = 'right';

		if (!direction) {
			showError('Invalid movement direction!');
			return;
		}

		try {
			await handleMove(direction);
		} catch (err) {
			console.error('Move failed:', err);
		}
	}

	// cleanup timer on page leave
	onMount(() => {
		return () => {
			if (timer) clearInterval(timer);
		};
	});

	// handle game over states
	$: if (status === 'TIME_UP' || status === 'COMPLETED') {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		if (status === 'TIME_UP') {
			console.log('Time up! Game over');
		}
	}
</script>

<svelte:head>
	<title>Freeplay Mode - Reflektor 2.0</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4">
	<!-- Header with back button -->
	<div class="mx-auto mb-6 max-w-6xl">
		<div class="flex items-center justify-between">
			<button
				on:click={() => goto('/')}
				class="flex items-center gap-2 rounded-lg border-2 border-blue-500 bg-white px-4 py-2 shadow-lg transition-colors hover:bg-blue-50"
				style="font-family: 'Jersey 10', sans-serif;"
			>
				← Back to Menu
			</button>

			<h1
				class="text-4xl font-bold text-blue-600"
				style="font-family: 'Pixelify Sans', sans-serif;"
			>
				🎲 Freeplay Mode
			</h1>

			<div class="w-32"></div>
			<!-- Spacer -->
		</div>
	</div>

	{#if !gameStarted}
		<!-- Game setup screen -->
		<div class="mx-auto max-w-md">
			<div class="rounded-lg border-2 border-blue-500 bg-white p-6 shadow-lg">
				<h2
					class="mb-6 text-center text-2xl font-bold text-gray-800"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					Setup Your Game
				</h2>

				<!-- Player name input -->
				{#if !currentUser.isLoggedIn}
					<div class="mb-4">
						<label
							class="mb-2 block text-sm font-bold text-gray-700"
							style="font-family: 'Jersey 10', sans-serif;"
						>
							Player Name (Required for Guests)
						</label>
						<input
							type="text"
							bind:value={playerName}
							placeholder="Enter your name"
							class="w-full rounded-lg border-2 border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
							style="font-family: 'Jersey 10', sans-serif;"
							required
						/>
					</div>
				{:else}
					<div class="mb-4 rounded-lg bg-green-100 p-3">
						<p class="text-green-800" style="font-family: 'Jersey 10', sans-serif;">
							Playing as: <strong
								>{currentUser.user.displayName || currentUser.user.username}</strong
							>
						</p>
					</div>
				{/if}

				<!-- Difficulty selection -->
				<div class="mb-6">
					<label
						class="mb-2 block text-sm font-bold text-gray-700"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						Difficulty Level
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
								style="font-family: 'Jersey 10', sans-serif;"
							>
								{difficulty.toLowerCase()}
								<div class="mt-1 text-xs">{size}</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Start button -->
				<button
					on:click={startGame}
					disabled={loading || (!currentUser.isLoggedIn && !playerName.trim())}
					class="w-full rounded-lg bg-blue-500 py-4 text-xl font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					{loading ? 'Starting Game...' : 'Start Freeplay'}
				</button>

				{#if error}
					<div class="mt-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
						{error}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Main game interface -->
		<div class="mx-auto max-w-7xl">
			{#if status === 'TIME_UP'}
				<!-- Game Over Screen -->
				<div class="mx-auto mb-6 max-w-md">
					<div class="rounded-lg border-2 border-red-500 bg-white p-6 text-center shadow-lg">
						<h2
							class="mb-4 text-3xl font-bold text-red-500"
							style="font-family: 'Jersey 10', sans-serif;"
						>
							Time's Up!
						</h2>
						<div class="mb-4">
							<p class="text-gray-600">
								Final Score: <span class="font-bold text-blue-600"
									>{currentGameState.currentScore}</span
								>
							</p>
							<p class="text-gray-600">
								Puzzles Solved: <span class="font-bold"
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
								style="font-family: 'Jersey 10', sans-serif;"
							>
								Play Again
							</button>
							<button
								on:click={() => goto('/')}
								class="flex-1 rounded-lg bg-gray-500 py-3 font-bold text-white hover:bg-gray-600"
								style="font-family: 'Jersey 10', sans-serif;"
							>
								Main Menu
							</button>
						</div>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Game grid (main area) -->
				<div class="lg:col-span-2">
					<GameGrid onCellClick={handleCellClick} />
				</div>

				<!-- Game controls and info (sidebar) -->
				<div class="space-y-4">
					<GameTimer gameMode="FREEPLAY" />
					<GameInfo />
					<GameControls onMove={handleMove} disabled={status !== 'PLAYING'} />
					<HelperTools />
				</div>
			</div>
		</div>
	{/if}
</div>
