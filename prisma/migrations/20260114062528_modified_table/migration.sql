/*
  Warnings:

  - You are about to drop the column `formNodeId` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `workdlowId` on the `Connection` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fromNodeId,toNodeId,fromOutput,toInput]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fromNodeId` to the `Connection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workflowId` to the `Connection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_formNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_workdlowId_fkey";

-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "formNodeId",
DROP COLUMN "workdlowId",
ADD COLUMN     "fromNodeId" TEXT NOT NULL,
ADD COLUMN     "workflowId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Connection_fromNodeId_toNodeId_fromOutput_toInput_key" ON "Connection"("fromNodeId", "toNodeId", "fromOutput", "toInput");

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
