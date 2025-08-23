export class MapGenerator {
	static generate(difficulty = 'EASY') {
		const sizes = { EASY: 5, MEDIUM: 7, HARD: 9 };
		const size = sizes[difficulty];

		const map = this.createRandomMap(size);

		return {
			mainMap: map,
			mirroredMap: map, // placeholder; real mirroring later
			metadata: {
				size,
				difficulty
			}
		};
	}

	static createEmptyMap(size) {
		return Array(size)
			.fill(0)
			.map(() => Array(size).fill(0));
	}

	static createRandomMap(size) {
		const map = this.createEmptyMap(size);

		// place player (bottom area - easier to see)
		const playerRow = Math.floor(size * 0.7) + Math.floor(Math.random() * Math.floor(size * 0.3));
		const playerCol = Math.floor(Math.random() * Math.floor(size * 0.4));
		map[playerRow][playerCol] = 2;

		// place goal (top-right area)
		const goalRow = Math.floor(Math.random() * Math.floor(size * 0.4));
		const goalCol = Math.floor(size * 0.6) + Math.floor(Math.random() * Math.floor(size * 0.4));
		map[goalRow][goalCol] = 3;

		// add obstacles (20-30% coverage for better playability)
		const totalCells = size * size;
		const obstacleCount = Math.floor(totalCells * (0.2 + Math.random() * 0.1));

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
		// fallback guaranteed solvable map
		const map = this.createEmptyMap(size);

		// player at bottom-left
		map[size - 1][0] = 2;

		// goal at top-right
		map[0][size - 1] = 3;

		// add some obstacles but keep a clear path
		for (let i = 1; i < size - 1; i++) {
			if (Math.random() > 0.6) {
				map[i][Math.floor(size / 2)] = 1;
			}
		}

		return map;
	}
}

// console.log(MapGenerator.createEmptyMap(3));
console.log(MapGenerator.generate('EASY'));
