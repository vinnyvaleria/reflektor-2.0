<script>
	import { gameState } from '../..';

	// get data from store instead of props
	const currentGameState = $derived($gameState);

	// extract current stats from game session using $derived
	const puzzlesCompleted = $derived(currentGameState.currentSession?.puzzlesCompleted || 0);
	const totalSteps = $derived(currentGameState.currentSession?.totalSteps || 0);
	const roundsUsed = $derived(currentGameState.currentSession?.roundsUsed || 0);
	const storyLevel = $derived(currentGameState.currentSession?.storyLevel || null);
	const mapMetadata = $derived(currentGameState.currentSession?.currentPuzzle?.metadata || {});
	const levelName = $derived(mapMetadata.name || '');
	const levelDescription = $derived(mapMetadata.description || '');
</script>

<div class="game-info rounded-lg border-2 border-game-blue bg-gray-800 p-4 shadow-lg">
	<!-- game mode header -->
	<div class="mb-4 text-center">
		<h2 class="font-pixelify text-2xl font-bold text-white">
			{currentGameState.gameMode === 'FREEPLAY' ? '🎲 freeplay' : '📖 story mode'}
		</h2>

		{#if currentGameState.gameMode === 'STORY' && storyLevel}
			<div class="font-jersey text-lg text-white">
				<div class="font-bold">level {storyLevel}: {levelName}</div>
				{#if levelDescription}
					<div class="text-sm italic text-gray-300">{levelDescription}</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- current stats -->
	<div class="stats-grid grid grid-cols-2 gap-4 text-center font-jersey">
		{#if currentGameState.gameMode === 'FREEPLAY'}
			<!-- freeplay stats -->
			<div class="stat-item">
				<div class="text-2xl font-bold text-game-green">{puzzlesCompleted}</div>
				<div class="text-sm text-gray-300">puzzles solved</div>
			</div>
		{/if}

		<div class="stat-item">
			<div class="text-2xl font-bold text-game-blue">{totalSteps}</div>
			<div class="text-sm text-gray-300">total steps</div>
		</div>

		<div class="stat-item">
			<div class="text-2xl font-bold text-game-secondary">{roundsUsed}</div>
			<div class="text-sm text-gray-300">obstacles hit</div>
		</div>

		{#if currentGameState.gameMode === 'STORY' && mapMetadata.targetSteps}
			<!-- story mode targets -->
			<div class="stat-item">
				<div class="text-lg font-bold text-yellow-400">{mapMetadata.targetSteps}</div>
				<div class="text-sm text-gray-300">target steps</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.stat-item {
		@apply rounded bg-gray-700 p-2;
	}

	.font-jersey {
		font-family: 'Jersey 10', sans-serif;
	}

	.font-pixelify {
		font-family: 'Pixelify Sans', sans-serif;
	}
</style>
