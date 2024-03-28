"use server"
import {prisma} from "@/lib/utils";
import {findBestMatchedThoughts} from "@/app/(actions)/actions/thoughts";
import {findBestMatchedTasks} from "@/app/(actions)/actions/tasks";
import {summarizeThoughts} from "@/app/(actions)/actions/text";
import {auth} from "@/auth";

export async function createDailyPlan(contextName: string, goal: string) {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
        throw new Error('Unauthorized')
    }

    const relatedThoughts = await findBestMatchedThoughts(goal, userId)

    const relatedTasks = await findBestMatchedTasks(goal, userId)
    if ('error' in relatedThoughts) {
        throw new Error(relatedThoughts.error)
    }
    if ('error' in relatedTasks) {
        throw new Error(relatedTasks.error)
    }


    const summary = relatedThoughts.length > 0 ? await summarizeThoughts(relatedThoughts) : "It's a fresh day!"

    await prisma.context.create({
        data: {
            name: contextName,
            path: encodeURIComponent(contextName.toLowerCase()),
            goal: goal,
            details: summary,
            owner: {
                connect: {
                    id: userId
                }
            },
            thoughts: {
                connect: relatedThoughts.map((thought: any) => {
                    return {
                        id: thought.id
                    }
                })
            },
            tasks: {
                connect: relatedTasks.map((task: any) => {
                    return {
                        id: task.id
                    }
                })
            }
        }
    })


    return contextName
}