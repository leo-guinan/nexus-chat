'use client'

import React, {useEffect, useState} from 'react'
import ThoughtRecorder from "@/components/thought-recorder";
import {Thought} from "@/components/thought";
import {Task, Thought as ThoughtType} from "@/lib/types";
import {addThoughtToContext} from "@/app/actions/thoughts";
import Tasks from "@/components/tasks/tasks";

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'


export interface ContextProps extends React.ComponentProps<'div'> {
    initialThoughts?: ThoughtType[]
    initialTasks?: Task[]
    contextName: string
    contextId: number
    userId: string
}

export function TodayContext({contextId, contextName, initialThoughts, initialTasks, className, userId}: ContextProps) {
    const [thoughts, setThoughts] = useState<ThoughtType[]>([])

    useEffect(() => {
        // const newThoughts = initialThoughts?.map((thought) => thought.content) ?? []
        if (initialThoughts) setThoughts(initialThoughts)
    }, [initialThoughts])

    const rememberThought = async (thoughtContent: string) => {

        setThoughts([{
            id: -1,
            content: thoughtContent,
            ownerId: '',
            contextId: contextId,
            createdAt: "Now"
        }, ...thoughts])

        const thought = await addThoughtToContext(contextId, thoughtContent)
        if ('error' in thought) {
            console.error(thought.error)
            return
        }
        console.log(thought)
        if (thoughts) {
            setThoughts([thought, ...thoughts])
        } else {
            setThoughts([thought])
        }
    }


    return (
        <>

            {/*create 2 column tailwind flex container*/}
            <div className="p-4 flex flex-wrap justify-center">
                <div className="flex flex-col w-1/2">
                    <div className="p-4 flex flex-wrap justify-center">
                        <div className="flex flex-col w-1/2">
                            <ThoughtRecorder rememberThought={rememberThought}/>
                        </div>
                        <div className={`flex flex-wrap justify-center pt-4  ${className}`} style={{gap: '1rem'}}>
                            {thoughts?.map((thought, index) => (
                                <div key={index} className='flex justify-center w-full p-2'>
                                    <Thought thought={thought}/>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
                <div className="flex flex-col w-1/2">
                    {/*    Column for today's tasks*/}
                    <Tasks initialTasks={initialTasks ?? []} userId={userId} label={"Today's Tasks"}/>
                </div>
            </div>


        </>
    )
}
