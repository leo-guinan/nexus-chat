import {auth} from "@/auth";
import OnboardingChat from "@/components/onboarding/onboarding-chat";
import {getOnboardingChat} from "@/app/actions/onboarding";


export default async function OnboardingChatPage() {
    const session = await auth()

    if (!session) return null
    const messages = await getOnboardingChat()
    if ('error' in messages) {
        return null
    }

    return <OnboardingChat
        // @ts-ignore
        messages={messages}
    />
}
