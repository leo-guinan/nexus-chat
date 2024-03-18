'use server'
import { prisma } from "@/lib/utils"

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