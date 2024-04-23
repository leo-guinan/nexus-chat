'use server'
import {prisma} from "@/lib/utils"
import {Pinecone} from "@pinecone-database/pinecone";
import md5 from "md5";
import {Document} from "@pinecone-database/doc-splitter";
import {embedDocument} from "@/app/actions/embeddings";
import {chunkedUpsert} from "@/utils/chunkedUpsert";



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

export async function userHasPrelo(userId?: string | null) {
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

    return user.preloSubmindId !== null
}

export async function getStats() {

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


export async function embedExistingTasks() {
    const tasks = await prisma.task.findMany({})

    const pc = new Pinecone();
    const index = pc.index(process.env.PINECONE_INDEX as string);


    (async function loop() {
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i]
            const taskContent = `${task.name}: ${task.description}`
            const hash = md5(taskContent);
            const doc = new Document({
                pageContent: taskContent,
                metadata: {
                    taskId: task.id,
                    userId: task.ownerId,
                    uuid: task.uuid,
                    hash,
                    type: 'task'
                }
            })
            const vectors = [await embedDocument(doc)]
            await chunkedUpsert(index!, vectors, process.env.PINECONE_NAMESPACE as string, 10);
        }
    })();


    console.log("tasks", tasks)
    return tasks
}

export async function queryPodcasts(query: string) {
    const res = await fetch('http://localhost:8000/api/podcast/find/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Key ${process.env.API_KEY}`
                },
                body: JSON.stringify({query}),
            });

    const data = await res.json()
    console.log("data", data)
    return data
}