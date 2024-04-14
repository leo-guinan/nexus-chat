'use client'
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/vFAK7Dkuwn6
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {IconGoogle, SendIcon} from "@/components/ui/icons";
import {signIn} from "next-auth/react";
import {useState} from "react";
import {LoginButton} from "@/components/login-button";

export default function LoginWithProvider() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const handleSignIn = async () => {
        if (!email) {
            setError('Please enter your email')
            return
        }
        setIsLoading(true)
        await signIn('resend', {callbackUrl: `/`, email})
    }
    return (
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Login</h1>
                <p className="text-gray-600 dark:text-gray-300">Enter your email below to login to your account</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-gray-800 dark:text-gray-200" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="pl-4 w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 focus:outline-none focus:ring focus:ring-gray-400 dark:focus:ring-gray-600"
                        id="email"
                        placeholder="m@example.com"
                        required
                        type="email"
                        disabled={isLoading} onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button
                    className="w-full bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100 rounded-md py-2 flex items-center justify-center"
                    type="submit"
                    onClick={handleSignIn} disabled={isLoading}
                >
                    <SendIcon className="mr-2 h-4 w-4"/>
                    Login
                </button>
                <LoginButton provider="google" text="Login with Google" showProviderIcon className="w-full py-8 bg-gray-900 text-white dark:bg-gray-800"/>
            </div>
        </div>

        // <Card className="w-full max-w-md p-6">
        //     <CardHeader className="space-y-1">
        //         <CardTitle className="text-3xl font-bold">Login</CardTitle>
        //         <CardDescription>Enter your email below to login to your account</CardDescription>
        //     </CardHeader>
        //     <CardContent>
        //         {error && (<div className="text-red-500">{error}</div>)}
        //
        //         <div className="space-y-4">
        //             <div className="space-y-2">
        //                 <Label htmlFor="email">Email</Label>
        //                 <Input className="pl-4" id="email" placeholder="me@example.com" required type="email"
        //                        disabled={isLoading} onChange={(e) => setEmail(e.target.value)}/>
        //             </div>
        //             <Button className="w-full" type="button" onClick={handleSignIn} disabled={isLoading}>
        //                 <SendIcon className="mr-2 h-4 w-4"/>
        //                 Login
        //             </Button>
        //         </div>
        //     </CardContent>
        // </Card>
    )
}


