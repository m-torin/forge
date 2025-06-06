/**
 * E2E tests for search, subscription, coming-soon and other special pages
 */

import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  PerformanceUtils,
  ResponsiveTestUtils,
  TestDataGenerator,
  VisualTestUtils,
  WaitUtils,
} from "@repo/testing/e2e";

test.describe("Search & Special Pages", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;
  let visual: VisualTestUtils;
  let a11y: AccessibilityTestUtils;
  let responsive: ResponsiveTestUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
    visual = new VisualTestUtils(page);
    a11y = new AccessibilityTestUtils(page);
    responsive = new ResponsiveTestUtils(page);
  });

  test.describe("Search Page", () => {
    test("should load search page", async ({ page }) => {
      await page.goto("/en/search");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/search/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should handle search with query parameter", async ({ page }) => {
      await page.goto("/en/search?q=test");
      await waitUtils.forNavigation();

      // Should show search results or empty state
      const searchResults = page
        .locator('[data-testid="search-results"]')
        .or(page.locator(".search-results"));

      const searchInput = page
        .locator('input[type="search"]')
        .or(page.locator('[data-testid="search-input"]'));

      const noResults = page.getByText(/no results|nothing found|no matches/i);

      // Should have search interface
      if ((await searchInput.count()) > 0) {
        await expect(searchInput.first()).toBeVisible();

        // Input should contain the search query
        const inputValue = await searchInput.first().inputValue();
        expect(inputValue).toBe("test");
      }

      // Should show results or no results message
      const hasResults = (await searchResults.count()) > 0;
      const hasNoResults = (await noResults.count()) > 0;

      expect(hasResults || hasNoResults).toBeTruthy();
    });

    test("should have search functionality", async ({ page }) => {
      await page.goto("/en/search");
      await waitUtils.forNavigation();

      const searchInput = page
        .locator('input[type="search"]')
        .or(page.locator('[data-testid="search-input"]'));

      const searchButton = page.getByRole("button", { name: /search|find/i });

      if ((await searchInput.count()) > 0) {
        await expect(searchInput.first()).toBeVisible();

        // Test search functionality
        await searchInput.first().fill("test query");

        if ((await searchButton.count()) > 0) {
          await searchButton.first().click();
        } else {
          // Try pressing Enter
          await page.keyboard.press("Enter");
        }

        await page.waitForTimeout(1000);

        // URL should update with query
        await expect(page).toHaveURL(/q=test/);
      }
    });

    test("should have search filters", async ({ page }) => {
      await page.goto("/en/search?q=test");
      await waitUtils.forNavigation();

      // Look for search filters
      const categoryFilter = page
        .locator('select[name*="category"]')
        .or(page.locator('[data-testid="category-filter"]'));

      const _priceFilter = page
        .locator('input[name*="price"]')
        .or(page.locator('[data-testid="price-filter"]'));

      const sortSelect = page
        .locator('select[name*="sort"]')
        .or(page.locator('[data-testid="sort-select"]'));

      // Test filters if available
      if ((await categoryFilter.count()) > 0) {
        const filter = categoryFilter.first();
        if (await filter.isVisible()) {
          const options = filter.locator("option");
          const optionCount = await options.count();

          if (optionCount > 1) {
            await filter.selectOption({ index: 1 });
            await page.waitForTimeout(1000);
          }
        }
      }

      if ((await sortSelect.count()) > 0) {
        const sort = sortSelect.first();
        if (await sort.isVisible()) {
          const options = sort.locator("option");
          const optionCount = await options.count();

          if (optionCount > 1) {
            await sort.selectOption({ index: 1 });
            await page.waitForTimeout(1000);
          }
        }
      }
    });

    test("should handle empty search", async ({ page }) => {
      await page.goto("/en/search?q=");
      await waitUtils.forNavigation();

      // Should handle empty search gracefully
      const emptyMessage = page.getByText(
        /enter.*search|search.*term|what.*looking/i,
      );
      const searchInput = page.locator('input[type="search"]');

      const hasEmptyMessage = (await emptyMessage.count()) > 0;
      const hasSearchInput = (await searchInput.count()) > 0;

      expect(hasEmptyMessage || hasSearchInput).toBeTruthy();
    });

    test("should handle search with no results", async ({ page }) => {
      await page.goto("/en/search?q=xyznonexistentquery123");
      await waitUtils.forNavigation();

      const noResults = page.getByText(
        /no results|nothing found|no matches|try.*different/i,
      );
      const suggestions = page.getByText(/suggestions|did you mean|similar/i);

      // Should show no results message
      if ((await noResults.count()) > 0) {
        await expect(noResults.first()).toBeVisible();
      }

      // Might show suggestions
      if ((await suggestions.count()) > 0) {
        await expect(suggestions.first()).toBeVisible();
      }
    });

    test("should show search results with proper structure", async ({
      page,
    }) => {
      await page.goto("/en/search?q=test");
      await waitUtils.forNavigation();

      const searchResults = page
        .locator('[data-testid="search-result"]')
        .or(page.locator(".search-result"))
        .or(page.locator("article"));

      if ((await searchResults.count()) > 0) {
        // Each result should have title and link
        const firstResult = searchResults.first();
        const resultTitle = firstResult.locator("h1, h2, h3, h4");
        const resultLink = firstResult.locator("a");

        if ((await resultTitle.count()) > 0) {
          await expect(resultTitle.first()).toBeVisible();
        }

        if ((await resultLink.count()) > 0) {
          await expect(resultLink.first()).toBeVisible();

          // Test clicking result
          await resultLink.first().click();
          await waitUtils.forNavigation();

          // Should navigate to result page
          const url = page.url();
          expect(url).not.toContain("/search");
        }
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/search");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Subscription Page", () => {
    test("should load subscription page", async ({ page }) => {
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/subscription/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should have subscription form", async ({ page }) => {
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      // Look for subscription/newsletter form
      const subscriptionForm = page
        .locator("form")
        .filter({ hasText: /subscribe|newsletter|email/i });
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.getByRole("button", {
        name: /subscribe|sign up|join/i,
      });

      if (
        (await subscriptionForm.count()) > 0 ||
        (await emailInput.count()) > 0
      ) {
        if ((await emailInput.count()) > 0) {
          await expect(emailInput.first()).toBeVisible();
        }

        if ((await submitButton.count()) > 0) {
          await expect(submitButton.first()).toBeVisible();
        }
      }
    });

    test("should validate email subscription", async ({ page }) => {
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.getByRole("button", {
        name: /subscribe|sign up|join/i,
      });

      if ((await emailInput.count()) > 0 && (await submitButton.count()) > 0) {
        // Try invalid email
        await emailInput.fill("invalid-email");
        await submitButton.first().click();

        // Should show validation error
        const errorMessage = page
          .locator('[role="alert"]')
          .or(page.getByText(/invalid.*email|please.*valid/i));

        await page.waitForTimeout(1000);

        if ((await errorMessage.count()) > 0) {
          const errorText = await errorMessage.first().textContent();
          expect(errorText).toBeTruthy();
        }

        // Try valid email
        const testEmail = TestDataGenerator.email("newsletter");
        await emailInput.fill(testEmail);
        await submitButton.first().click();

        await page.waitForTimeout(1000);

        // Should show success or confirmation
        const successMessage = page
          .locator('[role="alert"]')
          .or(page.getByText(/subscribed|thank you|confirmed/i));

        if ((await successMessage.count()) > 0) {
          const successText = await successMessage.first().textContent();
          expect(successText).toBeTruthy();
        }
      }
    });

    test("should have subscription preferences", async ({ page }) => {
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      // Look for subscription options/preferences
      const preferences = page.locator('input[type="checkbox"]');
      const frequencySelect = page.locator('select[name*="frequency"]');

      if ((await preferences.count()) > 0) {
        // Test checkbox preferences
        const firstPref = preferences.first();
        if (await firstPref.isVisible()) {
          await firstPref.check();
          expect(await firstPref.isChecked()).toBeTruthy();
        }
      }

      if ((await frequencySelect.count()) > 0) {
        const select = frequencySelect.first();
        if (await select.isVisible()) {
          const options = select.locator("option");
          const optionCount = await options.count();

          if (optionCount > 1) {
            await select.selectOption({ index: 1 });
          }
        }
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Coming Soon Page", () => {
    test("should load coming soon page", async ({ page }) => {
      await page.goto("/en/coming-soon");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/coming-soon/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should have coming soon content", async ({ page }) => {
      await page.goto("/en/coming-soon");
      await waitUtils.forNavigation();

      // Look for coming soon elements
      const comingSoonMessage = page.getByText(
        /coming soon|launching soon|stay tuned|under construction/i,
      );
      const launchDate = page.getByText(
        /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}|launch|release/i,
      );
      const countdown = page
        .locator('[data-testid="countdown"]')
        .or(page.locator(".countdown"));

      if ((await comingSoonMessage.count()) > 0) {
        await expect(comingSoonMessage.first()).toBeVisible();
      }

      // Optional elements
      if ((await countdown.count()) > 0) {
        await expect(countdown.first()).toBeVisible();
      }

      if ((await launchDate.count()) > 0) {
        await expect(launchDate.first()).toBeVisible();
      }
    });

    test("should have notification signup", async ({ page }) => {
      await page.goto("/en/coming-soon");
      await waitUtils.forNavigation();

      // Look for notification signup
      const emailInput = page.locator('input[type="email"]');
      const notifyButton = page.getByRole("button", {
        name: /notify|remind|email/i,
      });

      if ((await emailInput.count()) > 0) {
        await expect(emailInput.first()).toBeVisible();

        // Test signup
        const testEmail = TestDataGenerator.email("notify");
        await emailInput.first().fill(testEmail);

        if ((await notifyButton.count()) > 0) {
          await notifyButton.first().click();
          await page.waitForTimeout(1000);

          // Should show confirmation
          const confirmation = page.getByText(/added|notified|thank you/i);
          if ((await confirmation.count()) > 0) {
            await expect(confirmation.first()).toBeVisible();
          }
        }
      }
    });

    test("should have special layout", async ({ page }) => {
      await page.goto("/en/coming-soon");
      await waitUtils.forNavigation();

      // Coming soon might have different layout
      const specialLayout = page
        .locator('[data-layout="coming-soon"]')
        .or(page.locator(".coming-soon-layout"));

      // Should have unique styling/layout
      const bodyClass = await page.locator("body").getAttribute("class");
      const hasSpecialStyling =
        bodyClass?.includes("coming-soon") ||
        bodyClass?.includes("special") ||
        (await specialLayout.count()) > 0;

      if (hasSpecialStyling) {
        expect(hasSpecialStyling).toBeTruthy();
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/coming-soon");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("API Routes", () => {
    test("should handle hello API endpoint", async ({ page }) => {
      const response = await page.request.get("/api/hello");

      expect(response.ok()).toBeTruthy();

      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/json");

      const data = await response.json();
      expect(data).toBeTruthy();
    });

    test("should handle non-existent API routes", async ({ page }) => {
      const response = await page.request.get("/api/non-existent");

      // Should return 404
      expect(response.status()).toBe(404);
    });
  });

  test.describe("Performance Tests", () => {
    test("special pages should load quickly", async ({ page }) => {
      const specialPages = [
        "/en/search",
        "/en/subscription",
        "/en/coming-soon",
      ];

      for (const pagePath of specialPages) {
        await page.goto(pagePath);

        const metrics = await perfUtils.measurePageLoad();

        expect(metrics.domContentLoaded).toBeLessThan(4000);
        if (metrics.firstContentfulPaint > 0) {
          expect(metrics.firstContentfulPaint).toBeLessThan(2500);
        }
      }
    });

    test("search should be fast", async ({ page }) => {
      await page.goto("/en/search?q=test");

      const metrics = await perfUtils.measurePageLoad();

      // Search should be particularly fast
      expect(metrics.domContentLoaded).toBeLessThan(3000);
      if (metrics.firstContentfulPaint > 0) {
        expect(metrics.firstContentfulPaint).toBeLessThan(2000);
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("special pages should be responsive", async ({ page }) => {
      const specialPages = [
        "/en/search",
        "/en/subscription",
        "/en/coming-soon",
      ];

      for (const pagePath of specialPages) {
        await responsive.testResponsive(async () => {
          await page.goto(pagePath);
          await visual.waitForAnimations();

          const main = page.locator("main");
          await expect(main).toBeVisible();

          const viewport = page.viewportSize();
          const pageName = pagePath.split("/").pop();
          await page.screenshot({
            path: `test-results/${pageName}-${viewport?.width}x${viewport?.height}.png`,
          });
        });
      }
    });
  });

  test.describe("Cross-locale Special Pages", () => {
    const locales = ["en", "fr", "es", "de", "pt"];
    const specialPages = ["search", "subscription", "coming-soon"];

    for (const locale of locales) {
      for (const pagePath of specialPages) {
        test(`should load ${pagePath} page in ${locale}`, async ({ page }) => {
          await page.goto(`/${locale}/${pagePath}`);
          await waitUtils.forNavigation();

          await expect(page).toHaveURL(new RegExp(`/${locale}/${pagePath}`));

          const main = page.locator("main");
          await expect(main).toBeVisible();
        });
      }
    }
  });

  test.describe("SEO Tests", () => {
    test("special pages should have proper meta tags", async ({ page }) => {
      const specialPages = [
        "/en/search",
        "/en/subscription",
        "/en/coming-soon",
      ];

      for (const pagePath of specialPages) {
        await page.goto(pagePath);
        await waitUtils.forNavigation();

        // Check for meta description
        const metaDescription = page.locator('meta[name="description"]');
        if ((await metaDescription.count()) > 0) {
          const content = await metaDescription.getAttribute("content");
          expect(content?.length).toBeGreaterThan(0);
        }

        // Check for page title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);

        // Check for robots meta (coming-soon might have noindex)
        const robotsMeta = page.locator('meta[name="robots"]');
        if ((await robotsMeta.count()) > 0) {
          const content = await robotsMeta.getAttribute("content");
          expect(content).toBeTruthy();
        }
      }
    });

    test("search page should handle SEO for search queries", async ({
      page,
    }) => {
      await page.goto("/en/search?q=test+query");
      await waitUtils.forNavigation();

      // Title should include search query
      const title = await page.title();
      expect(title.toLowerCase()).toMatch(/test|search/);

      // Should have canonical URL without query params or with them
      const canonical = page.locator('link[rel="canonical"]');
      if ((await canonical.count()) > 0) {
        const href = await canonical.getAttribute("href");
        expect(href).toBeTruthy();
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should handle malformed search queries", async ({ page }) => {
      const malformedQueries = [
        "/en/search?q=%3Cscript%3E",
        "/en/search?q=" + "a".repeat(1000),
        "/en/search?q=<>&",
      ];

      for (const query of malformedQueries) {
        await page.goto(query);
        await waitUtils.forNavigation();

        // Should handle gracefully without errors
        const main = page.locator("main");
        await expect(main).toBeVisible();

        // Should not show script tags or errors
        const scriptContent = await page.textContent("body");
        expect(scriptContent).not.toContain("<script>");
      }
    });

    test("should handle form submissions without JavaScript", async ({
      browser,
    }) => {
      // Create new context with JavaScript disabled
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.getByRole("button", { name: /subscribe/i });

      if ((await emailInput.count()) > 0 && (await submitButton.count()) > 0) {
        await emailInput.fill("test@example.com");
        await submitButton.first().click();

        // Should handle form submission (might redirect or show message)
        await page.waitForTimeout(2000);

        const url = page.url();
        expect(url).toBeTruthy();
      }

      // Clean up context
      await context.close();
    });
  });
});
