import * as React from 'react'
import {Fragment} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {CheckIcon} from '@heroicons/react/24/outline'
import {type Message} from "ai/react";
import {Thought} from "@/lib/types";
import {findRelatedThoughts} from "@/app/(actions)/actions/thoughts";
import {generateDocument} from "@/app/(actions)/actions/documents";
import Link from "next/link";
import LoadingSpinner from "@/components/loading-spinner";
import Intent from "@/components/intent";
import SelectThoughts from "@/components/select-thoughts";

export interface ChatModalProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    initialThoughts: Thought[]
    id?: string
    open: boolean
    setOpen: (v: boolean) => void
}

export function DoSomethingModal({open, setOpen, id, initialThoughts, className}: ChatModalProps) {


    const [whatToDo, setWhatToDo] = React.useState<string>('')

    const [waitOn, setWaitOn] = React.useState<string>('')

    const [readyToWork, setReadyToWork] = React.useState<boolean>(false)

    const [matchedThoughts, setMatchedThoughts] = React.useState<Thought[]>([...initialThoughts])
    const [checkedThoughts, setCheckedThoughts] = React.useState<Thought[]>([])

    const [documentUrl, setDocumentUrl] = React.useState<string>('')
    const [error, setError] = React.useState<string>('')

    const clearSearch = () => {
        setMatchedThoughts([])
    }

    const handleClose = () => {
        setReadyToWork(false)
        setWhatToDo('')
        setOpen(false)
    }

    const handleCheckChange = (thought: Thought, selected: boolean) => {

        if (selected) {
            setCheckedThoughts([...checkedThoughts, thought])
        } else {
            setCheckedThoughts(checkedThoughts.filter(t => t.id !== thought.id))
        }
    }

    const searchForMatchingThoughts = async () => {

        setWaitOn("Searching for matching thoughts...")
        try {


            console.log("searching for matching thoughts")

            const relatedThoughts = await findRelatedThoughts(initialThoughts, whatToDo)
            if ('error' in relatedThoughts) {
                console.error("error", relatedThoughts.error)
                setError("Error finding related thoughts")
                setWaitOn('')

                return
            }

            setMatchedThoughts([...relatedThoughts])
            setCheckedThoughts([...relatedThoughts])

            setReadyToWork(true)
        } catch (e) {
            console.error("error", e)
            setError("Error finding related thoughts")
        }
        setWaitOn('')
    }

    const createDocument = async () => {
        setWaitOn("Creating action plan...")
        try {
            const documentResponse = await generateDocument(checkedThoughts, whatToDo)
            console.log("documentResponse", documentResponse)
            if ('error' in documentResponse) {
                console.error("error", documentResponse.error)
                setError("Error generating action plan")
                setWaitOn('')
                return
            }



            setDocumentUrl(`/document/${documentResponse.uuid}`)
        } catch (e) {
            console.error("error", e)
            setError("Error generating action plan")
        }
        setWaitOn('')

    }

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
                                {error && (
                                    <div className="bg-red-100 p-4 rounded-lg">
                                        <p className="text-red-600">{error}</p>
                                    </div>
                                )}
                                {waitOn && (
                                    <>
                                        <LoadingSpinner label={waitOn}/>
                                    </>
                                )}
                                {!waitOn && (
                                    <>
                                        {!documentUrl && (
                                            <>
                                                <div>

                                                    <div
                                                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                                        <CheckIcon className="h-6 w-6 text-green-600"
                                                                   aria-hidden="true"/>
                                                    </div>
                                                    <div className="mt-3 text-center sm:mt-5">
                                                        <Dialog.Title as="h3"
                                                                      className="text-base font-semibold leading-6">
                                                            What do you want to do?
                                                        </Dialog.Title>
                                                        <div>
                                                            {!readyToWork && (
                                                                <Intent clearSearch={clearSearch}
                                                                        searchForMatchingThoughts={searchForMatchingThoughts}
                                                                        setWhatToDo={setWhatToDo} whatToDo={whatToDo}/>
                                                            )}

                                                            {readyToWork && (
                                                                <SelectThoughts matchedThoughts={matchedThoughts}
                                                                                handleCheckChange={handleCheckChange}
                                                                                checkedThoughts={checkedThoughts}
                                                                                handleClose={handleClose}
                                                                                createDocument={createDocument}/>
                                                            )}

                                                        </div>
                                                        {/*<div className="mt-2">*/}
                                                        {/*    {messages.length ? (*/}
                                                        {/*        <>*/}
                                                        {/*            <ChatList messages={messages}/>*/}
                                                        {/*            <ChatScrollAnchor trackVisibility={isLoading}/>*/}
                                                        {/*        </>*/}
                                                        {/*    ) : (*/}
                                                        {/*        <EmptyScreen setInput={setInput}/>*/}
                                                        {/*    )}*/}
                                                        {/*    <PromptForm*/}
                                                        {/*        onSubmit={async value => {*/}
                                                        {/*            await append({*/}
                                                        {/*                id,*/}
                                                        {/*                content: value,*/}
                                                        {/*                role: 'user'*/}
                                                        {/*            })*/}
                                                        {/*        }}*/}
                                                        {/*        input={input}*/}
                                                        {/*        setInput={setInput}*/}
                                                        {/*        isLoading={isLoading}*/}
                                                        {/*    />*/}
                                                        {/*</div>*/}

                                                    </div>
                                                </div>
                                                {/*<div className="mt-5 sm:mt-6">*/}
                                                {/*    <button*/}
                                                {/*        type="button"*/}
                                                {/*        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"*/}
                                                {/*        onClick={handleClose}*/}
                                                {/*    >*/}
                                                {/*        Back*/}
                                                {/*    </button>*/}
                                                {/*</div>*/}
                                            </>
                                        )}
                                        {documentUrl && (
                                            <Link href={documentUrl}>
                                                View Action Plan
                                            </Link>
                                        )}
                                    </>
                                )}


                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}