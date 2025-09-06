<script>
	import { goto } from '$app/navigation';
	import { userState, storyProgress, authService, leaderboardService } from '$lib';

	let showAuth = false;
	let authMode = 'signin'; // 'signin' or 'signup'
	let authLoading = false;
	let authError = '';

	// form data
	let username = '';
	let password = '';
	let email = '';
	let displayName = '';

	$: currentUser = $userState;
	$: currentProgress = $storyProgress;
	$: isGuest = !currentUser?.isLoggedIn;

	async function handleAuth() {
		if (!username || !password) {
			authError = 'Username and password are required';
			return;
		}

		authLoading = true;
		authError = '';

		try {
			if (authMode === 'signup') {
				await authService.signup(username, password, email || null, displayName || null);
			} else {
				await authService.signin(username, password);
			}

			// close auth modal on success
			showAuth = false;
			resetAuthForm();
		} catch (error) {
			authError = error.message;
		}

		authLoading = false;
	}

	function resetAuthForm() {
		username = '';
		password = '';
		email = '';
		displayName = '';
		authError = '';
	}

	function toggleAuthMode() {
		authMode = authMode === 'signin' ? 'signup' : 'signin';
		resetAuthForm();
	}

	async function handleSignOut() {
		await authService.signout();
	}

	function navigateToFreeplay() {
		goto('/freeplay');
	}

	function navigateToStory() {
		goto('/levels');
	}

	function navigateToLeaderboard() {
		goto('/leaderboard');
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4"
>
	<div class="mx-auto max-w-4xl text-center">
		<!-- Game Title -->
		<h1
			class="mb-4 text-8xl font-bold uppercase text-white drop-shadow-2xl"
			style="font-family: 'Pixelify Sans', sans-serif;"
		>
			reflektor
		</h1>

		<p
			class="mx-auto mb-12 max-w-2xl text-xl text-white/90"
			style="font-family: 'Jersey 10', sans-serif;"
		>
			Navigate two mirrored grids simultaneously in this challenging puzzle game
		</p>

		<!-- User Status -->
		{#if currentUser?.isLoggedIn}
			<div class="mb-8 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
				<p class="mb-2 text-white" style="font-family: 'Jersey 10', sans-serif;">
					Welcome back, <span class="font-bold"
						>{currentUser.user?.displayName || currentUser.user?.username}</span
					>!
				</p>
				<div class="text-secondary flex items-center justify-center gap-6 text-lg">
					<span
						>Story Progress: <span class="text-accent font-semibold"
							>{currentProgress?.completionPercentage || 0}%</span
						></span
					>
					<span
						>⭐ <span class="text-accent font-semibold">{currentProgress?.totalStars || 0}</span> Stars</span
					>
					<button
						on:click={handleSignOut}
						class="text-red-400 underline transition-colors hover:text-red-300"
					>
						Sign Out
					</button>
				</div>
			</div>
		{:else if currentUser !== null}
			<div
				class="mb-10 rounded-xl border border-yellow-800/50 bg-yellow-900/30 p-6 backdrop-blur-sm"
			>
				<p class="text-lg text-yellow-200" style="font-family: 'Jersey 10', sans-serif;">
					🎮 Playing as Guest - Progress won't be saved.
					<button
						on:click={() => {
							showAuth = true;
							authMode = 'signin';
						}}
						class="ml-2 text-yellow-300 underline transition-colors hover:text-yellow-100"
					>
						Sign In
					</button>
					or
					<button
						on:click={() => {
							showAuth = true;
							authMode = 'signup';
						}}
						class="ml-1 text-yellow-300 underline transition-colors hover:text-yellow-100"
					>
						Create Account
					</button>
				</p>
			</div>
		{/if}

		<!-- Main Menu Buttons -->
		<div class="mb-10 grid gap-8 md:grid-cols-2">
			<!-- Freeplay Mode -->
			<button
				on:click={navigateToFreeplay}
				class="group relative overflow-hidden rounded-2xl border border-blue-600/50 bg-gradient-to-r from-blue-700 to-cyan-700 p-10 shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-cyan-600"
			>
				<div class="relative z-10">
					<div class="mb-6 text-6xl">🎲</div>
					<h3
						class="text-primary mb-4 text-3xl font-bold"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						FREEPLAY MODE
					</h3>
					<p class="text-lg text-blue-100">
						Solve random puzzles within time limit<br />
						Compete for high scores on leaderboard
					</p>
				</div>
			</button>

			<!-- Story Mode -->
			<button
				on:click={navigateToStory}
				class="group relative overflow-hidden rounded-2xl border border-green-600/50 bg-gradient-to-r from-green-700 to-emerald-700 p-10 shadow-2xl transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-600"
			>
				<div class="relative z-10">
					<div class="mb-6 text-6xl">📖</div>
					<h3
						class="text-primary mb-4 text-3xl font-bold"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						STORY MODE
					</h3>
					<p class="text-lg text-green-100">
						Progress through 30 designed levels<br />
						{isGuest
							? 'First 3 levels available as guest'
							: `${(currentProgress?.highestUnlocked || 1) - 1} levels completed`}
					</p>
				</div>
			</button>
		</div>

		<!-- Secondary Actions -->
		<div class="flex flex-wrap justify-center gap-6">
			<button
				on:click={navigateToLeaderboard}
				class="text-primary rounded-xl border border-purple-600/50 bg-purple-700/80 px-8 py-4 text-xl font-bold backdrop-blur-sm transition-colors hover:bg-purple-600"
				style="font-family: 'Jersey 10', sans-serif;"
			>
				🏆 Leaderboard
			</button>

			<button
				on:click={() => goto('/rules')}
				class="text-primary rounded-xl border border-gray-600/50 bg-gray-700/80 px-8 py-4 text-xl font-bold backdrop-blur-sm transition-colors hover:bg-gray-600"
				style="font-family: 'Jersey 10', sans-serif;"
			>
				📋 How to Play
			</button>
		</div>
	</div>

	<!-- Auth Modal -->
	{#if showAuth}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
			<div class="w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-800 p-10 shadow-2xl">
				<h2
					class="text-primary mb-8 text-center text-3xl font-bold"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					{authMode === 'signin' ? 'Sign In' : 'Create Account'}
				</h2>

				<form on:submit|preventDefault={handleAuth} class="space-y-6">
					<input
						type="text"
						placeholder="Username"
						bind:value={username}
						class="text-primary placeholder-secondary w-full rounded-xl border border-gray-600 bg-gray-700 p-4 text-lg transition-colors focus:border-blue-500 focus:outline-none"
						required
					/>

					<input
						type="password"
						placeholder="Password"
						bind:value={password}
						class="text-primary placeholder-secondary w-full rounded-xl border border-gray-600 bg-gray-700 p-4 text-lg transition-colors focus:border-blue-500 focus:outline-none"
						required
					/>

					{#if authMode === 'signup'}
						<input
							type="email"
							placeholder="Email (optional)"
							bind:value={email}
							class="text-primary placeholder-secondary w-full rounded-xl border border-gray-600 bg-gray-700 p-4 text-lg transition-colors focus:border-blue-500 focus:outline-none"
						/>

						<input
							type="text"
							placeholder="Display Name (optional)"
							bind:value={displayName}
							class="text-primary placeholder-secondary w-full rounded-xl border border-gray-600 bg-gray-700 p-4 text-lg transition-colors focus:border-blue-500 focus:outline-none"
						/>
					{/if}

					{#if authError}
						<p class="text-lg text-red-400">{authError}</p>
					{/if}

					<div class="flex gap-4">
						<button
							type="submit"
							disabled={authLoading}
							class="text-primary flex-1 rounded-xl bg-blue-600 py-4 text-xl font-bold transition-colors hover:bg-blue-500 disabled:opacity-50"
						>
							{authLoading
								? 'Please wait...'
								: authMode === 'signin'
									? 'Sign In'
									: 'Create Account'}
						</button>

						<button
							type="button"
							on:click={() => (showAuth = false)}
							class="text-primary rounded-xl bg-gray-600 px-8 py-4 text-xl font-bold transition-colors hover:bg-gray-500"
						>
							Cancel
						</button>
					</div>
				</form>

				<div class="mt-8 text-center">
					<button
						on:click={toggleAuthMode}
						class="text-lg text-blue-400 underline transition-colors hover:text-blue-300"
					>
						{authMode === 'signin'
							? 'Need an account? Sign up'
							: 'Already have an account? Sign in'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
