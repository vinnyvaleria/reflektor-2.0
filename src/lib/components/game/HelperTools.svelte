<script>
	import { helpers } from '$lib/stores/gameStore.js';
	import { gameService } from '$lib/services/gameService.js';

	// Svelte 5 props
	let { selectedHelper = $bindable(null), onHelperSelect = () => {} } = $props();

	// reactive helper list from store
	const helperList = $derived(Object.entries($helpers));

	// select or deselect a helper tool
	function selectHelper(helperName) {
		const helper = $helpers[helperName];

		// only allow selection if helper is available
		if (helper.available > helper.used) {
			// toggle selection (click again to deselect)
			const newSelection = selectedHelper === helperName ? null : helperName;

			// update the store through service
			gameService.setSelectedHelper(newSelection);

			// also call parent callback for backwards compatibility
			onHelperSelect(newSelection);
		}
	}

	// get emoji for each helper type
	function getHelperEmoji(helperName) {
		const emojis = {
			hammer: '🔨',
			axe: '🪓',
			sickle: '🗡️'
		};
		return emojis[helperName] || '🔧';
	}

	// get description for each helper
	function getHelperDescription(helperName) {
		const descriptions = {
			hammer: 'breaks walls',
			axe: 'cuts trees',
			sickle: 'clears grass'
		};
		return descriptions[helperName] || '';
	}

	// listen for keyboard helper selection
	document.addEventListener('helperSelect', (event) => {
		selectHelper(event.detail);
	});
</script>

<div class="helper-tools rounded-lg border-2 border-game-blue bg-gray-800 p-6 shadow-lg">
	<h3 class="mb-4 font-jersey text-xl font-bold text-white">helper tools</h3>

	<!-- helper buttons -->
	<div class="flex flex-col gap-3">
		{#each helperList as [name, helper], index}
			<button
				class="helper-btn flex items-center gap-4 rounded-lg border-2 p-3 transition-all duration-200"
				class:selected={selectedHelper === name}
				class:disabled={helper.used >= helper.available}
				onclick={() => selectHelper(name)}
				disabled={helper.used >= helper.available}
				title="Press {index + 1} to select"
			>
				<!-- helper emoji -->
				<span class="text-3xl">{getHelperEmoji(name)}</span>

				<!-- helper info -->
				<div class="flex flex-col items-start">
					<span class="font-jersey text-lg font-bold capitalize text-white">
						{name}
					</span>
					<span class="text-sm text-gray-300">
						{getHelperDescription(name)}
					</span>
					<span
						class="text-sm font-bold text-white"
						class:text-red-300={helper.used >= helper.available}
					>
						{helper.available - helper.used} left
					</span>
				</div>

				<!-- keyboard shortcut -->
				<span class="ml-auto rounded bg-gray-700 px-2 py-1 font-jersey text-xs text-white">
					{index + 1}
				</span>
			</button>
		{/each}
	</div>

	<!-- instructions -->
	<div class="mt-4 rounded bg-gray-700 p-3 font-jersey text-sm text-white">
		<p class="mb-2 font-bold">how to use:</p>
		<ol class="space-y-1 text-xs text-gray-300">
			<li>1. Select a tool by clicking or pressing number key</li>
			<li>2. Click on obstacles in either grid to remove them</li>
			<li>3. Each tool can only be used once per puzzle</li>
			<li>4. Different tools remove different obstacle types</li>
		</ol>
	</div>
</div>

<style>
	.helper-btn {
		@apply border-gray-600 bg-gray-700 hover:border-game-primary hover:bg-game-primary;
	}

	.helper-btn.selected {
		@apply border-game-primary bg-game-primary text-white;
	}

	.helper-btn.selected .text-gray-300 {
		@apply text-gray-200;
	}

	.helper-btn.disabled {
		@apply cursor-not-allowed opacity-50 hover:border-gray-600 hover:bg-gray-700;
	}

	.font-jersey {
		font-family: 'Jersey 10', sans-serif;
	}
</style>
