<script>
	import { gameState } from '$lib/stores/gameStore.js';
	import { gameService } from '$lib/services/gameService.js';

	import GameGrid from '$lib/components/game/GameGrid.svelte';
	import GameControls from '$lib/components/game/GameControls.svelte';
	import HelperTools from '$lib/components/game/HelperTools.svelte';
	import GameTimer from '$lib/components/game/GameTimer.svelte';
	import GameInfo from '$lib/components/game/GameInfo.svelte';

	// local UI state
	let loading = $state(false);
	let error = $state('');
	let gameTimer = null;

	// get current game state
	const currentGameState = $derived($gameState);

	async function startFreeplay() {
		loading = true;
		error = '';
		try {
			const data = await gameService.startFreeplay('EASY', 'player');

			// start timer for freeplay using the game service
			if (data.gameSession.timeLimit) {
				gameTimer = gameService.startTimer();
			}
		} catch (err) {
			error = err.message;
		}
		loading = false;
	}

	async function startStory() {
		loading = true;
		error = '';
		try {
			await gameService.startStory(1, 'player');
		} catch (err) {
			error = err.message;
		}
		loading = false;
	}

	async function handleMove(direction) {
		if (!currentGameState.currentSession || currentGameState.status !== 'PLAYING') return;

		try {
			const result = await gameService.makeMove(direction, currentGameState.currentSession.id);

			if (!result.success && result.collision) {
				console.log('Move blocked:', result.reason);
			}
		} catch (err) {
			console.error('Move error:', err);
		}
	}

	function handleCellClick(row, col, gridType) {
		console.log(
			`Clicked ${gridType} grid at (${row}, ${col}) with helper: ${currentGameState.selectedHelper}`
		);
		// TODO: Implement helper tool usage logic here
		// This would remove obstacles from the grid when appropriate helper is selected
	}

	function handleHelperSelect(helper) {
		// Update store through service
		gameService.setSelectedHelper(helper);
		console.log('Helper selected:', helper);
	}

	// cleanup timer when component is destroyed
	$effect(() => {
		return () => {
			if (gameTimer) {
				clearInterval(gameTimer);
			}
		};
	});
</script>

<div class="main-game-background min-h-screen p-8 text-white">
	<div class="container mx-auto">
		{#if !currentGameState.currentSession}
			<!-- Game Start -->
			<div class="text-center">
				<h1 class="mb-8 font-pixelify text-4xl font-bold text-white">Reflektor Game</h1>
				<div class="space-x-4">
					<button
						onclick={startFreeplay}
						disabled={loading}
						class="rounded-lg bg-blue-600 px-6 py-3 font-bold hover:bg-blue-700 disabled:opacity-50"
					>
						{loading ? 'Starting...' : 'Start Freeplay'}
					</button>
					<button
						onclick={startStory}
						disabled={loading}
						class="rounded-lg bg-green-600 px-6 py-3 font-bold hover:bg-green-700 disabled:opacity-50"
					>
						{loading ? 'Starting...' : 'Start Story Mode'}
					</button>
				</div>
				{#if error}
					<p class="mt-4 text-red-400">{error}</p>
				{/if}
			</div>
		{:else}
			<!-- Game Interface -->
			<div class="grid grid-cols-1 gap-6 xl:grid-cols-4">
				<!-- Game Grid -->
				<div class="xl:col-span-3">
					<GameGrid onCellClick={handleCellClick} />
				</div>

				<!-- Sidebar -->
				<div class="space-y-4">
					<GameInfo />
					<GameTimer gameMode={currentGameState.gameMode} />
					<GameControls onMove={handleMove} disabled={currentGameState.status !== 'PLAYING'} />
					<HelperTools
						selectedHelper={currentGameState.selectedHelper}
						onHelperSelect={handleHelperSelect}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.font-pixelify {
		font-family: 'Pixelify Sans', sans-serif;
	}
</style>
