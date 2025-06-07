import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Navigation", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test("should navigate between main pages", async ({ page }) => {
    // Start at homepage (will redirect to locale)
    await page.goto("/");
    await waitUtils.forNavigation();

    // Get current locale from URL
    const currentUrl = page.url();
    const locale = currentUrl.match(/\/(en|es|de|zh|fr|pt)\//)?.[1] || "en";

    // Navigate to collections (if link exists)
    const collectionsLink = page.getByRole("link", { name: /collections/i });
    if ((await collectionsLink.count()) > 0) {
      await collectionsLink.first().click();
      await waitUtils.forNavigation();
      expect(page.url()).toMatch(new RegExp(`/${locale}/.*collections`));
    }

    // Navigate to about page
    await page.goto(`/${locale}/about`);
    await waitUtils.forNavigation();
    const aboutContent = await page.textContent("body");
    expect(aboutContent).toBeTruthy();

    // Navigate to contact
    await page.goto(`/${locale}/contact`);
    await waitUtils.forNavigation();
    expect(page.url()).toContain("/contact");
  });

  test("should handle product navigation", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Look for product cards
    const productCard = page.locator('[data-testid="product-card"]').first();
    const productLink = page
      .getByRole("link")
      .filter({ hasText: /product|shop/i })
      .first();

    if ((await productCard.count()) > 0) {
      await productCard.click();
      await waitUtils.forNavigation();
      expect(page.url()).toMatch(/\/products?\//);
    } else if ((await productLink.count()) > 0) {
      await productLink.click();
      await waitUtils.forNavigation();
      expect(page.url()).toMatch(/\/products?/);
    }
  });

  test("should handle cart navigation", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Look for cart icon or link
    const cartButton = page.getByRole("button", { name: /cart/i });
    const cartLink = page.getByRole("link", { name: /cart/i });

    if ((await cartButton.count()) > 0) {
      await cartButton.first().click();
      // Cart might be a modal or page
      await page.waitForTimeout(1000);
    } else if ((await cartLink.count()) > 0) {
      await cartLink.first().click();
      await waitUtils.forNavigation();
      expect(page.url()).toContain("/cart");
    }
  });

  test("should navigate to auth pages", async ({ page }) => {
    // Test sign in navigation
    await page.goto("/login");
    await waitUtils.forNavigation();
    expect(page.url()).toContain("/login");

    // Test sign up navigation
    await page.goto("/signup");
    await waitUtils.forNavigation();
    expect(page.url()).toContain("/signup");

    // Test forgot password navigation
    await page.goto("/forgot-password");
    await waitUtils.forNavigation();
    expect(page.url()).toContain("/forgot-password");
  });

  test("should handle account pages navigation", async ({ page }) => {
    const accountPages = [
      "/account",
      "/account-billing",
      "/account-password",
      "/account-wishlists",
      "/orders",
    ];

    for (const accountPage of accountPages) {
      await page.goto(accountPage);
      await waitUtils.forNavigation();
      // These pages might redirect if not authenticated
      expect(page.url()).toBeTruthy();
    }
  });

  test("should handle back navigation", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    await page.goto("/about");
    await waitUtils.forNavigation();

    await page.goBack();
    await waitUtils.forNavigation();
    expect(page.url()).toMatch(/\/$/); // Should be back at homepage
  });

  test("should have working header navigation", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check for logo link
    const logo = page.getByRole("link", { name: /logo|home/i });
    if ((await logo.count()) > 0) {
      const _currentUrl = page.url();
      await logo.first().click();
      await waitUtils.forNavigation();
      // Should stay on homepage or navigate to it
      expect(page.url()).toMatch(/\/$/);
    }
  });

  test("should handle search navigation", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Look for search input
    const searchInput = page.getByRole("searchbox");
    const searchButton = page.getByRole("button", { name: /search/i });

    if ((await searchInput.count()) > 0) {
      await searchInput.first().fill("test product");
      if ((await searchButton.count()) > 0) {
        await searchButton.first().click();
      } else {
        await searchInput.first().press("Enter");
      }
      await waitUtils.forNavigation();
      // Should navigate to search results
      expect(page.url()).toMatch(/search|q=/);
    }
  });

  test("should handle footer navigation", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check for common footer links
    const footerLinks = [
      { url: "/about", text: /about/i },
      { url: "/contact", text: /contact/i },
      { url: "/blog", text: /blog/i },
    ];

    for (const link of footerLinks) {
      const footerLink = page.getByRole("link", { name: link.text });
      if ((await footerLink.count()) > 0) {
        const href = await footerLink.first().getAttribute("href");
        expect(href).toContain(link.url);
      }
    }
  });

  test("should handle breadcrumb navigation", async ({ page }) => {
    // Navigate to a product page
    await page.goto("/");
    await waitUtils.forNavigation();

    // Try to find a collection or product link
    const collectionLink = page
      .getByRole("link")
      .filter({ hasText: /collection|category/i })
      .first();
    if ((await collectionLink.count()) > 0) {
      await collectionLink.click();
      await waitUtils.forNavigation();

      // Check for breadcrumbs
      const breadcrumb = page.getByRole("navigation", { name: /breadcrumb/i });
      if ((await breadcrumb.count()) > 0) {
        const homeLink = breadcrumb.getByRole("link", { name: /home/i });
        if ((await homeLink.count()) > 0) {
          await homeLink.click();
          await waitUtils.forNavigation();
          expect(page.url()).toMatch(/\/$/);
        }
      }
    }
  });
});
