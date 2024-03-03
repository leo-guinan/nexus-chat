'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {kv} from '@vercel/kv'

import {auth} from '@/auth'
import {type Chat} from '@/lib/types'
import {PrismaClient} from "@prisma/client/edge";
import {withAccelerate} from "@prisma/extension-accelerate";

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

    if (context) return context

    const newContext = await prisma.context.create({
        data: {
            name: contextName,
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
            path: `/context/${context.id}`
        }
    })

    const context = await prisma.context.create({
        data: {
            name: "Default",
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
        path: `/context/${context.id}`
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

    return {
        status: "success"
    }

}