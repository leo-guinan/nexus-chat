'use client'

import {type Message} from 'ai/react'

import {cn} from '@/lib/utils'
import React, {useState} from 'react'
import ThoughtRecorder from "@/components/thought-recorder";
import {Thought} from "@/components/thought";

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'


export interface ContextProps extends React.ComponentProps<'div'> {
    initialThoughts?: string[]
    id?: string
}

export function ThoughtContext({id, initialThoughts, className}: ContextProps) {
    const [thoughts, setThoughts] = useState<string[]>([])

    const rememberThought = (thought: string) => {
        console.log(thought)
        setThoughts([thought, ...thoughts])
    }

    return (
        <>
            <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
                {thoughts.map((thought) => (
                    <>
                        <Thought thought={thought} />
                    </>
                ))}
            </div>
            <ThoughtRecorder rememberThought={rememberThought}/>


        </>
    )
}
