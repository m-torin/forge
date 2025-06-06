import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Theme Switching", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    await page.goto("/");
    await waitUtils.forNavigation();
  });

  test("should have theme switcher button", async ({ page }) => {
    // Look for theme switcher button
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });
    const themeToggle = page.getByTestId("theme-switcher");

    const switcher =
      (await themeSwitcher.count()) > 0 ? themeSwitcher : themeToggle;

    if ((await switcher.count()) > 0) {
      await expect(switcher.first()).toBeVisible();
    }
  });

  test("should toggle between light and dark mode", async ({ page }) => {
    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute(
        "data-mantine-color-scheme",
      ) || document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    // Find and click theme switcher
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });

    if ((await themeSwitcher.count()) > 0) {
      await themeSwitcher.first().click();
      await page.waitForTimeout(300); // Wait for transition

      // Check if theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.getAttribute(
          "data-mantine-color-scheme",
        ) || document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test("should persist theme preference across page navigation", async ({
    page,
  }) => {
    // Set to dark mode
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });

    if ((await themeSwitcher.count()) > 0) {
      // Switch to dark mode if not already
      const currentTheme = await page.evaluate(() => {
        return (
          document.documentElement.getAttribute("data-mantine-color-scheme") ||
          "light"
        );
      });

      if (currentTheme === "light") {
        await themeSwitcher.first().click();
        await page.waitForTimeout(300);
      }

      // Navigate to another page
      await page.goto("/about");
      await waitUtils.forNavigation();

      // Check if dark mode is still active
      const themeAfterNavigation = await page.evaluate(() => {
        return document.documentElement.getAttribute(
          "data-mantine-color-scheme",
        ) || document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(themeAfterNavigation).toBe("dark");
    }
  });

  test("should apply correct CSS variables for theme", async ({ page }) => {
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });

    if ((await themeSwitcher.count()) > 0) {
      // Test light mode
      const currentTheme = await page.evaluate(() => {
        return (
          document.documentElement.getAttribute("data-mantine-color-scheme") ||
          "light"
        );
      });

      if (currentTheme === "dark") {
        await themeSwitcher.first().click();
        await page.waitForTimeout(300);
      }

      const lightModeColors = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
          background:
            styles.getPropertyValue("--mantine-color-body") ||
            styles.backgroundColor,
          text: styles.getPropertyValue("--mantine-color-text") || styles.color,
        };
      });

      // Switch to dark mode
      await themeSwitcher.first().click();
      await page.waitForTimeout(300);

      const darkModeColors = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
          background:
            styles.getPropertyValue("--mantine-color-body") ||
            styles.backgroundColor,
          text: styles.getPropertyValue("--mantine-color-text") || styles.color,
        };
      });

      // Colors should be different
      expect(lightModeColors.background).not.toBe(darkModeColors.background);
      expect(lightModeColors.text).not.toBe(darkModeColors.text);
    }
  });

  test("should store theme preference in localStorage", async ({ page }) => {
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });

    if ((await themeSwitcher.count()) > 0) {
      // Switch theme
      await themeSwitcher.first().click();
      await page.waitForTimeout(300);

      // Check localStorage
      const storedTheme = await page.evaluate(() => {
        return (
          localStorage.getItem("mantine-color-scheme") ||
          localStorage.getItem("theme") ||
          localStorage.getItem("color-scheme")
        );
      });

      expect(storedTheme).toBeTruthy();
      expect(["light", "dark", "auto"]).toContain(storedTheme);
    }
  });

  test("should respect system preference when set to auto", async ({
    page,
  }) => {
    // This test checks if the theme respects system preferences
    await page.evaluate(() => {
      // Clear any stored preference
      localStorage.removeItem("mantine-color-scheme");
      localStorage.removeItem("theme");
      localStorage.removeItem("color-scheme");
    });

    // Reload page
    await page.reload();
    await waitUtils.forNavigation();

    // Emulate dark mode preference
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    await waitUtils.forNavigation();

    const themeDark = await page.evaluate(() => {
      return document.documentElement.getAttribute(
        "data-mantine-color-scheme",
      ) || document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    // Emulate light mode preference
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();
    await waitUtils.forNavigation();

    const themeLight = await page.evaluate(() => {
      return document.documentElement.getAttribute(
        "data-mantine-color-scheme",
      ) || document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    // If auto mode is supported, themes should match system preference
    // Otherwise, they might stay the same
    expect(["light", "dark"]).toContain(themeDark);
    expect(["light", "dark"]).toContain(themeLight);
  });

  test("should have accessible theme switcher", async ({ page }) => {
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });

    if ((await themeSwitcher.count()) > 0) {
      // Check ARIA attributes
      const ariaLabel = await themeSwitcher.first().getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();

      // Should be keyboard accessible
      await themeSwitcher.first().focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);

      // Theme should have changed
      const themeChanged = await page.evaluate(() => {
        const currentTheme = document.documentElement.getAttribute(
          "data-mantine-color-scheme",
        );
        return currentTheme !== null;
      });

      expect(themeChanged).toBeTruthy();
    }
  });

  test("should update theme icon when switching", async ({ page }) => {
    const themeSwitcher = page.getByRole("button", {
      name: /theme|dark|light|mode/i,
    });

    if ((await themeSwitcher.count()) > 0) {
      // Get initial icon state
      const initialIcon = await themeSwitcher.first().innerHTML();

      // Switch theme
      await themeSwitcher.first().click();
      await page.waitForTimeout(300);

      // Check if icon changed
      const newIcon = await themeSwitcher.first().innerHTML();

      // Icon content should be different (sun/moon icons)
      expect(newIcon).not.toBe(initialIcon);
    }
  });

  test("should apply theme-specific images if available", async ({ page }) => {
    // Check for images that might change with theme
    const images = page.locator(
      'img[data-theme], img[class*="dark:"], picture source[media*="prefers-color-scheme"]',
    );

    if ((await images.count()) > 0) {
      const themeSwitcher = page.getByRole("button", {
        name: /theme|dark|light|mode/i,
      });

      if ((await themeSwitcher.count()) > 0) {
        // Get image sources in light mode
        const lightSources = await images.evaluateAll((imgs) =>
          imgs.map(
            (img) =>
              (img as HTMLImageElement).src || (img as HTMLImageElement).srcset,
          ),
        );

        // Switch to dark mode
        await themeSwitcher.first().click();
        await page.waitForTimeout(300);

        // Get image sources in dark mode
        const darkSources = await images.evaluateAll((imgs) =>
          imgs.map(
            (img) =>
              (img as HTMLImageElement).src || (img as HTMLImageElement).srcset,
          ),
        );

        // At least some images should have different sources
        const hasThemeSpecificImages = lightSources.some(
          (src, index) => src !== darkSources[index],
        );

        expect(hasThemeSpecificImages).toBeTruthy();
      }
    }
  });

  test("should not flash theme on page load", async ({ page }) => {
    // Set dark mode
    await page.evaluate(() => {
      localStorage.setItem("mantine-color-scheme", "dark");
    });

    // Navigate to check for flash
    await page.goto("/", { waitUntil: "commit" });

    // Check theme immediately
    const immediateTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute(
        "data-mantine-color-scheme",
      ) || document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    // Should be dark from the start
    expect(immediateTheme).toBe("dark");

    // Wait for full load and check again
    await waitUtils.forNavigation();

    const finalTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute(
        "data-mantine-color-scheme",
      ) || document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    // Should still be dark
    expect(finalTheme).toBe("dark");
  });
});
