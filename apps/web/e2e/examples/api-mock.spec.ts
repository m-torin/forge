import { expect, test } from "@playwright/test";

import { createApiMocker, mockStates } from "../utils/api-mock";

test.describe("API Mocking Tests", () => {
  test("test with successful authentication", async ({ page }) => {
    const mocker = await createApiMocker(page, "auth");

    await page.goto("/en/auth/sign-in");

    // Fill in login form
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="sign-in-button"]');

    // Should redirect to dashboard since auth is mocked successfully
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("test with failed authentication", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Mock failed login
    mocker.mockAuth({ loginSuccess: false });

    await page.goto("/en/auth/sign-in");

    await page.fill('[data-testid="email"]', "wrong@example.com");
    await page.fill('[data-testid="password"]', "wrongpassword");
    await page.click('[data-testid="sign-in-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("test offline scenario", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Mock offline state
    mockStates.offline(mocker);

    await page.goto("/en/products");

    // Should show offline message or retry functionality
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
  });

  test("test slow API responses", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Mock slow responses (3 second delay)
    mockStates.slow(mocker, 3000);

    await page.goto("/en/products");

    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Wait for slow response to complete
    await page.waitForTimeout(3500);

    // Loading should be gone
    await expect(
      page.locator('[data-testid="loading-spinner"]'),
    ).not.toBeVisible();
  });

  test("test e-commerce flow with mocked APIs", async ({ page }) => {
    const mocker = await createApiMocker(page, "ecommerce");

    await page.goto("/en/products");

    // Click on first product
    await page.click('[data-testid="product-card"]');

    // Add to cart
    await page.click('[data-testid="add-to-cart"]');

    // Should show success message
    await expect(page.locator('[data-testid="cart-success"]')).toBeVisible();

    // Go to cart
    await page.click('[data-testid="cart-icon"]');

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');

    // Should reach checkout page
    await expect(page).toHaveURL(/\/checkout/);
  });

  test("test API error scenarios", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Mock different error types
    mocker.mockApiError("/api/products", "server-error");
    mocker.mockApiError("/api/cart", "unauthorized");
    mocker.mockApiError("/api/user/profile", "not-found");

    // Test server error
    await page.goto("/en/products");
    await expect(page.locator('[data-testid="error-500"]')).toBeVisible();

    // Test unauthorized error
    await page.goto("/en/cart");
    await expect(page.locator('[data-testid="error-401"]')).toBeVisible();

    // Test not found error
    await page.goto("/en/profile");
    await expect(page.locator('[data-testid="error-404"]')).toBeVisible();
  });

  test("test external service mocking", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Mock external services
    mocker.mockExternalServices();

    await page.goto("/en/checkout");

    // Fill checkout form
    await page.fill('[data-testid="card-number"]', "4242424242424242");
    await page.fill('[data-testid="expiry"]', "12/25");
    await page.fill('[data-testid="cvc"]', "123");

    // Submit payment
    await page.click('[data-testid="pay-button"]');

    // Should show success since Stripe is mocked
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
  });

  test("test API usage tracking", async ({ page }) => {
    const mocker = await createApiMocker(page, "all");

    await page.goto("/en");

    // Navigate around to generate API calls
    await page.click('[data-testid="products-link"]');
    await page.click('[data-testid="product-card"]');
    await page.click('[data-testid="add-to-cart"]');

    // Check request log
    const requestLog = mocker.getRequestLog();
    const usageStats = mocker.getUsageStats();

    console.log("API Requests made:", requestLog.length);
    console.log("Mock usage:", usageStats);

    // Verify certain APIs were called
    const productRequests = requestLog.filter((req) =>
      req.url.includes("/api/products"),
    );
    expect(productRequests.length).toBeGreaterThan(0);
  });

  test("test limited mock usage", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Mock API that only works twice
    const mockKey = mocker.get(
      "/api/limited",
      { body: { message: "success" }, status: 200 },
      2, // Only use this mock twice
    );

    // First two requests should succeed
    await page.goto("/en/test?call=1");
    await expect(page.locator('[data-testid="success"]')).toBeVisible();

    await page.goto("/en/test?call=2");
    await expect(page.locator('[data-testid="success"]')).toBeVisible();

    // Third request should use real API or fail
    await page.goto("/en/test?call=3");
    // Behavior depends on actual API availability
  });
});
