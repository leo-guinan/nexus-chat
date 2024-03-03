import { nanoid } from '@/lib/utils'
import {ThoughtContext} from "@/components/thought-context";
import {getMostRecentContext} from "@/app/actions";
import {auth} from "@/auth";

export default async function IndexPage() {
    const session = await auth()

  if (!session) return null

  const context = await getMostRecentContext(session.user.id)

  if ('error' in context) return null

  return <ThoughtContext contextId={context.id} contextName={context.name} />
}
