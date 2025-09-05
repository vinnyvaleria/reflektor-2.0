.
├── ./README.md
├── ./eslint.config.js
├── ./jsconfig.json
├── ./package.json
├── ./prisma
│   ├── ./prisma/schema.prisma
│   └── ./prisma/seed.js
├── ./src
│   ├── ./src/app.css
│   ├── ./src/app.d.ts
│   ├── ./src/app.html
│   ├── ./src/lib
│   │   ├── ./src/lib/assets
│   │   │   ├── ./src/lib/assets/fonts
│   │   │   │   ├── ./src/lib/assets/fonts/Jersey10-Regular.ttf
│   │   │   │   ├── ./src/lib/assets/fonts/Jersey15-Regular.ttf
│   │   │   │   └── ./src/lib/assets/fonts/PixelifySans-VariableFont_wght.ttf
│   │   │   └── ./src/lib/assets/images
│   │   │       ├── ./src/lib/assets/images/down-arrow.png
│   │   │       ├── ./src/lib/assets/images/game-image.png
│   │   │       ├── ./src/lib/assets/images/helpers
│   │   │       │   ├── ./src/lib/assets/images/helpers/axe.png
│   │   │       │   ├── ./src/lib/assets/images/helpers/hammer.png
│   │   │       │   └── ./src/lib/assets/images/helpers/sickle.png
│   │   │       ├── ./src/lib/assets/images/icon.png
│   │   │       ├── ./src/lib/assets/images/information
│   │   │       │   ├── ./src/lib/assets/images/information/continue.png
│   │   │       │   ├── ./src/lib/assets/images/information/home.png
│   │   │       │   ├── ./src/lib/assets/images/information/leaderboard.png
│   │   │       │   ├── ./src/lib/assets/images/information/pause.png
│   │   │       │   ├── ./src/lib/assets/images/information/reset.png
│   │   │       │   └── ./src/lib/assets/images/information/rules.png
│   │   │       ├── ./src/lib/assets/images/left-arrow.png
│   │   │       ├── ./src/lib/assets/images/light-bg.jpg
│   │   │       ├── ./src/lib/assets/images/obstacles
│   │   │       │   ├── ./src/lib/assets/images/obstacles/pixel-grass.png
│   │   │       │   ├── ./src/lib/assets/images/obstacles/pixel-tree.png
│   │   │       │   ├── ./src/lib/assets/images/obstacles/pixel-wall.png
│   │   │       │   └── ./src/lib/assets/images/obstacles/wall.png
│   │   │       ├── ./src/lib/assets/images/right-arrow.png
│   │   │       └── ./src/lib/assets/images/up-arrow.png
│   │   ├── ./src/lib/components
│   │   │   └── ./src/lib/components/game
│   │   │       ├── ./src/lib/components/game/GameControls.svelte
│   │   │       ├── ./src/lib/components/game/GameGrid.svelte
│   │   │       ├── ./src/lib/components/game/GameInfo.svelte
│   │   │       ├── ./src/lib/components/game/GameTimer.svelte
│   │   │       └── ./src/lib/components/game/HelperTools.svelte
│   │   ├── ./src/lib/index.ts
│   │   ├── ./src/lib/server
│   │   │   ├── ./src/lib/server/auth.js
│   │   │   ├── ./src/lib/server/database.js
│   │   │   ├── ./src/lib/server/gameEngine
│   │   │   │   └── ./src/lib/server/gameEngine/mapGenerator.js
│   │   │   └── ./src/lib/server/maps
│   │   │       └── ./src/lib/server/maps/storyMaps.js
│   │   ├── ./src/lib/services
│   │   │   ├── ./src/lib/services/authApis.js
│   │   │   ├── ./src/lib/services/authService.js
│   │   │   ├── ./src/lib/services/freeplayApis.js
│   │   │   ├── ./src/lib/services/gameApis.js
│   │   │   ├── ./src/lib/services/gameService.js
│   │   │   ├── ./src/lib/services/gameplayService.js
│   │   │   ├── ./src/lib/services/helperApi.js
│   │   │   ├── ./src/lib/services/helperService.js
│   │   │   ├── ./src/lib/services/leaderboardApis.js
│   │   │   ├── ./src/lib/services/leaderboardService.js
│   │   │   ├── ./src/lib/services/progressApis.js
│   │   │   ├── ./src/lib/services/progressService.js
│   │   │   ├── ./src/lib/services/sessionService.js
│   │   │   ├── ./src/lib/services/storageService.js
│   │   │   ├── ./src/lib/services/storyApis.js
│   │   │   └── ./src/lib/services/timerService.js
│   │   ├── ./src/lib/stores
│   │   │   └── ./src/lib/stores/gameStore.js
│   │   └── ./src/lib/utils
│   │       ├── ./src/lib/utils/apiUtils.js
│   │       ├── ./src/lib/utils/getAuthHeaders.js
│   │       └── ./src/lib/utils/storeUtils.js
│   └── ./src/routes
│       ├── ./src/routes/+layout.svelte
│       ├── ./src/routes/+page.svelte
│       ├── ./src/routes/api
│       │   ├── ./src/routes/api/auth
│       │   │   ├── ./src/routes/api/auth/signin
│       │   │   │   └── ./src/routes/api/auth/signin/+server.js
│       │   │   └── ./src/routes/api/auth/signup
│       │   │       └── ./src/routes/api/auth/signup/+server.js
│       │   ├── ./src/routes/api/freeplay
│       │   │   └── ./src/routes/api/freeplay/start
│       │   │       └── ./src/routes/api/freeplay/start/+server.js
│       │   ├── ./src/routes/api/game
│       │   │   ├── ./src/routes/api/game/helper
│       │   │   │   └── ./src/routes/api/game/helper/+server.js
│       │   │   └── ./src/routes/api/game/move
│       │   │       └── ./src/routes/api/game/move/+server.js
│       │   ├── ./src/routes/api/leaderboard
│       │   │   └── ./src/routes/api/leaderboard/+server.js
│       │   ├── ./src/routes/api/story
│       │   │   └── ./src/routes/api/story/start
│       │   │       └── ./src/routes/api/story/start/+server.js
│       │   └── ./src/routes/api/user
│       │       └── ./src/routes/api/user/progress
│       │           └── ./src/routes/api/user/progress/+server.js
│       ├── ./src/routes/auth
│       │   ├── ./src/routes/auth/signin
│       │   │   └── ./src/routes/auth/signin/+page.svelte
│       │   └── ./src/routes/auth/signup
│       │       └── ./src/routes/auth/signup/+page.svelte
│       ├── ./src/routes/freeplay
│       │   └── ./src/routes/freeplay/+page.svelte
│       ├── ./src/routes/leaderboard
│       │   └── ./src/routes/leaderboard/+page.svelte
│       ├── ./src/routes/levels
│       │   └── ./src/routes/levels/+page.svelte
│       ├── ./src/routes/rules
│       │   └── ./src/routes/rules/+page.svelte
│       └── ./src/routes/story
│           └── ./src/routes/story/+page.svelte
├── ./static
│   ├── ./static/api-test.html
│   └── ./static/robots.txt
├── ./structure.md
├── ./svelte.config.js
└── ./vite.config.ts

41 directories, 84 files
