import SortableItem from "@/components/sortable-item";
import {Button} from "@/components/ui/button";
import {SyntheticEvent, useState} from "react";
import Link from "next/link";

interface TaskProps {
    task: {
        id: number;
        name: string;
        description: string | null;
        priority?: number;
        uuid: string;
    },
    onComplete: (id: number) => Promise<void>;
}

export default function Task({task, onComplete}: TaskProps) {

    const [open, setOpen] = useState(false)

    const handleClick = async (e: SyntheticEvent) => {
        e.preventDefault()
        console.log("handling click")
        await onComplete(task.id)
    }

    const showDetails = () => {
        console.log("showing details")
        setOpen(true)
    }

    return (
        <SortableItem id={task.id}>
            <div className="p-4 border" id={task?.id?.toString()}>
                <div className="flex items-center space-x-4 ">
                    <div className="size-4 bg-gray-200 rounded-full"/>
                    <div className="flex-1 space-y-1">
                        <h3 className="text-sm font-semibold">{task.name}</h3>
                        <p className="text-sm leading-none text-gray-500">{task.description}</p>
                    </div>
                    <div className="p-2">

                        <div className="min-w-[140px] my-2" data-no-dnd="true">
                            <Link type="button" href={`/tasks/${task.uuid ?? task.id}`} className="hover:underline">
                                <Button size="sm" className="min-w-36">
                                    Details
                                </Button>
                            </Link>

                        </div>

                        <div className="min-w-[140px] my-2" data-no-dnd="true">

                            <Button size="sm" onClick={handleClick}>Mark as Complete</Button>
                        </div>
                        {/*    <div>*/}
                        {/*        <div className="size-4 mr-2"/>*/}
                        {/*        Edit*/}
                        {/*    </div>*/}
                        {/*    <div>*/}
                        {/*        <div className="size-4 mr-2"/>*/}
                        {/*        Delete*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                    <div className="size-4 cursor-move opacity-50"/>
                </div>
            </div>
        </SortableItem>
    )
}