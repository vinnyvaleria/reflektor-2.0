// src/lib/server/gameEngine/mapGenerator.js

import { STORY_MAPS } from '$lib/data/storyMaps.js';

export class MapGenerator {
	// random map generator for freeplay mode
	static generateFreeplay(difficulty = 'EASY') {
		const sizes = { EASY: 5, MEDIUM: 7, HARD: 9 };
		const size = sizes[difficulty];

		const obstacleRanges = {
			EASY: [0.25, 0.35], // 25-35%
			MEDIUM: [0.4, 0.45], // 30-40%
			HARD: [0.45, 0.55] // 35-45%
		};
		const [min, max] = obstacleRanges[difficulty];

		let mainMap,
			attempts = 0;

		// try to generate solvable maps with different obstacles
		// use BFS to make sure the map generated is solvable
		do {
			mainMap = this.createRandomMap(size, min, max);
			attempts++;
		} while (!this.hasValidPath(mainMap) && attempts < 20);

		// after 20 attempts of BFS and not solved, use simple map generator instead
		if (attempts >= 20) {
			mainMap = this.createSimpleMap(size);
		}

		// create mirrored version (simple horizontal flip)
		const mirroredMap = this.mirrorMap(mainMap);

		return {
			mainMap: mainMap,
			mirroredMap: mirroredMap,
			metadata: {
				size,
				difficulty,
				attempts,
				mode: 'FREEPLAY',
				obstacles: {
					main: this.countObstacles(mainMap),
					mirrored: this.countObstacles(mirroredMap)
				},
				generatedAt: new Date().toISOString()
			}
		};
	}

	// get story mode map with different obstacles
	static getStoryMap(level) {
		const storyData = STORY_MAPS.find((m) => m.level === level);
		if (!storyData) throw new Error(`Story level ${level} not found`);

		// create mirrored version with different obstacles
		const enhancedMapData = this.addObstacleVariety(storyData.mapData);
		const mirroredMap = this.mirrorMap(enhancedMapData);

		return {
			mainMap: enhancedMapData,
			mirroredMap: mirroredMap,
			metadata: {
				size: 9,
				level,
				name: storyData.name,
				description: storyData.description,
				targetSteps: storyData.targetSteps,
				targetTime: storyData.targetTime,
				mode: 'STORY'
			}
		};
	}

	// add visual variety to story maps
	static addObstacleVariety(mapData) {
		const obstacleTypes = ['wall', 'tree', 'grass'];

		return mapData.map((row) =>
			row.map((cell) => {
				if (cell === 1) {
					// convert simple obstacle to object with random type
					return {
						type: 1,
						obstacle: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
					};
				}
				return cell;
			})
		);
	}

	// check if obstacle can be removed by helper tool
	static canRemoveObstacle(obstacleCell, helperType) {
		if (typeof obstacleCell !== 'object' || obstacleCell.type !== 1) {
			return false; // not an obstacle
		}

		const helperMapping = {
			hammer: 'wall',
			axe: 'tree',
			sickle: 'grass'
		};

		return obstacleCell.obstacle === helperMapping[helperType];
	}

	// simple horizontal mirroring - just flip each row
	static mirrorMap(originalMap) {
		return originalMap.map((row) =>
			[...row].reverse().map((cell) => {
				if (typeof cell === 'object' && cell.type === 1) {
					// keep same obstacle structure but potentially different type
					const obstacleTypes = ['wall', 'tree', 'grass'];
					return {
						type: 1,
						obstacle: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
					};
				}
				return cell;
			})
		);
	}

	static createEmptyMap(size) {
		return Array(size)
			.fill(0)
			.map(() => Array(size).fill(0));
	}

