import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import {getChat, getContext} from '@/app/actions'
import { Chat } from '@/components/chat'
import {ThoughtContext} from "@/components/thought-context";

export interface ContextPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ContextPageProps): Promise<Metadata> {
  const session = await auth()

  console.log("page Session", session)
  if (!session?.user) {
    return {}
  }

  const context = await getContext(params.id, session.user.id)
  return {
    title: context?.title?.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ContextPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect(`/sign-in?next=/context/${params.id}`)
  }

  const context = await getContext(params.id, session.user.id)

  if (!context) {
    notFound()
  }
  // console.log("contextUserId", context?.userId)
  // console.log("session.user.id", session?.user?.id)
  // if (context?.userId !== session?.user?.id) {
  //   notFound()
  // }

  return <ThoughtContext id={context?.id} initialThoughts={context.thoughts} />
}
