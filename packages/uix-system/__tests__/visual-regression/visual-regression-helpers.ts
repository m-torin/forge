import type { Page } from '@playwright/test';

const STORYBOOK_BASE_URL = 'http://localhost:6006';

export async function navigateToStory(page: Page, component: string, story: string) {
  const normalizedComponent = component.toLowerCase();
  const normalizedStory = story.toLowerCase();
  const storyUrl = `${STORYBOOK_BASE_URL}/iframe.html?args=&id=backstage-ui-${normalizedComponent}--${normalizedStory}&viewMode=story`;

  await page.goto(storyUrl);

  await page.waitForSelector('[data-testid="story-root"], .mantine-Provider, .sb-show-main', {
    timeout: 10000,
  });

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

export async function setTheme(page: Page, theme: string) {
  await page.evaluate(currentTheme => {
    if (window.__STORYBOOK_ADDONS_CHANNEL__) {
      window.__STORYBOOK_ADDONS_CHANNEL__.emit('updateGlobals', {
        globals: { theme: currentTheme },
      });
    }
  }, theme);

  await page.waitForTimeout(300);
}

export async function applyInteractiveState(page: Page, state: string) {
  switch (state) {
    case 'hover': {
      const hoverableElement = await page
        .locator('button, a, [role="button"], input, select, textarea')
        .first();
      if ((await hoverableElement.count()) > 0) {
        await hoverableElement.hover();
      }
      break;
    }

    case 'focus': {
      const focusableElement = await page
        .locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        .first();
      if ((await focusableElement.count()) > 0) {
        await focusableElement.focus();
      }
      break;
    }

    case 'open': {
      const comboboxTrigger = await page.locator('[role="combobox"], input[type="text"]').first();
      if ((await comboboxTrigger.count()) > 0) {
        await comboboxTrigger.click();
        await page.waitForTimeout(300);
      }
      break;
    }

    case 'validation-error': {
      const inputs = await page
        .locator('input[type="text"], input[type="email"], input[type="password"]')
        .all();
      for (const input of inputs) {
        await input.fill('invalid');
        await input.blur();
      }
      await page.waitForTimeout(300);
      break;
    }

    case 'validation-success': {
      const emailInput = await page.locator('input[type="email"]').first();
      if ((await emailInput.count()) > 0) {
        await emailInput.fill('test@example.com');
        await emailInput.blur();
      }
      const textInputs = await page.locator('input[type="text"]').all();
      for (const input of textInputs) {
        await input.fill('Valid text input');
        await input.blur();
      }
      await page.waitForTimeout(300);
      break;
    }

    default:
      break;
  }
}
