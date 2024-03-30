"use client"

import {auth} from "@/auth";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import {createDailyPlan} from "@/app/actions/today";


export default function CreateTodayPage() {
    const searchParams = useSearchParams()
    const contextName = searchParams.get('contextName')
    const goal = searchParams.get('goal')
    const router = useRouter();

    useEffect(() => {
        const performServerAction = async () => {
            try {
                if (contextName && goal) {
                    await createDailyPlan(contextName, goal)
                    router.push(`/today`);
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('An error occurred:', error);
                // Handle the error (optional)
            }
        };

        performServerAction();
    }, [router]);

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <LoadingSpinner label={"Creating Today's Page..."}/>
                </div>
            </div>
        </>

    )
}
