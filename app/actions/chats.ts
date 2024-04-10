'use server'

export async function sendChatMessage(message: { content: string, role: "user" }) {
    return {
        content: "Hello",
        role: "bot",
        id: "1"
    }
}
export async function getChat(id: string, userId: string) {
    return {
        id: id,
        title: "Chat",
        userId: userId,
        messages: []
    }
}

export async function getChats(userId?: string) {
    return []
}