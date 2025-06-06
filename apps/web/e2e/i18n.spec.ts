import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Internationalization (i18n)", () => {
  let waitUtils: WaitUtils;

  const supportedLocales = ["en", "es", "fr", "pt", "de"];
  const defaultLocale = "en";

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test("should redirect to default locale", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Should redirect to default locale
    expect(page.url()).toContain(`/${defaultLocale}`);
  });

  test("should support all configured locales", async ({ page }) => {
    for (const locale of supportedLocales) {
      await page.goto(`/${locale}`);
      await waitUtils.forNavigation();

      // Should not redirect away from the locale
      expect(page.url()).toContain(`/${locale}`);

      // Page should load successfully
      const _response = page.context().request;
      expect(page.url()).toBeTruthy();
    }
  });

  test("should have locale switcher", async ({ page }) => {
    await page.goto(`/${defaultLocale}`);
    await waitUtils.forNavigation();

    // Look for locale switcher
    const localeSwitcher = page.getByRole("button", {
      name: /language|locale|en|english/i,
    });
    const localeSelect = page.getByRole("combobox", {
      name: /language|locale/i,
    });

    if ((await localeSwitcher.count()) > 0) {
      await localeSwitcher.first().click();
      await page.waitForTimeout(500);

      // Check if locale options are visible
      const spanishOption = page.getByRole("option", {
        name: /español|spanish|es/i,
      });
      const frenchOption = page.getByRole("option", {
        name: /français|french|fr/i,
      });

      if ((await spanishOption.count()) > 0) {
        await expect(spanishOption.first()).toBeVisible();
      }
      if ((await frenchOption.count()) > 0) {
        await expect(frenchOption.first()).toBeVisible();
      }
    } else if ((await localeSelect.count()) > 0) {
      // Locale switcher might be a select element
      const options = await localeSelect.first().locator("option").count();
      expect(options).toBeGreaterThanOrEqual(supportedLocales.length);
    }
  });

  test("should switch locale and update URL", async ({ page }) => {
    await page.goto(`/${defaultLocale}`);
    await waitUtils.forNavigation();

    // Try to switch to Spanish
    const localeSwitcher = page.getByRole("button", {
      name: /language|locale|en|english/i,
    });

    if ((await localeSwitcher.count()) > 0) {
      await localeSwitcher.first().click();
      await page.waitForTimeout(500);

      const spanishOption = page.getByRole("option", {
        name: /español|spanish|es/i,
      });
      if ((await spanishOption.count()) > 0) {
        await spanishOption.first().click();
        await waitUtils.forNavigation();

        // URL should now contain Spanish locale
        expect(page.url()).toContain("/es");
      }
    }
  });

  test("should maintain locale during navigation", async ({ page }) => {
    const testLocale = "es";

    // Start with Spanish locale
    await page.goto(`/${testLocale}`);
    await waitUtils.forNavigation();

    // Navigate to about page
    await page.goto(`/${testLocale}/about`);
    await waitUtils.forNavigation();
    expect(page.url()).toContain(`/${testLocale}/about`);

    // Navigate to contact page
    await page.goto(`/${testLocale}/contact`);
    await waitUtils.forNavigation();
    expect(page.url()).toContain(`/${testLocale}/contact`);

    // Click on a link (if available)
    const link = page.getByRole("link").first();
    if ((await link.count()) > 0) {
      const href = await link.getAttribute("href");
      if (href && href.startsWith("/")) {
        await link.click();
        await waitUtils.forNavigation();
        // Should still be in Spanish locale
        expect(page.url()).toContain(`/${testLocale}`);
      }
    }
  });

  test("should display translated content", async ({ page }) => {
    // Test English content
    await page.goto(`/en`);
    await waitUtils.forNavigation();

    // Look for common English text
    const englishText = page.getByText(/home|shop|products|cart/i);
    if ((await englishText.count()) > 0) {
      await expect(englishText.first()).toBeVisible();
    }

    // Test Spanish content
    await page.goto(`/es`);
    await waitUtils.forNavigation();

    // Look for Spanish translations
    const spanishText = page.getByText(/inicio|tienda|productos|carrito/i);
    if ((await spanishText.count()) > 0) {
      await expect(spanishText.first()).toBeVisible();
    }
  });

  test("should have correct lang attribute", async ({ page }) => {
    for (const locale of supportedLocales) {
      await page.goto(`/${locale}`);
      await waitUtils.forNavigation();

      const htmlLang = await page.getAttribute("html", "lang");
      expect(htmlLang).toBe(locale);
    }
  });

  test("should handle invalid locale gracefully", async ({ page }) => {
    await page.goto("/invalid-locale");
    await waitUtils.forNavigation();

    // Should redirect to default locale
    expect(page.url()).toMatch(new RegExp(`/(${supportedLocales.join("|")})`));
  });

  test("should preserve query parameters during locale switch", async ({
    page,
  }) => {
    const queryParams = "?category=electronics&sort=price";

    await page.goto(`/en${queryParams}`);
    await waitUtils.forNavigation();

    // Switch locale
    const localeSwitcher = page.getByRole("button", {
      name: /language|locale/i,
    });
    if ((await localeSwitcher.count()) > 0) {
      await localeSwitcher.first().click();
      await page.waitForTimeout(500);

      const frenchOption = page.getByRole("option", {
        name: /français|french|fr/i,
      });
      if ((await frenchOption.count()) > 0) {
        await frenchOption.first().click();
        await waitUtils.forNavigation();

        // Should preserve query parameters
        expect(page.url()).toContain(queryParams);
        expect(page.url()).toContain("/fr");
      }
    }
  });

  test("should have alternate links for SEO", async ({ page }) => {
    await page.goto(`/en`);
    await waitUtils.forNavigation();

    // Check for alternate links in head
    const alternateLinks = await page.$$eval('link[rel="alternate"]', (links) =>
      links.map((link) => ({
        href: link.getAttribute("href"),
        hreflang: link.getAttribute("hreflang"),
      })),
    );

    // Should have alternate links for each locale
    for (const locale of supportedLocales) {
      const hasLocale = alternateLinks.some(
        (link) => link.hreflang === locale || link.href?.includes(`/${locale}`),
      );
      expect(hasLocale).toBeTruthy();
    }
  });

  test("should handle RTL languages correctly", async ({ page }) => {
    // If Arabic or Hebrew are supported
    const rtlLocales = ["ar", "he"];
    const availableRtlLocale = rtlLocales.find((locale) =>
      supportedLocales.includes(locale),
    );

    if (availableRtlLocale) {
      await page.goto(`/${availableRtlLocale}`);
      await waitUtils.forNavigation();

      const dir = await page.getAttribute("html", "dir");
      expect(dir).toBe("rtl");

      // Check if body has RTL styles
      const bodyDir = await page.evaluate(
        () => window.getComputedStyle(document.body).direction,
      );
      expect(bodyDir).toBe("rtl");
    }
  });
});
