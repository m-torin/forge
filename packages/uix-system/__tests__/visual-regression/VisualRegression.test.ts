/**
 * Visual Regression Test Suite
 *
 * Tests all shared UI components for visual consistency across:
 * - Theme variations (light/dark)
 * - Viewport sizes (mobile, tablet, desktop)
 * - Interactive states (hover, focus, disabled)
 * - Browser compatibility (Chromium, Firefox, Safari)
 *
 * Uses Playwright for cross-browser screenshot comparison
 * with automatic baseline generation and diff reporting.
 */

import { expect, test } from '@playwright/test';
import { applyInteractiveState, navigateToStory, setTheme } from './visual-regression-helpers';

interface TestConfig {
  component: string;
  story: string;
  viewports: Array<{ name: string; width: number; height: number }>;
  themes: string[];
  interactiveStates?: string[];
}

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1200, height: 800 },
];

const THEMES = ['light', 'dark'];

const COMPONENTS_TO_TEST: TestConfig[] = [
  {
    component: 'LazyIcon',
    story: 'Default',
    viewports: VIEWPORTS,
    themes: THEMES,
    interactiveStates: ['default', 'hover'],
  },
  {
    component: 'LazyIcon',
    story: 'Sizes',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'LazyIcon',
    story: 'Colors',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'PageHeader',
    story: 'Default',
    viewports: VIEWPORTS,
    themes: THEMES,
    interactiveStates: ['default', 'hover'],
  },
  {
    component: 'PageHeader',
    story: 'WithBreadcrumbs',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'PageHeader',
    story: 'WithActions',
    viewports: VIEWPORTS,
    themes: THEMES,
    interactiveStates: ['default', 'hover', 'focus'],
  },
  {
    component: 'PageHeader',
    story: 'ComplexExample',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'LoadingSpinner',
    story: 'Default',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'LoadingSpinner',
    story: 'Sizes',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'LoadingSpinner',
    story: 'WithProgress',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'LoadingSpinner',
    story: 'OverlayMode',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'RelationshipCombobox',
    story: 'Default',
    viewports: VIEWPORTS,
    themes: THEMES,
    interactiveStates: ['default', 'focus', 'open'],
  },
  {
    component: 'RelationshipCombobox',
    story: 'MultipleSelection',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'RelationshipCombobox',
    story: 'ErrorState',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'RelationshipCombobox',
    story: 'DisabledState',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'AccessibleFormField',
    story: 'Default',
    viewports: VIEWPORTS,
    themes: THEMES,
    interactiveStates: ['default', 'focus'],
  },
  {
    component: 'AccessibleFormField',
    story: 'ValidationStates',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'AccessibleFormField',
    story: 'FieldRequirements',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'AccessibleFormField',
    story: 'Layouts',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
  {
    component: 'FormValidation',
    story: 'BasicZodValidation',
    viewports: VIEWPORTS,
    themes: THEMES,
    interactiveStates: ['default', 'validation-error', 'validation-success'],
  },
  {
    component: 'FormValidation',
    story: 'ComplexValidationScenario',
    viewports: VIEWPORTS,
    themes: THEMES,
  },
];

// Test each component configuration
COMPONENTS_TO_TEST.forEach(
  ({ component, story, viewports, themes, interactiveStates = ['default'] }) => {
    test.describe(`${component} - ${story}`, () => {
      viewports.forEach(({ name: viewportName, width, height }) => {
        themes.forEach(theme => {
          interactiveStates.forEach(state => {
            test(`${viewportName}-${theme}-${state}`, async ({ page, browserName }) => {
              // Set viewport
              await page.setViewportSize({ width, height });

              // Navigate to story
              await navigateToStory(page, component, story);

              // Set theme
              await setTheme(page, theme);

              // Apply interactive state
              if (state !== 'default') {
                await applyInteractiveState(page, state);
              }

              // Take screenshot and compare
              const screenshotName = `${component}-${story}-${viewportName}-${theme}-${state}-${browserName}`;

              await expect(page).toHaveScreenshot(`${screenshotName}.png`, {
                fullPage: true,
                animations: 'disabled',
                caret: 'hide',
                threshold: 0.2, // Allow 20% pixel difference for font rendering variations
                mode: 'default',
              });
            });
          });
        });
      });
    });
  },
);

// Comprehensive layout tests
test.describe('Layout Consistency Tests', () => {
  test('Full page layout - light theme', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'FormValidation', 'ComplexValidationScenario');
    await setTheme(page, 'light');

    await expect(page).toHaveScreenshot('full-layout-light.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Full page layout - dark theme', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'FormValidation', 'ComplexValidationScenario');
    await setTheme(page, 'dark');

    await expect(page).toHaveScreenshot('full-layout-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Mobile responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToStory(page, 'AccessibleFormField', 'ComplexForm');
    await setTheme(page, 'light');

    await expect(page).toHaveScreenshot('mobile-responsive-layout.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

// Animation and transition tests
test.describe('Animation Tests', () => {
  test('Loading spinner animations', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'LoadingSpinner', 'Variants');
    await setTheme(page, 'light');

    // Capture multiple frames to test animation consistency
    const frames = [];
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(200);
      frames.push(
        await page.screenshot({
          animations: 'allow', // Allow animations for this test
          fullPage: true,
        }),
      );
    }

    // At least one frame should be different (animation is working)
    const frame1 = frames[0];
    const frame2 = frames[1];
    expect(Buffer.compare(frame1, frame2)).not.toBe(0);
  });

  test('Reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'LoadingSpinner', 'ReducedMotion');
    await setTheme(page, 'light');

    await expect(page).toHaveScreenshot('reduced-motion-spinner.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

// Error boundary and edge case tests
test.describe('Edge Cases', () => {
  test('Component with no data', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'RelationshipCombobox', 'LoadingState');
    await setTheme(page, 'light');

    await expect(page).toHaveScreenshot('empty-state-combobox.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Long content overflow', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 300 });
    await navigateToStory(page, 'PageHeader', 'ComplexExample');
    await setTheme(page, 'light');

    await expect(page).toHaveScreenshot('content-overflow-narrow.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('High contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });

    await page.setViewportSize({ width: 800, height: 600 });
    await navigateToStory(page, 'AccessibleFormField', 'ValidationStates');

    await expect(page).toHaveScreenshot('high-contrast-forms.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

// Performance-related visual tests
test.describe('Performance Visual Tests', () => {
  test('Large dataset rendering', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'RelationshipCombobox', 'LargeDataset');
    await setTheme(page, 'light');

    // Open the dropdown to show virtual scrolling
    await page.locator('input').click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('large-dataset-virtualized.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Complex form with many fields', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await navigateToStory(page, 'FormValidation', 'ComplexValidationScenario');
    await setTheme(page, 'light');

    // Fill out the form to show various validation states
    await applyInteractiveState(page, 'validation-error');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('complex-form-validation.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
