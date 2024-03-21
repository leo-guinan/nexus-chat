import {Button} from "@/components/ui/button";

interface GenerateTasksProps {
    generateTasks: () => Promise<void>
}

export default function GenerateTasks({generateTasks}: GenerateTasksProps) {

    const handleSubmit = async (data: FormData) => {
        "use server"
        await generateTasks()

    }


    return (
        <div className="flex flex-row my-auto">
            <form action={handleSubmit}>
                <Button type="submit">
                    Generate Tasks From Plan
                </Button>
            </form>
        </div>
    );
}