"use client"
import {FormEvent, useState} from "react";
import {useRouter} from "next/navigation";

export default function StartDay({contextName, }: {contextName: string }) {
    const router = useRouter();

    const [goal, setGoal] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push(`/today/create?contextName=${contextName}&goal=${goal}`)

    };

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <form onSubmit={handleSubmit} className="p-6 rounded shadow-md">
                    <label htmlFor="goal" className="block text-sm font-medium">
                        What is your main goal for the day?
                    </label>
                    <input
                        type="text"
                        id="goal"
                        name="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your goal"
                    />
                    <button
                        type="submit"
                        className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700"
                    >
                        Submit
                    </button>
                </form>
            </div>

        </>
    )
}