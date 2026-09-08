-- DropForeignKey
ALTER TABLE "public"."LibraryEntryPlatform" DROP CONSTRAINT "LibraryEntryPlatform_userId_gameId_fkey";

-- AddForeignKey
ALTER TABLE "LibraryEntryPlatform" ADD CONSTRAINT "LibraryEntryPlatform_userId_gameId_fkey" FOREIGN KEY ("userId", "gameId") REFERENCES "LibraryEntry"("userId", "gameId") ON DELETE CASCADE ON UPDATE CASCADE;
