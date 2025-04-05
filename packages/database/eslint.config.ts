// eslint.config.ts
import serverConfig from "@repo/eslint-config/server";

// @ts-ignore - eslint doesn't have type definitions
import type { Linter } from "eslint";

const config: Linter.FlatConfig[] = [
  {
    ignores: ["src/generated/**/*", "**/*.md", "**/__tests__/**/*"],
  },
  ...serverConfig,
];

export default config;
