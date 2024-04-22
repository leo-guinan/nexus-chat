import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { Chat } from '@/components/chat'
import {getChat} from "@/app/actions/chats";
import PreloChat from "@/components/prelo/chat";
import {getPreloChat} from "@/app/actions/prelo";

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user) {
    return {}
  }

  const chat = await getChat(params.id)
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function PreloChatPage({ params }: ChatPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect(`/sign-in?next=/chat/${params.id}`)
  }

  const chat = await getPreloChat(params.id)

  if (!chat) {
    notFound()
  }

  if (chat?.userId !== session?.user?.id) {
    notFound()
  }

  return <PreloChat chatId={chat.id} messages={chat.messages} />
}
