import {useState} from "react";
import {type Thought} from "@/lib/types";
import {Button} from "@/components/ui/button";
import {DoSomethingModal} from "@/components/do-something-modal";

export function Thought({thought}: {thought: Thought}) {
    const [open, setOpen] = useState(false)
    const handleCapture = () => {
        setOpen(true)
    }

    return (
        <div className="w-full max-w-sm border border-gray-200 rounded-lg p-4">
            <p className="text-sm  peer-[translate-y-2]">{thought.content}</p>

            <div className="flex items-center gap-4 peer:grid peer:gap-4">
                <time className="text-sm not-italic peer-[translate-y-1] text-gray-500">{thought.createdAt}</time>
                <Button className="ml-auto" size="sm" onClick={handleCapture}>
                    Do
                </Button>
            </div>
            <DoSomethingModal open={open} setOpen={setOpen} initialThoughts={[thought]} />
        </div>
    )
}