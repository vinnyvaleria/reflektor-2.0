// src/routes/api/auth/signin/+server.js

import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reflektor-dev-secret-change-in-production';
const TOKEN_EXPIRES_IN = '7d'; // 7 days

export async function POST({ request }) {
	try {
		const { username, password, rememberMe = false } = await request.json();

		// required fields
		if (!username || !password) {
			return json(
				{
					error: 'Username and password are required'
				},
				{ status: 400 }
			);
		}

		// find user by username or email
		const user = await prisma.user.findFirst({
			where: {
				OR: [
					{ username: username },
					{ email: username } // allow login with email
				]
			},
			select: {
				id: true,
				username: true,
				email: true,
				displayName: true,
				passwordHash: true,
				highestUnlocked: true,
				totalFreeplayWins: true,
				bestFreeplayScore: true,
				totalStoryLevelsCompleted: true,
				storyProgress: true,
				createdAt: true,
				emailVerified: true
			}
		});

		if (!user) {
			return json(
				{
					error: 'Invalid username or password'
				},
				{ status: 401 }
			);
		}

		// verify password
		const isValidPassword = await bcrypt.compare(password, user.passwordHash);

		if (!isValidPassword) {
			return json(
				{
					error: 'Invalid username or password'
				},
				{ status: 401 }
			);
		}

		// create JWT token
		const tokenPayload = {
			userId: user.id,
			username: user.username
		};

		const token = jwt.sign(tokenPayload, JWT_SECRET, {
			expiresIn: rememberMe ? '30d' : TOKEN_EXPIRES_IN
		});

		// update last login (optional tracking)
		await prisma.user.update({
			where: { id: user.id },
			data: { updatedAt: new Date() }
		});

		// remove password hash from response
		const { passwordHash, ...safeUser } = user;

		return json({
			success: true,
			message: 'Signed in successfully!',
			user: safeUser,
			token: token,
			expiresIn: rememberMe ? '30d' : TOKEN_EXPIRES_IN
		});
	} catch (error) {
		console.error('Signin error:', error);
		return json(
			{
				error: 'Failed to sign in',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// POST endpoint for token verification
export async function PUT({ request }) {
	try {
		const { token } = await request.json();

		if (!token) {
			return json({ error: 'Token required' }, { status: 400 });
		}

		// verify token
		const decoded = jwt.verify(token, JWT_SECRET);

		// get fresh user data
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: {
				id: true,
				username: true,
				email: true,
				displayName: true,
				highestUnlocked: true,
				totalFreeplayWins: true,
				bestFreeplayScore: true,
				totalStoryLevelsCompleted: true,
				storyProgress: true,
				emailVerified: true
			}
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({
			success: true,
			user: user,
			valid: true
		});
	} catch (error) {
		if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
			return json({ error: 'Invalid or expired token' }, { status: 401 });
		}

		console.error('Token verification error:', error);
		return json({ error: 'Failed to verify token' }, { status: 500 });
	}
}
