// eslint.config.ts
import serverConfig from "@repo/eslint-config/server";

import type { Linter } from "eslint";

const config: Linter.FlatConfig[] = [
  ...serverConfig,
  {
    files: ["**/*.js"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
];

export default config;
