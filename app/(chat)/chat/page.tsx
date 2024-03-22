import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import {auth} from "@/auth";

export default async function IndexPage() {
  const id = nanoid()
  const session = await auth()
    if (!session) return null
  console.log("id", id)
  return <Chat id={id} userId={session.user.id} />
}
