import { nanoid } from '@/lib/utils'
import {ThoughtContext} from "@/components/thought-context";
import {auth} from "@/auth";
import {getContext} from "@/app/actions/contexts";
import Upgrade from "@/components/upgrade/upgrade";
import {isUserPremium} from "@/app/actions/users";

export default async function IndexPage() {
    const session = await auth()

  if (!session) return null

  const premium = await isUserPremium()


  return <Upgrade premium={premium} />
}
