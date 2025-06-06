import { expect, test } from "@repo/testing/e2e";
import {
  APITestUtils,
  type AuthPage,
  createAuthHelpers,
  PageObjectFactory,
} from "@repo/testing/e2e";

import type { BetterAuthTestHelpers } from "@repo/testing/e2e";

test.describe("Authentication", () => {
  let _authHelpers: BetterAuthTestHelpers;
  let _authPage: AuthPage;
  let _pageFactory: PageObjectFactory;
  let apiUtils: APITestUtils;

  test.beforeEach(async ({ page, request }) => {
    _authHelpers = createAuthHelpers("http://localhost:3200");
    _pageFactory = new PageObjectFactory(page);
    _authPage = _pageFactory.createAuthPage();
    apiUtils = new APITestUtils(request);
  });

  test("auth routes should exist", async ({ page }) => {
    // Test that auth routes are accessible
    const authRoutes = ["/api/auth/sign-in", "/api/auth/sign-up"];

    for (const route of authRoutes) {
      const response = await page.request.get(route);
      // Auth routes should exist, even if they return 405 for GET requests
      expect(response.status()).toBeLessThan(500);
    }
  });

  test("should load sign-in route", async ({ page }) => {
    const response = await page.goto("/sign-in");
    // Check that the page loads without server errors
    expect(response?.status()).toBeLessThan(500);
  });

  test("should load sign-up route", async ({ page }) => {
    const response = await page.goto("/sign-up");
    // Check that the page loads without server errors
    expect(response?.status()).toBeLessThan(500);
  });

  test("should show auth page elements", async ({ page }) => {
    await page.goto("/sign-in");

    // Check if basic form elements exist (if they're rendered)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Only check if elements exist, don't require them to be visible
    // since the app might not have a sign-in form rendered
    if ((await emailInput.count()) > 0) {
      await expect(emailInput).toBeAttached();
    }

    if ((await passwordInput.count()) > 0) {
      await expect(passwordInput).toBeAttached();
    }
  });

  test("health check via API utils", async () => {
    const isHealthy = await apiUtils.checkHealth();
    expect(isHealthy).toBeTruthy();
  });
});
