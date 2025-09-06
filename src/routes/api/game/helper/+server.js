// src/routes/api/game/helper/+server.js

import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const { gameSessionId, helperType, targetRow, targetCol, gridType } = await request.json();

		// validate input
		if (
			!gameSessionId ||
			!helperType ||
			typeof targetRow !== 'number' ||
			typeof targetCol !== 'number'
		) {
			return json({ error: 'Invalid request parameters' }, { status: 400 });
		}

		// get current game session
		const gameSession = await prisma.gameSession.findUnique({
			where: { id: gameSessionId }
		});

		if (!gameSession || gameSession.status !== 'PLAYING') {
			return json({ error: 'Invalid or inactive game session' }, { status: 400 });
		}

		// extract current puzzle data
		const currentPuzzle = gameSession.currentPuzzle;
		const helperUsage = Array.isArray(gameSession.helperUsage) ? gameSession.helperUsage : [];

		// check if helper has already been used for this puzzle
		const helperUsageCount = helperUsage.filter((usage) => usage.type === helperType).length;
		if (helperUsageCount >= 1) {
			return json({ error: `${helperType} has already been used in this puzzle` }, { status: 400 });
		}

		// get the appropriate map based on gridType
		const targetMap = gridType === 'main' ? currentPuzzle.mainMap : currentPuzzle.mirroredMap;
		const mapSize = targetMap.length;

		// validate target position
		if (targetRow < 0 || targetRow >= mapSize || targetCol < 0 || targetCol >= mapSize) {
			return json({ error: 'Target position out of bounds' }, { status: 400 });
		}

		// get the obstacle cell
		const obstacleCell = targetMap[targetRow][targetCol];

		// check if target cell is an obstacle (using same logic as helperService.js)
		let obstacleType = null;
		let isObstacle = false;

		if (typeof obstacleCell === 'object' && obstacleCell.type === 1) {
			// this is an obstacle object with type and obstacle properties
			obstacleType = obstacleCell.obstacle;
			isObstacle = true;
		} else if (obstacleCell === 1) {
			return json(
				{
					error: 'Cannot determine obstacle type. Please regenerate the map.'
				},
				{ status: 400 }
			);
		} else {
			// not an obstacle (empty space, player, goal, etc.)
			return json({ error: 'Target is not an obstacle.' }, { status: 400 });
		}

		// define helper-obstacle compatibility (matches your 3 obstacle types)
		const HELPER_OBSTACLE_MAP = {
			hammer: ['wall'],
			axe: ['tree'],
			sickle: ['grass']
		};

		// validate helper can target this obstacle type
		if (!HELPER_OBSTACLE_MAP[helperType].includes(obstacleType)) {
			const helperName = helperType.charAt(0).toUpperCase() + helperType.slice(1);
			const validTarget = HELPER_OBSTACLE_MAP[helperType][0]; // only 1 target per helper
			return json(
				{
					error: `${helperName} cannot destroy ${obstacleType}. ${helperName} can only destroy ${validTarget}.`
				},
				{ status: 400 }
			);
		}

		// create updated maps
		const updatedMainMap = JSON.parse(JSON.stringify(currentPuzzle.mainMap));
		const updatedMirroredMap = JSON.parse(JSON.stringify(currentPuzzle.mirroredMap));

		// remove obstacle from target map
		if (gridType === 'main') {
			updatedMainMap[targetRow][targetCol] = 0; // Convert obstacle to empty space
		} else {
			updatedMirroredMap[targetRow][targetCol] = 0;
		}

		// record helper usage
		const newHelperUsage = [
			...helperUsage,
			{
				type: helperType,
				targetRow,
				targetCol,
				gridType,
				obstacleType, // Store the obstacle type that was removed
				timestamp: new Date().toISOString()
			}
		];

		// update game session in database
		const updatedSession = await prisma.gameSession.update({
			where: { id: gameSessionId },
			data: {
				currentPuzzle: {
					mainMap: updatedMainMap,
					mirroredMap: updatedMirroredMap,
					metadata: currentPuzzle.metadata
				},
				helperUsage: newHelperUsage
			}
		});

		return json({
			success: true,
			gameSession: updatedSession,
			helperUsed: helperType,
			obstacleRemoved: {
				row: targetRow,
				col: targetCol,
				gridType,
				obstacleType
			},
			updatedMaps: {
				mainMap: updatedMainMap,
				mirroredMap: updatedMirroredMap
			}
		});
	} catch (error) {
		// console.error('Helper API error:', error);
		return json(
			{
				error: 'Internal server error during helper usage'
			},
			{ status: 500 }
		);
	}
}
