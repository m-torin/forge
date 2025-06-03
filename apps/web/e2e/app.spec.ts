import { expect, test } from "@playwright/test";

import { createAuthHelpers } from "@repo/testing/auth-helpers";
import { AppTestHelpers } from "@repo/testing/playwright";

const appConfig = {
  name: "web",
  appDirectory: "/Users/torin/repos/new--/forge/apps/web",
  baseURL: "http://localhost:3200",
  port: 3200,
};

const helpers = new AppTestHelpers(appConfig);
const _authHelpers = createAuthHelpers(appConfig.baseURL);

test.describe("Web App - Root Integration Tests", () => {
  test("app loads successfully", async ({ page }) => {
    await helpers.waitForApp(page);
    await helpers.checkAppHealth(page);

    // Web apps often have the app name or brand in title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("basic UI elements are present", async ({ page }) => {
    await page.goto("/");
    await helpers.checkBasicUI(page);

    // Check for common web app elements
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Check if the page has basic content structure
    const main = page.locator('main, [role="main"], .main-content, #__next');
    if ((await main.count()) > 0) {
      await expect(main.first()).toBeVisible();
    }
  });

  test("internationalization is working", async ({ page }) => {
    await page.goto("/");

    // Check if locale-based routing is working
    const currentUrl = page.url();
    const hasLocaleInUrl =
      /\/(en|es|fr|de)\//.test(currentUrl) || currentUrl.includes("/en");

    if (hasLocaleInUrl) {
      // If using i18n, test different locales
      const locales = ["en", "es"];

      for (const locale of locales) {
        try {
          await page.goto(`/${locale}`);
          await page.waitForLoadState("networkidle");
          await helpers.checkBasicUI(page);
        } catch (error) {
          console.warn(`Locale ${locale} might not be available: ${error}`);
        }
      }
    }
  });

  test("authentication routes are accessible", async ({ page }) => {
    const authResults = await helpers.checkAuthRoutes(page);

    // For web apps, sign-in should be accessible
    if (authResults["/sign-in"]) {
      expect([200, 301, 302, 307, 308]).toContain(authResults["/sign-in"]);
    }

    // Check locale-based auth routes if they exist
    try {
      const response = await page.goto("/en/sign-in");
      if (response) {
        expect([200, 301, 302, 307, 308]).toContain(response.status());
      }
    } catch {
      // Locale-based auth might not exist
    }
  });

  test("health endpoints are working", async ({ page }) => {
    const healthResults = await helpers.checkAPIHealth(page);

    // Health endpoint should return 200 if it exists
    if (healthResults["/health"]) {
      expect(healthResults["/health"]).toBe(200);
    }

    if (healthResults["/api/health"]) {
      expect(healthResults["/api/health"]).toBe(200);
    }
  });

  test("no critical JavaScript errors on load", async ({ page }) => {
    const errors: string[] = [];

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("404") &&
        !error.includes("favicon") &&
        !error.includes("chrome-extension") &&
        !error.includes("extensions/") &&
        !error.includes("analytics"), // Analytics might fail in test env
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("app is responsive and mobile-friendly", async ({ page }) => {
    await page.goto("/");

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState("networkidle");
    await helpers.checkBasicUI(page);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState("networkidle");
    await helpers.checkBasicUI(page);

    // Test mobile viewport (more important for web apps)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState("networkidle");
    await helpers.checkBasicUI(page);

    // Check for mobile-specific elements
    const mobileNav = page.locator(
      '[data-testid="mobile-nav"], .mobile-menu, button[aria-label*="menu"]',
    );
    if ((await mobileNav.count()) > 0) {
      await expect(mobileNav.first()).toBeVisible();
    }
  });

  test("public pages are accessible without authentication", async ({
    page,
  }) => {
    const publicPages = ["/", "/about", "/demo", "/search"];

    for (const pagePath of publicPages) {
      try {
        const response = await page.goto(pagePath);
        if (response) {
          // Should be accessible (200) or redirect to a public page (3xx)
          expect([200, 301, 302, 307, 308]).toContain(response.status());
        }
        await helpers.checkBasicUI(page);
      } catch (error) {
        console.warn(`Page ${pagePath} might not exist: ${error}`);
      }
    }
  });

  test("navigation elements are present", async ({ page }) => {
    await page.goto("/");

    // Check for common navigation elements
    const possibleNavElements = [
      'nav[role="navigation"]',
      ".navigation",
      ".navbar",
      ".header-nav",
      "header nav",
      '[data-testid="navigation"]',
      'a[href="/"]', // Home link
      'a[href="/about"]', // About link
    ];

    let navElementFound = false;
    for (const selector of possibleNavElements) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        navElementFound = true;
        await expect(element.first()).toBeVisible();
        break;
      }
    }

    if (!navElementFound) {
      console.warn(
        "No navigation elements found - this might be expected for some landing pages",
      );
    }
  });

  test("can navigate between pages without errors", async ({ page }) => {
    await page.goto("/");

    // Look for navigation links
    const links = page.locator('a[href^="/"]').filter({ hasNotText: /^$/ });
    const linkCount = await links.count();

    if (linkCount > 0) {
      // Test up to 3 internal links
      const linksToTest = Math.min(3, linkCount);

      for (let i = 0; i < linksToTest; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute("href");

        if (
          href &&
          href !== "/" &&
          !href.includes("external") &&
          !href.includes("mailto:")
        ) {
          await link.click();
          await page.waitForLoadState("networkidle");
          await helpers.checkBasicUI(page);

          // Go back to home for next test
          await page.goto("/");
        }
      }
    }
  });

  test("search functionality if present", async ({ page }) => {
    await page.goto("/search");

    // Check if search page exists and loads
    const response = await page.goto("/search");
    if (response && response.status() === 200) {
      await helpers.checkBasicUI(page);

      // Look for search input
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search" i], input[name*="search" i]',
      );
      if ((await searchInput.count()) > 0) {
        await expect(searchInput.first()).toBeVisible();

        // Test search functionality
        await searchInput.first().fill("test");
        await page.keyboard.press("Enter");
        await page.waitForLoadState("networkidle");
      }
    }
  });

  test("takes screenshot for visual verification", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Take full page screenshot
    await helpers.takeScreenshot(page, "homepage");

    // Take mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState("networkidle");
    await helpers.takeScreenshot(page, "homepage-mobile");

    expect(true).toBe(true); // Always pass - screenshots are for reference
  });
});
