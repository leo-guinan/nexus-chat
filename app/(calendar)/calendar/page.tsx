import {auth} from "@/auth";
import CalendarComponent from "@/components/calendar/calendar";



export default async function CalendarPage() {

    const session = await auth()


    if (!session) return null;



    return (
        <CalendarComponent

        />
    )
}
