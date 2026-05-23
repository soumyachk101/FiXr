import chokidar from "chokidar";
import debounce from "lodash.debounce";
import { runPipeline } from "../agents/pipeline";
import { renderTerminal, renderBanner } from "../output/terminal";
import { loadConfig } from "../config/loader";
import path from "path";
import ora from "ora";

export async function watchCommand(dir: string, options: any = {}) {
  const config = await loadConfig();

  const watcher = chokidar.watch(dir, {
    ignored: config.ignore,
    persistent: true,
  });

  const agents = options.agents ? options.agents.split(",") : config.agents;
  const model = options.model || config.model;

  const analyze = debounce(async (filePath: string) => {
    const ext = path.extname(filePath);
    if (!config.watch.extensions.includes(ext)) return;

    console.log(`\n📂 Changed: ${filePath}`);
    const spinner = ora(`Analyzing...`).start();
    try {
      const ctx = await runPipeline(filePath, { agents, model });
      spinner.succeed("Analysis complete");
      renderTerminal(ctx);
    } catch (error: any) {
      spinner.fail("Analysis failed");
      console.error(error.message);
    }
  }, config.watch.debounce);

  watcher.on("change", (filePath) => {
    analyze(filePath);
  });

  renderBanner();
  console.log(`👁️  Watching ${dir} for changes...`);
}

