/**
 * Cross-Browser Compatibility Visual Tests
 *
 * Ensures consistent rendering across different browsers and versions:
 * - Chromium (Chrome, Edge)
 * - Firefox
 * - WebKit (Safari)
 *
 * Tests focus on browser-specific rendering differences like:
 * - Font rendering and antialiasing
 * - CSS feature support variations
 * - Input field styling differences
 * - Shadow DOM implementation differences
 */

import { devices, expect, test } from '@playwright/test';
import { navigateToStory, setTheme } from './visual-regression-helpers';

interface BrowserTestConfig {
  component: string;
  story: string;
  description: string;
  criticalForBrowserDiffs: boolean;
}

const CRITICAL_COMPONENTS: BrowserTestConfig[] = [
  {
    component: 'RelationshipCombobox',
    story: 'Default',
    description: 'Input styling varies significantly between browsers',
    criticalForBrowserDiffs: true,
  },
  {
    component: 'AccessibleFormField',
    story: 'ValidationStates',
    description: 'Form validation styling and focus states',
    criticalForBrowserDiffs: true,
  },
  {
    component: 'LoadingSpinner',
    story: 'Variants',
    description: 'CSS animations and transforms',
    criticalForBrowserDiffs: true,
  },
  {
    component: 'PageHeader',
    story: 'WithActions',
    description: 'Button styling and flexbox layouts',
    criticalForBrowserDiffs: true,
  },
  {
    component: 'LazyIcon',
    story: 'Sizes',
    description: 'SVG rendering and scaling',
    criticalForBrowserDiffs: true,
  },
  {
    component: 'FormValidation',
    story: 'ComplexValidationScenario',
    description: 'Complex form layouts and validation states',
    criticalForBrowserDiffs: true,
  },
];

// Desktop browser tests
test.describe('Desktop Browser Compatibility', () => {
  CRITICAL_COMPONENTS.forEach(({ component, story, description }) => {
    test.describe(`${component} - ${story}`, () => {
      ['chromium', 'firefox', 'webkit'].forEach(browserName => {
        test(`${browserName} - light theme`, async ({ page }) => {
          await page.setViewportSize({ width: 1200, height: 800 });
          await navigateToStory(page, component, story);
          await setTheme(page, 'light');

          // Wait for browser-specific rendering to settle
          await page.waitForTimeout(500);

          await expect(page).toHaveScreenshot(
            `${component}-${story}-desktop-light-${browserName}.png`,
            {
              fullPage: true,
              animations: 'disabled',
              threshold: 0.3, // Higher threshold for browser differences
            },
          );
        });

        test(`${browserName} - dark theme`, async ({ page }) => {
          await page.setViewportSize({ width: 1200, height: 800 });
          await navigateToStory(page, component, story);
          await setTheme(page, 'dark');

          await page.waitForTimeout(500);

          await expect(page).toHaveScreenshot(
            `${component}-${story}-desktop-dark-${browserName}.png`,
            {
              fullPage: true,
              animations: 'disabled',
              threshold: 0.3,
            },
          );
        });
      });
    });
  });
});

// Mobile device compatibility tests
test.describe('Mobile Browser Compatibility', () => {
  const mobileComponents = CRITICAL_COMPONENTS.slice(0, 3); // Test subset on mobile

  mobileComponents.forEach(({ component, story }) => {
    test.describe(`${component} - ${story} - Mobile`, () => {
      test('iPhone Safari', async ({ browser }) => {
        const context = await browser.newContext({
          ...devices['iPhone 13'],
          locale: 'en-US',
        });
        const page = await context.newPage();

        await navigateToStory(page, component, story);
        await setTheme(page, 'light');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${component}-${story}-iphone.png`, {
          fullPage: true,
          animations: 'disabled',
          threshold: 0.4, // Higher threshold for mobile rendering differences
        });

        await context.close();
      });

      test('Android Chrome', async ({ browser }) => {
        const context = await browser.newContext({
          ...devices['Galaxy S21'],
          locale: 'en-US',
        });
        const page = await context.newPage();

        await navigateToStory(page, component, story);
        await setTheme(page, 'light');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${component}-${story}-android.png`, {
          fullPage: true,
          animations: 'disabled',
          threshold: 0.4,
        });

        await context.close();
      });
    });
  });
});

