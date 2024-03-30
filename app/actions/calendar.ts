'use server'
import {auth} from "@/auth";
import {prisma} from "@/lib/utils";

export async function getCalendarsAndEvents() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const calendars = await prisma.googleCalendar.findMany({
        where: {
            userId: session.user.id
        }
    })

    const calendarIds = calendars.map(calendar => calendar.id)

    const events = await prisma.calendarEvent.findMany({
        where: {
            googleCalendarId: {
                in: calendarIds
            }
        }
    })

    return {
        calendars,
        events
    }
}