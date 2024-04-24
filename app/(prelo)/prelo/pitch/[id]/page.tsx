import {redirect} from 'next/navigation'

import {auth} from '@/auth'
import FileUpload from "@/components/prelo/file-upload";
import PitchDeckAnalysis from "@/components/prelo/pitch-deck-analysis";
import {getPitchDeck} from "@/app/actions/prelo";
import {ChatPageProps} from "@/app/(prelo)/prelo/chat/[id]/page";

interface PitchDeckPageProps {
    params: {
        id: string
    }
}

export default async function PreloUploadPitchDeckPage({ params }: PitchDeckPageProps) {
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?next=/prelo/pitch/`)
    }

    const pitchDeck = await getPitchDeck(Number(params.id));

    if ('error' in pitchDeck) {
        console.log(pitchDeck.error)
        return null
    }

    return <PitchDeckAnalysis pitchDeckAnalysis={pitchDeck.content} uuid={pitchDeck.uuid}/>
}
