'use server'
import {auth} from "@/auth";
import {formatDate} from "@/lib/utils";
import { prisma } from "@/lib/utils"
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

    if (context) {
        console.log("")
        const extraData = await prisma.membership.findMany({
            where: {
                memberId: userId
            },
            include: {
                community: {
                    include: {
                        memberships: {
                            include: {
                                member: {
                                    include: {
                                        thoughts: true
                                    }
                                }
                            }
                        }
                    }
                },
            }
        })

        if (!extraData) return {
            ...context,
            thoughts: context.thoughts.map((thought) => {
                return {
                    ...thought,
                    createdAt: formatDate(thought.createdAt),
                }
            })
        }

        console.log("extraData", extraData)

        const thoughts = extraData.map((membership) => {
            return membership.community.memberships.map((membership) => {
                return membership.member.thoughts
            })
        }).flat(2)

        console.log("thoughts", thoughts)





        return {
            ...context,
            thoughts: thoughts.map((thought) => {
                return {
                    ...thought,
                    createdAt: formatDate(thought.createdAt),
                }
            })
        }
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
