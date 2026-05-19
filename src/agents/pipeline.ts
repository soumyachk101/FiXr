import fs from "fs";
import path from "path";
import { PipelineContext } from "./types";
import { runBugDetective } from "./bugDetective";
import { runBugFixer } from "./bugFixer";
import { runCodeQuality } from "./codeQuality";
import { runSecurityAudit } from "./securityAudit";

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".js": return "JavaScript";
    case ".ts": return "TypeScript";
    case ".py": return "Python";
    case ".go": return "Go";
    case ".java": return "Java";
    case ".cpp": return "C++";
    case ".c": return "C";
    case ".rb": return "Ruby";
    case ".php": return "PHP";
    case ".rs": return "Rust";
    default: return "Unknown";
  }
}

export async function runPipeline(
  filePath: string,
  options: { agents?: string[], model?: string } = {}
): Promise<PipelineContext> {
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const language = detectLanguage(filePath);

  let ctx: PipelineContext = { filePath, language, originalCode };

  const agentsToRun = options.agents || ["bug", "fixer", "quality", "security"];

  if (agentsToRun.includes("bug")) {
    ctx = await runBugDetective(ctx, options.model);
  }
  if (agentsToRun.includes("fixer")) {
    ctx = await runBugFixer(ctx, options.model);
  }
  if (agentsToRun.includes("quality")) {
    ctx = await runCodeQuality(ctx, options.model);
  }
  if (agentsToRun.includes("security")) {
    ctx = await runSecurityAudit(ctx, options.model);
  }

  return ctx;
}
