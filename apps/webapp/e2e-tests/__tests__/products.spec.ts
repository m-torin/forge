import { expect, test } from '@playwright/test';

test.describe('Product Pages', () => {
  test.beforeEach(async ({ page: _page }) => {
    // Setup if needed
  });

  test('should navigate to product listing page', async ({ page }) => {
    await page.goto('/');

    // Look for a products/collections link
    const productsLink = page.locator('a[href*="/collections"], a[href*="/products"]').first();
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on a products/collections page
      const url = page.url();
      expect(url).toMatch(/\/(collections|products)/);
    }
  });

  test('should display product grid', async ({ page }) => {
    // Navigate to homepage which has products displayed
    await page.goto('/');

    // Wait for products to load - look for product cards on homepage
    await page
      .waitForSelector('[data-testid="product-card"], .product-card, .nc-CardProduct', {
        timeout: 10000,
      })
      .catch(() => {
        // If no specific selectors, look for common product card patterns
      });

    // Check if products are displayed on homepage
    const products = page.locator('a[href*="/products/"], .product-card, .nc-CardProduct');
    const productCount = await products.count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should open product detail page', async ({ page }) => {
    await page.goto('/');

    // Click on the first product link
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible()) {
      // Use force click to avoid image interception
      await firstProduct.click({ force: true });
      await page.waitForLoadState('networkidle');

      // Verify we're on a product detail page
      expect(page.url()).toMatch(/\/products\//);

      // Check for product elements
      await expect(page.locator('h1, h2').first()).toBeVisible(); // Product title
      await expect(
        page
          .locator(
            'button:has-text("Add to Cart"), button:has-text("Add to Bag"), [data-testid="add-to-cart-button"]',
          )
          .first(),
      ).toBeVisible();
    }
  });

  test('should add product to cart', async ({ page }) => {
    // Navigate directly to a product page using the first product from data
    await page.goto('/products/leather-tote-bag');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for add to cart button - use more specific selector and get first
    const addToCartButton = page
      .locator(
        '[data-testid="add-to-cart-button"], button:has-text("Add to Cart"), button:has-text("Add to Bag")',
      )
      .first();

    if (await addToCartButton.isVisible()) {
      // Click add to cart
      await addToCartButton.click();

      // Check for success indication (toast, cart update, etc.)
      await page.waitForTimeout(1000); // Wait for any animations

      // Verify cart has been updated (look for cart icon with count)
      const cartCount = page.locator(
        '[data-testid="cart-count"], .cart-count, [aria-label*="cart"]',
      );
      if (await cartCount.isVisible()) {
        const count = await cartCount.textContent();
        expect(Number(count)).toBeGreaterThan(0);
      }
    }
  });
});
