import {User} from "@prisma/client/edge";
import {auth} from "./auth"
import {NextResponse} from "next/server";


export default auth((req) => {
    if (!req?.auth?.user) {
        // Redirect to login if not authenticated
        return NextResponse.rewrite(new URL('/sign-in', req.url))
    }


    if (!(req.auth.user as User).acceptedPolicy) {
        return NextResponse.rewrite(new URL('/data', req.url))
    }
    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
