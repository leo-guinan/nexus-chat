'use client'

import {cn} from '@/lib/utils'
import React, {useEffect, useState} from 'react'
import ThoughtRecorder from "@/components/thought-recorder";
import {Thought} from "@/components/thought";
import {addThoughtToContext} from "@/app/actions";
import {Thought as ThoughtType} from "@/lib/types";
const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'



export interface ContextProps extends React.ComponentProps<'div'> {
    initialThoughts?: ThoughtType[]
    contextName: string
    contextId: number
}

export function ThoughtContext({contextId, contextName, initialThoughts, className}: ContextProps) {
    const [thoughts, setThoughts] = useState<ThoughtType[]>()

    useEffect(() => {
        // const newThoughts = initialThoughts?.map((thought) => thought.content) ?? []
        setThoughts(initialThoughts)
    }, [initialThoughts])

    const rememberThought = async (thoughtContent: string) => {
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
            <div className="p-4">
                <ThoughtRecorder rememberThought={rememberThought}/>
            </div>
            <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
                {thoughts?.map((thought) => (
                    <>
                        <Thought thought={thought}/>
                    </>
                ))}
            </div>


        </>
    )
}
