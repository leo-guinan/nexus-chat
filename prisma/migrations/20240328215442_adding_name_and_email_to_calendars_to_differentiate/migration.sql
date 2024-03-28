/*
  Warnings:

  - Added the required column `updatedAt` to the `GoogleCalendar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoogleCalendar" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
