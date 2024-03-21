import {Button} from "@/components/ui/button";
import Link from "next/link";


export default function GenerateTasks({documentUUID}: {documentUUID: string}) {


    return (
        <div className="flex flex-row my-auto">
            <Link href={`/tasks/generating?documentUUID=${documentUUID}`}>
                <Button>
                    Generate Tasks From Plan
                </Button>
            </Link>
        </div>
    );
}