'use server'
import {formatDate, nanoid} from '@/lib/utils'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {kv} from '@vercel/kv'

import {auth} from '@/auth'
import {type Chat} from '@/lib/types'
import {PrismaClient, Trigger} from "@prisma/client/edge";
import {withAccelerate} from "@prisma/extension-accelerate";
import {Pinecone, PineconeRecord} from '@pinecone-database/pinecone'
import {Document, MarkdownTextSplitter, RecursiveCharacterTextSplitter} from "@pinecone-database/doc-splitter";
import {getEmbeddings} from "@/utils/embeddings";
import md5 from "md5";
import {chunkedUpsert} from "@/utils/chunkedUpsert";
import {matchThought} from "@/utils/openai/match-thought";

const prisma = new PrismaClient().$extends(withAccelerate())

export async function getChats(userId?: string | null) {
    if (!userId) {
        return []
    }

    try {
        const pipeline = kv.pipeline()
        const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
            rev: true
        })

        for (const chat of chats) {
            pipeline.hgetall(chat)
        }

        const results = await pipeline.exec()

        return results as Chat[]
    } catch (error) {
        return []
    }
}

export async function getChat(id: string, userId: string) {
    const chat = await kv.hgetall<Chat>(`chat:${id}`)

    if (!chat || (userId && chat.userId !== userId)) {
        return null
    }

    return chat
}

export async function removeChat({id, path}: { id: string; path: string }) {
    const session = await auth()

    if (!session) {
        return {
            error: 'Unauthorized'
        }
    }

    //Convert uid to string for consistent comparison with session.user.id
    const uid = String(await kv.hget(`chat:${id}`, 'userId'))

    if (uid !== session?.user?.id) {
        return {
            error: 'Unauthorized'
        }
    }

    await kv.del(`chat:${id}`)
    await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

    revalidatePath('/')
    return revalidatePath(path)
}

export async function clearChats() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: 'Unauthorized'
        }
    }

    const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
    if (!chats.length) {
        return redirect('/')
    }
    const pipeline = kv.pipeline()

    for (const chat of chats) {
        pipeline.del(chat)
        pipeline.zrem(`user:chat:${session.user.id}`, chat)
    }

    await pipeline.exec()

    revalidatePath('/')
    return redirect('/')
}

export async function getSharedChat(id: string) {
    const chat = await kv.hgetall<Chat>(`chat:${id}`)

    if (!chat || !chat.sharePath) {
        return null
    }

    return chat
}

export async function shareChat(id: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: 'Unauthorized'
        }
    }

    const chat = await kv.hgetall<Chat>(`chat:${id}`)

    if (!chat || chat.userId !== session.user.id) {
        return {
            error: 'Something went wrong'
        }
    }

    const payload = {
        ...chat,
        sharePath: `/share/${chat.id}`
    }

    await kv.hmset(`chat:${chat.id}`, payload)

    return payload
}


export async function getContext(contextName: string, userId: string) {
    const session = await auth()
    console.log("getContext Session", session)
    if (!session?.user?.id) {
        return {
            error: 'Unauthorized'
        }
    }
    const context = await prisma.context.findUnique({
        where: {
            ownerId_name: {
                ownerId: userId,
                name: contextName
            }
        },
        include: {
            thoughts: true
        }
    })

    if (context) return {
        ...context,
        thoughts: context.thoughts.map((thought) => {
            return {
                ...thought,
                createdAt: formatDate(thought.createdAt),
            }
        })
    }

    const newContext = await prisma.context.create({
        data: {
            name: contextName,
            path: encodeURIComponent(contextName.toLowerCase()),
            owner: {
                connect: {
                    id: userId
                }
            }
        }
    })

    //if new context, add tools to context
    const tools = await prisma.tool.findMany()

    for (const tool of tools) {
        await prisma.toolToContext.create({
            data: {
                context: {
                    connect: {
                        id: newContext.id
                    }
                },
                tool: {
                    connect: {
                        id: tool.id
                    }
                }
            }
        })
    }

    return {
        ...newContext,
        thoughts: []
    }


}

export async function getContexts(userId?: string | null) {

    if (!userId) {
        return []
    }

    const contexts = await prisma.context.findMany({
        where: {
            ownerId: userId
        },
        include: {
            thoughts: true
        }
    })

    if (contexts.length > 0) return contexts.map((context) => {
        return {
            ...context,
        }
    })

    const context = await prisma.context.create({
        data: {
            name: "Default",
            path: "default",
            owner: {
                connect: {
                    id: userId
                }
            }
        }
    })

    return [{
        ...context,
        thoughts: [],
    }]


}

