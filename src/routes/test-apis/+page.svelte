<script>
	import { freeplayApis } from '$lib/services/freeplayApis';
	import { storyApis } from '$lib/services/storyApis';
	import { gameApis } from '$lib/services/gameApis';
	import '../../app.css';

	let results = '';
	let loading = false;
	let currentTest = '';

	async function testFreeplay() {
		loading = true;
		currentTest = 'freeplay';
		try {
			console.log('🎲 Starting Freeplay Test...');

			// 1. Start a freeplay game
			const { response: startResponse, data: gameData } = await freeplayApis.start(
				'EASY',
				'freeplay-test'
			);

			if (!startResponse.ok) {
				throw new Error(
					`Start request failed: ${startResponse.status} ${startResponse.statusText}`
				);
			}

			console.log('✅ Game started:', gameData.gameSession.id);

			let testResults = {
				gameStart: gameData,
				moves: []
			};

			const sessionId = gameData.gameSession.id;

			// 2. Test a few moves
			const moves = ['right', 'down', 'left'];

			for (const direction of moves) {
				console.log(`🎯 Testing move: ${direction}`);

				const { response: moveResponse, data: moveData } = await gameApis.move(
					sessionId,
					direction
				);

				if (moveResponse.ok) {
					console.log(`✅ Move successful - Steps: ${moveData.gameSession.totalSteps}`);
					testResults.moves.push({
						direction,
						success: true,
						data: moveData
					});
				} else {
					console.log(`⚠️ Move blocked: ${moveData.error}`);
					testResults.moves.push({
						direction,
						success: false,
						error: moveData.error,
						collision: moveData.collision
					});
				}
			}

			results = JSON.stringify(testResults, null, 2);
			console.log('🎲 Freeplay test completed!');
		} catch (error) {
			results = `❌ Freeplay Test Error: ${error.message}`;
			console.error('❌ Freeplay test failed:', error);
		}
		loading = false;
		currentTest = '';
	}

	async function testStory() {
		loading = true;
		currentTest = 'story';
		try {
			console.log('📖 Starting Story Test...');

			const { response, data } = await storyApis.start(1, 'story-test');

			if (!response.ok) {
				throw new Error(`Story start failed: ${response.status} ${response.statusText}`);
			}
			console.log('✅ Story mode started:', data.gameSession.id);

			// 3. Test a move in story mode too
			const sessionId = data.gameSession.id;
			const { response: moveResponse, data: moveData } = await gameApis.move(sessionId, 'up');

			const testResults = {
				gameStart: data,
				testMove: {
					success: moveResponse.ok,
					data: moveData
				}
			};

			results = JSON.stringify(testResults, null, 2);
			console.log('📖 Story test completed!');
		} catch (error) {
			results = `❌ Story Test Error: ${error.message}`;
			console.error('❌ Story test failed:', error);
		}
		loading = false;
		currentTest = '';
	}

	async function testDatabase() {
		loading = true;
		currentTest = 'database';
		try {
			console.log('🗄️ Testing Database Connection...');

			// 3. Test by trying to start a game (which tests DB)
			const { response, data } = await freeplayApis.start('MEDIUM', 'db-test');

			if (response.ok) {
				results = `✅ Database Connection Working!\n\nSession Created: ${data.gameSession.id}\nGame Mode: ${data.gameSession.gameMode}\nDifficulty: ${data.gameSession.difficulty}`;
				console.log('✅ Database test passed');
			} else {
				const errorText = await response.text();
				results = `❌ Database Connection Failed: ${response.status}\n${errorText}`;
			}
		} catch (error) {
			results = `❌ Database Test Error: ${error.message}`;
			console.error('❌ Database test failed:', error);
		}
		loading = false;
		currentTest = '';
	}

	function clearResults() {
		results = '';
	}
</script>

