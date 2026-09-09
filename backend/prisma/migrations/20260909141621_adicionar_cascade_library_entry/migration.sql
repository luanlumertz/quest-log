-- DropForeignKey
ALTER TABLE "public"."LibraryEntry" DROP CONSTRAINT "LibraryEntry_userId_fkey";

-- AddForeignKey
ALTER TABLE "LibraryEntry" ADD CONSTRAINT "LibraryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
