import {nanoid} from '@/lib/utils'
import {Chat} from '@/components/chat'
import {auth} from "@/auth";
import {isUserPremium} from "@/app/actions/users";
import Upgrade from "@/components/upgrade/upgrade";

export default async function IndexPage() {
    const id = nanoid()
    const session = await auth()
    if (!session) return null

    const premium = await isUserPremium()

    if (!premium) {
        return <Upgrade premium={premium}/>
    }
    return <Chat id={id} userId={session.user.id}/>
}
