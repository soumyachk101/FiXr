#!/usr/bin/env node
import { Command } from "commander";
import { analyzeCommand } from "./commands/analyze";
import { watchCommand } from "./commands/watch";
import { diffCommand } from "./commands/diff";

const program = new Command();

program
  .name("codewatch")
  .description("Multi-Agent Code Analysis CLI")
  .version("1.0.0");

program
  .command("analyze <file>")
  .description("Analyze a single file with 4 specialized agents")
  .option("-o, --output <path>", "Save report to markdown file")
  .option("-a, --agents <agents>", "Comma-separated list of agents to run (bug,fixer,quality,security)")
  .option("-m, --model <model>", "AI model to use")
  .action(analyzeCommand);

program
  .command("watch [dir]")
  .description("Watch a directory for changes and automatically analyze files")
  .action((dir) => watchCommand(dir || "."));

program
  .command("diff")
  .description("Analyze files changed in the current git commit")
  .option("-a, --agents <agents>", "Comma-separated list of agents to run")
  .option("-m, --model <model>", "AI model to use")
  .action(diffCommand);

program.parse(process.argv);
