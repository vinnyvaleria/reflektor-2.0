import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const { gameSessionId, direction } = await request.json();

		// get current game session
		const gameSession = await prisma.gameSession.findUnique({
			where: { id: gameSessionId }
		});

		if (!gameSession || gameSession.status !== 'PLAYING') {
			return json({ error: 'Invalid game session' }, { status: 400 });
		}

		const mapData = gameSession.mapData;
		const mirroredMapData = gameSession.mirroredMapData;
		const currentPos = gameSession.currentPosition;
		const size = mapData.length;

		// calculate new positions
		let newRow = currentPos.row;
		let newCol = currentPos.col;
		let newMirroredCol = currentPos.mirroredCol;

		switch (direction) {
			case 'up':
				newRow = currentPos.row - 1;
				break;
			case 'down':
				newRow = currentPos.row + 1;
				break;
			case 'left':
				newCol = currentPos.col - 1;
				newMirroredCol = currentPos.mirroredCol + 1;
				break;
			case 'right':
				newCol = currentPos.col + 1;
				newMirroredCol = currentPos.mirroredCol - 1;
				break;
			default:
				return json({ error: 'Invalid direction: ', direction }, { status: 400 });
		}

		// check boundaries
		if (
			newRow < 0 ||
			newRow >= size ||
			newCol < 0 ||
			newCol >= size ||
			newMirroredCol < 0 ||
			newMirroredCol >= size
		) {
			return json(
				{
					error: 'Cannot move outside the grid!',
					collision: true
				},
				{ status: 400 }
			);
		}

		// Check collisions with obstacles
		if (mapData[newRow][newCol] === 1 || mirroredMapData[newRow][newMirroredCol] === 1) {
			// Increment rounds used (collision)
			const updatedSession = await prisma.gameSession.update({
				where: { id: gameSessionId },
				data: {
					roundsUsed: gameSession.roundsUsed + 1,
					stepsCount: gameSession.stepsCount + 1
				}
			});

			return json(
				{
					error: 'Hit an obstacle!',
					collision: true,
					gameSession: updatedSession
				},
				{ status: 400 }
			);
		}

		// check if goal is reached
		const reachedGoal = mapData[newRow][newCol] === 3;

		// calculate time taken to win the game
		let timeTaken = null;
		let score = null;
		let status = gameSession.status;

		if (reachedGoal) {
			status = 'WON';
			timeTaken = Math.floor((new Date() - new Date(gameSession.startTime)) / 1000);
			// score calculation: base 10000, minus penalties
			score = Math.max(
				0,
				10000 - gameSession.roundsUsed * 200 - timeTaken * 2 - gameSession.stepsCount * 10
			);
		}

		// Update game session
		const updatedSession = await prisma.gameSession.update({
			where: { id: gameSessionId },
			data: {
				currentPosition: {
					row: newRow,
					col: newCol,
					mirroredCol: newMirroredCol
				},
				stepsCount: gameSession.stepsCount + 1,
				status,
				timeTaken,
				score,
				endTime: reachedGoal ? new Date() : null
			}
		});

		return json({
			success: true,
			gameSession: updatedSession,
			reachedGoal,
			newPosition: {
				row: newRow,
				col: newCol,
				mirroredCol: newMirroredCol
			}
		});
	} catch (error) {
		console.error('Move error:', error);
		return json({ error: 'Failed to process move' }, { status: 500 });
	}
}
