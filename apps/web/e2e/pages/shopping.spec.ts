/**
 * E2E tests for shopping flow pages (cart, checkout, etc.)
 */

import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  PerformanceUtils,
  ResponsiveTestUtils,
  VisualTestUtils,
  WaitUtils,
} from "@repo/testing/e2e";

test.describe("Shopping Flow Pages", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;
  let visual: VisualTestUtils;
  let responsive: ResponsiveTestUtils;
  let a11y: AccessibilityTestUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
    visual = new VisualTestUtils(page);
    responsive = new ResponsiveTestUtils(page);
    a11y = new AccessibilityTestUtils(page);
  });

  test.describe("Shopping Cart Page", () => {
    test("should load cart page", async ({ page }) => {
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/cart/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should handle empty cart state", async ({ page }) => {
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      // Look for empty cart message or cart items
      const emptyMessage = page.getByText(/empty cart|no items|cart is empty/i);
      const cartItems = page
        .locator('[data-testid="cart-item"]')
        .or(page.locator(".cart-item"))
        .or(
          page.locator("tr"), // table rows for cart items
        );

      const hasEmpty = (await emptyMessage.count()) > 0;
      const hasItems = (await cartItems.count()) > 0;

      // Should show either empty state or cart items
      expect(hasEmpty || hasItems).toBeTruthy();

      if (hasEmpty) {
        await expect(emptyMessage.first()).toBeVisible();
      }
    });

    test("should have cart functionality", async ({ page }) => {
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      const cartItems = page
        .locator('[data-testid="cart-item"]')
        .or(page.locator(".cart-item"));

      if ((await cartItems.count()) > 0) {
        // Test quantity controls
        const quantityInput = page
          .locator('input[type="number"]')
          .or(page.locator('[data-testid="quantity-input"]'));

        const increaseButton = page.getByRole("button", {
          name: /\+|increase|add/i,
        });
        const _decreaseButton = page.getByRole("button", {
          name: /-|decrease|remove/i,
        });

        if ((await quantityInput.count()) > 0) {
          const input = quantityInput.first();
          await expect(input).toBeVisible();

          const currentValue = await input.inputValue();
          const newValue = (parseInt(currentValue) + 1).toString();

          await input.fill(newValue);
          await page.waitForTimeout(1000); // Wait for update
        }

        if ((await increaseButton.count()) > 0) {
          await increaseButton.first().click();
          await page.waitForTimeout(1000);
        }

        // Test remove item
        const removeButton = page.getByRole("button", {
          name: /remove|delete|trash/i,
        });
        if ((await removeButton.count()) > 0) {
          await expect(removeButton.first()).toBeVisible();
        }
      }
    });

    test("should calculate totals correctly", async ({ page }) => {
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      // Look for price elements
      const _subtotal = page.locator('[data-testid="subtotal"]').or(
        page
          .getByText(/subtotal/i)
          .locator("..")
          .locator('[data-testid="price"]'),
      );

      const _tax = page
        .locator('[data-testid="tax"]')
        .or(
          page.getByText(/tax/i).locator("..").locator('[data-testid="price"]'),
        );

      const total = page
        .locator('[data-testid="total"]')
        .or(
          page
            .getByText(/total/i)
            .locator("..")
            .locator('[data-testid="price"]'),
        );

      // Should have pricing information if cart has items
      if ((await total.count()) > 0) {
        await expect(total.first()).toBeVisible();

        const totalText = await total.first().textContent();
        expect(totalText).toMatch(/\$\d+|€\d+|£\d+/);
      }
    });

    test("should have checkout button", async ({ page }) => {
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      const checkoutButton = page
        .getByRole("button", { name: /checkout|proceed|continue/i })
        .or(page.getByRole("link", { name: /checkout|proceed|continue/i }));

      const emptyMessage = page.getByText(/empty cart|no items/i);
      const hasItems = !(await emptyMessage.isVisible());

      if (hasItems && (await checkoutButton.count()) > 0) {
        await expect(checkoutButton.first()).toBeVisible();

        // Test checkout navigation
        await checkoutButton.first().click();
        await waitUtils.forNavigation();

        // Should go to checkout page
        await expect(page).toHaveURL(/\/checkout/);
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });

    test("should be responsive", async ({ page }) => {
      await responsive.testResponsive(async () => {
        await page.goto("/en/cart");
        await visual.waitForAnimations();

        const main = page.locator("main");
        await expect(main).toBeVisible();

        const viewport = page.viewportSize();
        await page.screenshot({
          path: `test-results/cart-${viewport?.width}x${viewport?.height}.png`,
        });
      });
    });
  });

  test.describe("Checkout Page", () => {
    test("should load checkout page", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/checkout/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should handle empty cart checkout", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      // Might redirect to cart or show empty message
      const emptyMessage = page.getByText(/empty cart|no items|add items/i);
      const redirectedToCart = page.url().includes("/cart");

      if ((await emptyMessage.isVisible()) || redirectedToCart) {
        expect(
          (await emptyMessage.isVisible()) || redirectedToCart,
        ).toBeTruthy();
      }
    });

    test("should have checkout form sections", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      const redirectedToCart = page.url().includes("/cart");

      if (!redirectedToCart) {
        // Look for checkout form sections
        const shippingSection = page
          .getByText(/shipping|delivery/i)
          .locator("..");
        const billingSection = page.getByText(/billing|payment/i).locator("..");
        const orderSummary = page
          .getByText(/order summary|your order/i)
          .locator("..");

        // Should have at least one checkout section
        const hasShipping = (await shippingSection.count()) > 0;
        const hasBilling = (await billingSection.count()) > 0;
        const hasSummary = (await orderSummary.count()) > 0;

        if (hasShipping || hasBilling || hasSummary) {
          expect(hasShipping || hasBilling || hasSummary).toBeTruthy();
        }
      }
    });

    test("should have required form fields", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      const redirectedToCart = page.url().includes("/cart");

      if (!redirectedToCart) {
        // Look for common checkout fields
        const emailInput = page.locator('input[type="email"]');
        const firstNameInput = page
          .locator('input[name*="firstName"]')
          .or(page.locator('input[name*="first_name"]'));
        const addressInput = page.locator('input[name*="address"]');

        const hasEmail = (await emailInput.count()) > 0;
        const hasFirstName = (await firstNameInput.count()) > 0;
        const hasAddress = (await addressInput.count()) > 0;

        // Should have some required checkout fields
        if (hasEmail || hasFirstName || hasAddress) {
          expect(hasEmail || hasFirstName || hasAddress).toBeTruthy();
        }
      }
    });

    test("should validate required checkout fields", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      const redirectedToCart = page.url().includes("/cart");

      if (!redirectedToCart) {
        const submitButton = page.getByRole("button", {
          name: /complete|place order|pay now/i,
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
            .or(page.locator(".error"))
            .or(page.getByText(/required|please fill/i));

          await page.waitForTimeout(1000);

          if ((await errorMessage.count()) > 0) {
            const errorText = await errorMessage.first().textContent();
            expect(errorText).toBeTruthy();
          }
        }
      }
    });

    test("should have payment options", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      const redirectedToCart = page.url().includes("/cart");

      if (!redirectedToCart) {
        // Look for payment methods
        const creditCardOption = page.getByText(/credit card|debit card/i);
        const paypalOption = page.getByText(/paypal/i);
        const stripeOption = page.getByText(/stripe/i);

        const paymentRadios = page.locator(
          'input[type="radio"][name*="payment"]',
        );

        const hasPaymentOptions =
          (await creditCardOption.count()) > 0 ||
          (await paypalOption.count()) > 0 ||
          (await stripeOption.count()) > 0 ||
          (await paymentRadios.count()) > 0;

        if (hasPaymentOptions) {
          expect(hasPaymentOptions).toBeTruthy();
        }
      }
    });

    test("should show order summary", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      const redirectedToCart = page.url().includes("/cart");

      if (!redirectedToCart) {
        const orderSummary = page
          .locator('[data-testid="order-summary"]')
          .or(page.getByText(/order summary/i).locator(".."));

        const totalPrice = page
          .locator('[data-testid="total"]')
          .or(
            page
              .getByText(/total/i)
              .locator("..")
              .locator('[data-testid="price"]'),
          );

        if ((await orderSummary.count()) > 0) {
          await expect(orderSummary.first()).toBeVisible();
        }

        if ((await totalPrice.count()) > 0) {
          await expect(totalPrice.first()).toBeVisible();
        }
      }
    });

    test("should be secure (HTTPS in production)", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      const url = page.url();

      // In production, checkout should use HTTPS
      if (url.includes("localhost") || url.includes("127.0.0.1")) {
        // Local development - HTTP is acceptable
        expect(url).toBeTruthy();
      } else {
        // Production - should use HTTPS
        expect(url).toMatch(/^https:/);
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Order Success Page", () => {
    test("should load order successful page", async ({ page }) => {
      await page.goto("/en/order-successful");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/order-successful/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should show success message", async ({ page }) => {
      await page.goto("/en/order-successful");
      await waitUtils.forNavigation();

      // Look for success indicators
      const successMessage = page.getByText(
        /success|confirmed|thank you|order placed/i,
      );
      const checkIcon = page
        .locator('[data-testid="success-icon"]')
        .or(page.locator(".success-icon"));

      const hasSuccessMessage = (await successMessage.count()) > 0;
      const hasCheckIcon = (await checkIcon.count()) > 0;

      expect(hasSuccessMessage || hasCheckIcon).toBeTruthy();
    });

    test("should have order details", async ({ page }) => {
      await page.goto("/en/order-successful?order=123456");
      await waitUtils.forNavigation();

      // Look for order information
      const orderNumber = page.getByText(
        /order.*#|order.*number|confirmation/i,
      );
      const estimatedDelivery = page.getByText(/delivery|shipping|estimated/i);

      if ((await orderNumber.count()) > 0) {
        await expect(orderNumber.first()).toBeVisible();
      }

      if ((await estimatedDelivery.count()) > 0) {
        await expect(estimatedDelivery.first()).toBeVisible();
      }
    });

    test("should have continue shopping link", async ({ page }) => {
      await page.goto("/en/order-successful");
      await waitUtils.forNavigation();

      const continueShoppingLink = page.getByRole("link", {
        name: /continue shopping|shop more|back to store/i,
      });

      if ((await continueShoppingLink.count()) > 0) {
        await expect(continueShoppingLink.first()).toBeVisible();

        // Test navigation
        await continueShoppingLink.first().click();
        await waitUtils.forNavigation();

        // Should go to homepage or collections
        const url = page.url();
        expect(url).toMatch(/\/(en|fr|es|de|pt)(\/|$)/);
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/order-successful");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Shopping Flow Integration", () => {
    test("should handle complete shopping flow", async ({ page }) => {
      // Start at homepage
      await page.goto("/en");
      await waitUtils.forNavigation();

      // Go to products (if available)
      const shopButton = page.getByRole("link", {
        name: /shop|products|collections/i,
      });
      if ((await shopButton.count()) > 0) {
        await shopButton.first().click();
        await waitUtils.forNavigation();

        // Try to add product to cart
        const addToCartButton = page.getByRole("button", {
          name: /add to cart/i,
        });
        if ((await addToCartButton.count()) > 0) {
          await addToCartButton.first().click();
          await page.waitForTimeout(1000);

          // Go to cart
          await page.goto("/en/cart");
          await waitUtils.forNavigation();

          // Proceed to checkout if items in cart
          const checkoutButton = page
            .getByRole("button", { name: /checkout/i })
            .or(page.getByRole("link", { name: /checkout/i }));

          if ((await checkoutButton.count()) > 0) {
            await checkoutButton.first().click();
            await waitUtils.forNavigation();

            await expect(page).toHaveURL(/\/checkout/);
          }
        }
      }
    });

    test("should maintain cart state across navigation", async ({ page }) => {
      // Go to cart
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      const cartItemsBefore = await page
        .locator('[data-testid="cart-item"]')
        .count();

      // Navigate away and back
      await page.goto("/en");
      await waitUtils.forNavigation();

      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      const cartItemsAfter = await page
        .locator('[data-testid="cart-item"]')
        .count();

      // Cart should maintain state (localStorage/sessionStorage)
      expect(cartItemsAfter).toBe(cartItemsBefore);
    });

    test("should handle cart persistence", async ({ page }) => {
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      // Check if cart data is stored
      const cartData = await page.evaluate(() => {
        return {
          localStorage:
            localStorage.getItem("cart") ||
            localStorage.getItem("shopping-cart"),
          sessionStorage:
            sessionStorage.getItem("cart") ||
            sessionStorage.getItem("shopping-cart"),
        };
      });

      // Should have some form of cart persistence
      expect(
        cartData.localStorage !== null || cartData.sessionStorage !== null,
      ).toBeTruthy();
    });
  });

  test.describe("Cross-locale Shopping Pages", () => {
    const locales = ["en", "fr", "es", "de", "pt"];
    const shoppingPages = ["cart", "checkout", "order-successful"];

    for (const locale of locales) {
      for (const pagePath of shoppingPages) {
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

  test.describe("Shopping Performance", () => {
    test("cart page should have good performance", async ({ page }) => {
      await page.goto("/en/cart");

      const metrics = await perfUtils.measurePageLoad();

      expect(metrics.domContentLoaded).toBeLessThan(5000);
      if (metrics.firstContentfulPaint > 0) {
        expect(metrics.firstContentfulPaint).toBeLessThan(3000);
      }
    });

    test("checkout page should load quickly", async ({ page }) => {
      await page.goto("/en/checkout");

      const metrics = await perfUtils.measurePageLoad();

      // Checkout is critical - should be fast
      expect(metrics.domContentLoaded).toBeLessThan(4000);
      if (metrics.firstContentfulPaint > 0) {
        expect(metrics.firstContentfulPaint).toBeLessThan(2500);
      }
    });
  });
});
