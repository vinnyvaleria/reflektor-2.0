// src/routes/api/game/move/+server.js

import { json } from '@sveltejs/kit';
import { MapGenerator } from '$lib/server/gameEngine/mapGenerator.js';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const { gameSessionId, direction } = await request.json();

		// get current game session from database
		const gameSession = await prisma.gameSession.findUnique({
			where: { id: gameSessionId }
		});

		if (!gameSession || gameSession.status !== 'PLAYING') {
			return json({ error: 'Invalid game session' }, { status: 400 });
		}

		// extract current puzzle and position data
		const currentPuzzle = gameSession.currentPuzzle;
		const currentPos = gameSession.currentPosition;
		const mapData = currentPuzzle.mainMap;
		const mirroredMapData = currentPuzzle.mirroredMap;
		const size = mapData.length;

		// calculate new positions based on movement direction
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
				// player moves left, mirrored player moves right
				newCol = currentPos.col - 1;
				newMirroredCol = currentPos.mirroredCol + 1;
				break;
			case 'right':
				// player moves right, mirrored player moves left
				newCol = currentPos.col + 1;
				newMirroredCol = currentPos.mirroredCol - 1;
				break;
			default:
				return json({ error: 'Invalid direction' }, { status: 400 });
		}

		// check if movement goes outside grid boundaries
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

		// check for collisions with obstacles on either grid
		if (mapData[newRow][newCol] === 1 || mirroredMapData[newRow][newMirroredCol] === 1) {
			// collision detected - increment rounds used
			const updatedSession = await prisma.gameSession.update({
				where: { id: gameSessionId },
				data: {
					roundsUsed: gameSession.roundsUsed + 1,
					totalSteps: gameSession.totalSteps + 1
				}
			});

			return json(
				{
					error: 'Obstacle has been hit!',
					collision: true,
					gameSession: updatedSession
				},
				{ status: 400 }
			);
		}

		// check if player reached the goal
		const reachedGoal = mapData[newRow][newCol] === 3;

		if (reachedGoal) {
			// handle puzzle completion based on game mode
			if (gameSession.gameMode === 'FREEPLAY') {
				// freeplay: generate next puzzle immediately
				const nextPuzzle = MapGenerator.generateFreeplay(gameSession.difficulty);
				const nextPlayerPos = MapGenerator.getPlayerPosition(nextPuzzle.mainMap);
				const nextMirroredCol = nextPuzzle.mirroredMap[nextPlayerPos.row].indexOf(2);

				const updatedSession = await prisma.gameSession.update({
					where: { id: gameSessionId },
					data: {
						puzzlesCompleted: gameSession.puzzlesCompleted + 1,
						totalSteps: gameSession.totalSteps + 1,
						currentPuzzle: {
							mainMap: nextPuzzle.mainMap,
							mirroredMap: nextPuzzle.mirroredMap,
							metadata: nextPuzzle.metadata
						},
						currentPosition: {
							row: nextPlayerPos.row,
							col: nextPlayerPos.col,
							mirroredCol: nextMirroredCol
						}
					}
				});

				return json({
					success: true,
					puzzleCompleted: true,
					nextPuzzle: true,
					gameSession: updatedSession,
					mapData: nextPuzzle
				});
			} else {
				// story mode: level completed
				const timeTaken = Math.floor((new Date() - new Date(gameSession.startTime)) / 1000);
				const steps = gameSession.totalSteps + 1;

				// calculate score based on steps and time vs target
				const targetSteps = currentPuzzle.metadata.targetSteps;
				const targetTime = currentPuzzle.metadata.targetTime;
				let stars = 0;
				if (steps <= targetSteps && timeTaken <= targetTime) stars = 3;
				else if (steps <= targetSteps * 1.2 && timeTaken <= targetTime * 1.2) stars = 2;
				else stars = 1;

				const updatedSession = await prisma.gameSession.update({
					where: { id: gameSessionId },
					data: {
						status: 'COMPLETED',
						totalSteps: steps,
						endTime: new Date(),
						score: stars * 1000 
					}
				});

				return json({
					success: true,
					storyCompleted: true,
					gameSession: updatedSession,
					stats: {
						steps,
						timeTaken,
						level: currentPuzzle.metadata.level,
						stars,
						targetSteps,
						targetTime
					}
				});
			}
		}

		// regular move - just update position
		const updatedSession = await prisma.gameSession.update({
			where: { id: gameSessionId },
			data: {
				currentPosition: {
					row: newRow,
					col: newCol,
					mirroredCol: newMirroredCol
				},
				totalSteps: gameSession.totalSteps + 1
			}
		});

		return json({
			success: true,
			gameSession: updatedSession,
			newPosition: {
				row: newRow,
				col: newCol,
				mirroredCol: newMirroredCol
			}
		});
	} catch (error) {
		console.error('Move error:', error);
		return json({ error: 'failed to process move' }, { status: 500 });
	}
}
