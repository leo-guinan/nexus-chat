"use server"
import {Thought} from "@/lib/types";
import OpenAI from 'openai'

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function summarizeThoughts(thoughts: Thought[]) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        max_tokens: 150,
        temperature: 0.5,
        messages: [
            {
                role: "system",
                content: "Summarize the following thoughts:"
            },
            {
                role: "user",
                content: thoughts.map(thought => thought.content).join('\n')
            }
        ]
    });


    console.log(response)
    return response.choices[0].message.content





}