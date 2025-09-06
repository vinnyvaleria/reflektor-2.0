<script>
	import { gameService } from '../..';

	export let onMove = () => {};
	export let disabled = false;

	function handleKeydown(event) {
		if (disabled) return;

		const keyMap = {
			ArrowUp: 'up',
			ArrowDown: 'down',
			ArrowLeft: 'left',
			ArrowRight: 'right',
			w: 'up',
			s: 'down',
			a: 'left',
			d: 'right'
		};

		const direction = keyMap[event.key.toLowerCase()];
		if (direction) {
			event.preventDefault();
			onMove(direction);
		}
	}

	function handleHelperKey(event) {
		if (disabled) return;

		const helperMap = { '1': 'hammer', '2': 'axe', '3': 'sickle' };
		const helper = helperMap[event.key];

		if (helper) {
			try {
				gameService.setSelectedHelper(helper);
			} catch (error) {
				console.warn('Helper not available:', error.message);
			}
		}
	}

	function handleAllKeydown(event) {
		handleKeydown(event);
		handleHelperKey(event);
	}
</script>

<svelte:window on:keydown={handleAllKeydown} />

<div
	class="game-controls flex flex-col items-center gap-4 rounded-lg border-2 border-game-blue bg-white p-6 shadow-lg"
>
	<h3 class="mb-2 text-xl font-bold text-game-dark" style="font-family: 'Jersey 10', sans-serif;">
		Controls
	</h3>

	<div class="arrow-grid grid grid-cols-3 gap-2">
		<div></div>
		<button
			class="control-btn bg-game-primary hover:bg-game-secondary"
			class:disabled
			on:click={() => onMove('up')}
			{disabled}
			title="Move Up"
		>
			⬆️
		</button>
		<div></div>

		<button
			class="control-btn bg-game-primary hover:bg-game-secondary"
			class:disabled
			on:click={() => onMove('left')}
			{disabled}
			title="Move Left"
		>
			⬅️
		</button>
		<div class="h-12 w-12"></div>
		<button
			class="control-btn bg-game-primary hover:bg-game-secondary"
			class:disabled
			on:click={() => onMove('right')}
			{disabled}
			title="Move Right"
		>
			➡️
		</button>

		<div></div>
		<button
			class="control-btn bg-game-primary hover:bg-game-secondary"
			class:disabled
			on:click={() => onMove('down')}
			{disabled}
			title="Move Down"
		>
			⬇️
		</button>
		<div></div>
	</div>

	<div class="text-center text-sm text-gray-600" style="font-family: 'Jersey 10', sans-serif;">
		<p>Use arrow keys, WASD, or click buttons</p>
		<p>Press 1/2/3 to select helpers</p>
	</div>
</div>

<style>
	.control-btn {
		@apply flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold text-white transition-colors duration-200;
	}
	.control-btn:disabled,
	.control-btn.disabled {
		@apply cursor-not-allowed opacity-50;
	}
</style>
