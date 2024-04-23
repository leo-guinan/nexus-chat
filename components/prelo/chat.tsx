'use client'
import {ChatList} from "@/components/chat-list";
import {ChatScrollAnchor} from "@/components/chat-scroll-anchor";
import {EmptyScreen} from "@/components/empty-screen";
import {ChatPanel} from "@/components/chat-panel";
import {useEffect, useRef, useState} from "react";
import {nanoid} from "@/lib/utils";
import {usePathname, useRouter} from "next/navigation";
import {sendPreloChatMessage} from "@/app/actions/prelo";
import {ICloseEvent, IMessageEvent, w3cwebsocket as W3CWebSocket} from "websocket";

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
    const client = useRef<W3CWebSocket | null>(null)

    const router = useRouter()
    const pathname = usePathname()
    useEffect(() => {
        // if session id not in the url, add it
        if (chatId && !pathname.includes(chatId)) {
            router.push(`/prelo/chat/${chatId}`, undefined)
        }
    })

    useEffect(() => {

        const connectSocket = () => {

            // client.current = new W3CWebSocket(`ws://localhost:3000/api/socket/`)
            if (chatId) {
                client.current = new W3CWebSocket(
                    `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}prelo/${chatId}/`
                )

                // client.current = new W3CWebSocket(
                //     `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}cofounder/${sessionId}/`
                // )

                client.current.onopen = () => {
                    console.log("WebSocket Client Connected")
                }

                client.current.onmessage = (message: IMessageEvent) => {
                    const data = JSON.parse(message.data.toString())
                    console.log(data)
                    // make sure message id isn't already in the list
                    if (displayedMessages.find(m => m.id === data.id)) return
                    setDisplayedMessages([...displayedMessages, {
                        content: data.message,
                        role: 'assistant',
                        id: data.id
                    }])
                }

                client.current.onclose = (event: ICloseEvent) => {
                    setTimeout(() => {
                        connectSocket()
                    }, 5000) // retries after 5 seconds.
                }

                client.current.onerror = (error: Error) => {
                    console.log(`WebSocket Error: ${JSON.stringify(error)}`)
                }
            }
        }

        connectSocket()
    }, [chatId])

    const sendMessage = async (message: { content: string, role: "user" }) => {
        if (!message.content) return
        setIsLoading(true)
        try {
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