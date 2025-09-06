// src/routes/api/debug/leaderboard/+server.js
// Create this file to diagnose the leaderboard issue

import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';

export async function GET() {
	try {
		// 1. Get ALL freeplay sessions
		const allFreeplay = await prisma.gameSession.findMany({
			where: {
				gameMode: 'FREEPLAY'
			},
			select: {
				id: true,
				playerName: true,
				status: true,
				score: true,
				puzzlesCompleted: true,
				difficulty: true,
				createdAt: true,
				endTime: true
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: 20
		});

		// 2. Get sessions that SHOULD appear in leaderboard
		const leaderboardEligible = await prisma.gameSession.findMany({
			where: {
				gameMode: 'FREEPLAY',
				status: { in: ['COMPLETED', 'TIME_UP'] },
				score: { not: null }
			},
			select: {
				id: true,
				playerName: true,
				status: true,
				score: true
			}
		});

		// 3. Get sessions with scores but wrong status
		const hasScoreWrongStatus = await prisma.gameSession.findMany({
			where: {
				gameMode: 'FREEPLAY',
				score: { not: null },
				status: { notIn: ['COMPLETED', 'TIME_UP'] }
			},
			select: {
				id: true,
				playerName: true,
				status: true,
				score: true
			}
		});

		// 4. Count by status
		const statusBreakdown = await prisma.gameSession.groupBy({
			by: ['status'],
			where: {
				gameMode: 'FREEPLAY'
			},
			_count: true
		});

		// 5. Get highest scores regardless of status
		const topScores = await prisma.gameSession.findMany({
			where: {
				gameMode: 'FREEPLAY',
				score: { not: null }
			},
			orderBy: {
				score: 'desc'
			},
			take: 10,
			select: {
				id: true,
				playerName: true,
				status: true,
				score: true,
				puzzlesCompleted: true
			}
		});

		return json(
			{
				diagnostics: {
					totalFreeplaySessions: allFreeplay.length,
					eligibleForLeaderboard: leaderboardEligible.length,
					hasScoreButWrongStatus: hasScoreWrongStatus.length,
					statusBreakdown: statusBreakdown
				},
				allRecentSessions: allFreeplay,
				leaderboardEligible: leaderboardEligible,
				problemSessions: hasScoreWrongStatus,
				topScoresRegardlessOfStatus: topScores,
				analysis: {
					issue:
						hasScoreWrongStatus.length > 0
							? 'Sessions have scores but status is not COMPLETED/TIME_UP'
							: leaderboardEligible.length === 0
								? 'No sessions meet leaderboard criteria'
								: 'Sessions should be appearing in leaderboard'
				}
			},
			{ status: 200 }
		);
	} catch (error) {
		return json(
			{
				error: error.message,
				stack: error.stack
			},
			{ status: 500 }
		);
	}
}
