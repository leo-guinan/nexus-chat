'use client'
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/y0AR6W4nXBh
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {Input} from "@/components/ui/input"
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {answerQuestion} from "@/app/actions/questions";

interface QuestionListProps {
    questions: {
        content: string
        id: number
    }[]
}

interface AnswerList {
    [key: number]: {
        question: string
        answer: string
    }
}

export default function QuestionList({questions}: QuestionListProps) {

    const [answers, setAnswers] = useState<AnswerList>({})
    useEffect(() => {
        const map = questions.reduce((acc, question) => {
            acc[question.id] = {
                "question": question.content,
                "answer": ""
            };
            return acc;
        }, {} as AnswerList);

        setAnswers(map);
    }, [questions]);

    const handleUpdateAnswer = (questionId: number, answer: string) => {
        setAnswers({...answers, [questionId]: {...answers[questionId], answer}});

    }

    const saveAnswer = async (questionId: number) => {

        // Save the answer
        await answerQuestion(questionId, answers[questionId].answer);
        // remove the question with the questionId from the answers state
        const {[questionId]: _, ...rest} = answers;


    }

    return (
        <div className="w-full max-w-2xl space-y-6">
            {questions && questions.map((question) => (
                <div key={question.id} className="space-y-1">
                    <h3 className="text-lg leading-none font-semibold">{question.content}</h3>
                    <Input className="max-w-sm w-full" placeholder="Enter your answer" type="text"
                           value={answers[question.id]?.answer}
                           onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}/>
                    <Button className="ml-auto" size="sm" onClick={() => saveAnswer(question.id)}>
                        Submit
                    </Button>
                </div>
            ))}
        </div>
    )
}

