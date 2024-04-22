import {ThemeToggle} from '@/components/theme-toggle'
import * as React from 'react'
import Link from "next/link";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";

interface SidebarListProps {
    userId?: string
    isAdmin: boolean
    hasPrelo?: boolean
    children?: React.ReactNode
}


export async function PreloSidebarList({userId: _, isAdmin, hasPrelo}: SidebarListProps) {

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-8 text-center">


                <Link
                    href={`/prelo/chat`}
                    className={cn(
                        buttonVariants({variant: 'ghost'}),
                        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    )}
                >
                    New Chat
                </Link>


            </div>

            <div className="flex items-center justify-between p-4">
                <ThemeToggle/>
                {/*<ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />*/}
            </div>
        </div>
    )
}
