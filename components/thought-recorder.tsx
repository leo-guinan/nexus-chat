import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import React, {useState} from "react";

export default function ThoughtRecorder({rememberThought}: {rememberThought: (thought:string) => void}) {
  const [thought, setThought] = useState("")
  const handleThought = (thought:string) => {
    rememberThought(thought)
    setThought("")
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleThought(thought);
    }
  }

  return (
    <div className="flex flex-col w-full items-center space-y-4">
      <div className="w-full max-w-sm flex flex-col space-y-2">
        <div className="grid gap-1">
          <label className="text-sm font-medium leading-none peer-[translate-y-3]" htmlFor="thought">
            Your thought
          </label>
          <Input
              id="thought"
              placeholder="Type your thought"
              onChange={(e) => setThought(e.target.value)}
              value={thought}
              onKeyDown={handleKeyPress}
          />
        </div>
        <Button className="self-end mt-2" onClick={() => handleThought(thought)}>Save thought</Button>
      </div>

    </div>
  )
}

