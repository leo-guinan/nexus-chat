import {nanoid} from '@/lib/utils'
import {Chat} from '@/components/chat'
import {auth} from "@/auth";
import {isUserPremium} from "@/app/actions/users";
import Upgrade from "@/components/upgrade/upgrade";
import {newChat} from "@/app/actions/chats";

export default async function IndexPage() {
    const session = await auth()
    if (!session) return null

    const premium = await isUserPremium()

    if (!premium) {
        return <Upgrade premium={premium}/>
    }

    const chat = await newChat()
    if ('error' in chat) return null

    const {id, userId, messages} = chat

    return <Chat sessionId={id} userId={session.user.id} initialMessages={messages}/>
}
