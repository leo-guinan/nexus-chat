'use server'

import {Document, MarkdownTextSplitter, RecursiveCharacterTextSplitter} from "@pinecone-database/doc-splitter";
import {PineconeRecord} from "@pinecone-database/pinecone";
import {getEmbeddings} from "@/utils/embeddings";
import md5 from "md5";

export type DocumentSplitter = RecursiveCharacterTextSplitter | MarkdownTextSplitter

export async function embedDocument(doc: Document): Promise<PineconeRecord> {
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
                hash: doc.metadata.hash as string, // The hash of the document content
                    ...doc.metadata, // Include any other metadata from the document
            }
        } as PineconeRecord;
    } catch (error) {
        console.log("Error embedding document: ", error)
        throw error
    }
}

