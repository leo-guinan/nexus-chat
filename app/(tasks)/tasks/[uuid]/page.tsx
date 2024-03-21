import {auth} from "@/auth";
import Tasks from "@/components/tasks/tasks";
import {getTaskDetails, getTasks} from "@/app/(actions)/actions/tasks";
import TaskDetails from "@/components/tasks/task-details";

export interface TaskPageProps {
    params: {
        uuid: string
    }
}

export default async function IndexPage({params}: TaskPageProps) {
    const session = await auth()

    if (!session) return null

    const task = await getTaskDetails(session.user.id, params.uuid)


    if ('error' in task) return null

    return <TaskDetails task={task}/>
}
