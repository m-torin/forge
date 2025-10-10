import { createBasePlaywrightConfig } from "./src/playwright/configs/base-config";

/**
 * Playwright configuration for the QA package itself
 * Uses the centralized base config to ensure consistency
 */
export default createBasePlaywrightConfig({
  testDir: "./src/playwright",
  /* Exclude template files - they are examples, not actual tests */
  testIgnore: ["**/templates/**/*.spec.ts", "**/templates/**/*.test.ts"],
  /* Use base config projects with environment-specific browser filtering */
});
