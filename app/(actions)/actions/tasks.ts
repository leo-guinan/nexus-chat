'use server'
import { prisma } from "@/lib/utils"

export async function getTasks(userId?: string | null) {
    const taskTool = await prisma.tool.findUnique({
        where: {
            url_slug: {
                slug: "tasks",
                url: `${process.env.TASK_API_URL}/list/`
            }

        }
    })

    console.log("taskTool", taskTool)

    if (!taskTool || !userId) {
        return []
    }

    const tasks = await fetch(taskTool?.url as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.TASK_API_KEY}`
        },
        body: JSON.stringify({
            user_id: userId
        })
    })
    const jsonResults = await tasks.json()
    console.log("taskResults", jsonResults)
    return jsonResults.tasks


}

export async function prioritizeTasks(userId: string | null, taskPriorities: {
    taskId: number;
    priority: number;
}[]) {
    const prioritizeTasksTool = await prisma.tool.findUnique({
        where: {
            url_slug: {
                slug: "tasks",
                url: `${process.env.TASK_API_URL}/prioritize/`
            }

        }
    })

    console.log("prioritizeTasksTool", prioritizeTasksTool)

    if (!prioritizeTasksTool || !userId) {
        return []
    }

    const status = await fetch(prioritizeTasksTool?.url as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.TASK_API_KEY}`
        },
        body: JSON.stringify({
            user_id: userId,
            task_priorities: taskPriorities
        })
    })
    const jsonResults = await status.json()
    console.log("status", jsonResults)
    return true


}

export async function completeTask(userId: string, taskId: number) {
    const completeTaskTool = await prisma.tool.findUnique({
        where: {
            url_slug: {
                slug: "tasks",
                url: `${process.env.TASK_API_URL}/complete/`
            }

        }
    })

    console.log("completeTaskTool", completeTaskTool)

    if (!completeTaskTool || !userId) {
        return false
    }

    const status = await fetch(completeTaskTool?.url as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.TASK_API_KEY}`
        },
        body: JSON.stringify({
            user_id: userId,
            task_id: taskId
        })
    })
    const jsonResults = await status.json()
    console.log("status", jsonResults)
    return true
}