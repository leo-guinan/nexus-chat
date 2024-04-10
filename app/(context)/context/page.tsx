import { nanoid } from '@/lib/utils'
import {ThoughtContext} from "@/components/thought-context";
import {auth} from "@/auth";
import {getContext} from "@/app/actions/contexts";

export default async function IndexPage() {
    const session = await auth()

  if (!session) return null

  const context = await getContext("Default", session.user.id)


  if ('error' in context) return null

  return <ThoughtContext contextId={context.id} contextName={context.name} initialThoughts={context.thoughts} />
}
