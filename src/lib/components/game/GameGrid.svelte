<script>
	import { gameState } from '$lib/stores/gameStore.js';

	let {
		onCellClick = null // callback for cell clicks
	} = $props();

	// get all data from store
	const currentGameState = $derived($gameState);
	const gridSize = $derived(currentGameState.mapData?.length || 5);

	// get what should be displayed in each cell
	function getCellContent(row, col, isMainGrid = true) {
		const mapData = isMainGrid ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData?.[row]?.[col];

		// check if this cell has the player
		const isPlayerPosition = isMainGrid
			? row === currentGameState.currentPosition.row && col === currentGameState.currentPosition.col
			: row === currentGameState.currentPosition.row &&
				col === currentGameState.currentPosition.mirroredCol;

		if (isPlayerPosition) {
			return isMainGrid ? 'P' : 'NPC'; // P for player, NPC for mirrored character
		}

		switch (cellValue) {
			case 0:
				return ''; // empty cell
			case 1:
				return '🧱'; // obstacle
			case 2:
				return isMainGrid ? 'P' : 'NPC'; // player position
			case 3:
				return 'X'; // goal
			default:
				return '';
		}
	}

	// get css classes for each cell based on its state
	function getCellClass(row, col, isMainGrid = true) {
		const mapData = isMainGrid ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData?.[row]?.[col];
		const isPlayerPosition = isMainGrid
			? row === currentGameState.currentPosition.row && col === currentGameState.currentPosition.col
			: row === currentGameState.currentPosition.row &&
				col === currentGameState.currentPosition.mirroredCol;

		// base cell styling
		let classes =
			'custom-border-outset w-16 h-16 border-2 border-game-blue flex items-center justify-center text-xl font-bold transition-all duration-200';

		if (isPlayerPosition) {
			// highlight player positions with yellow and animation
			classes += ' bg-yellow-300 text-game-dark animate-pulse';
		} else if (cellValue === 1) {
			// obstacle styling - clickable if helper is selected
			classes += ' bg-game-blue text-white';
			if (currentGameState.selectedHelper) {
				classes += ' cursor-pointer hover:bg-game-primary ring-2 ring-game-primary';
			}
		} else if (cellValue === 3) {
			// goal styling
			classes += ' bg-game-green text-game-dark font-black';
		} else {
			// empty cell styling
			classes += ' bg-game-light hover:bg-gray-100';
		}

		return classes;
	}

	// handle clicks on grid cells (for helper tool usage)
	function handleCellClick(row, col, isMainGrid) {
		if (!onCellClick) return;

		const mapData = isMainGrid ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData?.[row]?.[col];

		// only allow clicking on obstacles when helper is selected
		if (cellValue === 1 && currentGameState.selectedHelper) {
			onCellClick(row, col, isMainGrid ? 'main' : 'mirrored');
		}
	}
</script>

{#if currentGameState.mapData && currentGameState.mirroredMapData}
	<div class="game-grids-container flex items-start justify-center gap-10">
		<!-- main grid (left side) -->
		<div class="grid-container">
			<h3 class="mb-2 text-center font-jersey text-lg">Main Grid</h3>

			<div
				class="grid border-4 border-game-blue bg-white shadow-lg"
				style="grid-template-columns: repeat({gridSize}, minmax(0, 1fr));"
			>
				{#each Array(gridSize) as _, row}
					{#each Array(gridSize) as _, col}
						<button
							class={getCellClass(row, col, true)}
							onclick={() => handleCellClick(row, col, true)}
							type="button"
						>
							{getCellContent(row, col, true)}
						</button>
					{/each}
				{/each}
			</div>
		</div>

		<!-- mirrored grid (right side) -->
		<div class="grid-container opacity-80">
			<h3 class="mb-2 text-center font-jersey text-lg">Mirrored Grid</h3>

			<div
				class="grid border-4 border-game-blue bg-white shadow-lg grayscale"
				style="grid-template-columns: repeat({gridSize}, minmax(0, 1fr));"
			>
				{#each Array(gridSize) as _, row}
					{#each Array(gridSize) as _, col}
						<button
							class={getCellClass(row, col, false)}
							onclick={() => handleCellClick(row, col, false)}
							type="button"
						>
							{getCellContent(row, col, false)}
						</button>
					{/each}
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	/* make mirrored grid slightly faded to show it's secondary */
	.grayscale {
		filter: grayscale(0.3);
	}

	.font-jersey {
		font-family: 'Jersey 10', sans-serif;
	}
</style>
