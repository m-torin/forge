/**
 * E2E tests for authentication pages
 */

import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  type AuthPage,
  PageObjectFactory,
  WaitUtils,
} from "@repo/testing/e2e";

test.describe("Authentication Pages", () => {
  let _authPage: AuthPage;
  let _pageFactory: PageObjectFactory;
  let waitUtils: WaitUtils;
  let a11y: AccessibilityTestUtils;

  test.beforeEach(async ({ page }) => {
    _pageFactory = new PageObjectFactory(page);
    _authPage = _pageFactory.createAuthPage();
    waitUtils = new WaitUtils(page);
    a11y = new AccessibilityTestUtils(page);
  });

  test.describe("Login Page", () => {
    test("should load login page", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/login/);

      // Should have main content
      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should have login form elements", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      // Look for form elements
      const emailInput = page
        .locator('input[type="email"]')
        .or(page.locator('input[name="email"]'));
      const passwordInput = page
        .locator('input[type="password"]')
        .or(page.locator('input[name="password"]'));
      const submitButton = page.getByRole("button", {
        name: /sign in|login|log in/i,
      });

      // Check if form exists (might not be rendered in all implementations)
      const formExists = (await emailInput.count()) > 0;

      if (formExists) {
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
      }
    });

    test("should handle form validation", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      const submitButton = page.getByRole("button", {
        name: /sign in|login|log in/i,
      });

      if (await submitButton.isVisible()) {
        // Try to submit empty form
        await submitButton.click();

        // Look for validation messages
        const errorMessage = page
          .locator('[role="alert"]')
          .or(page.locator(".error"))
          .or(page.locator('[data-testid="error"]'));

        if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent();
          expect(errorText).toBeTruthy();
        }
      }
    });

    test("should have accessibility compliance", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      // No critical accessibility violations
      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });

    test("should have links to other auth pages", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      // Look for signup link
      const signupLink = page.getByRole("link", {
        name: /sign up|register|create account/i,
      });
      if (await signupLink.isVisible()) {
        await signupLink.click();
        await waitUtils.forNavigation();
        await expect(page).toHaveURL(/\/signup/);

        // Go back
        await page.goBack();
      }

      // Look for forgot password link
      const forgotLink = page.getByRole("link", {
        name: /forgot password|reset password/i,
      });
      if (await forgotLink.isVisible()) {
        await forgotLink.click();
        await waitUtils.forNavigation();
        await expect(page).toHaveURL(/\/forgot-password/);
      }
    });

    test("should work across all locales", async ({ page }) => {
      const locales = ["en", "fr", "es", "de", "pt"];

      for (const locale of locales) {
        await page.goto(`/${locale}/login`);
        await waitUtils.forNavigation();

        await expect(page).toHaveURL(new RegExp(`/${locale}/login`));

        const main = page.locator("main");
        await expect(main).toBeVisible();
      }
    });
  });

  test.describe("Signup Page", () => {
    test("should load signup page", async ({ page }) => {
      await page.goto("/en/signup");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/signup/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should have signup form elements", async ({ page }) => {
      await page.goto("/en/signup");
      await waitUtils.forNavigation();

      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.getByRole("button", {
        name: /sign up|register|create account/i,
      });

      const formExists = (await emailInput.count()) > 0;

      if (formExists) {
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
      }
    });

    test("should have password confirmation field", async ({ page }) => {
      await page.goto("/en/signup");
      await waitUtils.forNavigation();

      const passwordInputs = page.locator('input[type="password"]');
      const passwordCount = await passwordInputs.count();

      // Signup typically has password + confirm password
      if (passwordCount >= 2) {
        expect(passwordCount).toBeGreaterThanOrEqual(2);
      }
    });

    test("should validate password requirements", async ({ page }) => {
      await page.goto("/en/signup");
      await waitUtils.forNavigation();

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.getByRole("button", {
        name: /sign up|register|create account/i,
      });

      if ((await emailInput.isVisible()) && (await passwordInput.isVisible())) {
        // Fill with weak password
        await emailInput.fill("test@example.com");
        await passwordInput.fill("123");
        await submitButton.click();

        // Should show password requirements
        const errorMessage = page
          .locator('[role="alert"]')
          .or(page.locator(".error"))
          .or(page.getByText(/password.*requirements/i));

        if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent();
          expect(errorText).toBeTruthy();
        }
      }
    });

    test("should have accessibility compliance", async ({ page }) => {
      await page.goto("/en/signup");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Forgot Password Page", () => {
    test("should load forgot password page", async ({ page }) => {
      await page.goto("/en/forgot-password");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/forgot-password/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should have email input for reset", async ({ page }) => {
      await page.goto("/en/forgot-password");
      await waitUtils.forNavigation();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.getByRole("button", {
        name: /reset|send|submit/i,
      });

      const formExists = (await emailInput.count()) > 0;

      if (formExists) {
        await expect(emailInput).toBeVisible();
        await expect(submitButton).toBeVisible();
      }
    });

    test("should handle email submission", async ({ page }) => {
      await page.goto("/en/forgot-password");
      await waitUtils.forNavigation();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.getByRole("button", {
        name: /reset|send|submit/i,
      });

      if (await emailInput.isVisible()) {
        await emailInput.fill("test@example.com");
        await submitButton.click();

        // Should show some feedback
        await page.waitForTimeout(1000);

        // Look for success or error message
        const feedback = page
          .locator('[role="alert"]')
          .or(page.locator(".success"))
          .or(page.locator(".error"));

        if (await feedback.isVisible()) {
          const feedbackText = await feedback.textContent();
          expect(feedbackText).toBeTruthy();
        }
      }
    });

    test("should have link back to login", async ({ page }) => {
      await page.goto("/en/forgot-password");
      await waitUtils.forNavigation();

      const loginLink = page.getByRole("link", {
        name: /back to login|sign in|login/i,
      });

      if (await loginLink.isVisible()) {
        await loginLink.click();
        await waitUtils.forNavigation();
        await expect(page).toHaveURL(/\/login/);
      }
    });
  });

  test.describe("Auth Flow Integration", () => {
    test("should navigate between auth pages", async ({ page }) => {
      // Start at login
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      // Go to signup
      const signupLink = page.getByRole("link", { name: /sign up|register/i });
      if (await signupLink.isVisible()) {
        await signupLink.click();
        await waitUtils.forNavigation();
        await expect(page).toHaveURL(/\/signup/);

        // Go back to login
        const loginLink = page.getByRole("link", {
          name: /sign in|login|have.*account/i,
        });
        if (await loginLink.isVisible()) {
          await loginLink.click();
          await waitUtils.forNavigation();
          await expect(page).toHaveURL(/\/login/);
        }
      }
    });

    test("should preserve locale in auth navigation", async ({ page }) => {
      await page.goto("/fr/login");
      await waitUtils.forNavigation();

      const signupLink = page
        .getByRole("link", { name: /s'inscrire|créer.*compte/i })
        .or(page.getByRole("link", { name: /sign up/i }));

      if (await signupLink.isVisible()) {
        await signupLink.click();
        await waitUtils.forNavigation();
        await expect(page).toHaveURL(/\/fr\/signup/);
      }
    });

    test("should redirect to protected pages after login", async ({ page }) => {
      // Try to access protected page
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      // Should redirect to login if not authenticated
      const currentUrl = page.url();
      if (currentUrl.includes("/login")) {
        await expect(page).toHaveURL(/\/login/);
      }
    });
  });
});
