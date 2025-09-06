<!-- src/routes/leaderboard/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { leaderboardState, leaderboardService } from '$lib';

	let activeTab = 'freeplay';
	let loading = false;
	let error = null;

	$: leaderboard = $leaderboardState;
	$: freeplayEntries = formatFreeplayLeaderboard(leaderboard.freeplay);
	$: storyEntries = formatStoryLeaderboard(leaderboard.story);

	function formatFreeplayLeaderboard(data) {
		console.log('[Leaderboard] Formatting freeplay data:', data);

		// Handle array format directly since API returns array
		if (!Array.isArray(data)) {
			console.log('[Leaderboard] Data is not an array, returning empty');
			return [];
		}

		// Data is already an array from the API, just ensure proper formatting
		return data
			.filter((entry) => entry && entry.score !== null && entry.score !== undefined)
			.sort((a, b) => (b.score || 0) - (a.score || 0))
			.slice(0, 50)
			.map((entry, index) => ({
				...entry,
				rank: entry.rank || index + 1, // Use provided rank or calculate
				playerName: entry.playerName || 'Anonymous',
				score: entry.score || 0,
				puzzlesCompleted: entry.puzzlesCompleted || 0,
				accuracy: entry.accuracy || 0,
				difficulty: entry.difficulty || 'EASY',
				completedAt: entry.completedAt || entry.createdAt
			}));
	}

	function formatStoryLeaderboard(data) {
		console.log('[Leaderboard] Formatting story data:', data);

		// Handle array format directly
		if (!Array.isArray(data)) {
			console.log('[Leaderboard] Data is not an array, returning empty');
			return [];
		}

		return data
			.filter((entry) => entry && entry.levelsCompleted >= 5)
			.sort((a, b) => (a.averageTime || Infinity) - (b.averageTime || Infinity))
			.slice(0, 50)
			.map((entry, index) => ({
				...entry,
				rank: entry.rank || index + 1,
				playerName: entry.playerName || 'Anonymous',
				averageTime: entry.averageTime || 0,
				levelsCompleted: entry.levelsCompleted || 0,
				totalStars: entry.totalStars || 0,
				completionRate: entry.completionRate || 0,
				highestLevel: entry.highestLevel || 1
			}));
	}

	async function loadLeaderboard(type) {
		loading = true;
		error = null;
		try {
			const data = await leaderboardService.loadLeaderboard(type);
			console.log('Leaderboard data :', data);
		} catch (err) {
			error = `Failed to load ${type} leaderboard`;
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function switchTab(tab) {
		activeTab = tab;
		loadLeaderboard(tab);
	}

	function formatTime(seconds) {
		if (!seconds && seconds !== 0) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function formatDate(dateString) {
		if (!dateString) return 'N/A';
		try {
			return new Date(dateString).toLocaleDateString();
		} catch {
			return 'N/A';
		}
	}

	function getDifficultyColor(difficulty) {
		switch (difficulty) {
			case 'EASY':
				return 'bg-green-600';
			case 'MEDIUM':
				return 'bg-yellow-600';
			case 'HARD':
				return 'bg-red-600';
			default:
				return 'bg-gray-600';
		}
	}

	function getRankDisplay(rank) {
		switch (rank) {
			case 1:
				return { icon: '🥇', class: 'bg-yellow-500/20' };
			case 2:
				return { icon: '🥈', class: 'bg-gray-400/20' };
			case 3:
				return { icon: '🥉', class: 'bg-orange-600/20' };
			default:
				return { icon: `#${rank}`, class: '' };
		}
	}

	onMount(() => {
		loadLeaderboard('freeplay');
	});
</script>

<svelte:head>
	<title>Leaderboard - REFLEKTOR</title>
</svelte:head>

<div class="to-blue-900 min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 p-8">
	<div class="mx-auto" style="max-width: 1400px;">
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
				LEADERBOARD
			</h1>

			<div style="width: 180px;"></div>
		</div>

		<!-- Tab Buttons -->
		<div class="mb-8 flex justify-center gap-4">
			<button
				on:click={() => switchTab('freeplay')}
				class={`min-w-[200px] rounded-xl px-8 py-4 font-['Jersey_10'] text-2xl font-bold uppercase transition-all ${
					activeTab === 'freeplay'
						? 'bg-blue-600 text-white shadow-lg'
						: 'bg-white/10 text-white/70 backdrop-blur-sm hover:bg-white/20'
				}`}
			>
				🎲 FREEPLAY
			</button>

			<button
				on:click={() => switchTab('story')}
				class={`min-w-[200px] rounded-xl px-8 py-4 font-['Jersey_10'] text-2xl font-bold uppercase transition-all ${
					activeTab === 'story'
						? 'bg-green-600 text-white shadow-lg'
						: 'bg-white/10 text-white/70 backdrop-blur-sm hover:bg-white/20'
				}`}
			>
				📖 STORY MODE
			</button>
		</div>

		<!-- Leaderboard Content -->
		<div class="rounded-2xl border border-white/20 bg-black/40 p-8 backdrop-blur-md">
			{#if loading}
				<div class="py-20 text-center">
					<div class="animate-pulse text-3xl text-white">Loading leaderboard...</div>
				</div>
			{:else if error}
				<div class="py-20 text-center">
					<div class="mb-4 text-2xl text-red-400">{error}</div>
					<button
						on:click={() => loadLeaderboard(activeTab)}
						class="rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-500"
					>
						Retry
					</button>
				</div>
			{:else if activeTab === 'freeplay'}
				<!-- Freeplay Leaderboard -->
				{#if freeplayEntries.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full text-white">
							<thead>
								<tr class="border-b-2 border-white/30">
									<th class="p-4 text-left font-['Jersey_10'] text-xl uppercase">Rank</th>
									<th class="p-4 text-left font-['Jersey_10'] text-xl uppercase">Player</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Score</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Puzzles</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Accuracy</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Difficulty</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Date</th>
								</tr>
							</thead>
							<tbody>
								{#each freeplayEntries as entry}
									{@const rankInfo = getRankDisplay(entry.rank)}
									<tr
										class={`border-b border-white/10 transition-all hover:bg-white/5 ${rankInfo.class}`}
									>
										<td class="p-4">
											<span class="text-lg font-bold">{rankInfo.icon}</span>
										</td>
										<td class="p-4">
											<div class="flex flex-col">
												<span class="text-lg font-bold">{entry.playerName}</span>
												{#if entry.isRegistered}
													<span class="text-green-400 text-xs">✓ Registered</span>
												{/if}
											</div>
										</td>
										<td class="p-4 text-center">
											<span class="text-2xl font-bold text-yellow-400"
												>{entry.score.toLocaleString()}</span
											>
										</td>
										<td class="p-4 text-center text-lg">{entry.puzzlesCompleted}</td>
										<td class="p-4 text-center text-lg">{entry.accuracy}%</td>
										<td class="p-4 text-center">
											<span
												class={`inline-block rounded-lg px-3 py-1 text-sm font-bold text-white ${getDifficultyColor(entry.difficulty)}`}
											>
												{entry.difficulty}
											</span>
										</td>
										<td class="p-4 text-center text-sm text-gray-400"
											>{formatDate(entry.completedAt)}</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="py-20 text-center">
						<div class="mb-4 text-2xl text-gray-400">No scores yet. Be the first to play!</div>
						<button
							on:click={() => goto('/freeplay')}
							class="bg-blue-600 hover:bg-blue-500 rounded-lg px-6 py-3 text-white transition-colors"
						>
							Play Now
						</button>
					</div>
				{/if}
			{:else}
				<!-- Story Mode Leaderboard -->
				<div class="mb-6 rounded-lg bg-yellow-600/20 p-4">
					<p class="text-center text-yellow-200">
						⚠️ Only showing players who have completed 5 or more levels
					</p>
				</div>

				{#if storyEntries.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full text-white">
							<thead>
								<tr class="border-b-2 border-white/30">
									<th class="p-4 text-left font-['Jersey_10'] text-xl uppercase">Rank</th>
									<th class="p-4 text-left font-['Jersey_10'] text-xl uppercase">Player</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Avg Time</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Levels</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Stars</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Progress</th>
									<th class="p-4 text-center font-['Jersey_10'] text-xl uppercase">Highest</th>
								</tr>
							</thead>
							<tbody>
								{#each storyEntries as entry}
									{@const rankInfo = getRankDisplay(entry.rank)}
									<tr
										class={`border-b border-white/10 transition-all hover:bg-white/5 ${rankInfo.class}`}
									>
										<td class="p-4">
											<span class="text-lg font-bold">{rankInfo.icon}</span>
										</td>
										<td class="p-4">
											<div class="flex flex-col">
												<span class="text-lg font-bold">{entry.playerName}</span>
											</div>
										</td>
										<td class="p-4 text-center">
											<span class="text-green-400 text-2xl font-bold"
												>{formatTime(entry.averageTime)}</span
											>
										</td>
										<td class="p-4 text-center text-lg font-bold">{entry.levelsCompleted}/30</td>
										<td class="p-4 text-center">
											<span class="text-xl">⭐ {entry.totalStars}</span>
										</td>
										<td class="p-4">
											<div class="flex flex-col items-center gap-1">
												<div
													class="h-4 w-full max-w-[100px] overflow-hidden rounded-full bg-gray-700"
												>
													<div
														class="from-green-500 to-green-600 h-full bg-gradient-to-r transition-all"
														style="width: {entry.completionRate}%"
													></div>
												</div>
												<span class="text-xs">{entry.completionRate}%</span>
											</div>
										</td>
										<td class="p-4 text-center text-lg font-bold">LVL {entry.highestLevel}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="py-20 text-center">
						<div class="mb-4 text-2xl text-gray-400">
							No players have completed 5+ levels yet. Keep playing!
						</div>
						<button
							on:click={() => goto('/story')}
							class="bg-green-600 hover:bg-green-500 rounded-lg px-6 py-3 text-white transition-colors"
						>
							Play Story Mode
						</button>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Stats Summary -->
		{#if !loading && !error}
			<div class="mt-8 grid grid-cols-3 gap-4">
				<div class="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
					<div class="text-3xl font-bold text-white">
						{activeTab === 'freeplay' ? freeplayEntries.length : storyEntries.length}
					</div>
					<div class="font-['Jersey_10'] text-xl text-white/70">Total Entries</div>
				</div>

				<div class="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
					<div class="text-3xl font-bold text-white">
						{#if activeTab === 'freeplay'}
							{freeplayEntries[0]?.score.toLocaleString() || '0'}
						{:else}
							{formatTime(storyEntries[0]?.averageTime || 0)}
						{/if}
					</div>
					<div class="font-['Jersey_10'] text-xl text-white/70">
						{activeTab === 'freeplay' ? 'Top Score' : 'Best Avg Time'}
					</div>
				</div>

				<div class="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
					<div class="text-3xl font-bold text-white">
						{formatDate(leaderboard.lastUpdated)}
					</div>
					<div class="font-['Jersey_10'] text-xl text-white/70">Last Updated</div>
				</div>
			</div>
		{/if}
	</div>
</div>
