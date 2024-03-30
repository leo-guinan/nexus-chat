/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId,stripeCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Subscription_userId_stripeSubscriptionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_stripeCustomerId_key" ON "Subscription"("stripeSubscriptionId", "stripeCustomerId");
