<script>
	import { gameState } from '../..';

	export let onCellClick = null; // callback for cell clicks (optional)

	$: currentGameState = $gameState;
	$: gridSize = currentGameState.mapData?.length || 5;

	// handle both simple obstacles (1) and obstacle objects {type: 1, obstacle: 'wall'}
	function getObstacleInfo(cellValue) {
		if (cellValue === 1) {
			return { isObstacle: true, type: 'wall' };
		}
		if (typeof cellValue === 'object' && cellValue?.type === 1) {
			return { isObstacle: true, type: cellValue.obstacle || 'wall' };
		}
		return { isObstacle: false, type: null };
	}

	function getObstacleDisplay(obstacleType) {
		const obstacleIcons = {
			wall: '🧱',
			tree: '🌳',
			grass: '🌿'
		};
		return obstacleIcons[obstacleType] || '🧱';
	}

	function getCellContent(row, col, isMainGrid = true) {
		const mapData = isMainGrid ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData?.[row]?.[col];

		const isPlayerPosition = isMainGrid
			? row === currentGameState.currentPosition.row && col === currentGameState.currentPosition.col
			: row === currentGameState.currentPosition.row &&
				col === currentGameState.currentPosition.mirroredCol;

		if (isPlayerPosition) {
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
				return isMainGrid ? 'P' : 'M';
			case 3:
				return 'X';
			default:
				return '';
		}
	}

	function canHelperRemoveObstacle(cellValue, selectedHelper) {
		const obstacleInfo = getObstacleInfo(cellValue);
		if (!obstacleInfo.isObstacle || !selectedHelper) return false;

		const helperMapping = {
			hammer: 'wall',
			axe: 'tree',
			sickle: 'grass'
		};

		return obstacleInfo.type === helperMapping[selectedHelper];
	}

	function getCellClass(row, col, isMainGrid = true) {
		const mapData = isMainGrid ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData?.[row]?.[col];
		const isPlayerPosition = isMainGrid
			? row === currentGameState.currentPosition.row && col === currentGameState.currentPosition.col
			: row === currentGameState.currentPosition.row &&
				col === currentGameState.currentPosition.mirroredCol;

		let classes =
			'w-16 h-16 border-2 border-game-blue flex items-center justify-center text-xl font-bold transition-all duration-200';

		if (isPlayerPosition) {
			classes += ' bg-yellow-300 text-game-dark animate-pulse';
		} else {
			const obstacleInfo = getObstacleInfo(cellValue);
			if (obstacleInfo.isObstacle) {
				const obstacleColors = {
					wall: 'bg-gray-600 text-white',
					tree: 'bg-green-700 text-green-200',
					grass: 'bg-green-500 text-green-100'
				};
				classes += ` ${obstacleColors[obstacleInfo.type] || 'bg-gray-600 text-white'}`;

				if (
					currentGameState.selectedHelper &&
					canHelperRemoveObstacle(cellValue, currentGameState.selectedHelper)
				) {
					classes += ' cursor-pointer hover:bg-red-500 ring-2 ring-red-400';
				}
			} else if (cellValue === 3) {
				classes += ' bg-game-green text-game-dark font-black';
			} else {
				classes += ' bg-game-light hover:bg-gray-100';
			}
		}

		return classes;
	}

	function handleCellClick(row, col, isMainGrid) {
		const mapData = isMainGrid ? currentGameState.mapData : currentGameState.mirroredMapData;
		const cellValue = mapData?.[row]?.[col];

		// only allow clicking on obstacles when helper is selected
		if (
			currentGameState.selectedHelper &&
			canHelperRemoveObstacle(cellValue, currentGameState.selectedHelper)
		) {
			// call parent callback if provided - parent will handle the actual helper usage
			if (onCellClick) {
				onCellClick(row, col, isMainGrid ? 'main' : 'mirrored');
			}
		}
	}
</script>

{#if currentGameState.mapData && currentGameState.mirroredMapData}
	<div class="game-grids-container flex items-start justify-center gap-8">
		<div class="grid-container">
			<h3
				class="mb-3 text-center text-lg font-bold text-game-dark"
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
						>
							{getCellContent(row, col, true)}
						</button>
					{/each}
				{/each}
			</div>
		</div>

		<div class="grid-container opacity-80">
			<h3
				class="mb-3 text-center text-lg font-bold text-game-dark"
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
	.grayscale {
		filter: grayscale(0.3);
	}
</style>
