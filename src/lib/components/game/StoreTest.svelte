<!-- StoreTest.svelte - Add this component to your page temporarily -->
<script>
	import { gameState } from '$lib';
	import { onMount } from 'svelte';

	// Direct reactive subscription
	$: stateData = $gameState;

	onMount(() => {
		// console.log('[StoreTest] Component mounted');
		// console.log('[StoreTest] Initial state:', $gameState);
	});

	// Log whenever state changes
	$: {
		if (stateData) {
			// console.log('[StoreTest] State updated:', {
				hasMapData: !!stateData.mapData,
				mapDataLength: stateData.mapData?.length,
				hasMirroredData: !!stateData.mirroredMapData,
				mirroredDataLength: stateData.mirroredMapData?.length,
				position: stateData.currentPosition,
				status: stateData.status
			});
		}
	}
</script>

<div
	class="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg bg-black p-4 font-mono text-xs text-green-400"
>
	<div class="mb-2 font-bold">🔍 Store Monitor</div>
	<div>Session: {stateData.currentSession?.id ? '✅' : '❌'}</div>
	<div>
		MapData: {stateData.mapData
			? `✅ ${stateData.mapData.length}x${stateData.mapData.length}`
			: '❌'}
	</div>
	<div>
		MirroredData: {stateData.mirroredMapData
			? `✅ ${stateData.mirroredMapData.length}x${stateData.mirroredMapData.length}`
			: '❌'}
	</div>
	<div>
		Position: {stateData.currentPosition
			? `✅ (${stateData.currentPosition.row}, ${stateData.currentPosition.col})`
			: '❌'}
	</div>
	<div>Status: {stateData.status || 'undefined'}</div>
</div>
