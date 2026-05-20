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
  .option("-m, --model <model>", "AI model to use")
  .action((dir, options) => watchCommand(dir || ".", options));

program
  .command("diff")
  .description("Analyze files changed in the current git working tree")
  .option("-a, --agents <agents>", "Comma-separated list of agents to run")
  .option("-m, --model <model>", "AI model to use")
  .option("-o, --output <path>", "Save report to markdown file")
  .action(diffCommand);

program.parse(process.argv);
