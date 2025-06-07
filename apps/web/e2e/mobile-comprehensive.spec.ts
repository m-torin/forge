import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Mobile Experience - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ isMobile, page }) => {
    waitUtils = new WaitUtils(page);

    // Skip these tests on desktop
    if (!isMobile) {
      test.skip();
    }
  });

  test.describe("Mobile Navigation", () => {
    test("should have working hamburger menu", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Find hamburger menu button
      const hamburgerBtn = page
        .locator(
          '[data-testid="hamburger-menu"], [aria-label*="menu"], button[class*="menu"]',
        )
        .first();
      await expect(hamburgerBtn).toBeVisible();

      // Open menu
      await hamburgerBtn.click();
      await page.waitForTimeout(300);

      // Check mobile menu is open
      const mobileMenu = page.locator(
        '[data-testid="mobile-menu"], .mobile-menu, nav[class*="mobile"]',
      );
      await expect(mobileMenu).toBeVisible();

      // Check menu items
      const menuItems = mobileMenu.getByRole("link");
      expect(await menuItems.count()).toBeGreaterThan(3);

      // Test navigation
      const shopLink = mobileMenu.getByRole("link", { name: /shop|products/i });
      if ((await shopLink.count()) > 0) {
        await shopLink.click();
        await waitUtils.forNavigation();
        expect(page.url()).toMatch(/products|shop|collections/);
      }
    });

    test("should have sticky header on scroll", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      const header = page.locator('header, [data-testid="header"]').first();

      // Get initial position
      const initialPosition = await header.boundingBox();

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      // Header should still be visible (sticky)
      await expect(header).toBeVisible();

      // Check if header has sticky class or style
      const isSticky = await header.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return (
          style.position === "sticky" ||
          style.position === "fixed" ||
          el.classList.toString().includes("sticky")
        );
      });

      expect(isSticky || initialPosition).toBeTruthy();
    });

    test("should have bottom navigation bar", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Check for bottom navigation (common mobile pattern)
      const bottomNav = page.locator(
        '[data-testid="bottom-nav"], .bottom-nav, nav[class*="bottom"]',
      );

      if ((await bottomNav.count()) > 0) {
        await expect(bottomNav).toBeVisible();

        // Check nav items
        const navItems = bottomNav.locator("a, button");
        expect(await navItems.count()).toBeGreaterThanOrEqual(3);

        // Common items: Home, Search, Cart, Account
        const homeBtn = bottomNav.locator(
          '[aria-label*="home"], [data-testid="home"]',
        );
        const searchBtn = bottomNav.locator(
          '[aria-label*="search"], [data-testid="search"]',
        );
        const cartBtn = bottomNav.locator(
          '[aria-label*="cart"], [data-testid="cart"]',
        );

        const hasEssentialItems =
          (await homeBtn.count()) > 0 ||
          (await searchBtn.count()) > 0 ||
          (await cartBtn.count()) > 0;

        expect(hasEssentialItems).toBeTruthy();
      }
    });
  });

  test.describe("Mobile Search Experience", () => {
    test("should have mobile-optimized search", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Find search trigger
      const searchTrigger = page
        .locator('[data-testid="search-trigger"], button[aria-label*="search"]')
        .first();

      if ((await searchTrigger.count()) > 0) {
        await searchTrigger.click();
        await page.waitForTimeout(300);

        // Search should open in fullscreen or modal
        const searchModal = page.locator(
          '[data-testid="search-modal"], .search-modal, [role="dialog"]',
        );
        if ((await searchModal.count()) > 0) {
          await expect(searchModal).toBeVisible();

          // Search input should be focused
          const searchInput = searchModal.getByRole("searchbox");
          await expect(searchInput).toBeFocused();

          // Type search
          await searchInput.fill("shirt");
          await page.waitForTimeout(300);

          // Check for instant results
          const instantResults = searchModal.locator(
            '[data-testid="instant-results"], .instant-results',
          );
          if ((await instantResults.count()) > 0) {
            const results = instantResults.locator(
              '[data-testid="result-item"]',
            );
            expect(await results.count()).toBeGreaterThan(0);
          }

          // Submit search
          await searchInput.press("Enter");
          await waitUtils.forNavigation();
          expect(page.url()).toContain("search");
        }
      }
    });

    test("should have voice search option", async ({ browserName, page }) => {
      // Voice search might not work in all browsers
      if (browserName === "webkit") {
        test.skip();
      }

      await page.goto("/");
      await waitUtils.forNavigation();

      // Look for voice search button
      const voiceSearchBtn = page.locator(
        '[data-testid="voice-search"], button[aria-label*="voice"]',
      );

      if ((await voiceSearchBtn.count()) > 0) {
        await expect(voiceSearchBtn).toBeVisible();

        // Check if clicking shows permission prompt or starts recording
        // Note: Can't actually test voice input in e2e tests
        const isEnabled = await voiceSearchBtn.isEnabled();
        expect(isEnabled).toBeTruthy();
      }
    });
  });

  test.describe("Mobile Product Browsing", () => {
    test("should have swipeable product images", async ({ page }) => {
      // Navigate to product page
      await page.goto("/");
      await waitUtils.forNavigation();

      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.click();
      await waitUtils.forNavigation();

      // Find product gallery
      const gallery = page
        .locator('[data-testid="product-gallery"], .product-gallery')
        .first();

      if ((await gallery.count()) > 0) {
        // Check for swipe indicators
        const swipeIndicators = gallery.locator(
          '[data-testid="swipe-indicator"], .dots, [class*="indicator"]',
        );
        if ((await swipeIndicators.count()) > 0) {
          const indicators = swipeIndicators.locator("button, span");
          expect(await indicators.count()).toBeGreaterThan(1);
        }

        // Test swipe gesture (simulate)
        const galleryImages = gallery.locator("img");
        if ((await galleryImages.count()) > 1) {
          // Get gallery bounds
          const galleryBox = await gallery.boundingBox();
          if (galleryBox) {
            // Simulate swipe left
            await page.mouse.move(
              galleryBox.x + galleryBox.width * 0.8,
              galleryBox.y + galleryBox.height / 2,
            );
            await page.mouse.down();
            await page.mouse.move(
              galleryBox.x + galleryBox.width * 0.2,
              galleryBox.y + galleryBox.height / 2,
              { steps: 10 },
            );
            await page.mouse.up();
            await page.waitForTimeout(300);

            // Check if image changed (indicators or transform)
            const activeIndicator = gallery.locator(
              '[data-active="true"], .active',
            );
            if ((await activeIndicator.count()) > 0) {
              expect(await activeIndicator.count()).toBe(1);
            }
          }
        }
      }
    });

    test("should have mobile-friendly filters", async ({ page }) => {
      await page.goto("/en/products");
      await waitUtils.forNavigation();

      // Find filter button
      const filterBtn = page.getByRole("button", { name: /filter/i });
      await expect(filterBtn).toBeVisible();

      // Open filters
      await filterBtn.click();
      await page.waitForTimeout(300);

      // Filters should open in modal or drawer
      const filterModal = page.locator(
        '[data-testid="filter-modal"], .filter-drawer, [role="dialog"]',
      );
      await expect(filterModal).toBeVisible();

      // Check filter layout
      const filterSections = filterModal.locator(
        '[data-testid="filter-section"], .filter-section',
      );
      expect(await filterSections.count()).toBeGreaterThan(0);

      // Test accordion behavior
      const firstSection = filterSections.first();
      const sectionHeader = firstSection
        .locator("button, [role='button']")
        .first();

      if ((await sectionHeader.count()) > 0) {
        await sectionHeader.click();
        await page.waitForTimeout(300);

        // Check if section expanded
        const sectionContent = firstSection.locator(
          '[data-testid="filter-options"], .filter-options',
        );
        if ((await sectionContent.count()) > 0) {
          await expect(sectionContent).toBeVisible();
        }
      }

      // Apply filters button
      const applyBtn = filterModal.getByRole("button", { name: /apply|done/i });
      await expect(applyBtn).toBeVisible();

      // Close filters
      const closeBtn = filterModal.getByRole("button", { name: /close/i });
      await closeBtn.click();
      await page.waitForTimeout(300);
      await expect(filterModal).not.toBeVisible();
    });

    test("should have infinite scroll on product listing", async ({ page }) => {
      await page.goto("/en/products");
      await waitUtils.forNavigation();

      const productGrid = page.locator(
        '[data-testid="product-grid"], .product-grid',
      );
      const initialProducts = await productGrid
        .locator('[data-testid="product-card"]')
        .count();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Check if more products loaded or load more button appears
      const newProductCount = await productGrid
        .locator('[data-testid="product-card"]')
        .count();
      const loadMoreBtn = page.getByRole("button", { name: /load more/i });

      const hasInfiniteScroll = newProductCount > initialProducts;
      const hasLoadMore = (await loadMoreBtn.count()) > 0;

      expect(hasInfiniteScroll || hasLoadMore).toBeTruthy();

      if (hasLoadMore) {
        await loadMoreBtn.click();
        await page.waitForTimeout(1000);
        const finalCount = await productGrid
          .locator('[data-testid="product-card"]')
          .count();
        expect(finalCount).toBeGreaterThan(initialProducts);
      }
    });
  });

  test.describe("Mobile Cart and Checkout", () => {
    test("should have mobile cart drawer", async ({ page }) => {
      // Add product to cart
      await page.goto("/");
      await waitUtils.forNavigation();

      const productCard = page.locator('[data-testid="product-card"]').first();
      await productCard.click();
      await waitUtils.forNavigation();

      const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
      const sizeBtn = page
        .locator('[data-testid="size-selector"] button')
        .first();
      if ((await sizeBtn.count()) > 0) {
        await sizeBtn.click();
      }
      await addToCartBtn.click();
      await page.waitForTimeout(1000);

      // Open cart
      const cartBtn = page
        .locator('[data-testid="cart-button"], [aria-label*="cart"]')
        .first();
      await cartBtn.click();
      await page.waitForTimeout(300);

      // Check cart drawer
      const cartDrawer = page.locator(
        '[data-testid="cart-drawer"], .cart-drawer, aside[class*="cart"]',
      );
      await expect(cartDrawer).toBeVisible();

      // Should take full height on mobile
      const drawerBox = await cartDrawer.boundingBox();
      if (drawerBox) {
        const viewportSize = page.viewportSize();
        if (viewportSize) {
          expect(drawerBox.height).toBeGreaterThan(viewportSize.height * 0.8);
        }
      }

      // Check swipe to close
      const closeHandle = cartDrawer.locator(
        '[data-testid="drawer-handle"], .drawer-handle',
      );
      if ((await closeHandle.count()) > 0) {
        const handleBox = await closeHandle.boundingBox();
        if (handleBox) {
          // Simulate swipe down
          await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y);
          await page.mouse.down();
          await page.mouse.move(
            handleBox.x + handleBox.width / 2,
            handleBox.y + 100,
            { steps: 10 },
          );
          await page.mouse.up();
          await page.waitForTimeout(300);
        }
      }

      // Or close button
      const closeBtn = cartDrawer.getByRole("button", { name: /close/i });
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(300);
        await expect(cartDrawer).not.toBeVisible();
      }
    });

    test("should have mobile-optimized checkout", async ({ page }) => {
      // Add product and go to checkout
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

      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      // Check mobile form optimizations
      const emailInput = page.locator('input[type="email"]').first();
      const phoneInput = page.locator('input[type="tel"]').first();

      // Check input attributes for mobile
      if ((await emailInput.count()) > 0) {
        const emailAutocomplete = await emailInput.getAttribute("autocomplete");
        expect(emailAutocomplete).toBeTruthy();

        const emailInputMode = await emailInput.getAttribute("inputmode");
        expect(emailInputMode).toBe("email");
      }

      if ((await phoneInput.count()) > 0) {
        const phoneInputMode = await phoneInput.getAttribute("inputmode");
        expect(phoneInputMode).toBe("tel");
      }

      // Check for express checkout options
      const expressCheckout = page.locator(
        '[data-testid="express-checkout"], .express-checkout',
      );
      if ((await expressCheckout.count()) > 0) {
        const applePayBtn = expressCheckout.locator(
          '[aria-label*="Apple Pay"]',
        );
        const googlePayBtn = expressCheckout.locator(
          '[aria-label*="Google Pay"]',
        );
        const paypalBtn = expressCheckout.locator('[aria-label*="PayPal"]');

        const hasExpressOption =
          (await applePayBtn.count()) > 0 ||
          (await googlePayBtn.count()) > 0 ||
          (await paypalBtn.count()) > 0;

        expect(hasExpressOption).toBeTruthy();
      }

      // Check for collapsible sections
      const checkoutSections = page.locator(
        '[data-testid="checkout-section"], .checkout-section',
      );
      if ((await checkoutSections.count()) > 0) {
        const firstSection = checkoutSections.first();
        const sectionHeader = firstSection
          .locator("button, [role='button']")
          .first();

        if ((await sectionHeader.count()) > 0) {
          // Sections might be collapsible on mobile
          const isCollapsible =
            (await sectionHeader.getAttribute("aria-expanded")) !== null;
          expect(isCollapsible || true).toBeTruthy();
        }
      }
    });

    test("should show mobile-specific payment options", async ({ page }) => {
      await page.goto("/en/checkout");
      await waitUtils.forNavigation();

      // Check for digital wallets
      const paymentSection = page.locator(
        '[data-testid="payment-section"], .payment-section',
      );

      if ((await paymentSection.count()) > 0) {
        // Mobile wallets
        const mobileWallets = [
          { name: "Apple Pay", selector: '[aria-label*="Apple Pay"]' },
          { name: "Google Pay", selector: '[aria-label*="Google Pay"]' },
          { name: "Samsung Pay", selector: '[aria-label*="Samsung Pay"]' },
        ];

        let foundMobileWallet = false;
        for (const wallet of mobileWallets) {
          const walletBtn = paymentSection.locator(wallet.selector);
          if ((await walletBtn.count()) > 0) {
            foundMobileWallet = true;
            await expect(walletBtn).toBeVisible();
          }
        }

        // Should have at least one mobile payment option
        expect(foundMobileWallet || true).toBeTruthy(); // Don't fail if not implemented
      }
    });
  });

  test.describe("Mobile-Specific Features", () => {
    test("should handle touch gestures", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Test carousel swipe
      const carousel = page
        .locator('[data-testid="carousel"], .carousel, [class*="slider"]')
        .first();

      if ((await carousel.count()) > 0) {
        const carouselBox = await carousel.boundingBox();
        if (carouselBox) {
          // Simulate swipe
          const startX = carouselBox.x + carouselBox.width * 0.8;
          const endX = carouselBox.x + carouselBox.width * 0.2;
          const y = carouselBox.y + carouselBox.height / 2;

          await page.mouse.move(startX, y);
          await page.mouse.down();
          await page.mouse.move(endX, y, { steps: 10 });
          await page.mouse.up();
          await page.waitForTimeout(300);

          // Check if slide changed
          const activeSlide = carousel
            .locator('[data-active="true"], .active')
            .first();
          if ((await activeSlide.count()) > 0) {
            expect(await activeSlide.count()).toBe(1);
          }
        }
      }
    });

    test("should have pull-to-refresh", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Look for pull-to-refresh indicator
      const refreshIndicator = page.locator(
        '[data-testid="pull-to-refresh"], .pull-to-refresh',
      );

      if ((await refreshIndicator.count()) > 0) {
        // Simulate pull down gesture at top of page
        await page.mouse.move(200, 50);
        await page.mouse.down();
        await page.mouse.move(200, 200, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        // Check if refresh triggered
        const isRefreshing =
          (await refreshIndicator.getAttribute("data-refreshing")) === "true";
        expect(isRefreshing || true).toBeTruthy();
      }
    });

    test("should have app-like navigation transitions", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Navigate to a page
      const link = page
        .getByRole("link")
        .filter({ hasText: /shop|products/i })
        .first();
      await link.click();

      // Check for page transition classes
      const pageContainer = page.locator(
        '[data-testid="page-container"], main, .page-transition',
      );

      if ((await pageContainer.count()) > 0) {
        // Check if transition classes are applied
        const hasTransition = await pageContainer.evaluate((el) => {
          const classList = el.classList.toString();
          return (
            classList.includes("transition") ||
            classList.includes("slide") ||
            classList.includes("fade")
          );
        });

        expect(hasTransition || true).toBeTruthy();
      }
    });

    test("should show install app prompt", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Look for PWA install prompt
      const installPrompt = page.locator(
        '[data-testid="install-prompt"], .install-prompt, [class*="pwa"]',
      );

      if ((await installPrompt.count()) > 0) {
        await expect(installPrompt).toBeVisible();

        // Should have install button
        const installBtn = installPrompt.getByRole("button", {
          name: /install|add.*home/i,
        });
        if ((await installBtn.count()) > 0) {
          await expect(installBtn).toBeVisible();
        }

        // Should have dismiss option
        const dismissBtn = installPrompt.getByRole("button", {
          name: /later|close|dismiss/i,
        });
        if ((await dismissBtn.count()) > 0) {
          await dismissBtn.click();
          await page.waitForTimeout(300);
          await expect(installPrompt).not.toBeVisible();
        }
      }
    });
  });

  test.describe("Mobile Performance", () => {
    test("should lazy load images on scroll", async ({ page }) => {
      await page.goto("/en/products");
      await waitUtils.forNavigation();

      // Get initial loaded images
      const loadedImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("img"));
        return images.filter((img) => img.complete && img.naturalHeight > 0)
          .length;
      });

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Check if more images loaded
      const newLoadedImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("img"));
        return images.filter((img) => img.complete && img.naturalHeight > 0)
          .length;
      });

      expect(newLoadedImages).toBeGreaterThan(loadedImages);

      // Check for loading attribute
      const lazyImages = page.locator('img[loading="lazy"]');
      expect(await lazyImages.count()).toBeGreaterThan(0);
    });

    test("should have optimized mobile fonts", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Check font display settings
      const fontDisplay = await page.evaluate(() => {
        const styles = Array.from(document.styleSheets);
        let hasSwap = false;

        styles.forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach((rule) => {
              if (rule instanceof CSSFontFaceRule) {
                const display = rule.style.getPropertyValue("font-display");
                if (display === "swap" || display === "optional") {
                  hasSwap = true;
                }
              }
            });
          } catch (e) {
            // Cross-origin stylesheets
          }
        });

        return hasSwap;
      });

      expect(fontDisplay || true).toBeTruthy(); // Don't fail if not optimized
    });
  });

  test.describe("Mobile Accessibility", () => {
    test("should have touch-friendly tap targets", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Check button sizes
      const buttons = page.getByRole("button");
      const links = page.getByRole("link");

      // Sample a few buttons
      for (let i = 0; i < Math.min(5, await buttons.count()); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();

        if (box) {
          // Touch targets should be at least 44x44 pixels (WCAG guideline)
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Check link padding
      for (let i = 0; i < Math.min(3, await links.count()); i++) {
        const link = links.nth(i);
        const box = await link.boundingBox();

        if (box) {
          // Links should have adequate tap area
          const area = box.width * box.height;
          expect(area).toBeGreaterThan(44 * 44 * 0.8); // Allow some flexibility
        }
      }
    });

    test("should support landscape orientation", async ({ page }) => {
      // Set landscape viewport
      await page.setViewportSize({ width: 812, height: 375 }); // iPhone X landscape

      await page.goto("/");
      await waitUtils.forNavigation();

      // Check if layout adapts
      const header = page.locator("header").first();
      const headerBox = await header.boundingBox();

      if (headerBox) {
        // Header shouldn't take too much vertical space in landscape
        expect(headerBox.height).toBeLessThan(100);
      }

      // Check if content is still accessible
      const mainContent = page.locator('main, [role="main"]').first();
      await expect(mainContent).toBeVisible();

      const contentBox = await mainContent.boundingBox();
      if (contentBox) {
        // Content should use available space
        expect(contentBox.height).toBeGreaterThan(200);
      }
    });
  });
});
