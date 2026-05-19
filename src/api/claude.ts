import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function callAgent(
  systemPrompt: string,
  userMessage: string,
  model: string = "claude-3-5-sonnet-20240620",
  maxTokens: number = 2000
): Promise<string> {
  const isAnthropic = model.startsWith("claude-");

  if (isAnthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables.");
    }

    try {
      const response = await anthropic.messages.create({
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
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw error;
    }
  } else {
    // Treat as OpenAI-compatible API (OpenAI, DeepSeek, Groq, Ollama, OpenRouter, etc.)
    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    const baseURL = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

    if (!apiKey) {
      throw new Error(
        "Neither OPENAI_API_KEY nor LLM_API_KEY is set in environment variables (required for non-Claude models)."
      );
    }

    try {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json() as any;
      return data.choices?.[0]?.message?.content || "";
    } catch (error: any) {
      throw new Error(`Failed to call OpenAI-compatible API: ${error.message}`);
    }
  }
}

