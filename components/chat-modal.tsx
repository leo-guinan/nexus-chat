import * as React from 'react'
import {Fragment} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {CheckIcon} from '@heroicons/react/24/outline'
import {PromptForm} from "@/components/prompt-form";
import {type Message, useChat} from "ai/react/dist";
import {toast} from "react-hot-toast";
import {usePathname, useRouter} from "next/navigation";
import {useLocalStorage} from "@/lib/hooks/use-local-storage";
import {ChatList} from "@/components/chat-list";
import {ChatScrollAnchor} from "@/components/chat-scroll-anchor";
import {EmptyScreen} from "@/components/empty-screen";

export interface ChatModalProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    open: boolean
    setOpen: (v: boolean) => void
}

export function ChatModal({open, setOpen, id, initialMessages, className}: ChatModalProps) {
    const router = useRouter()
    const path = usePathname()
    const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
        'ai-token',
        null
    )
    const {messages, append, reload, stop, isLoading, input, setInput} =
        useChat({
            initialMessages,
            id,
            body: {
                id,
                previewToken
            },
            onResponse(response) {
                if (response.status === 401) {
                    toast.error(response.statusText)
                }
            },
            onFinish() {
                if (!path.includes('chat')) {
                    window.history.pushState({}, '', `/chat/${id}`)
                }
            }
        })

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel
                                className="relative transform overflow-hidden rounded-lg dark:bg-zinc-950 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                <div>
                                    <div
                                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true"/>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title as="h3"
                                                      className="text-base font-semibold leading-6 text-gray-900">
                                            What do you want to do?
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            {messages.length ? (
                                                <>
                                                    <ChatList messages={messages}/>
                                                    <ChatScrollAnchor trackVisibility={isLoading}/>
                                                </>
                                            ) : (
                                                <EmptyScreen setInput={setInput}/>
                                            )}
                                            <PromptForm
                                                onSubmit={async value => {
                                                    await append({
                                                        id,
                                                        content: value,
                                                        role: 'user'
                                                    })
                                                }}
                                                input={input}
                                                setInput={setInput}
                                                isLoading={isLoading}
                                            />z
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        onClick={() => setOpen(false)}
                                    >
                                        Back
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}