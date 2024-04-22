'use server'

import {nanoid, prisma} from "@/lib/utils";
import {auth} from "@/auth";
import {Submind, User} from "@prisma/client/edge";
import {revalidateTag} from "next/cache";
import {MongoClient} from "mongodb";
import {MongoDBChatMessageHistory} from "@langchain/mongodb";
import {BufferMemory} from "langchain/memory";
import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";
import {RunnableWithMessageHistory} from "@langchain/core/runnables";
import {createDocument, getDocument, updateDocument} from "@/app/actions/documents";
import {JsonOutputFunctionsParser} from "langchain/output_parsers";
import {createOpenAIFnRunnable} from "langchain/chains/openai_functions";

const model = new ChatOpenAI({
    modelName: "gpt-4-turbo",
    temperature: 0,
});

const SUBMIND_GOAL_PROMPT = `You are an advanced Submind for an investor at a venture capital firm.
You are tasked helping the investor streamline their investment process.

Here's what you know about the investor and their firm so far: {investor_data}

Here's the message you received: {message}

If the message contains a request for information that will require research on a company, founder, or industry, identify the goal that the investor is trying to achieve and let them know that you are working on it.

If the message contains information about the investor, their firm, or their investment strategy, summarize the information and let the investor know that you have it.

 `

const SUBMIND_RESPONSE_PROMPT = `You are an advanced Submind for an investor at a venture capital firm.

Here's the message you got from the investor: {message}

Here's what you know about the investor and their firm so far: {investor_data}

Based on what you know so far, ask the investor a followup question to learn more about them, their firm, or their investment process.

 `


export async function getQuestions() {
    const session = await auth()
    if (!session) return {error: "User not authenticated"}

    const user = session.user as User

    if (!user.preloSubmindId) {
        return {error: "User does not have a prelo submind id"}
    }

    const preloSubmind = await prisma.preloSubmind.findUnique({
        where: {
            id: user.preloSubmindId
        }
    })
    if (!preloSubmind) {
        return {error: "User does not have a prelo submind"}
    }

    const questions = await prisma.preloQuestion.findMany({
        where: {
            submindId: preloSubmind.id
        },
        include: {
            answer: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    const answersToCheck = []
    for (const question of questions) {
        if (!question?.answer?.content) {
            answersToCheck.push(question)
        }
    }

    await Promise.allSettled(answersToCheck.map(async question => {
        const answerRequest = await fetch(`${process.env.PRELO_API_URL as string}check/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Api-Key ${process.env.PRELO_API_KEY}`
            },
            body: JSON.stringify({
                request_id: question!.answer!.requestId
            }),
            next: {
                tags: ['preloQuestions'],
                revalidate: 60
            }

        })
        const answer = await answerRequest.json()
        if ('answer' in answer) {
            await prisma.preloAnswer.update({
                where: {
                    id: question!.answer!.id
                },
                data: {
                    content: answer.answer
                }

            })
        }
    }))


    return questions
}

export async function getClients() {

}

export async function answerQuestion(question: string, fastMode: boolean, preloClientId: number) {
    const session = await auth()
    if (!session) return {error: "User not authenticated"}

    const user = session.user as User

    if (!user.preloSubmindId) {
        return {error: "User does not have a prelo submind id"}
    }

    const preloSubmind = await prisma.preloSubmind.findUnique({
        where: {
            id: user.preloSubmindId
        }
    })
    if (!preloSubmind) {
        return {error: "User does not have a prelo submind"}
    }

    const preloClient = await prisma.preloClient.findUnique({
        where: {
            id: preloClientId
        }
    })

    if (!preloClient || !preloClient.clientId) {
        return {error: "Client not found"}
    }


    const answerRequest = await fetch(`${process.env.PRELO_API_URL as string}ask/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.PRELO_API_KEY}`
        },
        body: JSON.stringify({
            question: question,
            fast_mode: fastMode,
            prelo_client_id: preloClient.clientId
        })
    })

    const parsedAnswer = await answerRequest.json()
    const requestId = parsedAnswer.request_id
    const preloQuestion = await prisma.preloQuestion.create({
        data: {
            submindId: preloSubmind.id,
            content: question,
            fastMode,
            answer: {
                create: {
                    requestId
                }
            }
        },
        include: {
            answer: true
        }
    })
    revalidateTag('preloQuestions')


    return preloQuestion
}


export async function checkForAnswer(questionId: number) {
    const question = await prisma.preloQuestion.findUnique({
        where: {
            id: questionId
        },
        include: {
            answer: true
        }
    })

    if (!question?.answer?.content) {
        const answerRequest = await fetch(`${process.env.PRELO_API_URL as string}check/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Api-Key ${process.env.PRELO_API_KEY}`
            },
            body: JSON.stringify({
                request_id: question!.answer!.requestId
            })
        })
        const answer = await answerRequest.json()
        if ('answer' in answer) {
            await prisma.preloAnswer.update({
                where: {
                    id: question!.answer!.id
                },
                data: {
                    content: answer.answer
                }

            })
        }
    }
    // make sure to pull the updated version
    return prisma.preloQuestion.findUnique({
        where: {
            id: questionId
        },
        include: {
            answer: true
        }
    })


}

