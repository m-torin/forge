import { defineConfig } from "tsup";

export default defineConfig({
  // Entry points for all the main exports
  entry: [
    // Main package entry
    "src/index.ts",

    // Vitest exports
    "src/vitest/index.ts",
    "src/vitest/configs.ts",

    // All Vitest config files (.ts only)
    "src/vitest/configs/*.ts",

    // All Vitest setup files (.ts only)
    "src/vitest/setup/*.ts",

    // All Vitest utils files (.ts and .tsx, excluding tests)
    "src/vitest/utils/!(*.test|*.spec).ts",
    "src/vitest/utils/!(*.test|*.spec).tsx",

    // Main mocks index
    "src/vitest/mocks/index.ts",

    // Individual mock files in root
    "src/vitest/mocks/browser.ts",
    "src/vitest/mocks/environment.ts",

    // All internal mock files (.ts only)
    "src/vitest/mocks/internal/*.ts",

    // All package mock files (.ts only, including nextjs subdirectory)
    "src/vitest/mocks/packages/*.ts",
    "src/vitest/mocks/packages/nextjs/*.ts",

    // All provider mock files (.ts only, including subdirectories)
    "src/vitest/mocks/providers/*.ts",
    "src/vitest/mocks/providers/google/*.ts",
    "src/vitest/mocks/providers/upstash/*.ts",

    // Vitest factories (.ts only)
    "src/vitest/factories/*.ts",

    // Playwright exports (.ts only)
    "src/playwright/index.ts",
    "src/playwright/configs/*.ts",
    "src/playwright/helpers/*.ts",

    // Shared exports
    "src/shared/index.ts",
  ],

  // Output configuration
  format: ["esm"],
  outDir: "dist",
  clean: true,

  // Type definitions
  dts: true,
  sourcemap: true,

  // Preserve file structure and avoid bundling
  splitting: false,
  bundle: false,

  // Preserve side effects (important for vi.mock calls)
  treeshake: false,

  // Target modern Node.js (matches tsconfig)
  target: "es2022",

  // External dependencies (don't bundle test dependencies)
  external: [
    "vitest",
    "@playwright/test",
    "playwright",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "@testing-library/user-event",
    "@vitejs/plugin-react",
    "@vitest/browser",
    "@vitest/coverage-v8",
    "@vitest/ui",
    "jsdom",
    "react",
    "vite",
    "webdriverio",
    "@axe-core/playwright",
    "@faker-js/faker",
    "@mantine/core",
  ],

  // Output .mjs files for proper ESM resolution
  outExtension({ format: _format }) {
    return {
      js: ".mjs",
    };
  },

  // Fix ESM import extensions after build
  async onSuccess() {
    const { fileURLToPath } = await import("url");
    const { dirname: pathDirname, join } = await import("path");
    const currentDir = pathDirname(fileURLToPath(import.meta.url));
    const { fixEsmImports } = await import(
      join(currentDir, "scripts", "fix-imports.mjs")
    );
    await fixEsmImports(join(currentDir, "dist"));
  },

  // Use proper ESM resolution
  shims: true,
  keepNames: true,

  // Skip some problematic files that should not be built
  ignoreWatch: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/test/**",
    "**/__tests__/**",
    "scripts/**",
  ],
});
