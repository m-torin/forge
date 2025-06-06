import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("SEO and Metadata", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test("should have proper meta tags on homepage", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(70); // SEO best practice

    // Check meta description
    const description = await page.getAttribute(
      'meta[name="description"]',
      "content",
    );
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);
    expect(description!.length).toBeLessThan(160); // SEO best practice

    // Check viewport meta tag
    const viewport = await page.getAttribute(
      'meta[name="viewport"]',
      "content",
    );
    expect(viewport).toBeTruthy();
    expect(viewport).toContain("width=device-width");

    // Check charset
    const charset = await page.getAttribute("meta[charset]", "charset");
    expect(charset).toBe("utf-8");
  });

  test("should have proper Open Graph tags", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check OG tags
    const ogTitle = await page.getAttribute(
      'meta[property="og:title"]',
      "content",
    );
    const ogDescription = await page.getAttribute(
      'meta[property="og:description"]',
      "content",
    );
    const ogType = await page.getAttribute(
      'meta[property="og:type"]',
      "content",
    );
    const ogUrl = await page.getAttribute('meta[property="og:url"]', "content");
    const ogImage = await page.getAttribute(
      'meta[property="og:image"]',
      "content",
    );

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogType).toBeTruthy();
    expect(ogUrl).toBeTruthy();

    if (ogImage) {
      expect(ogImage).toMatch(/\.(jpg|jpeg|png|webp|gif)$/i);
    }
  });

  test("should have proper Twitter Card tags", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check Twitter Card tags
    const twitterCard = await page.getAttribute(
      'meta[name="twitter:card"]',
      "content",
    );
    const twitterTitle = await page.getAttribute(
      'meta[name="twitter:title"]',
      "content",
    );
    const twitterDescription = await page.getAttribute(
      'meta[name="twitter:description"]',
      "content",
    );
    const twitterImage = await page.getAttribute(
      'meta[name="twitter:image"]',
      "content",
    );

    if (twitterCard) {
      expect(["summary", "summary_large_image", "app", "player"]).toContain(
        twitterCard,
      );
    }

    expect(twitterTitle).toBeTruthy();
    expect(twitterDescription).toBeTruthy();

    if (twitterImage) {
      expect(twitterImage).toMatch(/\.(jpg|jpeg|png|webp|gif)$/i);
    }
  });

  test("should have canonical URL", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    const canonicalUrl = await page.getAttribute(
      'link[rel="canonical"]',
      "href",
    );
    expect(canonicalUrl).toBeTruthy();
    expect(canonicalUrl).toMatch(/^https?:\/\//);
  });

  test("should have proper structured data", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check for JSON-LD structured data
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const content = await jsonLdScripts.nth(i).innerHTML();
        expect(content).toBeTruthy();

        // Should be valid JSON
        const jsonData = JSON.parse(content);
        expect(jsonData).toBeTruthy();
        expect(jsonData["@context"]).toBe("https://schema.org");
        expect(jsonData["@type"]).toBeTruthy();
      }
    }
  });

  test("should have robots.txt", async ({ page }) => {
    const response = await page.request.get("/robots.txt");
    expect(response.ok()).toBeTruthy();

    const content = await response.text();
    expect(content).toBeTruthy();
    expect(content).toContain("User-agent");
  });

  test("should have sitemap.xml", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.ok()).toBeTruthy();

    const content = await response.text();
    expect(content).toBeTruthy();
    expect(content).toContain("<urlset");
    expect(content).toContain("xmlns");
  });

  test("should have proper meta tags on product pages", async ({ page }) => {
    // Navigate to a product page if available
    await page.goto("/");
    await waitUtils.forNavigation();

    const productLink = page
      .getByRole("link")
      .filter({ hasText: /product|shop/i })
      .first();

    if ((await productLink.count()) > 0) {
      await productLink.click();
      await waitUtils.forNavigation();

      // Check if we're on a product page
      if (page.url().includes("/product")) {
        const title = await page.title();
        expect(title).toBeTruthy();

        const description = await page.getAttribute(
          'meta[name="description"]',
          "content",
        );
        expect(description).toBeTruthy();

        // Check product-specific OG tags
        const ogType = await page.getAttribute(
          'meta[property="og:type"]',
          "content",
        );
        if (ogType) {
          expect(["product", "website"]).toContain(ogType);
        }
      }
    }
  });

  test("should have hreflang tags for internationalization", async ({
    page,
  }) => {
    await page.goto("/en");
    await waitUtils.forNavigation();

    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const hreflang = await hreflangLinks.nth(i).getAttribute("hreflang");
        const href = await hreflangLinks.nth(i).getAttribute("href");

        expect(hreflang).toBeTruthy();
        expect(href).toBeTruthy();
        expect(href).toMatch(/^https?:\/\//);
      }
    }
  });

  test("should not have duplicate meta tags", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check for duplicate titles
    const titleTags = await page.$$("title");
    expect(titleTags.length).toBe(1);

    // Check for duplicate descriptions
    const descriptionTags = await page.$$('meta[name="description"]');
    expect(descriptionTags.length).toBeLessThanOrEqual(1);

    // Check for duplicate canonical URLs
    const canonicalTags = await page.$$('link[rel="canonical"]');
    expect(canonicalTags.length).toBeLessThanOrEqual(1);
  });

  test("should have proper favicon links", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check for favicon
    const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]');
    const faviconCount = await favicon.count();

    if (faviconCount > 0) {
      const href = await favicon.first().getAttribute("href");
      expect(href).toBeTruthy();

      // Check if favicon exists
      const faviconResponse = await page.request.get(href!);
      expect(faviconResponse.ok()).toBeTruthy();
    }

    // Check for apple touch icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    const appleIconCount = await appleTouchIcon.count();

    if (appleIconCount > 0) {
      const href = await appleTouchIcon.first().getAttribute("href");
      expect(href).toBeTruthy();
    }
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Check H1 tag
    const h1Tags = page.locator("h1");
    const h1Count = await h1Tags.count();

    // Should have exactly one H1
    expect(h1Count).toBe(1);

    if (h1Count > 0) {
      const h1Text = await h1Tags.first().textContent();
      expect(h1Text).toBeTruthy();
      expect(h1Text!.trim().length).toBeGreaterThan(0);
    }

    // Check heading order
    const headings = await page.$$eval("h1, h2, h3, h4, h5, h6", (headings) =>
      headings.map((h) => parseInt(h.tagName.substring(1))),
    );

    if (headings.length > 1) {
      // First heading should be H1
      expect(headings[0]).toBe(1);

      // Check for proper hierarchy (no skipping levels)
      for (let i = 1; i < headings.length; i++) {
        const current = headings[i];
        const previous = headings[i - 1];

        // Current heading should not skip more than one level
        expect(current - previous).toBeLessThanOrEqual(1);
      }
    }
  });

  test("should have proper image alt attributes", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        // Check first 10 images
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");

        // Alt attribute should exist (can be empty for decorative images)
        expect(alt).not.toBeNull();

        // If alt is not empty, it should be meaningful
        if (alt && alt.trim().length > 0) {
          expect(alt.trim().length).toBeGreaterThan(2);
        }
      }
    }
  });

  test("should load quickly for SEO", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await waitUtils.forNavigation();

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check for Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          resolve(
            entries.map((entry) => ({
              name: entry.name,
              value: (entry as any).value || entry.duration,
            })),
          );
        }).observe({ entryTypes: ["navigation", "paint"] });

        // Fallback if no observer data
        setTimeout(() => {
          resolve(
            performance.getEntriesByType("navigation").map((entry) => ({
              name: entry.name,
              value:
                (entry as PerformanceNavigationTiming).loadEventEnd -
                (entry as PerformanceNavigationTiming).loadEventStart,
            })),
          );
        }, 1000);
      });
    });

    expect(vitals).toBeTruthy();
  });
});
