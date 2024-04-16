import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts";

export async function matchThought(thought: string, pattern: string) {

    //thought for future enhancement: make sure to track classification for validation down the line. Can fine tune this


    // if pattern is *, then match everything
    if (pattern === "*") return true

    const chatModel = new ChatOpenAI({});

    const input = `Here is a thought: ${thought}. Classification to check: ${pattern}.`

    const thinkingPrompt = ChatPromptTemplate.fromMessages([
        ["system", "Given a thought and a classification statement, identify if the thought fits into the classification given. Explain your reasoning."],
        ["user", "{input}"],
    ]);

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "Given a thought and a classification statement, identify if the thought fits into the classification given. Return 'true' if it does meet the criteria, and 'false' otherwise. "],
        ["system", "Here is your reasoning from the previous step: {previous_thoughts}"],
        ["user", "{input}"],
    ]);


    const thinkingChain = thinkingPrompt.pipe(chatModel);
    const thinkingResult = await thinkingChain.invoke({
        input
    });
    const chain = prompt.pipe(chatModel);

    const result = await chain.invoke({
        input,
        previous_thoughts: thinkingResult.content
    });

    return JSON.parse(result.content as string)

}