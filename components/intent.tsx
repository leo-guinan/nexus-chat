import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import * as React from "react";

interface IntentProps {
    whatToDo: string
    setWhatToDo: (value: string) => void
    clearSearch: () => void
    searchForMatchingThoughts: () => void

}

export default function Intent({whatToDo, setWhatToDo, clearSearch, searchForMatchingThoughts}: IntentProps) {
    return (
        <div className="mt-4 flex flex-col w-full">
            <div className="flex flex-row w-full">
                <Input className="flex-1 w-full sm:w-auto"
                       placeholder="What do you want to do"
                       type="search"
                       value={whatToDo}
                       onChange={(e) => setWhatToDo(e.target.value)}/>
            </div>
            <div className="flex flex-row w-full p-2 justify-center">
                <Button className="flex m-2" variant="outline"
                        onClick={clearSearch}>
                    Clear
                </Button>

                <Button className="flex m-2"
                        onClick={searchForMatchingThoughts}>
                    Create Plan
                </Button>
            </div>
        </div>
    )
}