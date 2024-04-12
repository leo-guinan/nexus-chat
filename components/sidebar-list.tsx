import {ThemeToggle} from '@/components/theme-toggle'
import * as React from 'react'
import Link from "next/link";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";

interface SidebarListProps {
    userId?: string
    isAdmin: boolean
    children?: React.ReactNode
}


export async function SidebarList({userId: _, isAdmin}: SidebarListProps) {

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-8 text-center">
                {/*<Link*/}
                {/*    href={`/today`}*/}
                {/*    className={cn(*/}
                {/*        buttonVariants({variant: 'ghost'}),*/}
                {/*        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',*/}
                {/*    )}*/}
                {/*>*/}
                {/*    Today*/}
                {/*</Link>*/}
                <Link
                    href={`/`}
                    className={cn(
                        buttonVariants({variant: 'ghost'}),
                        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    )}
                >
                    Thoughts
                </Link>
                {/*<Link*/}
                {/*    href={`/tasks`}*/}
                {/*    className={cn(*/}
                {/*        buttonVariants({variant: 'ghost'}),*/}
                {/*        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',*/}
                {/*    )}*/}
                {/*>*/}
                {/*    Tasks*/}
                {/*</Link>*/}

                {/*<div className="relative py-4">*/}
                {/*    <div className="absolute inset-0 flex items-center" aria-hidden="true">*/}
                {/*        <div className="w-full border-t border-gray-300"/>*/}
                {/*    </div>*/}
                {/*    <div className="relative flex justify-center">*/}
                {/*        <span className="bg-white dark:bg-zinc-950 px-2 text-sm text-gray-500">Premium</span>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<Link*/}
                {/*    href={`/calendar`}*/}
                {/*    className={cn(*/}
                {/*        buttonVariants({variant: 'ghost'}),*/}
                {/*        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',*/}
                {/*    )}*/}
                {/*>*/}
                {/*    Calendar*/}
                {/*</Link>*/}

                {/*<Link*/}
                {/*    href={`/chat`}*/}
                {/*    className={cn(*/}
                {/*        buttonVariants({variant: 'ghost'}),*/}
                {/*        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',*/}
                {/*    )}*/}
                {/*>*/}
                {/*    New Chat*/}
                {/*</Link>*/}
                <Link
                    href={`/onboarding`}
                    className={cn(
                        buttonVariants({variant: 'ghost'}),
                        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    )}
                >
                    Help
                </Link>

                <Link
                    href={`/upgrade`}
                    className={cn(
                        buttonVariants({variant: 'ghost'}),
                        'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                    )}
                >
                    Upgrade Your Account
                </Link>

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
                            href={`/submind/new`}
                            className={cn(
                                buttonVariants({variant: 'ghost'}),
                                'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                            )}
                        >
                            Create Submind
                        </Link>
                        <Link
                            href={`/admin`}
                            className={cn(
                                buttonVariants({variant: 'ghost'}),
                                'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                            )}
                        >
                            Admin Dashboard
                        </Link>
                        <Link
                            href={`/question`}
                            className={cn(
                                buttonVariants({variant: 'ghost'}),
                                'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
                            )}
                        >
                            Open Questions
                        </Link>
                    </div>
                )}

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
