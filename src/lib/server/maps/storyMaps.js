// src/lib/server/maps/storyMaps.js

// pre-built story mode puzzles - to achieve 30 levels at the end
// each level is a 9x9 grid with increasing difficulty
// 0 = empty space, 1 = obstacle, 2 = player start, 3 = goal

export const STORY_MAPS = [
	{
		level: 1,
		name: 'first steps',
		description: 'learn the basics of mirrored movement',
		mapData: [
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 1, 0, 1, 0, 0, 0],
			[2, 0, 0, 0, 0, 0, 0, 0, 3],
			[0, 0, 0, 1, 0, 1, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0]
		],
		targetSteps: 8, // ideal number of steps for 3 stars
		targetTime: 30 // ideal time in seconds for 3 stars
	},
	{
		level: 2,
		name: 'mirror dance',
		description: 'navigate around obstacles with movement only',
		mapData: [
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 0, 1, 0, 1, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[2, 0, 1, 0, 0, 0, 1, 0, 3],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 1, 0, 1, 0, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0]
		],
		targetSteps: 12,
		targetTime: 45
	},
	{
		level: 3,
		name: 'winding paths',
		description: 'find the route that works for both grids',
		mapData: [
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 1, 0, 0, 0, 1, 1, 0],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[2, 0, 1, 0, 0, 0, 1, 0, 3],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[0, 1, 1, 0, 0, 0, 1, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0]
		],
		targetSteps: 16,
		targetTime: 60
	},
	{
		level: 4,
		name: 'strategic thinking',
		description: 'plan your route carefully',
		mapData: [
			[1, 0, 0, 0, 3, 0, 0, 0, 1],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[1, 0, 0, 0, 2, 0, 0, 0, 1]
		],
		targetSteps: 18,
		targetTime: 75
	},
	{
		level: 5,
		name: 'precision challenge',
		description: 'master movement without helpers for best score',
		mapData: [
			[0, 0, 1, 0, 3, 0, 1, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 1, 0, 2, 0, 1, 0, 0]
		],
		targetSteps: 20,
		targetTime: 90
	},
	{
		level: 6,
		name: 'corner navigation',
		description: 'use corners to your advantage',
		mapData: [
			[3, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[1, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 1, 0, 0, 0, 1],
			[0, 0, 1, 0, 0, 0, 1, 0, 2]
		],
		targetSteps: 24,
		targetTime: 100
	},
	{
		level: 7,
		name: 'maze runner',
		description: 'find the path through the maze',
		mapData: [
			[0, 1, 0, 1, 3, 1, 0, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[1, 0, 1, 1, 0, 1, 1, 0, 1],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[1, 0, 1, 1, 0, 1, 1, 0, 1],
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 0, 1, 2, 1, 0, 1, 0]
		],
		targetSteps: 22,
		targetTime: 95
	},
	{
		level: 8,
		name: 'diagonal challenge',
		description: 'think diagonally but move orthogonally',
		mapData: [
			[0, 0, 0, 1, 3, 1, 0, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[0, 0, 0, 1, 0, 1, 0, 0, 0],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[0, 1, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 0, 0, 1, 2, 1, 0, 0, 0]
		],
		targetSteps: 26,
		targetTime: 110
	},
	{
		level: 9,
		name: 'spiral approach',
		description: 'sometimes the longest path is the safest',
		mapData: [
			[1, 1, 1, 1, 3, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 1, 1, 0, 1, 1, 0, 1],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[1, 0, 1, 1, 0, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 2, 1, 1, 1, 1]
		],
		targetSteps: 30,
		targetTime: 120
	},
	{
		level: 10,
		name: 'master of mirrors',
		description: 'prove your mirrored movement mastery',
		mapData: [
			[0, 1, 0, 0, 3, 0, 0, 1, 0],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 1, 0, 0, 1, 0, 0, 1, 0],
			[0, 0, 0, 1, 0, 1, 0, 0, 0],
			[0, 1, 0, 0, 1, 0, 0, 1, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[0, 1, 0, 0, 2, 0, 0, 1, 0]
		],
		targetSteps: 28,
		targetTime: 115
	}
	// add more levels later
];

// helper function to add random obstacle types to story maps
export function addObstacleTypes(mapData) {
	const obstacles = ['wall', 'tree', 'grass'];
	return mapData.map((row) =>
		row.map((cell) => {
			if (cell === 1) {
				// randomly assign obstacle type for visual variety
				return {
					type: 1,
					obstacle: obstacles[Math.floor(Math.random() * obstacles.length)]
				};
			}
			return cell;
		})
	);
}
