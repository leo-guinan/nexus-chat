'use client'
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/sHTQ0fGZ1L6
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import type Stripe from "stripe";
import getStripe from "@/utils/get-stripe";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card"
import {Button} from "@/components/ui/button"

import {createCheckoutSession} from "@/app/actions/stripe";
import {useEffect, useState} from "react";
import {Switch} from "@headlessui/react";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";

interface CheckoutFormProps {
    premium: boolean
}

export default function Upgrade({premium}: CheckoutFormProps) {
    const [enabled, setEnabled] = useState(false);
    const router = useRouter();

    const formAction = async (): Promise<void> => {
        const {errorRedirect, sessionId} = await createCheckoutSession(
            enabled
        );

        // if (errorRedirect) {
        //   setPriceIdLoading(undefined);
        //   return router.push(errorRedirect);
        // }

        if (!sessionId) {
            // setPriceIdLoading(undefined);
            // return router.push(
            //   getErrorRedirect(
            //     currentPath,
            //     'An unknown error occurred.',
            //     'Please try again later or contact a system administrator.'
            //   )
            // );
            console.log("An unknown error occurred.")
            return
        }

        const stripe = await getStripe();
        stripe?.redirectToCheckout({sessionId});


    };

    useEffect(() => {
        if(premium) {
            router.push("/")
        }
    },  )

    if (premium) {
        return null
    }

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader className="p-4 bg-gray-50 dark:bg-gray-800">
                <Switch.Group as="div" className="flex items-center flex-row w-full ">
                    <Switch
                        checked={enabled}
                        onChange={setEnabled}
                        className={cn(
                            enabled ? 'bg-indigo-600' : 'bg-gray-200',
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
                        )}
                    >
                            <span
                                aria-hidden="true"
                                className={cn(
                                    enabled ? 'translate-x-5' : 'translate-x-0',
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                )}
                            />
                    </Switch>
                    <Switch.Label as="span" className="ml-3 text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-400">Annual billing</span>{' '}
                        <span className="text-gray-500">(2 months free)</span>
                    </Switch.Label>
                </Switch.Group>

            </CardHeader>
            <CardContent className="p-4">
                <div className="flex items-center space-x-4">

                    <h3 className="text-lg font-bold flex flex-col">Premium</h3>
                </div>
                <p className="text-sm leading-none text-gray-500 dark:text-gray-400">Includes all features in the Free
                    plan</p>
                <div className="grid gap-1">
                    <h4 className="text-base font-bold">Integrations</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        All integrations are included, with new ones being added regularly.
                    </p>
                </div>
                <div className="grid gap-1">
                    <h4 className="text-base font-bold">Chat</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Unlock a powerful chat feature that pulls in related thoughts during the conversation to know
                        exactly what you are talking about
                    </p>
                </div>
                <div className="grid gap-1">
                    <h4 className="text-base font-bold">Bonus Products</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get early access to new products. The first one coming is Nexus Podcasts, a podcast player meant
                        to help you capture important thoughts while listening.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex p-4 items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800">

                <form action={formAction}>

                    <div className="text-2xl font-semibold">{enabled ? "$300" : "$30"}</div>
                    <Button size="sm" variant="default" type="submit">
                        Upgrade to Premium
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
