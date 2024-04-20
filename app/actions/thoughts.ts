'use server'
import {auth} from "@/auth";
import {Pinecone} from "@pinecone-database/pinecone";
import md5 from "md5";
import {Document} from "@pinecone-database/doc-splitter";
import {chunkedUpsert} from "@/utils/chunkedUpsert";
import {Trigger} from "@prisma/client/edge";
import {formatDate, nanoid, prisma} from "@/lib/utils";
import {runTool} from "@/app/actions/tools";
import {embedDocument} from "@/app/actions/embeddings";
import {Thought} from "@/lib/types";
import {getEmbeddings} from "@/utils/embeddings";
import {cache} from "react"
export async function addThoughtToContext(contextId: number, thoughtContent: string, parentThoughtId?: number) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    console.log("parentThoughtId", parentThoughtId)
    const thoughtData = parentThoughtId ? {
        content: thoughtContent,
        uuid: nanoid(),
        owner: {
            connect: {
                id: session.user.id
            }
        },
        context: {
            connect: {
                id: contextId
            }
        },
        parent: {
            connect: {
                id: parentThoughtId
            }
        }
    } : {
        content: thoughtContent,
        uuid: nanoid(),
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

    console.log("thoughtData", thoughtData)

    const newThought = await prisma.thought.create({
        data: thoughtData
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
                type: 'thought',
                uuid: newThought.uuid,
                hash
            }
        })
        const vectors = [await embedDocument(doc)]

        // Upsert vectors into the Pinecone index
        await chunkedUpsert(index!, vectors, process.env.PINECONE_NAMESPACE as string, 10);

        const toolsToContext = await prisma.toolToContext.findMany({
            where: {
                contextId
            },
            include: {
                tool: true
            }
        });

        const defaultTools = await prisma.defaultTool.findMany({
            include: {
                tool: true
            }
        });

        (async function loop() {
            for (let i = 0; i < toolsToContext.length; i++) {
                const tool = toolsToContext[i].tool
                if (tool.triggers.includes(Trigger.THOUGHT)) {
                    await runTool(tool, newThought, session.user.id);
                }
            }
            for (let i = 0; i < defaultTools.length; i++) {
                const tool = defaultTools[i].tool
                if (tool.triggers.includes(Trigger.THOUGHT)) {
                    await runTool(tool, newThought, session.user.id);
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


export async function findRelatedThoughts(initialThoughts: Thought[], thingToDo: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const relatedThoughts = await findBestMatchedThoughts(thingToDo, session.user.id)
    console.log("relatedThoughts", relatedThoughts)

    if ('error' in relatedThoughts) {
        return {
            error: relatedThoughts.error
        }
    }


    return relatedThoughts.map((relatedThought) => {
        return {
            ...relatedThought,
            createdAt: formatDate(relatedThought.createdAt),
        }
    })
}

export async function filterThoughts(contextId: number, thoughtFilter: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const relatedThoughts = await findBestMatchedThoughts(thoughtFilter, session.user.id)

    if ('error' in relatedThoughts) {
        return {
            error: relatedThoughts.error
        }
    }


    console.log("relatedThoughts", relatedThoughts)
    return relatedThoughts.map((relatedThought) => {
        return {
            ...relatedThought,
            createdAt: formatDate(relatedThought.createdAt),
        }
    });
}

export async function findBestMatchedThoughts(filter: string, userId: string) {
    const pc = new Pinecone();
    const index = pc.index(process.env.PINECONE_INDEX as string).namespace(process.env.PINECONE_NAMESPACE as string);

    if (!index) {
        return {
            error: "No index"
        }
    }

    const lookupVector = await getEmbeddings(filter);

    const relatedThoughtVectors = await index.query({
        vector: lookupVector,
        topK: 20,
        includeMetadata: true,
        filter: {
            userId: {
                $eq: userId
            },
            type: {
                $eq: 'thought'
            }
        },
    });

    console.log("relatedThoughtVectors", relatedThoughtVectors)

    const relatedThoughts = []

    for (let i = 0; i < relatedThoughtVectors.matches.length; i++) {
        if (!relatedThoughtVectors.matches[i]?.score) {
            continue
        }
        // @ts-ignore - covered by if check above, not sure why ts isn't respecting that
        if (relatedThoughtVectors.matches[i].score > 0.8) {


            const thoughtId = relatedThoughtVectors.matches[i]?.metadata?.thoughtId
            const thought = await prisma.thought.findUnique({
                where: {
                    id: thoughtId as number,
                }
            })

            if (!thought) {
                continue
            }

            relatedThoughts.push(thought)
        }
    }

    return relatedThoughts
}

export const getThoughtsTwitterStyle =cache(async ()=> {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            thoughts: [],
            contextId: 0
        }
    }

    const thoughts = await prisma.thought.findMany({
        where: {
            ownerId: session.user.id,
            submind: {
                is: null
            }
        },
        include: {
            children: true,
            likes: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const contextId = thoughts.length > 0 ? thoughts[0].contextId : await prisma.context.findFirst({
        where: {
            ownerId: session.user.id
        }
    }).then(context => context?.id as number)


    return {
        thoughts: thoughts.map((thought) => {
            console.log("thought", thought)
            return {
                id: thought.id,
                content: thought.content,
                createdAt: formatDate(thought.createdAt),
                userId: thought.ownerId,
                contextId: thought.contextId,
                uuid: thought.uuid,
                source: thought.submindId ? "submind" : "user",
                likes: thought.likes.length,
                replies: thought.children.length,
                parentId: thought.parentId


            }
        }),
        contextId
    }


})

export async function getThoughtTwitterStyle(thoughtId: number) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            thoughts: [],
            contextId: 0
        }
    }

    const thought = await prisma.thought.findUnique({
        where: {
            id: thoughtId
        },
        include: {
            children: {
                include: {
                    children: true,
                    likes: true
                }
            },
            likes: true
        }
    })

    if (!thought) {
        return {
            thoughts: [],
            contextId: 0
        }
    }

    return {
        thoughts: [{
            id: thought.id,
            content: thought.content,
            createdAt: formatDate(thought.createdAt),
            userId: thought.ownerId,
            contextId: thought.contextId,
            uuid: thought.uuid,
            source: thought.submindId ? "submind" : "user",
            likes: thought.likes.length,
            replies: thought.children.length,
            parentId: thought.parentId
        }, ...thought.children.map((child) => {
            return {
                id: child.id,
                content: child.content,
                createdAt: formatDate(child.createdAt),
                userId: child.ownerId,
                contextId: child.contextId,
                uuid: child.uuid,
                source: child.submindId ? "submind" :"user",
                likes: child.likes.length,
                replies: child.children.length,
                parentId: child.parentId
            }
        })],
        contextId: thought.contextId
    }
}