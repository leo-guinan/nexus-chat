import * as React from 'react'
import {PromptForm} from '@/components/prompt-form'
import {ButtonScrollToBottom} from '@/components/button-scroll-to-bottom'
import {FooterText} from '@/components/footer'

export interface ChatPanelProps {
    input: string
    setInput: React.Dispatch<React.SetStateAction<string>>
    sendMessage: (message: { content: string; role: 'user' }) => void
    isLoading: boolean
}


export function ChatPanel({
                              input,
                              setInput,
                              sendMessage,
                              isLoading
                          }: ChatPanelProps) {
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false)

    return (
        <div
            className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
            <ButtonScrollToBottom/>
            <div className="mx-auto sm:max-w-2xl sm:px-4">
                <div className="px-4 py-2 space-y-4 border-t shadow-lg bg-background sm:rounded-t-xl sm:border md:py-4">
                    <PromptForm
                        onSubmit={async value => {
                            await sendMessage({
                                content: value,
                                role: 'user'
                            })
                        }}
                        input={input}
                        setInput={setInput}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    )
}
