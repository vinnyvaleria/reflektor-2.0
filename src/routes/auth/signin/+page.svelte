<script>
	import { signIn } from '@auth/sveltekit/client';

	let username = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleSignIn() {
		if (!username || !password) {
			error = 'Please fill in all fields';
			return;
		}

		loading = true;
		error = '';

		try {
			const result = await signIn('credentials', {
				username,
				password,
				redirect: false
			});

			if (result?.error) {
				error = 'Invalid username or password';
			} else {
				window.location.href = '/';
			}
		} catch (e) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4"
>
	<div class="w-full max-w-md rounded-lg border-2 border-game-blue bg-gray-800 p-8 shadow-xl">
		<h1 class="mb-8 text-center font-pixelify text-3xl font-bold text-white">Sign In</h1>

		<form on:submit|preventDefault={handleSignIn} class="space-y-6">
			{#if error}
				<div class="rounded bg-red-600 p-3 text-white">{error}</div>
			{/if}

			<div>
				<label class="mb-2 block font-jersey text-lg text-white">Username</label>
				<input
					type="text"
					bind:value={username}
					class="w-full rounded border border-gray-600 bg-gray-700 p-3 text-white focus:border-game-primary"
					required
				/>
			</div>

			<div>
				<label class="mb-2 block font-jersey text-lg text-white">Password</label>
				<input
					type="password"
					bind:value={password}
					class="w-full rounded border border-gray-600 bg-gray-700 p-3 text-white focus:border-game-primary"
					required
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-game-primary px-6 py-3 font-bold text-white transition-colors hover:bg-game-secondary disabled:opacity-50"
			>
				{loading ? 'Signing In...' : 'Sign In'}
			</button>
		</form>

		<div class="mt-6 text-center">
			<a href="/auth/signup" class="text-game-primary hover:text-game-secondary">
				Don't have an account? Sign up
			</a>
			<br />
			<a href="/" class="text-gray-400 hover:text-white"> Continue as guest </a>
		</div>
	</div>
</div>

<style>
	.font-pixelify {
		font-family: 'Pixelify Sans', sans-serif;
	}
	.font-jersey {
		font-family: 'Jersey 10', sans-serif;
	}
</style>
