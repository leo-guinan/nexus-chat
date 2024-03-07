'use server'
import {nanoid} from '@/lib/utils'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {kv} from '@vercel/kv'

import {auth} from '@/auth'
import {type Chat} from '@/lib/types'
import {PrismaClient} from "@prisma/client/edge";
import {withAccelerate} from "@prisma/extension-accelerate";
import {Pinecone, PineconeRecord} from '@pinecone-database/pinecone'
import {Document, MarkdownTextSplitter, RecursiveCharacterTextSplitter} from "@pinecone-database/doc-splitter";
import {getEmbeddings} from "@/utils/embeddings";
import md5 from "md5";
import {chunkedUpsert} from "@/utils/chunkedUpsert";

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
}

async function runTool(tool: Tool, thought: string, userId: string) {

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
                await runTool(tool, thoughtContent, session.user.id);
            }
        })();

    } catch (error) {
        console.error("Error seeding:", error);
        throw error;
    }

    return {
        status: "success"
    }

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
    // need to make slug url-safe...

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