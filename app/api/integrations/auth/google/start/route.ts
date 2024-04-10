import {OAuth2Client} from 'google-auth-library';
import {NextResponse} from "next/server";

export const runtime = 'nodejs'

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/auth/google/callback`
);

export async function GET(req: Request,
) {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
    });

    return NextResponse.redirect(url);
}