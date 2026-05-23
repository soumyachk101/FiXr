import chalk from "chalk";
import { PipelineContext } from "../agents/types";

export function renderBanner() {
  console.log(chalk.cyan(`
  ███████╗██╗██╗  ██╗██████╗ 
  ██╔════╝██║╚██╗██╔╝██╔══██╗
  █████╗  ██║ ╚███╔╝ ██████╔╝
  ██╔══╝  ██║ ██╔██╗ ██╔══██╗
  ██║     ██║██╔╝ ██╗██║  ██║
  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝`));
  console.log(chalk.cyan.bold("   FiXr — Multi-Agent Code Intelligence"));
  console.log(chalk.gray("   v1.0.0 | Static analysis, security audit & auto-patching\n"));
}

export function renderTerminal(ctx: PipelineContext) {
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(`  ${chalk.bold("Analysis Target:")} ${chalk.yellow(ctx.filePath)}`);
  console.log(`  ${chalk.bold("Language:")}        ${ctx.language}`);
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));

  if (ctx.bugReport) {
    console.log(`\n${chalk.yellow.bold("🐛 BUG DETECTIVE")}`);
    if (ctx.bugReport.bugs.length === 0) {
      console.log(chalk.green("  ✔ No bugs detected. Code looks solid."));
    } else {
      ctx.bugReport.bugs.forEach(bug => {
        const severityColor = bug.severity === "HIGH" ? chalk.red.bold : bug.severity === "MEDIUM" ? chalk.yellow.bold : chalk.blue.bold;
        console.log(`  [${severityColor(bug.severity)}] Line ${bug.line} — ${bug.description} ${chalk.gray(`(${bug.category})`)}`);
      });
    }
  }

  if (ctx.bugFixResponse && ctx.bugFixResponse.fixes.length > 0) {
    console.log(`\n${chalk.green.bold("🔧 BUG FIXER")}`);
    console.log(chalk.gray("  Applied the following patches:"));
    ctx.bugFixResponse.fixes.forEach(fix => {
      console.log(`  ${chalk.green("✔")} ${fix.action}`);
    });
    if (ctx.bugFixResponse.unfixed.length > 0) {
      console.log(chalk.gray("\n  The following issues require manual attention:"));
      ctx.bugFixResponse.unfixed.forEach(unfixed => {
        console.log(`  ${chalk.red("✘")} Bug #${unfixed.bugId}: ${unfixed.reason}`);
      });
    }
  }

  if (ctx.qualityReport) {
    console.log(`\n${chalk.magenta.bold("✨ CODE QUALITY")}`);
    const score = ctx.qualityReport.score;
    const ratingColor = score >= 90 ? chalk.green.bold : score >= 75 ? chalk.blue.bold : score >= 50 ? chalk.yellow.bold : chalk.red.bold;
    console.log(`  Rating: ${ratingColor(ctx.qualityReport.rating)} (${score}/100)`);
    
    if (ctx.qualityReport.positives && ctx.qualityReport.positives.length > 0) {
      console.log(chalk.gray("  Strengths:"));
      ctx.qualityReport.positives.forEach(pos => {
        console.log(`    + ${pos}`);
      });
    }

    if (ctx.qualityReport.suggestions.length > 0) {
      console.log(chalk.gray("  Suggestions for improvement:"));
      ctx.qualityReport.suggestions.forEach(suggestion => {
        const priorityColor = suggestion.priority === "HIGH" ? chalk.red : suggestion.priority === "MEDIUM" ? chalk.yellow : chalk.blue;
        console.log(`    - [${priorityColor(suggestion.priority)}] Line ${suggestion.line}: ${suggestion.issue}`);
        console.log(chalk.gray(`      └─ Suggestion: ${suggestion.suggestion}`));
      });
    }
  }

  if (ctx.securityReport) {
    console.log(`\n${chalk.red.bold("🔒 SECURITY AUDITOR")}`);
    if (ctx.securityReport.issues.length === 0) {
      console.log(chalk.green("  ✔ No security vulnerabilities found."));
    } else {
      const riskColor = ctx.securityReport.overallRisk === "CRITICAL" || ctx.securityReport.overallRisk === "HIGH" ? chalk.red.bold : chalk.yellow.bold;
      console.log(`  Overall Risk Level: ${riskColor(ctx.securityReport.overallRisk)}`);
      ctx.securityReport.issues.forEach(issue => {
        const severityColor = issue.severity === "CRITICAL" || issue.severity === "HIGH" ? chalk.red.bold : chalk.yellow.bold;
        console.log(`  [${severityColor(issue.severity)}] Line ${issue.line} — ${chalk.bold(issue.title)} ${chalk.gray(`(${issue.owasp || "OWASP"})`)}`);
        console.log(chalk.gray(`    Desc: ${issue.description}`));
        console.log(chalk.cyan(`    Fix:  ${issue.fix}`));
      });
    }
  }

  console.log("\n" + chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  const totalBugs = ctx.bugReport?.bugs.length || 0;
  const totalSec = ctx.securityReport?.issues.length || 0;
  const totalIssues = totalBugs + totalSec;
  const score = ctx.qualityReport?.score || 0;
  console.log(`  Score: ${chalk.bold(score + "/100")}  |  Bugs: ${chalk.yellow(totalBugs)}  |  Security Issues: ${chalk.red(totalSec)}`);
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
}
