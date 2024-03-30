import {auth} from "@/auth";
import CalendarComponent from "@/components/calendar/calendar";
import {getCalendarsAndEvents} from "@/app/actions/calendar";
import Upgrade from "@/components/upgrade/upgrade";
import {isUserPremium} from "@/app/actions/users";


export default async function CalendarPage() {

    const session = await auth()

    if (!session) return null;

    const results = await getCalendarsAndEvents()
    if ('error' in results ) return null;
    const {calendars, events} = results

    const premium = await isUserPremium()

    if (!premium) {
        return <Upgrade premium={premium} />
    }

    return (
        <CalendarComponent
            calendars={calendars} events={events}
        />
    )
}
