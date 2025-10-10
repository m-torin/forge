import next from "@repo/eslint-config/next";

export default [
  ...next,
  {
    ignores: [
      "**/public/monaco-workers/**",
      "**/build/**",
      "**/dist/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/*.worker.js",
      "**/*.worker.ts"
    ]
  },
  {
    // Allow console statements in build scripts
    files: ["scripts/**/*.{js,mjs,ts}"],
    rules: {
      "no-console": "off"
    }
  },
  {
    // Allow console statements in documentation examples
    files: ["**/*.md", "**/*.mdx"],
    rules: {
      "no-console": "off"
    }
  },
  {
    // Allow console statements in compiled/vendor files
    files: ["**/public/**/*.js", "**/*.worker.js", "**/dist/**/*.js", "**/build/**/*.js"],
    rules: {
      "no-console": "off"
    }
  },
  {
    // Allow console statements in integration command files (they contain documentation examples)
    files: ["**/integrations/**/commands.ts"],
    rules: {
      "no-console": "off"
    }
  },
  {
    // Relax E2E test rules for Playwright testing patterns
    files: ["**/__tests__/e2e/**/*.spec.ts", "**/__tests__/e2e/**/*.test.ts"],
    rules: {
      "playwright/no-conditional-expect": "off",
      "playwright/no-conditional-in-test": "off",
      "playwright/no-networkidle": "off",
      "playwright/no-wait-for-selector": "off"
    }
  },
  {
    // Allow accessibility exceptions for test components
    files: ["**/__tests__/**/*.tsx", "**/__tests__/**/*.test.tsx"],
    rules: {
      "jsx-a11y/no-static-element-interactions": "off"
    }
  }
];