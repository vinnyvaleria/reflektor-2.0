// src/routes/api/story/start/+server.js

import { json } from '@sveltejs/kit';
import { MapGenerator } from '$lib/server/gameEngine/mapGenerator.js';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const {
			level = 1,
			playerName = null,
			userId = null,
			resumeSession = false
		} = await request.json();

		// Level range check
		if (level < 1 || level > 30) {
			return json(
				{
					error: 'Level must be between 1 and 30'
				},
				{ status: 400 }
			);
		}

		let user = null;
		let highestUnlocked = 1;

		// get user data and check level progression
		if (userId) {
			user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					username: true,
					displayName: true,
					highestUnlocked: true,
					storyProgress: true
				}
			});

			if (!user) {
				return json({ error: 'Invalid user ID' }, { status: 400 });
			}

			highestUnlocked = user.highestUnlocked;

			// check if level is unlocked
			if (level > highestUnlocked) {
				return json(
					{
						error: `Level ${level} is locked. Complete level ${highestUnlocked} first.`,
						highestUnlocked
					},
					{ status: 403 }
				);
			}
		} else {
			// require playerName for guests
			if (!playerName) {
				return json(
					{
						error: 'Player name is required for guest players'
					},
					{ status: 400 }
				);
			}

			// guests can only access first 3 levels
			if (level > 3) {
				return json(
					{
						error: 'Create an account to access levels beyond 3',
						requiresAccount: true
					},
					{ status: 403 }
				);
			}
		}

		// try to resume existing session first
		let existingSession = null;
		if (resumeSession && (userId || playerName)) {
			const whereClause = userId
				? { userId, gameMode: 'STORY', storyLevel: level, status: 'PLAYING' }
				: { playerName, gameMode: 'STORY', storyLevel: level, status: 'PLAYING' };

			existingSession = await prisma.gameSession.findFirst({
				where: whereClause,
				orderBy: { startTime: 'desc' }
			});

			if (existingSession) {
				// return existing session for resumption
				return json({
					success: true,
					gameSession: existingSession,
					mapData: {
						mainMap: existingSession.currentPuzzle.mainMap,
						mirroredMap: existingSession.currentPuzzle.mirroredMap,
						metadata: existingSession.currentPuzzle.metadata
					},
					resumed: true,
					user: user
						? {
								id: user.id,
								displayName: user.displayName || user.username,
								highestUnlocked
							}
						: null
				});
			}
		}

		// close any other active story sessions for this user
		if (userId) {
			await prisma.gameSession.updateMany({
				where: {
					userId: userId,
					gameMode: 'STORY',
					status: 'PLAYING'
				},
				data: { status: 'ABANDONED' }
			});
		}

		// get the story map for this level
		const mapData = MapGenerator.getStoryMap(level);
		const playerPos = MapGenerator.getPlayerPosition(mapData.mainMap);
		const mirroredCol = mapData.mirroredMap[playerPos.row].indexOf(2);

		// create new story mode session
		const gameSession = await prisma.gameSession.create({
			data: {
				userId: userId,
				playerName: playerName || user?.displayName || user?.username,
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
			mapData,
			resumed: false,
			user: user
				? {
						id: user.id,
						displayName: user.displayName || user.username,
						highestUnlocked,
						storyProgress: user.storyProgress
					}
				: null
		});
	} catch (error) {
		console.error('Story start error:', error);

		// handle specific error types
		if (error.message.includes('not found')) {
			return json({ error: `Story level ${level} not found` }, { status: 404 });
		}

		return json(
			{
				error: 'Failed to start story session',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// GET endpoint for story progress and available levels
export async function GET({ url }) {
	try {
		const userId = url.searchParams.get('userId');

		if (!userId) {
			// return basic info for guests
			return json({
				success: true,
				guestMode: true,
				availableLevels: [1, 2, 3],
				totalLevels: 30,
				message: 'Create an account to access all levels'
			});
		}

		// get user's story progress
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				highestUnlocked: true,
				storyProgress: true,
				totalStoryLevelsCompleted: true
			}
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// get any active story session
		const activeSession = await prisma.gameSession.findFirst({
			where: {
				userId: userId,
				gameMode: 'STORY',
				status: 'PLAYING'
			},
			orderBy: { startTime: 'desc' }
		});

		return json({
			success: true,
			user: {
				id: user.id,
				highestUnlocked: user.highestUnlocked,
				completedLevels: user.totalStoryLevelsCompleted,
				storyProgress: user.storyProgress
			},
			availableLevels: Array.from({ length: user.highestUnlocked }, (_, i) => i + 1),
			totalLevels: 30,
			activeSession: activeSession
				? {
						id: activeSession.id,
						level: activeSession.storyLevel,
						startTime: activeSession.startTime
					}
				: null
		});
	} catch (error) {
		console.error('Get story progress error:', error);
		return json({ error: 'Failed to retrieve story progress' }, { status: 500 });
	}
}
