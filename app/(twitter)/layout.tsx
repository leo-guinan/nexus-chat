import { SidebarDesktop } from '@/components/sidebar-desktop'

interface ContextLayoutProps {
  children: React.ReactNode
}
export const revalidate = 300 // revalidate the data at most every 5 minutes

export default async function ContextLayout({ children }: ContextLayoutProps) {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop />
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        {children}
      </div>
    </div>
  )
}
