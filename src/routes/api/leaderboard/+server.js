// src/routes/api/leaderboard/+server.js

import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';

export async function GET({ url }) {
	try {
		const type = url.searchParams.get('type') || 'freeplay';
		const difficulty = url.searchParams.get('difficulty') || 'all';
		const limit = parseInt(url.searchParams.get('limit') || '50');

		let leaderboardData = [];

		if (type === 'freeplay') {
			// Get completed freeplay sessions
			const whereClause = {
				gameMode: 'FREEPLAY',
				status: { in: ['COMPLETED', 'TIME_UP'] },
				score: { not: null }
			};

			// Add difficulty filter if specified
			if (difficulty !== 'all') {
				whereClause.difficulty = difficulty;
			}

			// Get sessions with scores
			const sessions = await prisma.gameSession.findMany({
				where: whereClause,
				orderBy: { score: 'desc' },
				take: limit,
				include: {
					user: {
						select: {
							username: true,
							displayName: true
						}
					}
				}
			});

			// Transform sessions into leaderboard entries
			leaderboardData = sessions.map((session, index) => ({
				rank: index + 1,
				playerName:
					session.playerName || session.user?.displayName || session.user?.username || 'Anonymous',
				score: session.score || 0,
				puzzlesCompleted: session.puzzlesCompleted || 0,
				difficulty: session.difficulty,
				accuracy:
					session.totalSteps > 0
						? Math.round((session.puzzlesCompleted / session.totalSteps) * 100)
						: 0,
				completedAt: session.endTime || session.createdAt,
				isRegistered: !!session.userId
			}));

			// Get stats
			const stats = await prisma.gameSession.aggregate({
				where: whereClause,
				_count: true,
				_avg: {
					score: true
				}
			});

			return json({
				success: true,
				type: 'freeplay',
				difficulty: difficulty,
				leaderboard: leaderboardData,
				stats: {
					totalGames: stats._count || 0,
					averageScore: Math.round(stats._avg?.score || 0),
					totalPlayers: leaderboardData.length
				}
			});
		} else if (type === 'story') {
			// Get users with story progress
			const users = await prisma.user.findMany({
				where: {
					totalStoryLevelsCompleted: { gte: 5 } // Only show users who completed 5+ levels
				},
				select: {
					id: true,
					username: true,
					displayName: true,
					storyProgress: true,
					totalStoryLevelsCompleted: true,
					averageStoryCompletionTime: true,
					highestUnlocked: true
				}
			});

			// Also get guest story sessions (players without accounts)
			const guestSessions = await prisma.gameSession.findMany({
				where: {
					gameMode: 'STORY',
					status: 'COMPLETED',
					userId: null,
					playerName: { not: null }
				},
				select: {
					playerName: true,
					storyLevel: true,
					starsEarned: true,
					timeToComplete: true,
					totalSteps: true,
					endTime: true
				}
			});

			// Group guest sessions by playerName
			const guestProgress = {};
			guestSessions.forEach((session) => {
				if (!guestProgress[session.playerName]) {
					guestProgress[session.playerName] = {
						playerName: session.playerName,
						levelsCompleted: 0,
						totalStars: 0,
						totalTime: 0,
						highestLevel: 0
					};
				}

				const player = guestProgress[session.playerName];
				player.levelsCompleted++;
				player.totalStars += session.starsEarned || 0;
				player.totalTime += session.timeToComplete || 0;
				player.highestLevel = Math.max(player.highestLevel, session.storyLevel);
			});

			// Combine registered users and guests
			const allPlayers = [];

			// Add registered users
			users.forEach((user) => {
				const progress = user.storyProgress || {};
				const completedLevels = Object.keys(progress).filter((k) => progress[k].completed);
				const totalStars = completedLevels.reduce((sum, k) => sum + (progress[k].stars || 0), 0);

				if (completedLevels.length >= 5) {
					allPlayers.push({
						playerName: user.displayName || user.username,
						levelsCompleted: user.totalStoryLevelsCompleted || completedLevels.length,
						totalStars: totalStars,
						averageTime: user.averageStoryCompletionTime || 0,
						completionRate: Math.round((completedLevels.length / 30) * 100),
						highestLevel: user.highestUnlocked || 1,
						isRegistered: true
					});
				}
			});

			// Add guest players with 5+ completed levels
			Object.values(guestProgress).forEach((player) => {
				if (player.levelsCompleted >= 5) {
					allPlayers.push({
						playerName: player.playerName,
						levelsCompleted: player.levelsCompleted,
						totalStars: player.totalStars,
						averageTime:
							player.levelsCompleted > 0
								? Math.round(player.totalTime / player.levelsCompleted)
								: 0,
						completionRate: Math.round((player.levelsCompleted / 30) * 100),
						highestLevel: player.highestLevel,
						isRegistered: false
					});
				}
			});

			// Sort by average time (lower is better)
			allPlayers.sort((a, b) => a.averageTime - b.averageTime);

			// Add ranks
			leaderboardData = allPlayers.slice(0, limit).map((player, index) => ({
				rank: index + 1,
				...player
			}));

			return json({
				success: true,
				type: 'story',
				leaderboard: leaderboardData,
				stats: {
					totalPlayers: allPlayers.length,
					averageLevelsCompleted:
						allPlayers.length > 0
							? Math.round(
									allPlayers.reduce((sum, p) => sum + p.levelsCompleted, 0) / allPlayers.length
								)
							: 0,
					totalLevels: 30
				}
			});
		}

		return json(
			{
				success: false,
				error: 'Invalid leaderboard type'
			},
			{ status: 400 }
		);
	} catch (error) {
		// console.error('Leaderboard error:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch leaderboard',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// POST endpoint to submit/update scores
export async function POST({ request }) {
	try {
		const { gameSessionId } = await request.json();

		if (!gameSessionId) {
			return json(
				{
					success: false,
					error: 'Game session ID required'
				},
				{ status: 400 }
			);
		}

		// Get the game session
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

		// Only process completed sessions
		if (gameSession.status !== 'COMPLETED' && gameSession.status !== 'TIME_UP') {
			return json(
				{
					success: false,
					error: 'Game session not completed'
				},
				{ status: 400 }
			);
		}

		// The score is already saved in the gameSession
		// This endpoint just confirms the submission
		// console.log(`Score submitted for session ${gameSessionId}: ${gameSession.score}`);

		return json({
			success: true,
			message: 'Score submitted successfully',
			score: gameSession.score,
			rank: null // Could calculate rank here if needed
		});
	} catch (error) {
		// console.error('Score submission error:', error);
		return json(
			{
				success: false,
				error: 'Failed to submit score'
			},
			{ status: 500 }
		);
	}
}
