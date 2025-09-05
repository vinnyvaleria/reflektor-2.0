// src/lib/server/maps/storyMaps.js

// pre-built story mode puzzles 
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
	},
	{
		level: 11,
		name: 'helper introduction',
		description: 'learn to use your first helper tool',
		mapData: [
			[0, 0, 0, 0, 3, 0, 0, 0, 0],
			[0, 0, 1, 1, 1, 1, 1, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 0, 1, 0, 1, 0, 1, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 0, 1, 0, 1, 0, 1, 0, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 0, 1, 1, 1, 1, 1, 0, 0],
			[0, 0, 0, 0, 2, 0, 0, 0, 0]
		],
		targetSteps: 15, // requires using helper tool
		targetTime: 60
	},
	{
		level: 12,
		name: 'tool selection',
		description: 'choose the right helper for the job',
		mapData: [
			[0, 1, 0, 1, 3, 1, 0, 1, 0],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 1, 1, 1, 1, 1, 1, 1, 1], // wall of obstacles - need helpers
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[0, 1, 0, 1, 2, 1, 0, 1, 0]
		],
		targetSteps: 18,
		targetTime: 75
	},
	{
		level: 13,
		name: 'efficient clearing',
		description: 'use helpers strategically to save steps',
		mapData: [
			[1, 1, 1, 0, 3, 0, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 0, 2, 0, 1, 1, 1]
		],
		targetSteps: 25,
		targetTime: 90
	},
	{
		level: 14,
		name: 'mirrored obstacles',
		description: 'clear obstacles on both grids simultaneously',
		mapData: [
			[0, 0, 1, 0, 3, 0, 1, 0, 0],
			[0, 1, 1, 1, 0, 1, 1, 1, 0],
			[1, 1, 0, 0, 0, 0, 0, 1, 1],
			[0, 1, 0, 1, 1, 1, 0, 1, 0],
			[0, 0, 0, 1, 1, 1, 0, 0, 0],
			[0, 1, 0, 1, 1, 1, 0, 1, 0],
			[1, 1, 0, 0, 0, 0, 0, 1, 1],
			[0, 1, 1, 1, 0, 1, 1, 1, 0],
			[0, 0, 1, 0, 2, 0, 1, 0, 0]
		],
		targetSteps: 22,
		targetTime: 85
	},
	{
		level: 15,
		name: 'timing is key',
		description: 'speed and precision required',
		mapData: [
			[1, 0, 1, 0, 3, 0, 1, 0, 1],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[1, 1, 1, 0, 1, 0, 1, 1, 1],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 0, 1, 0, 2, 0, 1, 0, 1]
		],
		targetSteps: 20,
		targetTime: 70
	},
	{
		level: 16,
		name: 'checkpoint charlie',
		description: 'halfway through your mirror mastery',
		mapData: [
			[0, 1, 0, 1, 3, 1, 0, 1, 0],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 0, 0, 1, 0, 1, 0, 0, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[0, 1, 0, 1, 2, 1, 0, 1, 0]
		],
		targetSteps: 32,
		targetTime: 120
	},
	{
		level: 17,
		name: 'narrow passages',
		description: 'navigate through tight spaces',
		mapData: [
			[1, 1, 1, 0, 3, 0, 1, 1, 1],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 1, 0, 0, 0, 1, 0, 1],
			[1, 1, 1, 0, 2, 0, 1, 1, 1]
		],
		targetSteps: 28,
		targetTime: 105
	},
	{
		level: 18,
		name: 'double trouble',
		description: 'complex mirrored movements required',
		mapData: [
			[0, 1, 1, 1, 3, 1, 1, 1, 0],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[0, 1, 1, 1, 2, 1, 1, 1, 0]
		],
		targetSteps: 30,
		targetTime: 110
	},
	{
		level: 19,
		name: 'helper conservation',
		description: 'use your tools wisely - you will need them',
		mapData: [
			[1, 1, 1, 1, 3, 1, 1, 1, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 1, 1, 0, 1, 0, 1, 1, 1], // requires multiple helpers
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 1, 1, 1, 2, 1, 1, 1, 1]
		],
		targetSteps: 35,
		targetTime: 140
	},
	{
		level: 20,
		name: 'the gauntlet returns',
		description: 'enhanced version of an earlier challenge',
		mapData: [
			[1, 0, 1, 0, 3, 0, 1, 0, 1],
			[0, 1, 0, 1, 1, 1, 0, 1, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 1, 1, 0, 1, 0, 1, 1, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 1, 0, 1, 1, 1, 0, 1, 0],
			[1, 0, 1, 0, 2, 0, 1, 0, 1]
		],
		targetSteps: 34,
		targetTime: 130
	},
	{
		level: 21,
		name: 'advanced tactics',
		description: 'combine movement and helpers flawlessly',
		mapData: [
			[0, 1, 0, 0, 3, 0, 0, 1, 0],
			[1, 1, 1, 0, 1, 0, 1, 1, 1],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 1, 1, 1, 1, 1, 1, 1, 1],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 1, 1, 1, 1, 1, 1, 1, 1],
			[0, 0, 0, 0, 1, 0, 0, 0, 0],
			[1, 1, 1, 0, 1, 0, 1, 1, 1],
			[0, 1, 0, 0, 2, 0, 0, 1, 0]
		],
		targetSteps: 38,
		targetTime: 150
	},
	{
		level: 22,
		name: 'symmetrical chaos',
		description: 'perfect balance between both grids',
		mapData: [
			[1, 0, 1, 0, 3, 0, 1, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 0, 1, 0, 2, 0, 1, 0, 1]
		],
		targetSteps: 36,
		targetTime: 135
	},
	{
		level: 23,
		name: 'patience and planning',
		description: 'think several moves ahead',
		mapData: [
			[0, 0, 1, 1, 3, 1, 1, 0, 0],
			[0, 1, 0, 0, 1, 0, 0, 1, 0],
			[1, 0, 0, 1, 1, 1, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 1, 1, 1, 0, 0, 1],
			[0, 1, 0, 0, 1, 0, 0, 1, 0],
			[0, 0, 1, 1, 2, 1, 1, 0, 0]
		],
		targetSteps: 42,
		targetTime: 160
	},
	{
		level: 24,
		name: 'the long road',
		description: 'sometimes the journey matters more than speed',
		mapData: [
			[3, 1, 1, 1, 1, 1, 1, 1, 1],
			[0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0],
			[1, 1, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 2]
		],
		targetSteps: 45,
		targetTime: 180
	},
	{
		level: 25,
		name: 'master class',
		description: 'demonstrate your complete understanding',
		mapData: [
			[1, 0, 1, 0, 3, 0, 1, 0, 1],
			[0, 0, 0, 1, 1, 1, 0, 0, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 1, 1, 0, 1, 0, 1, 1, 1],
			[0, 1, 0, 1, 0, 1, 0, 1, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 0, 0, 1, 1, 1, 0, 0, 0],
			[1, 0, 1, 0, 2, 0, 1, 0, 1]
		],
		targetSteps: 40,
		targetTime: 155
	},
	{
		level: 26,
		name: 'approaching mastery',
		description: 'few can reach this level of skill',
		mapData: [
			[1, 1, 0, 1, 3, 1, 0, 1, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[0, 0, 1, 0, 1, 0, 1, 0, 0],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[1, 1, 1, 0, 1, 0, 1, 1, 1],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[0, 0, 1, 0, 1, 0, 1, 0, 0],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 1, 0, 1, 2, 1, 0, 1, 1]
		],
		targetSteps: 38,
		targetTime: 145
	},
	{
		level: 27,
		name: 'penultimate puzzle',
		description: 'almost at the summit of mirror mastery',
		mapData: [
			[0, 1, 1, 1, 3, 1, 1, 1, 0],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 1, 1, 1, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 1, 1, 1, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[0, 1, 1, 1, 2, 1, 1, 1, 0]
		],
		targetSteps: 44,
		targetTime: 170
	},
	{
		level: 28,
		name: 'the final approach',
		description: 'one step away from legendary status',
		mapData: [
			[1, 1, 1, 0, 3, 0, 1, 1, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[0, 1, 1, 0, 1, 0, 1, 1, 0],
			[0, 0, 1, 0, 0, 0, 1, 0, 0],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 1, 1, 0, 2, 0, 1, 1, 1]
		],
		targetSteps: 46,
		targetTime: 175
	},
	{
		level: 29,
		name: 'legendary challenge',
		description: 'prove you are truly a master of mirrors',
		mapData: [
			[1, 0, 1, 1, 3, 1, 1, 0, 1],
			[0, 0, 0, 1, 1, 1, 0, 0, 0],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 1, 0, 1, 0, 1, 0, 1, 1],
			[1, 1, 1, 0, 1, 0, 1, 1, 1],
			[1, 1, 0, 1, 0, 1, 0, 1, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[0, 0, 0, 1, 1, 1, 0, 0, 0],
			[1, 0, 1, 1, 2, 1, 1, 0, 1]
		],
		targetSteps: 48,
		targetTime: 180
	},
	{
		level: 30,
		name: 'mirror master supreme',
		description: 'the ultimate test - you have become legend',
		mapData: [
			[1, 1, 1, 1, 3, 1, 1, 1, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 1, 1, 0, 1, 0, 1, 1, 1],
			[1, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 1, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1],
			[1, 1, 1, 1, 2, 1, 1, 1, 1]
		],
		targetSteps: 50,
		targetTime: 200
	}
];
