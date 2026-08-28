-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WANT_TO_PLAY', 'PLAYING', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "LibraryEntry" (
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WANT_TO_PLAY',
    "rating" DECIMAL(2,1),
    "playtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryEntry_pkey" PRIMARY KEY ("userId","gameId")
);

-- CreateTable
CREATE TABLE "LibraryEntryPlatform" (
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,

    CONSTRAINT "LibraryEntryPlatform_pkey" PRIMARY KEY ("userId","gameId","platformId")
);

-- AddForeignKey
ALTER TABLE "LibraryEntry" ADD CONSTRAINT "LibraryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryEntry" ADD CONSTRAINT "LibraryEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryEntryPlatform" ADD CONSTRAINT "LibraryEntryPlatform_userId_gameId_fkey" FOREIGN KEY ("userId", "gameId") REFERENCES "LibraryEntry"("userId", "gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryEntryPlatform" ADD CONSTRAINT "LibraryEntryPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
