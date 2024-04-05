import { nanoid } from '@/lib/utils'
import {ThoughtContext} from "@/components/thought-context";
import {auth} from "@/auth";
import {getContext} from "@/app/actions/contexts";

export default async function IndexPage() {
    const session = await auth()

  if (!session) return null





  return (
      <>View all subminds currently active</>
  )
}
