import {auth} from "@/auth";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/utils";

export async function POST(req: Request,
) {
    const body = await req.json();
    const calendarId = body.calendarId;
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.error()
    }

    await prisma.googleCalendar.delete({
        where: {
            id: calendarId
        }
    })

    return NextResponse.json({success: true})


}