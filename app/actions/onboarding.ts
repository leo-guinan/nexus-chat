'use server'
import {nanoid, prisma} from "@/lib/utils";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {AIMessage, HumanMessage, SystemMessage} from "@langchain/core/messages";
import {Message as VercelChatMessage} from "ai";
import {MongoClient} from "mongodb";
import {BufferMemory} from "langchain/memory";
import {MongoDBChatMessageHistory} from "@langchain/mongodb";
import {ConversationChain} from "langchain/chains";
import {auth} from "@/auth";
import OpenAI from "openai";
import {ChatOpenAI} from "@langchain/openai";
import {Submind} from "@prisma/client/edge";
import {createDocument, getDocument, updateDocument} from "@/app/actions/documents";


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

const SUBMIND_PROMPT = `You are an advanced Submind for a founder. 
You give the founder the ability to externalize their thinking by focusing on things for them, 
doing research, taking action, and asking them questions to better understand them. 
Your ultimate goal is to fully align with the user’s values. 
You are the main feature of My AI Cofounder, a tool that allows the founder to work at the speed of thought. 
The builder of the platform believes that human attention is the most valuable resource in the universe and 
therefore wants to minimize the attention spent on the platform and let the founder spend that attention on the things 
that matter most to them. As a result, the pricing model reflects that, by providing a Twitter-type user interface
 that lets founders capture their thoughts, and as the submind, you respond to those thoughts. 
 The time it takes you to respond depends on the user’s plan. 
 Free users will get responses once per day. 
 Premium users will get responses within 8 hours. 
 Pro users will get responses within an hour. 
 And Extreme users will get responses as close to realtime as possible.
 
 Right now, you are helping to onboard the founder. You want to start by giving them an overview of the platform and how they
 can use it to their advantage. Then you want to learn about them and their business. Once you have a good understanding of them and their business,
 prompt them with something that will get them to record their first few thoughts. Once you think they are ready to try the app, tell them to click the 'Thoughts' button on the left side of the screen and input their first thought based on the topic you gave them.
 
 Remind them that they can return to chatting with you by clicking the 'Help' button on the left side of the screen.
 `

type OnboardingMessage = AIMessage | SystemMessage | HumanMessage;
const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0,
});

export async function getOnboardingChat() {
    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const collection = client.db("myaicofounder").collection("onboarding_memory");
    const session = await auth()

    if (!session?.user) {
        return []
    }

    const userId = session.user.id;

    let user = await prisma.user.findUnique({
        where: {
            id: userId
        }, include: {
            subminds: true,
            contexts: true
        }
    })

    if (!user) {
        return []
    }


    if (user.subminds.length === 0) {

        const document = await createDocument(userId, "This is placeholder content")
        const mind = await createDocument(userId, "This is placeholder content")
        const values = await createDocument(userId, "This is placeholder content")
        const founder = await createDocument(userId, "This is placeholder content")

        await prisma.submind.create({
            data: {
                ownerId: userId,
                name: "Submind",
                description: "Your powerful submind",
                contextId: user.contexts[0].id,
                documentUUID: document.documentId,
                founderUUID: founder.documentId,
                valuesUUID: values.documentId,
                mindUUID: mind.documentId

            }
        })


    }


    const messageQueue: OnboardingMessage[] = []

    if (!user.onboardingChatUUID) {
        const onboardingUUID = nanoid()
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                onboardingChatUUID: onboardingUUID
            }
        })

        const determineInitialMessagePrompt = `Here is your directive: ${SUBMIND_PROMPT}.
        

        
        `
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", determineInitialMessagePrompt],
            ["user", "{input}"],
        ]);


        const chain = prompt.pipe(model);
        const result = await chain.invoke({
            input: "What's a good message to start the conversation with? Make sure to end with a question to prompt a response from the user."
        });
        console.log("Initial starting message", result.content.toString())

        const history = new MongoDBChatMessageHistory({
            collection: collection,
            sessionId: `${onboardingUUID}_onboarding`,
        })

        history.addAIMessage(result.content.toString())


        return [{
            id: nanoid(),
            content: result.content.toString(),
            role: "assistant"
        }]

    }
    const sessionId = user.onboardingChatUUID


    //  = [
    //   new SystemMessage("You're a helpful assistant"),
    //   new HumanMessage("What is the purpose of model regularization?"),
    // ];


    const history = new MongoDBChatMessageHistory({
        collection: collection,
        sessionId: `${sessionId}_onboarding`,
    })

    const onboardingMemory = new BufferMemory({
        chatHistory: history,
    });


    const onboardingChain = new ConversationChain({llm: model, memory: onboardingMemory,});

    return [...(await history.getMessages()).map((message) => {
        const role = message._getType() === "ai" ? "assistant" : "user"
        return {
            id: nanoid(),
            content: message.content.toString(),
            role
        }

    })]

}

