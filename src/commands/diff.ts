import { execSync } from "child_process";
import { analyzeCommand } from "./analyze";
import { renderBanner } from "../output/terminal";
import path from "path";

export async function diffCommand(options: any) {
  try {
    const output = execSync("git diff --name-only HEAD").toString();
    const files = output.split("\n").filter(f => f.trim().length > 0);

    renderBanner();

    if (files.length === 0) {
      console.log("No changed files found in git.");
      return;
    }

    console.log(`Found ${files.length} changed files. Analyzing...\n`);

    for (const file of files) {
      const filePath = path.resolve(process.cwd(), file);
      await analyzeCommand(filePath, { ...options, __suppressBanner: true });
    }
  } catch (error: any) {
    console.error("Error running git diff:", error.message);
  }
}

