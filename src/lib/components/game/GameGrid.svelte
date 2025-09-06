<script>
	import { gameState } from '$lib';

	export let onCellClick = null;

	// Force reactivity by creating a key that changes
	$: updateKey = $gameState.currentPosition
		? `${$gameState.currentPosition.row}-${$gameState.currentPosition.col}-${$gameState.currentPosition.mirroredCol}`
		: '0-0-0';

	// Direct store access with $ prefix
	$: mapData = $gameState.mapData;
	$: mirroredMapData = $gameState.mirroredMapData;
	$: currentPosition = $gameState.currentPosition || { row: 0, col: 0, mirroredCol: 0 };
	$: selectedHelper = $gameState.selectedHelper;
	$: gameStatus = $gameState.status || 'PLAYING';
	$: currentSession = $gameState.currentSession;
	$: gridSize = mapData?.length || 5;

	$: isGoalReached = checkGoalReached();
	$: canInteract = gameStatus === 'PLAYING' && !isGoalReached;

	// Debug log to verify updates
	$: if (currentPosition) {
		// console.log('[GameGrid] Position changed:', currentPosition);
	}

	function checkGoalReached() {
		if (gameStatus === 'COMPLETED' || gameStatus === 'TIME_UP' || gameStatus === 'ABANDONED') {
			return true;
		}

		if (!mapData || !mirroredMapData || !currentPosition) {
			return false;
		}

		try {
			const mainCell = mapData[currentPosition.row]?.[currentPosition.col];
			const mirrorCell = mirroredMapData[currentPosition.row]?.[currentPosition.mirroredCol];
			return mainCell === 3 && mirrorCell === 3;
		} catch (error) {
			return false;
		}
	}

	function getObstacleInfo(cellValue) {
		if (cellValue === 1) {
			return { isObstacle: true, type: 'wall' };
		}
		if (typeof cellValue === 'object' && cellValue !== null) {
			if (cellValue.type === 1) {
				return { isObstacle: true, type: cellValue.obstacle || 'wall' };
			}
		}
		return { isObstacle: false, type: null };
	}

	function getObstacleDisplay(obstacleType) {
		const obstacleIcons = {
			wall: '🧱',
			tree: '🌳',
			grass: '🌿'
		};
		return obstacleIcons[obstacleType] || '🚫';
	}

	function getCellContent(row, col, isMainGrid = true) {
		if (!mapData || !mirroredMapData || !currentPosition) return '';

		const grid = isMainGrid ? mapData : mirroredMapData;
		const cellValue = grid?.[row]?.[col];

		if (cellValue === undefined || cellValue === null) return '';

		const isPlayerHere = isMainGrid
			? row === currentPosition.row && col === currentPosition.col
			: row === currentPosition.row && col === currentPosition.mirroredCol;

		if (isPlayerHere) {
			if (cellValue === 3) {
				return '🎯'; // On goal
			}
			return isMainGrid ? 'P' : 'M';
		}

		const obstacleInfo = getObstacleInfo(cellValue);
		if (obstacleInfo.isObstacle) {
			return getObstacleDisplay(obstacleInfo.type);
		}

		switch (cellValue) {
			case 0:
				return '';
			case 2:
				return '';
			case 3:
				return '🚩';
			default:
				return '';
		}
	}

	function getCellClass(row, col, isMainGrid = true) {
		if (!mapData || !mirroredMapData) {
			return 'w-16 h-16 border-2 border-gray-400 bg-gray-200';
		}

		const grid = isMainGrid ? mapData : mirroredMapData;
		const cellValue = grid?.[row]?.[col];

		if (cellValue === undefined || cellValue === null) {
			return 'w-16 h-16 border-2 border-gray-400 bg-gray-200';
		}

		const isPlayerHere = currentPosition
			? isMainGrid
				? row === currentPosition.row && col === currentPosition.col
				: row === currentPosition.row && col === currentPosition.mirroredCol
			: false;

		let classes =
			'w-16 h-16 border-2 border-game-blue flex items-center justify-center text-xl font-bold transition-all duration-200';

		if (!canInteract) {
			classes += ' opacity-60';
		}

		if (isPlayerHere) {
			if (cellValue === 3) {
				classes += ' bg-green-500 text-white animate-pulse ring-4 ring-green-300 shadow-lg';
			} else {
				classes += ' bg-yellow-300 text-game-dark animate-pulse shadow-md';
			}
		} else {
			const obstacleInfo = getObstacleInfo(cellValue);
			if (obstacleInfo.isObstacle) {
				const obstacleColors = {
					wall: 'bg-gray-600 text-white',
					tree: 'bg-green-700 text-green-200',
					grass: 'bg-green-500 text-green-100'
				};
				classes += ` ${obstacleColors[obstacleInfo.type] || 'bg-gray-600 text-white'}`;

				if (canInteract && selectedHelper && canHelperRemoveObstacle(cellValue, selectedHelper)) {
					classes += ' cursor-pointer hover:bg-red-500 hover:scale-105 ring-2 ring-red-400';
				}
			} else if (cellValue === 3) {
				classes += ' bg-game-green text-game-dark font-black';
			} else {
				classes += ' bg-game-light';
				if (canInteract) {
					classes += ' hover:bg-gray-100 cursor-pointer';
				}
			}
		}

		if (!canInteract) {
			classes += ' cursor-not-allowed';
		}

		return classes;
	}

	function canHelperRemoveObstacle(cellValue, helper) {
		if (!helper) return false;

		const obstacleInfo = getObstacleInfo(cellValue);
		if (!obstacleInfo.isObstacle) return false;

		const helperMapping = {
			hammer: 'wall',
			axe: 'tree',
			sickle: 'grass'
		};

		return obstacleInfo.type === helperMapping[helper];
	}

	function handleCellClick(row, col, isMainGrid) {
		if (!canInteract) return;
		if (!mapData || !mirroredMapData || !currentPosition) return;
		if (onCellClick) {
			onCellClick(row, col, isMainGrid ? 'main' : 'mirrored');
		}
	}
</script>

{#if mapData && mirroredMapData && currentPosition}
	<!-- Use key block to force re-render when position changes -->
	{#key updateKey}
		<div class="game-grids-container flex items-start justify-center gap-8">
			<!-- Main Grid -->
			<div class="grid-container">
				<h3
					class="mb-3 text-center text-lg font-bold text-white"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					Main Grid
				</h3>
				<div
					class="grid gap-1 rounded-lg border-4 border-game-blue bg-white p-2 shadow-lg"
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
				<h3
					class="mb-3 text-center text-lg font-bold text-white"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					Mirrored Grid
				</h3>
				<div
					class="grid gap-1 rounded-lg border-4 border-game-blue bg-white p-2 shadow-lg grayscale"
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

	{#if isGoalReached}
		<div class="mt-6 text-center">
			{#if gameStatus === 'COMPLETED'}
				<div class="space-y-2">
					<div class="animate-bounce text-4xl font-bold text-green-400">🎉 LEVEL COMPLETE! 🎉</div>
				</div>
			{:else if gameStatus === 'TIME_UP'}
				<div class="space-y-2">
					<div class="text-4xl font-bold text-red-400">⏰ TIME'S UP! ⏰</div>
				</div>
			{:else}
				<div class="animate-bounce text-3xl font-bold text-green-400">🎯 GOAL REACHED! 🎯</div>
			{/if}
		</div>
	{/if}
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
