'use client'
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ft4KC6XsKeW
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {closestCenter, DndContext, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import {useEffect, useState} from "react";
import {KeyboardSensor, PointerSensor, TouchSensor} from "@/utils/dnd/smart-sensors";
import {completeTask, prioritizeTasks} from "@/app/actions/tasks";
import {Task as TaskType} from "@/lib/types";
import Task from "@/components/tasks/task";


interface TasksProps {
    initialTasks: TaskType[]
    userId: string
    label?: string
}

export default function Tasks({initialTasks, userId, label = "Tasks"}: TasksProps) {

    const [prioritizedTasks, setPrioritizedTasks] = useState<TaskType[]>(initialTasks)


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
        useSensor(TouchSensor)
    );

    const handleDragEnd = (event: any) => {
        const {active, over} = event;

        if (active.id !== over.id) {
            const oldIndex = prioritizedTasks.findIndex(task => task.id === active.id);
            const newIndex = prioritizedTasks.findIndex(task => task.id === over.id);
            setPrioritizedTasks((tasks) => {
                const updatedTasks = [...tasks];
                const [movedItem] = updatedTasks.splice(oldIndex, 1);
                updatedTasks.splice(newIndex, 0, movedItem);
                return updatedTasks;
            });
        }
    };

    useEffect(() => {
        void prioritizeTasks(userId, prioritizedTasks.map((task: TaskType, index: number) => {
            return {
                task: task,
                priority: index
            }
        }));

    }, [prioritizedTasks, userId])

    const handleCompleteTask = async (id: number) => {
        console.log("completing task with id", id)
        await completeTask(userId, id)
        setPrioritizedTasks((tasks) => {
            return tasks.filter(task => task.id !== id)
        })
    }

    return (
        <div className="grid gap-4 w-full">
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">{label}</h2>
                        <p className="text-sm font-medium leading-none text-gray-500">Drag and drop to reorder</p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={prioritizedTasks}>
                                {prioritizedTasks.map((task) => (
                                    <Task task={task} key={task.id} onComplete={handleCompleteTask}/>
                                ))}
                            </SortableContext>
                        </DndContext>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

