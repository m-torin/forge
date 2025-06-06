import { expect, test } from "@repo/testing/e2e";
import { ResponsiveTestUtils, WaitUtils } from "@repo/testing/e2e";

test.describe("Responsive Design", () => {
  let waitUtils: WaitUtils;
  let _responsiveUtils: ResponsiveTestUtils;

  const viewports = {
    desktop: { width: 1280, height: 720 },
    desktopLarge: { width: 1920, height: 1080 },
    mobile: { width: 375, height: 667 },
    mobileLandscape: { width: 667, height: 375 },
    tablet: { width: 768, height: 1024 },
    tabletLandscape: { width: 1024, height: 768 },
  };

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    responsiveUtils = new ResponsiveTestUtils(page);
  });

  test("should be responsive on mobile devices", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check if mobile navigation is working
    const mobileMenu = page.getByRole("button", {
      name: /menu|hamburger|navigation/i,
    });
    const mobileMenuIcon = page.locator(
      '[data-testid="mobile-menu"], .mobile-menu, .hamburger',
    );

    const menuButton =
      (await mobileMenu.count()) > 0 ? mobileMenu : mobileMenuIcon;

    if ((await menuButton.count()) > 0) {
      await expect(menuButton.first()).toBeVisible();

      // Test mobile menu functionality
      await menuButton.first().click();
      await page.waitForTimeout(300);

      // Navigation should be visible after clicking
      const navigation = page.getByRole("navigation");
      if ((await navigation.count()) > 0) {
        await expect(navigation.first()).toBeVisible();
      }
    }

    // Check if content is properly stacked on mobile
    const body = page.locator("body");
    const width = await body.boundingBox();
    expect(width?.width).toBeLessThanOrEqual(viewports.mobile.width);
  });

  test("should adapt layout for tablet", async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check if layout adapts for tablet
    const container = page.locator(".container, .max-w-7xl, .mx-auto").first();

    if ((await container.count()) > 0) {
      const boundingBox = await container.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(viewports.tablet.width);
    }

    // Tablet should show more content than mobile but less than desktop
    const gridItems = page.locator('[class*="grid"], [class*="flex"]');
    if ((await gridItems.count()) > 0) {
      const styles = await gridItems.first().evaluate((el) => {
        return (
          window.getComputedStyle(el).gridTemplateColumns ||
          window.getComputedStyle(el).flexDirection
        );
      });
      expect(styles).toBeTruthy();
    }
  });

  test("should display full layout on desktop", async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto("/");
    await waitUtils.forNavigation();

    // Desktop should show full navigation
    const navigation = page.getByRole("navigation");
    if ((await navigation.count()) > 0) {
      await expect(navigation.first()).toBeVisible();
    }

    // Should not show mobile menu button
    const mobileMenuButton = page.getByRole("button", {
      name: /menu|hamburger/i,
    });
    if ((await mobileMenuButton.count()) > 0) {
      const isVisible = await mobileMenuButton.first().isVisible();
      expect(isVisible).toBeFalsy();
    }

    // Content should be laid out horizontally where appropriate
    const mainContent = page.locator("main, .main-content").first();
    if ((await mainContent.count()) > 0) {
      const width = await mainContent.boundingBox();
      expect(width?.width).toBeGreaterThan(800);
    }
  });

  test("should handle touch interactions on mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/");
    await waitUtils.forNavigation();

    // Test touch interactions
    const button = page.getByRole("button").first();

    if ((await button.count()) > 0) {
      // Should respond to touch events
      await button.tap();
      await page.waitForTimeout(300);

      // Button should remain functional
      await expect(button).toBeVisible();
    }

    // Test swipe gestures if carousel exists
    const carousel = page.locator(
      '[class*="carousel"], [class*="slider"], [data-testid="carousel"]',
    );

    if ((await carousel.count()) > 0) {
      const boundingBox = await carousel.first().boundingBox();

      if (boundingBox) {
        // Simulate swipe gesture
        await page.mouse.move(
          boundingBox.x + boundingBox.width * 0.8,
          boundingBox.y + boundingBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          boundingBox.x + boundingBox.width * 0.2,
          boundingBox.y + boundingBox.height / 2,
        );
        await page.mouse.up();

        await page.waitForTimeout(500);
        // Carousel should respond to swipe
        expect(await carousel.first().isVisible()).toBeTruthy();
      }
    }
  });

  test("should have appropriate font sizes for different screens", async ({
    page,
  }) => {
    const testPages = ["/", "/about", "/contact"];

    for (const testPage of testPages) {
      await page.goto(testPage);
      await waitUtils.forNavigation();

      // Test mobile font sizes
      await page.setViewportSize(viewports.mobile);
      await page.waitForTimeout(300);

      const mobileHeading = page.locator("h1, h2, h3").first();
      if ((await mobileHeading.count()) > 0) {
        const mobileFontSize = await mobileHeading.evaluate((el) =>
          parseInt(window.getComputedStyle(el).fontSize),
        );

        // Test desktop font sizes
        await page.setViewportSize(viewports.desktop);
        await page.waitForTimeout(300);

        const desktopFontSize = await mobileHeading.evaluate((el) =>
          parseInt(window.getComputedStyle(el).fontSize),
        );

        // Desktop font should be larger or equal to mobile
        expect(desktopFontSize).toBeGreaterThanOrEqual(mobileFontSize);
      }
    }
  });

  test("should handle orientation changes", async ({ page }) => {
    // Start in portrait
    await page.setViewportSize(viewports.mobile);
    await page.goto("/");
    await waitUtils.forNavigation();

    const portraitLayout = await page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        orientation:
          window.innerWidth < window.innerHeight ? "portrait" : "landscape",
      };
    });

    expect(portraitLayout.orientation).toBe("portrait");

    // Switch to landscape
    await page.setViewportSize(viewports.mobileLandscape);
    await page.waitForTimeout(500);

    const landscapeLayout = await page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        orientation:
          window.innerWidth < window.innerHeight ? "portrait" : "landscape",
      };
    });

    expect(landscapeLayout.orientation).toBe("landscape");

    // Layout should adapt to orientation change
    expect(landscapeLayout.width).toBeGreaterThan(portraitLayout.width);
    expect(landscapeLayout.height).toBeLessThan(portraitLayout.height);
  });

  test("should display images responsively", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (const viewport of Object.values(viewports)) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(300);

        const firstImage = images.first();
        const imageBounds = await firstImage.boundingBox();

        if (imageBounds) {
          // Image should not exceed viewport width
          expect(imageBounds.width).toBeLessThanOrEqual(viewport.width);

          // Image should maintain aspect ratio
          const aspectRatio = imageBounds.width / imageBounds.height;
          expect(aspectRatio).toBeGreaterThan(0.1);
          expect(aspectRatio).toBeLessThan(10);
        }
      }
    }
  });

  test("should have accessible touch targets on mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check button sizes for touch accessibility
    const buttons = page.locator('button, a, [role="button"]');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();

      if (boundingBox) {
        // Touch targets should be at least 44px (Apple) or 48dp (Material Design)
        const minSize = 44;
        expect(boundingBox.width).toBeGreaterThanOrEqual(minSize - 10); // Allow some tolerance
        expect(boundingBox.height).toBeGreaterThanOrEqual(minSize - 10);
      }
    }
  });

  test("should handle form elements responsively", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    const forms = page.locator("form");

    if ((await forms.count()) > 0) {
      const form = forms.first();

      for (const viewport of [
        viewports.mobile,
        viewports.tablet,
        viewports.desktop,
      ]) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(300);

        const inputs = form.locator("input, textarea, select");
        const inputCount = await inputs.count();

        if (inputCount > 0) {
          const firstInput = inputs.first();
          const inputBounds = await firstInput.boundingBox();

          if (inputBounds) {
            // Input should not exceed container width
            expect(inputBounds.width).toBeLessThanOrEqual(viewport.width - 40); // Account for padding

            // Input should be large enough for touch on mobile
            if (viewport.width <= 768) {
              expect(inputBounds.height).toBeGreaterThanOrEqual(40);
            }
          }
        }
      }
    }
  });

  test("should handle tables responsively", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    const tables = page.locator("table");

    if ((await tables.count()) > 0) {
      const table = tables.first();

      // Test on mobile
      await page.setViewportSize(viewports.mobile);
      await page.waitForTimeout(300);

      const tableBounds = await table.boundingBox();

      if (tableBounds) {
        // Table should handle overflow on mobile
        const parentOverflow = await table.evaluate((el) => {
          const parent = el.parentElement;
          return parent ? window.getComputedStyle(parent).overflowX : "visible";
        });

        // Should have horizontal scroll or be responsive
        expect(
          ["auto", "hidden", "scroll"].includes(parentOverflow) ||
            tableBounds.width <= viewports.mobile.width,
        ).toBeTruthy();
      }
    }
  });

  test("should maintain performance across viewports", async ({ page }) => {
    const performanceMetrics = [];

    for (const [name, viewport] of Object.entries(viewports)) {
      await page.setViewportSize(viewport);

      const startTime = Date.now();
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const loadTime = Date.now() - startTime;

      performanceMetrics.push({ loadTime, viewport: name });

      // Should load within reasonable time on all viewports
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    }

    // Mobile shouldn't be significantly slower than desktop
    const mobile = performanceMetrics.find((m) => m.viewport === "mobile");
    const desktop = performanceMetrics.find((m) => m.viewport === "desktop");

    if (mobile && desktop) {
      // Mobile should not be more than 3x slower than desktop
      expect(mobile.loadTime / desktop.loadTime).toBeLessThan(3);
    }
  });

  test("should have proper spacing and layout at all breakpoints", async ({
    page,
  }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    for (const [_name, viewport] of Object.entries(viewports)) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);

      // Check for horizontal scrollbars
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });

      // Should not have horizontal scroll except for tables/code blocks
      if (hasHorizontalScroll) {
        // Check if it's intentional (tables, code, etc.)
        const intentionalOverflow = await page
          .locator("table, pre, code, .overflow-x-auto, .overflow-x-scroll")
          .count();
        expect(intentionalOverflow).toBeGreaterThan(0);
      }

      // Check content doesn't overflow viewport
      const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Small tolerance for scrollbars
    }
  });
});
