/**
 * Visual Regression Testing E2E Test Template
 * Copy this file to your app's e2e folder and customize
 */

import {
  expect,
  ResponsiveTestUtils,
  test,
  ThemeTestUtils,
  VisualTestUtils,
  WaitUtils,
} from '@repo/qa/playwright';

test.describe('Visual Regression Testing', () => {
  let visual: VisualTestUtils;
  let responsive: ResponsiveTestUtils;
  let theme: ThemeTestUtils;
  let wait: WaitUtils;

  test.beforeEach(async ({ page }) => {
    visual = new VisualTestUtils(page);
    responsive = new ResponsiveTestUtils(page);
    theme = new ThemeTestUtils(page);
    wait = new WaitUtils(page);
  });

  test('homepage visual consistency', async ({ page }) => {
    await page.goto('/');
    await wait.forNavigation();

    // Hide dynamic content that changes
    await visual.hideDynamicContent(['.timestamp', '.user-avatar', '.notification-badge']);

    // Wait for animations to complete
    await visual.waitForAnimations();

    // Take screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('responsive design visual tests', async ({ page }) => {
    await page.goto('/');

    // Test each viewport
    await responsive.testResponsive(async () => {
      await visual.waitForAnimations();

      const viewport = page.viewportSize();
      await expect(page).toHaveScreenshot(`homepage-${viewport?.width}x${viewport?.height}.png`, {
        fullPage: true,
      });
    });
  });

  test('dark mode visual consistency', async ({ page }) => {
    await page.goto('/');

    // Test in both themes
    await theme.testInBothModes(async () => {
      await visual.waitForAnimations();

      const isDark = await theme.isDarkMode();
      const themeName = isDark ? 'dark' : 'light';

      await expect(page).toHaveScreenshot(`homepage-${themeName}.png`, {
        fullPage: true,
      });
    });
  });

  test('component visual tests', async ({ page }) => {
    await page.goto('/components');

    // Test individual components
    const components = [
      { name: 'button-primary', selector: '.button-primary' },
      { name: 'card', selector: '.card' },
      { name: 'form-input', selector: '.form-input' },
      { name: 'navigation', selector: '.navigation' },
    ];

    for (const component of components) {
      const element = page.locator(component.selector).first();
      const isVisible = element;
      await expect(isVisible).toBeVisible();
      await expect(element).toHaveScreenshot(`${component.name}.png`);
    }
  });

  test('interactive state visual tests', async ({ page }) => {
    await page.goto('/');

    // Test hover states
    const button = page.getByRole('button', { name: /get started/i });
    const isVisible = button;
    await expect(isVisible).toBeVisible();
    // Normal state
    await expect(button).toHaveScreenshot('button-normal.png');

    // Hover state
    await button.hover();
    await expect(button).toHaveScreenshot('button-hover.png');

    // Focus state
    await button.focus();
    await expect(button).toHaveScreenshot('button-focus.png');
  });

  test('form validation visual states', async ({ page }) => {
    await page.goto('/contact');

    const form = page.locator('form');
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.getByRole('button', { name: /submit/i });

    // Initial state
    await expect(form).toHaveScreenshot('form-initial.png');

    // Error state
    await emailInput.fill('invalid-email');
    await submitButton.click();
    await wait.forText('Invalid email');
    await expect(form).toHaveScreenshot('form-error.png');

    // Success state
    await emailInput.fill('valid@example.com');
    await page.fill('textarea[name="message"]', 'Test message');
    await submitButton.click();
    await wait.forText('Success');
    await expect(form).toHaveScreenshot('form-success.png');
  });

  test('animation visual tests', async ({ page }) => {
    await page.goto('/animations');

    // Capture animation states
    const animatedElement = page.locator('.animated-element');
    const isVisible = animatedElement;
    await expect(isVisible).toBeVisible();
    // Start of animation
    await expect(animatedElement).toHaveScreenshot('animation-start.png');

    // Mid animation
    // Wait for mid-animation state (if possible, use a utility; otherwise, fallback to timeout)
    // TODO: Replace with a more robust animation state check if available
    await visual.waitForAnimations(); // fallback: await page.waitForTimeout(500);
    await expect(animatedElement).toHaveScreenshot('animation-mid.png');

    // End of animation
    await visual.waitForAnimations();
    await expect(animatedElement).toHaveScreenshot('animation-end.png');
  });

  test('cross-browser visual consistency', async ({ browserName, page }) => {
    await page.goto('/');
    await visual.waitForAnimations();

    // Take browser-specific screenshots
    await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
      fullPage: true,
    });
  });

  test('visual tests with masked sensitive data', async ({ page }) => {
    await page.goto('/dashboard');

    // Mask sensitive information
    await visual.maskContent(['.user-email', '.api-key', '.credit-card', '.personal-info']);

    await expect(page).toHaveScreenshot('dashboard-masked.png', {
      fullPage: true,
    });
  });

  test('print view visual test', async ({ page }) => {
    await page.goto('/invoice');

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    await expect(page).toHaveScreenshot('invoice-print.png', {
      fullPage: true,
    });
  });
});