	static createRandomMap(size, min, max) {
		const map = this.createEmptyMap(size);
		const obstacleTypes = ['wall', 'tree', 'grass'];

		// place player (bottom area - easier to see)
		const playerRow = Math.floor(size * 0.7) + Math.floor(Math.random() * Math.floor(size * 0.3));
		const playerCol = Math.floor(Math.random() * Math.floor(size * 0.4));
		map[playerRow][playerCol] = 2;

		// place goal (top-right area)
		const goalRow = Math.floor(Math.random() * Math.floor(size * 0.4));
		const goalCol = Math.floor(size * 0.6) + Math.floor(Math.random() * Math.floor(size * 0.4));
		map[goalRow][goalCol] = 3;

		// add obstacles
		const totalCells = size * size;
		const obstacleCount = Math.floor(totalCells * (min + Math.random() * (max - min)));

		let placed = 0;
		while (placed < obstacleCount) {
			const row = Math.floor(Math.random() * size);
			const col = Math.floor(Math.random() * size);

			if (map[row][col] === 0) {
				// create obstacle with random type
				const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
				map[row][col] = {
					type: 1,
					obstacle: obstacleType
				};
				placed++;
			}
		}

		return map;
	}

	// in case random map is too hard - create solvable simple map
	static createSimpleMap(size) {
		const map = this.createEmptyMap(size);
		const obstacleTypes = ['wall', 'tree', 'grass'];

		// player at bottom-left
		map[size - 1][0] = 2;

		// goal at top-right
		map[0][size - 1] = 3;

		// add obstacles in multiple columns, but keep clear paths
		const obstacleColumns = [
			Math.floor(size / 3),
			Math.floor(size / 2),
			Math.floor((size * 2) / 3)
		];

		obstacleColumns.forEach((col) => {
			for (let i = 1; i < size - 1; i++) {
				if (Math.random() > 0.4) {
					// create obstacle object instead of simple 1
					const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
					map[i][col] = {
						type: 1,
						obstacle: obstacleType
					};
				}
			}
		});

		return map;
	}

	// check for valid path within map generation
	static hasValidPath(map) {
		const size = map.length;
		let start = null,
			end = null;

		// find start (2) and end (3) positions
		for (let row = 0; row < size; row++) {
			for (let col = 0; col < size; col++) {
				if (map[row][col] === 2) start = { row, col };
				if (map[row][col] === 3) end = { row, col };
			}
		}

		// when start and end not found
		if (!start || !end) return false;

		// early exit if start and end are same
		if (start.row === end.row && start.col === end.col) return true;

		// BFS pathfinding to ensure solvable - FIFO
		const visited = new Set(); // use Set for better performance
		const queue = [start];
		visited.add(`${start.row},${start.col}`);

		const directions = [
			{ row: -1, col: 0 }, // up
			{ row: 1, col: 0 }, // down
			{ row: 0, col: -1 }, // left
			{ row: 0, col: 1 } // right
		];

		while (queue.length > 0) {
			const current = queue.shift();

			// if the current location is equal to end, return true - there is valid path
			if (current.row === end.row && current.col === end.col) {
				return true;
			}

			for (const dir of directions) {
				const newRow = current.row + dir.row;
				const newCol = current.col + dir.col;
				const posKey = `${newRow},${newCol}`;

				// to check if it is within grid, not visited yet and not an obstacle
				if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && !visited.has(posKey)) {
					const cell = map[newRow][newCol];
					// allow movement through empty cells (0) or goal (3)
					// block movement through obstacles (type 1 objects or value 1)
					const isPassable =
						cell === 0 ||
						cell === 3 ||
						(!(typeof cell === 'object' && cell.type === 1) && cell !== 1);

					if (isPassable) {
						visited.add(posKey);
						queue.push({ row: newRow, col: newCol });
					}
				}
			}
		}

		return false;
	}

	static countObstacles(map) {
		return map.flat().filter((cell) => cell === 1 || (typeof cell === 'object' && cell.type === 1))
			.length;
	}

	static getPlayerPosition(map) {
		for (let row = 0; row < map.length; row++) {
			for (let col = 0; col < map[row].length; col++) {
				if (map[row][col] === 2) {
					return { row, col };
				}
			}
		}
		return null;
	}

	// get goal position for validation
	static getGoalPosition(map) {
		for (let row = 0; row < map.length; row++) {
			for (let col = 0; col < map[row].length; col++) {
				if (map[row][col] === 3) {
					return { row, col };
				}
			}
		}
		return null;
	}
}
