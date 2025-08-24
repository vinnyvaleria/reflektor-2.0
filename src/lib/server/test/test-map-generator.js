// src/lib/server/test/test-map-generator.js

import { MapGenerator } from '../gameEngine/mapGenerator.js';

// helper function to display maps visually
function displayMap(map, title = '') {
	console.log(`\n${title}`);
	console.log('─'.repeat(map[0].length * 4 + 1));

	map.forEach((row) => {
		let rowDisplay = '│';
		row.forEach((cell) => {
			switch (cell) {
				case 0:
					rowDisplay += '   │';
					break; // empty
				case 1:
					rowDisplay += ' ▓ │';
					break; // obstacle
				case 2:
					rowDisplay += ' P │';
					break; // player
				case 3:
					rowDisplay += ' G │';
					break; // goal
				default:
					rowDisplay += ' ? │';
					break;
			}
		});
		console.log(rowDisplay);
		console.log('─'.repeat(map[0].length * 4 + 1));
	});
}

console.log('🎲 Testing Freeplay Generation with Visual Maps:');

// test multiple 5x5 maps to see variety
console.log('\n=== EASY Mode (5x5) - Multiple Examples ===');

const result = MapGenerator.generateFreeplay('EASY');

console.log(`Generation attempts: ${result.metadata.attempts}`);
console.log(`Main map obstacles: ${result.metadata.obstacles.main}`);
console.log(`Mirrored map obstacles: ${result.metadata.obstacles.mirrored}`);

// test path validation for both maps
const mainHasPath = MapGenerator.hasValidPath(result.mainMap);
const mirroredHasPath = MapGenerator.hasValidPath(result.mirroredMap);

console.log(`Main map valid path: ${mainHasPath ? '✅' : '❌'}`);
console.log(`Mirrored map valid path: ${mirroredHasPath ? '✅' : '❌'}`);

// display both maps side by side
displayMap(result.mainMap, '📍 MAIN MAP:');
displayMap(result.mirroredMap, '🪞 MIRRORED MAP:');

// show player positions
const mainPlayer = MapGenerator.getPlayerPosition(result.mainMap);
const mirroredPlayer = MapGenerator.getPlayerPosition(result.mirroredMap);

console.log(`Main player position: (${mainPlayer.row}, ${mainPlayer.col})`);
console.log(`Mirrored player position: (${mirroredPlayer.row}, ${mirroredPlayer.col})`);

console.log('\n' + '='.repeat(50));

// test edge cases
console.log('\n🧪 Testing Edge Cases:');

// test simple map fallback
console.log('\n--- Testing Simple Map Fallback ---');
const simpleMap = MapGenerator.createSimpleMap(5);
displayMap(simpleMap, '🛠️ SIMPLE FALLBACK MAP (5x5):');
console.log(`Simple map has valid path: ${MapGenerator.hasValidPath(simpleMap) ? '✅' : '❌'}`);

// test obstacle counting
console.log('\n--- Testing Obstacle Counting ---');
const testMap = [
	[0, 1, 0, 1, 0],
	[1, 0, 1, 0, 1],
	[0, 2, 0, 3, 0],
	[1, 0, 1, 0, 1],
	[0, 1, 0, 1, 0]
];
console.log(`Test map obstacle count: ${MapGenerator.countObstacles(testMap)} (expected: 10)`);

console.log('\n🎊 Map Generator Testing Complete!');
