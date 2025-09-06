// src/routes/api/game/end/+server.js

import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';

export async function POST({ request }) {
	try {
		const { gameSessionId, reason } = await request.json();

		if (!gameSessionId) {
			return json(
				{
					success: false,
					error: 'Game session ID required'
				},
				{ status: 400 }
			);
		}

		// Get current session
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

		// Don't update if already ended
		if (gameSession.status === 'COMPLETED' || gameSession.status === 'TIME_UP') {
			return json({
				success: true,
				message: 'Session already ended',
				gameSession
			});
		}

		// Update session status
		const updatedSession = await prisma.gameSession.update({
			where: { id: gameSessionId },
			data: {
				status: reason || 'COMPLETED',
				endTime: new Date()
			}
		});

		// console.log(
		// 	`Session ${gameSessionId} ended with status: ${reason}, Score: ${updatedSession.score}`
		// );

		return json({
			success: true,
			gameSession: updatedSession
		});
	} catch (error) {
		console.error('End game error:', error);
		return json(
			{
				success: false,
				error: 'Failed to end game session'
			},
			{ status: 500 }
		);
	}
}
