<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userState, storyProgress, gameService } from '$lib';
	import { STORY_MAPS } from '$lib/data/storyMaps.js';

	let selectedLevel = null;
	let hoveredLevel = null;

	$: currentUser = $userState;
	$: progress = $storyProgress;
	$: isGuest = !currentUser?.isLoggedIn;
	$: highestUnlocked = progress.highestUnlocked || 1;
	$: completedLevels = progress.completedLevels || {};

	function isLevelUnlocked(level) {
		if (isGuest) {
			return level <= 3;
		}
		return level <= highestUnlocked;
	}

	function getLevelStatus(level) {
		const levelData = completedLevels[level];
		if (!levelData || !levelData.completed) {
			return { completed: false, stars: 0, bestTime: null, bestSteps: null };
		}
		return levelData;
	}

	function getStarDisplay(stars) {
		return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
	}

	function formatTime(seconds) {
		if (!seconds) return '--:--';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	async function playLevel(level) {
		if (!isLevelUnlocked(level)) {
			if (isGuest && level > 3) {
				alert('Create an account to access levels beyond 3!');
				goto('/auth/signup');
			}
			return;
		}
		goto(`/story?level=${level}`);
	}

	function getLevelInfo(level) {
		return (
			STORY_MAPS.find((map) => map.level === level) || {
				name: `Level ${level}`,
				description: 'Challenge awaits!',
				targetSteps: null,
				targetTime: null
			}
		);
	}

	onMount(() => {
		// Load progress if logged in
		if (currentUser?.isLoggedIn && currentUser.user?.id) {
			import('$lib').then(({ progressService }) => {
				progressService.loadUserProgress(currentUser.user.id);
			});
		}
	});
</script>

<svelte:head>
	<title>Story Levels - REFLEKTOR</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-8">
	<div class="mx-auto" style="max-width: 1400px; min-width: 1200px;">
		<!-- Header -->
		<div class="mb-8 flex items-center justify-between">
			<button
				on:click={() => goto('/')}
				class="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
				style="font-family: 'Jersey 10', sans-serif; font-size: 20px;"
			>
				← BACK TO MENU
			</button>

			<h1
				class="text-6xl font-bold uppercase text-white drop-shadow-2xl"
				style="font-family: 'Pixelify Sans', sans-serif;"
			>
				STORY LEVELS
			</h1>

			<div style="width: 180px;"></div>
		</div>

		<!-- Progress Summary -->
		<div class="mb-8 rounded-2xl border border-white/20 bg-black/40 p-6 backdrop-blur-md">
			<div class="grid grid-cols-4 gap-8">
				<div class="text-center">
					<div class="text-3xl font-bold text-white">{Object.keys(completedLevels).length}/30</div>
					<div class="text-white/70" style="font-family: 'Jersey 10', sans-serif;">
						Levels Completed
					</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-yellow-400">⭐ {progress.totalStars || 0}</div>
					<div class="text-white/70" style="font-family: 'Jersey 10', sans-serif;">Total Stars</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-green-400">{progress.completionPercentage || 0}%</div>
					<div class="text-white/70" style="font-family: 'Jersey 10', sans-serif;">Completion</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-blue-400">LVL {highestUnlocked}</div>
					<div class="text-white/70" style="font-family: 'Jersey 10', sans-serif;">
						Highest Unlocked
					</div>
				</div>
			</div>
		</div>

		{#if isGuest}
			<div
				class="mb-8 rounded-xl border border-yellow-600/50 bg-yellow-900/30 p-4 text-center backdrop-blur-sm"
			>
				<p class="text-xl text-yellow-200" style="font-family: 'Jersey 10', sans-serif;">
					⚠️ Playing as Guest - Only first 3 levels available.
					<button
						on:click={() => goto('/auth/signup')}
						class="ml-2 text-yellow-300 underline hover:text-yellow-100"
					>
						Create an account
					</button>
					to unlock all 30 levels!
				</p>
			</div>
		{/if}

		<!-- Levels Grid -->
		<div class="grid grid-cols-6 gap-4">
			{#each Array(30) as _, i}
				{@const level = i + 1}
				{@const unlocked = isLevelUnlocked(level)}
				{@const status = getLevelStatus(level)}
				{@const info = getLevelInfo(level)}
				<button
					on:click={() => playLevel(level)}
					on:mouseenter={() => {
						hoveredLevel = level;
						selectedLevel = level;
					}}
					on:mouseleave={() => {
						hoveredLevel = null;
						selectedLevel = null;
					}}
					class="relative aspect-square rounded-xl border-2 p-4 transition-all"
					class:bg-gradient-to-br={unlocked}
					class:from-green-600={unlocked && status.completed}
					class:to-green-700={unlocked && status.completed}
					class:from-blue-600={unlocked && !status.completed}
					class:to-blue-700={unlocked && !status.completed}
					class:bg-gray-800={!unlocked}
					class:border-green-400={unlocked && status.completed}
					class:border-blue-400={unlocked && !status.completed}
					class:border-gray-600={!unlocked}
					class:hover:scale-110={unlocked}
					class:cursor-not-allowed={!unlocked}
					class:opacity-50={!unlocked}
				>
					{#if !unlocked}
						<div class="flex h-full flex-col items-center justify-center">
							<span class="text-4xl">🔒</span>
							<span class="mt-2 text-lg font-bold text-gray-400">{level}</span>
						</div>
					{:else}
						<div class="flex h-full flex-col items-center justify-center">
							<span class="text-3xl font-bold text-white">{level}</span>
							{#if status.completed}
								<div class="mt-1 text-sm">{getStarDisplay(status.stars)}</div>
								<div class="mt-1 text-xs text-white/80">{formatTime(status.bestTime)}</div>
							{:else if level <= 3 && isGuest}
								<div class="mt-1 text-xs text-yellow-300">FREE</div>
							{/if}
						</div>
					{/if}

					{#if status.completed}
						<div class="absolute -right-2 -top-2">
							<span class="text-2xl">✅</span>
						</div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Level Details Panel -->
		{#if selectedLevel && isLevelUnlocked(selectedLevel)}
			{@const info = getLevelInfo(selectedLevel)}
			{@const status = getLevelStatus(selectedLevel)}
			<div class="mt-8 rounded-2xl border border-white/20 bg-black/60 p-6 backdrop-blur-md">
				<div class="grid grid-cols-2 gap-8">
					<div>
						<h2 class="text-3xl font-bold text-white" style="font-family: 'Jersey 10', sans-serif;">
							LEVEL {selectedLevel}: {info.name.toUpperCase()}
						</h2>
						<p class="mt-2 text-lg text-white/80" style="font-family: 'Jersey 10', sans-serif;">
							{info.description}
						</p>
						<div class="mt-4 grid grid-cols-2 gap-4">
							<div class="rounded-lg bg-white/10 p-3">
								<div class="text-sm text-white/70">Target Steps</div>
								<div class="text-2xl font-bold text-blue-400">{info.targetSteps || 'N/A'}</div>
							</div>
							<div class="rounded-lg bg-white/10 p-3">
								<div class="text-sm text-white/70">Target Time</div>
								<div class="text-2xl font-bold text-green-400">{formatTime(info.targetTime)}</div>
							</div>
						</div>
					</div>

					<div>
						{#if status.completed}
							<h3
								class="text-2xl font-bold text-green-400"
								style="font-family: 'Jersey 10', sans-serif;"
							>
								YOUR BEST PERFORMANCE
							</h3>
							<div class="mt-4 space-y-3">
								<div class="flex justify-between rounded-lg bg-white/10 p-3">
									<span class="text-white/70">Stars Earned</span>
									<span class="text-xl">{getStarDisplay(status.stars)}</span>
								</div>
								<div class="flex justify-between rounded-lg bg-white/10 p-3">
									<span class="text-white/70">Best Time</span>
									<span class="text-xl font-bold text-white">{formatTime(status.bestTime)}</span>
								</div>
								<div class="flex justify-between rounded-lg bg-white/10 p-3">
									<span class="text-white/70">Best Steps</span>
									<span class="text-xl font-bold text-white">{status.bestSteps || 'N/A'}</span>
								</div>
							</div>
						{:else}
							<div class="flex h-full items-center justify-center">
								<button
									on:click={() => playLevel(selectedLevel)}
									class="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-12 py-6 text-3xl font-bold text-white transition-all hover:scale-105"
									style="font-family: 'Jersey 10', sans-serif;"
								>
									🎮 PLAY LEVEL {selectedLevel}
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
