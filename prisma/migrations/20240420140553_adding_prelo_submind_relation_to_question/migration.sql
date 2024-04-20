/*
  Warnings:

  - A unique constraint covering the columns `[submindId]` on the table `PreloQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `submindId` to the `PreloQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PreloQuestion" ADD COLUMN     "submindId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PreloQuestion_submindId_key" ON "PreloQuestion"("submindId");

-- AddForeignKey
ALTER TABLE "PreloQuestion" ADD CONSTRAINT "PreloQuestion_submindId_fkey" FOREIGN KEY ("submindId") REFERENCES "PreloSubmind"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
