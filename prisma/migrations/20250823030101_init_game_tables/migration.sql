-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerName" TEXT,
    "mapData" JSONB NOT NULL,
    "mirroredMapData" JSONB NOT NULL,
    "currentPosition" JSONB NOT NULL,
    "roundsUsed" INTEGER NOT NULL DEFAULT 0,
    "stepsCount" INTEGER NOT NULL DEFAULT 0,
    "helperUsage" JSONB NOT NULL DEFAULT [],
    "timeTaken" INTEGER,
    "score" INTEGER,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PLAYING',
    "difficulty" TEXT NOT NULL DEFAULT 'EASY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
