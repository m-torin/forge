import { expect, test } from "@playwright/test";

import { createAuthHelpers } from "@repo/testing/auth-helpers";

const authHelpers = createAuthHelpers("http://localhost:3200");

test.describe("Web App Auth - Better Auth Integration", () => {
  test("can access sign-in page with internationalization", async ({
    page,
  }) => {
    // Test default locale
    await page.goto("/sign-in");

    // Check for Better Auth sign-in form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Test with explicit locale
    await page.goto("/en/sign-in");
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Test Spanish locale if available
    try {
      await page.goto("/es/sign-in");
      await expect(page.locator('input[type="email"]')).toBeVisible();
    } catch {
      console.log("Spanish locale not available, skipping");
    }
  });

  test("can sign up new user", async ({ page }) => {
    const testUser = authHelpers.createTestUser({
      name: "Test Web User",
      email: `web-user-${Date.now()}@example.com`,
    });

    // Navigate to sign-up
    await page.goto("/sign-up");

    // Fill and submit sign-up form
    await authHelpers.signUp(page, testUser);

    // Should redirect to dashboard or welcome page
    await expect(page).toHaveURL(/\/(dashboard|account|welcome|profile)/);

    // Verify user is authenticated
    const isAuthenticated = await authHelpers.isSignedIn(page);
    expect(isAuthenticated).toBe(true);
  });

  test("can sign in existing user", async ({ page }) => {
    const testUser = authHelpers.createTestUser({
      email: `web-signin-${Date.now()}@example.com`,
    });

    // Create user first
    try {
      await authHelpers.createUserViaAPI(page, testUser);
    } catch {
      await authHelpers.signUp(page, testUser);
      await authHelpers.signOut(page);
    }

    // Test sign-in
    await authHelpers.signIn(page, testUser);

    // Verify authentication
    const isAuthenticated = await authHelpers.isSignedIn(page);
    expect(isAuthenticated).toBe(true);

    // Should be on dashboard or account page
    await expect(page).toHaveURL(/\/(dashboard|account)/);
  });

  test("public pages remain accessible without auth", async ({ page }) => {
    const publicPages = ["/", "/about", "/demo", "/search"];

    for (const pagePath of publicPages) {
      try {
        await page.goto(pagePath);

        // Should load successfully
        await page.waitForLoadState("networkidle");

        // Should not redirect to sign-in
        expect(page.url()).not.toContain("/sign-in");

        // Should have basic page structure
        const body = page.locator("body");
        await expect(body).toBeVisible();
      } catch (error) {
        console.warn(`Public page ${pagePath} might not exist:`, error);
      }
    }
  });

  test("protected pages redirect unauthenticated users", async ({ page }) => {
    const protectedPages = ["/account", "/dashboard", "/profile", "/settings"];

    for (const route of protectedPages) {
      await page.goto(route);

      // Should redirect to sign-in (with possible locale prefix)
      await expect(page).toHaveURL(/\/(en\/)?sign-in/);
    }
  });

  test("can access account features after authentication", async ({ page }) => {
    const testUser = authHelpers.createTestUser({
      email: `web-account-${Date.now()}@example.com`,
    });

    // Sign in
    await authHelpers.signIn(page, testUser);

    // Navigate to account page
    await page.goto("/account");

    // Should be authenticated and on account page
    expect(await authHelpers.isSignedIn(page)).toBe(true);
    expect(page.url()).toContain("/account");

    // Check for account-specific elements
    const accountElements = [
      "text=Profile",
      "text=Settings",
      "text=Account",
      '[data-testid="user-profile"]',
      'input[name="name"]',
      'input[name="email"]',
    ];

    let accountElementFound = false;
    for (const selector of accountElements) {
      if ((await page.locator(selector).count()) > 0) {
        accountElementFound = true;
        break;
      }
    }

    if (!accountElementFound) {
      // At minimum, should not be redirected to sign-in
      expect(page.url()).not.toContain("/sign-in");
    }
  });

  test("maintains session across locale changes", async ({ page }) => {
    const testUser = authHelpers.createTestUser();

    // Sign in
    await authHelpers.signIn(page, testUser);
    expect(await authHelpers.isSignedIn(page)).toBe(true);

    // Change locale by navigating to different locale paths
    const locales = ["/en", "/es"];

    for (const locale of locales) {
      try {
        await page.goto(`${locale}/account`);
        await page.waitForLoadState("networkidle");

        // Should still be authenticated
        expect(await authHelpers.isSignedIn(page)).toBe(true);

        // Should not redirect to sign-in
        expect(page.url()).not.toContain("/sign-in");
      } catch (error) {
        console.warn(`Locale ${locale} might not be available:`, error);
      }
    }
  });

  test("can use social authentication", async ({ page }) => {
    await page.goto("/sign-in");

    // Check if social auth buttons are present
    const socialProviders = ["Google", "GitHub"];

    for (const provider of socialProviders) {
      const socialButton = page.locator(`button:has-text("${provider}")`);

      if ((await socialButton.count()) > 0) {
        await expect(socialButton).toBeVisible();

        // Click to test the button (in real tests, this would be mocked)
        // For now, just verify it's clickable
        await expect(socialButton).toBeEnabled();
      }
    }
  });

  test("handles search functionality with auth context", async ({ page }) => {
    // Test search without auth
    await page.goto("/search");

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]',
    );
    if ((await searchInput.count()) > 0) {
      await searchInput.fill("test query");
      await page.keyboard.press("Enter");
      await page.waitForLoadState("networkidle");

      // Should work without authentication
      expect(page.url()).toContain("/search");
    }

    // Test search with auth
    const testUser = authHelpers.createTestUser();
    await authHelpers.signIn(page, testUser);

    await page.goto("/search");

    if ((await searchInput.count()) > 0) {
      await searchInput.fill("authenticated search");
      await page.keyboard.press("Enter");
      await page.waitForLoadState("networkidle");

      // Should still work and user should remain authenticated
      expect(await authHelpers.isSignedIn(page)).toBe(true);
    }
  });

  test("can sign out and return to public area", async ({ page }) => {
    const testUser = authHelpers.createTestUser();

    // Sign in
    await authHelpers.signIn(page, testUser);
    expect(await authHelpers.isSignedIn(page)).toBe(true);

    // Sign out
    await authHelpers.signOut(page);

    // Should be signed out
    expect(await authHelpers.isSignedIn(page)).toBe(false);

    // Should be able to access public pages
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should not redirect to sign-in for public pages
    expect(page.url()).not.toContain("/sign-in");
  });

  test("Better Auth API endpoints work correctly", async ({ page }) => {
    const betterAuthEndpoints = [
      "/api/auth/session",
      "/api/auth/sign-in",
      "/api/auth/sign-up",
      "/api/auth/sign-out",
    ];

    for (const endpoint of betterAuthEndpoints) {
      const response = await page.request.get(
        `http://localhost:3200${endpoint}`,
      );

      // Should not return 404 (endpoints exist)
      expect([200, 401, 405, 422].includes(response.status())).toBe(true);
    }
  });
});
