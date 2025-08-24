// src/lib/server/gameEngine/mapGenerator.js

import { STORY_MAPS } from '../maps/storyMaps.js';

export class MapGenerator {
	// random map generator for freeplay mode
	static generateFreeplay(difficulty = 'EASY') {
		const sizes = { EASY: 5, MEDIUM: 7, HARD: 9 };
		const size = sizes[difficulty];

		const obstacleRanges = {
			EASY: [0.25, 0.35], // 25-35%
			MEDIUM: [0.3, 0.4], // 30-40%
			HARD: [0.35, 0.45] // 35-45%
		};
		const [min, max] = obstacleRanges[difficulty];

		let mainMap,
			mirroredMap,
			attempts = 0;

		// try to generate solvable maps with different obstacles
		// use BFS to make sure the map generated is solvable
		do {
			mainMap = this.createRandomMap(size, min, max);
			mirroredMap = this.createDifferentObstacleMap(mainMap);
			attempts++;
		} while ((!this.hasValidPath(mainMap) || !this.hasValidPath(mirroredMap)) && attempts < 20);

		// after 20 attempts of BFS and not solved, use simple map generator instead
		if (attempts >= 20) {
			mainMap = this.createSimpleMap(size);
			mirroredMap = this.createSimpleMirroredMap(size);
		}

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
				}
			}
		};
	}

	// get story mode map with different obstacles
	static getStoryMap(level) {
		const storyData = STORY_MAPS.find((m) => m.level === level);
		if (!storyData) throw new Error(`story level ${level} not found`);

		// create mirrored version with different obstacles
		const mirroredMap = this.createDifferentObstacleMap(storyData.mapData);

		return {
			mainMap: storyData.mapData,
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

	// create mirrored map with different obstacle pattern
	static createDifferentObstacleMap(originalMap) {
		const size = originalMap.length;
		// start with flipped version to maintain player/goal positions
		const mirroredMap = originalMap.map((row) => [...row].reverse());

		// remove existing obstacles but keep player (2) and goal (3)
		for (let row = 0; row < size; row++) {
			for (let col = 0; col < size; col++) {
				if (mirroredMap[row][col] === 1) {
					mirroredMap[row][col] = 0; // clear obstacles
				}
			}
		}

		// add new random obstacles (same density as original)
		const originalObstacleCount = this.countObstacles(originalMap);
		let placed = 0;

		while (placed < originalObstacleCount) {
			const row = Math.floor(Math.random() * size);
			const col = Math.floor(Math.random() * size);

			// only place obstacle on empty cells
			if (mirroredMap[row][col] === 0) {
				mirroredMap[row][col] = 1;
				placed++;
			}
		}

		return mirroredMap;
	}

	// create simple mirrored map with different obstacles (fallback)
	static createSimpleMirroredMap(size) {
		const map = Array(size)
			.fill(0)
			.map(() => Array(size).fill(0));

		// player at bottom-right (opposite of main map)
		map[size - 1][size - 1] = 2;

		// goal at top-left (opposite of main map)
		map[0][0] = 3;

		// add different obstacles pattern
		for (let i = 1; i < size - 1; i++) {
			if (Math.random() > 0.7) {
				const col = Math.floor(Math.random() * size);
				if (map[i][col] === 0) {
					map[i][col] = 1;
				}
			}
		}

		return map;
	}

	static createEmptyMap(size) {
		return Array(size)
			.fill(0)
			.map(() => Array(size).fill(0));
	}

	static createRandomMap(size, min, max) {
		const map = this.createEmptyMap(size);

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
				map[row][col] = 1;
				placed++;
			}
		}

		return map;
	}

	// in case random map is too hard - create solvable simple map
	static createSimpleMap(size) {
		const map = this.createEmptyMap(size);

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
					map[i][col] = 1;
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

		// BFS pathfinding to ensure solvable - FIFO
		const visited = Array(size)
			.fill(0)
			.map(() => Array(size).fill(false));
		const queue = [start];
		visited[start.row][start.col] = true;

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

				// to check if it is within grid,
				// not visited yet and not an obstacle (either content is 0 or 3)
				if (
					newRow >= 0 &&
					newRow < size &&
					newCol >= 0 &&
					newCol < size &&
					!visited[newRow][newCol] &&
					(map[newRow][newCol] === 0 || map[newRow][newCol] === 3)
				) {
					visited[newRow][newCol] = true;
					queue.push({ row: newRow, col: newCol });
				}
			}
		}

		return false;
	}

	static countObstacles(map) {
		return map.flat().filter((cell) => cell === 1).length;
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
}

// console.log(MapGenerator.createEmptyMap(3));
// console.log(MapGenerator.generate('EASY'));
// console.log(MapGenerator.generate('MEDIUM'));
