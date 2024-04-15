'use client'
import {ChatList} from "@/components/chat-list";
import {ChatScrollAnchor} from "@/components/chat-scroll-anchor";
import {EmptyScreen} from "@/components/empty-screen";
import {ChatPanel} from "@/components/chat-panel";
import {useState} from "react";
import {Message} from "ai";
import {sendOnboardingChatMessage} from "@/app/actions/onboarding";
import {nanoid} from "@/lib/utils";

interface OnboardingChatProps {
    messages: Message[]
}

export default function OnboardingChat({messages}: OnboardingChatProps) {
    const [displayedMessages, setDisplayedMessages] = useState<Message[]>(messages)
    const [isLoading, setIsLoading] = useState(false)
    const [input, setInput] = useState('')
    const sendMessage = async (message: { content: string, role: "user" }) => {
        if (!message.content) return
        setIsLoading(true)
        try {
            console.log("Getting response...")
            setDisplayedMessages([...displayedMessages, {
                content: message.content,
                role: message.role,
                createdAt: new Date(),
                id: "temp"
            },
            {
                content: "...",
                role: 'assistant',
                createdAt: new Date(),
                id: "temp"
            }
            ])

            const response = await sendOnboardingChatMessage(message)

            if ('error' in response) {
                console.error(response.error)
                return
            }
            console.log("response", response)

            //@ts-ignore
            setDisplayedMessages([...displayedMessages,
                {
                    content: message.content,
                    //@ts-ignore
                    role: message.role,
                    createdAt: new Date(),
                    id: nanoid()
                },
                {
                    content: response.content,
                    //@ts-ignore
                    role: response.role,
                    createdAt: new Date(),
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