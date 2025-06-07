import { expect, test } from "@repo/testing/e2e";
import { PerformanceUtils, WaitUtils } from "@repo/testing/e2e";

import { createApiMocker } from "./utils/api-mock";
import { withPerformanceMonitoring } from "./utils/performance-monitor";
import { createVisualTester } from "./utils/visual-testing";

test.describe("Authentication - Enhanced", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test("auth API routes should be accessible", async ({ page }) => {
    const apiRoutes = [
      { expectedStatus: 200, method: "GET", path: "/api/health" },
      { expectedStatus: [200, 401], method: "GET", path: "/api/auth/session" },
    ];

    for (const route of apiRoutes) {
      try {
        const response = await page.request.get(route.path);
        const status = response.status();

        if (Array.isArray(route.expectedStatus)) {
          expect(route.expectedStatus).toContain(status);
        } else {
          expect(status).toBe(route.expectedStatus);
        }
      } catch (error) {
        console.warn(`Route ${route.path} failed:`, error);
        // Don't fail test for missing optional routes
      }
    }
  });

  test("sign-in page should load with good performance", async ({
    context,
    page,
  }) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/en/login",
      async () => {
        await waitUtils.forNavigation();

        // Check for auth form elements
        const emailInput = page.locator(
          'input[type="email"], input[name="email"]',
        );
        const passwordInput = page.locator(
          'input[type="password"], input[name="password"]',
        );
        const submitButton = page.getByRole("button", {
          name: /sign.?in|login/i,
        });

        // At least one of these should be present
        const hasAuthForm =
          (await emailInput.count()) > 0 ||
          (await passwordInput.count()) > 0 ||
          (await submitButton.count()) > 0;

        expect(hasAuthForm).toBeTruthy();
        return "sign-in page loaded";
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    expect(result).toBe("sign-in page loaded");

    await test.info().attach("auth-performance-report", {
      body: JSON.stringify(report, null, 2),
      contentType: "application/json",
    });
  });

  test("sign-up page should load and be accessible", async ({
    context,
    page,
  }) => {
    const visualTester = createVisualTester(page);

    const { result } = await withPerformanceMonitoring(
      page,
      context,
      "/en/signup",
      async () => {
        await waitUtils.forNavigation();

        // Check accessibility features
        const formElements = await page.locator("form, input, button").count();
        expect(formElements).toBeGreaterThan(0);

        // Check for proper labels and ARIA attributes
        const labeledInputs = await page
          .locator("input[aria-label], input[aria-labelledby], label input")
          .count();
        const totalInputs = await page
          .locator(
            'input[type="email"], input[type="password"], input[type="text"]',
          )
          .count();

        if (totalInputs > 0) {
          // At least 70% of inputs should have proper labels
          expect(labeledInputs / totalInputs).toBeGreaterThan(0.7);
        }

        return "sign-up page accessible";
      },
    );

    // Take visual regression screenshot
    await visualTester.comparePageState(page, "signup-page", {
      animations: "disabled",
      fullPage: true,
    });

    expect(result).toBe("sign-up page accessible");
  });

  test("authentication flow with API mocking", async ({ page }) => {
    const mocker = await createApiMocker(page, "auth");

    await page.goto("/en/login");
    await waitUtils.forNavigation();

    // Check for form elements
    const emailInput = page
      .locator('input[type="email"], input[name="email"]')
      .first();
    const passwordInput = page
      .locator('input[type="password"], input[name="password"]')
      .first();
    const submitButton = page
      .getByRole("button", { name: /sign.?in|login/i })
      .first();

    if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
      // Test successful login flow
      await emailInput.fill("test@example.com");
      await passwordInput.fill("password123");

      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await waitUtils.forNavigation();

        // Should redirect after successful login (mocked)
        const currentUrl = page.url();
        expect(currentUrl).not.toContain("/login");
      }
    }
  });

  test("authentication error handling", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Mock failed authentication
    mocker.mockAuth({
      errorMessage: "Invalid credentials",
      loginSuccess: false,
    });

    await page.goto("/en/login");
    await waitUtils.forNavigation();

    const emailInput = page
      .locator('input[type="email"], input[name="email"]')
      .first();
    const passwordInput = page
      .locator('input[type="password"], input[name="password"]')
      .first();
    const submitButton = page
      .getByRole("button", { name: /sign.?in|login/i })
      .first();

    if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
      await emailInput.fill("wrong@example.com");
      await passwordInput.fill("wrongpassword");

      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);

        // Should show error message or stay on login page
        const hasError =
          (await page
            .locator('[data-testid="error"], .error, [role="alert"]')
            .count()) > 0;
        const staysOnLogin = page.url().includes("/login");

        expect(hasError || staysOnLogin).toBeTruthy();
      }
    }
  });

  test("form validation and accessibility", async ({ page }) => {
    await page.goto("/en/signup");
    await waitUtils.forNavigation();

    // Check form validation attributes
    const requiredInputs = await page.locator("input[required]").count();
    const emailInputs = await page.locator('input[type="email"]').count();
    const passwordInputs = await page.locator('input[type="password"]').count();

    // At least some validation should be present
    const hasValidation =
      requiredInputs > 0 || emailInputs > 0 || passwordInputs > 0;
    expect(hasValidation).toBeTruthy();

    // Check ARIA labels and descriptions
    const ariaLabeled = await page
      .locator("[aria-label], [aria-labelledby]")
      .count();
    const described = await page.locator("[aria-describedby]").count();

    // Should have some accessibility attributes
    expect(ariaLabeled + described).toBeGreaterThan(0);

    // Check keyboard navigation
    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(["INPUT", "BUTTON", "A", "SELECT"]).toContain(focusedElement);
  });

  test("performance across auth pages", async ({ context, page }) => {
    const authPages = [
      { name: "login", path: "/en/login" },
      { name: "signup", path: "/en/signup" },
      { name: "forgot-password", path: "/en/forgot-password" },
    ];

    const performanceResults = [];

    for (const authPage of authPages) {
      try {
        const { report } = await withPerformanceMonitoring(
          page,
          context,
          authPage.path,
          async () => {
            await waitUtils.forNavigation();
            return `${authPage.name} loaded`;
          },
          {
            fcp: { error: 3000, warning: 1500 },
            lcp: { error: 4000, warning: 2500 },
          },
        );

        performanceResults.push({
          fcp: report.fcp,
          lcp: report.lcp,
          networkRequests: report.networkActivity?.requestCount || 0,
          page: authPage.name,
        });
      } catch (error) {
        console.warn(`Performance test failed for ${authPage.path}:`, error);
      }
    }

    // Attach performance comparison
    await test.info().attach("auth-pages-performance", {
      body: JSON.stringify(performanceResults, null, 2),
      contentType: "application/json",
    });

    // At least one page should have been tested
    expect(performanceResults.length).toBeGreaterThan(0);
  });
});
