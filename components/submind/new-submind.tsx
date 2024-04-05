'use client'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {createSubmind} from "@/app/actions/submind";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function NewSubmind() {

    const router = useRouter();

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = async () => {
        if (!name || !description) {
            alert('Please fill in all fields.')
            return
        }

        const submind = await createSubmind({name, description})
        if (!submind) {
            alert('There was an error creating the submind.')
            return
        }
        router.push(`/submind/${submind.id}/act`)

    }

    return (
        <div>
            <form action={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Create a Submind</CardTitle>
                        <CardDescription>Start a new submind with a name and description.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="submind-name">Name</Label>
                            <Input id="submind-name" placeholder="Enter the submind name." value={name}
                                   onChange={(e) => setName(e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="submind-description">Description</Label>
                            <Textarea className="min-h-[100px]" id="submind-description"
                                      placeholder="Enter the submind description."
                                      value={description}
                                      onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button size="sm">Create Submind</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}