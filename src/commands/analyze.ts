import ora from "ora";
import { runPipeline } from "../agents/pipeline";
import { renderTerminal } from "../output/terminal";
import { saveMarkdownReport } from "../output/markdown";
import { loadConfig } from "../config/loader";
import path from "path";
import fs from "fs";

export async function analyzeCommand(filePath: string, options: any) {
  const config = await loadConfig();

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const spinner = ora(`Analyzing ${filePath}...`).start();

  try {
    const agents = options.agents ? options.agents.split(",") : config.agents;
    const model = options.model || config.model;

    const ctx = await runPipeline(filePath, { agents, model });
    spinner.succeed("Analysis complete");

    renderTerminal(ctx);

    if (options.output || config.output.saveReport) {
      const outputPath = options.output || path.join(config.output.reportPath, `report-${path.basename(filePath)}.md`);
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      saveMarkdownReport(ctx, outputPath);
    }
  } catch (error: any) {
    spinner.fail("Analysis failed");
    console.error(error.message);
  }
}
