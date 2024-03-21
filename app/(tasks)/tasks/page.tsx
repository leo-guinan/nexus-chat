import {auth} from "@/auth";
import Tasks from "@/components/tasks/tasks";
import {getTaskDetails, getTasks} from "@/app/(actions)/actions/tasks";




export default async function IndexPage() {
    const session = await auth()

    if (!session) return null

    const tasks = await getTasks(session.user.id)


    if ('error' in tasks) return null

    return <Tasks initialTasks={tasks} userId={session.user.id}/>
}
