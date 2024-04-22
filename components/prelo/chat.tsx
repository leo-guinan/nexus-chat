'use client'
import {ChatList} from "@/components/chat-list";
import {ChatScrollAnchor} from "@/components/chat-scroll-anchor";
import {EmptyScreen} from "@/components/empty-screen";
import {ChatPanel} from "@/components/chat-panel";
import {useEffect, useState} from "react";
import {nanoid} from "@/lib/utils";
import {usePathname, useRouter} from "next/navigation";
import {sendPreloChatMessage} from "@/app/actions/prelo";

interface PreloChatMessage {
    id: string
    content: string
    role: string
}

interface PreloChatProps {
    messages: PreloChatMessage[]
    chatId: string
}

export default function PreloChat({messages, chatId}: PreloChatProps) {
    const [displayedMessages, setDisplayedMessages] = useState<PreloChatMessage[]>(messages)
    const [isLoading, setIsLoading] = useState(false)
    const [input, setInput] = useState('')
    const router = useRouter()
    const pathname = usePathname()
    useEffect(() => {
        // if session id not in the url, add it
        if (chatId && !pathname.includes(chatId)) {
            router.push(`/prelo/chat/${chatId}`, undefined)
        }
    })
    const sendMessage = async (message: { content: string, role: "user" }) => {
        if (!message.content) return
        setIsLoading(true)
        try {
            console.log("Getting response...")
            setDisplayedMessages([...displayedMessages, {
                content: message.content,
                role: message.role,
                id: "temp"
            },
                {
                    content: "...",
                    role: 'assistant',
                    id: "temp"
                }
            ])

            const response = await sendPreloChatMessage({
                ...message,
                chatId
            })

            if ('error' in response) {
                console.error(response.error)
                return
            }
            console.log("response", response)

            setDisplayedMessages([...displayedMessages,
                {
                    content: message.content,
                    role: message.role,
                    id: nanoid()
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
            <div className={'pb-[200px] pt-4 md:pt-10'}>
                {messages.length ? (
                    <>
                        <ChatList messages={displayedMessages}/>
                        <ChatScrollAnchor/>
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