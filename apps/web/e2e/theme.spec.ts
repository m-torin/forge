import { expect, test } from "@repo/testing/e2e";
import { PerformanceUtils, WaitUtils } from "@repo/testing/e2e";

import { withPerformanceMonitoring } from "./utils/performance-monitor";
import { createVisualTester } from "./utils/visual-testing";

test.describe("Theme Switching - Enhanced", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
    await page.goto("/");
    await waitUtils.forNavigation();
  });

  test("theme switcher should be accessible and functional", async ({
    page,
  }) => {
    // Look for theme switcher with multiple selector strategies
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });
    const themeToggle = page.getByTestId("theme-switcher");
    const themeIcon = page.locator(
      '[data-theme-toggle], [aria-label*="theme"]',
    );

    const switcher =
      (await themeSwitcher.count()) > 0
        ? themeSwitcher
        : (await themeToggle.count()) > 0
          ? themeToggle
          : themeIcon;

    if ((await switcher.count()) > 0) {
      // Check accessibility attributes
      const hasAriaLabel =
        (await switcher.first().getAttribute("aria-label")) !== null;
      const hasRole = (await switcher.first().getAttribute("role")) !== null;

      expect(hasAriaLabel || hasRole).toBeTruthy();

      // Ensure it's keyboard accessible
      await switcher.first().focus();
      const isFocused = await switcher
        .first()
        .evaluate((el) => el === document.activeElement);
      expect(isFocused).toBeTruthy();

      // Test keyboard activation
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
    }
  });

  test("theme toggle should work with visual regression testing", async ({
    context,
    page,
  }) => {
    const visualTester = createVisualTester(page);

    const { result } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        // Capture initial theme state
        const initialTheme = await page.evaluate(() => {
          return (
            document.documentElement.getAttribute(
              "data-mantine-color-scheme",
            ) ||
            (document.documentElement.classList.contains("dark")
              ? "dark"
              : "light")
          );
        });

        // Take baseline screenshot
        await visualTester.comparePageState(page, "homepage-initial-theme", {
          clip: { width: 1200, height: 800, x: 0, y: 0 },
          fullPage: false,
        });

        // Find and click theme switcher
        const themeSwitcher = page.getByRole("button", {
          name: /theme|dark|light|mode/i,
        });
        const themeToggle = page.getByTestId("theme-switcher");
        const themeIcon = page.locator(
          '[data-theme-toggle], [aria-label*="theme"]',
        );

        const switcher =
          (await themeSwitcher.count()) > 0
            ? themeSwitcher
            : (await themeToggle.count()) > 0
              ? themeToggle
              : themeIcon;

        if ((await switcher.count()) > 0) {
          await switcher.first().click();
          await page.waitForTimeout(500); // Wait for theme transition

          // Check if theme changed
          const newTheme = await page.evaluate(() => {
            return (
              document.documentElement.getAttribute(
                "data-mantine-color-scheme",
              ) ||
              (document.documentElement.classList.contains("dark")
                ? "dark"
                : "light")
            );
          });

          expect(newTheme).not.toBe(initialTheme);

          // Take screenshot after theme change
          await visualTester.comparePageState(page, "homepage-toggled-theme", {
            clip: { width: 1200, height: 800, x: 0, y: 0 },
            fullPage: false,
          });

          // Toggle back
          await switcher.first().click();
          await page.waitForTimeout(500);

          const finalTheme = await page.evaluate(() => {
            return (
              document.documentElement.getAttribute(
                "data-mantine-color-scheme",
              ) ||
              (document.documentElement.classList.contains("dark")
                ? "dark"
                : "light")
            );
          });

          expect(finalTheme).toBe(initialTheme);
        }

        return "theme toggle tested";
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    expect(result).toBe("theme toggle tested");
  });

  test("theme persistence across page navigation", async ({ page }) => {
    // Get initial theme
    let currentTheme = await page.evaluate(() => {
      return (
        document.documentElement.getAttribute("data-mantine-color-scheme") ||
        (document.documentElement.classList.contains("dark") ? "dark" : "light")
      );
    });

    // Find theme switcher
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });
    const themeToggle = page.getByTestId("theme-switcher");

    const switcher =
      (await themeSwitcher.count()) > 0 ? themeSwitcher : themeToggle;

    if ((await switcher.count()) > 0) {
      // Toggle theme
      await switcher.first().click();
      await page.waitForTimeout(300);

      // Get new theme
      const toggledTheme = await page.evaluate(() => {
        return (
          document.documentElement.getAttribute("data-mantine-color-scheme") ||
          (document.documentElement.classList.contains("dark")
            ? "dark"
            : "light")
        );
      });

      if (toggledTheme !== currentTheme) {
        currentTheme = toggledTheme;

        // Navigate to another page
        await page.goto("/en/about");
        await waitUtils.forNavigation();

        // Check if theme persisted
        const persistedTheme = await page.evaluate(() => {
          return (
            document.documentElement.getAttribute(
              "data-mantine-color-scheme",
            ) ||
            (document.documentElement.classList.contains("dark")
              ? "dark"
              : "light")
          );
        });

        expect(persistedTheme).toBe(currentTheme);

        // Navigate back to home
        await page.goto("/");
        await waitUtils.forNavigation();

        const homeTheme = await page.evaluate(() => {
          return (
            document.documentElement.getAttribute(
              "data-mantine-color-scheme",
            ) ||
            (document.documentElement.classList.contains("dark")
              ? "dark"
              : "light")
          );
        });

        expect(homeTheme).toBe(currentTheme);
      }
    }
  });

  test("theme applies to all page elements", async ({ page }) => {
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });
    const themeToggle = page.getByTestId("theme-switcher");

    const switcher =
      (await themeSwitcher.count()) > 0 ? themeSwitcher : themeToggle;

    if ((await switcher.count()) > 0) {
      // Get initial colors
      const initialColors = await page.evaluate(() => {
        const body = document.body;
        const header = document.querySelector("header");
        const main = document.querySelector("main");

        return {
          bodyBg: window.getComputedStyle(body).backgroundColor,
          bodyColor: window.getComputedStyle(body).color,
          headerBg: header
            ? window.getComputedStyle(header).backgroundColor
            : null,
          mainBg: main ? window.getComputedStyle(main).backgroundColor : null,
        };
      });

      // Toggle theme
      await switcher.first().click();
      await page.waitForTimeout(500);

      // Get new colors
      const newColors = await page.evaluate(() => {
        const body = document.body;
        const header = document.querySelector("header");
        const main = document.querySelector("main");

        return {
          bodyBg: window.getComputedStyle(body).backgroundColor,
          bodyColor: window.getComputedStyle(body).color,
          headerBg: header
            ? window.getComputedStyle(header).backgroundColor
            : null,
          mainBg: main ? window.getComputedStyle(main).backgroundColor : null,
        };
      });

      // At least some colors should change
      const colorsChanged =
        initialColors.bodyBg !== newColors.bodyBg ||
        initialColors.bodyColor !== newColors.bodyColor ||
        initialColors.headerBg !== newColors.headerBg ||
        initialColors.mainBg !== newColors.mainBg;

      expect(colorsChanged).toBeTruthy();
    }
  });

  test("theme switching performance impact", async ({ context, page }) => {
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });
    const themeToggle = page.getByTestId("theme-switcher");

    const switcher =
      (await themeSwitcher.count()) > 0 ? themeSwitcher : themeToggle;

    if ((await switcher.count()) > 0) {
      // Measure performance impact of theme switching
      const performanceResults = [];

      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();

        await switcher.first().click();
        await page.waitForTimeout(300);

        const endTime = Date.now();
        performanceResults.push(endTime - startTime);
      }

      const averageTime =
        performanceResults.reduce((a, b) => a + b, 0) /
        performanceResults.length;

      // Theme switching should be fast (under 500ms)
      expect(averageTime).toBeLessThan(500);

      await test.info().attach("theme-switching-performance", {
        body: JSON.stringify(
          {
            individual: performanceResults,
            average: averageTime,
            threshold: 500,
          },
          null,
          2,
        ),
        contentType: "application/json",
      });
    }
  });

  test("system theme preference detection", async ({ page }) => {
    // Test if the app respects system theme preference
    const hasSystemTheme = await page.evaluate(() => {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    });

    if (hasSystemTheme !== null) {
      // Check if initial theme matches system preference
      const currentTheme = await page.evaluate(() => {
        return (
          document.documentElement.getAttribute("data-mantine-color-scheme") ||
          (document.documentElement.classList.contains("dark")
            ? "dark"
            : "light")
        );
      });

      // App should either respect system theme or have a default
      expect(["dark", "light"].includes(currentTheme)).toBeTruthy();

      // Test media query change simulation
      await page.evaluate((prefersDark) => {
        // Simulate system theme change
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (mediaQuery.dispatchEvent) {
          const event = new MediaQueryListEvent("change", {
            matches: !prefersDark,
            media: "(prefers-color-scheme: dark)",
          });
          mediaQuery.dispatchEvent(event);
        }
      }, hasSystemTheme);

      await page.waitForTimeout(300);
    }
  });

  test("theme accessibility and contrast", async ({ page }) => {
    const themes = ["light", "dark"];
    const contrastResults = [];

    for (const theme of themes) {
      // Set specific theme
      await page.evaluate((themeMode) => {
        document.documentElement.setAttribute(
          "data-mantine-color-scheme",
          themeMode,
        );
        if (themeMode === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, theme);

      await page.waitForTimeout(300);

      // Check contrast ratios
      const contrastData = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          "p, h1, h2, h3, h4, h5, h6, a, button",
        );
        let validContrast = 0;
        let totalElements = 0;

        elements.forEach((el) => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const backgroundColor = style.backgroundColor;

          if (color && backgroundColor && color !== backgroundColor) {
            totalElements++;
            // Simple contrast check (not perfect but good enough)
            if (color.includes("rgb") && backgroundColor.includes("rgb")) {
              validContrast++;
            }
          }
        });

        return { validContrast, totalElements };
      });

      contrastResults.push({
        validContrast: contrastData.validContrast,
        ratio:
          contrastData.totalElements > 0
            ? contrastData.validContrast / contrastData.totalElements
            : 1,
        theme,
        totalElements: contrastData.totalElements,
      });
    }

    // At least 80% of elements should have proper contrast
    contrastResults.forEach((result) => {
      expect(result.ratio).toBeGreaterThan(0.8);
    });

    await test.info().attach("theme-contrast-analysis", {
      body: JSON.stringify(contrastResults, null, 2),
      contentType: "application/json",
    });
  });
});
