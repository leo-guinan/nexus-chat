'use client'
import {useEffect, useRef, useState} from "react";
import {ICloseEvent, IMessageEvent, w3cwebsocket as W3CWebSocket} from "websocket";

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
            <h1>Pitch Deck Analysis</h1>
            <div className="text-base leading-6 cursor-text select-all flex flex-row">
                <pre className="whitespace-pre-wrap font-sans">
                    {displayedReport}
                </pre>
            </div>
        </div>
    );
}