/**
 * Configuration Constants
 *
 * Common configuration constants that can be used by both Vitest and Cypress.
 */

/**
 * Common file paths
 */
export const paths = {
  // Setup files
  setupFiles: {
    vitest: "setup-tests.ts",
    cypress: {
      e2e: "cypress/support/e2e.ts",
      component: "cypress/support/component.ts",
    },
  },

  // Test directories
  testDirs: {
    vitest: "__tests__",
    cypress: {
      e2e: "cypress/e2e",
      component: "cypress/component",
    },
  },

  // Config files
  configFiles: {
    vitest: "vitest.config.ts",
    cypress: "cypress.config.ts",
  },
};

/**
 * Common test file patterns
 */
export const filePatterns = {
  // Test file patterns
  testFiles: {
    vitest: ["**/*.test.ts", "**/*.test.tsx"],
    cypress: {
      e2e: ["**/*.cy.ts", "**/*.cy.tsx"],
      component: ["**/*.cy.ts", "**/*.cy.tsx"],
    },
  },

  // Source file patterns
  sourceFiles: ["**/*.ts", "**/*.tsx", "!**/*.d.ts", "!node_modules/**"],

  // Ignored file patterns
  ignoredFiles: ["**/node_modules/**", "**/dist/**", "**/.turbo/**"],
};

/**
 * Common timeouts
 */
export const timeouts = {
  // Test timeouts
  test: 10000,

  // Hook timeouts
  hook: 10000,

  // Task timeouts
  task: 30000,
};

/**
 * Common environment settings
 */
export const environments = {
  // Node environment
  node: {
    test: "test",
    development: "development",
    production: "production",
  },

  // Test environment
  test: {
    jsdom: "jsdom",
    node: "node",
    happy: "happy-dom",
  },
};
