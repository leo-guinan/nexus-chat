"use client"
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/A9qOypuxaFv
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { AvatarImage, Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {GoogleCalendar} from "@prisma/client/edge";
import {useState} from "react";

interface ConnectedAccountProps {
    calendars: GoogleCalendar[]

}

export default function ConnectedAccounts({calendars}: ConnectedAccountProps) {
    const [displayedCalendars, setDisplayedCalendars] = useState(calendars)
   const connectCalendar = async () => {
        // Redirect to the backend endpoint to start the OAuth process
        window.location.href = '/api/integrations/auth/google/start';
    };

    const disconnectCalendar = async (calendarId: number) => {
          // remove the calendar from the list of calendars
            // make a request to the backend to remove the calendar
            setDisplayedCalendars(displayedCalendars.filter(calendar => calendar.id !== calendarId));
            await fetch('/api/calendar/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({calendarId: calendarId}),
            });

     };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>You can manage your connected Google Calendar accounts here.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {displayedCalendars.map((account, i) => (
              <div className="flex items-center justify-between p-4" key={i}>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center space-x-2">
                    <div className="flex flex-row font-semibold">{account.name}</div>
                    <div className="flex flex-row text-gray-500">{account.email}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => disconnectCalendar(account.id)}>
                  Disconnect
                </Button>
              </div>
          ))}


        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" onClick={connectCalendar}>Connect another account</Button>
      </CardFooter>
    </Card>
  )
}

