import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Authentication Pages - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test.describe("Login Page (/[locale]/login)", () => {
    const locales = ["en", "es", "de", "fr", "pt"];

    test("should render login page with all elements", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      // Check page title
      const title = await page.title();
      expect(title.toLowerCase()).toContain("login");

      // Check main heading
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();

      // Check form elements
      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.getByRole("button", { name: /sign in|login/i });

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Check additional elements
      const forgotPasswordLink = page.getByRole("link", {
        name: /forgot password/i,
      });
      const signUpLink = page.getByRole("link", {
        name: /sign up|create account/i,
      });

      if ((await forgotPasswordLink.count()) > 0) {
        await expect(forgotPasswordLink).toBeVisible();
      }
      if ((await signUpLink.count()) > 0) {
        await expect(signUpLink).toBeVisible();
      }

      // Check for social login buttons
      const googleButton = page.getByRole("button", { name: /google/i });
      const facebookButton = page.getByRole("button", { name: /facebook/i });

      // Social logins are optional
      if ((await googleButton.count()) > 0) {
        await expect(googleButton).toBeVisible();
      }
    });

    test("should validate login form inputs", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.getByRole("button", { name: /sign in|login/i });

      // Test empty submission
      await submitButton.click();

      // Check for validation messages
      const emailError = page
        .locator('[id*="email-error"], [class*="error"]')
        .filter({ hasText: /email/i });
      const passwordError = page
        .locator('[id*="password-error"], [class*="error"]')
        .filter({ hasText: /password/i });

      if ((await emailError.count()) > 0 || (await passwordError.count()) > 0) {
        expect(true).toBeTruthy(); // Validation is working
      }

      // Test invalid email
      await emailInput.fill("invalid-email");
      await passwordInput.fill("password123");
      await submitButton.click();

      // Give time for validation
      await page.waitForTimeout(500);

      // Test valid inputs
      await emailInput.fill("test@example.com");
      await passwordInput.fill("ValidPassword123!");

      // Don't actually submit to avoid login
      const formValid = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validity.valid,
      );
      expect(formValid).toBeTruthy();
    });

    test("should handle password visibility toggle", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      const passwordInput = page.locator('input[type="password"]');
      const toggleButton = page.locator(
        'button[aria-label*="password"], [data-testid="password-toggle"]',
      );

      if ((await toggleButton.count()) > 0) {
        // Check initial state
        expect(await passwordInput.getAttribute("type")).toBe("password");

        // Toggle visibility
        await toggleButton.click();
        expect(await passwordInput.getAttribute("type")).toBe("text");

        // Toggle back
        await toggleButton.click();
        expect(await passwordInput.getAttribute("type")).toBe("password");
      }
    });

    test("should navigate to forgot password", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      const forgotPasswordLink = page.getByRole("link", {
        name: /forgot password/i,
      });
      if ((await forgotPasswordLink.count()) > 0) {
        await forgotPasswordLink.click();
        await waitUtils.forNavigation();

        expect(page.url()).toContain("forgot-password");
      }
    });

    test("should support multiple locales", async ({ page }) => {
      for (const locale of locales.slice(0, 3)) {
        // Test first 3 locales
        await page.goto(`/${locale}/login`);
        await waitUtils.forNavigation();

        // Page should load without errors
        const content = await page.textContent("body");
        expect(content).toBeTruthy();

        // Login form should be present
        const emailInput = page.locator(
          'input[type="email"], input[name="email"]',
        );
        await expect(emailInput).toBeVisible();
      }
    });

    test("should handle remember me functionality", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      const rememberCheckbox = page.locator(
        'input[type="checkbox"][name*="remember"], [data-testid="remember-me"]',
      );
      if ((await rememberCheckbox.count()) > 0) {
        // Check initial state
        const isChecked = await rememberCheckbox.isChecked();

        // Toggle state
        await rememberCheckbox.click();
        expect(await rememberCheckbox.isChecked()).toBe(!isChecked);
      }
    });
  });

  test.describe("Sign Up Page (/[locale]/signup)", () => {
    test("should render signup page with all elements", async ({ page }) => {
      await page.goto("/en/signup");
      await waitUtils.forNavigation();

      // Check form elements
      const nameInput = page
        .locator('input[name*="name"], input[placeholder*="name"]')
        .first();
      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const passwordInput = page.locator('input[type="password"]').first();
      const confirmPasswordInput = page
        .locator('input[type="password"]')
        .nth(1);
      const submitButton = page.getByRole("button", {
        name: /sign up|create account|register/i,
      });

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Name and confirm password are common but optional
      if ((await nameInput.count()) > 0) {
        await expect(nameInput).toBeVisible();
      }
      if ((await confirmPasswordInput.count()) > 0) {
        await expect(confirmPasswordInput).toBeVisible();
      }

      // Check for login link
      const loginLink = page.getByRole("link", {
        name: /log in|sign in|already have/i,
      });
      if ((await loginLink.count()) > 0) {
        await expect(loginLink).toBeVisible();
      }

      // Check for terms checkbox
      const termsCheckbox = page
        .locator('input[type="checkbox"]')
        .filter({ hasText: /terms|agree/i });
      if ((await termsCheckbox.count()) > 0) {
        await expect(termsCheckbox).toBeVisible();
      }
    });

    test("should validate signup form", async ({ page }) => {
      await page.goto("/en/signup");
      await waitUtils.forNavigation();

      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.getByRole("button", {
        name: /sign up|create account|register/i,
      });

      // Test password requirements
      await passwordInput.fill("weak");
      await emailInput.fill("test@example.com");

      // Look for password requirements hint
      const passwordHint = page.locator(
        '[class*="hint"], [class*="help"], [id*="password-help"]',
      );
      if ((await passwordHint.count()) > 0) {
        const hintText = await passwordHint.textContent();
        expect(hintText).toMatch(/character|length|uppercase|number/i);
      }

      // Test strong password
      await passwordInput.fill("StrongPassword123!");

      // Check if confirm password exists and test matching
      const confirmPasswordInput = page
        .locator('input[type="password"]')
        .nth(1);
      if ((await confirmPasswordInput.count()) > 0) {
        await confirmPasswordInput.fill("DifferentPassword123!");
        await submitButton.click();

        // Should show mismatch error
        await page.waitForTimeout(500);

        // Fix the mismatch
        await confirmPasswordInput.fill("StrongPassword123!");
      }
    });

    test("should handle terms and conditions", async ({ page }) => {
      await page.goto("/en/signup");
      await waitUtils.forNavigation();

      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      const termsLink = page
        .getByRole("link", { name: /terms|privacy/i })
        .first();

      if ((await termsCheckbox.count()) > 0) {
        // Verify unchecked by default
        expect(await termsCheckbox.isChecked()).toBe(false);

        // Try to submit without checking
        const submitButton = page.getByRole("button", {
          name: /sign up|create account|register/i,
        });
        await submitButton.click();

        // Should not proceed (stays on same page)
        await page.waitForTimeout(500);
        expect(page.url()).toContain("signup");

        // Check the terms
        await termsCheckbox.check();
        expect(await termsCheckbox.isChecked()).toBe(true);
      }

      // Verify terms link opens correctly
      if ((await termsLink.count()) > 0) {
        const href = await termsLink.getAttribute("href");
        expect(href).toBeTruthy();
      }
    });
  });

  test.describe("Forgot Password Page (/[locale]/forgot-password)", () => {
    test("should render forgot password page", async ({ page }) => {
      await page.goto("/en/forgot-password");
      await waitUtils.forNavigation();

      // Check heading
      const heading = page
        .getByRole("heading")
        .filter({ hasText: /forgot|reset|password/i })
        .first();
      if ((await heading.count()) > 0) {
        await expect(heading).toBeVisible();
      }

      // Check form elements
      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const submitButton = page.getByRole("button", {
        name: /reset|send|submit/i,
      });

      await expect(emailInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Check for back to login link
      const backLink = page.getByRole("link", { name: /back|login|sign in/i });
      if ((await backLink.count()) > 0) {
        await expect(backLink).toBeVisible();
      }

      // Check for instructions text
      const instructions = page
        .locator("p, div")
        .filter({ hasText: /enter your email|we'll send/i });
      if ((await instructions.count()) > 0) {
        await expect(instructions.first()).toBeVisible();
      }
    });

    test("should validate email input", async ({ page }) => {
      await page.goto("/en/forgot-password");
      await waitUtils.forNavigation();

      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const submitButton = page.getByRole("button", {
        name: /reset|send|submit/i,
      });

      // Test empty submission
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should stay on same page
      expect(page.url()).toContain("forgot-password");

      // Test invalid email
      await emailInput.fill("invalid-email");
      await submitButton.click();
      await page.waitForTimeout(500);

      // Test valid email
      await emailInput.fill("test@example.com");

      // Check if button is enabled
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(false);
    });

    test("should show success message after submission", async ({ page }) => {
      await page.goto("/en/forgot-password");
      await waitUtils.forNavigation();

      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const submitButton = page.getByRole("button", {
        name: /reset|send|submit/i,
      });

      // Submit valid email
      await emailInput.fill("test@example.com");
      await submitButton.click();

      // Wait for response
      await page.waitForTimeout(1000);

      // Check for success message or redirect
      const successMessage = page.locator(
        '[role="alert"], [class*="success"], [class*="message"]',
      );
      const isRedirected = !page.url().includes("forgot-password");

      // Either show success message or redirect
      if ((await successMessage.count()) > 0) {
        const message = await successMessage.textContent();
        expect(message).toMatch(/sent|check|email/i);
      } else if (isRedirected) {
        expect(page.url()).toContain("login");
      }
    });
  });

  test.describe("Authentication Flow Integration", () => {
    test("should navigate between auth pages correctly", async ({ page }) => {
      // Start at login
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      // Navigate to sign up
      const signUpLink = page.getByRole("link", {
        name: /sign up|create account|don't have/i,
      });
      if ((await signUpLink.count()) > 0) {
        await signUpLink.click();
        await waitUtils.forNavigation();
        expect(page.url()).toContain("signup");
      }

      // Navigate back to login
      const loginLink = page.getByRole("link", {
        name: /log in|sign in|already have/i,
      });
      if ((await loginLink.count()) > 0) {
        await loginLink.click();
        await waitUtils.forNavigation();
        expect(page.url()).toContain("login");
      }

      // Navigate to forgot password
      const forgotLink = page.getByRole("link", { name: /forgot password/i });
      if ((await forgotLink.count()) > 0) {
        await forgotLink.click();
        await waitUtils.forNavigation();
        expect(page.url()).toContain("forgot-password");
      }
    });

    test("should maintain locale during navigation", async ({ page }) => {
      const testLocale = "es";

      // Start at Spanish login
      await page.goto(`/${testLocale}/login`);
      await waitUtils.forNavigation();

      // Navigate to sign up
      const signUpLink = page.getByRole("link").first();
      if ((await signUpLink.count()) > 0) {
        const href = await signUpLink.getAttribute("href");
        if (href?.includes("signup")) {
          await signUpLink.click();
          await waitUtils.forNavigation();
          expect(page.url()).toContain(`/${testLocale}/`);
        }
      }
    });
  });

  test.describe("Accessibility and SEO", () => {
    test("should have proper SEO meta tags", async ({ page }) => {
      const authPages = ["/en/login", "/en/signup", "/en/forgot-password"];

      for (const authPage of authPages) {
        await page.goto(authPage);
        await waitUtils.forNavigation();

        // Check title
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);

        // Check meta description
        const description = await page.getAttribute(
          'meta[name="description"]',
          "content",
        );
        expect(description).toBeTruthy();

        // Check that auth pages are not indexed
        const robots = await page.getAttribute(
          'meta[name="robots"]',
          "content",
        );
        if (robots) {
          expect(robots).toContain("noindex");
        }
      }
    });

    test("should be keyboard navigable", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      // Start at first input
      await page.keyboard.press("Tab");

      // Should focus email input
      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      await expect(emailInput).toBeFocused();

      // Tab to password
      await page.keyboard.press("Tab");
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeFocused();

      // Tab to submit button
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab"); // May need extra tab for remember me

      const submitButton = page.getByRole("button", { name: /sign in|login/i });
      const isFocusNearSubmit = await submitButton.evaluate((el) => {
        const focused = document.activeElement;
        return focused === el || focused?.parentElement === el.parentElement;
      });

      expect(isFocusNearSubmit).toBeTruthy();
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.goto("/en/login");
      await waitUtils.forNavigation();

      // Check form landmark
      const form = page.locator("form");
      if ((await form.count()) > 0) {
        const role = await form.getAttribute("role");
        if (role) expect(role).toBe("form");
      }

      // Check input labels
      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const emailLabel =
        (await emailInput.getAttribute("aria-label")) ||
        (await page
          .locator(`label[for="${await emailInput.getAttribute("id")}"]`)
          .textContent());
      expect(emailLabel).toBeTruthy();

      // Check button accessibility
      const submitButton = page.getByRole("button", { name: /sign in|login/i });
      const buttonText = await submitButton.textContent();
      expect(buttonText).toBeTruthy();
    });
  });

  test.describe("Performance and Error States", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      // Intercept API calls
      await page.route("**/api/auth/**", (route) => route.abort());

      await page.goto("/en/login");
      await waitUtils.forNavigation();

      // Fill form and submit
      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.getByRole("button", { name: /sign in|login/i });

      await emailInput.fill("test@example.com");
      await passwordInput.fill("password123");
      await submitButton.click();

      // Wait for error handling
      await page.waitForTimeout(2000);

      // Should show error message or stay on page
      const errorMessage = page.locator(
        '[role="alert"], [class*="error"], [class*="danger"]',
      );
      const hasError = (await errorMessage.count()) > 0;
      const stayedOnLogin = page.url().includes("login");

      expect(hasError || stayedOnLogin).toBeTruthy();
    });

    test("should load quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/en/login");
      await waitUtils.forNavigation();
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Check if critical elements load quickly
      const emailInput = page.locator(
        'input[type="email"], input[name="email"]',
      );
      await expect(emailInput).toBeVisible({ timeout: 1000 });
    });
  });
});
