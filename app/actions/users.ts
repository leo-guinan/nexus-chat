'use server'

import {prisma} from "@/lib/utils";
import {auth} from "@/auth";

export async function isUserPremium() {
    const session = await auth()

    if (!session?.user?.id) {
        return false
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId: session.user.id,
            active: true
        }
    })


    return !!subscription
}