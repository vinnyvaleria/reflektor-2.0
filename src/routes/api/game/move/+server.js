// src/routes/api/game/move/+server.js

import { json } from '@sveltejs/kit';
import { MapGenerator } from '$lib/server/gameEngine/mapGenerator.js';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const { gameSessionId, direction } = await request.json();

		// Validate input
		if (!gameSessionId || !direction) {
			return json(
				{
					success: false,
					error: 'Game session ID and direction are required'
				},
				{ status: 400 }
			);
		}

		// Get current game session from database
		const gameSession = await prisma.gameSession.findUnique({
			where: { id: gameSessionId }
		});

		if (!gameSession) {
			return json(
				{
					success: false,
					error: 'Game session not found'
				},
				{ status: 404 }
			);
		}

		// Check if game is already completed
		if (gameSession.status !== 'PLAYING') {
			return json(
				{
					success: false,
					error: 'Game is not active',
					data: {
						gameSession: gameSession,
						mapData: gameSession.currentPuzzle?.mainMap,
						mirroredMapData: gameSession.currentPuzzle?.mirroredMap,
						currentPosition: gameSession.currentPosition
					}
				},
				{ status: 400 }
			);
		}

		// Extract current puzzle and position data
		const currentPuzzle = gameSession.currentPuzzle;
		const mapData = currentPuzzle.mainMap;
		const mirroredMapData = currentPuzzle.mirroredMap;
		const size = mapData.length;
		const currentPos = gameSession.currentPosition;

		// Calculate new positions based on direction
		let newRow = currentPos.row;
		let newCol = currentPos.col;
		let newMirroredCol = currentPos.mirroredCol;

		switch (direction) {
			case 'up':
				newRow--;
				break;
			case 'down':
				newRow++;
				break;
			case 'left':
				newCol--;
				newMirroredCol++; // Mirror moves opposite
				break;
			case 'right':
				newCol++;
				newMirroredCol--; // Mirror moves opposite
				break;
			default:
				return json(
					{
						success: false,
						error: 'Invalid direction'
					},
					{ status: 400 }
				);
		}

		// Check boundaries
		if (
			newRow < 0 ||
			newRow >= size ||
			newCol < 0 ||
			newCol >= size ||
			newMirroredCol < 0 ||
			newMirroredCol >= size
		) {
			// Hit boundary - increment rounds but don't move
			const updatedSession = await prisma.gameSession.update({
				where: { id: gameSessionId },
				data: {
					roundsUsed: gameSession.roundsUsed + 1,
					totalSteps: gameSession.totalSteps + 1
				}
			});

			return json({
				success: false,
				error: 'Cannot move outside the grid!',
				collision: true,
				data: {
					gameSession: updatedSession,
					newPosition: currentPos, // Stay in same position
					mapData: mapData,
					mirroredMapData: mirroredMapData
				}
			});
		}

		// Check for obstacles (value 1 or obstacle objects)
		const mainCell = mapData[newRow][newCol];
		const mirrorCell = mirroredMapData[newRow][newMirroredCol];

		const isMainObstacle = mainCell === 1 || (typeof mainCell === 'object' && mainCell?.type === 1);
		const isMirrorObstacle =
			mirrorCell === 1 || (typeof mirrorCell === 'object' && mirrorCell?.type === 1);

		if (isMainObstacle || isMirrorObstacle) {
			// Hit an obstacle - increment rounds used but don't move
			const updatedSession = await prisma.gameSession.update({
				where: { id: gameSessionId },
				data: {
					roundsUsed: gameSession.roundsUsed + 1,
					totalSteps: gameSession.totalSteps + 1
				}
			});

			return json({
				success: false,
				error: 'Obstacle hit!',
				collision: true,
				data: {
					gameSession: updatedSession,
					newPosition: currentPos, // Stay in same position
					mapData: mapData,
					mirroredMapData: mirroredMapData
				}
			});
		}

		// Valid move - update position and increment steps
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

		// Check if goal reached (both grids have player on goal)
		const mainGoalReached = mapData[newRow][newCol] === 3;
		const mirrorGoalReached = mirroredMapData[newRow][newMirroredCol] === 3;
		const bothGoalsReached = mainGoalReached && mirrorGoalReached;

		let responseData = {
			success: true,
			data: {
				gameSession: updatedSession,
				newPosition: {
					row: newRow,
					col: newCol,
					mirroredCol: newMirroredCol
				},
				mapData: mapData,
				mirroredMapData: mirroredMapData,
				goalReached: bothGoalsReached
			}
		};

		// Handle goal reached
		if (bothGoalsReached) {
			// console.log(`Goal reached for session ${gameSessionId}! Mode: ${gameSession.gameMode}`);

			if (gameSession.gameMode === 'FREEPLAY') {
				// Generate next puzzle for freeplay
				const newPuzzle = MapGenerator.generateFreeplay(gameSession.difficulty);
				const newPlayerPos = MapGenerator.getPlayerPosition(newPuzzle.mainMap);
				const newMirroredCol = newPuzzle.mirroredMap[newPlayerPos.row].indexOf(2);

				// Calculate score
				const baseScore = 100;
				const difficultyMultiplier =
					{
						EASY: 1,
						MEDIUM: 1.5,
						HARD: 2
					}[gameSession.difficulty] || 1;
				const puzzleScore = Math.floor(baseScore * difficultyMultiplier);
				const newScore = (gameSession.score || 0) + puzzleScore;

				// Update session with new puzzle
				const nextPuzzleSession = await prisma.gameSession.update({
					where: { id: gameSessionId },
					data: {
						puzzlesCompleted: gameSession.puzzlesCompleted + 1,
						score: newScore,
						currentPuzzle: {
							mainMap: newPuzzle.mainMap,
							mirroredMap: newPuzzle.mirroredMap,
							metadata: newPuzzle.metadata
						},
						currentPosition: {
							row: newPlayerPos.row,
							col: newPlayerPos.col,
							mirroredCol: newMirroredCol
						},
						helperUsage: [] // Reset helpers for new puzzle
					}
				});

				responseData.data.nextPuzzle = true;
				responseData.data.gameSession = nextPuzzleSession;
				responseData.data.newPosition = {
					row: newPlayerPos.row,
					col: newPlayerPos.col,
					mirroredCol: newMirroredCol
				};
				responseData.data.mapData = newPuzzle.mainMap;
				responseData.data.mirroredMapData = newPuzzle.mirroredMap;
			} else if (gameSession.gameMode === 'STORY') {
				// Complete story level
				const endTime = new Date();
				const timeTaken = Math.floor((endTime - new Date(gameSession.startTime)) / 1000);

				// Calculate stars based on targets
				const metadata = currentPuzzle.metadata || {};
				let stars = 1; // Always get 1 star for completing

				if (metadata.targetSteps && metadata.targetTime) {
					const beatSteps = gameSession.totalSteps <= metadata.targetSteps;
					const beatTime = timeTaken <= metadata.targetTime;

					if (beatSteps && beatTime) {
						stars = 3;
					} else if (beatSteps || beatTime) {
						stars = 2;
					}
				}

				// Update session as completed - CRITICAL: Set status to COMPLETED
				const completedSession = await prisma.gameSession.update({
					where: { id: gameSessionId },
					data: {
						status: 'COMPLETED', // IMPORTANT: Must set this
						endTime: endTime,
						starsEarned: stars,
						timeToComplete: timeTaken
					}
				});

				// Update user progress if logged in
				if (gameSession.userId) {
					const user = await prisma.user.findUnique({
						where: { id: gameSession.userId }
					});

					if (user) {
						const progress = user.storyProgress || {};
						const levelKey = gameSession.storyLevel.toString();

						// Update if better or first completion
						if (!progress[levelKey] || progress[levelKey].stars < stars) {
							progress[levelKey] = {
								completed: true,
								stars: stars,
								bestSteps: gameSession.totalSteps,
								bestTime: timeTaken,
								completedAt: new Date().toISOString()
							};

							// Update user record
							await prisma.user.update({
								where: { id: gameSession.userId },
								data: {
									storyProgress: progress,
									highestUnlocked: Math.max(
										user.highestUnlocked,
										Math.min(gameSession.storyLevel + 1, 30)
									),
									totalStoryLevelsCompleted: Object.keys(progress).filter(
										(k) => progress[k].completed
									).length
								}
							});
						}
					}
				}

				// Set response data for story completion
				responseData.data.storyCompleted = true;
				responseData.data.gameSession = completedSession; // This now has status: 'COMPLETED'
				responseData.data.stats = {
					level: gameSession.storyLevel,
					stars: stars,
					steps: gameSession.totalSteps,
					timeTaken: timeTaken,
					targetSteps: metadata.targetSteps,
					targetTime: metadata.targetTime
				};

				// console.log(
					`Story level ${gameSession.storyLevel} completed! Stars: ${stars}, Steps: ${gameSession.totalSteps}, Time: ${timeTaken}s`
				);
			}
		}

		return json(responseData);
	} catch (error) {
		// console.error('Move error:', error);
		return json(
			{
				success: false,
				error: 'Failed to process move',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}
