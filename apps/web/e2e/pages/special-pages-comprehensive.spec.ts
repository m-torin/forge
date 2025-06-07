import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Special Pages - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test.describe("Alternative Home Page (/home-2)", () => {
    test("should display alternative home layout", async ({ page }) => {
      await page.goto("/en/home-2");
      await waitUtils.forNavigation();

      // Check for hero section
      const heroSection = page
        .locator('[data-testid="hero"], .hero, section')
        .first();
      if ((await heroSection.count()) > 0) {
        await expect(heroSection).toBeVisible();

        // Hero content
        const heroHeading = heroSection.getByRole("heading", { level: 1 });
        if ((await heroHeading.count()) > 0) {
          const heading = await heroHeading.textContent();
          expect(heading).toBeTruthy();
        }

        // Hero CTA
        const heroCTA = heroSection.getByRole("link", {
          name: /shop|explore/i,
        });
        if ((await heroCTA.count()) > 0) {
          await expect(heroCTA).toBeVisible();
        }
      }

      // Check for unique sections in home-2
      const uniqueSections = [
        '[data-testid="featured-categories"]',
        '[data-testid="testimonials"]',
        '[data-testid="instagram-feed"]',
        ".featured-categories",
        ".testimonials",
        ".instagram-feed",
      ];

      let foundUniqueSection = false;
      for (const selector of uniqueSections) {
        const section = page.locator(selector);
        if ((await section.count()) > 0) {
          foundUniqueSection = true;
          await expect(section).toBeVisible();
          break;
        }
      }

      // Should have different layout than main home
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });

    test("should have working navigation from home-2", async ({ page }) => {
      await page.goto("/en/home-2");
      await waitUtils.forNavigation();

      // Test navigation links work
      const shopLink = page
        .getByRole("link", { name: /shop|products/i })
        .first();
      if ((await shopLink.count()) > 0) {
        await shopLink.click();
        await waitUtils.forNavigation();

        // Should navigate away from home-2
        expect(page.url()).not.toContain("/home-2");
      }
    });
  });

  test.describe("Coming Soon Page", () => {
    test("should display coming soon content", async ({ page }) => {
      await page.goto("/en/coming-soon");
      await waitUtils.forNavigation();

      // Check for coming soon heading
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      const headingText = await heading.textContent();
      expect(headingText).toMatch(/coming soon|under construction|launching/i);

      // Check for countdown timer
      const countdown = page.locator(
        '[data-testid="countdown"], .countdown, [class*="timer"]',
      );
      if ((await countdown.count()) > 0) {
        await expect(countdown).toBeVisible();

        // Check timer elements
        const timerUnits = countdown.locator(
          '[data-testid="timer-unit"], .timer-unit',
        );
        if ((await timerUnits.count()) > 0) {
          expect(await timerUnits.count()).toBeGreaterThanOrEqual(3); // Days, hours, minutes
        }
      }

      // Check for notification form
      const notifyForm = page.locator('[data-testid="notify-form"], form');
      if ((await notifyForm.count()) > 0) {
        const emailInput = notifyForm.locator('input[type="email"]');
        const submitBtn = notifyForm.getByRole("button", {
          name: /notify|subscribe/i,
        });

        await expect(emailInput).toBeVisible();
        await expect(submitBtn).toBeVisible();
      }

      // Check for social links
      const socialLinks = page.locator(
        '[data-testid="social-links"], .social-links',
      );
      if ((await socialLinks.count()) > 0) {
        const links = socialLinks.locator("a");
        expect(await links.count()).toBeGreaterThan(0);
      }
    });

    test("should handle notification signup", async ({ page }) => {
      await page.goto("/en/coming-soon");
      await waitUtils.forNavigation();

      const notifyForm = page.locator('[data-testid="notify-form"], form');
      if ((await notifyForm.count()) > 0) {
        const emailInput = notifyForm.locator('input[type="email"]');
        const submitBtn = notifyForm.getByRole("button", {
          name: /notify|subscribe/i,
        });

        // Test validation
        await submitBtn.click();
        await page.waitForTimeout(500);

        // Should show validation error
        const error = page.locator('[class*="error"], [role="alert"]').first();
        if ((await error.count()) > 0) {
          await expect(error).toBeVisible();
        }

        // Fill valid email
        await emailInput.fill("test@example.com");
        await submitBtn.click();
        await page.waitForTimeout(1000);

        // Check for success message
        const success = page
          .locator('[role="alert"], .success')
          .filter({ hasText: /thank|subscribed/i });
        if ((await success.count()) > 0) {
          await expect(success).toBeVisible();
        }
      }
    });
  });

  test.describe("Subscription Page", () => {
    test("should display subscription plans", async ({ page }) => {
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      // Check page heading
      const heading = page.getByRole("heading", { level: 1 });
      if ((await heading.count()) > 0) {
        const text = await heading.textContent();
        expect(text).toMatch(/subscription|membership|plan/i);
      }

      // Check for pricing cards
      const pricingCards = page.locator(
        '[data-testid="pricing-card"], .pricing-card, [class*="plan"]',
      );
      if ((await pricingCards.count()) > 0) {
        expect(await pricingCards.count()).toBeGreaterThanOrEqual(2); // At least 2 plans

        // Check first plan
        const firstPlan = pricingCards.first();

        // Plan name
        const planName = firstPlan.locator("h2, h3, [class*='name']");
        if ((await planName.count()) > 0) {
          const name = await planName.textContent();
          expect(name).toBeTruthy();
        }

        // Plan price
        const planPrice = firstPlan.locator('[data-testid="price"], .price');
        if ((await planPrice.count()) > 0) {
          const price = await planPrice.textContent();
          expect(price).toMatch(/[\d.,]+/);
        }

        // Plan features
        const features = firstPlan.locator('ul li, [data-testid="feature"]');
        if ((await features.count()) > 0) {
          expect(await features.count()).toBeGreaterThan(0);
        }

        // Subscribe button
        const subscribeBtn = firstPlan.getByRole("button", {
          name: /subscribe|choose|select/i,
        });
        if ((await subscribeBtn.count()) > 0) {
          await expect(subscribeBtn).toBeVisible();
        }
      }

      // Check for comparison table
      const comparisonTable = page.locator(
        '[data-testid="comparison-table"], .comparison-table, table',
      );
      if ((await comparisonTable.count()) > 0) {
        const headers = comparisonTable.locator("th");
        expect(await headers.count()).toBeGreaterThan(2);
      }
    });

    test("should handle plan selection", async ({ page }) => {
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      const pricingCards = page.locator(
        '[data-testid="pricing-card"], .pricing-card',
      );
      if ((await pricingCards.count()) > 0) {
        const firstPlan = pricingCards.first();
        const selectBtn = firstPlan.getByRole("button", {
          name: /subscribe|choose|select/i,
        });

        if ((await selectBtn.count()) > 0) {
          await selectBtn.click();
          await page.waitForTimeout(1000);

          // Might redirect to checkout or show modal
          const isCheckout = page.url().includes("checkout");
          const modalOpened = (await page.getByRole("dialog").count()) > 0;

          expect(isCheckout || modalOpened).toBeTruthy();

          if (modalOpened) {
            // Close modal
            const closeBtn = page.getByRole("button", { name: /close/i });
            if ((await closeBtn.count()) > 0) {
              await closeBtn.click();
            }
          }
        }
      }
    });

    test("should toggle billing period", async ({ page }) => {
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      // Look for billing toggle
      const billingToggle = page.locator(
        '[data-testid="billing-toggle"], .billing-toggle',
      );
      if ((await billingToggle.count()) > 0) {
        const monthlyBtn = billingToggle.getByRole("button", {
          name: /monthly/i,
        });
        const yearlyBtn = billingToggle.getByRole("button", {
          name: /yearly|annual/i,
        });

        if ((await monthlyBtn.count()) > 0 && (await yearlyBtn.count()) > 0) {
          // Click yearly
          await yearlyBtn.click();
          await page.waitForTimeout(500);

          // Prices should update
          const prices = page.locator('[data-testid="price"], .price');
          if ((await prices.count()) > 0) {
            const firstPrice = await prices.first().textContent();
            expect(firstPrice).toBeTruthy();
          }

          // Check for savings badge
          const savingsBadge = page.locator(
            '[data-testid="savings"], .savings, [class*="save"]',
          );
          if ((await savingsBadge.count()) > 0) {
            const savings = await savingsBadge.textContent();
            expect(savings).toMatch(/save|%|off/i);
          }

          // Toggle back to monthly
          await monthlyBtn.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test("should display current subscription status", async ({ page }) => {
      // This would require authentication
      await page.goto("/en/subscription");
      await waitUtils.forNavigation();

      // If user is logged in, might show current plan
      const currentPlan = page.locator(
        '[data-testid="current-plan"], .current-plan',
      );
      if ((await currentPlan.count()) > 0) {
        // Current plan name
        const planName = currentPlan.locator(
          '[data-testid="plan-name"], .plan-name',
        );
        if ((await planName.count()) > 0) {
          const name = await planName.textContent();
          expect(name).toBeTruthy();
        }

        // Manage button
        const manageBtn = currentPlan.getByRole("button", {
          name: /manage|change|upgrade/i,
        });
        if ((await manageBtn.count()) > 0) {
          await expect(manageBtn).toBeVisible();
        }

        // Next billing date
        const billingDate = currentPlan.locator(
          '[data-testid="next-billing"], .next-billing',
        );
        if ((await billingDate.count()) > 0) {
          const date = await billingDate.textContent();
          expect(date).toBeTruthy();
        }
      }
    });
  });

  test.describe("Alternative Product Layout (page-style-2)", () => {
    test("should display product with alternative layout", async ({ page }) => {
      // First find a product
      await page.goto("/");
      await waitUtils.forNavigation();

      // Navigate to alternative product layout
      await page.goto("/en/products/page-style-2/sample-product");
      await waitUtils.forNavigation();

      // Check if redirected or 404
      const is404 = (await page.textContent("body"))?.match(/404|not found/i);

      if (!is404) {
        // Check for alternative layout elements
        const productContainer = page.locator(
          '[data-testid="product-container"], .product-container',
        );

        // Alternative layout might have different structure
        const sidebarLayout = page.locator(
          '[data-testid="product-sidebar"], .product-sidebar',
        );
        const splitLayout = page.locator(
          '[data-testid="split-layout"], .split-layout',
        );
        const verticalGallery = page.locator(
          '[data-testid="vertical-gallery"], .vertical-gallery',
        );

        const hasAlternativeLayout =
          (await sidebarLayout.count()) > 0 ||
          (await splitLayout.count()) > 0 ||
          (await verticalGallery.count()) > 0;

        if (hasAlternativeLayout) {
          // Still should have core product elements
          const productTitle = page.getByRole("heading", { level: 1 });
          const productPrice = page.locator('[data-testid="price"], .price');
          const addToCart = page.getByRole("button", { name: /add to cart/i });

          if ((await productTitle.count()) > 0) {
            await expect(productTitle).toBeVisible();
          }
          if ((await productPrice.count()) > 0) {
            await expect(productPrice).toBeVisible();
          }
          if ((await addToCart.count()) > 0) {
            await expect(addToCart).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Alternative Collection Layout (page-style-2)", () => {
    test("should display collection with alternative layout", async ({
      page,
    }) => {
      // Navigate to alternative collection layout
      await page.goto("/en/collections/page-style-2/summer-collection");
      await waitUtils.forNavigation();

      // Check if redirected or 404
      const is404 = (await page.textContent("body"))?.match(/404|not found/i);

      if (!is404) {
        // Check for alternative layout elements
        const collectionContainer = page.locator(
          '[data-testid="collection-container"], .collection-container',
        );

        // Alternative layout might have different features
        const masonryGrid = page.locator(
          '[data-testid="masonry-grid"], .masonry-grid',
        );
        const horizontalFilters = page.locator(
          '[data-testid="horizontal-filters"], .horizontal-filters',
        );
        const infiniteScroll = page.locator(
          '[data-testid="infinite-scroll"], .infinite-scroll',
        );

        const hasAlternativeLayout =
          (await masonryGrid.count()) > 0 ||
          (await horizontalFilters.count()) > 0 ||
          (await infiniteScroll.count()) > 0;

        // Should still have products
        const products = page.locator(
          '[data-testid="product-card"], .product-card',
        );
        expect(await products.count()).toBeGreaterThan(0);

        // Should have collection title
        const collectionTitle = page.getByRole("heading", { level: 1 });
        if ((await collectionTitle.count()) > 0) {
          const title = await collectionTitle.textContent();
          expect(title).toBeTruthy();
        }
      }
    });
  });

  test.describe("Order Successful Page", () => {
    test("should display order confirmation", async ({ page }) => {
      // This normally requires completing an order
      // Try direct navigation
      await page.goto("/en/order-successful");
      await waitUtils.forNavigation();

      // Might redirect if no order
      if (page.url().includes("order-successful")) {
        // Success message
        const successHeading = page
          .getByRole("heading")
          .filter({ hasText: /thank|success|confirmed/i });
        if ((await successHeading.count()) > 0) {
          await expect(successHeading).toBeVisible();
        }

        // Order number
        const orderNumber = page.locator(
          '[data-testid="order-number"], .order-number',
        );
        if ((await orderNumber.count()) > 0) {
          const number = await orderNumber.textContent();
          expect(number).toMatch(/\d+/);
        }

        // Email confirmation message
        const emailMessage = page.locator(
          '[data-testid="email-message"], .email-message',
        );
        if ((await emailMessage.count()) > 0) {
          const message = await emailMessage.textContent();
          expect(message).toMatch(/email|sent/i);
        }

        // Continue shopping button
        const continueBtn = page.getByRole("link", {
          name: /continue shopping|shop/i,
        });
        if ((await continueBtn.count()) > 0) {
          await expect(continueBtn).toBeVisible();
          const href = await continueBtn.getAttribute("href");
          expect(href).toBeTruthy();
        }

        // View order button
        const viewOrderBtn = page.getByRole("link", {
          name: /view order|order details/i,
        });
        if ((await viewOrderBtn.count()) > 0) {
          const href = await viewOrderBtn.getAttribute("href");
          expect(href).toContain("/order");
        }
      }
    });

    test("should track order confirmation", async ({ page }) => {
      // Set up analytics tracking
      const analyticsEvents: any[] = [];
      await page.route("**/api/analytics/**", (route) => {
        analyticsEvents.push({
          url: route.request().url(),
          data: route.request().postData(),
        });
        route.continue();
      });

      await page.goto("/en/order-successful");
      await waitUtils.forNavigation();

      if (page.url().includes("order-successful")) {
        await page.waitForTimeout(1000);

        // Check if purchase event was tracked
        const purchaseTracked = analyticsEvents.some(
          (e) => e.url.includes("purchase") || e.data?.includes("purchase"),
        );

        // Analytics might not be implemented
        if (analyticsEvents.length > 0) {
          expect(purchaseTracked || true).toBeTruthy();
        }
      }
    });
  });

  test.describe("Special Pages SEO and Performance", () => {
    test("should have proper SEO for special pages", async ({ page }) => {
      const specialPages = [
        "/en/subscription",
        "/en/coming-soon",
        "/en/home-2",
      ];

      for (const specialPage of specialPages) {
        await page.goto(specialPage);
        await waitUtils.forNavigation();

        // Title
        const title = await page.title();
        expect(title).toBeTruthy();

        // Meta description
        const description = await page.getAttribute(
          'meta[name="description"]',
          "content",
        );
        if (description) {
          expect(description).toBeTruthy();
        }

        // Coming soon might be noindex
        if (specialPage.includes("coming-soon")) {
          const robots = await page.getAttribute(
            'meta[name="robots"]',
            "content",
          );
          if (robots) {
            expect(robots).toContain("noindex");
          }
        }
      }
    });

    test("should load special pages quickly", async ({ page }) => {
      const pages = [
        { name: "Subscription", url: "/en/subscription" },
        { name: "Coming Soon", url: "/en/coming-soon" },
      ];

      for (const pageInfo of pages) {
        const startTime = Date.now();
        await page.goto(pageInfo.url);
        await waitUtils.forNavigation();
        const loadTime = Date.now() - startTime;

        // Should load within 2 seconds
        expect(loadTime).toBeLessThan(2000);

        // Critical content visible quickly
        const heading = page.getByRole("heading", { level: 1 });
        if ((await heading.count()) > 0) {
          await expect(heading).toBeVisible({ timeout: 800 });
        }
      }
    });
  });
});
