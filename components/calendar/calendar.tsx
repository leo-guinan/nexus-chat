'use client'
import {useState} from 'react'
import {Calendar, dateFnsLocalizer, Event} from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import addHours from 'date-fns/addHours'
import startOfHour from 'date-fns/startOfHour'

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import {useTheme} from "next-themes";
import ConnectedAccounts from "@/components/calendar/connected-accounts";
import {CalendarEvent, GoogleCalendar } from '@prisma/client/edge'

const locales = {
    'en-US': enUS,
}
// @ts-ignore
const endOfHour = (date: Date): Date => addHours(startOfHour(date), 1)
const now = new Date()
const start = endOfHour(now)
// @ts-ignore
const end = addHours(start, 2)
// The types here are `object`. Strongly consider making them better as removing `locales` caused a fatal error
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})


interface CalendarComponentProps {
    calendars: GoogleCalendar[]
    events: CalendarEvent[]
}
//@ts-ignore
export default function CalendarComponent({calendars, events}: CalendarComponentProps) {
    const {theme} = useTheme()

    const [displayedEvents, setDisplayedEvents] = useState<Event[]>(events.map(event => {
        return {
            title: event.summary,
            start: new Date(event.start),
            end: new Date(event.end),
        }

    }))



    return (
        <div className="flex">

            <div className="flex flex-row w-3/4">
                <Calendar
                    defaultView='week'
                    events={displayedEvents}
                    localizer={localizer}
                    style={{height: '100vh'}}
                    className=""
                />
            </div>
            <div className="flex w-1/4">
                <ConnectedAccounts calendars={calendars} />
            </div>
        </div>
    )
}