-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_googleCalendarId_fkey";

-- AlterTable
ALTER TABLE "CalendarEvent" ALTER COLUMN "googleCalendarId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_googleCalendarId_fkey" FOREIGN KEY ("googleCalendarId") REFERENCES "GoogleCalendar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
