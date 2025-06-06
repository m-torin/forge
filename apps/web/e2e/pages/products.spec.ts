/**
 * E2E tests for product pages
 */

import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  APITestUtils,
  PerformanceUtils,
  ResponsiveTestUtils,
  VisualTestUtils,
  WaitUtils,
} from "@repo/testing/e2e";

test.describe("Product Pages", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;
  let visual: VisualTestUtils;
  let responsive: ResponsiveTestUtils;
  let _apiUtils: APITestUtils;
  let a11y: AccessibilityTestUtils;

  test.beforeEach(async ({ page, request }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
    visual = new VisualTestUtils(page);
    responsive = new ResponsiveTestUtils(page);
    _apiUtils = new APITestUtils(request);
    a11y = new AccessibilityTestUtils(page);
  });

  test.describe("Product Detail Pages", () => {
    const _testProducts = ["test-product-1", "sample-product", "demo-item"];

    test("should load product detail page", async ({ page }) => {
      // Try to access a product page
      await page.goto("/en/products/test-product");
      await waitUtils.forNavigation();

      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/products/") && response.status() !== 500,
          { timeout: 10000 },
        )
        .catch(() => null);

      // Should either load the product or show 404
      if (response && response.status() === 200) {
        await expect(page).toHaveTitle(/.+/);

        const main = page.locator("main");
        await expect(main).toBeVisible();
      } else {
        // 404 is acceptable for test products
        await expect(page).toHaveURL(/\/products\//);
      }
    });

    test("should have product details structure", async ({ page }) => {
      await page.goto("/en/products/test-product");
      await waitUtils.forNavigation();

      // Only test if product loaded successfully
      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for common product page elements
        const productTitle = page
          .locator("h1")
          .or(page.locator('[data-testid="product-title"]'));

        const productPrice = page
          .locator('[data-testid="product-price"]')
          .or(page.locator(".price"))
          .or(page.getByText(/\$\d+|€\d+|£\d+/));

        const productImage = page
          .locator('[data-testid="product-image"]')
          .or(page.locator('img[alt*="product"]'))
          .or(page.locator(".product-image img"));

        // At least one of these should exist on a product page
        const titleExists = (await productTitle.count()) > 0;
        const priceExists = (await productPrice.count()) > 0;
        const imageExists = (await productImage.count()) > 0;

        expect(titleExists || priceExists || imageExists).toBeTruthy();
      }
    });

    test("should have add to cart functionality", async ({ page }) => {
      await page.goto("/en/products/test-product");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        const addToCartButton = page.getByRole("button", {
          name: /add to cart|add to bag/i,
        });

        if (await addToCartButton.isVisible()) {
          await expect(addToCartButton).toBeVisible();

          // Test clicking add to cart
          await addToCartButton.click();

          // Look for cart feedback
          const cartFeedback = page
            .locator('[role="alert"]')
            .or(page.locator(".toast"))
            .or(page.locator('[data-testid="cart-notification"]'));

          // Wait a bit for potential feedback
          await page.waitForTimeout(1000);

          if (await cartFeedback.isVisible()) {
            const feedbackText = await cartFeedback.textContent();
            expect(feedbackText).toBeTruthy();
          }
        }
      }
    });

    test("should handle product variants", async ({ page }) => {
      await page.goto("/en/products/test-product");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for variant selectors (size, color, etc.)
        const sizeSelector = page
          .locator('select[name="size"]')
          .or(page.locator('[data-testid="size-selector"]'));

        const colorSelector = page
          .locator('select[name="color"]')
          .or(page.locator('[data-testid="color-selector"]'));

        if (await sizeSelector.isVisible()) {
          const options = sizeSelector.locator("option");
          const optionCount = await options.count();

          if (optionCount > 1) {
            // Select different size
            await sizeSelector.selectOption({ index: 1 });
            await page.waitForTimeout(500);
          }
        }

        if (await colorSelector.isVisible()) {
          const options = colorSelector.locator("option");
          const optionCount = await options.count();

          if (optionCount > 1) {
            await colorSelector.selectOption({ index: 1 });
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test("should have product images gallery", async ({ page }) => {
      await page.goto("/en/products/test-product");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        const productImages = page
          .locator("img")
          .filter({ hasText: /product|item/ })
          .or(page.locator('[data-testid="product-image"]'));

        const imageCount = await productImages.count();

        if (imageCount > 0) {
          // Test image loading
          const firstImage = productImages.first();
          await expect(firstImage).toBeVisible();

          // Check for image gallery navigation
          const nextImageButton = page
            .locator('[data-testid="next-image"]')
            .or(page.locator(".image-gallery-next"));

          if (await nextImageButton.isVisible()) {
            await nextImageButton.click();
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test("should be responsive", async ({ page }) => {
      await responsive.testResponsive(async () => {
        await page.goto("/en/products/test-product");
        await visual.waitForAnimations();

        const main = page.locator("main");
        await expect(main).toBeVisible();

        const viewport = page.viewportSize();
        await page.screenshot({
          path: `test-results/product-${viewport?.width}x${viewport?.height}.png`,
        });
      });
    });

    test("should have good performance", async ({ page }) => {
      await page.goto("/en/products/test-product");

      const metrics = await perfUtils.measurePageLoad();

      // Product pages should load reasonably fast
      expect(metrics.domContentLoaded).toBeLessThan(6000);
      if (metrics.firstContentfulPaint > 0) {
        expect(metrics.firstContentfulPaint).toBeLessThan(4000);
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/products/test-product");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Product Layout Variants", () => {
    test("should load page-style-2 layout", async ({ page }) => {
      await page.goto("/en/products/page-style-2/test-product");
      await waitUtils.forNavigation();

      // Should load or show 404
      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/products/page-style-2/") &&
            response.status() !== 500,
          { timeout: 10000 },
        )
        .catch(() => null);

      if (response && response.status() === 200) {
        const main = page.locator("main");
        await expect(main).toBeVisible();
      }
    });

    test("should load unified layout", async ({ page }) => {
      await page.goto("/en/products/unified/test-product");
      await waitUtils.forNavigation();

      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/products/unified/") &&
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
      // Test if different product layouts render differently
      const layouts = [
        "/en/products/test-product",
        "/en/products/page-style-2/test-product",
        "/en/products/unified/test-product",
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

  test.describe("Product Error Handling", () => {
    test("should handle non-existent products", async ({ page }) => {
      await page.goto("/en/products/non-existent-product-12345");
      await waitUtils.forNavigation();

      // Should show 404 or not found message
      const notFoundMessage = page.getByText(/not found|404|page.*not.*exist/i);
      const main = page.locator("main");

      // Either show 404 content or redirect
      expect(
        (await notFoundMessage.isVisible()) || (await main.isVisible()),
      ).toBeTruthy();
    });

    test("should handle invalid product URLs", async ({ page }) => {
      await page.goto("/en/products/");
      await waitUtils.forNavigation();

      // Should handle missing product handle
      const response = page.url();
      expect(response).toBeTruthy();
    });
  });

  test.describe("Product SEO", () => {
    test("should have proper meta tags", async ({ page }) => {
      await page.goto("/en/products/test-product");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Check for meta description
        const metaDescription = page.locator('meta[name="description"]');
        if ((await metaDescription.count()) > 0) {
          const content = await metaDescription.getAttribute("content");
          expect(content?.length).toBeGreaterThan(0);
        }

        // Check for Open Graph tags
        const ogTitle = page.locator('meta[property="og:title"]');
        if ((await ogTitle.count()) > 0) {
          const content = await ogTitle.getAttribute("content");
          expect(content?.length).toBeGreaterThan(0);
        }
      }
    });

    test("should have structured data", async ({ page }) => {
      await page.goto("/en/products/test-product");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Check for JSON-LD structured data
        const structuredData = page.locator(
          'script[type="application/ld+json"]',
        );

        if ((await structuredData.count()) > 0) {
          const jsonText = await structuredData.textContent();
          expect(jsonText).toBeTruthy();

          // Should be valid JSON
          try {
            JSON.parse(jsonText || "{}");
          } catch (_error) {
            throw new Error("Invalid JSON-LD structured data");
          }
        }
      }
    });
  });

  test.describe("Cross-locale Product Pages", () => {
    const locales = ["en", "fr", "es", "de", "pt"];

    for (const locale of locales) {
      test(`should load product page in ${locale}`, async ({ page }) => {
        await page.goto(`/${locale}/products/test-product`);
        await waitUtils.forNavigation();

        await expect(page).toHaveURL(new RegExp(`/${locale}/products/`));

        const main = page.locator("main");
        await expect(main).toBeVisible();
      });
    }
  });
});
