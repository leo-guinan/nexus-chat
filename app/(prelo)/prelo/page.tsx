import {auth} from "@/auth";
import OnboardingChat from "@/components/onboarding/onboarding-chat";
import {getOnboardingChat} from "@/app/actions/onboarding";
import Ask from "@/components/prelo/ask";
import {getQuestions} from "@/app/actions/prelo";
import {userHasPrelo} from "@/app/actions/admin";


export default async function PreloPage() {
    const session = await auth()

    if (!session) return null
    const hasPrelo = await userHasPrelo(session?.user?.id)
    if (!hasPrelo) return null

    const questions = await getQuestions()

    if ('error' in questions) {
        return null
    }

    return <Ask questions={questions} />
}
