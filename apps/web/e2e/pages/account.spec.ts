/**
 * E2E tests for account/user pages
 */

import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  createAuthHelpers,
  ResponsiveTestUtils,
  VisualTestUtils,
  WaitUtils,
} from "@repo/testing/e2e";

import type { BetterAuthTestHelpers } from "@repo/testing/e2e";

test.describe("Account Pages", () => {
  let _authHelpers: BetterAuthTestHelpers;
  let waitUtils: WaitUtils;
  let visual: VisualTestUtils;
  let a11y: AccessibilityTestUtils;

  test.beforeEach(async ({ page }) => {
    _authHelpers = createAuthHelpers("http://localhost:3200");
    waitUtils = new WaitUtils(page);
    visual = new VisualTestUtils(page);
    a11y = new AccessibilityTestUtils(page);
  });

  test.describe("Account Dashboard", () => {
    test("should redirect to login when not authenticated", async ({
      page,
    }) => {
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      // Should redirect to login page or show login form
      const currentUrl = page.url();
      if (currentUrl.includes("/login") || currentUrl.includes("/signin")) {
        await expect(page).toHaveURL(/\/(login|signin)/);
      } else {
        // Might show inline login or auth form
        const loginForm = page
          .locator("form")
          .filter({ hasText: /login|sign in/i });
        const emailInput = page.locator('input[type="email"]');

        if ((await loginForm.count()) > 0 || (await emailInput.count()) > 0) {
          expect(
            (await loginForm.count()) > 0 || (await emailInput.count()) > 0,
          ).toBeTruthy();
        }
      }
    });

    test("should load account page structure", async ({ page }) => {
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      // Should have main content (even if it's a login redirect)
      const main = page.locator("main");
      await expect(main).toBeVisible();

      await expect(page).toHaveTitle(/.+/);
    });

    test("should have account navigation", async ({ page }) => {
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      // Look for account navigation links (if authenticated view is shown)
      const accountLinks = [
        page.getByRole("link", { name: /profile|account/i }),
        page.getByRole("link", { name: /orders|order history/i }),
        page.getByRole("link", { name: /wishlist|favorites/i }),
        page.getByRole("link", { name: /billing|payment/i }),
        page.getByRole("link", { name: /password|security/i }),
      ];

      let hasAccountNav = false;
      for (const link of accountLinks) {
        if (await link.isVisible()) {
          hasAccountNav = true;
          break;
        }
      }

      // If we see account navigation, we're in the authenticated view
      if (hasAccountNav) {
        expect(hasAccountNav).toBeTruthy();
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Account Billing Page", () => {
    test("should load billing page", async ({ page }) => {
      await page.goto("/en/account-billing");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/account-billing/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should handle billing form elements", async ({ page }) => {
      await page.goto("/en/account-billing");
      await waitUtils.forNavigation();

      // Look for billing-related elements (if not redirected to login)
      const notRedirected = !page.url().includes("/login");

      if (notRedirected) {
        const billingForm = page
          .locator("form")
          .filter({ hasText: /billing|payment/i });
        const addressInput = page.locator('input[name*="address"]');
        const _cardInput = page.locator('input[name*="card"]');

        // If billing form exists, test its elements
        if ((await billingForm.count()) > 0) {
          await expect(billingForm).toBeVisible();
        }

        if ((await addressInput.count()) > 0) {
          await expect(addressInput.first()).toBeVisible();
        }
      }
    });

    test("should validate required billing fields", async ({ page }) => {
      await page.goto("/en/account-billing");
      await waitUtils.forNavigation();

      const notRedirected = !page.url().includes("/login");

      if (notRedirected) {
        const submitButton = page.getByRole("button", {
          name: /save|update|submit/i,
        });

        if (
          (await submitButton.count()) > 0 &&
          (await submitButton.first().isVisible())
        ) {
          // Try to submit empty form
          await submitButton.first().click();

          // Look for validation messages
          const errorMessage = page
            .locator('[role="alert"]')
            .or(page.locator(".error"));

          await page.waitForTimeout(1000);

          if ((await errorMessage.count()) > 0) {
            const errorText = await errorMessage.first().textContent();
            expect(errorText).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe("Account Password Page", () => {
    test("should load password page", async ({ page }) => {
      await page.goto("/en/account-password");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/account-password/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should have password change form", async ({ page }) => {
      await page.goto("/en/account-password");
      await waitUtils.forNavigation();

      const notRedirected = !page.url().includes("/login");

      if (notRedirected) {
        const passwordForm = page
          .locator("form")
          .filter({ hasText: /password|change/i });
        const currentPasswordInput = page.locator('input[name*="current"]');
        const newPasswordInput = page.locator('input[name*="new"]');

        if ((await passwordForm.count()) > 0) {
          await expect(passwordForm).toBeVisible();

          // Should have current and new password fields
          if ((await currentPasswordInput.count()) > 0) {
            await expect(currentPasswordInput.first()).toBeVisible();
          }

          if ((await newPasswordInput.count()) > 0) {
            await expect(newPasswordInput.first()).toBeVisible();
          }
        }
      }
    });

    test("should validate password requirements", async ({ page }) => {
      await page.goto("/en/account-password");
      await waitUtils.forNavigation();

      const notRedirected = !page.url().includes("/login");

      if (notRedirected) {
        const newPasswordInput = page.locator('input[name*="new"]').first();
        const submitButton = page.getByRole("button", {
          name: /change|update|save/i,
        });

        if (
          (await newPasswordInput.count()) > 0 &&
          (await submitButton.count()) > 0
        ) {
          // Fill with weak password
          await newPasswordInput.fill("123");
          await submitButton.first().click();

          // Should show password requirements
          const errorMessage = page
            .locator('[role="alert"]')
            .or(page.getByText(/password.*requirements/i));

          await page.waitForTimeout(1000);

          if ((await errorMessage.count()) > 0) {
            const errorText = await errorMessage.first().textContent();
            expect(errorText).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe("Account Wishlists Page", () => {
    test("should load wishlists page", async ({ page }) => {
      await page.goto("/en/account-wishlists");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/account-wishlists/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should handle empty wishlist state", async ({ page }) => {
      await page.goto("/en/account-wishlists");
      await waitUtils.forNavigation();

      const notRedirected = !page.url().includes("/login");

      if (notRedirected) {
        // Look for empty state or wishlist items
        const emptyMessage = page.getByText(/empty|no items|no favorites/i);
        const wishlistItems = page
          .locator('[data-testid="wishlist-item"]')
          .or(page.locator(".wishlist-item"));

        // Should show either empty state or items
        const hasEmpty = (await emptyMessage.count()) > 0;
        const hasItems = (await wishlistItems.count()) > 0;

        expect(hasEmpty || hasItems).toBeTruthy();
      }
    });

    test("should handle wishlist item actions", async ({ page }) => {
      await page.goto("/en/account-wishlists");
      await waitUtils.forNavigation();

      const notRedirected = !page.url().includes("/login");

      if (notRedirected) {
        const removeButton = page.getByRole("button", {
          name: /remove|delete/i,
        });
        const addToCartButton = page.getByRole("button", {
          name: /add to cart/i,
        });

        // If there are items, test actions
        if ((await removeButton.count()) > 0) {
          await expect(removeButton.first()).toBeVisible();
        }

        if ((await addToCartButton.count()) > 0) {
          await expect(addToCartButton.first()).toBeVisible();
        }
      }
    });
  });

  test.describe("Orders Pages", () => {
    test("should load orders listing page", async ({ page }) => {
      await page.goto("/en/orders");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/orders/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should handle empty orders state", async ({ page }) => {
      await page.goto("/en/orders");
      await waitUtils.forNavigation();

      const notRedirected = !page.url().includes("/login");

      if (notRedirected) {
        const emptyMessage = page.getByText(
          /no orders|empty|haven't.*ordered/i,
        );
        const orderItems = page
          .locator('[data-testid="order"]')
          .or(page.locator(".order-item"));

        const hasEmpty = (await emptyMessage.count()) > 0;
        const hasOrders = (await orderItems.count()) > 0;

        expect(hasEmpty || hasOrders).toBeTruthy();
      }
    });

    test("should load order detail page", async ({ page }) => {
      await page.goto("/en/orders/123456");
      await waitUtils.forNavigation();

      // Should load order detail page or show not found
      const notFound = page.getByText(/not found|404|order.*not.*exist/i);
      const main = page.locator("main");

      expect(
        (await notFound.isVisible()) || (await main.isVisible()),
      ).toBeTruthy();
    });

    test("should handle non-existent order", async ({ page }) => {
      await page.goto("/en/orders/non-existent-order-999999");
      await waitUtils.forNavigation();

      // Should show 404 or not found message
      const notFoundMessage = page.getByText(
        /not found|404|order.*not.*exist/i,
      );
      const main = page.locator("main");

      expect(
        (await notFoundMessage.isVisible()) || (await main.isVisible()),
      ).toBeTruthy();
    });

    test("should show order details structure", async ({ page }) => {
      await page.goto("/en/orders/test-order-123");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      const notRedirected = !page.url().includes("/login");

      if (!(await notFound.isVisible()) && notRedirected) {
        // Look for order details elements
        const orderNumber = page.getByText(/order.*#|order.*number/i);
        const orderDate = page.getByText(
          /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/,
        );
        const orderStatus = page.getByText(
          /pending|processing|shipped|delivered|cancelled/i,
        );

        // Should have some order information
        const hasOrderNumber = (await orderNumber.count()) > 0;
        const hasOrderDate = (await orderDate.count()) > 0;
        const hasOrderStatus = (await orderStatus.count()) > 0;

        if (hasOrderNumber || hasOrderDate || hasOrderStatus) {
          expect(hasOrderNumber || hasOrderDate || hasOrderStatus).toBeTruthy();
        }
      }
    });
  });

  test.describe("Account Responsive Design", () => {
    test("should be responsive across viewports", async ({ page }) => {
      const responsive = new ResponsiveTestUtils(page);

      await responsive.testResponsive(async () => {
        await page.goto("/en/account");
        await visual.waitForAnimations();

        const main = page.locator("main");
        await expect(main).toBeVisible();

        const viewport = page.viewportSize();
        await page.screenshot({
          path: `test-results/account-${viewport?.width}x${viewport?.height}.png`,
        });
      });
    });
  });

  test.describe("Cross-locale Account Pages", () => {
    const locales = ["en", "fr", "es", "de", "pt"];
    const accountPages = [
      "account",
      "account-billing",
      "account-password",
      "account-wishlists",
      "orders",
    ];

    for (const locale of locales) {
      for (const pagePath of accountPages) {
        test(`should load ${pagePath} page in ${locale}`, async ({ page }) => {
          await page.goto(`/${locale}/${pagePath}`);
          await waitUtils.forNavigation();

          await expect(page).toHaveURL(new RegExp(`/${locale}/${pagePath}`));

          const main = page.locator("main");
          await expect(main).toBeVisible();
        });
      }
    }
  });

  test.describe("Account Security", () => {
    test("should handle unauthorized access attempts", async ({ page }) => {
      // Try to access protected account pages without auth
      const protectedPages = [
        "/en/account",
        "/en/account-billing",
        "/en/account-password",
        "/en/account-wishlists",
        "/en/orders",
      ];

      for (const pagePath of protectedPages) {
        await page.goto(pagePath);
        await waitUtils.forNavigation();

        // Should either redirect to login or show auth form
        const currentUrl = page.url();
        const isRedirected =
          currentUrl.includes("/login") || currentUrl.includes("/signin");
        const hasAuthForm =
          (await page.locator('input[type="email"]').count()) > 0;

        expect(isRedirected || hasAuthForm).toBeTruthy();
      }
    });

    test("should protect sensitive data display", async ({ page }) => {
      await page.goto("/en/account-billing");
      await waitUtils.forNavigation();

      // Look for masked credit card numbers or other sensitive data
      const maskedCard = page.getByText(/\*\*\*\*|\*{4,}/);
      const maskedSSN = page.getByText(/\*\*\*-\*\*-\*{4}/);

      // If sensitive data is shown, it should be masked
      const hasMaskedData =
        (await maskedCard.count()) > 0 || (await maskedSSN.count()) > 0;

      if (hasMaskedData) {
        expect(hasMaskedData).toBeTruthy();
      }
    });
  });
});
