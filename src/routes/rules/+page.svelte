<script>
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>How to Play - REFLEKTOR</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
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
				HOW TO PLAY
			</h1>

			<div style="width: 180px;"></div>
		</div>

		<!-- Content Grid -->
		<div class="grid grid-cols-2 gap-8">
			<!-- Left Column - Basic Rules -->
			<div class="space-y-6">
				<!-- Game Objective -->
				<div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
					<h2 class="mb-4 text-3xl font-bold text-yellow-400" style="font-family: 'Jersey 10', sans-serif;">
						🎯 GAME OBJECTIVE
					</h2>
					<div class="space-y-3 text-white" style="font-family: 'Jersey 10', sans-serif; font-size: 18px;">
						<p>
							Navigate your player through two mirrored grids simultaneously to reach the goal.
						</p>
						<p>
							Your player exists in both grids at once - move in one grid, and your mirror image moves in the opposite direction in the other!
						</p>
						<p>
							Avoid obstacles in BOTH grids - hitting an obstacle in either grid will cost you a round.
						</p>
					</div>
				</div>

				<!-- Controls -->
				<div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
					<h2 class="mb-4 text-3xl font-bold text-blue-400" style="font-family: 'Jersey 10', sans-serif;">
						🎮 CONTROLS
					</h2>
					<div class="grid grid-cols-2 gap-4">
						<div class="rounded-lg bg-black/30 p-4">
							<h3 class="mb-2 font-bold text-white">Movement</h3>
							<div class="space-y-2 text-white/90" style="font-size: 16px;">
								<div>⬆️ <kbd class="rounded bg-gray-700 px-2 py-1">↑</kbd> or <kbd class="rounded bg-gray-700 px-2 py-1">W</kbd> - Move Up</div>
								<div>⬇️ <kbd class="rounded bg-gray-700 px-2 py-1">↓</kbd> or <kbd class="rounded bg-gray-700 px-2 py-1">S</kbd> - Move Down</div>
								<div>⬅️ <kbd class="rounded bg-gray-700 px-2 py-1">←</kbd> or <kbd class="rounded bg-gray-700 px-2 py-1">A</kbd> - Move Left</div>
								<div>➡️ <kbd class="rounded bg-gray-700 px-2 py-1">→</kbd> or <kbd class="rounded bg-gray-700 px-2 py-1">D</kbd> - Move Right</div>
							</div>
						</div>
						<div class="rounded-lg bg-black/30 p-4">
							<h3 class="mb-2 font-bold text-white">Helper Tools</h3>
							<div class="space-y-2 text-white/90" style="font-size: 16px;">
								<div>🔨 <kbd class="rounded bg-gray-700 px-2 py-1">1</kbd> - Select Hammer</div>
								<div>🪓 <kbd class="rounded bg-gray-700 px-2 py-1">2</kbd> - Select Axe</div>
								<div>🗡️ <kbd class="rounded bg-gray-700 px-2 py-1">3</kbd> - Select Sickle</div>
								<div class="mt-2 text-sm text-yellow-300">Click obstacles to remove them!</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Grid Legend -->
				<div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
					<h2 class="mb-4 text-3xl font-bold text-green-400" style="font-family: 'Jersey 10', sans-serif;">
						📋 GRID LEGEND
					</h2>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-300 text-2xl font-bold text-gray-900">P</div>
								<span class="text-white">Player (Main Grid)</span>
							</div>
							<div class="flex items-center gap-3">
								<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-300 text-2xl font-bold text-gray-900">M</div>
								<span class="text-white">Mirror (Mirrored Grid)</span>
							</div>
							<div class="flex items-center gap-3">
								<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-2xl font-bold">X</div>
								<span class="text-white">Goal - Reach to win!</span>
							</div>
						</div>
						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-600 text-2xl">🧱</div>
								<span class="text-white">Wall (use Hammer)</span>
							</div>
							<div class="flex items-center gap-3">
								<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-700 text-2xl">🌳</div>
								<span class="text-white">Tree (use Axe)</span>
							</div>
							<div class="flex items-center gap-3">
								<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-2xl">🌿</div>
								<span class="text-white">Grass (use Sickle)</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column - Game Modes & Tips -->
			<div class="space-y-6">
				<!-- Game Modes -->
				<div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
					<h2 class="mb-4 text-3xl font-bold text-purple-400" style="font-family: 'Jersey 10', sans-serif;">
						🎮 GAME MODES
					</h2>
					
					<div class="mb-6 rounded-lg bg-blue-600/20 p-4">
						<h3 class="mb-2 text-2xl font-bold text-blue-300">🎲 FREEPLAY MODE</h3>
						<ul class="space-y-2 text-white/90" style="font-size: 16px;">
							<li>• 3-minute time limit</li>
							<li>• Random puzzle generation</li>
							<li>• Choose difficulty: Easy (5x5), Medium (7x7), Hard (9x9)</li>
							<li>• Score points for each puzzle completed</li>
							<li>• Compete on the global leaderboard</li>
							<li>• Perfect for quick sessions!</li>
						</ul>
					</div>

					<div class="rounded-lg bg-green-600/20 p-4">
						<h3 class="mb-2 text-2xl font-bold text-green-300">📖 STORY MODE</h3>
						<ul class="space-y-2 text-white/90" style="font-size: 16px;">
							<li>• 30 handcrafted levels</li>
							<li>• Progressive difficulty</li>
							<li>• Earn up to 3 stars per level</li>
							<li>• Unlock levels by completing previous ones</li>
							<li>• Track your best time and steps</li>
							<li>• Guests can play first 3 levels</li>
						</ul>
					</div>
				</div>

				<!-- Scoring System -->
				<div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
					<h2 class="mb-4 text-3xl font-bold text-orange-400" style="font-family: 'Jersey 10', sans-serif;">
						⭐ SCORING SYSTEM
					</h2>
					
					<div class="mb-4">
						<h3 class="mb-2 text-xl font-bold text-white">Freeplay Scoring</h3>
						<div class="space-y-2 text-white/90" style="font-size: 16px;">
							<div>• Base points per puzzle: 100</div>
							<div>• Difficulty bonus: Easy ×1, Medium ×1.5, Hard ×2</div>
							<div>• Speed bonus: Complete faster for extra points</div>
							<div>• Accuracy bonus: Fewer collisions = higher score</div>
						</div>
					</div>

					<div>
						<h3 class="mb-2 text-xl font-bold text-white">Story Mode Stars</h3>
						<div class="space-y-2 text-white/90" style="font-size: 16px;">
							<div>⭐⭐⭐ Beat target time AND target steps</div>
							<div>⭐⭐ Beat either target time OR target steps</div>
							<div>⭐ Complete the level</div>
						</div>
					</div>
				</div>

				<!-- Pro Tips -->
				<div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
					<h2 class="mb-4 text-3xl font-bold text-red-400" style="font-family: 'Jersey 10', sans-serif;">
						💡 PRO TIPS
					</h2>
					<div class="space-y-3 text-white/90" style="font-size: 16px;">
						<div class="flex gap-3">
							<span class="text-2xl">🎯</span>
							<p>Plan your route! Look at both grids before moving.</p>
						</div>
						<div class="flex gap-3">
							<span class="text-2xl">🔄</span>
							<p>Remember: moving left on the main grid moves your mirror right!</p>
						</div>
						<div class="flex gap-3">
							<span class="text-2xl">🛠️</span>
							<p>Save helper tools for when you really need them - you only get one of each per puzzle!</p>
						</div>
						<div class="flex gap-3">
							<span class="text-2xl">⚡</span>
							<p>In Freeplay, speed matters! Complete puzzles quickly for bonus points.</p>
						</div>
						<div class="flex gap-3">
							<span class="text-2xl">🏆</span>
							<p>Practice in Story Mode to improve your skills for Freeplay high scores!</p>
						</div>
						<div class="flex gap-3">
							<span class="text-2xl">👥</span>
							<p>Create an account to save your progress and appear on leaderboards!</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom Section -->
		<div class="mt-8 rounded-2xl border border-white/20 bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 text-center backdrop-blur-md">
			<h2 class="mb-4 text-4xl font-bold text-white" style="font-family: 'Pixelify Sans', sans-serif;">
				READY TO PLAY?
			</h2>
			<p class="mb-6 text-xl text-white/90" style="font-family: 'Jersey 10', sans-serif;">
				Master the mirror mechanics and become the ultimate REFLEKTOR champion!
			</p>
			<div class="flex justify-center gap-4">
				<button
					on:click={() => goto('/freeplay')}
					class="rounded-xl bg-blue-600 px-8 py-4 text-2xl font-bold text-white transition-all hover:scale-105 hover:bg-blue-500"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					🎲 PLAY FREEPLAY
				</button>
				<button
					on:click={() => goto('/story')}
					class="rounded-xl bg-green-600 px-8 py-4 text-2xl font-bold text-white transition-all hover:scale-105 hover:bg-green-500"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					📖 PLAY STORY
				</button>
			</div>
		</div>
	</div>
</div>
