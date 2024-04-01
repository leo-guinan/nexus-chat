import {User} from "@prisma/client/edge";
import {auth} from "./auth"
import {NextResponse} from "next/server";


export default auth((req) => {
    if (!req?.auth?.user) {
        // Redirect to login if not authenticated
        const signInUrl = new URL('/sign-in', req.nextUrl.origin)
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
        return NextResponse.rewrite(signInUrl)

    }


    if (!(req.auth.user as User).acceptedPolicy) {
        return NextResponse.rewrite(new URL('/data', req.nextUrl.origin))
    }
    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
