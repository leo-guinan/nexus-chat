import {auth} from "@/auth";
import ToolDetails from "@/components/tool/tool-details";
import {getTool} from "@/app/(actions)/actions/tools";

export interface ToolPageProps {
    params: {
        slug: string
    }
}

export default async function IndexPage({params}: ToolPageProps) {
    const session = await auth()

    if (!session) return null

    const tool = await getTool(params.slug)

    if ('error' in tool) return null

    return <ToolDetails/>
}
