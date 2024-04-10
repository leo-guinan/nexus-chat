import {NextResponse} from "next/server";
import {prisma} from "@/lib/utils";

export async function POST(req: Request,
) {
    const body = await req.json();
    const userId = body.userId;
    console.log("Reading thoughts", body);

    const submindsForUser = await prisma.submind.findMany({
        where: {
            ownerId: userId,
        }
    });

    console.log("submindsForUser", submindsForUser);

    // ok, so now what exactly? actually, if submind is just a url that it can pass the thought to,
    // all I need is to pass it off to the url, like it, and move on. Or do I only like it if the submind decides it's related?
    // that will be fine for off-server subminds, but for now, just assume that things are local.

    await Promise.allSettled(submindsForUser.map(async submind => {
        await prisma.submind.update({
            where: {
                id: submind.id
            },
            data: {
                pendingThoughts: {
                    connect: {
                        id: body.message.id
                    }
                }
            }
        })
    }));

    return NextResponse.json({success: true})


}