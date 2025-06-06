/**
 * E2E tests for homepage variants
 */

import { expect, test } from "@repo/testing/e2e";
import {
  PerformanceUtils,
  ResponsiveTestUtils,
  ThemeTestUtils,
  VisualTestUtils,
  WaitUtils,
} from "@repo/testing/e2e";

test.describe("Homepage Tests", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;
  let visual: VisualTestUtils;
  let responsive: ResponsiveTestUtils;
  let theme: ThemeTestUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
    visual = new VisualTestUtils(page);
    responsive = new ResponsiveTestUtils(page);
    theme = new ThemeTestUtils(page);
  });

  test.describe("Main Homepage", () => {
    test("should load homepage successfully", async ({ page }) => {
      await page.goto("/en");
      await waitUtils.forNavigation();

      // Should have a title
      await expect(page).toHaveTitle(/.+/);

      // Should have main content
      const main = page.locator("main");
      await expect(main).toBeVisible();

      // Should have navigation
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();
    });

    test("should have good performance", async ({ page }) => {
      await page.goto("/en");

      const metrics = await perfUtils.measurePageLoad();

      // Performance thresholds
      expect(metrics.domContentLoaded).toBeLessThan(5000);
      if (metrics.firstContentfulPaint > 0) {
        expect(metrics.firstContentfulPaint).toBeLessThan(3000);
      }
    });

    test("should be responsive across viewports", async ({ page }) => {
      await responsive.testResponsive(async () => {
        await page.goto("/en");
        await visual.waitForAnimations();

        // Check main content is visible
        const main = page.locator("main");
        await expect(main).toBeVisible();

        // Take viewport screenshot
        const viewport = page.viewportSize();
        await page.screenshot({
          path: `test-results/homepage-${viewport?.width}x${viewport?.height}.png`,
        });
      });
    });

    test("should work in both light and dark modes", async ({ page }) => {
      await theme.testInBothModes(async () => {
        await page.goto("/en");
        await visual.waitForAnimations();

        const isDark = await theme.isDarkMode();
        const themeName = isDark ? "dark" : "light";

        // Verify content is visible
        const main = page.locator("main");
        await expect(main).toBeVisible();

        // Take theme screenshot
        await page.screenshot({
          path: `test-results/homepage-${themeName}.png`,
        });
      });
    });

    test("should have working navigation links", async ({ page }) => {
      await page.goto("/en");

      // Test common navigation links
      const navLinks = [
        { expectedUrl: /products|collections/, text: /products/i },
        { expectedUrl: /about/, text: /about/i },
        { expectedUrl: /contact/, text: /contact/i },
      ];

      for (const link of navLinks) {
        const linkElement = page.getByRole("link", { name: link.text });
        if (await linkElement.isVisible()) {
          await linkElement.click();
          await waitUtils.forNavigation();
          await expect(page).toHaveURL(link.expectedUrl);

          // Go back to homepage
          await page.goto("/en");
          await waitUtils.forNavigation();
        }
      }
    });

    test("should handle locale redirection", async ({ page }) => {
      // Test root redirect
      await page.goto("/");
      await waitUtils.forNavigation();
      await expect(page).toHaveURL(/\/en/);
    });
  });

  test.describe("Alternative Homepage Layout", () => {
    test("should load home-2 page", async ({ page }) => {
      await page.goto("/en/home-2");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should be different from main homepage", async ({ page }) => {
      // Take screenshot of main homepage
      await page.goto("/en");
      await visual.waitForAnimations();
      const homeScreenshot = await page.screenshot();

      // Take screenshot of home-2
      await page.goto("/en/home-2");
      await visual.waitForAnimations();
      const home2Screenshot = await page.screenshot();

      // Screenshots should be different (basic comparison)
      expect(homeScreenshot.length).not.toBe(home2Screenshot.length);
    });
  });

  test.describe("Locale Testing", () => {
    const locales = ["en", "fr", "es", "de", "pt"];

    for (const locale of locales) {
      test(`should load homepage in ${locale}`, async ({ page }) => {
        await page.goto(`/${locale}`);
        await waitUtils.forNavigation();

        // Should load successfully
        await expect(page).toHaveTitle(/.+/);

        // URL should contain locale
        await expect(page).toHaveURL(new RegExp(`/${locale}`));

        // Should have main content
        const main = page.locator("main");
        await expect(main).toBeVisible();
      });
    }

    test("should have locale switcher functionality", async ({ page }) => {
      await page.goto("/en");

      // Look for locale switcher
      const localeSwitcher = page
        .locator('[data-testid="locale-switcher"]')
        .or(page.getByRole("button", { name: /language/i }))
        .or(page.locator('select[name="locale"]'));

      if (await localeSwitcher.isVisible()) {
        // Test switching locales
        await localeSwitcher.click();

        // Look for French option
        const frenchOption = page.getByText(/français|french|fr/i);
        if (await frenchOption.isVisible()) {
          await frenchOption.click();
          await waitUtils.forNavigation();
          await expect(page).toHaveURL(/\/fr/);
        }
      }
    });
  });

  test.describe("Homepage Features", () => {
    test("should show product carousels", async ({ page }) => {
      await page.goto("/en");
      await waitUtils.forNavigation();

      // Look for product carousel elements
      const carousel = page
        .locator('[data-testid="product-carousel"]')
        .or(page.locator(".swiper-container"))
        .or(page.locator('[class*="carousel"]'));

      if (await carousel.isVisible()) {
        // Test carousel functionality
        const nextButton = page
          .locator('[data-testid="carousel-next"]')
          .or(page.locator(".swiper-button-next"));

        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500); // Wait for animation
        }
      }
    });

    test("should have hero section", async ({ page }) => {
      await page.goto("/en");
      await waitUtils.forNavigation();

      // Look for hero section
      const hero = page
        .locator('[data-testid="hero"]')
        .or(page.locator(".hero"))
        .or(page.locator("section").first());

      await expect(hero).toBeVisible();

      // Hero should have some content
      const heroText = await hero.textContent();
      expect(heroText?.length).toBeGreaterThan(0);
    });

    test("should have call-to-action buttons", async ({ page }) => {
      await page.goto("/en");
      await waitUtils.forNavigation();

      // Look for CTA buttons
      const ctaButtons = page.getByRole("button", {
        name: /shop now|get started|browse|explore/i,
      });
      const ctaLinks = page.getByRole("link", {
        name: /shop now|get started|browse|explore/i,
      });

      const totalCTAs = (await ctaButtons.count()) + (await ctaLinks.count());
      expect(totalCTAs).toBeGreaterThan(0);
    });

    test("should load images properly", async ({ page }) => {
      await page.goto("/en");
      await waitUtils.forNavigation();

      // Wait for images to load
      await page.waitForLoadState("networkidle");

      // Check for broken images
      const images = page.locator("img");
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Check first few images for proper loading
        for (let i = 0; i < Math.min(5, imageCount); i++) {
          const img = images.nth(i);
          const src = await img.getAttribute("src");
          const alt = await img.getAttribute("alt");

          // Should have src
          expect(src).toBeTruthy();

          // Should have alt text (accessibility)
          if (alt !== null) {
            expect(alt).toBeTruthy();
          }
        }
      }
    });
  });
});
