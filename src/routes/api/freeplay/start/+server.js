// src/routes/api/freeplay/start/+server.js

import { json } from '@sveltejs/kit';
import { MapGenerator } from '$lib/server/gameEngine/mapGenerator.js';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		// timeLimit is in seconds (180 = 3 minutes) - can increase later on
		const { difficulty = 'EASY', timeLimit = 180, playerName = null } = await request.json();

		// create new freeplay session in database
		const gameSession = await prisma.gameSession.create({
			data: {
				playerName,
				gameMode: 'FREEPLAY',
				difficulty,
				timeLimit,
				status: 'PLAYING'
			}
		});

		// generate first random puzzle
		const mapData = MapGenerator.generateFreeplay(difficulty);
		const playerPos = MapGenerator.getPlayerPosition(mapData.mainMap);

		// find where player appears in mirrored map
		const mirroredCol = mapData.mirroredMap[playerPos.row].indexOf(2);

		// save current puzzle state to database
		const updatedSession = await prisma.gameSession.update({
			where: { id: gameSession.id },
			data: {
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
			gameSession: updatedSession,
			mapData
		});
	} catch (error) {
		console.error('Freeplay start error:', error);
		return json({ error: 'Failed to start freeplay session' }, { status: 500 });
	}
}
