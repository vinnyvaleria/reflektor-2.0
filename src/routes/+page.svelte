<script>
	import { goto } from '$app/navigation';
	import { userState, storyProgress } from '$lib/stores/gameStore.js';
	import { authService, leaderboardService } from '$lib/services/gameService.js';

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
	$: isGuest = !currentUser.isLoggedIn;

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
		goto('/story');
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
			class="mb-4 text-8xl font-bold text-white drop-shadow-2xl"
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
		{#if currentUser.isLoggedIn}
			<div class="mb-8 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
				<p class="mb-2 text-white" style="font-family: 'Jersey 10', sans-serif;">
					Welcome back, <span class="font-bold"
						>{currentUser.user.displayName || currentUser.user.username}</span
					>!
				</p>
				<div class="flex items-center justify-center gap-4 text-sm text-white/80">
					<span>Story Progress: {currentProgress.completionPercentage}%</span>
					<span>⭐ {currentProgress.totalStars} Stars</span>
					<button on:click={handleSignOut} class="text-red-300 underline hover:text-red-200">
						Sign Out
					</button>
				</div>
			</div>
		{:else}
			<div class="mb-8 rounded-lg bg-yellow-500/20 p-4 backdrop-blur-sm">
				<p class="text-sm text-yellow-100" style="font-family: 'Jersey 10', sans-serif;">
					🎮 Playing as Guest - Progress won't be saved.
					<button
						on:click={() => {
							showAuth = true;
							authMode = 'signin';
						}}
						class="text-yellow-200 underline hover:text-white"
					>
						Sign In
					</button>
					or
					<button
						on:click={() => {
							showAuth = true;
							authMode = 'signup';
						}}
						class="text-yellow-200 underline hover:text-white"
					>
						Create Account
					</button>
				</p>
			</div>
		{/if}

		<!-- Main Menu Buttons -->
		<div class="mb-8 grid gap-6 md:grid-cols-2">
			<!-- Freeplay Mode -->
			<button
				on:click={navigateToFreeplay}
				class="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-cyan-700"
			>
				<div class="relative z-10">
					<div class="mb-4 text-4xl">🎲</div>
					<h3
						class="mb-2 text-2xl font-bold text-white"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						FREEPLAY MODE
					</h3>
					<p class="text-sm text-blue-100">
						Solve random puzzles within time limit<br />
						Compete for high scores on leaderboard
					</p>
				</div>
			</button>

			<!-- Story Mode -->
			<button
				on:click={navigateToStory}
				class="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:from-green-700 hover:to-emerald-700"
			>
				<div class="relative z-10">
					<div class="mb-4 text-4xl">📖</div>
					<h3
						class="mb-2 text-2xl font-bold text-white"
						style="font-family: 'Jersey 10', sans-serif;"
					>
						STORY MODE
					</h3>
					<p class="text-sm text-green-100">
						Progress through 30 designed levels<br />
						{isGuest
							? 'First 3 levels available as guest'
							: `${currentProgress.highestUnlocked - 1} levels completed`}
					</p>
				</div>
			</button>
		</div>

		<!-- Secondary Actions -->
		<div class="flex flex-wrap justify-center gap-4">
			<button
				on:click={navigateToLeaderboard}
				class="rounded-lg bg-purple-600/80 px-6 py-3 font-bold text-white backdrop-blur-sm transition-colors hover:bg-purple-600"
				style="font-family: 'Jersey 10', sans-serif;"
			>
				🏆 Leaderboard
			</button>

			<button
				on:click={() => goto('/rules')}
				class="rounded-lg bg-gray-600/80 px-6 py-3 font-bold text-white backdrop-blur-sm transition-colors hover:bg-gray-600"
				style="font-family: 'Jersey 10', sans-serif;"
			>
				📋 How to Play
			</button>
		</div>
	</div>

	<!-- Auth Modal -->
	{#if showAuth}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div class="w-full max-w-md rounded-xl bg-gray-800 p-8">
				<h2
					class="mb-6 text-center text-2xl font-bold text-white"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					{authMode === 'signin' ? 'Sign In' : 'Create Account'}
				</h2>

				<form on:submit|preventDefault={handleAuth} class="space-y-4">
					<input
						type="text"
						placeholder="Username"
						bind:value={username}
						class="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:border-blue-500"
						required
					/>

					<input
						type="password"
						placeholder="Password"
						bind:value={password}
						class="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:border-blue-500"
						required
					/>

					{#if authMode === 'signup'}
						<input
							type="email"
							placeholder="Email (optional)"
							bind:value={email}
							class="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:border-blue-500"
						/>

						<input
							type="text"
							placeholder="Display Name (optional)"
							bind:value={displayName}
							class="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:border-blue-500"
						/>
					{/if}

					{#if authError}
						<p class="text-sm text-red-400">{authError}</p>
					{/if}

					<div class="flex gap-4">
						<button
							type="submit"
							disabled={authLoading}
							class="flex-1 rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
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
							class="rounded-lg bg-gray-600 px-6 py-3 font-bold text-white hover:bg-gray-700"
						>
							Cancel
						</button>
					</div>
				</form>

				<div class="mt-6 text-center">
					<button
						on:click={toggleAuthMode}
						class="text-sm text-blue-400 underline hover:text-blue-300"
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
