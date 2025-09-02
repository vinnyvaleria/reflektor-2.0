<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { gameState, gameActions } from '$lib/stores/gameStore.js';
	import GameGrid from '$lib/components/game/GameGrid.svelte';
	import GameControls from '$lib/components/game/GameControls.svelte';
	import HelperTools from '$lib/components/game/HelperTools.svelte';
	import GameInfo from '$lib/components/game/GameInfo.svelte';

	// story mode state
	let loading = false;
	let error = null;
	let gameStarted = false;
	let selectedLevel = 1;
	let playerName = '';
	let showCompletion = false;
	let completionStats = null;

	// reactive game data from store
	$: currentSession = $gameState.currentSession;
	$: mapData = $gameState.mapData;
	$: mirroredMapData = $gameState.mirroredMapData;
	$: currentPosition = $gameState.currentPosition;
	$: gameMode = $gameState.gameMode;
	$: status = $gameState.status;
	$: selectedHelper = $gameState.selectedHelper;

	// available story levels (we only have 5 for testing)
	const availableLevels = [1, 2, 3, 4, 5];

	// start selected story level
	async function startStoryLevel() {
		loading = true;
		error = null;
		showCompletion = false;

		try {
			await gameActions.startStory(selectedLevel, playerName || null);
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
			const result = await gameActions.makeMove(direction, currentSession.id);

			if (result.storyCompleted) {
				showCompletion = true;
				completionStats = result.stats;
				console.log(`story level ${selectedLevel} completed!`, result.stats);
			}

			if (result.collision) {
				console.log(`hit obstacle! rounds used: ${result.gameSession.roundsUsed}`);
			}
		} catch (err) {
			console.error('move failed:', err.message);
		}
	}

	// handle helper tool selection
	function handleHelperSelect(helperName) {
		gameState.update((state) => ({
			...state,
			selectedHelper: helperName
		}));
	}

	// handle cell clicks for helper usage
	function handleCellClick(row, col, gridType) {
		if (!selectedHelper) return;

		console.log(`using ${selectedHelper} on ${gridType} grid at (${row}, ${col})`);
		// todo: implement helper usage api
	}

	// start next level
	function playNextLevel() {
		if (selectedLevel < 5) {
			// we only have 5 levels for testing
			selectedLevel += 1;
			gameStarted = false;
			showCompletion = false;
			completionStats = null;
		}
	}

	// replay current level
	function replayLevel() {
		gameStarted = false;
		showCompletion = false;
		completionStats = null;
	}

	// get star rating based on completion stats
	function getStarRating(stats) {
		if (!stats) return 0;
		return stats.stars || 0;
	}

	// get star emoji display
	function getStarDisplay(rating) {
		return '⭐'.repeat(rating) + '☆'.repeat(3 - rating);
	}
</script>

