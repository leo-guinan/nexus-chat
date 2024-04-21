'use server'

import {prisma} from "@/lib/utils";
import {auth} from "@/auth";
import {User} from "@prisma/client/edge";
import {revalidateTag} from "next/cache";

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

    const answerRequest = await fetch(`${process.env.PRELO_API_URL as string}ask/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${process.env.PRELO_API_KEY}`
        },
        body: JSON.stringify({
            question: question,
            fast_mode: fastMode,
            prelo_client_id: preloClientId
        })
    })

    const parsedAnswer = await answerRequest.json()
    console.log("parsedAnswer", parsedAnswer)
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
        console.log("answer", answer)
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

