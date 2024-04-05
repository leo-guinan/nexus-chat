import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import Document from "@/components/documents/document";
import {Submind, SubmindStatus} from "@prisma/client/edge";
import StartSubmind from "@/components/submind/start-submind";


interface SubmindActionProps {
    submind: Submind
    content: string
    userId: string
}

export default function SubmindAction({submind, content, userId}: SubmindActionProps) {
    return (
        <>
            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="text-2xl">{submind.name}</CardTitle>
                    <CardDescription>{submind.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col gap-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col gap-1.5">
                            {submind.status !== SubmindStatus.ACTIVE && (
                                <Document content={content} documentId={submind.documentUUID} userId={userId}/>
                            )}
                            {submind.status === SubmindStatus.ACTIVE && (
                                <div className="p-4">
                                    <p>Submind is active, you can not edit it right now.</p>
                                    <textarea className="w-full h-96 border" value={content} readOnly={true}/>
                                </div>
                            )}

                        </div>
                        <StartSubmind submindId={submind.id}/>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}