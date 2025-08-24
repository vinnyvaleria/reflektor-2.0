<!-- src/routes/test-apis/+page.svelte -->
<script>
	import '../../app.css';

	let results = '';
	let loading = false;

	async function testFreeplay() {
		loading = true;
		try {
			const response = await fetch('/api/freeplay/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ difficulty: 'EASY', playerName: 'browser-test-freeplay' })
			});
			const data = await response.json();
			results = JSON.stringify(data, null, 2);
		} catch (error) {
			results = 'Error: ' + error.message;
		}
		loading = false;
	}

	async function testStory() {
		loading = true;
		try {
			const response = await fetch('/api/story/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ level: 1, playerName: 'browser-test-story' })
			});
			const data = await response.json();
			results = JSON.stringify(data, null, 2);
		} catch (error) {
			results = 'Error: ' + error.message;
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>API Tests - Reflektor</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-8">
	<h1 class="mb-6 text-3xl font-bold">🧪 Reflektor API Tests</h1>

	<div class="mb-6 flex gap-4">
		<button
			on:click={testFreeplay}
			disabled={loading}
			class="bg-blue-600 hover:bg-blue-700 rounded px-6 py-3 text-white disabled:opacity-50"
		>
			{loading ? 'Testing...' : 'Test Freeplay'}
		</button>

		<button
			on:click={testStory}
			disabled={loading}
			class="bg-green-600 hover:bg-green-700 rounded px-6 py-3 text-white disabled:opacity-50"
		>
			{loading ? 'Testing...' : 'Test Story'}
		</button>
	</div>

	{#if results}
		<div class="rounded-lg bg-gray-100 p-4">
			<h2 class="mb-3 text-xl font-semibold">Results:</h2>
			<pre class="overflow-auto whitespace-pre-wrap text-sm">{results}</pre>
		</div>
	{/if}
</div>
