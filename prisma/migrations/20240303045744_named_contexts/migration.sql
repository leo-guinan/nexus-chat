/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,name]` on the table `Context` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Context` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Context` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Context" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Context_ownerId_name_key" ON "Context"("ownerId", "name");

-- AddForeignKey
ALTER TABLE "Context" ADD CONSTRAINT "Context_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
