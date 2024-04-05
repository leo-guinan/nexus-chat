import {auth} from "@/auth";
import {getSubmind} from "@/app/actions/submind";
import SubmindAction from "@/components/submind/submind-action";
import {getDocument} from "@/app/actions/documents";

interface ActPageProps {
    params: {
        id: string
    }
}

export default async function ActPage({params}: ActPageProps) {
    const session = await auth()

    if (!session) return null

    const submind = await getSubmind(Number(params.id))

    if (!submind) return null

    const document = await getDocument(submind.documentUUID)


    return (
        <>
            <SubmindAction submind={submind} content={document.content} userId={session.user.id} />
        </>
    )
}
