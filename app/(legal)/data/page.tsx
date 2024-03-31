'use client'

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {useState} from "react";
import {acceptDataPolicy} from "@/app/actions/legal";
import {useRouter} from "next/navigation";

export default function DataConsentPage() {
    const [error, setError] = useState('')
    const router = useRouter()
    const [accepted, setAccepted] = useState(false)

    const handleSubmit = async () => {
        console.log(accepted)
        if (!accepted) {
            setError('You must accept the terms of the data use policy')
            return
        }
        await acceptDataPolicy()
        router.push("/")
    }

    const handleChange = () => {
        console.log("accept", accepted)
        setAccepted(!accepted)
    }


    return (
        <>
            <Card className="w-full max-w-3xl p-6 mx-auto">
                <CardHeader className="border-b">
                    <CardTitle className="text-2xl">Data Use Policy</CardTitle>
                    <CardDescription>Please read and accept the following data use policy before
                        proceeding.</CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-4">
                    <p>
                        Welcome to My AI Cofounder! By using our app, you’ll engage with features that enhance your
                        productivity
                        and collaboration through AI technology. Please be aware that in delivering these services,
                        certain
                        data
                        you provide will be used by AI models to generate insights and recommendations. Specifically,
                        when
                        you
                        opt-in, your recorded thoughts, linked calendar events, and chat messages will be processed to
                        tailor
                        the experience to your needs. We prioritize your privacy and control over your data, ensuring
                        transparent and consensual data handling. For more detailed information, please review our
                        Privacy
                        Policy. Your trust is important to us, and we’re committed to protecting and respecting your
                        data
                        preferences.
                    </p>
                </CardContent>
                <CardFooter>
                    <form action={handleSubmit}>
                        <div className="space-y-2">
                            {error && <p className="text-red-500 flex flex-col w-full">{error}</p>}
                            <div className="flex items-center space-x-2">
                                <Checkbox id="accept" checked={accepted} onCheckedChange={handleChange}/>
                                <Label className="text-sm leading-none" htmlFor="accept">
                                    I accept the terms of the data use policy
                                </Label>
                            </div>
                            <Button className="w-full" type="submit">Continue</Button>
                        </div>
                    </form>
                </CardFooter>
            </Card>


        </>
    )
}