import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callAgent(
  systemPrompt: string,
  userMessage: string,
  model: string = "claude-3-5-sonnet-20240620",
  maxTokens: number = 2000
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables.");
  }

  try {
    const response = await client.messages.create({
      model: model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const block = response.content[0];
    if (block.type === "text") return block.text;
    return "";
  } catch (error: any) {
    if (error.status === 429) {
       // Simple retry logic could go here, but for now we throw
       throw new Error("Rate limit exceeded. Please try again later.");
    }
    throw error;
  }
}
