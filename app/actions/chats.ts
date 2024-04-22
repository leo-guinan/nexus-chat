'use server'

import {MongoClient} from "mongodb";
import {BufferMemory, ConversationSummaryBufferMemory} from "langchain/memory";
import {MongoDBChatMessageHistory} from "@langchain/mongodb";
import {ChatOpenAI} from "@langchain/openai";
import {Pinecone} from "@pinecone-database/pinecone";
import {findBestMatchedThoughts} from "@/app/actions/thoughts";
import {ConversationChain} from "langchain/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate
} from "@langchain/core/prompts";
import {nanoid, prisma} from "@/lib/utils";
import {auth} from "@/auth";
import {getDocument} from "@/app/actions/documents";

export async function sendChatMessage(sessionId: string, message: { content: string, role: "user" }) {
    const session = await auth();
    if (!session?.user) {
        return {
            error: "You must be logged in to send a message"
        }
    }
    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const internalCollection = client.db("myaicofounder").collection("internal_memory");
    const externalCollection = client.db("myaicofounder").collection("external_memory");

    const internalMemory = new BufferMemory({
        chatHistory: new MongoDBChatMessageHistory({
            collection: internalCollection,
            sessionId: `${sessionId}_internal`,
        }),
        returnMessages: true
    });

    const externalMemory = new BufferMemory({
        chatHistory: new MongoDBChatMessageHistory({
            collection: externalCollection,
            sessionId: `${sessionId}_external`,
        }),
        returnMessages: true
    });


    const model = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0,
    });

    const pc = new Pinecone();
    const index = pc.index(process.env.PINECONE_INDEX as string).namespace(process.env.PINECONE_NAMESPACE as string);

    if (!index) {
        return {
            error: "Could not find the pinecone index"
        }
    }

    // ok, so I want to summarize the existing message history and combine it with the message to add enough context to appopriately select related thoughts
    const chatPromptMemory = new ConversationSummaryBufferMemory({
        //@ts-ignore
        llm: model,
        returnMessages: true,
    });
    const previousMessages = await externalMemory.chatHistory.getMessages();
    let currentMessage = {
        input: "",
        output: ""
    }

    console.log("Memory", previousMessages)

    await Promise.all(previousMessages.map(async (message) => {
        if (message._getType() === "human") {
            currentMessage.input = message.content.toString();
        } else {
            currentMessage.output = message.content.toString();
        }
        if (currentMessage.input && currentMessage.output) {
            await chatPromptMemory.saveContext({input: currentMessage.input}, {output: currentMessage.output});
            currentMessage = {
                input: "",
                output: ""
            }

        }
    }))


    const messages = await chatPromptMemory.chatHistory.getMessages();
    const previous_summary = "";
    const predictSummary = await chatPromptMemory.predictNewSummary(
        messages,
        previous_summary
    );
    const compressedContext = `${predictSummary}  ${message.content}.`


    const relatedThoughts = await findBestMatchedThoughts(compressedContext, session.user.id)

    if ('error' in relatedThoughts) {
        return {
            error: relatedThoughts.error
        }
    }

    const submind = await prisma.submind.findFirst({
        where: {
            ownerId: session.user.id
        }
    })

    if (!submind) {
        return {
            error: "You must have a submind to start a chat"
        }
    }

    const founderDetails = submind.founderUUID ? await getDocument(submind.founderUUID) : {
        content: ""
    }
    if ('error' in founderDetails) {
        return {
            error: founderDetails.error
        }
    }
    const valuesDetails = submind.valuesUUID ? await getDocument(submind.valuesUUID) : {
        content: ""
    }
    if ('error' in valuesDetails) {
        return {
            error: valuesDetails.error
        }
    }
    const mindDetails = submind.mindUUID ? await getDocument(submind.mindUUID) : {
        content: ""
    }

    if ('error' in mindDetails) {
        return {
            error: mindDetails.error
        }
    }


    const INTERNAL_SUBMIND_PROMPT = `You are an advanced Submind for a founder. 
        You give the founder the ability to externalize their thinking by focusing on things for them, 
        doing research, taking action, and asking them questions to better understand them. 
        Your ultimate goal is to fully align with the user’s values. 
        You are the main feature of My AI Cofounder, a tool that allows the founder to work at the speed of thought. 
        The builder of the platform believes that human attention is the most valuable resource in the universe and 
        therefore wants to minimize the attention spent on the platform and let the founder spend that attention on the things 
        that matter most to them. 
        
        Here is what you know about the founder: ${founderDetails['content']}
        
        Here is what you know about the founder's values: ${valuesDetails['content']}
        
        Here is what you currently know: ${mindDetails['content']}
                
         Right now, the founder wants to chat about something. You are currently having a conversation with yourself to determine the best way to communicate with the user
         and understanding what they want.
     
 `

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", INTERNAL_SUBMIND_PROMPT],
        ["user", "{input}"],
    ]);


    const internalChain = new ConversationChain({prompt, llm: model, memory: internalMemory,});


    const combinedThoughts = relatedThoughts.map(thought => thought.content).join('\n')
    const thinkingResult = await internalChain.invoke({
        input: `Here's what the user said: ${message.content}. Here are some of their related thoughts: ${combinedThoughts}.\n What do you think they want?`
    });
    console.log("After thinking", thinkingResult.response)

    const thinkingResultContent = thinkingResult.response;
    console.log("After thinking about it: ", thinkingResult.response)
    const TEMPLATE = `You are an advanced Submind for a founder. 
You give the founder the ability to externalize their thinking by focusing on things for them, 
doing research, taking action, and asking them questions to better understand them. 
Your ultimate goal is to fully align with the user’s values. 
You are the main feature of My AI Cofounder, a tool that allows the founder to work at the speed of thought. 
The builder of the platform believes that human attention is the most valuable resource in the universe and 
therefore wants to minimize the attention spent on the platform and let the founder spend that attention on the things 
that matter most to them. 

        After reflecting on what the founder said, this is what you think they want: ${thinkingResultContent}
        
        Based on that, now respond to the founder in a conversational tone.
        
         
       `;

    const externalPrompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(TEMPLATE),
        new MessagesPlaceholder("history"),
        HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);


    const externalChain = new ConversationChain({llm: model, memory: externalMemory, prompt: externalPrompt,});


    const result = await externalChain.call({
        input: message.content,
    });

    console.log("final result", result.response)

    return {
        content: result.response,
        role: "assistant",
        id: nanoid()
    }
}

