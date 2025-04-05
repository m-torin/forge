// This is a vitest.node.config.mjs template for Node.js packages in Next-Forge
// This file uses .mjs to avoid TypeScript ESM issues

import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration for Node.js packages
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"], // Customize this path if needed
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "**/node_modules/**",
        "**/*.d.ts",
        "test/**",
        "tests/**",
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "**/vitest.config.*",
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
    extensions: [".ts", ".js", ".json"],
  },
});
