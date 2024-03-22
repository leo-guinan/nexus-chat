'use server'
import {auth} from "@/auth";
import {Pinecone} from "@pinecone-database/pinecone";
import md5 from "md5";
import {Document} from "@pinecone-database/doc-splitter";
import {chunkedUpsert} from "@/utils/chunkedUpsert";
import {Trigger} from "@prisma/client/edge";
import {formatDate, nanoid, prisma} from "@/lib/utils";
import {runTool} from "@/app/(actions)/actions/tools";
import {embedDocument} from "@/app/(actions)/actions/embeddings";
import {Thought} from "@/lib/types";
import {getEmbeddings} from "@/utils/embeddings";

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

    const pc = new Pinecone();
    const index = pc.index(process.env.PINECONE_INDEX as string).namespace('myaicofounderv2');

    if (!index) {
        return {
            error: "No index"
        }
    }

    const lookupDocument = "I want to " + thingToDo + ". Here are some thoughts I have about it: " + initialThoughts.map(t => t.content).join("\n")

    const lookupVector = await getEmbeddings(lookupDocument);


    const relatedThoughtVectors = await index.query({
        vector: lookupVector,
        topK: 5,
        includeMetadata: true,
        filter: {
            userId: {
                $eq: session.user.id
            }
        },
    });

    console.log("relatedThoughtVectors", relatedThoughtVectors)

    const relatedThoughts = []

    for (let i = 0; i < relatedThoughtVectors.matches.length; i++) {
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


    console.log("relatedThoughts", relatedThoughts)


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

    const pc = new Pinecone();
    const index = pc.index(process.env.PINECONE_INDEX as string).namespace('myaicofounderv2');

    if (!index) {
        return {
            error: "No index"
        }
    }

    const lookupVector = await getEmbeddings(thoughtFilter);

    const relatedThoughtVectors = await index.query({
        vector: lookupVector,
        topK: 5,
        includeMetadata: true,
        filter: {
            userId: {
                $eq: session.user.id
            }
        },
    });

    console.log("relatedThoughtVectors", relatedThoughtVectors)

    const relatedThoughts = []

    for (let i = 0; i < relatedThoughtVectors.matches.length; i++) {
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

    console.log("relatedThoughts", relatedThoughts)
    return relatedThoughts.map((relatedThought) => {
        return {
            ...relatedThought,
            createdAt: formatDate(relatedThought.createdAt),
        }
    });
}