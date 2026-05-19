import chalk from "chalk";
import { PipelineContext } from "../agents/types";

export function renderTerminal(ctx: PipelineContext) {
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.bold("  CodeWatch — Multi-Agent Analysis"));
  console.log(`  File: ${ctx.filePath}`);
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));

  if (ctx.bugReport) {
    console.log(`\n${chalk.yellow("🐛 BUG DETECTIVE")}`);
    if (ctx.bugReport.bugs.length === 0) {
      console.log(chalk.green("  No bugs found"));
    } else {
      ctx.bugReport.bugs.forEach(bug => {
        const severityColor = bug.severity === "HIGH" ? chalk.red : bug.severity === "MEDIUM" ? chalk.yellow : chalk.blue;
        console.log(`  [${severityColor(bug.severity)}] Line ${bug.line} — ${bug.description}`);
      });
    }
  }

  if (ctx.bugFixResponse && ctx.bugFixResponse.fixes.length > 0) {
    console.log(`\n${chalk.green("🔧 BUG FIXER")}`);
    console.log(chalk.gray("  Fixed code with inline comments:"));
    // We could print the whole fixed code, but it might be too long.
    // Maybe just a snippet or a summary.
    ctx.bugFixResponse.fixes.forEach(fix => {
      console.log(`  - ${fix.action}`);
    });
  }

  if (ctx.qualityReport) {
    console.log(`\n${chalk.magenta("✨ CODE QUALITY")}`);
    console.log(`  Rating: ${ctx.qualityReport.rating} (${ctx.qualityReport.score}/100)`);
    ctx.qualityReport.suggestions.forEach(suggestion => {
      console.log(`  - ${suggestion.issue} (Line ${suggestion.line})`);
      console.log(chalk.gray(`    Suggestion: ${suggestion.suggestion}`));
    });
  }

  if (ctx.securityReport) {
    console.log(`\n${chalk.red("🔒 SECURITY AUDITOR")}`);
    if (ctx.securityReport.issues.length === 0) {
      console.log(chalk.green("  No security issues detected"));
    } else {
      ctx.securityReport.issues.forEach(issue => {
        const severityColor = issue.severity === "CRITICAL" || issue.severity === "HIGH" ? chalk.red : chalk.yellow;
        console.log(`  [${severityColor(issue.severity)}] Line ${issue.line} — ${issue.title}`);
        console.log(chalk.gray(`    ${issue.description}`));
      });
    }
  }

  console.log("\n" + chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  const totalIssues = (ctx.bugReport?.bugs.length || 0) + (ctx.securityReport?.issues.length || 0);
  const score = ctx.qualityReport?.score || 0;
  console.log(`  Score: ${score}/100  |  Issues: ${totalIssues}`);
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
}