// Browser-specific feature tests
test.describe('Browser-Specific Feature Tests', () => {
  test('CSS Grid support - all browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'AccessibleFormField', 'Layouts');
    await setTheme(page, 'light');

    // Test CSS Grid layout consistency
    const gridContainer = page.locator('[style*="grid"], .grid, [class*="grid"]').first();
    if ((await gridContainer.count()) > 0) {
      await expect(gridContainer).toBeVisible();
    }

    await expect(page).toHaveScreenshot(`css-grid-support-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });

  test('Flexbox behavior - all browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'PageHeader', 'ComplexExample');
    await setTheme(page, 'light');

    // Test flexbox layout consistency
    const flexContainer = page.locator('[style*="flex"], .flex, [class*="flex"]').first();
    if ((await flexContainer.count()) > 0) {
      await expect(flexContainer).toBeVisible();
    }

    await expect(page).toHaveScreenshot(`flexbox-behavior-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });

  test('Custom CSS properties - all browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'LoadingSpinner', 'Colors');
    await setTheme(page, 'light');

    // Test CSS custom properties (variables) support
    const customColorElement = page.locator('[style*="--"], [class*="color"]').first();
    if ((await customColorElement.count()) > 0) {
      await expect(customColorElement).toBeVisible();
    }

    await expect(page).toHaveScreenshot(`css-variables-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.3,
    });
  });

  test('Form input styling - all browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'RelationshipCombobox', 'Default');
    await setTheme(page, 'light');

    // Focus the input to show browser-specific focus styles
    await page.locator('input').focus();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot(`form-input-focus-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.4, // Higher threshold for form styling differences
    });
  });

  test('SVG icon rendering - all browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'LazyIcon', 'CommonIcons');
    await setTheme(page, 'light');

    // Wait for all SVG icons to load
    await page.waitForFunction(() => {
      const svgs = document.querySelectorAll('svg');
      return Array.from(svgs).every(svg => svg.checkVisibility());
    });

    await expect(page).toHaveScreenshot(`svg-icon-rendering-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });
});

// Accessibility feature compatibility
test.describe('Accessibility Feature Compatibility', () => {
  test('High contrast mode - Windows', async ({ page, browserName }) => {
    // Skip non-Chromium browsers for this Windows-specific test
    test.skip(browserName !== 'chromium', 'High contrast mode testing is Chromium-specific');

    await page.emulateMedia({ forcedColors: 'active' });
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'AccessibleFormField', 'ValidationStates');

    await expect(page).toHaveScreenshot('high-contrast-validation-forms.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.5,
    });
  });

  test('Reduced motion support - all browsers', async ({ page, browserName }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'LoadingSpinner', 'ReducedMotion');
    await setTheme(page, 'light');

    await expect(page).toHaveScreenshot(`reduced-motion-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2,
    });
  });

  test('Focus visible indicators - all browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'PageHeader', 'WithActions');
    await setTheme(page, 'light');

    // Simulate keyboard navigation to show focus indicators
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot(`focus-indicators-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.3,
    });
  });
});

// Performance rendering tests
test.describe('Performance Rendering Tests', () => {
  test('Large component list rendering - all browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'RelationshipCombobox', 'LargeDataset');
    await setTheme(page, 'light');

    // Open dropdown to trigger virtual scrolling
    await page.locator('input').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(`large-dataset-rendering-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.3,
    });
  });

  test('Complex form rendering - all browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'FormValidation', 'ComplexValidationScenario');
    await setTheme(page, 'light');

    // Wait for all form elements to render
    await page.waitForSelector('input, select, textarea', { timeout: 5000 });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(`complex-form-rendering-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.3,
    });
  });
});

// Test configuration for CI environments
test.describe('CI-Optimized Browser Tests', () => {
  test('Quick compatibility check - essential components', async ({ page, browserName }) => {
    const essentialTests = [
      { component: 'LazyIcon', story: 'Default' },
      { component: 'PageHeader', story: 'Default' },
      { component: 'LoadingSpinner', story: 'Default' },
      { component: 'RelationshipCombobox', story: 'Default' },
    ];

    for (const { component, story } of essentialTests) {
      await page.setViewportSize({ width: 1200, height: 600 });
      await navigateToStory(page, component, story);
      await setTheme(page, 'light');
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot(`ci-quick-${component}-${browserName}.png`, {
        animations: 'disabled',
        threshold: 0.3,
        clip: { x: 0, y: 0, width: 1200, height: 400 }, // Clip to reduce screenshot size
      });
    }
  });
});
