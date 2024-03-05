/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Tool` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Tool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
