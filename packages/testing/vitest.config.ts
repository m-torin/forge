import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Set globals at the top level
    // --- Global Excludes ---
    // Exclude common directories and file types that are definitely not tests
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**", // Exclude all Cypress-related files
      "**/scripts/**", // Exclude utility scripts
      "**/*.d.ts", // Exclude TypeScript definition files
      // Removed template exclude from global - will add to specific workspace
    ],
    // --- Workspace Definition ---
    workspace: [
      {
        // --- React/Component Tests ---
        name: "react-tests",
        environment: "jsdom", // Use jsdom for React component testing
        // globals: true,     // Removed from workspace
        include: ["src/**/*.test.tsx", "src/**/*.spec.tsx"], // ONLY include .test.tsx/.spec.tsx files
        // setupFiles: ['path/to/react/setup.ts'], // Consider adding a setup file if needed for jsdom
      },
      {
        // --- Node/Utility Tests ---
        name: "node-tests",
        environment: "node", // Use node environment
        // globals: true,     // Removed from workspace
        include: ["src/**/*.test.ts", "src/**/*.spec.ts"], // ONLY include .test.ts/.spec.ts files
        // Explicitly exclude files handled by the react-tests workspace AND template files
        exclude: [
          "src/**/*.test.tsx",
          "src/**/*.spec.tsx",
          "src/env/templates/**/*.test.ts", // Exclude template files here
        ],
      },
    ],
  },
});
