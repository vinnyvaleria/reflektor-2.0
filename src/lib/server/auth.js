// src/lib/server/auth.js
import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '$lib';
import bcrypt from 'bcryptjs';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		// custom credentials provider for username/password
		{
			id: 'credentials',
			name: 'credentials',
			type: 'credentials',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: { username: credentials.username }
				});

				if (!user) {
					return null;
				}

				// compare with stored hash password
				const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);

				if (!isValidPassword) {
					return null;
				}

				return {
					id: user.id,
					username: user.username,
					email: user.email,
					name: user.displayName || user.username
				};
			}
		}
	],
	pages: {
		signIn: '/auth/signin',
		signUp: '/auth/signup'
	},
	callbacks: {
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.username = token.username;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.username = user.username;
			}
			return token;
		}
	}
});
