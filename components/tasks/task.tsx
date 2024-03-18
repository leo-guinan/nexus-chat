import SortableItem from "@/components/sortable-item";
import {Button} from "@/components/ui/button";
import {SyntheticEvent} from "react";

interface TaskProps {
    task: {
        id: number;
        name: string;
        details: string;
        priority: number;
    },
    onComplete: (id: number) => Promise<void>;
}

export default function Task({task, onComplete}: TaskProps) {

    const handleClick = async (e: SyntheticEvent) => {
        e.preventDefault()
        console.log("handling click")
         await onComplete(task.id)
    }

    return (
        <SortableItem id={task.id}>
            <div className="p-4 border" id={task?.id?.toString()}>
                <div className="flex items-center space-x-4 ">
                    <div className="size-4 bg-gray-200 rounded-full"/>
                    <div className="flex-1 space-y-1">
                        <h3 className="text-sm font-semibold">{task.name}</h3>
                        <p className="text-sm leading-none text-gray-500">{task.details}</p>
                    </div>
                    <div>

                        <div className="min-w-[140px]" data-no-dnd="true">
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