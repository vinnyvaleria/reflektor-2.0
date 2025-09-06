<script>
	import { get } from 'svelte/store';
	import { gameState, obstacleVisibilityStore } from '$lib';

	export let onCellClick = null;

	// Force reactivity by creating a key that changes on player move
	$: updateKey = $gameState.currentPosition
		? `${$gameState.currentPosition.row}-${$gameState.currentPosition.col}-${$gameState.currentPosition.mirroredCol}`
		: '0-0-0';

	// Access reactive game data
	$: mapData = $gameState.mapData;
	$: mirroredMapData = $gameState.mirroredMapData;
	$: currentPosition = $gameState.currentPosition || { row: 0, col: 0, mirroredCol: 0 };
	$: selectedHelper = $gameState.selectedHelper;
	$: gameStatus = $gameState.status || 'PLAYING';
	$: gridSize = mapData?.length || 5;

	$: isGoalReached = checkGoalReached();
	$: canInteract = gameStatus === 'PLAYING' && !isGoalReached;

	// Load obstacle visibility from store
	$: obstacleVisibility = $obstacleVisibilityStore;

	function checkGoalReached() {
		if (gameStatus === 'COMPLETED' || gameStatus === 'TIME_UP' || gameStatus === 'ABANDONED') {
			return true;
		}
		if (!mapData || !mirroredMapData || !currentPosition) return false;

		try {
			const mainCell = mapData[currentPosition.row]?.[currentPosition.col];
			const mirrorCell = mirroredMapData[currentPosition.row]?.[currentPosition.mirroredCol];
			return mainCell === 3 && mirrorCell === 3;
		} catch (error) {
			return false;
		}
	}

	function getObstacleInfo(cellValue, row, col, isMainGrid = true) {
		if (!cellValue) return { isObstacle: false, type: null };

		let isObstacle = false;
		let type = null;

		if (cellValue === 1) {
			isObstacle = true;
			type = 'wall';
		} else if (typeof cellValue === 'object' && cellValue.type === 1) {
			isObstacle = true;
			type = cellValue.obstacle || 'wall';
		}

		// Check visibility from store
		const key = `${row}-${col}-${isMainGrid ? 'main' : 'mirror'}`;
		const visible = obstacleVisibility[key] ?? true; // default visible
		if (!visible) isObstacle = false;

		return { isObstacle, type };
	}

	function getObstacleDisplay(obstacleType) {
		const icons = { wall: '🧱', tree: '🌳', grass: '🌿' };
		return icons[obstacleType] || '🚫';
	}

	function getCellContent(row, col, isMainGrid = true) {
		if (!mapData || !mirroredMapData) return '';

		const grid = isMainGrid ? mapData : mirroredMapData;
		const cellValue = grid?.[row]?.[col];
		if (cellValue === undefined || cellValue === null) return '';

		const isPlayerHere = isMainGrid
			? row === currentPosition.row && col === currentPosition.col
			: row === currentPosition.row && col === currentPosition.mirroredCol;

		if (isPlayerHere) {
			if (cellValue === 3) return '🎯';
			return isMainGrid ? 'P' : 'M';
		}

		const obstacleInfo = getObstacleInfo(cellValue, row, col, isMainGrid);
		if (obstacleInfo.isObstacle) return getObstacleDisplay(obstacleInfo.type);

		if (cellValue === 3) return '🚩';
		return '';
	}

	function getCellClass(row, col, isMainGrid = true) {
		if (!mapData || !mirroredMapData) return 'w-16 h-16 border-2 border-gray-400 bg-gray-200';

		const grid = isMainGrid ? mapData : mirroredMapData;
		const cellValue = grid?.[row]?.[col];

		const isPlayerHere = currentPosition
			? isMainGrid
				? row === currentPosition.row && col === currentPosition.col
				: row === currentPosition.row && col === currentPosition.mirroredCol
			: false;

		let classes =
			'w-16 h-16 border-2 border-game-blue flex items-center justify-center text-xl font-bold transition-all duration-200';

		if (!canInteract) classes += ' opacity-60';

		if (isPlayerHere) {
			classes +=
				cellValue === 3
					? ' bg-green-500 text-white animate-pulse ring-4 ring-green-300 shadow-lg'
					: ' bg-yellow-300 text-game-dark animate-pulse shadow-md';
		} else {
			const obstacleInfo = getObstacleInfo(cellValue, row, col, isMainGrid);
			if (obstacleInfo.isObstacle) {
				const obstacleColors = {
					wall: 'bg-gray-600 text-white',
					tree: 'bg-green-700 text-green-200',
					grass: 'bg-green-500 text-green-100'
				};
				classes += ` ${obstacleColors[obstacleInfo.type] || 'bg-gray-600 text-white'}`;
			} else if (cellValue === 3) {
				classes += ' bg-game-green text-game-dark font-black';
			} else {
				classes += ' bg-game-light';
				if (canInteract) classes += ' hover:bg-gray-100 cursor-pointer';
			}
		}

		if (!canInteract) classes += ' cursor-not-allowed';
		return classes;
	}

	function handleCellClick(row, col, isMainGrid) {
		if (!canInteract) return;
		if (onCellClick) onCellClick(row, col, isMainGrid ? 'main' : 'mirrored');
	}
</script>

{#if mapData && mirroredMapData}
	{#key updateKey}
		<div class="game-grids-container flex items-start justify-center gap-8">
			<!-- Main Grid -->
			<div class="grid-container">
				<h3 class="mb-3 text-center text-lg font-bold text-white">Main Grid</h3>
				<div
					class="border-game-blue grid gap-1 rounded-lg border-4 bg-white p-2 shadow-lg"
					style="grid-template-columns: repeat({gridSize}, minmax(0, 1fr));"
				>
					{#each Array(gridSize) as _, row}
						{#each Array(gridSize) as _, col}
							<button
								class={getCellClass(row, col, true)}
								on:click={() => handleCellClick(row, col, true)}
								type="button"
								disabled={!canInteract}
							>
								{getCellContent(row, col, true)}
							</button>
						{/each}
					{/each}
				</div>
			</div>

			<!-- Mirrored Grid -->
			<div class="grid-container opacity-90">
				<h3 class="mb-3 text-center text-lg font-bold text-white">Mirrored Grid</h3>
				<div
					class="border-game-blue grid gap-1 rounded-lg border-4 bg-white p-2 shadow-lg grayscale"
					style="grid-template-columns: repeat({gridSize}, minmax(0, 1fr));"
				>
					{#each Array(gridSize) as _, row}
						{#each Array(gridSize) as _, col}
							<button
								class={getCellClass(row, col, false)}
								on:click={() => handleCellClick(row, col, false)}
								type="button"
								disabled={!canInteract}
							>
								{getCellContent(row, col, false)}
							</button>
						{/each}
					{/each}
				</div>
			</div>
		</div>
	{/key}
{:else}
	<div class="flex h-96 items-center justify-center">
		<div class="animate-pulse text-2xl text-white">Loading game grid...</div>
	</div>
{/if}

<style>
	.grayscale {
		filter: grayscale(0.3);
	}
	button:disabled {
		cursor: not-allowed !important;
		pointer-events: none;
	}
	.grid-container {
		user-select: none;
	}
</style>
