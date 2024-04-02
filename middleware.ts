import {User} from "@prisma/client/edge";
import {auth} from "./auth"
import {NextResponse} from "next/server";


export default auth((req) => {

    if (!req?.auth?.user) {
        if (req.url.split('?')[0].endsWith('/sign-in')) {
            return;
        }
        // Redirect to login if not authenticated
        const signInUrl = new URL('/sign-in', req.nextUrl.origin)
        signInUrl.searchParams.set('next', req.url)
        return NextResponse.rewrite(signInUrl)

    }


    if (!(req.auth.user as User).acceptedPolicy) {
        // make sure we don't end up in an infinite loop
        if (req.url.split('?')[0].endsWith('/data')) {
            return;
        }
        return NextResponse.rewrite(new URL('/data', req.nextUrl.origin))
    }
    return NextResponse.next();
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|privacy|terms).*)']
}
