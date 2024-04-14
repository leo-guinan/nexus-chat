import {PrismaClient} from '@prisma/client/edge'
import {PrismaAdapter} from "@auth/prisma-adapter";
import NextAuth, {type DefaultSession} from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import {withAccelerate} from '@prisma/extension-accelerate'
import Resend from "@auth/core/providers/resend";

declare module 'next-auth' {
    interface Session {
        user: {
            /** The user's id. */
            id: string
        } & DefaultSession['user']
    }
}

const prisma = new PrismaClient().$extends(withAccelerate())

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [Resend({
        // If your environment variable is named differently than default
        from: "no-reply@auth.myaicofounder.com"
    }), GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })],
    basePath: '/api/auth',
    secret: process.env.AUTH_SECRET,
    callbacks: {
        // @ts-ignore
        jwt({token, profile}) {
            if (profile) {
                token.id = profile.id
                token.image = profile.avatar_url || profile.picture
            }
            return token
        },
        // @ts-ignore
        session: ({session, token}) => {
            if (session?.user && token?.id) {
                session.user.id = String(token.id)
            }
            return session
        },
        // @ts-ignore
        authorized({auth}) {
            return !!auth?.user // this ensures there is a logged in user for -every- request
        },

    },
    pages: {
        signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
    }
}

export const {
    handlers: {GET, POST},
    auth
    // @ts-ignore
} = NextAuth(authOptions)
