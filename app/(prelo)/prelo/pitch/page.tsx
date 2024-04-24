import {redirect} from 'next/navigation'

import {auth} from '@/auth'
import FileUpload from "@/components/prelo/file-upload";


export default async function PreloUploadPitchDeckPage() {
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?next=/prelo/pitch/`)
    }


    return <FileUpload/>
}
