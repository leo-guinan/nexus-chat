import {OAuth2Client} from 'google-auth-library';
import {NextResponse} from 'next/server';
import {prisma} from "@/lib/utils";
import {auth} from "@/auth";
import {google as googleapis} from 'googleapis';
import {add} from 'date-fns';

export const runtime = 'nodejs'

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/auth/google/callback`
);

export async function GET(req: Request,
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/error`);

    }
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return NextResponse.redirect('/error');
    }

    try {
        const {tokens} = await client.getToken(code);
        client.setCredentials(tokens);
        console.log("tokens ", tokens)

        const peopleService = googleapis.people({
            version: 'v1',
            auth: client
        });

        const profile = await peopleService.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,names'
        });

        console.log("profile", profile.data)
        // Extract email and name from the profile data
        const email = profile.data.emailAddresses?.[0].value;
        const name = profile.data.names?.[0].displayName;
        const gcal = await prisma.googleCalendar.create({
            data: {
                accessToken: tokens.access_token as string,
                refreshToken: tokens.refresh_token,
                tokenType: tokens.token_type as string,
                expiryDate: new Date(Number(tokens.expiry_date)),
                name: name,
                email: email,
                user: {
                    connect: {
                        id: session.user.id
                    }
                }
            }
        })
        const userObject = await prisma.user.findFirst({
            where: {
                id: session.user.id
            }
        })
        const currentDate = new Date(); // Get the current date
        const maxDate = add(currentDate, {months: 1}); // Add one month to the current date


        const calendar = googleapis.calendar({version: 'v3', auth: client});
        const calendarId = 'primary';  // Assuming you want to fetch events from the primary calendar
        const eventsResponse = await calendar.events.list({
            calendarId: calendarId,
            timeMin: userObject!.createdAt.toISOString(),  // Adjust based on the time range you want to fetch
            timeMax: maxDate.toISOString(),
            maxResults: 100,  // You can increase this or implement pagination
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = eventsResponse.data.items;
        if (events) {
            console.log("Number of events: ", events.length);
            console.log("Events: ", events);
            (async function loop() {
                for (let i = 0; i < events.length; i++) {
                    const event = events[i]
                    await prisma.calendarEvent.create({
                        data: {
                            googleEventId: event.id as string,
                            summary: event.summary,
                            description: event.description,
                            // shouldn't ever have the issue where both are null, but just in case, just use the current time for start/end
                            start: event.start?.dateTime ? new Date(event.start?.dateTime) : new Date(event.start?.date ?? ""),
                            end: event.end?.dateTime ? new Date(event.end?.dateTime) : new Date(event.end?.date ?? ""),
                            googleCalendar:
                                {
                                    connect: {
                                        id: gcal.id
                                    }
                                }
                        }
                    })

                }

            })();


        }


        console.log("gcal", gcal)

        // Here, save the tokens securely in your database
        // and associate them with the user's session or account.

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/calendar`);
    } catch (error) {
        console.error('Error retrieving access token', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/error`);
    }
}