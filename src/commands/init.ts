import fs from "fs";
import path from "path";
import readline from "readline";
import chalk from "chalk";
import { renderBanner } from "../output/terminal";

function askQuestion(query: string): Promise<string> {
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

// Scans project directory up to a depth of 3 folders to auto-detect used programming languages
function detectProjectExtensions(dir: string, depth = 0): string[] {
  if (depth > 3) return [];
  const extensions = new Set<string>();
  const supported = [".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".java", ".cpp", ".c", ".rs", ".rb", ".php"];
  
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const name = file.name;
        if (["node_modules", "dist", "build", "coverage", "reports", ".git", ".gemini", "out"].includes(name)) {
          continue;
        }
        const subExts = detectProjectExtensions(path.join(dir, name), depth + 1);
        subExts.forEach(ext => extensions.add(ext));
      } else {
        const ext = path.extname(file.name).toLowerCase();
        if (supported.includes(ext)) {
          extensions.add(ext);
        }
      }
    }
  } catch {}
  return Array.from(extensions);
}

export async function initCommand() {
  renderBanner();
  console.log(chalk.bold("⚙️ Automated Configuration Initializer\n"));
  console.log("Analyzing workspace and environment...\n");

  let apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || "";
  let provider = "";
  let model = "";
  let apiBase = "";
  let apiKeyEnvName = "";

  if (apiKey) {
    console.log(chalk.green("✔ Detected existing API key in environment variables."));
    if (process.env.ANTHROPIC_API_KEY) {
      provider = "Anthropic Claude";
      model = "claude-3-5-sonnet-20240620";
      apiKeyEnvName = "ANTHROPIC_API_KEY";
    } else {
      const isGroq = apiKey.startsWith("gsk_") || process.env.OPENAI_API_BASE?.includes("groq");
      const isDeepSeek = apiKey.startsWith("sk-deepseek") || process.env.OPENAI_API_BASE?.includes("deepseek");
      const isOllama = apiKey === "ollama" || process.env.OPENAI_API_BASE?.includes("localhost:11434") || process.env.OPENAI_API_BASE?.includes("127.0.0.1:11434");
      
      if (isGroq) {
        provider = "Groq Llama";
        model = "llama-3.3-70b-versatile";
        apiKeyEnvName = "OPENAI_API_KEY";
        apiBase = process.env.OPENAI_API_BASE || "https://api.groq.com/openai/v1";
      } else if (isDeepSeek) {
        provider = "DeepSeek";
        model = "deepseek-chat";
        apiKeyEnvName = "OPENAI_API_KEY";
        apiBase = process.env.OPENAI_API_BASE || "https://api.deepseek.com";
      } else if (isOllama) {
        provider = "Ollama Local";
        model = "llama3";
        apiKeyEnvName = "OPENAI_API_KEY";
        apiBase = process.env.OPENAI_API_BASE || "http://localhost:11434/v1";
      } else {
        provider = "OpenAI GPT";
        model = "gpt-4o";
        apiKeyEnvName = "OPENAI_API_KEY";
        apiBase = process.env.OPENAI_API_BASE || "";
      }
    }
  } else {
    console.log(chalk.blue("No active API keys found in active environment."));
    const inputKey = await askQuestion(chalk.yellow("🔑 Enter your LLM API Key (or press Enter for local Ollama): "));
    
    if (!inputKey) {
      // Default to Ollama
      console.log(chalk.cyan("ℹ No key provided. Defaulting to local Ollama configuration."));
      provider = "Ollama Local";
      model = "llama3";
      apiKey = "ollama";
      apiKeyEnvName = "OPENAI_API_KEY";
      apiBase = "http://localhost:11434/v1";
    } else {
      apiKey = inputKey;
      if (apiKey.startsWith("sk-ant-")) {
        provider = "Anthropic Claude";
        model = "claude-3-5-sonnet-20240620";
        apiKeyEnvName = "ANTHROPIC_API_KEY";
      } else if (apiKey.startsWith("gsk_")) {
        provider = "Groq Llama";
        model = "llama-3.3-70b-versatile";
        apiKeyEnvName = "OPENAI_API_KEY";
        apiBase = "https://api.groq.com/openai/v1";
      } else if (apiKey.includes("deepseek") || apiKey.startsWith("sk-de")) {
        provider = "DeepSeek";
        model = "deepseek-chat";
        apiKeyEnvName = "OPENAI_API_KEY";
        apiBase = "https://api.deepseek.com";
      } else if (apiKey.startsWith("sk-")) {
        provider = "OpenAI GPT";
        model = "gpt-4o";
        apiKeyEnvName = "OPENAI_API_KEY";
      } else {
        // Fallback OpenAI-compatible
        provider = "OpenAI-Compatible Generic";
        model = "gpt-4o";
        apiKeyEnvName = "OPENAI_API_KEY";
      }
    }
  }

  console.log(`\n  ${chalk.bold("Auto-Detected Configuration:")}`);
  console.log(`  • ${chalk.bold("Provider:")} ${chalk.cyan(provider)}`);
  console.log(`  • ${chalk.bold("Model ID:")} ${chalk.cyan(model)}`);
  if (apiBase) {
    console.log(`  • ${chalk.bold("API Base:")} ${chalk.cyan(apiBase)}`);
  }

  // Auto-detect project files
  console.log(chalk.gray("\nScanning project directory for source code files..."));
  let extensions = detectProjectExtensions(process.cwd());
  
  if (extensions.length === 0) {
    console.log(chalk.gray("  No standard code files found. Setting defaults: .js, .ts, .py, .go"));
    extensions = [".js", ".ts", ".py", ".go"];
  } else {
    console.log(chalk.green(`✔ Detected languages: ${extensions.join(", ")}`));
  }

  // Create config structure
  const configObj = {
    agents: ["bug", "fixer", "quality", "security"],
    ignore: ["node_modules", "dist", "*.test.js", ".git", "build", "coverage"],
    watch: {
      extensions,
      debounce: 2000
    },
    output: {
      format: "terminal",
      saveReport: false,
      reportPath: "./reports"
    },
    model,
    maxTokens: 2000
  };

  // Write .codewatchrc.json
  const configFilePath = path.join(process.cwd(), ".codewatchrc.json");
  fs.writeFileSync(configFilePath, JSON.stringify(configObj, null, 2), "utf-8");
  console.log(`${chalk.green("✔")} Created configuration: ${chalk.cyan(".codewatchrc.json")}`);

  // Write .env if key is provided and not already saved
  if (apiKey && !process.env[apiKeyEnvName]) {
    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    let updatedEnv = envContent;
    const apiKeyLine = `${apiKeyEnvName}=${apiKey}`;
    const regex = new RegExp(`^${apiKeyEnvName}=`, "m");
    
    if (regex.test(envContent)) {
      updatedEnv = envContent.replace(new RegExp(`^${apiKeyEnvName}=.*$`, "m"), apiKeyLine);
    } else {
      if (updatedEnv.length > 0 && !updatedEnv.endsWith("\n")) {
        updatedEnv += "\n";
      }
      updatedEnv += `${apiKeyLine}\n`;
    }

    if (apiBase) {
      const apiBaseLine = `OPENAI_API_BASE=${apiBase}`;
      if (/^OPENAI_API_BASE=/m.test(updatedEnv)) {
        updatedEnv = updatedEnv.replace(/^OPENAI_API_BASE=.*$/m, apiBaseLine);
      } else {
        updatedEnv += `${apiBaseLine}\n`;
      }
    }

    fs.writeFileSync(envPath, updatedEnv, "utf-8");
    console.log(`${chalk.green("✔")} Saved keys to environment: ${chalk.cyan(".env")}`);
  }

  console.log(`\n${chalk.green.bold("Setup Complete!")} Run ${chalk.cyan("codewatch analyze <file>")} to start. 🎉\n`);
}
