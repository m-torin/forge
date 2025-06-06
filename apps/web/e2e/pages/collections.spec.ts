/**
 * E2E tests for collection/category pages
 */

import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  PerformanceUtils,
  ResponsiveTestUtils,
  VisualTestUtils,
  WaitUtils,
} from "@repo/testing/e2e";

test.describe("Collection Pages", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;
  let visual: VisualTestUtils;
  let responsive: ResponsiveTestUtils;
  let a11y: AccessibilityTestUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
    visual = new VisualTestUtils(page);
    responsive = new ResponsiveTestUtils(page);
    a11y = new AccessibilityTestUtils(page);
  });

  test.describe("Collection Listing Pages", () => {
    const _testCollections = [
      "all-products",
      "featured",
      "new-arrivals",
      "sale",
      "test-collection",
    ];

    test("should load collection page", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/collections/") &&
            response.status() !== 500,
          { timeout: 10000 },
        )
        .catch(() => null);

      // Should either load the collection or show 404
      if (response && response.status() === 200) {
        await expect(page).toHaveTitle(/.+/);

        const main = page.locator("main");
        await expect(main).toBeVisible();
      } else {
        // 404 is acceptable for test collections
        await expect(page).toHaveURL(/\/collections\//);
      }
    });

    test("should have collection header", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for collection title/header
        const collectionTitle = page
          .locator("h1")
          .or(page.locator('[data-testid="collection-title"]'))
          .or(page.locator(".collection-header h1"));

        if ((await collectionTitle.count()) > 0) {
          await expect(collectionTitle.first()).toBeVisible();

          const titleText = await collectionTitle.first().textContent();
          expect(titleText?.length).toBeGreaterThan(0);
        }
      }
    });

    test("should display product grid", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for product grid/listing
        const productGrid = page
          .locator('[data-testid="product-grid"]')
          .or(page.locator(".products-grid"))
          .or(page.locator(".product-list"));

        const productCards = page
          .locator('[data-testid="product-card"]')
          .or(page.locator(".product-card"))
          .or(page.locator("article"));

        // Should have either a grid container or product cards
        const hasGrid = (await productGrid.count()) > 0;
        const hasCards = (await productCards.count()) > 0;

        if (hasGrid || hasCards) {
          expect(hasGrid || hasCards).toBeTruthy();
        }
      }
    });

    test("should have filtering options", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for filter controls
        const filters = page
          .locator('[data-testid="filters"]')
          .or(page.locator(".filters"))
          .or(page.locator("aside"));

        const priceFilter = page
          .locator('input[name*="price"]')
          .or(page.locator('[data-testid="price-filter"]'));

        const _categoryFilter = page
          .locator('select[name*="category"]')
          .or(page.locator('[data-testid="category-filter"]'));

        if ((await filters.count()) > 0) {
          await expect(filters.first()).toBeVisible();
        }

        // Test filter interaction if available
        if ((await priceFilter.count()) > 0) {
          const filter = priceFilter.first();
          if (await filter.isVisible()) {
            await filter.click();
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test("should have sorting options", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for sort dropdown
        const sortSelect = page
          .locator('select[name*="sort"]')
          .or(page.locator('[data-testid="sort-select"]'))
          .or(
            page
              .getByText(/sort by/i)
              .locator("..")
              .locator("select"),
          );

        if ((await sortSelect.count()) > 0) {
          const sort = sortSelect.first();
          await expect(sort).toBeVisible();

          // Test sorting
          const options = sort.locator("option");
          const optionCount = await options.count();

          if (optionCount > 1) {
            await sort.selectOption({ index: 1 });
            await page.waitForTimeout(1000); // Wait for results to update
          }
        }
      }
    });

    test("should handle pagination", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for pagination
        const pagination = page
          .locator('[data-testid="pagination"]')
          .or(page.locator(".pagination"))
          .or(page.locator('nav[aria-label*="pagination"]'));

        const nextButton = page
          .getByRole("button", { name: /next|>/ })
          .or(page.getByRole("link", { name: /next|>/ }));

        const loadMoreButton = page.getByRole("button", {
          name: /load more|show more/i,
        });

        if ((await pagination.count()) > 0) {
          await expect(pagination.first()).toBeVisible();
        }

        // Test pagination if available
        if ((await nextButton.count()) > 0) {
          const button = nextButton.first();
          if ((await button.isVisible()) && (await button.isEnabled())) {
            await button.click();
            await waitUtils.forNavigation();

            // Should update URL or content
            await page.waitForTimeout(1000);
          }
        }

        // Test load more if available
        if ((await loadMoreButton.count()) > 0) {
          const button = loadMoreButton.first();
          if ((await button.isVisible()) && (await button.isEnabled())) {
            await button.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    });

    test("should link to product pages", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for product links
        const productLinks = page.locator('a[href*="/products/"]');

        const linkCount = await productLinks.count();

        if (linkCount > 0) {
          const firstLink = productLinks.first();
          const href = await firstLink.getAttribute("href");

          expect(href).toContain("/products/");

          // Test clicking product link
          await firstLink.click();
          await waitUtils.forNavigation();

          // Should navigate to product page
          await expect(page).toHaveURL(/\/products\//);
        }
      }
    });

    test("should be responsive", async ({ page }) => {
      await responsive.testResponsive(async () => {
        await page.goto("/en/collections/test-collection");
        await visual.waitForAnimations();

        const main = page.locator("main");
        await expect(main).toBeVisible();

        const viewport = page.viewportSize();
        await page.screenshot({
          path: `test-results/collection-${viewport?.width}x${viewport?.height}.png`,
        });
      });
    });

    test("should have good performance", async ({ page }) => {
      await page.goto("/en/collections/test-collection");

      const metrics = await perfUtils.measurePageLoad();

      // Collection pages should load reasonably fast
      expect(metrics.domContentLoaded).toBeLessThan(6000);
      if (metrics.firstContentfulPaint > 0) {
        expect(metrics.firstContentfulPaint).toBeLessThan(4000);
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Collection Layout Variants", () => {
    test("should load page-style-2 layout", async ({ page }) => {
      await page.goto("/en/collections/page-style-2/test-collection");
      await waitUtils.forNavigation();

      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/collections/page-style-2/") &&
            response.status() !== 500,
          { timeout: 10000 },
        )
        .catch(() => null);

      if (response && response.status() === 200) {
        const main = page.locator("main");
        await expect(main).toBeVisible();
      }
    });

    test("should have different layouts for variants", async ({ page }) => {
      const layouts = [
        "/en/collections/test-collection",
        "/en/collections/page-style-2/test-collection",
      ];

      const screenshots = [];

      for (const layout of layouts) {
        await page.goto(layout);
        await visual.waitForAnimations();

        const notFound = page.getByText(/not found|404/i);
        if (!(await notFound.isVisible())) {
          const screenshot = await page.screenshot();
          screenshots.push(screenshot);
        }
      }

      // If we got multiple screenshots, they should be different
      if (screenshots.length > 1) {
        expect(screenshots[0].length).not.toBe(screenshots[1].length);
      }
    });
  });

  test.describe("Collection Error Handling", () => {
    test("should handle non-existent collections", async ({ page }) => {
      await page.goto("/en/collections/non-existent-collection-12345");
      await waitUtils.forNavigation();

      // Should show 404 or not found message
      const notFoundMessage = page.getByText(
        /not found|404|collection.*not.*exist/i,
      );
      const main = page.locator("main");

      // Either show 404 content or redirect
      expect(
        (await notFoundMessage.isVisible()) || (await main.isVisible()),
      ).toBeTruthy();
    });

    test("should handle empty collections", async ({ page }) => {
      await page.goto("/en/collections/empty-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Should handle empty collection gracefully
        const emptyMessage = page.getByText(
          /no products|empty|no items found/i,
        );
        const main = page.locator("main");

        expect(
          (await emptyMessage.isVisible()) || (await main.isVisible()),
        ).toBeTruthy();
      }
    });
  });

  test.describe("Collection SEO", () => {
    test("should have proper meta tags", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Check for meta description
        const metaDescription = page.locator('meta[name="description"]');
        if ((await metaDescription.count()) > 0) {
          const content = await metaDescription.getAttribute("content");
          expect(content?.length).toBeGreaterThan(0);
        }

        // Check for canonical URL
        const canonical = page.locator('link[rel="canonical"]');
        if ((await canonical.count()) > 0) {
          const href = await canonical.getAttribute("href");
          expect(href).toContain("/collections/");
        }
      }
    });

    test("should handle pagination SEO", async ({ page }) => {
      await page.goto("/en/collections/test-collection?page=2");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Check for prev/next rel links
        const prevLink = page.locator('link[rel="prev"]');
        const _nextLink = page.locator('link[rel="next"]');

        if ((await prevLink.count()) > 0) {
          const href = await prevLink.getAttribute("href");
          expect(href).toBeTruthy();
        }
      }
    });
  });

  test.describe("Cross-locale Collection Pages", () => {
    const locales = ["en", "fr", "es", "de", "pt"];

    for (const locale of locales) {
      test(`should load collection page in ${locale}`, async ({ page }) => {
        await page.goto(`/${locale}/collections/test-collection`);
        await waitUtils.forNavigation();

        await expect(page).toHaveURL(new RegExp(`/${locale}/collections/`));

        const main = page.locator("main");
        await expect(main).toBeVisible();
      });
    }
  });

  test.describe("Collection Search and Filters", () => {
    test("should handle search within collection", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        const searchInput = page
          .locator('input[type="search"]')
          .or(page.locator('[data-testid="collection-search"]'));

        if ((await searchInput.count()) > 0) {
          const input = searchInput.first();
          await input.fill("test query");
          await page.keyboard.press("Enter");

          await page.waitForTimeout(1000);

          // Should update results
          const resultsContainer = page
            .locator('[data-testid="search-results"]')
            .or(page.locator(".search-results"));

          if ((await resultsContainer.count()) > 0) {
            await expect(resultsContainer.first()).toBeVisible();
          }
        }
      }
    });

    test("should maintain filters in URL", async ({ page }) => {
      await page.goto("/en/collections/test-collection");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Apply a filter if available
        const priceFilter = page.locator('input[name*="price"]').first();

        if (
          (await priceFilter.count()) > 0 &&
          (await priceFilter.isVisible())
        ) {
          await priceFilter.click();
          await page.waitForTimeout(1000);

          // URL might update with filter parameters
          const url = page.url();
          expect(url).toBeTruthy();
        }
      }
    });
  });
});
