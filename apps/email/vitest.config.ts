import { defineConfig } from "vitest/config";

// Define common patterns once
const commonExcludes = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.react-email/**/*.spec.ts",
  "**/.react-email/**/*.test.ts",
  "**/.react-email/**/*.spec.tsx",
  "**/.react-email/**/*.test.tsx",
];

export default defineConfig({
  test: {
    exclude: commonExcludes,
    globals: true,
    workspace: [
      {
        test: {
          name: "react-tests",
          environment: "jsdom",
          // Include only test files
          include: ["./__tests__/**/*.tsx"],
        },
      },
      {
        test: {
          name: "node-tests",
          environment: "node",
          // Only need to add the additional exclusion specific to this workspace
          exclude: ["**/*.tsx"],
          // Include only test files
          include: ["./__tests__/**/*.ts"],
        },
      },
    ],
  },
});
