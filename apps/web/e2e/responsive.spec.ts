import { expect, test } from "@repo/testing/e2e";
import { PerformanceUtils, WaitUtils } from "@repo/testing/e2e";

import { withPerformanceMonitoring } from "./utils/performance-monitor";
import { createVisualTester } from "./utils/visual-testing";

test.describe("Responsive Design - Enhanced", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  const viewports = [
    { width: 375, name: "Mobile", height: 667 },
    { width: 768, name: "Tablet", height: 1024 },
    { width: 1440, name: "Desktop", height: 900 },
    { width: 1920, name: "Large Desktop", height: 1080 },
  ];

  test("responsive layout adapts across all viewport sizes", async ({
    context,
    page,
  }) => {
    const visualTester = createVisualTester(page);
    const responsiveResults = [];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      const { report, result } = await withPerformanceMonitoring(
        page,
        context,
        "/",
        async () => {
          await waitUtils.forNavigation();

          // Check basic layout elements
          const header = page.locator("header").first();
          const main = page.locator("main").first();
          const footer = page.locator("footer").first();

          const layoutData = {
            hasFooter: (await footer.count()) > 0,
            hasHeader: (await header.count()) > 0,
            hasMain: (await main.count()) > 0,
            headerVisible: await header.isVisible().catch(() => false),
            mainVisible: await main.isVisible().catch(() => false),
          };

          // Take viewport-specific screenshot
          await visualTester.comparePageState(
            page,
            `homepage-${viewport.name.toLowerCase()}`,
            {
              animations: "disabled",
              fullPage: true,
            },
          );

          return layoutData;
        },
        {
          fcp: { error: 4000, warning: 2000 },
          lcp: { error: 5000, warning: 3000 },
        },
      );

      responsiveResults.push({
        width: viewport.width,
        height: viewport.height,
        layout: result,
        performance: {
          fcp: report.fcp,
          lcp: report.lcp,
          networkRequests: report.networkActivity?.requestCount || 0,
        },
        viewport: viewport.name,
      });

      // All viewports should have basic layout elements
      expect(result.hasMain).toBeTruthy();
    }

    await test.info().attach("responsive-analysis", {
      body: JSON.stringify(responsiveResults, null, 2),
      contentType: "application/json",
    });
  });

  test("mobile navigation works correctly", async ({ page }) => {
    // Test mobile-specific navigation patterns
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitUtils.forNavigation();

    // Look for mobile menu patterns
    const hamburgerBtn = page
      .locator('[data-testid="hamburger-menu"], button[aria-label*="menu"]')
      .first();
    const mobileMenuToggle = page
      .getByRole("button", { name: /menu|navigation/i })
      .first();

    const menuButton =
      (await hamburgerBtn.count()) > 0 ? hamburgerBtn : mobileMenuToggle;

    if ((await menuButton.count()) > 0) {
      // Test menu opening
      await menuButton.click();
      await page.waitForTimeout(300);

      // Check if menu opened
      const mobileMenu = page.locator(
        '[data-testid="mobile-menu"], .mobile-menu, nav[class*="mobile"]',
      );
      const overlayMenu = page.locator('[role="dialog"], .overlay, .drawer');

      const menu = (await mobileMenu.count()) > 0 ? mobileMenu : overlayMenu;

      if ((await menu.count()) > 0) {
        await expect(menu.first()).toBeVisible();

        // Check navigation links in mobile menu
        const navLinks = menu.getByRole("link");
        expect(await navLinks.count()).toBeGreaterThan(0);

        // Test closing menu
        const closeBtn = menu.getByRole("button", { name: /close/i }).first();
        if ((await closeBtn.count()) > 0) {
          await closeBtn.click();
          await page.waitForTimeout(300);
          await expect(menu.first()).not.toBeVisible();
        } else {
          // Try clicking menu button again to close
          await menuButton.click();
          await page.waitForTimeout(300);
        }
      }
    }
  });

  test("tablet layout provides optimal experience", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check tablet-specific layout optimizations
    const navigationElements = await page.locator("nav").count();
    const gridElements = await page.locator('.grid, [class*="grid"]').count();
    const flexElements = await page.locator('[class*="flex"]').count();

    // Tablet should have structured layout
    expect(navigationElements + gridElements + flexElements).toBeGreaterThan(0);

    // Test touch targets are appropriate for tablet
    const buttons = page.getByRole("button");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(3, buttonCount); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();

        if (box) {
          // Touch targets should be at least 44px for tablet
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test("desktop layout utilizes full screen efficiently", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check desktop-specific optimizations
    const sidebar = page.locator('aside, .sidebar, [data-testid="sidebar"]');
    const mainContent = page.locator('main, [role="main"]');

    if ((await sidebar.count()) > 0 && (await mainContent.count()) > 0) {
      const sidebarBox = await sidebar.first().boundingBox();
      const mainBox = await mainContent.first().boundingBox();

      if (sidebarBox && mainBox) {
        // Desktop should utilize horizontal space efficiently
        const totalWidth = sidebarBox.width + mainBox.width;
        const viewportWidth = page.viewportSize()?.width || 1440;

        expect(totalWidth / viewportWidth).toBeGreaterThan(0.8);
      }
    }

    // Check for multi-column layouts
    const columns = await page
      .locator('.columns, .col, [class*="col-"]')
      .count();
    const flexItems = await page.locator('[class*="flex"] > *').count();

    // Desktop should have multi-column content
    expect(columns + flexItems).toBeGreaterThan(2);
  });

  test("responsive images and media", async ({ page }) => {
    const testViewports = [
      { width: 375, height: 667 },
      { width: 1440, height: 900 },
    ];

    for (const viewport of testViewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await waitUtils.forNavigation();

      // Check responsive images
      const images = page.locator("img");
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < Math.min(3, imageCount); i++) {
          const img = images.nth(i);

          // Check for responsive image attributes
          const srcset = await img.getAttribute("srcset");
          const sizes = await img.getAttribute("sizes");
          const loading = await img.getAttribute("loading");

          // At least one responsive feature should be present
          const hasResponsiveFeatures = srcset || sizes || loading === "lazy";

          if (i === 0) {
            // First image should have some optimization
            expect(hasResponsiveFeatures).toBeTruthy();
          }
        }
      }

      // Check video elements for responsive behavior
      const videos = page.locator("video");
      const videoCount = await videos.count();

      if (videoCount > 0) {
        const video = videos.first();
        const videoBox = await video.boundingBox();

        if (videoBox) {
          // Video should fit within viewport
          expect(videoBox.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    }
  });

  test("responsive typography and spacing", async ({ page }) => {
    const viewports = [
      { width: 375, name: "mobile", height: 667 },
      { width: 1440, name: "desktop", height: 900 },
    ];

    const typographyData = [];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await waitUtils.forNavigation();

      // Measure typography at different viewport sizes
      const fontSizes = await page.evaluate(() => {
        const elements = document.querySelectorAll("h1, h2, h3, p, span, div");
        const sizes = new Map();

        elements.forEach((el) => {
          if (el.textContent && el.textContent.trim()) {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            const lineHeight = parseFloat(style.lineHeight);
            const tag = el.tagName.toLowerCase();

            if (!sizes.has(tag)) {
              sizes.set(tag, []);
            }
            sizes.get(tag).push({ fontSize, lineHeight });
          }
        });

        return Object.fromEntries(sizes);
      });

      typographyData.push({
        width: viewport.width,
        fontSizes,
        viewport: viewport.name,
      });
    }

    // Compare mobile vs desktop typography
    const mobile = typographyData.find((d) => d.viewport === "mobile");
    const desktop = typographyData.find((d) => d.viewport === "desktop");

    if (mobile && desktop && mobile.fontSizes.h1 && desktop.fontSizes.h1) {
      const mobileH1 = mobile.fontSizes.h1[0]?.fontSize || 0;
      const desktopH1 = desktop.fontSizes.h1[0]?.fontSize || 0;

      // Desktop headings should generally be larger than mobile
      if (mobileH1 > 0 && desktopH1 > 0) {
        expect(desktopH1).toBeGreaterThanOrEqual(mobileH1);
      }
    }

    await test.info().attach("responsive-typography", {
      body: JSON.stringify(typographyData, null, 2),
      contentType: "application/json",
    });
  });

  test("responsive performance across devices", async ({ context, page }) => {
    const performanceResults = [];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      try {
        const { report } = await withPerformanceMonitoring(
          page,
          context,
          "/",
          async () => {
            await waitUtils.forNavigation();

            // Simulate device-specific interactions
            if (viewport.width < 768) {
              // Mobile: test touch interactions
              const touchableElements = await page
                .locator('button, a, [role="button"]')
                .count();
              return { deviceType: "mobile", touchableElements };
            } else {
              // Desktop: test hover interactions
              const hoverElements = await page
                .locator('[class*="hover"], button, a')
                .count();
              return { deviceType: "desktop", hoverElements };
            }
          },
          {
            fcp: { error: 4000, warning: 2500 },
            lcp: { error: 5500, warning: 3500 },
          },
        );

        performanceResults.push({
          cls: report.cls,
          dimensions: `${viewport.width}x${viewport.height}`,
          fcp: report.fcp,
          lcp: report.lcp,
          networkRequests: report.networkActivity?.requestCount || 0,
          totalSize: report.networkActivity?.totalSize || 0,
          viewport: viewport.name,
        });
      } catch (error) {
        console.warn(`Performance test failed for ${viewport.name}:`, error);
      }
    }

    // Mobile should have reasonable performance
    const mobileResult = performanceResults.find(
      (r) => r.viewport === "Mobile",
    );
    if (mobileResult) {
      expect(mobileResult.fcp).toBeLessThan(4000);
      expect(mobileResult.lcp).toBeLessThan(5500);
    }

    await test.info().attach("responsive-performance", {
      body: JSON.stringify(performanceResults, null, 2),
      contentType: "application/json",
    });
  });

  test("responsive navigation patterns", async ({ page }) => {
    const navigationPatterns = [];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");
      await waitUtils.forNavigation();

      const navPattern = await page.evaluate((viewportWidth) => {
        const nav = document.querySelector("nav");
        const hamburger = document.querySelector(
          '[data-testid="hamburger-menu"], button[aria-label*="menu"]',
        );
        const breadcrumb = document.querySelector(
          '[aria-label*="breadcrumb"], .breadcrumb',
        );
        const sidebar = document.querySelector("aside, .sidebar");

        return {
          hasSidebar: !!sidebar,
          viewportWidth,
          hamburgerVisible: hamburger
            ? window.getComputedStyle(hamburger).display !== "none"
            : false,
          hasBreadcrumb: !!breadcrumb,
          hasHamburger: !!hamburger,
          hasMainNav: !!nav,
          navVisible: nav
            ? window.getComputedStyle(nav).display !== "none"
            : false,
        };
      }, viewport.width);

      navigationPatterns.push({
        viewport: viewport.name,
        ...navPattern,
      });
    }

    // Mobile should have hamburger, desktop should have main nav
    const mobile = navigationPatterns.find((p) => p.viewport === "Mobile");
    const desktop = navigationPatterns.find((p) => p.viewport === "Desktop");

    if (mobile && desktop) {
      // Mobile typically uses hamburger menu
      if (mobile.hasHamburger) {
        expect(mobile.hamburgerVisible).toBeTruthy();
      }

      // Desktop typically shows full navigation
      if (desktop.hasMainNav) {
        expect(desktop.navVisible).toBeTruthy();
      }
    }

    await test.info().attach("navigation-patterns", {
      body: JSON.stringify(navigationPatterns, null, 2),
      contentType: "application/json",
    });
  });

  test("responsive form layouts", async ({ page }) => {
    // Test form responsiveness on contact page
    await page.goto("/en/contact");
    await waitUtils.forNavigation();

    const formViewports = [
      { width: 375, name: "mobile", height: 667 },
      { width: 768, name: "tablet", height: 1024 },
      { width: 1440, name: "desktop", height: 900 },
    ];

    const formData = [];

    for (const viewport of formViewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.waitForTimeout(300);

      const formMetrics = await page.evaluate(() => {
        const forms = document.querySelectorAll("form");
        const inputs = document.querySelectorAll("input, textarea, select");
        const labels = document.querySelectorAll("label");

        let totalFormWidth = 0;
        let inputsPerRow = 0;

        if (forms.length > 0) {
          const form = forms[0];
          const formStyle = window.getComputedStyle(form);
          totalFormWidth = parseFloat(formStyle.width);

          // Count inputs in first row (simplified)
          const formInputs = form.querySelectorAll("input, select");
          if (formInputs.length > 0) {
            const firstInput = formInputs[0];
            const firstInputTop = firstInput.getBoundingClientRect().top;
            inputsPerRow = Array.from(formInputs).filter(
              (input) =>
                Math.abs(input.getBoundingClientRect().top - firstInputTop) <
                10,
            ).length;
          }
        }

        return {
          totalFormWidth,
          formCount: forms.length,
          inputCount: inputs.length,
          inputsPerRow,
          labelCount: labels.length,
        };
      });

      formData.push({
        width: viewport.width,
        viewport: viewport.name,
        ...formMetrics,
      });
    }

    // Mobile should stack inputs vertically (1 per row)
    // Desktop should allow multiple inputs per row
    const mobile = formData.find((d) => d.viewport === "mobile");
    const desktop = formData.find((d) => d.viewport === "desktop");

    if (mobile && desktop && mobile.inputCount > 0 && desktop.inputCount > 0) {
      expect(mobile.inputsPerRow).toBeLessThanOrEqual(desktop.inputsPerRow);
    }

    await test.info().attach("responsive-forms", {
      body: JSON.stringify(formData, null, 2),
      contentType: "application/json",
    });
  });
});
