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

                {/*    list chat sessions here*/}

            </div>

            {isAdmin && (
                <div>
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"/>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-zinc-950 px-2 text-sm text-gray-500">Admin</span>
                        </div>
                    </div>
                    <Link
                        href={`/prelo/admin`}
                        className={cn(
                            buttonVariants({variant: 'ghost'}),
                            'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                        )}
                    >
                        Create Submind
                    </Link>
                </div>
                // then add all available subminds here

            )
            }

            <div className="flex items-center justify-between p-4">
                <ThemeToggle/>
                {/*<ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />*/}
            </div>
        </div>
    )
}
