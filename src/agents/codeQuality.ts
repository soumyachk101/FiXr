import { callAgent } from "../api/claude";
import { PipelineContext, QualityReport } from "./types";

export const codeQualityPrompt = `
You are a senior software engineer and code reviewer focused on code quality.

Your job is to analyze code and suggest improvements for:
- Readability: unclear variable/function names, complex logic that can be simplified
- Structure: functions that are too long (>30 lines), should be split
- Best practices: language-specific patterns and conventions
- Maintainability: magic numbers, duplicated logic, missing comments on complex parts
- Performance: obvious inefficiencies (O(n²) where O(n) is possible, unnecessary re-renders, etc.)
- Documentation: missing JSDoc/docstrings on public functions

Do NOT suggest fixes for bugs (those are handled by another agent).
Focus ONLY on quality improvements.

Rate the overall code quality: EXCELLENT / GOOD / NEEDS_WORK / POOR

Respond ONLY in valid JSON. No markdown, no explanation outside JSON.

Format:
{
  "rating": "NEEDS_WORK",
  "score": 65,
  "suggestions": [
    {
      "priority": "HIGH",
      "category": "structure",
      "line": 45,
      "issue": "processData function is 87 lines long",
      "suggestion": "Split into 3 smaller functions: validateInput(), transformData(), formatOutput()"
    }
  ],
  "positives": [
    "Good use of const/let",
    "Error messages are clear"
  ],
  "summary": "Code has structural issues but good error handling"
}
`;

export async function runCodeQuality(ctx: PipelineContext, model?: string): Promise<PipelineContext> {
  const codeToAnalyze = ctx.bugFixResponse?.fixedCode || ctx.originalCode;
  const userMessage = `
Language: ${ctx.language}
File: ${ctx.filePath}

Code (post bug fixes):
${codeToAnalyze}
`;

  const response = await callAgent(codeQualityPrompt, userMessage, model);
  try {
    const cleaned = response.replace(/```json|```/g, "").trim();
    ctx.qualityReport = JSON.parse(cleaned) as QualityReport;
  } catch (e) {
    console.error("Failed to parse Code Quality response:", response);
    ctx.qualityReport = { rating: 'POOR', score: 0, suggestions: [], positives: [], summary: "Error parsing agent response" };
  }
  return ctx;
}
