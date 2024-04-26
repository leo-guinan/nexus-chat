'use client'
import {useEffect, useRef, useState} from "react";
import {ICloseEvent, IMessageEvent, w3cwebsocket as W3CWebSocket} from "websocket";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {CodeBlock} from "@/components/ui/codeblock";
import {MemoizedReactMarkdown} from "@/components/markdown";

interface PitchDeckAnalysisProps {
    pitchDeckAnalysis: string
    uuid: string
}

export default function PitchDeckAnalysis({pitchDeckAnalysis, uuid}: PitchDeckAnalysisProps) {
    const client = useRef<W3CWebSocket | null>(null)
    const [displayedReport, setDisplayedReport] = useState<string>(pitchDeckAnalysis)
    useEffect(() => {

        const connectSocket = () => {

            // client.current = new W3CWebSocket(`ws://localhost:3000/api/socket/`)
            if (uuid) {
                client.current = new W3CWebSocket(
                    `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}prelo/${uuid}/`
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
                    setDisplayedReport(data.message)
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
    }, [uuid])
    return (
        <div>
            <div className="text-base leading-6 cursor-text select-all flex flex-row w-full">
                <MemoizedReactMarkdown
                    className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 mx-auto"
                    remarkPlugins={[remarkGfm, remarkMath]}
                    components={{
                        p({children}) {
                            return <p className="mb-2 last:mb-0">{children}</p>
                        },
                        code({node, inline, className, children, ...props}) {
                            if (children.length) {
                                if (children[0] == '▍') {
                                    return (
                                        <span className="mt-1 cursor-default animate-pulse">▍</span>
                                    )
                                }

                                children[0] = (children[0] as string).replace('`▍`', '▍')
                            }

                            const match = /language-(\w+)/.exec(className || '')

                            if (inline) {
                                return (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                )
                            }

                            return (
                                <CodeBlock
                                    key={Math.random()}
                                    language={(match && match[1]) || ''}
                                    value={String(children).replace(/\n$/, '')}
                                    {...props}
                                />
                            )
                        }
                    }}
                >
                    {displayedReport}
                </MemoizedReactMarkdown>

            </div>
        </div>
    );
}