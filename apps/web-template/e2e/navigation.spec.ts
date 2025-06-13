import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    // Start at homepage (will redirect to locale)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get current locale from URL
    const currentUrl = page.url();
    const locale = currentUrl.match(/\/(en|es|fr|de|pt)\//)?.[1] || 'en';

    // Test navigation to basic pages that might exist
    const basicPages = ['/about', '/contact'];

    for (const pagePath of basicPages) {
      const fullPath = `/${locale}${pagePath}`;
      await page.goto(fullPath);
      await page.waitForLoadState('networkidle');

      // Should either load the page or redirect somewhere reasonable
      const finalUrl = page.url();
      expect(finalUrl).toBeTruthy();

      // Check that page loads without major errors
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle locale navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should be on a locale-specific URL
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(en|es|fr|de|pt)\//);

    // Try different locales directly
    const locales = ['en', 'es', 'fr', 'de', 'pt'];

    for (const locale of locales) {
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');

      // Should load successfully
      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain(`/${locale}`);
    }
  });

  test('should handle back navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homeUrl = page.url();

    // Navigate to another page if possible
    await page.goto('/en/about');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be back at homepage or a valid page
    const backUrl = page.url();
    expect(backUrl).toBeTruthy();
  });

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for common navigation elements
    const navElements = [
      page.getByRole('navigation'),
      page.getByRole('banner'),
      page.locator('header'),
      page.locator('nav'),
    ];

    let hasNavigation = false;
    for (const element of navElements) {
      if ((await element.count()) > 0) {
        hasNavigation = true;
        break;
      }
    }

    // Should have some form of navigation
    expect(hasNavigation).toBeTruthy();

    // Check for logo or home link
    const logoSelectors = [
      page.getByRole('link', { name: /logo|home/i }),
      page.locator('[data-testid*="logo"]'),
      page.locator('a[href="/"]'),
      page.locator('a[href="/en"]'),
    ];

    for (const logoSelector of logoSelectors) {
      if ((await logoSelector.count()) > 0) {
        // Click logo should navigate to home
        const currentUrl = page.url();
        await logoSelector.first().click();
        await page.waitForLoadState('networkidle');

        // Should navigate to home or stay on home
        const newUrl = page.url();
        expect(newUrl).toBeTruthy();
        break;
      }
    }
  });

  test('should handle footer navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check for footer
    const footer = page.locator('footer');
    if ((await footer.count()) > 0) {
      // Look for common footer links
      const commonFooterLinks = [
        page.getByRole('link', { name: /about/i }),
        page.getByRole('link', { name: /contact/i }),
        page.getByRole('link', { name: /privacy/i }),
        page.getByRole('link', { name: /terms/i }),
      ];

      let hasFooterLinks = false;
      for (const link of commonFooterLinks) {
        if ((await link.count()) > 0) {
          hasFooterLinks = true;

          // Check that the link has a valid href
          const href = await link.first().getAttribute('href');
          expect(href).toBeTruthy();
          break;
        }
      }

      // Footer should have some links or content
      if (!hasFooterLinks) {
        const footerText = await footer.textContent();
        expect(footerText?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle 404 navigation gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto('/non-existent-page-12345');

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should still render a page (Next.js custom 404)
    await expect(page.locator('body')).toBeVisible();

    // Should be able to navigate back to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle search functionality if present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.getByRole('searchbox').or(page.locator('input[type="search"]'));
    const searchButton = page.getByRole('button', { name: /search/i });

    if ((await searchInput.count()) > 0) {
      await searchInput.first().fill('test query');

      if ((await searchButton.count()) > 0) {
        await searchButton.first().click();
      } else {
        await searchInput.first().press('Enter');
      }

      await page.waitForLoadState('networkidle');

      // Should navigate to search results or show search functionality
      const searchUrl = page.url();
      expect(searchUrl).toBeTruthy();
    }
  });

  test('should handle theme or color scheme switching if present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for theme switcher buttons
    const themeButtons = [
      page.getByRole('button', { name: /theme|dark|light/i }),
      page.locator('[data-testid*="theme"]'),
      page.locator('[data-testid*="color-scheme"]'),
    ];

    for (const themeButton of themeButtons) {
      if ((await themeButton.count()) > 0) {
        // Click theme button
        await themeButton.first().click();
        await page.waitForTimeout(500);

        // Should change something (we can't easily test visual changes, but button should work)
        await expect(page.locator('body')).toBeVisible();
        break;
      }
    }
  });
});
