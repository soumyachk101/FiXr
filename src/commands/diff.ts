import { execSync } from "child_process";
import { analyzeCommand } from "./analyze";
import path from "path";
import fs from "fs";

function resolveDiffOutputPath(baseOutput: string | undefined, filePath: string, totalFiles: number): string | undefined {
  if (!baseOutput) return undefined;
  if (totalFiles === 1) return baseOutput;

  let isDirectory = baseOutput.endsWith(path.sep);
  if (!isDirectory) {
    try {
      if (fs.existsSync(baseOutput)) {
        isDirectory = fs.statSync(baseOutput).isDirectory();
      }
    } catch {
      isDirectory = false;
    }
  }
  const fileName = path.basename(filePath);

  if (isDirectory) {
    return path.join(baseOutput, `report-${fileName}.md`);
  }

  const parsed = path.parse(baseOutput);
  if (parsed.ext) {
    return path.join(parsed.dir, `${parsed.name}-${fileName}${parsed.ext}`);
  }

  return `${baseOutput}-${fileName}`;
}

export async function diffCommand(options: any) {
  try {
    const output = execSync("git diff --name-only HEAD").toString();
    const files = output.split("\n").filter(f => f.trim().length > 0);

    if (files.length === 0) {
      console.log("No changed files found in git.");
      return;
    }

    console.log(`Found ${files.length} changed files. Analyzing...\n`);

    for (const file of files) {
      const filePath = path.resolve(process.cwd(), file);
      const outputPath = resolveDiffOutputPath(options.output, filePath, files.length);
      const perFileOptions = outputPath ? { ...options, output: outputPath } : options;
      await analyzeCommand(filePath, perFileOptions);
    }
  } catch (error: any) {
    console.error("Error running git diff:", error.message);
  }
}
