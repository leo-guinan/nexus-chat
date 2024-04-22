/*
  Warnings:

  - Made the column `clientId` on table `PreloClient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PreloClient" ALTER COLUMN "clientId" SET NOT NULL,
ALTER COLUMN "clientId" SET DEFAULT 1;
