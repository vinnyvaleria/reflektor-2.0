export class MapGenerator {
	static generate(difficulty = 'EASY') {
		const sizes = { EASY: 5, MEDIUM: 7, HARD: 9 };
		const size = sizes[difficulty];

		const map = this.createEmptyMap(size);

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
}
