import {auth} from "@/auth";
import TwitterMode from "@/components/twitter/twitter-mode";
import {getThoughtsTwitterStyle} from "@/app/actions/thoughts";
import {User} from "@prisma/client/edge";


export default async function EnhancedMessagePage() {
    const session = await auth()

    if (!session) return null

    const {thoughts, contextId} = await getThoughtsTwitterStyle()

    return <TwitterMode thoughts={thoughts} user={session.user as User} contextId={contextId}/>
}
