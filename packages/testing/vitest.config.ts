import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      // Skip the template files that are causing issues with esbuild
      "src/vitest/templates/react/**",
      "src/vitest/test-exports.test.ts",
      "src/env/templates/**",
    ],
    environmentMatchGlobs: [
      // Use jsdom for React component tests
      ["src/**/*.tsx", "jsdom"],
    ],
  },
});
