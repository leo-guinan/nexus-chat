'use server'

import {auth} from "@/auth";
import {prisma} from "@/lib/utils";


export async function getQuestions() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const questions = await prisma.question.findMany({
        where: {
            ownerId: session.user.id,
            forHuman: true,

        },
        include: {
            answers: true
        }
    })

    // filter out questions that have been answered
    const unansweredQuestions = questions.filter((question) => question.answers.length === 0)

    console.log("questions", unansweredQuestions)

    return unansweredQuestions
}

export async function answerQuestion(questionId: number, answer: string) {
    console.log("questionId", questionId)
    console.log("answer", answer)
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const question = await prisma.question.findUnique({
        where: {
            id: questionId,
            ownerId: session.user.id
        }
    })

    if (!question) {
        return {
            error: "Question not found"
        }
    }
    const answerParams = question.submindId ? {
        content: answer,
            source: "user",
            question: {
                connect: {
                    id: questionId
                }
            },
            submind: {
                connect: {
                    id: question.submindId
                }
            },

    } : {
        content: answer,
            source: "user",
            question: {
                connect: {
                    id: questionId
                }
            },

    }
    const savedAnswer = await prisma.answer.create({
        data: answerParams
    })





    return

}

