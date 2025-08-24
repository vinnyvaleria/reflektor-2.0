// src/routes/api/story/start/+server.js

import { json } from '@sveltejs/kit';
import { MapGenerator } from '$lib/server/gameEngine/mapGenerator.js';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const { level = 1, playerName = null } = await request.json();

		// for now, allow access to any level (we'll add progression later with auth)

		// get the story map for this level
		const mapData = MapGenerator.getStoryMap(level);
		const playerPos = MapGenerator.getPlayerPosition(mapData.mainMap);
		const mirroredCol = mapData.mirroredMap[playerPos.row].indexOf(2);

		// create story mode session
		const gameSession = await prisma.gameSession.create({
			data: {
				playerName,
				gameMode: 'STORY',
				storyLevel: level,
				status: 'PLAYING',
				currentPuzzle: {
					mainMap: mapData.mainMap,
					mirroredMap: mapData.mirroredMap,
					metadata: mapData.metadata
				},
				currentPosition: {
					row: playerPos.row,
					col: playerPos.col,
					mirroredCol: mirroredCol
				}
			}
		});

		return json({
			success: true,
			gameSession,
			mapData
		});
	} catch (error) {
		console.error('Story start error:', error);
		return json({ error: 'Failed to start story session' }, { status: 500 });
	}
}
