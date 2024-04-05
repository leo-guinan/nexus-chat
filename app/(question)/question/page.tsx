import {redirect} from 'next/navigation'

import {auth} from '@/auth'
import Document from "@/components/documents/document";
import GenerateTasks from "@/components/tasks/generate-tasks";
import {getQuestions} from "@/app/actions/questions";
import QuestionList from "@/components/question/question-list";


export default async function DocumentPage() {
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?next=/question`)
    }


    console.log("looking up document")

    const questions = await getQuestions()

    if ('error' in questions) {
        return null
    }

    return (
        <>
            <div className="flex flex-col gap-4">
               <QuestionList questions={questions} />
            </div>
        </>

    )
}
