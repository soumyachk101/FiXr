import { callAgent } from "../api/claude";
import { PipelineContext, BugReport } from "./types";

export const bugDetectivePrompt = `
You are a senior software engineer specializing in bug detection.

Your job is to carefully analyze the provided code and find ALL bugs, errors, and potential issues.

Look for:
- Null/undefined reference errors
- Off-by-one errors in loops
- Async/await mistakes (missing await, unhandled promises)
- Logic errors and incorrect conditionals
- Unhandled edge cases (empty arrays, zero values, empty strings)
- Typos in variable/function names
- Missing error handling (try/catch)
- Incorrect data type usage
- Infinite loops or missing break conditions
- Unused variables that may indicate missing logic

For each bug, assign severity:
- HIGH: Will cause crashes or wrong behavior in production
- MEDIUM: Will cause issues in specific conditions
- LOW: Minor issues or code smells

Respond ONLY in valid JSON. No markdown, no explanation outside JSON.

Format:
{
  "bugs": [
    {
      "id": 1,
      "severity": "HIGH",
      "line": 23,
      "description": "user object null check missing before accessing user.name",
      "category": "null-reference"
    }
  ],
  "summary": "Found 3 bugs: 1 HIGH, 1 MEDIUM, 1 LOW"
}

If no bugs found, return: { "bugs": [], "summary": "No bugs found" }
`;

export async function runBugDetective(ctx: PipelineContext, model?: string): Promise<PipelineContext> {
  const userMessage = `
Language: ${ctx.language}
File: ${ctx.filePath}

Code:
${ctx.originalCode}
`;

  const response = await callAgent(bugDetectivePrompt, userMessage, model);
  try {
    const cleaned = response.replace(/```json|```/g, "").trim();
    ctx.bugReport = JSON.parse(cleaned) as BugReport;
  } catch (e) {
    console.error("Failed to parse Bug Detective response:", response);
    ctx.bugReport = { bugs: [], summary: "Error parsing agent response" };
  }
  return ctx;
}