export async function sendPreloChatMessage(message: { content: string, role: "user", chatId: string }) {
    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const collection = client.db("myaicofounder").collection("prelo_memory");
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


    const history = new MongoDBChatMessageHistory({
        collection: collection,
        sessionId: `${message.chatId}_prelo`,
    })

    const preloMemory = new BufferMemory({
        chatHistory: history,
    });
    const investorData = await getDocument(message.chatId)
    if ('error' in investorData) {
        return {
            error: investorData.error
        }
    }

    const goalPrompt = ChatPromptTemplate.fromTemplate(SUBMIND_GOAL_PROMPT)

    const goalChain = goalPrompt.pipe(model)

    // const goalResponse = await goalChain.invoke(
    //     {
    //         investor_data: investorData.content,
    //         message: message.content
    //     },
    // );

    const openAIFunction = {
        name: "get_response_type",
        description: "Determine the response type to the investor",
        parameters: {
            title: "response",
            description: "The type of response and the response",
            type: "object",
            properties: {
                type: {title: "type", description: "the type of message, either 'research' or 'info'", type: "string"},
                message: {title: "message", description: "The message to the investor", type: "string"},
                goal: {title: "goal", description: "The goal of the investor", type: "string"}
            },
            required: ["type"],
        },
    };


    const preloClient = await prisma.preloClient.findUnique({
        where: {
            uuid: message.chatId
        }
    })


    const outputParser = new JsonOutputFunctionsParser();

    const runnable = createOpenAIFnRunnable({
        functions: [openAIFunction],
        // @ts-ignore
        llm: model,
        // @ts-ignore
        prompt: goalPrompt,
        enforceSingleFunctionUsage: true, // Default is true
        // @ts-ignore
        outputParser
    });
    const response = await runnable.invoke({
        investor_data: investorData.content,
        message: message.content
    });

    console.log(response);

    if (response.type === "research") {
        const workingResponse = "I'm working on that for you."
        await history.addAIMessage(workingResponse)
        const answer = await answerQuestion(response.goal, true, preloClient!.id)
        console.log("Answer", answer)
        return {
        id: nanoid(),
        content: workingResponse,
        role: "assistant"
        }
    } else if (response.type === "info") {
        const updatedInvestorData = await learnAboutInvestor(message.chatId, message.content)
        const prompt = ChatPromptTemplate.fromMessages([
        ["system", SUBMIND_RESPONSE_PROMPT],
        ["human", "{message}"],
    ]);
        const chain = prompt.pipe(model)
        const result = await chain.invoke({
            message: message.content,
            investor_data: updatedInvestorData
        })
        await history.addAIMessage(result.content.toString())
        return {
            id: nanoid(),
            content: result.content,
            role: "assistant"
        }
    } else {
        console.error("Unknown response type", response)
        return {
            id: nanoid(),
            content: "Sorry, I had trouble understanding that. Can you ask again?",
            role: "assistant"
        }
    }

}

export async function getPreloChat(chatId: string) {
    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const collection = client.db("myaicofounder").collection("prelo_memory");
    const session = await auth()
    if (!session?.user) {
        return {
            error: "User not found"
        }
    }
    const memory = new BufferMemory({
        chatHistory: new MongoDBChatMessageHistory({
            collection,
            sessionId: `${chatId}_prelo`,
        }),
    });

    const messages = await memory.chatHistory.getMessages();
    return {
        id: chatId,
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

export async function createPreloChat() {
    const client = new MongoClient(process.env.MONGO_URL || "");
    await client.connect();
    const collection = client.db("myaicofounder").collection("prelo_memory");
    const session = await auth()
    if (!session?.user) {
        return {
            error: "User not found"
        }
    }


    const {documentId: chatId} =    await createDocument(session.user.id, "Investor profile")

    const history = new MongoDBChatMessageHistory({
        collection,
        sessionId: `${chatId}_prelo`,
    });

    await history.addAIMessage("Hi there! Welcome to Prelo chat. I'm here to help you streamline your investment process. To begin, what's your firm name?")

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })

    if (!user || !user.preloSubmindId) {
        return {
            error: "User not found"
        }
    }


    await prisma.preloClient.create({
        data: {
            preloSubmindId: user.preloSubmindId,
            uuid: chatId,
            name: "Investor"

        }

    })

    console.log("Chat Id", chatId)

    await createDocument(chatId, "Investor profile")

    const messages = await history.getMessages()
    return {
        id: chatId,
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

export async function learnAboutInvestor(uuid:string, message: string) {

    const investorDocument = await getDocument(uuid)

    if (!investorDocument || 'error' in investorDocument) {
        return investorDocument
    }

    const investorPrompt = `You are the submind of an investor at a venture capital firm that helps them streamline their investment process.
    
    This is what you know about what the investor so far: ${investorDocument.content}
    
    Here is their latest message: ${message}
    
   `

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", investorPrompt],
        ["user", "{input}"],
    ]);


    const chain = prompt.pipe(model);
    const result = await chain.invoke({
        input: "Revise what you know about the investor, their firm, and their investment process based on this message.\n    \n    New investor profile:"
    });

    console.log("Result", result.content.toString())

    await updateDocument(uuid, result.content.toString())
    return result.content.toString()

}
