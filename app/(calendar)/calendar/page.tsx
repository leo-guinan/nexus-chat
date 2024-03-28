import {auth} from "@/auth";
import CalendarComponent from "@/components/calendar/calendar";
import {getCalendarsAndEvents} from "@/app/(actions)/actions/calendar";


export default async function CalendarPage() {

    const session = await auth()

    if (!session) return null;

    const results = await getCalendarsAndEvents()
    if ('error' in results ) return null;
    const {calendars, events} = results

    return (
        <CalendarComponent
            calendars={calendars} events={events}
        />
    )
}
