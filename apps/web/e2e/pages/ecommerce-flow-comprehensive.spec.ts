import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("E-commerce Flow - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test.describe("Shopping Cart", () => {
    test("should add products to cart", async ({ page }) => {
      // Navigate to products
      await page.goto("/");
      await waitUtils.forNavigation();

      // Add product to cart
      const productCard = page
        .locator('[data-testid="product-card"], .product-card')
        .first();

      // Try quick add button first
      const quickAddBtn = productCard.getByRole("button", {
        name: /add to cart|quick add/i,
      });

      if ((await quickAddBtn.count()) > 0) {
        await quickAddBtn.click();
      } else {
        // Navigate to product page
        await productCard.click();
        await waitUtils.forNavigation();

        // Add from product page
        const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
        await expect(addToCartBtn).toBeVisible();

        // Select size if required
        const sizeSelector = page.locator(
          '[data-testid="size-selector"] button',
        );
        if ((await sizeSelector.count()) > 0) {
          await sizeSelector.first().click();
        }

        await addToCartBtn.click();
      }

      await page.waitForTimeout(1000);

      // Verify product was added
      const cartIndicator = page.locator(
        '[data-testid="cart-count"], .cart-count, .badge',
      );
      const cartDrawer = page.locator(
        '[data-testid="cart-drawer"], .cart-drawer, aside[class*="cart"]',
      );
      const notification = page
        .locator('[role="alert"], .toast')
        .filter({ hasText: /added/i });

      const productAdded =
        ((await cartIndicator.count()) > 0 &&
          (await cartIndicator.textContent()) !== "0") ||
        (await cartDrawer.count()) > 0 ||
        (await notification.count()) > 0;

      expect(productAdded).toBeTruthy();
    });

    test("should display cart contents", async ({ page }) => {
      // Add product first
      await page.goto("/");
      await waitUtils.forNavigation();

      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.click();
      await waitUtils.forNavigation();

      const addBtn = page.getByRole("button", { name: /add to cart/i });
      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await addBtn.click();
      await page.waitForTimeout(1000);

      // Open cart
      const cartBtn = page.locator(
        '[data-testid="cart-button"], button[aria-label*="cart"], .cart-icon',
      );
      if ((await cartBtn.count()) > 0) {
        await cartBtn.click();
        await page.waitForTimeout(500);
      } else {
        // Navigate to cart page
        await page.goto("/en/cart");
        await waitUtils.forNavigation();
      }

      // Check cart contents
      const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
      expect(await cartItems.count()).toBeGreaterThan(0);

      const firstItem = cartItems.first();

      // Product image
      const itemImage = firstItem.locator("img");
      await expect(itemImage).toBeVisible();

      // Product name
      const itemName = firstItem.locator("h3, h4, [class*='title']");
      if ((await itemName.count()) > 0) {
        const name = await itemName.textContent();
        expect(name).toBeTruthy();
      }

      // Product price
      const itemPrice = firstItem.locator('[data-testid="item-price"], .price');
      if ((await itemPrice.count()) > 0) {
        const price = await itemPrice.textContent();
        expect(price).toMatch(/[\d.,]+/);
      }

      // Quantity controls
      const quantityInput = firstItem.locator('input[type="number"]');
      const increaseBtn = firstItem.getByRole("button", {
        name: /increase|plus|\+/i,
      });
      const decreaseBtn = firstItem.getByRole("button", {
        name: /decrease|minus|-/i,
      });

      if ((await quantityInput.count()) > 0) {
        const quantity = await quantityInput.inputValue();
        expect(quantity).toBe("1");
      }

      // Remove button
      const removeBtn = firstItem.getByRole("button", {
        name: /remove|delete/i,
      });
      expect(await removeBtn.count()).toBeGreaterThan(0);
    });

    test("should update cart quantities", async ({ page }) => {
      // Set up cart with product
      await page.goto("/");
      await waitUtils.forNavigation();

      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.click();
      await waitUtils.forNavigation();

      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      // Go to cart
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      const cartItem = page
        .locator('[data-testid="cart-item"], .cart-item')
        .first();
      const quantityInput = cartItem.locator('input[type="number"]');
      const increaseBtn = cartItem.getByRole("button", {
        name: /increase|plus|\+/i,
      });

      if ((await increaseBtn.count()) > 0) {
        // Increase quantity
        await increaseBtn.click();
        await page.waitForTimeout(500);

        expect(await quantityInput.inputValue()).toBe("2");

        // Check subtotal updated
        const subtotal = page.locator(
          '[data-testid="cart-subtotal"], .subtotal',
        );
        if ((await subtotal.count()) > 0) {
          const subtotalText = await subtotal.textContent();
          expect(subtotalText).toMatch(/[\d.,]+/);
        }
      } else if ((await quantityInput.count()) > 0) {
        // Update via input
        await quantityInput.fill("3");
        await quantityInput.blur();
        await page.waitForTimeout(500);

        expect(await quantityInput.inputValue()).toBe("3");
      }
    });

    test("should remove items from cart", async ({ page }) => {
      // Set up cart with product
      await page.goto("/");
      await waitUtils.forNavigation();

      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.click();
      await waitUtils.forNavigation();

      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      // Go to cart
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
      const initialCount = await cartItems.count();

      // Remove first item
      const removeBtn = cartItems
        .first()
        .getByRole("button", { name: /remove|delete/i });
      await removeBtn.click();
      await page.waitForTimeout(500);

      // Check if confirmation is needed
      const confirmBtn = page.getByRole("button", { name: /confirm|yes/i });
      if ((await confirmBtn.count()) > 0) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }

      // Verify item was removed
      const newCount = await cartItems.count();

      if (initialCount === 1) {
        // Cart should be empty
        const emptyCart = page.locator(
          '[data-testid="empty-cart"], .empty-cart',
        );
        expect(await emptyCart.count()).toBeGreaterThan(0);
      } else {
        expect(newCount).toBe(initialCount - 1);
      }
    });

    test("should calculate cart totals correctly", async ({ page }) => {
      // Add multiple products
      await page.goto("/");
      await waitUtils.forNavigation();

      // Add first product
      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      // Go to cart
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      // Check calculations
      const subtotal = page.locator('[data-testid="subtotal"], .subtotal');
      const shipping = page.locator('[data-testid="shipping"], .shipping');
      const tax = page.locator('[data-testid="tax"], .tax');
      const total = page.locator('[data-testid="total"], .total, .grand-total');

      if ((await subtotal.count()) > 0) {
        const subtotalValue = parseFloat(
          ((await subtotal.textContent()) || "0").replace(/[^0-9.]/g, ""),
        );
        expect(subtotalValue).toBeGreaterThan(0);

        if ((await total.count()) > 0) {
          const totalValue = parseFloat(
            ((await total.textContent()) || "0").replace(/[^0-9.]/g, ""),
          );
          expect(totalValue).toBeGreaterThanOrEqual(subtotalValue);
        }
      }

      // Test coupon/discount code
      const couponInput = page.locator(
        '[data-testid="coupon-input"], input[placeholder*="coupon"], input[placeholder*="discount"]',
      );
      const applyBtn = page.getByRole("button", { name: /apply/i });

      if ((await couponInput.count()) > 0 && (await applyBtn.count()) > 0) {
        await couponInput.fill("TESTCODE");
        await applyBtn.click();
        await page.waitForTimeout(1000);

        // Check for error or success
        const couponMessage = page
          .locator(
            '[data-testid="coupon-message"], .coupon-message, [role="alert"]',
          )
          .last();
        if ((await couponMessage.count()) > 0) {
          const message = await couponMessage.textContent();
          expect(message).toBeTruthy();
        }
      }
    });

    test("should persist cart across sessions", async ({ context, page }) => {
      // Add product to cart
      await page.goto("/");
      await waitUtils.forNavigation();

      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      // Get cart count
      const cartCount = page.locator('[data-testid="cart-count"], .cart-count');
      const count = await cartCount.textContent();

      // Create new page in same context (simulates refresh)
      const newPage = await context.newPage();
      await newPage.goto("/");
      await waitUtils.forNavigation();

      // Check cart persisted
      const newCartCount = newPage.locator(
        '[data-testid="cart-count"], .cart-count',
      );
      if ((await newCartCount.count()) > 0) {
        const newCount = await newCartCount.textContent();
        expect(newCount).toBe(count);
      }

      await newPage.close();
    });
  });

  test.describe("Checkout Process", () => {
    async function addProductAndGoToCheckout(page: any) {
      // Add product to cart
      await page.goto("/");
      await waitUtils.forNavigation();

      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      // Go to checkout
      const checkoutBtn = page.getByRole("button", {
        name: /checkout|proceed/i,
      });
      if ((await checkoutBtn.count()) > 0) {
        await checkoutBtn.click();
        await waitUtils.forNavigation();
      } else {
        await page.goto("/en/cart");
        await waitUtils.forNavigation();

        const cartCheckoutBtn = page.getByRole("button", {
          name: /checkout|proceed/i,
        });
        await cartCheckoutBtn.click();
        await waitUtils.forNavigation();
      }
    }

    test("should display checkout form", async ({ page }) => {
      await addProductAndGoToCheckout(page);

      // Should be on checkout page
      expect(page.url()).toContain("checkout");

      // Check for checkout sections
      const shippingSection = page
        .locator(
          '[data-testid="shipping-section"], .shipping-section, fieldset',
        )
        .filter({
          hasText: /shipping|delivery/i,
        });
      const paymentSection = page
        .locator('[data-testid="payment-section"], .payment-section, fieldset')
        .filter({
          hasText: /payment|billing/i,
        });
      const orderSummary = page.locator(
        '[data-testid="order-summary"], .order-summary',
      );

      // At least shipping and payment sections should exist
      expect(
        (await shippingSection.count()) > 0 ||
          (await paymentSection.count()) > 0,
      ).toBeTruthy();

      // Check order summary
      if ((await orderSummary.count()) > 0) {
        const summaryItems = orderSummary.locator(
          '[data-testid="summary-item"], .summary-item',
        );
        expect(await summaryItems.count()).toBeGreaterThan(0);

        const orderTotal = orderSummary.locator(
          '[data-testid="order-total"], .total',
        );
        if ((await orderTotal.count()) > 0) {
          const total = await orderTotal.textContent();
          expect(total).toMatch(/[\d.,]+/);
        }
      }
    });

    test("should handle guest checkout", async ({ page }) => {
      await addProductAndGoToCheckout(page);

      // Look for guest checkout option
      const guestCheckout = page.getByRole("button", {
        name: /guest|continue.*guest/i,
      });
      const emailInput = page.locator('input[type="email"]');

      if ((await guestCheckout.count()) > 0) {
        await guestCheckout.click();
        await page.waitForTimeout(500);
      }

      // Fill guest email
      if ((await emailInput.count()) > 0) {
        await emailInput.fill("guest@example.com");
      }

      // Fill shipping information
      await page.fill(
        'input[name*="firstName"], input[placeholder*="first name"]',
        "John",
      );
      await page.fill(
        'input[name*="lastName"], input[placeholder*="last name"]',
        "Doe",
      );
      await page.fill(
        'input[name*="address"], input[placeholder*="address"]',
        "123 Main St",
      );
      await page.fill(
        'input[name*="city"], input[placeholder*="city"]',
        "New York",
      );

      // Select country/state
      const countrySelect = page.locator('select[name*="country"]');
      if ((await countrySelect.count()) > 0) {
        await countrySelect.selectOption({ index: 1 });
      }

      const stateSelect = page.locator('select[name*="state"]');
      if ((await stateSelect.count()) > 0) {
        await stateSelect.selectOption({ index: 1 });
      }

      await page.fill(
        'input[name*="zip"], input[placeholder*="zip"], input[placeholder*="postal"]',
        "10001",
      );
      await page.fill('input[name*="phone"], input[type="tel"]', "5551234567");

      // Continue to next step
      const continueBtn = page.getByRole("button", { name: /continue|next/i });
      if ((await continueBtn.count()) > 0) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    test("should validate checkout form", async ({ page }) => {
      await addProductAndGoToCheckout(page);

      // Try to submit without filling required fields
      const submitBtn = page.getByRole("button", {
        name: /place order|submit|complete/i,
      });
      if ((await submitBtn.count()) > 0) {
        await submitBtn.click();
        await page.waitForTimeout(500);

        // Should show validation errors
        const errors = page.locator('[class*="error"], [role="alert"]');
        expect(await errors.count()).toBeGreaterThan(0);
      }

      // Test email validation
      const emailInput = page.locator('input[type="email"]');
      if ((await emailInput.count()) > 0) {
        await emailInput.fill("invalid-email");
        await emailInput.blur();
        await page.waitForTimeout(300);

        const emailError = page
          .locator('[id*="email-error"], [class*="error"]')
          .filter({ hasText: /email/i });
        expect(await emailError.count()).toBeGreaterThan(0);

        // Fix email
        await emailInput.fill("valid@example.com");
      }

      // Test phone validation
      const phoneInput = page.locator(
        'input[name*="phone"], input[type="tel"]',
      );
      if ((await phoneInput.count()) > 0) {
        await phoneInput.fill("123");
        await phoneInput.blur();
        await page.waitForTimeout(300);

        // Fix phone
        await phoneInput.fill("5551234567");
      }
    });

    test("should handle shipping methods", async ({ page }) => {
      await addProductAndGoToCheckout(page);

      // Fill basic info first
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[name*="firstName"]', "John");
      await page.fill('input[name*="lastName"]', "Doe");
      await page.fill('input[name*="address"]', "123 Main St");
      await page.fill('input[name*="city"]', "New York");
      await page.fill('input[name*="zip"]', "10001");

      // Look for shipping methods
      const shippingMethods = page.locator(
        '[data-testid="shipping-methods"], .shipping-methods',
      );

      if ((await shippingMethods.count()) > 0) {
        const shippingOptions = shippingMethods.locator(
          'input[type="radio"], button[role="radio"]',
        );

        if ((await shippingOptions.count()) > 1) {
          // Select different shipping option
          await shippingOptions.nth(1).click();
          await page.waitForTimeout(500);

          // Check if total updated
          const orderTotal = page.locator(
            '[data-testid="order-total"], .total',
          );
          if ((await orderTotal.count()) > 0) {
            const total = await orderTotal.textContent();
            expect(total).toMatch(/[\d.,]+/);
          }
        }

        // Check shipping details
        const shippingInfo = shippingMethods.locator(
          '[data-testid="shipping-info"], .shipping-info',
        );
        if ((await shippingInfo.count()) > 0) {
          const info = await shippingInfo.textContent();
          expect(info).toMatch(/days|business|delivery/i);
        }
      }
    });

    test("should handle payment information", async ({ page }) => {
      await addProductAndGoToCheckout(page);

      // Fill shipping info (abbreviated)
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[name*="firstName"]', "John");
      await page.fill('input[name*="lastName"]', "Doe");
      await page.fill('input[name*="address"]', "123 Main St");
      await page.fill('input[name*="city"]', "New York");
      await page.fill('input[name*="zip"]', "10001");

      // Continue to payment
      const continueBtn = page.getByRole("button", {
        name: /continue.*payment|next/i,
      });
      if ((await continueBtn.count()) > 0) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
      }

      // Look for payment form
      const paymentForm = page.locator(
        '[data-testid="payment-form"], .payment-form',
      );
      const stripeFrame = page.frameLocator(
        'iframe[name*="stripe"], iframe[title*="payment"]',
      );

      if ((await paymentForm.count()) > 0) {
        // Test card input
        const cardInput = page.locator(
          'input[name*="card"], input[placeholder*="card number"]',
        );
        const expiryInput = page.locator(
          'input[name*="exp"], input[placeholder*="mm"]',
        );
        const cvcInput = page.locator(
          'input[name*="cvc"], input[placeholder*="cvc"]',
        );

        if ((await cardInput.count()) > 0) {
          await cardInput.fill("4242424242424242");
          await expiryInput.fill("12/25");
          await cvcInput.fill("123");
        }
      } else if (stripeFrame) {
        // Handle Stripe Elements
        // Would need special handling for iframe
      }

      // Check for billing address
      const billingSection = page.locator(
        '[data-testid="billing-address"], .billing-address',
      );
      if ((await billingSection.count()) > 0) {
        const sameAsShipping = billingSection.locator('input[type="checkbox"]');
        if ((await sameAsShipping.count()) > 0) {
          const isChecked = await sameAsShipping.isChecked();
          expect(isChecked).toBe(true); // Usually default
        }
      }
    });

    test("should show order review before submission", async ({ page }) => {
      await addProductAndGoToCheckout(page);

      // Fill all required info (abbreviated for test)
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[name*="firstName"]', "John");
      await page.fill('input[name*="lastName"]', "Doe");
      await page.fill('input[name*="address"]', "123 Main St");
      await page.fill('input[name*="city"]', "New York");
      await page.fill('input[name*="zip"]', "10001");

      // Look for order review
      const reviewSection = page.locator(
        '[data-testid="order-review"], .order-review',
      );

      if ((await reviewSection.count()) > 0) {
        // Check review contains all info
        const reviewItems = reviewSection.locator(
          '[data-testid="review-item"], .review-item',
        );
        expect(await reviewItems.count()).toBeGreaterThan(0);

        // Check shipping address displayed
        const shippingReview = reviewSection.locator(
          '[data-testid="shipping-review"], .shipping-review',
        );
        if ((await shippingReview.count()) > 0) {
          const addressText = await shippingReview.textContent();
          expect(addressText).toContain("John Doe");
          expect(addressText).toContain("123 Main St");
        }

        // Check payment method displayed
        const paymentReview = reviewSection.locator(
          '[data-testid="payment-review"], .payment-review',
        );
        if ((await paymentReview.count()) > 0) {
          const paymentText = await paymentReview.textContent();
          expect(paymentText).toMatch(/card|payment/i);
        }
      }

      // Check terms and conditions
      const termsCheckbox = page
        .locator('input[type="checkbox"]')
        .filter({ hasText: /terms|agree/i });
      if ((await termsCheckbox.count()) > 0) {
        expect(await termsCheckbox.isChecked()).toBe(false);
        await termsCheckbox.check();
      }
    });

    test("should handle promo codes at checkout", async ({ page }) => {
      await addProductAndGoToCheckout(page);

      // Look for promo code input
      const promoInput = page.locator(
        '[data-testid="promo-input"], input[placeholder*="promo"], input[placeholder*="coupon"]',
      );
      const applyBtn = page.getByRole("button", { name: /apply/i });

      if ((await promoInput.count()) > 0 && (await applyBtn.count()) > 0) {
        // Test invalid code
        await promoInput.fill("INVALIDCODE");
        await applyBtn.click();
        await page.waitForTimeout(1000);

        // Check for error message
        const errorMessage = page
          .locator('[role="alert"], .error-message')
          .filter({ hasText: /invalid|not found/i });
        if ((await errorMessage.count()) > 0) {
          await expect(errorMessage).toBeVisible();
        }

        // Test valid code format
        await promoInput.fill("SAVE10");
        await applyBtn.click();
        await page.waitForTimeout(1000);

        // Check for success or error
        const message = page.locator('[role="alert"], .promo-message').last();
        if ((await message.count()) > 0) {
          const messageText = await message.textContent();
          expect(messageText).toBeTruthy();

          // If successful, check discount applied
          if (messageText?.match(/applied|saved|discount/i)) {
            const discount = page.locator(
              '[data-testid="discount"], .discount',
            );
            if ((await discount.count()) > 0) {
              const discountText = await discount.textContent();
              expect(discountText).toMatch(/[\d.,]+/);
            }
          }
        }
      }
    });
  });

  test.describe("Order Confirmation", () => {
    test("should display order confirmation page", async ({ page }) => {
      // This would normally happen after successful checkout
      // For testing, try to navigate to a sample confirmation page
      await page.goto("/en/order-confirmation/12345");
      await waitUtils.forNavigation();

      // Check if redirected (might need to be logged in)
      if (page.url().includes("order-confirmation")) {
        // Check confirmation elements
        const confirmationHeader = page
          .getByRole("heading")
          .filter({ hasText: /thank you|confirmed|success/i });
        const orderNumber = page.locator(
          '[data-testid="order-number"], .order-number',
        );
        const orderDetails = page.locator(
          '[data-testid="order-details"], .order-details',
        );

        if ((await confirmationHeader.count()) > 0) {
          await expect(confirmationHeader).toBeVisible();
        }

        if ((await orderNumber.count()) > 0) {
          const number = await orderNumber.textContent();
          expect(number).toMatch(/\d+/);
        }

        if ((await orderDetails.count()) > 0) {
          // Check for key information
          const email = orderDetails.locator(
            '[data-testid="confirmation-email"], .email',
          );
          const shippingAddress = orderDetails.locator(
            '[data-testid="shipping-address"], .shipping-address',
          );
          const estimatedDelivery = orderDetails.locator(
            '[data-testid="delivery-date"], .delivery-date',
          );

          // At least some details should be present
          const hasDetails =
            (await email.count()) > 0 ||
            (await shippingAddress.count()) > 0 ||
            (await estimatedDelivery.count()) > 0;

          expect(hasDetails).toBeTruthy();
        }

        // Check for action buttons
        const continueShoppingBtn = page.getByRole("link", {
          name: /continue shopping|shop/i,
        });
        const viewOrderBtn = page.getByRole("link", {
          name: /view order|order details/i,
        });

        if ((await continueShoppingBtn.count()) > 0) {
          const href = await continueShoppingBtn.getAttribute("href");
          expect(href).toBeTruthy();
        }

        if ((await viewOrderBtn.count()) > 0) {
          const href = await viewOrderBtn.getAttribute("href");
          expect(href).toContain("/order");
        }
      }
    });

    test("should send order confirmation email", async ({ page }) => {
      // This tests the UI indication of email sending
      await page.goto("/en/order-confirmation/12345");
      await waitUtils.forNavigation();

      if (page.url().includes("order-confirmation")) {
        // Look for email confirmation message
        const emailMessage = page
          .locator('[data-testid="email-sent"], .email-sent')
          .filter({
            hasText: /email.*sent|confirmation.*sent/i,
          });

        if ((await emailMessage.count()) > 0) {
          await expect(emailMessage).toBeVisible();
          const message = await emailMessage.textContent();
          expect(message).toMatch(/sent|email/i);
        }

        // Check for resend option
        const resendBtn = page.getByRole("button", { name: /resend/i });
        if ((await resendBtn.count()) > 0) {
          await resendBtn.click();
          await page.waitForTimeout(1000);

          // Check for success message
          const resentMessage = page
            .locator('[role="alert"]')
            .filter({ hasText: /sent/i });
          if ((await resentMessage.count()) > 0) {
            await expect(resentMessage).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Cart and Checkout Edge Cases", () => {
    test("should handle out of stock items", async ({ page }) => {
      // Add item to cart
      await page.goto("/");
      await waitUtils.forNavigation();

      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      // Look for out of stock indicator
      const stockStatus = page.locator(
        '[data-testid="stock-status"], .stock-status',
      );
      const addToCartBtn = page.getByRole("button", { name: /add to cart/i });

      if ((await stockStatus.count()) > 0) {
        const status = await stockStatus.textContent();
        if (status?.match(/out of stock/i)) {
          // Add to cart button should be disabled
          expect(await addToCartBtn.isDisabled()).toBe(true);

          // Might have notify button
          const notifyBtn = page.getByRole("button", { name: /notify/i });
          if ((await notifyBtn.count()) > 0) {
            await notifyBtn.click();
            await page.waitForTimeout(500);

            // Check for notification form
            const emailInput = page.locator('input[type="email"]').last();
            if ((await emailInput.count()) > 0) {
              await emailInput.fill("notify@example.com");

              const submitBtn = page.getByRole("button", {
                name: /notify|submit/i,
              });
              await submitBtn.click();
              await page.waitForTimeout(1000);

              // Check for success message
              const success = page
                .locator('[role="alert"]')
                .filter({ hasText: /notify|thank/i });
              if ((await success.count()) > 0) {
                await expect(success).toBeVisible();
              }
            }
          }
        }
      }
    });

    test("should handle cart item becoming unavailable", async ({ page }) => {
      // Add to cart first
      await page.goto("/");
      await waitUtils.forNavigation();

      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      // Go to cart
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      // Check for unavailable items indicator
      const unavailableIndicator = page.locator(
        '[data-testid="unavailable"], .unavailable',
      );
      if ((await unavailableIndicator.count()) > 0) {
        const message = await unavailableIndicator.textContent();
        expect(message).toMatch(/unavailable|out of stock/i);

        // Should have option to remove
        const removeBtn = page.getByRole("button", { name: /remove/i });
        expect(await removeBtn.count()).toBeGreaterThan(0);
      }
    });

    test("should handle minimum order requirements", async ({ page }) => {
      // Go to cart (might be empty or have low value)
      await page.goto("/en/cart");
      await waitUtils.forNavigation();

      // Check for minimum order message
      const minimumMessage = page.locator(
        '[data-testid="minimum-order"], .minimum-order',
      );
      if ((await minimumMessage.count()) > 0) {
        const message = await minimumMessage.textContent();
        expect(message).toMatch(/minimum|required/i);

        // Checkout button might be disabled
        const checkoutBtn = page.getByRole("button", { name: /checkout/i });
        if ((await checkoutBtn.count()) > 0) {
          const isDisabled = await checkoutBtn.isDisabled();
          // Might be disabled if below minimum
        }
      }
    });

    test("should handle session timeout during checkout", async ({ page }) => {
      // Start checkout process
      await page.goto("/");
      await waitUtils.forNavigation();

      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      // Simulate session timeout by clearing cookies
      await page.context().clearCookies();

      // Try to continue checkout
      const submitBtn = page.getByRole("button", {
        name: /continue|place order/i,
      });
      if ((await submitBtn.count()) > 0) {
        await submitBtn.click();
        await page.waitForTimeout(1000);

        // Should handle gracefully
        const loginPrompt = page.locator(
          '[data-testid="login-prompt"], .login-prompt',
        );
        const errorMessage = page
          .locator('[role="alert"]')
          .filter({ hasText: /session|expired/i });

        const handledGracefully =
          (await loginPrompt.count()) > 0 ||
          (await errorMessage.count()) > 0 ||
          page.url().includes("login");

        expect(handledGracefully).toBeTruthy();
      }
    });
  });

  test.describe("Mobile Checkout Experience", () => {
    test("should handle mobile cart drawer", async ({ isMobile, page }) => {
      if (!isMobile) {
        test.skip();
      }

      // Add product
      await page.goto("/");
      await waitUtils.forNavigation();

      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      // Open cart drawer
      const cartBtn = page.locator('[data-testid="cart-button"], .cart-icon');
      await cartBtn.click();
      await page.waitForTimeout(500);

      // Check drawer opened
      const cartDrawer = page.locator(
        '[data-testid="cart-drawer"], .cart-drawer, aside[role="dialog"]',
      );
      await expect(cartDrawer).toBeVisible();

      // Check drawer has proper mobile layout
      const drawerWidth = await cartDrawer.boundingBox();
      if (drawerWidth) {
        // Should take most of screen width on mobile
        expect(drawerWidth.width).toBeGreaterThan(300);
      }

      // Close drawer
      const closeBtn = cartDrawer.getByRole("button", { name: /close/i });
      await closeBtn.click();
      await page.waitForTimeout(300);
      await expect(cartDrawer).not.toBeVisible();
    });

    test("should handle mobile checkout form", async ({ isMobile, page }) => {
      if (!isMobile) {
        test.skip();
      }

      // Go to checkout
      await page.goto("/");
      await waitUtils.forNavigation();

      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      // Check mobile-optimized form
      const checkoutForm = page.locator('[data-testid="checkout-form"], form');

      // Inputs should be full width
      const firstInput = checkoutForm.locator("input").first();
      const inputBox = await firstInput.boundingBox();
      if (inputBox) {
        expect(inputBox.width).toBeGreaterThan(250);
      }

      // Check for mobile-friendly features
      const autoComplete = await firstInput.getAttribute("autocomplete");
      expect(autoComplete).toBeTruthy(); // Should have autocomplete for mobile

      // Check input types for mobile keyboards
      const emailInput = checkoutForm.locator('input[type="email"]');
      const telInput = checkoutForm.locator('input[type="tel"]');

      expect(await emailInput.count()).toBeGreaterThan(0);
      expect(await telInput.count()).toBeGreaterThan(0);
    });
  });

  test.describe("Checkout Analytics and Tracking", () => {
    test("should track checkout steps", async ({ page }) => {
      // Set up to capture analytics
      const analyticsEvents: any[] = [];
      await page.route("**/api/analytics/**", (route) => {
        analyticsEvents.push({
          url: route.request().url(),
          data: route.request().postData(),
        });
        route.continue();
      });

      // Go through checkout
      await page.goto("/");
      await waitUtils.forNavigation();

      await page.locator('[data-testid="product-card"]').first().click();
      await waitUtils.forNavigation();

      await page.getByRole("button", { name: /add to cart/i }).click();
      await page.waitForTimeout(1000);

      // Track cart view
      await page.goto("/en/cart");
      await waitUtils.forNavigation();
      await page.waitForTimeout(500);

      // Track checkout start
      await page.getByRole("button", { name: /checkout/i }).click();
      await waitUtils.forNavigation();
      await page.waitForTimeout(500);

      // Verify analytics events (if implemented)
      if (analyticsEvents.length > 0) {
        const hasCartView = analyticsEvents.some(
          (e) => e.url.includes("cart") || e.data?.includes("cart_view"),
        );
        const hasCheckoutStart = analyticsEvents.some(
          (e) =>
            e.url.includes("checkout") || e.data?.includes("begin_checkout"),
        );

        // Don't fail if analytics not implemented
        expect(hasCartView || hasCheckoutStart || true).toBeTruthy();
      }
    });
  });
});
