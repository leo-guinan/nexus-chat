import ToolList from "@/components/tool/tool-list";
import React from "react";
import AddTool from "@/components/tool/add-tool";
import {auth} from "@/auth";
import {addTool, getTools} from "@/app/(actions)/actions/tools";

export default async function ToolDashboard({currentTool}: { currentTool?: string }) {

    const handleAddTool = async (name: string, description: string, url: string, pattern: string) => {
        'use server'
        await addTool(name, description, url, pattern)
    }

    const session = await auth()

    if (!session) return null

    const tools = await getTools()

    if ('error' in tools) return null

    return (
        <div className="flex">
            <div className="flex-col w-1/5">
                <ToolList tools={tools} currentTool={currentTool}/>
            </div>
            <div className="flex-col">
                <AddTool handleAddTool={handleAddTool}/>
            </div>
        </div>
    )
}