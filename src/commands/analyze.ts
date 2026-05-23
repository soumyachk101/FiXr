import ora from "ora";
import { runPipeline } from "../agents/pipeline";
import { renderTerminal, renderBanner } from "../output/terminal";
import { saveMarkdownReport } from "../output/markdown";
import { loadConfig } from "../config/loader";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import readline from "readline";

function askConfirmation(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

function getFilesRecursive(dir: string, extensions: string[], ignoreList: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    // Check if this path should be ignored
    const relativePath = path.relative(process.cwd(), fullPath);
    const shouldIgnore = ignoreList.some(pattern => {
      if (file === pattern) return true;
      if (relativePath.split(path.sep).includes(pattern)) return true;
      if (pattern.startsWith("*.")) {
        const ext = pattern.slice(1);
        return fullPath.endsWith(ext);
      }
      return relativePath.includes(pattern);
    });
    
    if (shouldIgnore) continue;

    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursive(fullPath, extensions, ignoreList));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

export async function analyzeCommand(filePath: string, options: any) {
  const config = await loadConfig();

  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    if (!options.__suppressBanner) {
      renderBanner();
    }
    const extensions = config.watch.extensions;
    const ignoreList = config.ignore;
    const files = getFilesRecursive(filePath, extensions, ignoreList);

    if (files.length === 0) {
      console.log(chalk.yellow(`No files found in directory matching extensions: ${extensions.join(", ")}`));
      return;
    }

    console.log(chalk.blue(`Found ${files.length} files in directory. Analyzing...\n`));

    for (const file of files) {
      await analyzeCommand(file, { ...options, __suppressBanner: true });
    }
    return;
  }

  if (!options.__suppressBanner) {
    renderBanner();
  }
  const spinner = ora(`Analyzing ${filePath}...`).start();

  try {
    let agents = options.agents ? options.agents.split(",") : [...config.agents];
    if (options.fix && !agents.includes("fixer")) {
      agents.push("fixer");
    }
    const model = options.model || config.model;

    const ctx = await runPipeline(filePath, { agents, model });
    spinner.succeed("Analysis complete");

    renderTerminal(ctx);

    // Save report if requested
    if (options.output || config.output.saveReport) {
      const outputPath = options.output || path.join(config.output.reportPath, `report-${path.basename(filePath)}.md`);
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      saveMarkdownReport(ctx, outputPath);
    }

    // Apply fixes if --fix option is set
    if (options.fix && ctx.bugFixResponse) {
      const { fixedCode, fixes } = ctx.bugFixResponse;
      if (fixes.length > 0 && fixedCode && fixedCode !== ctx.originalCode) {
        let shouldApply = false;
        if (options.yes) {
          shouldApply = true;
        } else {
          console.log("");
          const answer = await askConfirmation(chalk.yellow(`? Do you want to apply these ${fixes.length} fixes to ${path.basename(filePath)}? (y/N): `));
          if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            shouldApply = true;
          }
        }

        if (shouldApply) {
          fs.writeFileSync(filePath, fixedCode, "utf-8");
          console.log(chalk.green(`✔ Successfully applied patches to ${filePath}\n`));
        } else {
          console.log(chalk.gray(`⚠ Fixes were not applied to ${filePath}\n`));
        }
      } else {
        console.log(chalk.gray(`ℹ No auto-fixable issues were found in ${path.basename(filePath)}.\n`));
      }
    }
  } catch (error: any) {
    spinner.fail("Analysis failed");
    console.error(chalk.red(`\nError: ${error.message}`));
  }
}

