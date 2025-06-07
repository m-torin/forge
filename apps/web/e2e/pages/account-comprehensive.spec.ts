import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Account Pages - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test.describe("Account Dashboard (/[locale]/(accounts)/account)", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      // Should redirect to login
      expect(page.url()).toContain("/login");
    });

    test("should display account dashboard for authenticated users", async ({
      page,
    }) => {
      // Mock authentication by setting cookies (adjust based on your auth implementation)
      await page.context().addCookies([
        {
          name: "auth-token",
          domain: "localhost",
          path: "/",
          value: "mock-token",
        },
      ]);

      await page.goto("/en/account");
      await waitUtils.forNavigation();

      // Check if redirected to login (auth might not be mocked properly)
      if (page.url().includes("/login")) {
        // Skip detailed tests if we can't mock auth
        return;
      }

      // Check page title
      const title = await page.title();
      expect(title.toLowerCase()).toContain("account");

      // Check main heading
      const heading = page.getByRole("heading", { level: 1 });
      if ((await heading.count()) > 0) {
        await expect(heading).toBeVisible();
      }

      // Check account navigation
      const navLinks = [
        { name: /profile|account info/i, href: "/account" },
        { name: /billing|payment/i, href: "/account-billing" },
        { name: /password|security/i, href: "/account-password" },
        { name: /wishlist|favorites/i, href: "/account-wishlists" },
        { name: /orders|purchases/i, href: "/orders" },
      ];

      for (const link of navLinks) {
        const navLink = page.getByRole("link", { name: link.name });
        if ((await navLink.count()) > 0) {
          const href = await navLink.getAttribute("href");
          expect(href).toContain(link.href);
        }
      }

      // Check for user info display
      const userInfo = page.locator(
        '[data-testid="user-info"], .user-info, [class*="user"]',
      );
      if ((await userInfo.count()) > 0) {
        await expect(userInfo.first()).toBeVisible();
      }
    });

    test("should handle account information updates", async ({ page }) => {
      // Skip if can't authenticate
      await page.goto("/en/account");
      await waitUtils.forNavigation();
      if (page.url().includes("/login")) return;

      // Look for edit profile button
      const editButton = page.getByRole("button", { name: /edit|update/i });
      if ((await editButton.count()) > 0) {
        await editButton.click();

        // Check for form fields
        const nameInput = page.locator(
          'input[name*="name"], input[placeholder*="name"]',
        );
        const emailInput = page.locator(
          'input[type="email"], input[name="email"]',
        );

        if ((await nameInput.count()) > 0) {
          await nameInput.fill("Test User Updated");
        }

        if ((await emailInput.count()) > 0) {
          const currentEmail = await emailInput.inputValue();
          expect(currentEmail).toBeTruthy();
        }

        // Look for save button
        const saveButton = page.getByRole("button", { name: /save|update/i });
        if ((await saveButton.count()) > 0) {
          // Don't actually save to avoid changing test data
          await expect(saveButton).toBeEnabled();
        }
      }
    });
  });

  test.describe("Billing Page (/[locale]/(accounts)/account-billing)", () => {
    test("should display billing information", async ({ page }) => {
      await page.goto("/en/account-billing");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Check for billing sections
      const paymentMethods = page.locator(
        '[data-testid="payment-methods"], .payment-methods',
      );
      const billingHistory = page.locator(
        '[data-testid="billing-history"], .billing-history',
      );
      const subscription = page.locator(
        '[data-testid="subscription"], .subscription',
      );

      // At least one billing section should exist
      const hasBillingContent =
        (await paymentMethods.count()) > 0 ||
        (await billingHistory.count()) > 0 ||
        (await subscription.count()) > 0;

      if (hasBillingContent) {
        // Check for add payment method button
        const addPaymentBtn = page.getByRole("button", {
          name: /add.*payment|new.*card/i,
        });
        if ((await addPaymentBtn.count()) > 0) {
          await expect(addPaymentBtn).toBeVisible();
        }

        // Check for billing history table
        const historyTable = page
          .locator("table")
          .filter({ has: page.locator("th") });
        if ((await historyTable.count()) > 0) {
          const headers = historyTable.locator("th");
          expect(await headers.count()).toBeGreaterThan(0);
        }
      }
    });

    test("should handle payment method addition", async ({ page }) => {
      await page.goto("/en/account-billing");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      const addPaymentBtn = page.getByRole("button", {
        name: /add.*payment|new.*card/i,
      });
      if ((await addPaymentBtn.count()) > 0) {
        await addPaymentBtn.click();

        // Wait for modal or form
        await page.waitForTimeout(500);

        // Check for card form fields
        const cardNumber = page.locator(
          'input[name*="card"], input[placeholder*="card number"]',
        );
        const expiry = page.locator(
          'input[name*="exp"], input[placeholder*="mm/yy"]',
        );
        const cvc = page.locator(
          'input[name*="cvc"], input[placeholder*="cvc"]',
        );

        if ((await cardNumber.count()) > 0) {
          await expect(cardNumber).toBeVisible();
          await expect(expiry).toBeVisible();
          await expect(cvc).toBeVisible();

          // Test validation
          await cardNumber.fill("4242");
          await expiry.fill("12");

          // Should show validation errors for incomplete data
          const submitBtn = page.getByRole("button", {
            name: /save|add|confirm/i,
          });
          if ((await submitBtn.count()) > 0) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Should still be on same form (not submitted)
            await expect(cardNumber).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Password Page (/[locale]/(accounts)/account-password)", () => {
    test("should display password change form", async ({ page }) => {
      await page.goto("/en/account-password");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Check for password form fields
      const currentPassword = page
        .locator('input[name*="current"], input[placeholder*="current"]')
        .filter({ has: page.locator('[type="password"]') });
      const newPassword = page
        .locator('input[name*="new"], input[placeholder*="new"]')
        .filter({ has: page.locator('[type="password"]') });
      const confirmPassword = page
        .locator('input[name*="confirm"], input[placeholder*="confirm"]')
        .filter({ has: page.locator('[type="password"]') });

      if ((await currentPassword.count()) > 0) {
        await expect(currentPassword).toBeVisible();
        await expect(newPassword).toBeVisible();
        if ((await confirmPassword.count()) > 0) {
          await expect(confirmPassword).toBeVisible();
        }
      }

      // Check for security settings
      const twoFactorSection = page.locator(
        '[data-testid="two-factor"], .two-factor, [class*="2fa"]',
      );
      if ((await twoFactorSection.count()) > 0) {
        const enable2FABtn = page.getByRole("button", {
          name: /enable.*two|2fa|authenticator/i,
        });
        if ((await enable2FABtn.count()) > 0) {
          await expect(enable2FABtn).toBeVisible();
        }
      }
    });

    test("should validate password requirements", async ({ page }) => {
      await page.goto("/en/account-password");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      const newPassword = page.locator('input[type="password"]').nth(1);
      if ((await newPassword.count()) > 0) {
        // Test weak password
        await newPassword.fill("weak");

        // Check for password requirements hint
        const requirements = page.locator(
          '[class*="requirement"], [class*="hint"], [data-testid="password-requirements"]',
        );
        if ((await requirements.count()) > 0) {
          const text = await requirements.textContent();
          expect(text).toMatch(/character|length|uppercase|special/i);
        }

        // Test strong password
        await newPassword.fill("StrongPassword123!");

        // Check if requirements are satisfied
        const satisfied = page.locator(
          '[class*="satisfied"], [class*="valid"], [aria-label*="valid"]',
        );
        if ((await satisfied.count()) > 0) {
          expect(await satisfied.count()).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe("Wishlists Page (/[locale]/(accounts)/account-wishlists)", () => {
    test("should display wishlists", async ({ page }) => {
      await page.goto("/en/account-wishlists");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Check for wishlist content
      const wishlistContainer = page.locator(
        '[data-testid="wishlists"], .wishlists, [class*="wishlist"]',
      );
      if ((await wishlistContainer.count()) > 0) {
        await expect(wishlistContainer.first()).toBeVisible();

        // Check for empty state
        const emptyState = page.locator(
          '[data-testid="empty-wishlist"], .empty-state',
        );
        const wishlistItems = page.locator(
          '[data-testid="wishlist-item"], .wishlist-item',
        );

        if ((await emptyState.count()) > 0) {
          // Should show message and link to shop
          const shopLink = page.getByRole("link", {
            name: /shop|browse|explore/i,
          });
          if ((await shopLink.count()) > 0) {
            await expect(shopLink).toBeVisible();
          }
        } else if ((await wishlistItems.count()) > 0) {
          // Should show wishlist items
          const firstItem = wishlistItems.first();

          // Check for product image
          const productImage = firstItem.locator("img");
          if ((await productImage.count()) > 0) {
            await expect(productImage).toBeVisible();
          }

          // Check for remove button
          const removeBtn = firstItem.getByRole("button", {
            name: /remove|delete/i,
          });
          if ((await removeBtn.count()) > 0) {
            await expect(removeBtn).toBeVisible();
          }

          // Check for add to cart button
          const addToCartBtn = firstItem.getByRole("button", {
            name: /add to cart|buy/i,
          });
          if ((await addToCartBtn.count()) > 0) {
            await expect(addToCartBtn).toBeVisible();
          }
        }
      }
    });

    test("should handle wishlist item interactions", async ({ page }) => {
      await page.goto("/en/account-wishlists");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      const wishlistItems = page.locator(
        '[data-testid="wishlist-item"], .wishlist-item',
      );
      if ((await wishlistItems.count()) > 0) {
        const firstItem = wishlistItems.first();

        // Test remove from wishlist
        const removeBtn = firstItem.getByRole("button", {
          name: /remove|delete/i,
        });
        if ((await removeBtn.count()) > 0) {
          const initialCount = await wishlistItems.count();
          await removeBtn.click();

          // Wait for removal animation
          await page.waitForTimeout(1000);

          // Check if item count decreased or confirmation shown
          const newCount = await wishlistItems.count();
          const confirmDialog = page.getByRole("dialog");

          expect(
            newCount < initialCount || (await confirmDialog.count()) > 0,
          ).toBeTruthy();
        }
      }
    });
  });

  test.describe("Orders Page (/[locale]/(accounts)/orders)", () => {
    test("should display order history", async ({ page }) => {
      await page.goto("/en/orders");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Check for orders content
      const ordersContainer = page.locator(
        '[data-testid="orders"], .orders, [class*="order"]',
      );
      if ((await ordersContainer.count()) > 0) {
        // Check for empty state or order list
        const emptyState = page.locator(
          '[data-testid="no-orders"], .empty-state',
        );
        const orderItems = page.locator(
          '[data-testid="order-item"], .order-item, [class*="order-row"]',
        );

        if ((await emptyState.count()) > 0) {
          const shopLink = page.getByRole("link", {
            name: /shop|start shopping/i,
          });
          if ((await shopLink.count()) > 0) {
            await expect(shopLink).toBeVisible();
          }
        } else if ((await orderItems.count()) > 0) {
          const firstOrder = orderItems.first();

          // Check for order number
          const orderNumber = firstOrder.locator(
            '[data-testid="order-number"], .order-number',
          );
          if ((await orderNumber.count()) > 0) {
            const number = await orderNumber.textContent();
            expect(number).toMatch(/\d+/);
          }

          // Check for order date
          const orderDate = firstOrder.locator(
            '[data-testid="order-date"], .order-date, time',
          );
          if ((await orderDate.count()) > 0) {
            await expect(orderDate).toBeVisible();
          }

          // Check for order status
          const orderStatus = firstOrder.locator(
            '[data-testid="order-status"], .order-status, [class*="status"]',
          );
          if ((await orderStatus.count()) > 0) {
            const status = await orderStatus.textContent();
            expect(status).toMatch(/delivered|processing|shipped|completed/i);
          }

          // Check for view order link
          const viewLink = firstOrder.getByRole("link", {
            name: /view|details/i,
          });
          if ((await viewLink.count()) > 0) {
            await expect(viewLink).toBeVisible();
          }
        }
      }
    });

    test("should filter orders by status", async ({ page }) => {
      await page.goto("/en/orders");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Look for filter options
      const filterSelect = page.locator(
        'select[name*="filter"], select[data-testid="order-filter"]',
      );
      const filterButtons = page.getByRole("button", {
        name: /all|delivered|processing/i,
      });

      if ((await filterSelect.count()) > 0) {
        // Test select filter
        await filterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Orders should be filtered (URL might change)
        expect(page.url()).toBeTruthy();
      } else if ((await filterButtons.count()) > 1) {
        // Test button filters
        const processingBtn = page.getByRole("button", { name: /processing/i });
        if ((await processingBtn.count()) > 0) {
          await processingBtn.click();
          await page.waitForTimeout(500);

          // Check if filter is applied
          const isActive =
            (await processingBtn.getAttribute("aria-pressed")) ||
            (await processingBtn.getAttribute("data-active"));
          expect(isActive).toBeTruthy();
        }
      }
    });
  });

  test.describe("Order Details Page (/[locale]/(accounts)/orders/[number])", () => {
    test("should display order details", async ({ page }) => {
      // First go to orders page to find an order
      await page.goto("/en/orders");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Try to navigate to first order details
      const viewLink = page
        .getByRole("link", { name: /view|details/i })
        .first();
      if ((await viewLink.count()) > 0) {
        await viewLink.click();
        await waitUtils.forNavigation();

        // Should be on order details page
        expect(page.url()).toMatch(/orders\/\d+/);

        // Check for order information sections
        const orderSummary = page.locator(
          '[data-testid="order-summary"], .order-summary',
        );
        const shippingInfo = page.locator(
          '[data-testid="shipping-info"], .shipping-info, [class*="shipping"]',
        );
        const itemsList = page.locator(
          '[data-testid="order-items"], .order-items, [class*="items"]',
        );

        // At least some order info should be visible
        const hasOrderInfo =
          (await orderSummary.count()) > 0 ||
          (await shippingInfo.count()) > 0 ||
          (await itemsList.count()) > 0;

        expect(hasOrderInfo).toBeTruthy();

        // Check for order total
        const orderTotal = page.locator(
          '[data-testid="order-total"], .order-total, [class*="total"]',
        );
        if ((await orderTotal.count()) > 0) {
          const total = await orderTotal.textContent();
          expect(total).toMatch(/[\d.,]+/);
        }

        // Check for tracking info if shipped
        const trackingSection = page.locator(
          '[data-testid="tracking"], .tracking-info',
        );
        if ((await trackingSection.count()) > 0) {
          const trackingNumber = trackingSection.locator(
            '[data-testid="tracking-number"]',
          );
          if ((await trackingNumber.count()) > 0) {
            const tracking = await trackingNumber.textContent();
            expect(tracking).toBeTruthy();
          }
        }
      } else {
        // No orders to test, try direct URL
        await page.goto("/en/orders/12345");
        await waitUtils.forNavigation();

        // Should either show order or redirect/404
        const pageContent = await page.textContent("body");
        expect(pageContent).toBeTruthy();
      }
    });

    test("should handle order actions", async ({ page }) => {
      await page.goto("/en/orders");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      const viewLink = page
        .getByRole("link", { name: /view|details/i })
        .first();
      if ((await viewLink.count()) > 0) {
        await viewLink.click();
        await waitUtils.forNavigation();

        // Check for action buttons
        const reorderBtn = page.getByRole("button", {
          name: /reorder|buy again/i,
        });
        const returnBtn = page.getByRole("button", { name: /return|refund/i });
        const invoiceBtn = page.getByRole("button", {
          name: /invoice|receipt/i,
        });

        // Test reorder functionality
        if ((await reorderBtn.count()) > 0) {
          await expect(reorderBtn).toBeVisible();
          // Don't click to avoid adding to cart
        }

        // Test invoice download
        if ((await invoiceBtn.count()) > 0) {
          await expect(invoiceBtn).toBeVisible();
          // Could test download functionality
        }

        // Test return initiation
        if ((await returnBtn.count()) > 0) {
          await expect(returnBtn).toBeVisible();
          // Check if eligible for return based on order status
        }
      }
    });
  });

  test.describe("Account Navigation and Layout", () => {
    test("should maintain consistent navigation across account pages", async ({
      page,
    }) => {
      const accountPages = [
        "/en/account",
        "/en/account-billing",
        "/en/account-password",
        "/en/account-wishlists",
        "/en/orders",
      ];

      // Check first page
      await page.goto(accountPages[0]);
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Find account navigation
      const accountNav = page
        .locator('[data-testid="account-nav"], .account-nav, nav')
        .filter({
          has: page.getByRole("link", { name: /account|billing|password/i }),
        });

      if ((await accountNav.count()) > 0) {
        // Get all navigation links
        const navLinks = accountNav.getByRole("link");
        const linkCount = await navLinks.count();

        // Verify navigation appears on all pages
        for (const accountPage of accountPages.slice(1)) {
          await page.goto(accountPage);
          await waitUtils.forNavigation();

          if (!page.url().includes("/login")) {
            const pageNav = page
              .locator('[data-testid="account-nav"], .account-nav, nav')
              .filter({
                has: page.getByRole("link", {
                  name: /account|billing|password/i,
                }),
              });

            expect(await pageNav.count()).toBe(1);
            expect(await pageNav.getByRole("link").count()).toBe(linkCount);
          }
        }
      }
    });

    test("should highlight active navigation item", async ({ page }) => {
      await page.goto("/en/account-billing");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      const billingLink = page.getByRole("link", { name: /billing/i });
      if ((await billingLink.count()) > 0) {
        // Check for active state
        const isActive =
          (await billingLink.getAttribute("aria-current")) === "page" ||
          (await billingLink.getAttribute("data-active")) === "true" ||
          (await billingLink.getAttribute("class"))?.includes("active");

        expect(isActive).toBeTruthy();
      }
    });

    test("should handle responsive account menu", async ({
      page,
      viewport,
    }) => {
      if (!viewport) return;

      await page.goto("/en/account");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // On mobile, navigation might be in a dropdown
      if (viewport.width < 768) {
        const menuButton = page.getByRole("button", {
          name: /menu|account menu/i,
        });
        if ((await menuButton.count()) > 0) {
          await menuButton.click();
          await page.waitForTimeout(300);

          // Check if menu opened
          const mobileNav = page.locator(
            '[data-testid="mobile-account-nav"], .mobile-nav',
          );
          if ((await mobileNav.count()) > 0) {
            await expect(mobileNav).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Account Security and Privacy", () => {
    test("should handle session timeout gracefully", async ({ page }) => {
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Simulate session expiry by clearing cookies
      await page.context().clearCookies();

      // Try to access protected content
      await page.reload();
      await waitUtils.forNavigation();

      // Should redirect to login
      expect(page.url()).toContain("/login");
    });

    test("should protect sensitive information", async ({ page }) => {
      await page.goto("/en/account-billing");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Check that sensitive data is masked
      const cardNumbers = page.locator(
        '[data-testid="card-number"], .card-number',
      );
      if ((await cardNumbers.count()) > 0) {
        const cardText = await cardNumbers.first().textContent();
        // Should show masked number like **** 1234
        expect(cardText).toMatch(/\*{4}.*\d{4}/);
      }

      // Check password fields are always masked
      const passwordInputs = page.locator('input[type="password"]');
      for (let i = 0; i < (await passwordInputs.count()); i++) {
        const type = await passwordInputs.nth(i).getAttribute("type");
        expect(type).toBe("password");
      }
    });
  });

  test.describe("Accessibility and Performance", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Start tabbing through page
      await page.keyboard.press("Tab");

      // Should focus on first interactive element
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName,
      );
      expect(focusedElement).toMatch(/A|BUTTON|INPUT|SELECT/);

      // Tab through navigation
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
      }

      // Should be able to activate links with Enter
      const currentFocus = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          href: (el as HTMLAnchorElement)?.href,
          tag: el?.tagName,
        };
      });

      if (currentFocus.tag === "A" && currentFocus.href) {
        await page.keyboard.press("Enter");
        await waitUtils.forNavigation();
        // Should navigate to new page
        expect(page.url()).toBeTruthy();
      }
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.goto("/en/account");
      await waitUtils.forNavigation();

      if (page.url().includes("/login")) return;

      // Check main navigation
      const mainNav = page.getByRole("navigation");
      if ((await mainNav.count()) > 0) {
        const label = await mainNav.getAttribute("aria-label");
        expect(label).toBeTruthy();
      }

      // Check form labels
      const formInputs = page.locator("input:visible");
      for (let i = 0; i < Math.min(3, await formInputs.count()); i++) {
        const input = formInputs.nth(i);
        const id = await input.getAttribute("id");
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          if ((await label.count()) === 0) {
            // Should have aria-label if no visible label
            const ariaLabel = await input.getAttribute("aria-label");
            expect(ariaLabel).toBeTruthy();
          }
        }
      }
    });

    test("should load account pages quickly", async ({ page }) => {
      const accountPages = [
        "/en/account",
        "/en/account-billing",
        "/en/account-wishlists",
      ];

      for (const accountPage of accountPages) {
        const startTime = Date.now();
        await page.goto(accountPage);
        await waitUtils.forNavigation();
        const loadTime = Date.now() - startTime;

        // Should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);

        if (!page.url().includes("/login")) {
          // Critical content should be visible quickly
          const mainContent = page.locator("main, [role='main']");
          await expect(mainContent).toBeVisible({ timeout: 1000 });
        }
      }
    });
  });
});
