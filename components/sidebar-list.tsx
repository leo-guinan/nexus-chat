import {getChats, getContexts} from '@/app/actions'
import {SidebarItems} from '@/components/sidebar-items'
import {ThemeToggle} from '@/components/theme-toggle'
import {cache} from 'react'

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

export async function SidebarList({userId}: SidebarListProps) {
    // const chats = await loadChats(userId)
    const contexts = await loadContexts(userId)

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
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
