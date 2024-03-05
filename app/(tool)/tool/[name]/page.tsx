import { nanoid } from '@/lib/utils'
import {ThoughtContext} from "@/components/thought-context";
import {getMostRecentContext, getTool} from "@/app/actions";
import {auth} from "@/auth";
import ToolDashboard from "@/components/tool/tool-dashboard";
import ToolDetails from "@/components/tool/tool-details";

export interface ToolPageProps {
  params: {
    slug: string
  }
}

export default async function IndexPage({params}: ToolPageProps ) {
    const session = await auth()

  if (!session) return null

  const tool = await getTool(params.slug)

  if ('error' in tool) return null

  return <ToolDetails/>
}
