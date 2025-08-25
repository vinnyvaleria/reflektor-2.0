<script>
	import { gameService } from '$lib/services/gameService.js';

	let {
		onMove = () => {}, // callback when movement button is pressed
		disabled = $bindable(false) // disable controls when game is paused/ended
	} = $props();

	// handle keyboard input for movement
	function handleKeydown(event) {
		if (disabled) return;

		// map keyboard keys to movement directions
		const keyMap = {
			ArrowUp: 'up',
			ArrowDown: 'down',
			ArrowLeft: 'left',
			ArrowRight: 'right',
			w: 'up', // WASD alternative
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

	// handle helper selection via number keys (same as original game)
	function handleHelperKey(event) {
		if (disabled) return;

		const helperMap = {
			'1': 'hammer',
			'2': 'axe',
			'3': 'sickle'
		};

		const helper = helperMap[event.key];
		if (helper) {
			// update store through service
			gameService.setSelectedHelper(helper);

			// also dispatch custom event for backwards compatibility
			const helperEvent = new CustomEvent('helperSelect', { detail: helper });
			document.dispatchEvent(helperEvent);
		}
	}

	// combine keyboard event handlers
	function handleAllKeydown(event) {
		handleKeydown(event);
		handleHelperKey(event);
	}
</script>

<!-- listen for keyboard events globally -->
<svelte:window onkeydown={handleAllKeydown} />

<div
	class="game-controls flex flex-col items-center gap-4 rounded-lg border-2 border-game-blue bg-gray-800 p-6 shadow-lg"
>
	<h3 class="mb-2 font-jersey text-xl font-bold text-white">controls</h3>

	<!-- arrow button layout (cross pattern) -->
	<div class="arrow-grid grid grid-cols-3 gap-2">
		<!-- top row -->
		<div></div>
		<button
			class="control-btn bg-game-primary hover:bg-game-secondary"
			class:disabled
			onclick={() => onMove('up')}
			{disabled}
			title="Move Up (↑ or W)"
		>
			⬆️
		</button>
		<div></div>

		<!-- middle row -->
		<button
			class="control-btn bg-game-primary hover:bg-game-secondary"
			class:disabled
			onclick={() => onMove('left')}
			{disabled}
			title="Move Left (← or A)"
		>
			⬅️
		</button>
		<div class="h-12 w-12"></div>
		<button
			class="control-btn bg-game-primary hover:bg-game-secondary"
			class:disabled
			onclick={() => onMove('right')}
			{disabled}
			title="Move Right (→ or D)"
		>
			➡️
		</button>

		<!-- bottom row -->
		<div></div>
		<button
			class="control-btn bg-game-primary hover:bg-game-secondary"
			class:disabled
			onclick={() => onMove('down')}
			{disabled}
			title="Move Down (↓ or S)"
		>
			⬇️
		</button>
		<div></div>
	</div>

	<!-- instruction text -->
	<div class="text-center font-jersey text-sm text-gray-300">
		<p>use arrow keys, WASD, or click buttons</p>
		<p>press 1/2/3 to select helpers</p>
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

	.control-btn:disabled:hover,
	.control-btn.disabled:hover {
		@apply bg-game-primary; /* don't change color when disabled */
	}

	.font-jersey {
		font-family: 'Jersey 10', sans-serif;
	}
</style>
