import {notFound, redirect} from 'next/navigation'

import {auth} from '@/auth'
import PreloChat from "@/components/prelo/chat";
import {createPreloChat, getPreloChat} from "@/app/actions/prelo";


export default async function PreloChatPage() {
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?next=/prelo/chat/`)
    }

    const chat = await createPreloChat()

    if (!chat) {
        notFound()
    }

    if (chat?.userId !== session?.user?.id) {
        notFound()
    }

    return <PreloChat chatId={chat.id} messages={chat.messages}/>
}
