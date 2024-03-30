'use server'
import {nanoid, prisma} from "@/lib/utils"
import {getDocument} from "@/app/actions/documents";
import {auth} from "@/auth";
import {Task} from "@/lib/types";
import {Pinecone} from "@pinecone-database/pinecone";
import md5 from "md5";
import {Document} from "@pinecone-database/doc-splitter";
import {embedDocument} from "@/app/actions/embeddings";
import {chunkedUpsert} from "@/utils/chunkedUpsert";
import {getEmbeddings} from "@/utils/embeddings";

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


    const localTasks = await prisma.task.findMany({
        where: {
            ownerId: userId
        },
        include: {
            dependencies: true,
            dependantOn: true
        }
    })

    const tasksWithoutDependencies: Task[] = []
    await Promise.all(localTasks.map(async (task) => {
        const dependencies = await prisma.taskDependency.findMany({
            where: {
                dependentId: task.id
            }
        })
        if (dependencies.length === 0) {
            tasksWithoutDependencies.push({
                ...task,
                priority: 0
            })
        }
    }))

    console.log("localTasks", tasksWithoutDependencies)

    return [...jsonResults.tasks, ...tasksWithoutDependencies]


}

export async function prioritizeTasks(userId: string | null, taskPriorities: {
    task: Task;
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
    console.log(taskPriorities)
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

export async function generateTasksFromPlan(documentUUID: string, taskUUID: string) {
    console.log("documentUUID to generate with", documentUUID)
    const session = await auth()

    if (!session?.user?.id) {
        return false
    }

    const plan = await getDocument(documentUUID)

    const generateTasksTool = await prisma.tool.findUnique({
        where: {
            url_slug: {
                slug: "tasks",
                url: `${process.env.TASK_API_URL}/generate/`
            }

        }
    })

    console.log("generateTasksTool", generateTasksTool)

    if (!generateTasksTool) {
        return false
    }

    const status = await fetch(generateTasksTool?.url as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.TASK_API_KEY}`
        },
        body: JSON.stringify({
            plan
        })
    })
    const jsonResults = await status.json()
    const tasks = []

    const intent = await prisma.intent.findUnique({
        where: {
            documentUUID
        }
    })


    const parentTask = await prisma.task.create({
        data: {
            name: intent?.content ?? "",
            description: "",
            uuid: taskUUID,
            owner: {
                connect: {
                    id: session.user.id
                }
            }
        }
    })

    await Promise.all(jsonResults.tasks.map(async (task: {
            name: string,
            details: string,
            dependsOn: string[],
            subtasks: string[]
        }) => {
            const taskObject = await prisma.task.create({
                data: {
                    name: task.name,
                    description: task.details,
                    uuid: nanoid(),
                    owner: {
                        connect: {
                            id: session.user.id
                        }
                    }
                }
            })


            await prisma.taskDependency.create({
                data: {
                    dependsOn: {
                        connect: {
                            id: parentTask.id
                        }
                    },
                    dependent: {
                        connect: {
                            id: taskObject.id
                        }
                    }
                }
            })

            await embedTask(taskObject, session.user.id)


            tasks.push(taskObject)

            console.log("dependsOn", task.dependsOn)
            console.log("subtasks", task.subtasks)


        }
    ))
    console.log("status", jsonResults)
    return true

}

export async function getTaskDetails(userId: string, taskUUID: string) {
    let task = await prisma.task.findUnique({
        where: {
            uuid: taskUUID
        }
    })
    if (!task) {
        try {
            task = await getRemoteTask(userId, parseInt(taskUUID))
            if (!task) {
                return {
                    error: "Task not found"
                }
            }
            const newTask = await prisma.task.create({
                data: {
                    name: task.name,
                    description: task.description,
                    uuid: task.uuid,
                    owner: {
                        connect: {
                            id: userId
                        }
                    }
                }
            })

            await embedTask(newTask, userId)
        } catch (e) {
            return {
                error: "Task not found"
            }
        }


    }


    const dependents = await prisma.taskDependency.findMany({
        where: {
            dependsOnId: task.id
        },
        include: {
            dependent: true

        }
    })

    const dependsOn = await prisma.taskDependency.findMany({
        where: {
            dependentId: task.id
        },
        include: {
            dependsOn: true
        }
    })

    return {
        ...{
            ...task,
            subtasks: dependents.map(dependent => {
                return {
                    ...dependent.dependent,
                    priority: 0
                }
            }),
            dependsOn: dependsOn.map(dependsOn => {
                return {
                    ...dependsOn.dependsOn,
                    priority: 0
                }
            })
        },
        priority: 0

    }


}

export async function getRemoteTask(userId: string, taskId: number) {
    const taskTool = await prisma.tool.findUnique({
        where: {
            url_slug: {
                slug: "tasks",
                url: `${process.env.TASK_API_URL}/get/`
            }

        }
    })

    console.log("taskTool", taskTool)

    if (!taskTool || !userId) {
        return []
    }

    const task = await fetch(taskTool?.url as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.TASK_API_KEY}`
        },
        body: JSON.stringify({
            user_id: userId,
            task_id: taskId,
            uuid: nanoid()
        })
    })
    const jsonResults = await task.json()

    return jsonResults.task
}

export async function embedTask(task: Task, userId: string) {
    const pc = new Pinecone();
    const index = pc.index(process.env.PINECONE_INDEX as string);
    const taskContent = `${task.name}: ${task.description}`
    const hash = md5(taskContent);
    const doc = new Document({
        pageContent: taskContent,
        metadata: {
            taskId: task.id,
            userId: userId,
            uuid: task.uuid,
            hash,
            type: 'task'
        }
    })
    const vectors = [await embedDocument(doc)]
    await chunkedUpsert(index!, vectors, process.env.PINECONE_NAMESPACE as string, 10);
}

export async function findBestMatchedTasks(filter: string, userId: string) {
    const pc = new Pinecone();
    const index = pc.index(process.env.PINECONE_INDEX as string).namespace(process.env.PINECONE_NAMESPACE as string);

    if (!index) {
        return {
            error: "No index"
        }
    }

    const lookupVector = await getEmbeddings(filter);

    const relatedTaskVectors = await index.query({
        vector: lookupVector,
        topK: 20,
        includeMetadata: true,
        filter: {
            userId: {
                $eq: userId
            },
            type: {
                $eq: 'task'
            }
        },
    });
    const relatedTasks = []

    for (let i = 0; i < relatedTaskVectors.matches.length; i++) {
        if (!relatedTaskVectors.matches[i]?.score) {
            continue
        }
        // @ts-ignore - covered by if check above, not sure why ts isn't respecting that
        if (relatedTaskVectors.matches[i].score > 0.75) {


            const taskId = relatedTaskVectors.matches[i]?.metadata?.taskId
            const task = await prisma.task.findUnique({
                where: {
                    id: taskId as number,
                }
            })

            if (!task) {
                continue
            }

            relatedTasks.push(task)
        }
    }

    return relatedTasks

}