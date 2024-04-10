/*
  Warnings:

  - You are about to drop the `OnboardingChat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OnboardingStep` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OnboardingChat" DROP CONSTRAINT "OnboardingChat_onboardingStepId_fkey";

-- DropForeignKey
ALTER TABLE "OnboardingChat" DROP CONSTRAINT "OnboardingChat_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingChatUUID" TEXT;

-- DropTable
DROP TABLE "OnboardingChat";

-- DropTable
DROP TABLE "OnboardingStep";
