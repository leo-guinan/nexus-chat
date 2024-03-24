import {Button} from "@/components/ui/button";
import Link from "next/link";
import {nanoid} from "@/lib/utils";


export default function GenerateTasks({documentUUID}: {documentUUID: string}) {
    const taskUUID = nanoid()

    return (
        <div className="flex flex-row my-auto">
            <Link href={`/tasks/generating?documentUUID=${documentUUID}&taskUUID=${taskUUID}`}>
                <Button>
                    Generate Tasks From Plan
                </Button>
            </Link>
        </div>
    );
}