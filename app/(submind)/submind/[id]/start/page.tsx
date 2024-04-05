import {auth} from "@/auth";
import {activateSubmind} from "@/app/actions/submind";

interface ActPageProps {
    params: {
        id: string
    }
}

export default async function ActPage({params}: ActPageProps) {
    const session = await auth()

    if (!session) return null

    const submind = await activateSubmind(Number(params.id))

    if (!submind) return null


    return (
        <>
            <p>The submind has been activated. You will receive a report soon.</p>
        </>
    )
}
