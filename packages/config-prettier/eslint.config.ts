// ESLint v9 configuration
import type { Linter } from "eslint";
import baseConfig from "@repo/eslint-config";

// Extend base config with specific overrides for Markdown files
const config: Linter.FlatConfig[] = [
  ...(Array.isArray(baseConfig) ? baseConfig : [baseConfig]),
  {
    files: ["**/*.md", "**/README.md"],
    languageOptions: {
      parserOptions: {
        project: null, // Disable TypeScript project configuration for markdown files
      },
    },
  },
  {
    files: [
      "**/*.md/*.{js,jsx,ts,tsx}",
      "**/README.md/*.{js,jsx,ts,tsx}",
      "**/README.md/[0-9]*_[0-9]*.ts",
    ],
    languageOptions: {
      parserOptions: {
        project: null, // Disable TypeScript project configuration for code blocks in markdown files
      },
    },
  },
];

export default config;
