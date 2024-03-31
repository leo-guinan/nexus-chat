'use server'

import {prisma} from "@/lib/utils";
import {auth} from "@/auth";

export async function acceptDataPolicy() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("User not found");
    }
    await prisma.user.update({
        where: {
            id: session.user.id,
        },
        data: {
            acceptedPolicy: new Date(),
        },
    })
}