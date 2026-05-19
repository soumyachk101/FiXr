import { callAgent } from "../api/claude";
import { PipelineContext, BugFixResponse } from "./types";

export const bugFixerPrompt = `
You are a senior software engineer. Your job is to fix bugs in code.

You will be given:
1. The original code
2. A list of bugs found by a bug detector

Your task:
- Fix ONLY the bugs listed, do not rewrite the whole file
- Keep original code style, formatting, and structure intact
- Add a short inline comment on each fixed line: // FIXED: reason
- If a bug cannot be safely fixed without more context, add a comment: // TODO: needs manual fix — reason

Respond ONLY in valid JSON. No markdown, no explanation outside JSON.

Format:
{
  "fixedCode": "...complete fixed code as string...",
  "fixes": [
    {
      "bugId": 1,
      "action": "Added null check before accessing user.name on line 23",
      "fixed": true
    }
  ],
  "unfixed": [
    {
      "bugId": 3,
      "reason": "Cannot determine correct default value without business logic context"
    }
  ]
}
`;

export async function runBugFixer(ctx: PipelineContext, model?: string): Promise<PipelineContext> {
  if (!ctx.bugReport || ctx.bugReport.bugs.length === 0) {
    ctx.bugFixResponse = { fixedCode: ctx.originalCode, fixes: [], unfixed: [] };
    return ctx;
  }

  const userMessage = `
Language: ${ctx.language}

Original Code:
${ctx.originalCode}

Bugs to Fix:
${JSON.stringify(ctx.bugReport.bugs, null, 2)}
`;

  const response = await callAgent(bugFixerPrompt, userMessage, model);
  try {
    const cleaned = response.replace(/```json|```/g, "").trim();
    ctx.bugFixResponse = JSON.parse(cleaned) as BugFixResponse;
  } catch (e) {
    console.error("Failed to parse Bug Fixer response:", response);
    ctx.bugFixResponse = { fixedCode: ctx.originalCode, fixes: [], unfixed: [] };
  }
  return ctx;
}
