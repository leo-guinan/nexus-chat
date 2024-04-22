/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `PreloClient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uuid` to the `PreloClient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PreloClient" ADD COLUMN     "uuid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PreloClient_uuid_key" ON "PreloClient"("uuid");
