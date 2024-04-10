/*
  Warnings:

  - You are about to drop the column `onboardingChatId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Onboarding` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "onboardingChatId";

-- DropTable
DROP TABLE "Onboarding";

-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "step" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChat" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardingStepId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "chatUUID" TEXT NOT NULL,

    CONSTRAINT "OnboardingChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingChat_userId_onboardingStepId_key" ON "OnboardingChat"("userId", "onboardingStepId");

-- AddForeignKey
ALTER TABLE "OnboardingChat" ADD CONSTRAINT "OnboardingChat_onboardingStepId_fkey" FOREIGN KEY ("onboardingStepId") REFERENCES "OnboardingStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChat" ADD CONSTRAINT "OnboardingChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
