#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init";
import { analyzeCommand } from "./commands/analyze";
import { watchCommand } from "./commands/watch";
import { diffCommand } from "./commands/diff";

const program = new Command();

program
  .name("codewatch")
  .description("Multi-Agent Code Analysis CLI")
  .version("1.0.0");

program
  .command("init")
  .description("Interactively initialize configuration file (.codewatchrc.json)")
  .action(initCommand);

program
  .command("analyze <file>")
  .description("Analyze a single file with specialized agents and optionally apply fixes")
  .option("-o, --output <path>", "Save report to markdown file")
  .option("-a, --agents <agents>", "Comma-separated list of agents to run (bug,fixer,quality,security)")
  .option("-m, --model <model>", "AI model to use")
  .option("-f, --fix", "Automatically apply generated fixes back to the file")
  .option("-y, --yes", "Skip prompt and auto-approve all fixes (useful for CI/CD)")
  .action(analyzeCommand);

program
  .command("watch [dir]")
  .description("Watch a directory for changes and automatically analyze files")
  .option("-a, --agents <agents>", "Comma-separated list of agents to run")
  .option("-m, --model <model>", "AI model to use")
  .action((dir, options) => watchCommand(dir || ".", options));

program
  .command("diff")
  .description("Analyze files changed in the current git commit")
  .option("-a, --agents <agents>", "Comma-separated list of agents to run")
  .option("-m, --model <model>", "AI model to use")
  .option("-f, --fix", "Automatically apply generated fixes back to the files")
  .option("-y, --yes", "Skip prompt and auto-approve all fixes")
  .action(diffCommand);

program.parse(process.argv);

