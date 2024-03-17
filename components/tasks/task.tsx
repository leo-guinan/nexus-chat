import SortableItem from "@/components/sortable-item";

interface TaskProps {
    task: {
        id: number;
        name: string;
        details: string;
        priority: number;
    }
}

export default function Task({task}: TaskProps) {

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
                        <div className="p-2 rounded-full hover:bg-gray-100">
                            <div className="size-4 text-gray-400"/>
                        </div>
                        {/*<div className="min-w-[140px]">*/}
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