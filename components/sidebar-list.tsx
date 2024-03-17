import {getChats, getContexts} from '@/app/actions'
import {ThemeToggle} from '@/components/theme-toggle'
import * as React from 'react'
import {cache} from 'react'
import Link from "next/link";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";

interface SidebarListProps {
    userId?: string
    children?: React.ReactNode
}

const loadChats = cache(async (userId?: string) => {
    return await getChats(userId)
})

const loadContexts = cache(async (userId?: string) => {
    return await getContexts(userId)
})

export async function SidebarList({userId: _}: SidebarListProps) {

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-8 text-center">
                <Link
                    href={`/`}
                    className={cn(
                        buttonVariants({variant: 'ghost'}),
                        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    )}
                >
                    Thoughts
                </Link>
                <Link
                    href={`/tasks`}
                    className={cn(
                        buttonVariants({variant: 'ghost'}),
                        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    )}
                >
                    Tasks
                </Link>
            </div>
            {/*<div className="p-8 text-center">Contexts</div>*/}
            {/*<div className="flex-1 overflow-auto">*/}
            {/*    {contexts?.length ? (*/}
            {/*        <div className="space-y-2 px-2">*/}
            {/*            <SidebarItems contexts={contexts}/>*/}
            {/*        </div>*/}
            {/*    ) : (*/}
            {/*        <div className="p-8 text-center">*/}
            {/*            <p className="text-sm text-muted-foreground">No contexts (shouldn&apos;t reach this)</p>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</div>*/}
            <div className="flex items-center justify-between p-4">
                <ThemeToggle/>
                {/*<ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />*/}
            </div>
        </div>
    )
}
