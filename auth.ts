import {PrismaClient} from '@prisma/client/edge'
import GitHub from 'next-auth/providers/github'
import {PrismaAdapter} from "@auth/prisma-adapter";
import NextAuth, {type DefaultSession} from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import {withAccelerate} from '@prisma/extension-accelerate'

declare module 'next-auth' {
    interface Session {
        user: {
            /** The user's id. */
            id: string
        } & DefaultSession['user']
    }
}

const prisma = new PrismaClient().$extends(withAccelerate())


export const {
    handlers: {GET, POST},
    auth
} = NextAuth({
    // @ts-ignore
    adapter: PrismaAdapter(prisma),
// @ts-ignore
    providers: [GitHub, GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })],
    basePath:'/api/auth',
    secret: process.env.AUTH_SECRET,
    callbacks: {
        jwt({token, profile}) {
            if (profile) {
                token.id = profile.id
                token.image = profile.avatar_url || profile.picture
            }
            return token
        },
        session: ({session, token}) => {
            if (session?.user && token?.id) {
                session.user.id = String(token.id)
            }
            return session
        },
        authorized({auth}) {
            return !!auth?.user // this ensures there is a logged in user for -every- request
        },
        async signIn({user, account, profile, email, credentials}) {
            console.log("in signin callback")
            // need to get user from database. If no community exists for that user, create one.
            const communities = await prisma.membership.findMany({
                where: {
                    memberId: user.id
                },
            })

            console.log("communitites", communities)

            if (communities.length === 0) {
                const community = await prisma.community.create({
                    data: {
                        creator: {
                            connect: {
                                id: user.id
                            }
                        }
                    }
                })
                await prisma.membership.create({
                    data: {
                        member: {
                            connect: {
                                id: user.id
                            }
                        },
                        community: {
                            connect: {
                                id: community.id
                            }
                        }

                    }
                })
            }

            return true
        }
    },
    pages: {
        signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
    }
})
