<script>
	import '../app.css';
	import { gameService } from '$lib/services/gameService.js';
	import { onMount } from 'svelte';

	// initialize game services when app starts
	onMount(async () => {
		try {
			await gameService.initialize();
		} catch (error) {
			console.error('Failed to initialize game services:', error);
		}
	});
</script>

<svelte:head>
	<title>Reflektor 2.0 - Mirror Puzzle Game</title>
	<meta
		name="description"
		content="Navigate two mirrored grids simultaneously in this challenging puzzle game"
	/>
</svelte:head>

<slot />
