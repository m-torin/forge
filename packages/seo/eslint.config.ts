// eslint.config.ts
import reactConfig from "@repo/eslint-config/react-package";

// @ts-ignore - eslint doesn't have type definitions
import type { Linter } from "eslint";

const config: Linter.FlatConfig[] = reactConfig;

export default config;
