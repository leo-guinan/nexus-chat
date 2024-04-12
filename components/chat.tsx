'use client'


import {cn} from '@/lib/utils'
import {ChatList} from '@/components/chat-list'
import {ChatPanel} from '@/components/chat-panel'
import {EmptyScreen} from '@/components/empty-screen'
import {ChatScrollAnchor} from '@/components/chat-scroll-anchor'
import {ComponentProps, useEffect, useState} from "react";
import {sendChatMessage} from "@/app/actions/chats";
import {usePathname, useRouter} from "next/navigation";

export interface ChatProps extends ComponentProps<'div'> {
    initialMessages: {
        content: string
        role: string
        id: string
    }[]
    sessionId: string
    userId?: string
}

export function Chat({sessionId, initialMessages, className}: ChatProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // if session id not in the url, add it
        if (sessionId && !pathname.includes(sessionId)) {
            router.push(`/chat/${sessionId}`, undefined)
        }
    })

    const sendMessage = async (message: { content: string, role: "user" }) => {
        setIsLoading(true)
        try {
            console.log("Getting response...")
            setMessages([...messages, {
                content: message.content,
                role: message.role,
                id: "temp"
            }])

            const response = await sendChatMessage(sessionId, message)

            if ('error' in response) {
                console.error(response.error)
                return
            }
            console.log("response", response)

            setMessages([...messages,
                {
                    content: message.content,
                    role: message.role,
                    id: "temp"
                },
                {
                    content: response.content,
                    role: response.role,
                    id: response.id

                }])
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
                {messages.length ? (
                    <>
                        <ChatList messages={messages}/>
                        <ChatScrollAnchor trackVisibility={isLoading}/>
                    </>
                ) : (
                    <EmptyScreen/>
                )}
            </div>
            <ChatPanel
                isLoading={isLoading}
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
            />


        </>
    )
}
