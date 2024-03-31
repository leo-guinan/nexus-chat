import { auth } from "./auth"
import {NextResponse} from "next/server";


export default auth((req) => {
  //@ts-ignore - it exists on there, but limited type doesn't reflect entire user object
  if (!req?.auth?.user?.acceptedPolicy) {
    return NextResponse.rewrite(new URL('/data', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
