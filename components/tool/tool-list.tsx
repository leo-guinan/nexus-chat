import {cn} from "@/lib/utils";

interface Tool {
    id: number
    name: string
    slug: string
    description?: string | null
    url: string

}

export default function ToolList({currentTool, tools}: { currentTool?: string, tools: Tool[] }) {
    return (
        <>
            <nav className="flex flex-1 flex-col" aria-label="Sidebar">
                <ul role="list" className="-mx-2 space-y-1">
                    {tools.map((tool) => (
                        <li key={tool.slug}>
                            <a
                                href={`/tool/${tool.name}`}
                                className={cn(
                                    tool.slug === currentTool ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                    'group flex gap-x-3 rounded-md p-2 pl-3 text-sm leading-6 font-semibold'
                                )}
                            >
                                {tool.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    )
}