import {type Metadata} from 'next'
import {redirect} from 'next/navigation'

import {auth} from '@/auth'
import {Chat} from '@/components/chat'
import {getChat} from "@/app/(actions)/actions/chats";
import {getDocument} from "@/app/(actions)/actions/documents";
import Document from "@/components/documents/document";
import GenerateTasks from "@/components/tasks/generate-tasks";
import {generateTasksFromPlan} from "@/app/(actions)/actions/tasks";

export interface DocumentPageProps {
    params: {
        id: string
    }
}

export async function generateMetadata({
                                           params
                                       }: DocumentPageProps): Promise<Metadata> {
    const session = await auth()

    if (!session?.user) {
        return {}
    }

    return {
        title: "Action Plan"
    }
}

export default async function DocumentPage({params}: DocumentPageProps) {
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?next=/document/${params.id}`)
    }

    console.log(params.id)

    console.log("looking up document")

    const doc = await getDocument(params.id)


    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-lg font-semibold">Action Plan</h2>
                    <Document content={doc.content} documentId={params.id} userId={session.user.id}/>

                </div>
                <div className="flex flex-col gap-4">
                    <div className="grid w-full gap-1.5">
                        <GenerateTasks documentUUID={doc.uuid}/>
                        {/*<Chat/>*/}

                    </div>
                </div>
            </div>
        </>

    )
}
