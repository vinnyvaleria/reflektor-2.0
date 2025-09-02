// src/routes/api/leaderboard/+server.js

import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';

/**
 * Global Leaderboard API
 * Two leaderboard types:
 * 1. Freeplay - ranked by highest score
 * 2. Story - ranked by average completion time per level
 */

export async function GET({ url }) {
	try {
		const type = url.searchParams.get('type') || 'freeplay'; // 'freeplay' or 'story'
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
		const difficulty = url.searchParams.get('difficulty'); // for freeplay filtering

		if (!['freeplay', 'story'].includes(type)) {
			return json(
				{ error: 'Invalid leaderboard type. Use "freeplay" or "story"' },
				{ status: 400 }
			);
		}

		if (type === 'freeplay') {
			// FREEPLAY LEADERBOARD: Ranked by highest score
			const whereClause = {
				gameMode: 'FREEPLAY',
				status: 'COMPLETED',
				score: { not: null },
				...(difficulty && { difficulty: difficulty })
			};

			// get top scores with user info
			const topScores = await prisma.gameSession.findMany({
				where: whereClause,
				orderBy: [
					{ score: 'desc' },
					{ puzzlesCompleted: 'desc' },
					{ totalSteps: 'asc' } // tie-breaker: fewer steps is better
				],
				take: limit,
				select: {
					id: true,
					score: true,
					puzzlesCompleted: true,
					totalSteps: true,
					roundsUsed: true,
					difficulty: true,
					endTime: true,
					playerName: true,
					user: {
						select: {
							id: true,
							username: true,
							displayName: true
						}
					}
				}
			});

			// calculate additional stats
			const totalGames = await prisma.gameSession.count({
				where: { gameMode: 'FREEPLAY', status: 'COMPLETED' }
			});

			const avgScore = await prisma.gameSession.aggregate({
				where: whereClause,
				_avg: { score: true }
			});

			// format leaderboard entries
			const leaderboard = topScores.map((session, index) => ({
				rank: index + 1,
				playerName:
					session.user?.displayName || session.user?.username || session.playerName || 'Anonymous',
				score: session.score,
				puzzlesCompleted: session.puzzlesCompleted,
				totalSteps: session.totalSteps,
				accuracy: (
					((session.puzzlesCompleted - session.roundsUsed) /
						Math.max(session.puzzlesCompleted, 1)) *
					100
				).toFixed(1),
				difficulty: session.difficulty,
				completedAt: session.endTime,
				isRegistered: !!session.user?.id
			}));

			return json({
				success: true,
				type: 'freeplay',
				difficulty: difficulty || 'all',
				leaderboard: leaderboard,
				stats: {
					totalGames: totalGames,
					averageScore: Math.round(avgScore._avg.score || 0),
					totalPlayers: leaderboard.length
				}
			});
		} else {
			// STORY LEADERBOARD: Ranked by average completion time per level
			const storyPlayers = await prisma.user.findMany({
				where: {
					totalStoryLevelsCompleted: { gt: 0 },
					totalStoryTime: { gt: 0 }
				},
				orderBy: [
					{ totalStoryLevelsCompleted: 'desc' } // more levels completed = higher rank
				],
				take: limit * 2, // get more to calculate averages
				select: {
					id: true,
					username: true,
					displayName: true,
					totalStoryLevelsCompleted: true,
					totalStoryTime: true,
					storyProgress: true,
					highestUnlocked: true
				}
			});

			// calculate average completion time and rank
			const leaderboard = storyPlayers
				.map((user) => {
					const avgTimePerLevel = user.totalStoryTime / Math.max(user.totalStoryLevelsCompleted, 1);
					const completionRate = ((user.totalStoryLevelsCompleted / 30) * 100).toFixed(1);

					// calculate total stars earned
					const progress = user.storyProgress || {};
					const totalStars = Object.values(progress)
						.filter((level) => level.completed)
						.reduce((sum, level) => sum + (level.stars || 0), 0);

					return {
						playerName: user.displayName || user.username,
						levelsCompleted: user.totalStoryLevelsCompleted,
						averageTime: Math.round(avgTimePerLevel),
						totalTime: user.totalStoryTime,
						completionRate: completionRate,
						totalStars: totalStars,
						highestLevel: user.highestUnlocked - 1, // -1 because highestUnlocked is next level
						// score for ranking: more levels completed + faster average time + more stars
						rankScore: user.totalStoryLevelsCompleted * 1000 + totalStars * 100 - avgTimePerLevel
					};
				})
				.sort((a, b) => b.rankScore - a.rankScore) // sort by rank score
				.slice(0, limit) // take only requested amount
				.map((entry, index) => ({
					rank: index + 1,
					...entry
				}));

			// calculate global story stats
			const totalStoryPlayers = await prisma.user.count({
				where: { totalStoryLevelsCompleted: { gt: 0 } }
			});

			const avgLevelsCompleted = await prisma.user.aggregate({
				where: { totalStoryLevelsCompleted: { gt: 0 } },
				_avg: { totalStoryLevelsCompleted: true }
			});

			return json({
				success: true,
				type: 'story',
				leaderboard: leaderboard,
				stats: {
					totalPlayers: totalStoryPlayers,
					averageLevelsCompleted: Math.round(
						avgLevelsCompleted._avg.totalStoryLevelsCompleted || 0
					),
					totalLevels: 30
				}
			});
		}
	} catch (error) {
		console.error('Leaderboard error:', error);
		return json(
			{
				error: 'Failed to fetch leaderboard',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// POST endpoint to submit score to leaderboard (called after game completion)
export async function POST({ request }) {
	try {
		const { gameSessionId, userId = null } = await request.json();

		if (!gameSessionId) {
			return json({ error: 'Game session ID required' }, { status: 400 });
		}

		// get completed game session
		const gameSession = await prisma.gameSession.findUnique({
			where: { id: gameSessionId },
			include: { user: true }
		});

		if (!gameSession || gameSession.status !== 'COMPLETED') {
			return json({ error: 'Game session not completed' }, { status: 400 });
		}

		// check if already submitted to leaderboard
		const existingEntry = await prisma.leaderboardEntry.findFirst({
			where: {
				userId: gameSession.userId,
				playerName: gameSession.playerName,
				gameMode: gameSession.gameMode,
				difficulty: gameSession.difficulty,
				score: gameSession.score
			}
		});

		if (existingEntry) {
			return json({
				success: true,
				message: 'Score already on leaderboard',
				entry: existingEntry
			});
		}

		// create leaderboard entry
		const timeTaken = gameSession.endTime
			? Math.floor((new Date(gameSession.endTime) - new Date(gameSession.startTime)) / 1000)
			: 0;

		const leaderboardEntry = await prisma.leaderboardEntry.create({
			data: {
				userId: gameSession.userId,
				playerName:
					gameSession.user?.displayName ||
					gameSession.user?.username ||
					gameSession.playerName ||
					'Anonymous',
				gameMode: gameSession.gameMode,
				difficulty: gameSession.difficulty,
				score: gameSession.score || 0,
				puzzlesCompleted: gameSession.puzzlesCompleted,
				storyLevel: gameSession.storyLevel,
				totalSteps: gameSession.totalSteps,
				roundsUsed: gameSession.roundsUsed,
				timeTaken: timeTaken
			}
		});

		// update user's best scores if applicable
		if (gameSession.userId && gameSession.gameMode === 'FREEPLAY') {
			await prisma.user.updateMany({
				where: {
					id: gameSession.userId,
					bestFreeplayScore: { lt: gameSession.score }
				},
				data: {
					bestFreeplayScore: gameSession.score,
					totalFreeplayWins: { increment: 1 }
				}
			});
		}

		return json({
			success: true,
			message: 'Score submitted to leaderboard!',
			entry: leaderboardEntry
		});
	} catch (error) {
		console.error('Leaderboard submission error:', error);
		return json(
			{
				error: 'Failed to submit score',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}
