import {Button} from "@/components/ui/button";

export default function EmbedTasks({handleEmbedTasks}: { handleEmbedTasks: () => void }) {


    return (
        <div>
            <form action={handleEmbedTasks}>
                <Button type="submit">Embed Tasks</Button>
            </form>
        </div>
    )
}