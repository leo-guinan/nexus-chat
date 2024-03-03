/*
  Warnings:

  - You are about to drop the column `externalId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_externalId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "externalId";
