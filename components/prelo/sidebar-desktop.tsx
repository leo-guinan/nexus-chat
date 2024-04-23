import { Sidebar } from '@/components/sidebar'

import { auth } from '@/auth'
import {isUserAdmin, userHasPrelo} from "@/app/actions/admin";
import {PreloSidebar} from "@/components/prelo/sidebar";
import {redirect} from "next/navigation";

export async function PreloSidebarDesktop() {
  const session = await auth()

  const isAdmin = await isUserAdmin(session?.user?.id)

  const hasPrelo = await userHasPrelo(session?.user?.id)

  if (!session?.user?.id) {
    redirect(`/sign-in?next=/prelo/admin`)
  }

  if (!hasPrelo) {
    redirect(`/`)
  }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      <PreloSidebar userId={session.user.id} isAdmin={isAdmin} hasPrelo={hasPrelo} />
    </Sidebar>
  )
}