export async function getMostRecentContext(userId: string) {
    if (!userId) {
        return {
            error: "Unauthorized"
        }
    }

    const context = await prisma.context.findFirst({
        where: {
            ownerId: userId
        },
        include: {
            thoughts: true
        }
    })

    if (context) return context
    const newContext = await prisma.context.create({
        data: {
            name: "Default",
            path: "default",
            owner: {
                connect: {
                    id: userId
                }
            }
        }
    })
    return {
        ...newContext,
        thoughts: []
    }
}

type DocumentSplitter = RecursiveCharacterTextSplitter | MarkdownTextSplitter

async function embedDocument(doc: Document): Promise<PineconeRecord> {
    try {
        // Generate OpenAI embeddings for the document content
        const embedding = await getEmbeddings(doc.pageContent);

        // Create a hash of the document content
        const hash = md5(doc.pageContent);

        // Return the vector embedding object
        return {
            id: hash, // The ID of the vector is the hash of the document content
            values: embedding, // The vector values are the OpenAI embeddings
            metadata: { // The metadata includes details about the document
                chunk: doc.pageContent, // The chunk of text that the vector represents
                text: doc.metadata.text as string, // The text of the document
                url: doc.metadata.url as string, // The URL where the document was found
                hash: doc.metadata.hash as string // The hash of the document content
            }
        } as PineconeRecord;
    } catch (error) {
        console.log("Error embedding document: ", error)
        throw error
    }
}

type ThoughtMetadata = {
    thoughtId: number
    contextId: number
    userId: string
    hash: string

}

type Tool = {
    id: number
    name: string
    slug: string
    description?: string | null
    url: string
    pattern?: string | null
}

async function doesThoughtMatchPattern(thought: string, pattern: string) {
    return await matchThought(thought, pattern)
}

async function runTool(tool: Tool, thought: string, userId: string) {
    if (tool.pattern) {
        console.log("Pattern exists, checking against it")

        const matchesPattern = await doesThoughtMatchPattern(thought, tool.pattern)
        console.log(`${tool.name} matches pattern: ${matchesPattern}`)
        if (matchesPattern) {
            await fetch(tool.url, {
                body: JSON.stringify({message: thought, user_id: userId}),
                method: "POST"
            })
        }
        return

    }


    await fetch(tool.url, {
        body: JSON.stringify({message: thought, user_id: userId}),
        method: "POST"
    })

}

export async function addThoughtToContext(contextId: number, thoughtContent: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const newThought = await prisma.thought.create({
        data: {
            content: thoughtContent,
            owner: {
                connect: {
                    id: session.user.id
                }
            },
            context: {
                connect: {
                    id: contextId
                }
            }
        }
    })

    try {
        const pc = new Pinecone();
        const index = pc.index(process.env.PINECONE_INDEX as string);

        if (!index) {
            await pc.createIndex({
                name: process.env.PINECONE_INDEX as string,
                dimension: 1536,
                waitUntilReady: true,
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-west-2',
                    },
                },
            });
        }

        const hash = md5(thoughtContent);


        // Get the vector embeddings for the documents
        const doc = new Document({
            pageContent: thoughtContent,
            metadata: {
                thoughtId: newThought.id,
                contextId,
                userId: session.user.id,
                hash
            }
        })
        const vectors = [await embedDocument(doc)]

        // Upsert vectors into the Pinecone index
        await chunkedUpsert(index!, vectors, 'myaicofounderv2', 10);

        const toolsToContext = await prisma.toolToContext.findMany({
            where: {
                contextId
            },
            include: {
                tool: true
            }
        });

        (async function loop() {
            for (let i = 0; i < toolsToContext.length; i++) {
                const tool = toolsToContext[i].tool
                if (tool.triggers.includes(Trigger.THOUGHT)) {
                    await runTool(tool, thoughtContent, session.user.id);
                }
            }
        })();

    } catch (error) {
        console.error("Error seeding:", error);
        throw error;
    }
    const createdThought = {
        ...newThought,
        createdAt: formatDate(newThought.createdAt),
    }

    console.log("createdThought", createdThought)
    return createdThought

}

export async function getTool(slug: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const currentUser = await prisma.user.findFirst({
        where: {
            id: session.user.id
        }
    })

    if (!currentUser || currentUser.role !== 'admin') {
        return {
            error: "Unauthorized"
        }
    }

    return {
        name: slug,
        slug,
        description: slug,
        url: "http://localhost:8000/url/to/tool",
    }
}

export async function getTools() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const currentUser = await prisma.user.findFirst({
        where: {
            id: session.user.id
        }
    })

    if (!currentUser || currentUser.role !== 'admin') {
        return {
            error: "Unauthorized"
        }
    }

    return await prisma.tool.findMany()

}

