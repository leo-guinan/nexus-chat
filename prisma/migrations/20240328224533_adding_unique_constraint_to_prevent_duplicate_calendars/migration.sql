/*
  Warnings:

  - A unique constraint covering the columns `[userId,email]` on the table `GoogleCalendar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendar_userId_email_key" ON "GoogleCalendar"("userId", "email");
