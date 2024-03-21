'use server'

import {MongoClient} from "mongodb";
import {nanoid, prisma} from "@/lib/utils";
import {Thought} from "@/lib/types";
import {auth} from "@/auth";

export async function getDocument(documentId: string) {

    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const getDocumentTool = await prisma.tool.findUnique({
        where: {
            url_slug: {
                slug: "documents",
                url: `${process.env.DOCUMENT_API_URL}/get/`
            }

        }
    })

    console.log("getDocumentTool", getDocumentTool)

    if (!getDocumentTool) {
        return {
            error: "No tool matching that url"
        }
    }

    const status = await fetch(getDocumentTool?.url as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.TASK_API_KEY}`
        },
        body: JSON.stringify({
            user_id: session.user.id,
            uuid: documentId
        })
    })
    const jsonResults = await status.json()
    console.log("status", jsonResults)
    return jsonResults

}

export async function saveDocument({content, documentId, userId}: {
    content: string,
    documentId: string | null,
    userId: string
}) {

    // does a document with that id exist? should it always?
    const client = await MongoClient.connect(process.env.MONGO_URL as string);
    const db = client.db('myaicofounder');
    const collection = db.collection('documents');


    if (documentId) {
        // doing it this way to make sure if we pass in an existing id, it's a valid id.
        const existingDocument = await collection.findOne({uuid: documentId, userId});
        if (!existingDocument) {
            throw new Error('Document not found')
        }
        await collection.updateOne({uuid: documentId, userId}, {$set: {content, updatedAt: new Date()}});
    } else {
        await collection.insertOne({content, createdAt: new Date(), userId, uuid: nanoid()});
    }

    await client.close();
    return {
        documentId,
        content
    }

}


export async function createDocument(userId: string, content: string) {
    const client = await MongoClient.connect(process.env.MONGO_URL as string);
    const db = client.db('myaicofounder');
    const collection = db.collection('documents');
    const uuid = nanoid();
    await collection.insertOne({content, createdAt: new Date(), userId, uuid});

    await client.close();
    return {
        documentId: uuid,
        content
    }
}

export async function generateDocument(thoughts: Thought[], intent: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const content = `Intent: ${intent} \n\n Relevant Thoughts: \n` + thoughts.map(t => t.content).join("\n")

    const generateDocumentTool = await prisma.tool.findUnique({
        where: {
            url_slug: {
                slug: "documents",
                url: `${process.env.DOCUMENT_API_URL}/generate/`
            }

        }
    })

    console.log("generateDocumentTool", generateDocumentTool)

    if (!generateDocumentTool) {
        return {
            error: "No tool matching that url"
        }
    }

    const status = await fetch(generateDocumentTool?.url as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.TASK_API_KEY}`
        },
        body: JSON.stringify({
            user_id: session.user.id,
            uuid: nanoid(),
            prompt: content
        })
    })
    const jsonResults = await status.json()
    console.log("status", jsonResults)

    await prisma.intent.create({
        data: {
            content: intent,
            documentUUID: jsonResults.uuid,
            owner: {
                connect: {
                    id: session.user.id
                }
            }
        }
    })


    return jsonResults

}
