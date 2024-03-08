import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts";

export async function matchThought(thought: string, pattern: string) {
    console.log("running matcher")
    const chatModel = new ChatOpenAI({});

    const input = `Here is a thought: ${thought}. Classification to check: ${pattern}.`

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "Given a thought and a classification statement, identify if the thought fits into the classification given. Return 'true' if it does meet the criteria, and 'false' otherwise. "],
        ["user", "{input}"],
    ]);

    const chain = prompt.pipe(chatModel);

    const result = await chain.invoke({
        input
    });

    console.log(result)

    return JSON.parse(result.content as string)


}