-- CreateTable
CREATE TABLE "GoogleCalendar" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenType" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" SERIAL NOT NULL,
    "googleCalendarId" INTEGER NOT NULL,
    "googleEventId" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT,
    "location" TEXT,
    "status" TEXT,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendar_userId_accessToken_key" ON "GoogleCalendar"("userId", "accessToken");

-- CreateIndex
CREATE INDEX "CalendarEvent_googleCalendarId_idx" ON "CalendarEvent"("googleCalendarId");

-- AddForeignKey
ALTER TABLE "GoogleCalendar" ADD CONSTRAINT "GoogleCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_googleCalendarId_fkey" FOREIGN KEY ("googleCalendarId") REFERENCES "GoogleCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
