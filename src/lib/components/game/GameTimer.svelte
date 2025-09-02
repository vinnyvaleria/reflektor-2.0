<script>
	import { timeDisplay, gameState } from '../..';

	// props
	export let gameMode = 'FREEPLAY';

	// use reactive declarations for stores
	$: currentGameState = $gameState;
	$: displayTime = $timeDisplay;

	// determine timer color based on time remaining
	$: timerClass = (() => {
		const timeLeft = currentGameState?.timeLeft;
		if (timeLeft == null) return '';
		if (timeLeft <= 30) return 'text-red-400 animate-pulse'; // danger: 30 seconds left
		if (timeLeft <= 60) return 'text-yellow-400'; // warning: 1 minute left
		return 'text-green-400'; // safe: plenty of time
	})();
</script>

{#if gameMode === 'FREEPLAY' && currentGameState.timeLeft !== null}
	<div class="timer-container rounded-lg border-2 border-game-blue bg-gray-800 p-4 shadow-lg">
		<h3 class="mb-2 text-center font-jersey text-lg font-bold text-white">time remaining</h3>

		<div class="text-center">
			<div class="text-4xl font-bold {timerClass} font-jersey">
				{displayTime || '0:00'}
			</div>

			<!-- time up warning -->
			{#if currentGameState.timeLeft <= 10}
				<div class="mt-2 animate-bounce font-jersey text-sm font-bold text-red-400">hurry up!</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.font-jersey {
		font-family: 'Jersey 10', sans-serif;
	}
</style>