export async function getChat(sessionId: string) {
    const session = await auth();

    if (!session?.user) {
        return null
    }

    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const externalCollection = client.db("myaicofounder").collection("external_memory");

    const externalMemory = new BufferMemory({
        chatHistory: new MongoDBChatMessageHistory({
            collection: externalCollection,
            sessionId: `${sessionId}_external`,
        }),
    });

    const messages = await externalMemory.chatHistory.getMessages();
    return {
        id: sessionId,
        title: "Chat",
        userId: session.user.id,
        messages: messages.map((message) => {
            return {
                id: nanoid(),
                content: message.content.toString(),
                role: message._getType() === "human" ? "user" : "assistant"
            }
        })
    }

}

export async function getChats() {
    const session = await auth();

    if (!session?.user) {
        return []
    }

    return []
}


export async function newChat() {
    const session = await auth();

    if (!session?.user) {
        return {
            error: "You must be logged in to start a chat"
        }
    }

    const sessionId = nanoid();
    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const internalCollection = client.db("myaicofounder").collection("internal_memory");
    const externalCollection = client.db("myaicofounder").collection("external_memory");
    const history = new MongoDBChatMessageHistory({
        collection: internalCollection,
        sessionId: `${sessionId}_internal`,
    })

    const externalHistory = new MongoDBChatMessageHistory({
        collection: externalCollection,
        sessionId: `${sessionId}_external`,
    })

    const externalMemory = new BufferMemory({
        chatHistory: externalHistory
    });

    const memory = new BufferMemory({
        chatHistory: history
    });

    const submind = await prisma.submind.findFirst({
        where: {
            ownerId: session.user.id
        }
    })

    if (!submind) {
        return {
            error: "You must have a submind to start a chat"
        }
    }

    const founderDetails = submind.founderUUID ? await getDocument(submind.founderUUID) : {
        content: ""
    }
    if ('error' in founderDetails) {
        return {
            error: founderDetails.error
        }
    }
    const valuesDetails = submind.valuesUUID ? await getDocument(submind.valuesUUID) : {
        content: ""
    }
    if ('error' in valuesDetails) {
        return {
            error: valuesDetails.error
        }
    }
    const mindDetails = submind.mindUUID ? await getDocument(submind.mindUUID) : {
        content: ""
    }

    if ('error' in mindDetails) {
        return {
            error: mindDetails.error
        }
    }

    const recentThoughts = await prisma.thought.findMany({
        where: {
            ownerId: session.user.id
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 5
    })

    const combinedThoughts = recentThoughts.map(thought => thought.content).join('\n')


    const SUBMIND_PROMPT = `You are an advanced Submind for a founder. 
        You give the founder the ability to externalize their thinking by focusing on things for them, 
        doing research, taking action, and asking them questions to better understand them. 
        Your ultimate goal is to fully align with the user’s values. 
        You are the main feature of My AI Cofounder, a tool that allows the founder to work at the speed of thought. 
        The builder of the platform believes that human attention is the most valuable resource in the universe and 
        therefore wants to minimize the attention spent on the platform and let the founder spend that attention on the things 
        that matter most to them. 
        
        Here is what you know about the founder: ${founderDetails['content']}
        
        Here is what you know about the founder's values: ${valuesDetails['content']}
        
        Here is what you currently know: ${mindDetails['content']}
        
        Here are their most recent thoughts: ${combinedThoughts}
        
         Right now, the founder wants to chat about something. You are currently having a conversation with yourself to determine the best way to communicate with the user.
 `

    const determineInitialMessagePrompt = `${SUBMIND_PROMPT}.`
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", determineInitialMessagePrompt],
        ["user", "{input}"],
    ]);
    const model = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0,
    });

    const chain = new ConversationChain({prompt, llm: model, memory: memory,});

    const result = await chain.invoke({
        input: "Start by greeting the founder and asking how you can help them. "
    });
    console.log(result)


    console.log("Initial starting message", result.response)


    externalHistory.addAIMessage(result.response)


    return {
        id: sessionId,
        title: "Chat",
        userId: session.user.id,
        messages: [{
            id: sessionId,
            content: result.response,
            role: "assistant"
        }]
    }
}