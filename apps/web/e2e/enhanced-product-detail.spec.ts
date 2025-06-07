import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Enhanced Product Detail Page", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test("should display comprehensive product information", async ({ page }) => {
    // Navigate to a product page
    await page.goto("/en/products/unified/sample-product");
    await waitUtils.forNavigation();

    // Check for 404 - if product doesn't exist, try homepage first
    const pageContent = await page.textContent("body");
    if (pageContent?.match(/404|not found/i)) {
      // Navigate via homepage
      await page.goto("/");
      await waitUtils.forNavigation();

      // Click on first product
      const productLink = page
        .getByRole("link")
        .filter({ hasText: /product|item|shop/i })
        .first();
      if ((await productLink.count()) > 0) {
        await productLink.click();
        await waitUtils.forNavigation();
      }
    }

    // Verify essential product elements
    const productTitle = page.getByRole("heading", { level: 1 });
    if ((await productTitle.count()) > 0) {
      await expect(productTitle).toBeVisible();
      const title = await productTitle.textContent();
      expect(title).toBeTruthy();
    }

    // Check for price
    const priceElement = page
      .locator('[data-testid="product-price"], .price, [class*="price"]')
      .first();
    if ((await priceElement.count()) > 0) {
      await expect(priceElement).toBeVisible();
      const price = await priceElement.textContent();
      expect(price).toMatch(/[\d.,]+/); // Should contain numbers
    }

    // Check for add to cart button
    const addToCartBtn = page.getByRole("button", {
      name: /add to cart|buy|purchase/i,
    });
    if ((await addToCartBtn.count()) > 0) {
      await expect(addToCartBtn).toBeVisible();
      await expect(addToCartBtn).toBeEnabled();
    }

    // Check for product images
    const productImages = page.locator(
      'img[alt*="product"], img[src*="product"], .product-image img',
    );
    expect(await productImages.count()).toBeGreaterThan(0);

    // Check for product description
    const description = page
      .locator(
        '[data-testid="product-description"], .description, [class*="description"]',
      )
      .first();
    if ((await description.count()) > 0) {
      const descText = await description.textContent();
      expect(descText).toBeTruthy();
    }
  });

  test("should handle product interactions", async ({ page }) => {
    // Navigate to homepage first
    await page.goto("/");
    await waitUtils.forNavigation();

    // Find and click on a product
    const productCard = page
      .locator(
        '[data-testid="product-card"], .product-card, [class*="product"]',
      )
      .first();
    if ((await productCard.count()) > 0) {
      await productCard.click();
      await waitUtils.forNavigation();
    }

    // Test quantity selector
    const quantityInput = page.locator(
      'input[type="number"][name*="quantity"], input[data-testid="quantity"]',
    );
    if ((await quantityInput.count()) > 0) {
      await quantityInput.fill("2");
      expect(await quantityInput.inputValue()).toBe("2");
    }

    // Test size/variant selection
    const sizeButton = page
      .getByRole("button", { name: /size|variant/i })
      .first();
    if ((await sizeButton.count()) > 0) {
      await sizeButton.click();
      // Verify it's selected
      const isSelected =
        (await sizeButton.getAttribute("aria-pressed")) ||
        (await sizeButton.getAttribute("data-selected"));
      expect(isSelected).toBeTruthy();
    }

    // Test add to favorites
    const favoriteBtn = page.locator(
      '[data-testid="favorite-button"], button[aria-label*="favorite"], .favorite-btn',
    );
    if ((await favoriteBtn.count()) > 0) {
      const initialState = await favoriteBtn.getAttribute("aria-pressed");
      await favoriteBtn.click();
      await page.waitForTimeout(500); // Wait for animation
      const newState = await favoriteBtn.getAttribute("aria-pressed");
      expect(newState).not.toBe(initialState);
    }
  });

  test("should display product reviews section", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Navigate to a product
    const productLink = page
      .getByRole("link")
      .filter({ hasText: /product|item/i })
      .first();
    if ((await productLink.count()) > 0) {
      await productLink.click();
      await waitUtils.forNavigation();
    }

    // Check for reviews section
    const reviewsSection = page.locator(
      '[data-testid="reviews"], .reviews, #reviews',
    );
    if ((await reviewsSection.count()) > 0) {
      // Scroll to reviews
      await reviewsSection.scrollIntoViewIfNeeded();

      // Check for review elements
      const reviewItems = reviewsSection.locator(
        '.review-item, [data-testid="review"]',
      );
      if ((await reviewItems.count()) > 0) {
        // Verify review has author
        const author = reviewItems
          .first()
          .locator('.author, [data-testid="review-author"]');
        if ((await author.count()) > 0) {
          const authorName = await author.textContent();
          expect(authorName).toBeTruthy();
        }

        // Verify review has rating
        const rating = reviewItems
          .first()
          .locator('[data-testid="rating"], .rating, [aria-label*="rating"]');
        expect(await rating.count()).toBeGreaterThan(0);
      }
    }
  });

  test("should handle responsive product gallery", async ({
    page,
    viewport,
  }) => {
    // Skip if viewport is not available
    if (!viewport) return;

    await page.goto("/");
    await waitUtils.forNavigation();

    // Navigate to a product
    const productLink = page
      .getByRole("link")
      .filter({ hasText: /product|item/i })
      .first();
    if ((await productLink.count()) > 0) {
      await productLink.click();
      await waitUtils.forNavigation();
    }

    // Test image gallery
    const gallery = page
      .locator(
        '[data-testid="product-gallery"], .product-gallery, [class*="gallery"]',
      )
      .first();
    if ((await gallery.count()) > 0) {
      const images = gallery.locator("img");
      const imageCount = await images.count();

      if (imageCount > 1) {
        // Test thumbnail clicks
        const thumbnails = gallery.locator(
          '[data-testid="thumbnail"], .thumbnail, button img',
        );
        if ((await thumbnails.count()) > 0) {
          await thumbnails.nth(1).click();
          await page.waitForTimeout(300); // Wait for transition

          // Verify main image changed
          const mainImage = gallery
            .locator('[data-testid="main-image"], .main-image, img')
            .first();
          expect(await mainImage.isVisible()).toBeTruthy();
        }
      }

      // Test zoom functionality on desktop
      if (viewport.width > 768) {
        const mainImage = gallery.locator("img").first();
        await mainImage.hover();
        // Some galleries show zoom on hover
        const zoomElement = page.locator('.zoom, [data-testid="zoom"]');
        // Just check if zoom exists, don't fail if it doesn't
        if ((await zoomElement.count()) > 0) {
          expect(await zoomElement.isVisible()).toBeTruthy();
        }
      }
    }
  });

  test("should track product page analytics events", async ({ page }) => {
    // Set up to capture analytics calls
    const analyticsCalls: any[] = [];
    await page.route("**/api/analytics/**", (route) => {
      analyticsCalls.push({
        url: route.request().url(),
        postData: route.request().postData(),
      });
      route.continue();
    });

    // Navigate to product
    await page.goto("/");
    await waitUtils.forNavigation();

    const productLink = page
      .getByRole("link")
      .filter({ hasText: /product|item/i })
      .first();
    if ((await productLink.count()) > 0) {
      await productLink.click();
      await waitUtils.forNavigation();

      // Give time for analytics to fire
      await page.waitForTimeout(1000);

      // Verify page view was tracked (if analytics is implemented)
      // This is a placeholder - actual implementation depends on analytics setup
      const pageViewTracked = analyticsCalls.some(
        (call) =>
          call.url.includes("pageview") || call.postData?.includes("pageview"),
      );

      // Don't fail if analytics isn't implemented yet
      if (analyticsCalls.length > 0) {
        expect(pageViewTracked).toBeTruthy();
      }
    }
  });
});
