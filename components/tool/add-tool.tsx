'use client'
import {useState} from "react";

export default function AddTool({handleAddTool}: {
    handleAddTool: (name: string, description: string, url: string, pattern: string) => Promise<void>
}) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [url, setUrl] = useState('')
    const [pattern, setPattern] = useState('')


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("submitting!")
        await handleAddTool(name, description, url, pattern)
    }

    return (
        <>
            <h1>Add Tool</h1>
            <form onSubmit={handleFormSubmit}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            This information will be displayed publicly so be careful what you share.
                        </p>
                        <div className="sm:col-span-4">
                            <label htmlFor="toolName" className="block text-sm font-medium leading-6 ">
                                Tool Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="toolName"
                                    name="toolName"
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-4">
                            <label htmlFor="toolDescription" className="block text-sm font-medium leading-6 ">
                                Tool Description
                            </label>
                            <div className="mt-2">
                                <input
                                    id="toolDescription"
                                    name="toolDescription"
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-4">
                            <label htmlFor="toolUrl" className="block text-sm font-medium leading-6 ">
                                Tool URL
                            </label>
                            <div className="mt-2">
                                <input
                                    id="toolUrl"
                                    name="toolUrl"
                                    type="url"
                                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-4">
                            <label htmlFor="toolPattern" className="block text-sm font-medium leading-6 ">
                                What kind of thoughts should this tool apply to?
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="toolPattern"
                                    name="toolPattern"
                                    value={pattern}
                                    onChange={(e) => setPattern(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Save
                    </button>
                </div>
            </form>
        </>
    )
}