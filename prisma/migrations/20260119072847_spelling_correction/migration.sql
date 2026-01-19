/*
  Warnings:

  - You are about to drop the column `workdlowId` on the `Node` table. All the data in the column will be lost.
  - Added the required column `workflowId` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_workdlowId_fkey";

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "workdlowId",
ADD COLUMN     "workflowId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
