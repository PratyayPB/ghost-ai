/*
  Warnings:

  - You are about to drop the column `canvasJsonPath` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "canvasJsonPath",
ADD COLUMN     "canvasBlobUrl" TEXT;

-- CreateTable
CREATE TABLE "TaskRun" (
    "runId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskRun_pkey" PRIMARY KEY ("runId")
);

-- CreateIndex
CREATE INDEX "TaskRun_runId_idx" ON "TaskRun"("runId");

-- CreateIndex
CREATE INDEX "TaskRun_userId_projectId_idx" ON "TaskRun"("userId", "projectId");
