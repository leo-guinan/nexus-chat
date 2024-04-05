/*
  Warnings:

  - A unique constraint covering the columns `[documentUUID]` on the table `Submind` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentUUID` to the `Submind` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submind" ADD COLUMN     "documentUUID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Submind_documentUUID_key" ON "Submind"("documentUUID");