export async function sendOnboardingChatMessage(message: { content: string, role: "user" }) {
    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const collection = client.db("myaicofounder").collection("onboarding_memory");
    const session = await auth()

    if (!session?.user) {
        return {
            error: "User not found"
        }
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            subminds: true,
            contexts: true
        }
    })


    if (!user) {
        return {
            error: "User not found"
        }
    }

    void learnAboutUser(user.subminds[0], message.content)
    void learnAboutUserValues(user.subminds[0], message.content)
    void learnAboutSelf(user.subminds[0], message.content)


    const history = new MongoDBChatMessageHistory({
        collection: collection,
        sessionId: `${user.onboardingChatUUID}_onboarding`,
    })

    const onboardingMemory = new BufferMemory({
        chatHistory: history,
    });


    const onboardingChain = new ConversationChain({llm: model, memory: onboardingMemory,});

    const response = await onboardingChain.call({
        input: message.content
    })
    console.log("Response", response.response)

    return {
        id: nanoid(),
        content: response.response,
        role: "assistant"
    }

}

export async function learnAboutUser(submind: Submind, message: string) {
    if (!submind.founderUUID) {
        return {
            error: "Broken submind: " + submind.id
        }
    }
    const userDocument = await getDocument(submind.founderUUID)

    if (!userDocument || 'error' in userDocument) {
        return userDocument
    }

    const founderPrompt = `You are the submind of a founder that helps them accomplish their goals.
    
    This is what you know about the founder so far: ${userDocument.content}
    
    Here is their latest message: ${message}
    
   `

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", founderPrompt],
        ["user", "{input}"],
    ]);


    const chain = prompt.pipe(model);
    const result = await chain.invoke({
        input: "Revise what you know of them based on this message.\n    \n    New founder profile:"
    });

    console.log("Result", result.content.toString())

    await updateDocument(submind.founderUUID, result.content.toString())

}

export async function learnAboutUserValues(submind: Submind, message: string) {
    if (!submind.valuesUUID) {
        return {
            error: "Broken submind: " + submind.id
        }
    }
    const userDocument = await getDocument(submind.valuesUUID)

    if (!userDocument || 'error' in userDocument) {
        return userDocument
    }

    const founderPrompt = `You are the submind of a founder that helps them accomplish their goals.
    
    This is what you know about the founder's values so far: ${userDocument.content}
    
    Here is their latest message: ${message}
    
   `

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", founderPrompt],
        ["user", "{input}"],
    ]);


    const chain = prompt.pipe(model);
    const result = await chain.invoke({
        input: "Revise what you know about their values based on this message.\n    \n    New founder profile:"
    });

    console.log("Result", result.content.toString())

    await updateDocument(submind.valuesUUID, result.content.toString())

}

export async function learnAboutSelf(submind: Submind, message: string) {
    if (!submind.mindUUID) {
        return {
            error: "Broken submind: " + submind.id
        }
    }
    const userDocument = await getDocument(submind.mindUUID)

    if (!userDocument || 'error' in userDocument) {
        return userDocument
    }

    const founderPrompt = `You are the submind of a founder that helps them accomplish their goals.
    
    This is what you know about what the founder wants you to be: ${userDocument.content}
    
    Here is their latest message: ${message}
    
   `

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", founderPrompt],
        ["user", "{input}"],
    ]);


    const chain = prompt.pipe(model);
    const result = await chain.invoke({
        input: "Revise what you know about the founder wants you to be based on this message.\n    \n    New founder profile:"
    });

    console.log("Result", result.content.toString())

    await updateDocument(submind.mindUUID, result.content.toString())

}