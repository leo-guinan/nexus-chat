import Link from "next/link";
import {Button} from "@/components/ui/button";

interface StartSubmindProps {
    submindId: number
}

export default function StartSubmind({submindId}: StartSubmindProps) {
    return (
        <div className="flex flex-row my-auto">
            <Link href={`/submind/${submindId}/start`}>
                <Button>
                    Start Submind
                </Button>
            </Link>
        </div>
    )
}