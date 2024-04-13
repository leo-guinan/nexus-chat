'use server'
import {nanoid, prisma} from "@/lib/utils"
import {auth} from "@/auth";
import {Thought, Tool} from "@/lib/types";
import {matchThought} from "@/utils/openai/match-thought";
import axios from "axios";

async function doesThoughtMatchPattern(thought: string, pattern: string) {
    return await matchThought(thought, pattern)
}

export async function getTool(slug: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const currentUser = await prisma.user.findFirst({
        where: {
            id: session.user.id
        }
    })

    if (!currentUser || currentUser.role !== 'admin') {
        return {
            error: "Unauthorized"
        }
    }

    return {
        name: slug,
        slug,
        description: slug,
        url: "http://localhost:8000/url/to/tool",
    }
}

export async function getTools() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const currentUser = await prisma.user.findFirst({
        where: {
            id: session.user.id
        }
    })

    if (!currentUser || currentUser.role !== 'admin') {
        return {
            error: "Unauthorized"
        }
    }

    return await prisma.tool.findMany()

}

export async function addTool(name: string, description: string, url: string, pattern: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Unauthorized"
        }
    }

    const currentUser = await prisma.user.findFirst({
        where: {
            id: session.user.id
        }
    })

    if (!currentUser || currentUser.role !== 'admin') {
        return {
            error: "Unauthorized"
        }
    }
    let slug = encodeURIComponent(name)


    let slugMatchingName = await prisma.tool.findFirst({
        where: {
            slug
        }
    })

    while (slugMatchingName) {
        const newSlug = encodeURIComponent(name + nanoid())
        slugMatchingName = await prisma.tool.findFirst({
            where: {
                slug: newSlug
            }
        })
        if (!slugMatchingName) {
            slug = newSlug
        }
    }

    const newTool = await prisma.tool.create({
        data: {
            name,
            description,
            url,
            pattern,
            slug
        }
    })

    if (newTool) {
        return {
            status: "Success"
        }
    }

    return {
        status: "Error"
    }
}

export async function runTool(tool: Tool, thought: Thought, userId: string) {
    if (tool.pattern) {
        console.log("Pattern exists, checking against it")

        const matchesPattern = await doesThoughtMatchPattern(thought.content, tool.pattern)
        console.log(`${tool.name} matches pattern: ${matchesPattern}`)
        if (matchesPattern) {
            try {
                await axios.post(
                    tool.url,
                    {
                        message: thought,
                        user_id: userId,
                        model_id: 1,
                        item_uuid: thought.uuid
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    },
                );
                return
            } catch (error) {
                console.error(error);
            }


        }
        return

    }


}