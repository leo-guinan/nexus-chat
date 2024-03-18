import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Thought {
    ownerId: string;
    id: number;
    content: string;
    contextId: number;
    createdAt: string;
}

export interface Task {
    id: number;
    name: string;
    details: string;
    priority: number;
}

export type ThoughtMetadata = {
    thoughtId: number
    contextId: number
    userId: string
    hash: string

}

export type Tool = {
    id: number
    name: string
    slug: string
    description?: string | null
    url: string
    pattern?: string | null
}
