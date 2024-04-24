'use server'

import {MongoClient} from "mongodb";
import {nanoid, prisma} from "@/lib/utils";
import {Thought} from "@/lib/types";
import {auth} from "@/auth";

export async function getDocument(documentId: string, dbName = "myaicofounder", collectionName = "documents") {

    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const client = await MongoClient.connect(process.env.MONGO_URL as string);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const document = await collection.findOne({uuid: documentId, userId: session.user.id});
    if (!document) {
        return {
            error: "Document not found"
        }
    }
    await client.close();
    return document;

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
    const sentUUID = nanoid()

    console.log("UUID pre sending", sentUUID)

    const status = await fetch(generateDocumentTool?.url as string, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.TASK_API_KEY}`
        },
        body: JSON.stringify({
            user_id: session.user.id,
            uuid: sentUUID,
            prompt: content
        })
    })
    const jsonResults = await status.json()
    console.log("status", jsonResults)

    console.log("UUID post sending", jsonResults.uuid)

    await prisma.intent.create({
        data: {
            content: intent,
            documentUUID: jsonResults.uuid,
            owner: {
                connect: {
                    id: session.user.id
                }
            },
            thoughts: {
                connect: thoughts.map(t => {
                    return {
                        id: t.id
                    }
                })
            }
        }
    })


    return jsonResults

}
//  historical_uuid = str(uuid.uuid4())
//     previous_doc = db.documents.find_one({"uuid": document_uuid})
//
//     db.document_history.insert_one({
//         "uuid": historical_uuid,
//         "content": previous_doc["content"],
//         "createdAt": previous_doc["createdAt"],
//         "documentUUID": previous_doc["uuid"]
//     })
//     db.documents.update_one({"uuid": document_uuid}, {"$set": {"content": content, "previousVersion": historical_uuid, "updatedAt": datetime.now()}})

export async function updateDocument(documentUUID: string, content: string) {
    const client = await MongoClient.connect(process.env.MONGO_URL as string);
    const db = client.db('myaicofounder');
    const collection = db.collection('documents');
    const existingDocument = await getDocument(documentUUID)
    if (!existingDocument || 'error' in existingDocument) {
        throw new Error('Document not found')
    }

    const historicalCollection = db.collection('document_history');
    const historicalUUID = nanoid();
    await historicalCollection.insertOne({
        uuid: historicalUUID,
        content: existingDocument.content,
        createdAt: existingDocument.updatedAt ?? new Date(),
        documentUUID

    })
    await collection.updateOne({uuid: documentUUID}, {$set: {content, updatedAt: new Date(), previousVersion: historicalUUID}});
}
