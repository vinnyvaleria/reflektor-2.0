<script>
	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let success = false;
	let loading = false;

	async function handleSignUp() {
		if (!username || !email || !password || !confirmPassword) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, password })
			});

			const data = await response.json();

			if (response.ok) {
				success = true;
			} else {
				error = data.error || 'Registration failed';
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
		<h1 class="mb-8 text-center font-pixelify text-3xl font-bold text-white">Sign Up</h1>

		{#if success}
			<div class="mb-6 rounded bg-green-600 p-4 text-center text-white">
				<p>Account created successfully!</p>
				<a href="/auth/signin" class="underline">Click here to sign in</a>
			</div>
		{:else}
			<form on:submit|preventDefault={handleSignUp} class="space-y-6">
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
					<label class="mb-2 block font-jersey text-lg text-white">Email</label>
					<input
						type="email"
						bind:value={email}
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

				<div>
					<label class="mb-2 block font-jersey text-lg text-white">Confirm Password</label>
					<input
						type="password"
						bind:value={confirmPassword}
						class="w-full rounded border border-gray-600 bg-gray-700 p-3 text-white focus:border-game-primary"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-lg bg-game-primary px-6 py-3 font-bold text-white transition-colors hover:bg-game-secondary disabled:opacity-50"
				>
					{loading ? 'Creating Account...' : 'Sign Up'}
				</button>
			</form>
		{/if}

		<div class="mt-6 text-center">
			<a href="/auth/signin" class="text-game-primary hover:text-game-secondary">
				Already have an account? Sign in
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
