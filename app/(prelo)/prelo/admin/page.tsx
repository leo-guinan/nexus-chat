import {redirect} from 'next/navigation'

import {auth} from '@/auth'
import CreateSubmind from "@/components/prelo/admin/create-submind";
import {isUserAdmin} from "@/app/actions/admin";


export default async function PreloAdminPage() {
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?next=/prelo/admin`)
    }

    const isAdmin = await isUserAdmin(session?.user?.id)

    if (!isAdmin) {
        redirect(`/`)
    }

    return <CreateSubmind/>
}