<svelte:head>
	<title>API Tests - Reflektor 2.0</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-8">
	<div class="mx-auto max-w-6xl">
		<div class="mb-8 text-center">
			<h1
				class="mb-4 text-4xl font-bold text-gray-800"
				style="font-family: 'Pixelify Sans', sans-serif;"
			>
				🧪 Reflektor 2.0 API Tests
			</h1>
			<p class="text-lg text-gray-600">
				Test the game APIs to ensure everything is working correctly
			</p>
		</div>

		<!-- Test Buttons -->
		<div class="mb-8 flex flex-wrap justify-center gap-4">
			<button
				on:click={testDatabase}
				disabled={loading}
				class="test-btn bg-gray-600 hover:bg-gray-700"
				class:loading={currentTest === 'database'}
			>
				{currentTest === 'database' ? '🔄 Testing...' : '🗄️ Test Database'}
			</button>

			<button
				on:click={testFreeplay}
				disabled={loading}
				class="test-btn bg-blue-600 hover:bg-blue-700"
				class:loading={currentTest === 'freeplay'}
			>
				{currentTest === 'freeplay' ? '🔄 Testing...' : '🎲 Test Freeplay'}
			</button>

			<button
				on:click={testStory}
				disabled={loading}
				class="test-btn bg-green-600 hover:bg-green-700"
				class:loading={currentTest === 'story'}
			>
				{currentTest === 'story' ? '🔄 Testing...' : '📖 Test Story Mode'}
			</button>

			<button
				on:click={clearResults}
				disabled={loading}
				class="test-btn bg-red-600 hover:bg-red-700"
			>
				🗑️ Clear Results
			</button>
		</div>

		<!-- Testing Instructions -->
		<div class="mb-8 rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-bold text-gray-800">🔍 What These Tests Do:</h2>
			<div class="grid gap-4 md:grid-cols-3">
				<div class="rounded bg-gray-50 p-4">
					<h3 class=" text-gray-700">🗄️ Database Test</h3>
					<p class="text-sm text-gray-600">
						Checks if database connection works and sessions can be created.
					</p>
				</div>
				<div class="rounded bg-blue-50 p-4">
					<h3 class=" text-blue-700">🎲 Freeplay Test</h3>
					<p class="text-sm text-blue-600">
						Tests freeplay game creation, map generation, and movement API.
					</p>
				</div>
				<div class="rounded bg-green-50 p-4">
					<h3 class="font-bold text-green-700">📖 Story Test</h3>
					<p class="text-sm text-green-600">
						Tests story mode startup and validates story map loading.
					</p>
				</div>
			</div>
		</div>

		<!-- Results Display -->
		{#if results}
			<div class="rounded-lg bg-white p-6 shadow-lg">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl text-gray-800">📊 Test Results:</h2>
					<button
						on:click={clearResults}
						class="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
					>
						Clear
					</button>
				</div>

				<div class="overflow-auto rounded bg-gray-100 p-4">
					<pre class="whitespace-pre-wrap font-mono text-sm">{results}</pre>
				</div>
			</div>
		{:else}
			<div class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
				<p class="text-gray-500">👆 Click a test button above to see results here</p>
			</div>
		{/if}

		<!-- Troubleshooting Tips -->
		<div class="mt-8 rounded-lg bg-yellow-50 p-6">
			<h2 class="mb-4 text-lg font-bold text-yellow-800">🛠️ Troubleshooting Tips:</h2>
			<ul class="space-y-2 text-sm text-yellow-700">
				<li>
					• Make sure your development server is running: <code
						class="rounded bg-yellow-100 px-2 py-1">npm run dev</code
					>
				</li>
				<li>
					• Check if your database is set up: <code class="rounded bg-yellow-100 px-2 py-1"
						>npx prisma studio</code
					>
				</li>
				<li>• Look at the browser console (F12) for detailed error messages</li>
				<li>
					• Verify your API routes exist in <code class="rounded bg-yellow-100 px-2 py-1"
						>src/routes/api/</code
					>
				</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.test-btn {
		@apply transform rounded-lg px-6 py-3 font-bold text-white transition-all duration-200 hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50;
	}

	.test-btn.loading {
		@apply animate-pulse;
	}

	code {
		font-family: 'Courier New', monospace;
	}
</style>
