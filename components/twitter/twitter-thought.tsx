/**
 * v0 by Vercel.
 * @see https://v0.dev/t/JcIxb8kG4s2
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {ChatBubbleLeftRightIcon, HeartIcon} from '@heroicons/react/24/outline'
import {TwitterThoughtType} from "@/lib/types";
import {User} from "@prisma/client/edge";
import TwitterInput from "@/components/twitter/twitter-input";
import React from "react";
import Link from "next/link";

interface TwitterThoughtProps {
    thought: TwitterThoughtType
    user: User
    reply?: boolean
    contextId: number
    displayedThoughts: TwitterThoughtType[]
    setDisplayedThoughts: (thoughts: TwitterThoughtType[]) => void
}

export default function TwitterThought({
                                           thought,
                                           user,
                                           contextId,
                                           displayedThoughts,
                                           setDisplayedThoughts,
                                           reply = false
                                       }: TwitterThoughtProps) {
    const name = thought.source === "submind" ? "Submind" : user?.name
    const initials = thought.source === "submind" ? "SM" : name?.split(" ").map(word => word[0])
    const excludeClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
    }

    const stopDrag = (e: React.DragEvent) => {
        e.preventDefault()
    }
    return (
        <div className="border rounded-lg p-4 w-full">
            <Link href={`/${thought.id}`}>

                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 text-base leading-6">
                        <div className="flex items-center gap-1">
                            <h1 className="font-bold">{name}</h1>
                            <span className="text-sm text-gray-500 dark:text-gray-400">1m</span>
                        </div>
                        <div className="text-base leading-6 cursor-text select-all" onClick={excludeClick} onDragStart={stopDrag}>
                            <pre className="whitespace-pre-wrap font-sans">
                                {thought.content}
                            </pre>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex gap-1">
                                <ChatBubbleLeftRightIcon className="w-4 h-4"/>
                                <span>{thought.replies}</span>
                            </div>
                            <div className="flex gap-1">
                                <HeartIcon className="w-4 h-4"/>
                                <span>{thought.likes}</span>
                            </div>
                        </div>

                    </div>

                </div>
            </Link>
            {reply && (
                <div className="w-full pt-4">
                    <TwitterInput contextId={contextId} thoughts={displayedThoughts}
                                  setThoughts={setDisplayedThoughts} placeholder="What's your reply?"
                                  parentThoughtId={thought.id}
                    />
                </div>
            )}
        </div>
    )
}

