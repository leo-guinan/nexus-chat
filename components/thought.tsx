import {Button} from "@/components/ui/button";
import {ChatModal} from "@/components/chat-modal";
import {useState} from "react";

export function Thought({thought}: {thought: string}) {
    const [open, setOpen] = useState(false)
    const handleCapture = () => {
        setOpen(true)
    }

    return (
        <div className="w-full max-w-sm border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-4 peer:grid peer:gap-4">
                <time className="text-sm font-medium not-italic peer-[translate-y-1]">Just now</time>
                {/*<Button className="ml-auto" size="sm" onClick={handleCapture}>*/}
                {/*    Do*/}
                {/*</Button>*/}
            </div>
            <p className="text-sm text-gray-500 peer-[translate-y-2]">{thought}</p>
            {/*<ChatModal open={open} setOpen={setOpen} />*/}
        </div>
    )
}