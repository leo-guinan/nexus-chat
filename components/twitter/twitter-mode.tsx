'use client'

import {TwitterThoughtType} from "@/lib/types";
import TwitterThought from "./twitter-thought";
import React, {useEffect, useState} from "react";
import TwitterInput from "@/components/twitter/twitter-input";
import {User} from "@prisma/client/edge";
import Link from "next/link";


interface TwitterModeProps {
    thoughts: TwitterThoughtType[]
    user: User
    contextId: number
    showInput?: boolean
    selectedId?: number
}

export default function TwitterMode({thoughts, user, contextId, selectedId}: TwitterModeProps) {
    const [displayedThoughts, setDisplayedThoughts] = useState<TwitterThoughtType[]>([])

    useEffect(() => {
        if (selectedId) {
            const selectedThought = thoughts.find(thought => thought.id === selectedId)
            if (selectedThought) {
                setDisplayedThoughts([selectedThought, ...thoughts.filter(thought => thought.id !== selectedId)])
            }
        } else {
            setDisplayedThoughts(thoughts)
        }

    }, [])


    return (
        <div>
            <div className="flex flex-col max-w-xl mx-auto">
                <ul className="flex flex-col space-y-2 w-full">
                    {!selectedId && (
                        <li className="border w-full"><TwitterInput contextId={contextId} thoughts={displayedThoughts}
                                                                    setThoughts={setDisplayedThoughts}
                        /></li>
                    )}

                    {displayedThoughts.map(thought => (
                        <li key={thought.id} className="border w-full">
                                <TwitterThought
                                    thought={thought}
                                    user={user}
                                    contextId={contextId}
                                    displayedThoughts={displayedThoughts}
                                    setDisplayedThoughts={setDisplayedThoughts}
                                    reply={!!selectedId}
                                />
                        </li>
                    ))}
                </ul>
            </div>


        </div>
    )
}