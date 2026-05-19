import fs from "fs";
import { PipelineContext } from "../agents/types";

export function generateMarkdown(ctx: PipelineContext): string {
  let md = `# CodeWatch Analysis Report - ${ctx.filePath}\n\n`;

  md += `## 🐛 Bug Detective\n`;
  md += `**Summary:** ${ctx.bugReport?.summary || "N/A"}\n\n`;
  if (ctx.bugReport?.bugs.length) {
    md += "| Severity | Line | Description | Category |\n";
    md += "| --- | --- | --- | --- |\n";
    ctx.bugReport.bugs.forEach(bug => {
      md += `| ${bug.severity} | ${bug.line} | ${bug.description} | ${bug.category} |\n`;
    });
    md += "\n";
  }

  md += `## 🔧 Bug Fixer\n`;
  if (ctx.bugFixResponse?.fixes.length) {
    md += "### Fixes Applied\n";
    ctx.bugFixResponse.fixes.forEach(fix => {
      md += `- ${fix.action}\n`;
    });
    md += "\n### Fixed Code\n```${ctx.language.toLowerCase()}\n${ctx.bugFixResponse.fixedCode}\n```\n\n";
  } else {
    md += "No fixes applied.\n\n";
  }

  md += `## ✨ Code Quality\n`;
  md += `**Rating:** ${ctx.qualityReport?.rating} (${ctx.qualityReport?.score}/100)\n\n`;
  if (ctx.qualityReport?.suggestions.length) {
    md += "| Priority | Category | Line | Issue | Suggestion |\n";
    md += "| --- | --- | --- | --- | --- |\n";
    ctx.qualityReport.suggestions.forEach(s => {
      md += `| ${s.priority} | ${s.category} | ${s.line} | ${s.issue} | ${s.suggestion} |\n`;
    });
    md += "\n";
  }

  md += `## 🔒 Security Auditor\n`;
  md += `**Overall Risk:** ${ctx.securityReport?.overallRisk}\n\n`;
  if (ctx.securityReport?.issues.length) {
    md += "| Severity | Line | Title | Description | OWASP |\n";
    md += "| --- | --- | --- | --- | --- |\n";
    ctx.securityReport.issues.forEach(issue => {
      md += `| ${issue.severity} | ${issue.line} | ${issue.title} | ${issue.description} | ${issue.owasp || "N/A"} |\n`;
    });
    md += "\n";
  }

  return md;
}

export function saveMarkdownReport(ctx: PipelineContext, outputPath: string) {
  const md = generateMarkdown(ctx);
  fs.writeFileSync(outputPath, md);
  console.log(`Report saved to ${outputPath}`);
}