export async function addTool(name: string, description: string, url: string, pattern: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const currentUser = await prisma.user.findFirst({
        where: {
            id: session.user.id
        }
    })

    if (!currentUser || currentUser.role !== 'admin') {
        return {
            error: "Unauthorized"
        }
    }
    let slug = encodeURIComponent(name)


    let slugMatchingName = await prisma.tool.findFirst({
        where: {
            slug
        }
    })

    while (slugMatchingName) {
        const newSlug = encodeURIComponent(name + nanoid())
        slugMatchingName = await prisma.tool.findFirst({
            where: {
                slug: newSlug
            }
        })
        if (!slugMatchingName) {
            slug = newSlug
        }
    }

    const newTool = await prisma.tool.create({
        data: {
            name,
            description,
            url,
            pattern,
            slug
        }
    })

    if (newTool) {
        return {
            status: "Success"
        }
    }

    return {
        status: "Error"
    }
}

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


export async function isUserAdmin(userId?: string | null) {
    if (!userId) {
        return false
    }

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        }
    })

    if (!user) {
        return false
    }

    return user.role === 'admin'
}

export async function getStats() {
    // example stats array
    //const stats = [
    //   { id: 1, name: 'Total Subscribers', stat: '71,897', icon: UsersIcon, change: '122', changeType: 'increase' },
    //   { id: 2, name: 'Avg. Open Rate', stat: '58.16%', icon: EnvelopeOpenIcon, change: '5.4%', changeType: 'increase' },
    //   { id: 3, name: 'Avg. Click Rate', stat: '24.57%', icon: CursorArrowRaysIcon, change: '3.2%', changeType: 'decrease' },
    // ]
    //
    // const previousTotalTasks =  await prisma.$queryRaw`
    // SELECT COUNT(*) as totalTasks FROM "Task" where "createdAt" < NOW() - INTERVAL '7 days';
    // `
    // console.log("previousTotalTasks", previousTotalTasks)

    const previousTotalUsers = await prisma.$queryRaw`
        SELECT COUNT(*) as totalUsers
        FROM "User"
        where "createdAt" < NOW() - INTERVAL '7 days';
    `
    console.log("previousTotalUsers", previousTotalUsers)

    const previousTotalThoughts = await prisma.$queryRaw`
        SELECT COUNT(*) as totalThoughts
        FROM "Thought"
        where "createdAt" < NOW() - INTERVAL '7 days';
    `
    console.log("previousTotalThoughts", previousTotalThoughts)


    // const currentTotalTasks =  await prisma.$queryRaw`
    // SELECT COUNT(*) as totalTasks FROM "Task" where "createdAt" > NOW() - INTERVAL '7 days';
    // `
    // console.log("currentTotalTasks", currentTotalTasks)

    const currentTotalUsers = await prisma.$queryRaw`
        SELECT COUNT(*) as totalUsers
        FROM "User"
        where "createdAt" > NOW() - INTERVAL '7 days';
    `

    console.log("currentTotalUsers", currentTotalUsers)

    const currentTotalThoughts = await prisma.$queryRaw`
        SELECT COUNT(*) as totalThoughts
        FROM "Thought"
        where "createdAt" > NOW() - INTERVAL '7 days';
    `

    console.log("currentTotalThoughts", currentTotalThoughts)

    // @ts-ignore
    console.log("trying conversion", Number(previousTotalUsers[0].totalusers))

    const previousStats = {
        // @ts-ignore
        totalUsers: Number(previousTotalUsers[0].totalusers),
        // @ts-ignore
        totalThoughts: Number(previousTotalThoughts[0].totalthoughts),
        // @ts-ignore
        // totalTasks: previousTotalTasks[0].totalTasks
    }


    const currentStats = {
        // @ts-ignore
        totalUsers: Number(currentTotalUsers[0].totalusers),
        // @ts-ignore
        totalThoughts: Number(currentTotalThoughts[0].totalthoughts),
        // @ts-ignore
        // totalTasks: currentTotalTasks[0].totalTasks
    }

    console.log("previousStats", previousStats)
    console.log("currentStats", currentStats)


    const stats = [
        {
            id: 1,
            name: 'Total Users',
            stat: currentStats.totalUsers,
            change: currentStats.totalUsers - previousStats.totalUsers,
            changeType: currentStats.totalUsers - previousStats.totalUsers > 0 ? 'increase' : 'decrease'
        },
        {
            id: 2,
            name: 'Total Thoughts',
            stat: currentStats.totalThoughts,
            change: currentStats.totalThoughts - previousStats.totalThoughts,
            changeType: currentStats.totalThoughts - previousStats.totalThoughts > 0 ? 'increase' : 'decrease'
        },
        // {
        //     id:3,
        //     name: 'Total Tasks',
        //     // @ts-ignore
        //     stat: currentStats[2].totalTasks,
        //     // @ts-ignore
        //     change: currentStats[2].totalTasks - previousStats[2].totalTasks,
        //     // @ts-ignore
        //     changeType: currentStats[2].totalTasks - previousStats[2].totalTasks > 0 ? 'increase' : 'decrease'
        // }
    ]
    console.log("stats", stats)
    return stats


}