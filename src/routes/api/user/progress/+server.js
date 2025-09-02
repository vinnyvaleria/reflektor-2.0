// src/routes/api/user/progress/+server.js

import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';

// GET user progress and stats
export async function GET({ url }) {
	try {
		const userId = url.searchParams.get('userId');

		if (!userId) {
			return json({ error: 'User ID required' }, { status: 400 });
		}

		// get comprehensive user data
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				username: true,
				displayName: true,
				storyProgress: true,
				highestUnlocked: true,
				totalFreeplayWins: true,
				bestFreeplayScore: true,
				totalStoryLevelsCompleted: true,
				totalStoryTime: true,
				averageStoryCompletionTime: true,
				createdAt: true
			}
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// get recent game sessions
		const recentSessions = await prisma.gameSession.findMany({
			where: { userId: userId },
			orderBy: { startTime: 'desc' },
			take: 10,
			select: {
				id: true,
				gameMode: true,
				difficulty: true,
				status: true,
				score: true,
				puzzlesCompleted: true,
				storyLevel: true,
				starsEarned: true,
				startTime: true,
				endTime: true
			}
		});

		// calculate additional stats
		const progress = user.storyProgress || {};
		const completedLevels = Object.keys(progress).filter((level) => progress[level].completed);
		const totalStars = completedLevels.reduce(
			(sum, level) => sum + (progress[level].stars || 0),
			0
		);

		// calculate average completion time per level
		const avgTimePerLevel =
			user.totalStoryLevelsCompleted > 0
				? Math.round(user.totalStoryTime / user.totalStoryLevelsCompleted)
				: 0;

		return json({
			success: true,
			user: {
				...user,
				stats: {
					totalStars: totalStars,
					completedLevels: completedLevels.length,
					averageTimePerLevel: avgTimePerLevel,
					completionPercentage: Math.round((completedLevels.length / 30) * 100)
				}
			},
			recentSessions: recentSessions
		});
	} catch (error) {
		console.error('Get progress error:', error);
		return json(
			{
				error: 'Failed to get user progress',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// POST to update specific progress (manual updates)
export async function POST({ request }) {
	try {
		const {
			userId,
			level,
			completed = false,
			stars = 1,
			steps = 0,
			time = 0
		} = await request.json();

		if (!userId || !level) {
			return json({ error: 'User ID and level are required' }, { status: 400 });
		}

		// validate level range
		if (level < 1 || level > 30) {
			return json({ error: 'Level must be between 1 and 30' }, { status: 400 });
		}

		// get current user progress
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { storyProgress: true, highestUnlocked: true }
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		const currentProgress = user.storyProgress || {};
		const levelKey = level.toString();

		// update level progress
		currentProgress[levelKey] = {
			completed: completed,
			stars: stars,
			bestSteps: steps,
			bestTime: time,
			updatedAt: new Date().toISOString()
		};

		// update highest unlocked if applicable
		const newHighestUnlocked = completed
			? Math.max(user.highestUnlocked, Math.min(level + 1, 30))
			: user.highestUnlocked;

		// count total completed levels
		const totalCompleted = Object.keys(currentProgress).filter(
			(k) => currentProgress[k].completed
		).length;

		// update user record
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				storyProgress: currentProgress,
				highestUnlocked: newHighestUnlocked,
				totalStoryLevelsCompleted: totalCompleted,
				totalStoryTime: user.totalStoryTime + time
			},
			select: {
				id: true,
				storyProgress: true,
				highestUnlocked: true,
				totalStoryLevelsCompleted: true
			}
		});

		return json({
			success: true,
			message: `Level ${level} progress updated`,
			user: updatedUser
		});
	} catch (error) {
		console.error('Update progress error:', error);
		return json(
			{
				error: 'Failed to update progress',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// DELETE to reset story mode progress
export async function DELETE({ request }) {
	try {
		const { userId, confirmReset = false } = await request.json();

		if (!userId) {
			return json({ error: 'User ID required' }, { status: 400 });
		}

		if (!confirmReset) {
			return json(
				{
					error: 'Progress reset must be confirmed',
					message: 'Include "confirmReset": true to reset all story progress'
				},
				{ status: 400 }
			);
		}

		// reset user's story progress
		const resetUser = await prisma.user.update({
			where: { id: userId },
			data: {
				storyProgress: {}, // empty object = no progress
				highestUnlocked: 1, // back to level 1
				totalStoryLevelsCompleted: 0,
				totalStoryTime: 0,
				averageStoryCompletionTime: null
			},
			select: {
				id: true,
				username: true,
				storyProgress: true,
				highestUnlocked: true,
				totalStoryLevelsCompleted: true
			}
		});

		// delete/abandon active story sessions
		await prisma.gameSession.updateMany({
			where: {
				userId: userId,
				gameMode: 'STORY',
				status: 'PLAYING'
			},
			data: {
				status: 'ABANDONED'
			}
		});

		return json({
			success: true,
			message: 'Story mode progress has been reset',
			user: resetUser
		});
	} catch (error) {
		console.error('Reset progress error:', error);
		return json(
			{
				error: 'Failed to reset progress',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// PUT to sync progress from browser cache (for guests who later sign up)
export async function PUT({ request }) {
	try {
		const { userId, browserProgress = {} } = await request.json();

		if (!userId) {
			return json({ error: 'User ID required' }, { status: 400 });
		}

		// get current user progress
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				storyProgress: true,
				highestUnlocked: true,
				totalStoryLevelsCompleted: true
			}
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// merge browser progress with existing progress (keep best performance)
		const currentProgress = user.storyProgress || {};
		let hasUpdates = false;

		Object.keys(browserProgress).forEach((levelKey) => {
			const browserLevel = browserProgress[levelKey];
			const currentLevel = currentProgress[levelKey];

			// only update if browser progress is better or level doesn't exist
			if (
				!currentLevel ||
				browserLevel.stars > currentLevel.stars ||
				(browserLevel.stars === currentLevel.stars &&
					browserLevel.bestSteps < currentLevel.bestSteps)
			) {
				currentProgress[levelKey] = {
					...browserLevel,
					syncedAt: new Date().toISOString()
				};
				hasUpdates = true;
			}
		});

		if (!hasUpdates) {
			return json({
				success: true,
				message: 'No updates needed - existing progress is better',
				user: user
			});
		}

		// calculate new stats
		const completedLevels = Object.keys(currentProgress).filter(
			(k) => currentProgress[k].completed
		);
		const newHighestUnlocked = Math.max(
			user.highestUnlocked,
			Math.max(...completedLevels.map((k) => parseInt(k) + 1), 1)
		);

		// update user with merged progress
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				storyProgress: currentProgress,
				highestUnlocked: Math.min(newHighestUnlocked, 30),
				totalStoryLevelsCompleted: completedLevels.length
			},
			select: {
				id: true,
				storyProgress: true,
				highestUnlocked: true,
				totalStoryLevelsCompleted: true
			}
		});

		return json({
			success: true,
			message: `Synced progress for ${completedLevels.length} levels`,
			user: updatedUser,
			levelsUpdated: completedLevels.length
		});
	} catch (error) {
		console.error('Sync progress error:', error);
		return json(
			{
				error: 'Failed to sync progress',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}
