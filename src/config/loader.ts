import { cosmiconfig } from "cosmiconfig";

export interface Config {
  agents: string[];
  ignore: string[];
  watch: {
    extensions: string[];
    debounce: number;
  };
  output: {
    format: "terminal" | "markdown";
    saveReport: boolean;
    reportPath: string;
  };
  model: string;
  maxTokens: number;
}

const DEFAULT_CONFIG: Config = {
  agents: ["bug", "fixer", "quality", "security"],
  ignore: ["node_modules", "dist", "*.test.js", ".git"],
  watch: {
    extensions: [".js", ".ts", ".py", ".go"],
    debounce: 2000
  },
  output: {
    format: "terminal",
    saveReport: false,
    reportPath: "./reports"
  },
  model: "claude-3-5-sonnet-20240620",
  maxTokens: 2000
};

export async function loadConfig(): Promise<Config> {
  const explorer = cosmiconfig("codewatch");
  const result = await explorer.search();

  if (!result) {
    return DEFAULT_CONFIG;
  }

  return { ...DEFAULT_CONFIG, ...result.config };
}
