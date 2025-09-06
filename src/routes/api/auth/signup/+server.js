// src/routes/api/auth/signup/+server.js

import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
	try {
		const { username, password, email = null, displayName = null } = await request.json();

		// required fields
		if (!username || !password) {
			return json(
				{
					error: 'Username and password are required'
				},
				{ status: 400 }
			);
		}

		// username format (3-20 chars, alphanumeric + underscore)
		if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
			return json(
				{
					error: 'Username must be 3-20 characters (letters, numbers, underscore only)'
				},
				{ status: 400 }
			);
		}

		// password strength (minimum 6 characters)
		if (password.length < 6) {
			return json(
				{
					error: 'Password must be at least 6 characters'
				},
				{ status: 400 }
			);
		}

		// email format if provided
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return json(
				{
					error: 'Invalid email format'
				},
				{ status: 400 }
			);
		}

		// check if username or email already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ username: username }, ...(email ? [{ email: email }] : [])]
			}
		});

		if (existingUser) {
			if (existingUser.username === username) {
				return json(
					{
						error: 'Username already taken'
					},
					{ status: 409 }
				);
			}
			if (existingUser.email === email) {
				return json(
					{
						error: 'Email already registered'
					},
					{ status: 409 }
				);
			}
		}

		// hash password
		const passwordHash = await bcrypt.hash(password, 12);

		// create new user
		const newUser = await prisma.user.create({
			data: {
				username,
				email: email || `${username}@guest.local`, // default email for username-only accounts
				passwordHash,
				displayName: displayName || username,
				emailVerified: !email, // auto-verify if no email provided (username-only accounts)
				storyProgress: {},
				highestUnlocked: 1,
				totalFreeplayWins: 0,
				bestFreeplayScore: 0,
				totalStoryLevelsCompleted: 0,
				totalStoryTime: 0
			},
			select: {
				id: true,
				username: true,
				email: true,
				displayName: true,
				highestUnlocked: true,
				totalFreeplayWins: true,
				bestFreeplayScore: true,
				createdAt: true
			}
		});

		return json({
			success: true,
			message: 'Account created successfully!',
			user: newUser
		});
	} catch (error) {
		// console.error('Signup error:', error);

		// handle Prisma constraint errors
		if (error.code === 'P2002') {
			const field = error.meta?.target?.[0];
			return json(
				{
					error: `${field === 'username' ? 'Username' : 'Email'} already exists`
				},
				{ status: 409 }
			);
		}

		return json(
			{
				error: 'Failed to create account',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{ status: 500 }
		);
	}
}

// GET endpoint to check username availability
export async function GET({ url }) {
	try {
		const username = url.searchParams.get('username');

		if (!username) {
			return json({ error: 'Username parameter required' }, { status: 400 });
		}

		// check if username exists
		const existingUser = await prisma.user.findUnique({
			where: { username },
			select: { id: true }
		});

		return json({
			available: !existingUser,
			username: username
		});
	} catch (error) {
		// console.error('Username check error:', error);
		return json({ error: 'Failed to check username' }, { status: 500 });
	}
}
