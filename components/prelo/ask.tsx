'use client'

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {Checkbox} from "@/components/ui/checkbox";
import {PreloQuestion, Prisma} from "@prisma/client/edge";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {answerQuestion, checkForAnswer, getQuestions} from "@/app/actions/prelo";
import {Label} from "@/components/ui/label";
import RefreshButton from "@/components/refresh-button";

type QuestionWithAnswer = PreloQuestion & Partial<Prisma.PreloQuestionGetPayload<{
    include: { answer: true }
}>>

interface AskProps {
    questions: QuestionWithAnswer[]
}

export default function Ask({questions}: AskProps) {
    const [displayedQuestions, setDisplayedQuestions] = useState<QuestionWithAnswer[]>(questions)
    const [question, setQuestion] = useState('')
    const [fastMode, setFastMode] = useState(true)
    const [loading, setLoading] = useState(false)
    const requestAnswer = async () => {
        // pass to backend
        setLoading(true)
        const newQuestion = await answerQuestion(question, fastMode, 1)
        console.log("newQuestion", newQuestion)
        if ('error' in newQuestion) {
            console.error(newQuestion.error)
            setLoading(false)
            return
        }
        setQuestion('')
        setDisplayedQuestions([newQuestion, ...displayedQuestions])
        setLoading(false)
    }

    const handleKeyPress = async (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            await requestAnswer();
        }
    }

    const refreshAnswer = async (questionId: number) => {
        if (!questionId) return
        setLoading(true)
        const updatedQuestion = await checkForAnswer(questionId)
        if (!updatedQuestion) return
        const updatedQuestions = displayedQuestions.map((question) => {
            if (question.id === questionId) {
                return updatedQuestion
            }
            return question
        })
        setLoading(false)
    }
    return (
        <div className="p-4">
            <div className="space-y-1 flex flex-col py-2 border border-gray-800">
                <div className="flex flex-row w-full ml-2 py-2">
                    <Label className="text-sm leading-none w-full" htmlFor="question">Ask a question</Label>
                </div>
                <div className="flex flex-row w-full ml-2 py-2">
                    <Input className="max-w-sm w-full" placeholder="Enter your question" type="text"
                           value={question}
                           disabled={loading}
                           onChange={(e) => setQuestion(e.target.value)}
                           onKeyDown={handleKeyPress}
                    />
                </div>
                <div className="flex flex-row w-full ml-2 py-2">
                    <Checkbox id="fastMode" onCheckedChange={() => setFastMode(!fastMode)} checked={fastMode}
                              disabled={loading}/>
                    <Label className="text-sm leading-none ml-2" htmlFor="fastMode">Fast Mode
                    </Label>
                </div>
                <div className="flex flex-row w-full ml-2 py-2">
                    <Button className="mr-auto" size="sm" onClick={() => requestAnswer()}
                            disabled={loading}
                    >
                        Submit
                    </Button>
                </div>
            </div>
            {displayedQuestions.map((question) => (
                <div key={question.id}>
                    <Accordion collapsible type="single">
                        <AccordionItem value="what-is-it" className="flex flex-col">
                            <AccordionTrigger className="text-lg font-medium">{question.content}</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex">
                                    <div className="flex flex-row mx-4 my-auto">
                                        <RefreshButton onClick={() => refreshAnswer(question.id)}/>
                                    </div>
                                    <div className="text-base leading-6 cursor-text select-all flex flex-row">
                                        <pre className="whitespace-pre-wrap font-sans">
                                            {question?.answer?.content && (
                                                question.answer.content
                                            )}
                                            {!question?.answer?.content && (
                                                "Still waiting on answer..."
                                            )}
                                        </pre>
                                    </div>
                                </div>


                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                </div>
            ))}
        </div>
    )
}