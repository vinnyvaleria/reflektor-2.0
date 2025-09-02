<script>
	import { helpers, gameState, gameService } from '../..';

	export let onHelperSelect = () => {};

	$: helperList = Object.entries($helpers);
	$: selectedHelper = $gameState.selectedHelper;

	function selectHelper(helperName) {
		const helper = $helpers[helperName];

		if (helper.available > helper.used) {
			const newSelection = selectedHelper === helperName ? null : helperName;

			try {
				// use service for state management
				gameService.setSelectedHelper(newSelection);
				onHelperSelect(newSelection);
			} catch (error) {
				console.warn('Helper selection failed:', error.message);
			}
		}
	}

	function getHelperEmoji(helperName) {
		const emojis = { hammer: '🔨', axe: '🪓', sickle: '🗡️' };
		return emojis[helperName] || '🔧';
	}

	function getHelperDescription(helperName) {
		const descriptions = {
			hammer: 'breaks walls',
			axe: 'cuts trees',
			sickle: 'clears grass'
		};
		return descriptions[helperName] || '';
	}
</script>

<div class="helper-tools rounded-lg border-2 border-game-blue bg-white p-6 shadow-lg">
	<h3 class="mb-4 text-xl font-bold text-game-dark" style="font-family: 'Jersey 10', sans-serif;">
		Helper Tools
	</h3>

	<div class="flex flex-col gap-3">
		{#each helperList as [name, helper], index}
			<button
				class="helper-btn flex items-center gap-4 rounded-lg border-2 p-3 transition-all duration-200"
				class:selected={selectedHelper === name}
				class:disabled={helper.used >= helper.available}
				on:click={() => selectHelper(name)}
				disabled={helper.used >= helper.available}
			>
				<span class="text-3xl">{getHelperEmoji(name)}</span>
				<div class="flex flex-col items-start">
					<span class="text-lg font-bold capitalize" style="font-family: 'Jersey 10', sans-serif;">
						{name}
					</span>
					<span class="text-sm text-gray-600">{getHelperDescription(name)}</span>
					<span class="text-sm font-bold" class:text-red-500={helper.used >= helper.available}>
						{helper.available - helper.used} left
					</span>
				</div>
				<span
					class="ml-auto rounded bg-gray-200 px-2 py-1 text-xs"
					style="font-family: 'Jersey 10', sans-serif;"
				>
					{index + 1}
				</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.helper-btn {
		@apply border-gray-300 bg-white hover:border-game-primary hover:bg-game-light;
	}
	.helper-btn.selected {
		@apply border-game-primary bg-game-primary text-white;
	}
	.helper-btn.disabled {
		@apply cursor-not-allowed opacity-50;
	}
</style>
