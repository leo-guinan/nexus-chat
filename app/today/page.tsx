import {ThoughtContext} from "@/components/thought-context";
import {auth} from "@/auth";
import {getLimitedContext} from "@/app/(actions)/actions/contexts";
import {formatToday} from "@/lib/utils";
import {TodayContext} from "@/components/today/today-context";
import StartDay from "@/components/today/start-day";

export default async function IndexPage() {
    const session = await auth()

    if (!session) return null

    const today = new Date()

    const formattedDate = formatToday(today)

    const context = await getLimitedContext(formattedDate, session.user.id)


    if (!context) {
        return (
            <StartDay contextName={formattedDate}/>
        )
    }


    if ('error' in context) return null

    return <TodayContext contextId={context.id} contextName={context.name} initialThoughts={context.thoughts} initialTasks={context.tasks}/>
}
