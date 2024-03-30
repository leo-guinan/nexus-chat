import {Message as VercelChatMessage, StreamingTextResponse} from 'ai';
import OpenAI from 'openai'
import {PromptTemplate} from "@langchain/core/prompts";
import {ChatOpenAI} from "@langchain/openai";
import {MongoClient} from "mongodb";
import {BufferMemory} from "langchain/memory";
import {MongoDBChatMessageHistory} from "@langchain/mongodb";
import {ConversationChain} from "langchain/chains";
import {Pinecone} from "@pinecone-database/pinecone";
import {getEmbeddings} from "@/utils/embeddings";
import {prisma} from "@/lib/utils";
import {findBestMatchedThoughts} from "@/app/actions/thoughts";


export const runtime = "nodejs";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};


export async function POST(req: Request,
) {
    const body = await req.json();
    const messages = body.messages ?? [];
    const userId = body.userId;
    const sessionId = body.id;
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const internalCollection = client.db("myaicofounder").collection("internal_memory");
    const externalCollection = client.db("myaicofounder").collection("external_memory");

    const internalMemory = new BufferMemory({
        chatHistory: new MongoDBChatMessageHistory({
            collection: internalCollection,
            sessionId: `${sessionId}_internal`,
        }),
    });

    const externalMemory = new BufferMemory({
        chatHistory: new MongoDBChatMessageHistory({
            collection: externalCollection,
            sessionId: `${sessionId}_external`,
        }),
    });


    const model = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0,
    });

    const pc = new Pinecone();
    const index = pc.index(process.env.PINECONE_INDEX as string).namespace(process.env.PINECONE_NAMESPACE as string);

    if (!index) {
        return Response.json("Sorry, I had an issue with that last message. Please try again.")
    }


    const relatedThoughts = await findBestMatchedThoughts(currentMessageContent, userId)
    console.log("relatedThoughts", relatedThoughts)

    if ('error' in relatedThoughts) {
        return Response.json("Sorry, I had an issue with that last message. Please try again.")
    }

    const combinedThoughts = relatedThoughts.join('\n')

    const internalChain = new ConversationChain({llm: model, memory: internalMemory,});
    const thinkingResult = await internalChain.call({input: `Here's what the user said: ${currentMessageContent}. Here are some of their related thoughts: ${combinedThoughts}.\n What do you think they want?`});
    const thinkingResultContent = thinkingResult.response;
    console.log("After thinking about it: ", thinkingResult.response)
    const TEMPLATE = `You are a brilliant assistant who is so good, it's like you are reading the user's mind. 

        After reflecting on what the user said, this is what you think they want: ${thinkingResultContent}
        
         
        Current conversation:
        ${formattedPreviousMessages.join("\n")}
         
        User: {input}
        AI:`;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    /**
     * See a full list of supported models at:
     * https://js.langchain.com/docs/modules/model_io/models/
     */
    // const model = new ChatOpenAI({
    //     temperature: 0.8,
    // });

    console.log(prompt)
    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and encoding.
     */

    const externalChain = new ConversationChain({llm: model, memory: externalMemory, prompt: prompt,});


    const result = await externalChain.call({
        input: currentMessageContent,
    });

    console.log("final result", result.response)
    /*
       * Agent executors don't support streaming responses (yet!), so stream back the
       * complete response one character at a time with a delay to simluate it.
       */
    const textEncoder = new TextEncoder();
    const fakeStream = new ReadableStream({
        async start(controller) {
            for (const character of result.response) {
                controller.enqueue(textEncoder.encode(character));
                await new Promise((resolve) => setTimeout(resolve, 20));
            }
            controller.close();
        },
    });

    return new StreamingTextResponse(fakeStream);


}
