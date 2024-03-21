import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";

export default function ThoughtFilter({filterThoughts}: {filterThoughts: (thoughtFilter:string) => void }) {
    const [thoughtFilter, setThoughtFilter] = useState("")
  const handleFilter = (thoughtFilter:string) => {
    filterThoughts(thoughtFilter)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleFilter(thoughtFilter);
    }
  }
    return (
        <>
            <div className="flex flex-col w-full items-center space-y-4">
                <div className="w-full max-w-sm flex flex-col space-y-2">
                    <div className="grid gap-1">
                        <label className="text-sm font-medium leading-none peer-[translate-y-3]" htmlFor="thought">
                            Find Thoughts Related To
                        </label>
                        <Input
                            id="thought-filter"
                            placeholder="Type your thought"
                            onChange={(e) => setThoughtFilter(e.target.value)}
                            value={thoughtFilter}
                            onKeyDown={handleKeyPress}
                        />
                    </div>
                    <Button className="self-end mt-2" onClick={() => handleFilter(thoughtFilter)}>Find Related</Button>
                </div>

            </div>
        </>
    )
}