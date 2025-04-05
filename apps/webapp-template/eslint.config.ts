// eslint.config.ts
import nextConfig from "@repo/eslint-config/next";

import type { Linter } from "eslint";

// Override the perfectionist/sort-imports rule to fix the regex issue
const overriddenConfig: Linter.FlatConfig[] = nextConfig.map((config) => {
  if (config.rules && config.rules["perfectionist/sort-imports"]) {
    return {
      ...config,
      rules: {
        ...config.rules,
        "perfectionist/sort-imports": [
          "error",
          {
            type: "natural",
            groups: [
              "builtin",
              "external",
              "internal",
              "parent",
              "sibling",
              "index",
              "object",
              "type",
              "unknown",
            ],
            ignoreCase: true,
            internalPattern: ["^@repo/"],
            newlinesBetween: "always",
            order: "asc",
          },
        ],
      },
    };
  }
  return config;
});

export default overriddenConfig;
