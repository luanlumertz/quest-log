-- DropIndex
DROP INDEX "PendingRegistration_resumeTokenHash_key";

-- AlterTable
ALTER TABLE "PendingRegistration" DROP COLUMN "resumeTokenHash";
