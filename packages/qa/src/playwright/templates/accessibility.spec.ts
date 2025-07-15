/**
 * Accessibility Testing E2E Test Template
 * Copy this file to your app's e2e folder and customize
 */

import { AccessibilityReporter, AccessibilityTestUtils, expect, test } from '@repo/qa/playwright';

test.describe('Accessibility Testing', () => {
  let a11y: AccessibilityTestUtils;

  test.beforeEach(async ({ page }) => {
    a11y = new AccessibilityTestUtils(page);
  });

  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const results = await a11y.runCommonChecks();

    // Log violations for debugging
    results.violations.forEach((violation: any) => {
      console.log(`- ${violation.id}: ${violation.description}`);
      console.log(`  Impact: ${violation.impact}`);
      console.log(`  Elements: ${violation.nodes.length}`);
    });

    // Assert no critical or serious violations
    expect(results.criticalViolations).toHaveLength(0);
    expect(results.seriousViolations).toHaveLength(0);
  });

  test('all pages should pass WCAG 2.1 Level AA', async ({ page }) => {
    const pagesToTest = ['/', '/about', '/contact', '/sign-in', '/sign-up'];

    for (const path of pagesToTest) {
      await page.goto(path);

      const results = await a11y.scan({
        includedImpacts: ['critical', 'serious'],
      });

      expect(results.violations).toHaveLength(0);
    }
  });

  test('forms should be accessible', async ({ page }) => {
    await page.goto('/contact');

    const results = await a11y.checkFormAccessibility();

    // All form inputs should have labels
    expect(results.violations.filter((v: any) => v.id === 'label')).toHaveLength(0);

    // Form should be keyboard navigable
    const keyboardNav = await a11y.checkKeyboardNavigation();
    const formElements = keyboardNav.filter(el =>
      ['button', 'input', 'select', 'textarea'].includes(el.element),
    );

    formElements.forEach(el => {
      expect(el.canReceiveFocus).toBeTruthy();
    });
  });

  test('color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/');

    const results = await a11y.checkColorContrast();

    // No color contrast violations
    expect(results.violations).toHaveLength(0);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');

    const screenReaderSupport = await a11y.checkScreenReaderSupport();

    // All images should have alt text
    expect(screenReaderSupport.images.withoutAlt).toBe(0);

    // Log summary
    console.log(
      `Images: ${screenReaderSupport.images.withAlt}/${screenReaderSupport.images.total} have alt text`,
    );
  });

  test('page should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    const screenReaderSupport = await a11y.checkScreenReaderSupport();

    // Should have at least one h1
    const h1Count = screenReaderSupport.headings.hierarchy.filter(h => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Heading levels should not skip (e.g., h1 -> h3)
    const levels = screenReaderSupport.headings.hierarchy.map(h => h.level);
    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('interactive elements should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');

    const results = await a11y.checkARIA();

    // No ARIA violations
    expect(results.violations).toHaveLength(0);
  });

  test('page should work with keyboard only', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    const elements = await a11y.checkKeyboardNavigation();
    const interactiveElements = elements.filter(el => el.canReceiveFocus);

    // Should have interactive elements
    expect(interactiveElements.length).toBeGreaterThan(0);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    // Continue tabbing and ensure we can reach all interactive elements
    for (let i = 0; i < interactiveElements.length - 1; i++) {
      await page.keyboard.press('Tab');
    }
  });

  test('dynamic content should be accessible', async ({ page }) => {
    await page.goto('/');

    // Click a button that shows dynamic content
    const button = page.getByRole('button', { name: /show more/i });
    const isVisible = button;
    await expect(isVisible).toBeVisible();
    await button.click();

    // Wait for content to appear
    await expect(
      page.locator('[data-testid="dynamic-content"], .dynamic-content, [role="region"]'),
    ).toBeVisible({ timeout: 2000 });

    // Check accessibility of new content
    const results = await a11y.scan();
    expect(
      results.violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);

    // Assert that dynamic content is visible
    const dynamicContent = page.locator(
      '[data-testid="dynamic-content"], .dynamic-content, [role="region"]',
    );
    await expect(dynamicContent).toBeVisible();
  });

  test('should generate accessibility report', async ({ page }) => {
    await page.goto('/');

    const results = await a11y.scan();

    // Generate HTML report
    const htmlReport = AccessibilityReporter.generateHTMLReport(results);
    const fs = await import('fs/promises');
    await fs.writeFile('test-results/accessibility-report.html', htmlReport);

    // Generate Markdown report
    const mdReport = AccessibilityReporter.generateMarkdownReport(results);
    await fs.writeFile('test-results/accessibility-report.md', mdReport);

    console.log('Accessibility reports generated in test-results/');

    // Assert that reports were generated
    expect(htmlReport).toBeTruthy();
    expect(mdReport).toBeTruthy();
  });
});
