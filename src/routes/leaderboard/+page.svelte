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
		if (!data || typeof data !== 'object') return [];
		return Object.values(data)
			.sort((a, b) => b.score - a.score)
			.slice(0, 50)
			.map((entry, index) => ({ ...entry, rank: index + 1 }));
	}

	function formatStoryLeaderboard(data) {
		if (!data || typeof data !== 'object') return [];
		return Object.values(data)
			.filter((entry) => entry.levelsCompleted >= 5)
			.sort((a, b) => a.averageTime - b.averageTime)
			.slice(0, 50)
			.map((entry, index) => ({ ...entry, rank: index + 1 }));
	}

	async function loadLeaderboard(type) {
		loading = true;
		error = null;
		try {
			await leaderboardService.loadLeaderboard(type);
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
		if (!seconds) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function formatDate(dateString) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString();
	}

	onMount(() => {
		loadLeaderboard('freeplay');
	});
</script>

<svelte:head>
	<title>Leaderboard - REFLEKTOR</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
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
						? 'bg-blue-600 text-white'
						: 'bg-white/10 text-white/70 backdrop-blur-sm'
				}`}
			>
				🎲 FREEPLAY
			</button>

			<button
				on:click={() => switchTab('story')}
				class={`min-w-[200px] rounded-xl px-8 py-4 font-['Jersey_10'] text-2xl font-bold uppercase transition-all ${
					activeTab === 'story'
						? 'bg-green-600 text-white'
						: 'bg-white/10 text-white/70 backdrop-blur-sm'
				}`}
			>
				📖 STORY MODE
			</button>
		</div>

		<!-- Leaderboard Content -->
		<div class="rounded-2xl border border-white/20 bg-black/40 p-8 backdrop-blur-md">
			{#if loading}
				<div class="py-20 text-center text-3xl text-white">Loading leaderboard...</div>
			{:else if error}
				<div class="py-20 text-center">
					<div class="text-2xl text-red-400">{error}</div>
					<button
						on:click={() => loadLeaderboard(activeTab)}
						class="mt-4 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-500"
					>
						Retry
					</button>
				</div>
			{:else if activeTab === 'freeplay'}
				<!-- Freeplay Leaderboard -->
				<div class="overflow-x-auto">
					<table class="w-full text-white">
						<thead>
							<tr class="border-b border-white/20 text-left">
								<th class="p-4 font-['Jersey_10'] text-xl">RANK</th>
								<th class="p-4 font-['Jersey_10'] text-xl">PLAYER</th>
								<th class="p-4 font-['Jersey_10'] text-xl">SCORE</th>
								<th class="p-4 font-['Jersey_10'] text-xl">PUZZLES</th>
								<th class="p-4 font-['Jersey_10'] text-xl">ACCURACY</th>
								<th class="p-4 font-['Jersey_10'] text-xl">DIFFICULTY</th>
								<th class="p-4 font-['Jersey_10'] text-xl">DATE</th>
							</tr>
						</thead>
						<tbody>
							{#each freeplayEntries as entry}
								<tr
									class={`border-b border-white/10 transition-colors hover:bg-white/5 ${
										entry.rank === 1
											? 'bg-yellow-500/20'
											: entry.rank === 2
												? 'bg-gray-400/20'
												: entry.rank === 3
													? 'bg-orange-600/20'
													: ''
									}`}
								>
									<td class="flex items-center gap-2 p-4">
										{#if entry.rank === 1}🥇{:else if entry.rank === 2}🥈{:else if entry.rank === 3}🥉{:else}#{entry.rank}{/if}
									</td>
									<td class="p-4">
										<div class="text-[18px] font-bold">{entry.playerName || 'Anonymous'}</div>
										{#if entry.isRegistered}<div class="text-xs text-green-400">
												✓ Registered
											</div>{/if}
									</td>
									<td class="p-4 text-2xl font-bold text-yellow-400">{entry.score || 0}</td>
									<td class="p-4 text-center text-lg">{entry.puzzlesCompleted || 0}</td>
									<td class="p-4 text-center text-lg">{entry.accuracy || 0}%</td>
									<td class="p-4">
										<span
											class={`rounded-lg px-3 py-1 text-sm font-bold ${
												entry.difficulty === 'EASY'
													? 'bg-green-600'
													: entry.difficulty === 'MEDIUM'
														? 'bg-yellow-600'
														: 'bg-red-600'
											}`}
										>
											{entry.difficulty || 'EASY'}
										</span>
									</td>
									<td class="p-4 text-sm text-gray-400">{formatDate(entry.completedAt)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					{#if freeplayEntries.length === 0}
						<div class="py-20 text-center text-2xl text-gray-400">
							No scores yet. Be the first to play!
						</div>
					{/if}
				</div>
			{:else}
				<!-- Story Mode Leaderboard -->
				<div class="mb-4 rounded-lg bg-yellow-600/20 p-4">
					<p class="text-center text-yellow-200">
						⚠️ Only showing players who have completed 5 or more levels
					</p>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-white">
						<thead>
							<tr class="border-b border-white/20 text-left">
								<th class="p-4 font-['Jersey_10'] text-xl">RANK</th>
								<th class="p-4 font-['Jersey_10'] text-xl">PLAYER</th>
								<th class="p-4 font-['Jersey_10'] text-xl">AVG TIME</th>
								<th class="p-4 font-['Jersey_10'] text-xl">LEVELS</th>
								<th class="p-4 font-['Jersey_10'] text-xl">STARS</th>
								<th class="p-4 font-['Jersey_10'] text-xl">COMPLETION</th>
								<th class="p-4 font-['Jersey_10'] text-xl">HIGHEST</th>
							</tr>
						</thead>
						<tbody>
							{#each storyEntries as entry}
								<tr
									class={`border-b border-white/10 transition-colors hover:bg-white/5 ${
										entry.rank === 1
											? 'bg-yellow-500/20'
											: entry.rank === 2
												? 'bg-gray-400/20'
												: entry.rank === 3
													? 'bg-orange-600/20'
													: ''
									}`}
								>
									<td class="flex items-center gap-2 p-4">
										{#if entry.rank === 1}🥇{:else if entry.rank === 2}🥈{:else if entry.rank === 3}🥉{:else}#{entry.rank}{/if}
									</td>
									<td class="p-4"
										><div class="text-[18px] font-bold">{entry.playerName || 'Anonymous'}</div></td
									>
									<td class="p-4 text-2xl font-bold text-green-400"
										>{formatTime(entry.averageTime)}</td
									>
									<td class="p-4 text-center text-lg font-bold">{entry.levelsCompleted || 0}/30</td>
									<td class="p-4 text-center text-xl">⭐ {entry.totalStars || 0}</td>
									<td class="p-4">
										<div class="h-4 w-full rounded-full bg-gray-700">
											<div
												class="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
												style="width: {entry.completionRate || 0}%"
											></div>
										</div>
										<div class="mt-1 text-center text-sm">{entry.completionRate || 0}%</div>
									</td>
									<td class="p-4 text-center text-lg font-bold">LVL {entry.highestLevel || 1}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					{#if storyEntries.length === 0}
						<div class="py-20 text-center text-2xl text-gray-400">
							No players have completed 5+ levels yet. Keep playing!
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Stats Summary -->
		{#if !loading && !error}
			<div class="mt-8 grid grid-cols-3 gap-4">
				<div class="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
					<div class="text-3xl font-bold text-white">
						{activeTab === 'freeplay' ? freeplayEntries.length : storyEntries.length}
					</div>
					<div class="font-['Jersey_10'] text-white/70">Total Players</div>
				</div>
				<div class="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
					<div class="text-3xl font-bold text-white">
						{activeTab === 'freeplay'
							? freeplayEntries[0]?.score || 0
							: formatTime(storyEntries[0]?.averageTime || 0)}
					</div>
					<div class="font-['Jersey_10'] text-white/70">
						{activeTab === 'freeplay' ? 'Top Score' : 'Best Avg Time'}
					</div>
				</div>
				<div class="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
					<div class="text-3xl font-bold text-white">{formatDate(leaderboard.lastUpdated)}</div>
					<div class="font-['Jersey_10'] text-white/70">Last Updated</div>
				</div>
			</div>
		{/if}
	</div>
</div>
