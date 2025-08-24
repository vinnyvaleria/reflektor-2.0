// src/lib/server/test/test-story-maps.js

import { STORY_MAPS } from '../maps/storyMaps.js';

console.log('📊 Story Maps Test:');
console.log(`Total maps: ${STORY_MAPS.length}`);
console.log('--');

STORY_MAPS.forEach((map) => {
	console.log(`Level ${map.level}: ${map.name}`);
	console.log(`Grid size: ${map.mapData.length}x${map.mapData[0].length}`);
	console.log(`Target steps: ${map.targetSteps}, Target time: ${map.targetTime}s`);

	// verify player and goal positions
	let playerFound = false,
		goalFound = false;
	for (let row = 0; row < map.mapData.length; row++) {
		for (let col = 0; col < map.mapData[row].length; col++) {
			if (map.mapData[row][col] === 2) playerFound = true;
			if (map.mapData[row][col] === 3) goalFound = true;
		}
	}

	if (!playerFound) console.error(`❌ Level ${map.level}: No player position found!`);
	if (!goalFound) console.error(`❌ Level ${map.level}: No goal position found!`);
	if (playerFound && goalFound) console.log(`✅ Player and goal positions valid`);
	console.log('--');
});
