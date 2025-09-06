// src/routes/api/freeplay/start/+server.js

import { json } from '@sveltejs/kit';
import { MapGenerator } from '$lib/server/gameEngine/mapGenerator.js';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const {
			difficulty = 'EASY',
			timeLimit = 180,
			playerName = null,
			userId = null
		} = await request.json();

		// require playerName for guests (no userId)
		if (!userId && !playerName) {
			return json(
				{
					error: 'Player name is required for guest players'
				},
				{ status: 400 }
			);
		}

		// check difficulty is valid
		if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
			return json(
				{
					error: 'Invalid difficulty level'
				},
				{ status: 400 }
			);
		}

		// close any existing active sessions for this user/player
		if (userId) {
			await prisma.gameSession.updateMany({
				where: {
					userId: userId,
					gameMode: 'FREEPLAY',
					status: 'PLAYING'
				},
				data: { status: 'ABANDONED' }
			});
		}

		// validate user exists if userId provided
		let user = null;
		if (userId) {
			user = await prisma.user.findUnique({
				where: { id: userId },
				select: { id: true, username: true, displayName: true }
			});

			if (!user) {
				return json(
					{
						error: 'Invalid user ID'
					},
					{ status: 400 }
				);
			}
		}

		// create new freeplay session in database
		const gameSession = await prisma.gameSession.create({
			data: {
				userId: userId,
				playerName: playerName || user?.displayName || user?.username,
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
			mapData,
			// include user info for frontend display
			user: user
				? {
						id: user.id,
						displayName: user.displayName || user.username
					}
				: null
		});
	} catch (error) {
		console.error('Freeplay start error:', error);

		// better error responses based on error type
		if (error.code === 'P2002') {
			return json({ error: 'Database constraint error' }, { status: 409 });
		}

		return json(
			{
				error: 'Failed to start freeplay session',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// GET endpoint to retrieve active session
export async function GET({ url }) {
	try {
		const userId = url.searchParams.get('userId');
		const sessionId = url.searchParams.get('sessionId');

		if (!userId && !sessionId) {
			return json({ error: 'userId or sessionId required' }, { status: 400 });
		}

		let gameSession;
		if (sessionId) {
			// get specific session
			gameSession = await prisma.gameSession.findUnique({
				where: { id: sessionId }
			});
		} else {
			// get user's active freeplay session
			gameSession = await prisma.gameSession.findFirst({
				where: {
					userId: userId,
					gameMode: 'FREEPLAY',
					status: 'PLAYING'
				},
				orderBy: { startTime: 'desc' }
			});
		}

		if (!gameSession) {
			return json({ error: 'No active session found' }, { status: 404 });
		}

		return json({
			success: true,
			gameSession,
			// calculate remaining time for freeplay
			timeRemaining: gameSession.timeLimit
				? Math.max(
						0,
						gameSession.timeLimit -
							Math.floor((new Date() - new Date(gameSession.startTime)) / 1000)
					)
				: null
		});
	} catch (error) {
		console.error('Get freeplay session error:', error);
		return json({ error: 'Failed to retrieve session' }, { status: 500 });
	}
}
