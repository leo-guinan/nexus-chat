import React, {useState} from "react";
import {addThoughtToContext} from "@/app/actions/thoughts";
import {TwitterThoughtType} from "@/lib/types";
import {Textarea} from "@/components/ui/textarea";


interface TwitterInputProps {
    thoughts: TwitterThoughtType[]
    setThoughts: (thoughts: TwitterThoughtType[]) => void
    contextId: number
    placeholder?: string
    parentThoughtId?: number

}

export default function TwitterInput({
                                         thoughts,
                                         setThoughts,
                                         contextId,
                                         parentThoughtId,
                                         placeholder = "What is happening?!"
                                     }: TwitterInputProps) {
    const [content, setContent] = useState('')

    const handleThought = async (thought: string) => {
        const rememberThought = async (thoughtContent: string) => {


            if (parentThoughtId) {
                const parentThought = thoughts.find(thought => thought.id === parentThoughtId)
                if (parentThought) {
                    parentThought.replies += 1
                    setThoughts([
                        parentThought,
                        {
                            id: -1,
                            content: thoughtContent,
                            contextId: contextId,
                            createdAt: "Now",
                            userId: "",
                            uuid: "",
                            source: "human",
                            likes: 0,
                            replies: 0

                        },
                        ...thoughts.filter(thought => thought.id !== parentThoughtId)
                    ])
                } else {
                    console.log("This shouldn't happen, parent not found")
                }
            } else {

                setThoughts([{
                    id: -1,
                    content: thoughtContent,
                    contextId: contextId,
                    createdAt: "Now",
                    userId: "",
                    uuid: "",
                    source: "human",
                    likes: 0,
                    replies: 0

                }, ...thoughts])
            }
            const thought = await addThoughtToContext(contextId, thoughtContent, parentThoughtId)
            if ('error' in thought) {
                console.error(thought.error)
                return
            }
            console.log(thought)
            if (thoughts) {
                if (parentThoughtId) {
                    const parentThought = thoughts.find(thought => thought.id === parentThoughtId)
                    if (parentThought) {
                        parentThought.replies += 1

                        setThoughts([
                            parentThought,
                            {
                                ...thought,
                                source: "user",
                                likes: 0,
                                replies: 0,
                                userId: ""
                            },
                            ...thoughts.filter(thought => thought.id !== parentThoughtId)
                        ])
                    } else {
                        console.log("This shouldn't happen, parent not found")
                    }

                } else {
                    setThoughts([{
                        ...thought,
                        source: "user",
                        likes: 0,
                        replies: 0,
                        userId: ""

                    }, ...thoughts])
                }
            } else {
                setThoughts([{
                    ...thought,
                    source: "user",
                    likes: 0,
                    replies: 0,
                    userId: ""

                }])
            }
        }
        setContent("")
        await rememberThought(thought)
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            if (event.metaKey || event.ctrlKey) {
                // Cmd+Enter or Ctrl+Enter, insert a new line
                setContent(prevContent => prevContent + '\n');
                event.preventDefault(); // Prevent form submission
            } else {
                // Just Enter, submit the form/content
                console.log('Submitting content:', content);
                handleThought(content);
                event.preventDefault(); // Prevent the default action (new line in textarea)
            }
        }

    }


    return (
        <div className="p-2 flex flex-col h-full">
            <div className="flex items-center gap-4 grow " style={{minHeight: '4.5rem'}}>
                <Textarea
                    className="flex size-full"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={handleKeyPress}
                />
            </div>
            <div className="border-t-2 mt-8 p-2 flex justify-end">
                <button
                    onClick={() => handleThought(content)}
                    className="bg-blue-500 text-white rounded-lg py-2 px-4"

                >Save
                </button>
            </div>

        </div>
    )

}