/*
  Warnings:

  - A unique constraint covering the columns `[userId,stripeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_stripeSubscriptionId_key" ON "Subscription"("userId", "stripeSubscriptionId");
