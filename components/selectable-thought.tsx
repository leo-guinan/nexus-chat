import {Card, CardContent} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import { Thought } from "@/lib/types";
import * as React from "react";

interface SelectableThoughtProps {
    thought: Thought
    selected: boolean
    handleChange: (thought: Thought, selected: boolean) => void
}

export default function SelectableThought({thought, selected, handleChange}: SelectableThoughtProps) {

    const handleCheck = (checked: boolean) => {
        handleChange(thought, checked)
    }

    return (
        <>
            <Card>
                <CardContent
                    className="flex flex-row items-start gap-4 p-4">
                    <Checkbox
                        id={thought.id.toString()}
                        checked={selected}
                        onCheckedChange={handleCheck}/>
                    <div
                        className="grid grid-cols-1 gap-2">
                        <Label
                            htmlFor="item1">{thought.content}</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Thought
                            Data maybe</p>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}