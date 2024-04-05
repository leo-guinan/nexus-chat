'use server'

import {nanoid, prisma} from "@/lib/utils";
import {auth} from "@/auth";
import {createDocument} from "@/app/actions/documents";
import {SubmindStatus} from "@prisma/client/edge";

export async function createSubmind({name, description}: { name: string, description: string }) {

    const session = await auth()
    if (!session?.user?.id) return null

    const context = await prisma.context.create({
        data: {
            name,
            details: `This is the context for the submind ${name}`,
            owner: {
                connect: {
                    id: session.user.id
                }
            }
        }

    })

    const document =    await createDocument(session.user.id, "Add as many details as you want to guide the submind's thoughts. More context will yield more targeted results, and less context will make the output more creative and less predictable.")


    const submind = await prisma.submind.create({
        data: {
            name,
            description,
            owner: {
                connect: {
                    id: session.user.id
                }
            },
            context: {
                connect: {
                    id: context.id
                }
            },
            documentUUID: document.documentId
        }
    })


    return submind


}

export async function getSubmind(submindId: number) {
    const session = await auth()
    if (!session?.user?.id) return null

    const submind = await prisma.submind.findUnique({
        where: {
            id: submindId,
            ownerId: session.user.id
        }
    })

    if(!submind) return null

    return submind
}

export async function activateSubmind(submindId:number) {
    const session = await auth()
    if (!session?.user?.id) return null

    const submind = await prisma.submind.findUnique({
        where: {
            id: submindId,
            ownerId: session.user.id
        }
    })

    if(!submind) return null

    await prisma.submind.update({
        where: {
            id: submindId
        },
        data: {
            status: SubmindStatus.ACTIVE
        }
    })

    return submind
}