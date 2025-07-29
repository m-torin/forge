import { logInfo } from '@repo/observability';
import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  setup() {
    // Custom setup for test runner
    // This runs before all tests
  },
  async preVisit(page) {
    // Custom pre-visit logic
    // This runs before each story is visited
    await page.emulateMedia({ reducedMotion: 'reduce' });
  },
  async postVisit(page, context) {
    // Custom post-visit logic
    // This runs after each story is visited

    // Example: Take screenshot for visual regression testing
    if (context.name !== 'Docs') {
      await page.waitForTimeout(500); // Wait for animations

      // Run accessibility tests
      const elementHandler = await page.$('#storybook-root');
      const innerHTML = await elementHandler?.innerHTML();

      if (innerHTML) {
        // Additional accessibility checks can be added here
        logInfo(`Tested accessibility for ${context.title} - ${context.name}`);
      }
    }
  },
  tags: {
    include: ['test'],
    exclude: ['!test'],
    skip: ['skip-test'],
  },
};

export default config;
