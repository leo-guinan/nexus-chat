import { nanoid } from '@/lib/utils'
import {ThoughtContext} from "@/components/thought-context";

export default function IndexPage() {
  const id = nanoid()

  return <ThoughtContext id={id} />
}
