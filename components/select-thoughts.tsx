import SelectableThought from "@/components/selectable-thought";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {Thought} from "@/lib/types";


interface SelectThoughtProps {
    matchedThoughts: Thought[]
    handleCheckChange: (thought: Thought, selected:boolean) => void
    checkedThoughts: Thought[]
    handleClose: () => void
    createDocument: () => void

}
export default function SelectThoughts({matchedThoughts, handleCheckChange, checkedThoughts, handleClose, createDocument}: SelectThoughtProps    ) {
    return (
        <>
            <div className="p-0">
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {matchedThoughts.map((thought) => (
                        <SelectableThought key={thought.id}
                                           thought={thought}
                                           handleChange={handleCheckChange}
                                           selected={!!checkedThoughts.find((value) => value.id === thought.id)}/>
                    ))}
                </div>
            </div>
            <div>
                <Button variant="outline"
                        onClick={handleClose}>Cancel</Button>
                <Button className="ml-2"
                        onClick={createDocument}>Confirm</Button>
            </div>
        </>
    )
}