<svelte:head>
	<title>story mode - reflektor 2.0</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-game-green to-game-light p-4">
	<!-- header with back button -->
	<div class="mx-auto mb-6 max-w-6xl">
		<div class="flex items-center justify-between">
			<button
				on:click={() => goto('/')}
				class="flex items-center gap-2 rounded-lg border-2 border-game-blue bg-white px-4 py-2 shadow-lg transition-colors hover:bg-game-light"
				style="font-family: 'jersey 10', sans-serif;"
			>
				← back to menu
			</button>

			<h1
				class="text-4xl font-bold text-game-primary"
				style="font-family: 'pixelify sans', sans-serif;"
			>
				📖 story mode
			</h1>

			<div class="w-32"></div>
			<!-- spacer -->
		</div>
	</div>

	{#if showCompletion && completionStats}
		<!-- level completion screen -->
		<div class="mx-auto max-w-md">
			<div class="rounded-lg border-2 border-game-green bg-white p-6 text-center shadow-lg">
				<h2
					class="mb-4 text-3xl font-bold text-game-green"
					style="font-family: 'jersey 10', sans-serif;"
				>
					level completed!
				</h2>

				<!-- star rating -->
				<div class="mb-4 text-4xl">
					{getStarDisplay(getStarRating(completionStats))}
				</div>

				<!-- completion stats -->
				<div
					class="mb-6 grid grid-cols-2 gap-4 text-center"
					style="font-family: 'jersey 10', sans-serif;"
				>
					<div class="rounded bg-gray-50 p-3">
						<div class="text-2xl font-bold text-game-blue">{completionStats.steps}</div>
						<div class="text-sm text-gray-600">steps taken</div>
						<div class="text-xs text-gray-500">target: {completionStats.targetSteps}</div>
					</div>

					<div class="rounded bg-gray-50 p-3">
						<div class="text-2xl font-bold text-game-secondary">{completionStats.timeTaken}s</div>
						<div class="text-sm text-gray-600">time taken</div>
						<div class="text-xs text-gray-500">target: {completionStats.targetTime}s</div>
					</div>
				</div>

				<!-- action buttons -->
				<div class="flex gap-3">
					<button
						on:click={replayLevel}
						class="flex-1 rounded-lg bg-game-secondary py-3 font-bold text-white transition-colors hover:bg-game-primary"
						style="font-family: 'jersey 10', sans-serif;"
					>
						replay level
					</button>

					{#if selectedLevel < 5}
						<button
							on:click={playNextLevel}
							class="flex-1 rounded-lg bg-game-green py-3 font-bold text-white transition-colors hover:bg-green-700"
							style="font-family: 'jersey 10', sans-serif;"
						>
							next level
						</button>
					{:else}
						<button
							on:click={() => goto('/')}
							class="flex-1 rounded-lg bg-game-primary py-3 font-bold text-white transition-colors hover:bg-game-secondary"
							style="font-family: 'jersey 10', sans-serif;"
						>
							main menu
						</button>
					{/if}
				</div>
			</div>
		</div>
	{:else if !gameStarted}
		<!-- level selection screen -->
		<div class="mx-auto max-w-md">
			<div class="rounded-lg border-2 border-game-blue bg-white p-6 shadow-lg">
				<h2
					class="mb-6 text-center text-2xl font-bold text-game-dark"
					style="font-family: 'jersey 10', sans-serif;"
				>
					choose your level
				</h2>

				<!-- player name input -->
				<div class="mb-4">
					<label
						class="mb-2 block text-sm font-bold text-game-dark"
						style="font-family: 'jersey 10', sans-serif;"
					>
						player name (optional)
					</label>
					<input
						type="text"
						bind:value={playerName}
						placeholder="enter your name"
						class="w-full rounded-lg border-2 border-gray-300 p-3 focus:border-game-primary focus:outline-none"
						style="font-family: 'jersey 10', sans-serif;"
					/>
				</div>

				<!-- level selection -->
				<div class="mb-6">
					<label
						class="mb-2 block text-sm font-bold text-game-dark"
						style="font-family: 'jersey 10', sans-serif;"
					>
						story level
					</label>
					<div class="grid grid-cols-5 gap-2">
						{#each availableLevels as level}
							<button
								class="aspect-square rounded-lg border-2 p-3 text-center transition-colors"
								class:bg-game-green={selectedLevel === level}
								class:text-white={selectedLevel === level}
								class:border-game-green={selectedLevel === level}
								class:bg-white={selectedLevel !== level}
								class:text-game-dark={selectedLevel !== level}
								class:border-gray-300={selectedLevel !== level}
								on:click={() => (selectedLevel = level)}
								style="font-family: 'jersey 10', sans-serif;"
							>
								{level}
							</button>
						{/each}
					</div>
					<p
						class="mt-2 text-center text-xs text-gray-500"
						style="font-family: 'jersey 10', sans-serif;"
					>
						5 levels available for testing
					</p>
				</div>

				<!-- start button -->
				<button
					on:click={startStoryLevel}
					disabled={loading}
					class="w-full rounded-lg bg-game-green py-4 text-xl font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
					style="font-family: 'jersey 10', sans-serif;"
				>
					{loading ? 'loading level...' : `play level ${selectedLevel}`}
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
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
				<!-- game grid (main area) -->
				<div class="lg:col-span-2">
					<GameGrid
						{mapData}
						{mirroredMapData}
						{currentPosition}
						{selectedHelper}
						{gameMode}
						onCellClick={handleCellClick}
					/>
				</div>

				<!-- game controls and info (sidebar) -->
				<div class="space-y-4 lg:col-span-2">
					<!-- game info -->
					<GameInfo
						gameSession={currentSession}
						{gameMode}
						mapMetadata={currentSession?.currentPuzzle?.metadata}
					/>

					<!-- controls -->
					<GameControls onMove={handleMove} disabled={status !== 'PLAYING'} />

					<!-- helper tools -->
					<HelperTools {selectedHelper} onHelperSelect={handleHelperSelect} />
				</div>
			</div>
		</div>
	{/if}
</div>
