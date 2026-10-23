/*
  Warnings:

  - A unique constraint covering the columns `[resumeTokenHash]` on the table `PendingRegistration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resumeTokenHash` to the `PendingRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingRegistration" ADD COLUMN     "resumeTokenHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PendingRegistration_resumeTokenHash_key" ON "PendingRegistration"("resumeTokenHash");
