import {auth} from "@/auth";
import {getThoughtTwitterStyle} from "@/app/actions/thoughts";
import TwitterMode from "@/components/twitter/twitter-mode";
import {User} from "@prisma/client/edge";

export interface EnhancedMessageDetailsPageProps {
    params: {
        id: string
    }
}


export default async function EnhancedMessageDetailsPage({params}: EnhancedMessageDetailsPageProps) {
    const session = await auth()

    if (!session) return null


    const {thoughts, contextId} = await getThoughtTwitterStyle(Number(params.id))

    return <TwitterMode thoughts={thoughts} user={session.user as User} contextId={contextId} selectedId={Number(params.id)}/>
}
