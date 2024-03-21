/**
 * v0 by Vercel.
 * @see https://v0.dev/t/pfQS3G2ddHM
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card"
import {Task} from "@/lib/types";
import Link from "next/link";

interface TaskDetailsProps {
    task: Task

}

export default function TaskDetails({task}: TaskDetailsProps) {
    return (
        <div className="px-4 py-12 space-y-6 md:px-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{task.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">{task.description}</p>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Depends On</h2>
                <div className="space-y-4">
                    {task.dependsOn?.map((depends, index) => (
                        <Card key={`dependsOn_${depends.id}`}>
                            <CardContent className="flex items-start gap-4 p-4">
                                <div>
                                    <Link href={`/tasks/${depends.uuid}`} className="hover:underline">{depends.name}</Link>
                                    <CardDescription>{depends.description}</CardDescription>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Subtasks</h2>
                <div className="space-y-4">
                    {task.subtasks?.map((subtask, index) => (
                        <Card key={`subtask_${subtask.id}`}>
                            <CardContent className="flex items-start gap-4 p-4">
                                <div>
                                    <CardTitle>
                                        <Link href={`/tasks/${subtask.uuid}`} className="hover:underline">{subtask.name}</Link>
                                    </CardTitle>
                                    <CardDescription>{subtask.description}</CardDescription>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}


