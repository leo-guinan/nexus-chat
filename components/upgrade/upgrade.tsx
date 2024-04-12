'use client'
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/sHTQ0fGZ1L6
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import getStripe from "@/utils/get-stripe";
import {Button} from "@/components/ui/button"

import {createCheckoutSession} from "@/app/actions/stripe";
import {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {CheckIcon} from "@heroicons/react/24/outline";

interface CheckoutFormProps {
    premium: boolean
}

const tiers = [

    {
        name: 'Premium',
        id: 'premium',
        href: '#',
        priceMonthly: '$30',
        description: 'Get responses every 8 hours',
        features: ['Everything in Free', 'Get responses every 8 hours', 'More powerful tools available', 'Ideal for people who want to get results by the end of the business day.'],
        mostPopular: false,
    },
    {
        name: 'Pro',
        id: 'pro',
        href: '#',
        priceMonthly: '$60',
        description: 'Get responses every 4 hours',
        features: [
            'Everything in Premium',
            'Get responses every 4 hours',
            'Request tools',
            'Ideal for people who want to move faster and have results mid-day and end of day.',
        ],
        mostPopular: true,
    },
    {
        name: 'Extreme',
        id: 'extreme',
        href: '#',
        priceMonthly: '$150',
        description: 'Get responses instantly',
        features: [
            'Everything in Pro',
            'Custom tools available to your submind',
            'Your submind responds as quickly as it can come up with answers/research/results',
            'Ideal for people who want to use this as their command center for the whole day.'
        ],
        mostPopular: false,
    },
]


export default function Upgrade({premium}: CheckoutFormProps) {
    const [enabled, setEnabled] = useState(false);
    const router = useRouter();

    const handleCheckout = async (tier: string): Promise<void> => {
        if (tier === 'free') {
            return;
        }
        const {errorRedirect, sessionId} = await createCheckoutSession(
            enabled,
            tier
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
        if (premium) {
            router.push("/")
        }
    },)

    if (premium) {
        return null
    }

    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Pick the plan that responds as quickly as you need.
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                    How quickly do you want your submind to respond? What tools do you want your submind to have
                    access to? Choose the plan that fits your needs.
                </p>
                <div
                    className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {tiers.map((tier, tierIdx) => (
                        <div
                            key={tier.id}
                            className={cn(
                                tier.mostPopular ? 'lg:z-10 lg:rounded-b-none' : 'lg:mt-8',
                                tierIdx === 0 ? 'lg:rounded-r-none' : '',
                                tierIdx === tiers.length - 1 ? 'lg:rounded-l-none' : '',
                                'flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10'
                            )}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3
                                        id={tier.id}
                                        className={cn(
                                            tier.mostPopular ? 'text-indigo-600' : 'text-gray-900',
                                            'text-lg font-semibold leading-8'
                                        )}
                                    >
                                        {tier.name}
                                    </h3>
                                    {tier.mostPopular ? (
                                        <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                                            Most popular
                                        </p>
                                    ) : null}
                                </div>
                                <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span
                                        className="text-4xl font-bold tracking-tight text-gray-900">{tier.priceMonthly}</span>
                                    <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <CheckIcon className="h-6 w-5 flex-none text-indigo-600"
                                                       aria-hidden="true"/>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button
                                type="button"
                                variant={tier.mostPopular ? 'default' : 'secondary'}
                                aria-describedby={tier.id}
                                className="py-2 mt-4"
                                // className={cn(
                                //     tier.mostPopular
                                //         ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500'
                                //         : 'text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                                //     'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                // )}
                                onClick={() => handleCheckout(tier.id)}
                            >
                                Buy plan
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
