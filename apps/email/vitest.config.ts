import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    environmentMatchGlobs: [
      // Use jsdom for React component tests
      ["**/*.tsx", "jsdom"],
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      // Skip the files that are causing issues with esbuild
      ".react-email/src/utils/caniemail/ast/get-used-style-properties.spec.ts",
      ".react-email/src/utils/caniemail/tailwind/get-tailwind-metadata.spec.ts",
      // Skip tests that depend on demo email templates that don't exist in this environment
      ".react-email/src/utils/get-email-component.spec.ts",
      ".react-email/src/utils/get-emails-directory-metadata.spec.ts",
    ],
    globals: true,
  },
});
