import { json } from '@sveltejs/kit';
import { MapGenerator } from '$lib/server/mapGenerator.js';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const { difficulty = 'EASY', playerName = null } = await request.json();
		const mapData = MapGenerator.generate(difficulty);

		// find player position in main map
		const playerPos = MapGenerator.getPlayerPosition(mapData.mainMap);
		if (!playerPos) {
			return json({ error: 'Invalid map generated : No player located.' }, { status: 500 });
		}

		// find mirrored player position - only need to get the mirrored column
		const mirroredCol = mapData.mirroredMap[playerPos.row].indexOf(2);

		const gameSession = await prisma.gameSession.create({
			data: {
				playerName,
				mapData: mapData.mainMap,
				mirroredMapData: mapData.mirroredMap,
				currentPosition: {
					row: playerPos.row,
					col: playerPos.col,
					mirroredCol: mirroredCol
				},
				difficulty,
				status: 'PLAYING'
			}
		});

		return json({
			success: true,
			gameSession,
			mapData
		});
	} catch (error) {
		console.error('Game start error:', error);
		return json({ error: 'Failed to start game' }, { status: 500 });
	}
}
