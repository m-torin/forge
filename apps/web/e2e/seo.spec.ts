import { expect, test } from "@repo/testing/e2e";
import { PerformanceUtils, WaitUtils } from "@repo/testing/e2e";

import { withPerformanceMonitoring } from "./utils/performance-monitor";
import { createVisualTester } from "./utils/visual-testing";

test.describe("SEO and Metadata - Enhanced", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test("should have proper meta tags on homepage with performance monitoring", async ({
    context,
    page,
  }) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        await waitUtils.forNavigation();

        // Comprehensive meta tag analysis
        const metaAnalysis = await page.evaluate(() => {
          const title = document.title;
          const description = document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content");
          const viewport = document
            .querySelector('meta[name="viewport"]')
            ?.getAttribute("content");
          const charset = document
            .querySelector("meta[charset]")
            ?.getAttribute("charset");
          const keywords = document
            .querySelector('meta[name="keywords"]')
            ?.getAttribute("content");
          const author = document
            .querySelector('meta[name="author"]')
            ?.getAttribute("content");
          const robots = document
            .querySelector('meta[name="robots"]')
            ?.getAttribute("content");

          return {
            author: { value: author },
            charset: { value: charset },
            description: {
              length: description?.length || 0,
              value: description,
            },
            hasBasicMeta: !!(title && description && viewport && charset),
            keywords: { value: keywords },
            robots: { value: robots },
            title: { length: title.length, value: title },
            viewport: { value: viewport },
          };
        });

        // SEO validations
        expect(metaAnalysis.title.value).toBeTruthy();
        expect(metaAnalysis.title.length).toBeGreaterThan(0);
        expect(metaAnalysis.title.length).toBeLessThan(70); // SEO best practice

        expect(metaAnalysis.description.value).toBeTruthy();
        expect(metaAnalysis.description.length).toBeGreaterThan(50);
        expect(metaAnalysis.description.length).toBeLessThan(160); // SEO best practice

        expect(metaAnalysis.viewport.value).toBeTruthy();
        expect(metaAnalysis.viewport.value).toContain("width=device-width");

        expect(metaAnalysis.charset.value).toBe("utf-8");
        expect(metaAnalysis.hasBasicMeta).toBeTruthy();

        return metaAnalysis;
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    await test.info().attach("meta-tags-analysis", {
      body: JSON.stringify({ ...result, performance: report }, null, 2),
      contentType: "application/json",
    });
  });

  test("should have comprehensive Open Graph and social media tags", async ({
    context,
    page,
  }) => {
    const { result } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        await waitUtils.forNavigation();

        // Complete social media tags analysis
        const socialTags = await page.evaluate(() => {
          const ogTags = {
            type: document
              .querySelector('meta[property="og:type"]')
              ?.getAttribute("content"),
            url: document
              .querySelector('meta[property="og:url"]')
              ?.getAttribute("content"),
            description: document
              .querySelector('meta[property="og:description"]')
              ?.getAttribute("content"),
            image: document
              .querySelector('meta[property="og:image"]')
              ?.getAttribute("content"),
            locale: document
              .querySelector('meta[property="og:locale"]')
              ?.getAttribute("content"),
            siteName: document
              .querySelector('meta[property="og:site_name"]')
              ?.getAttribute("content"),
            title: document
              .querySelector('meta[property="og:title"]')
              ?.getAttribute("content"),
          };

          const twitterTags = {
            card: document
              .querySelector('meta[name="twitter:card"]')
              ?.getAttribute("content"),
            creator: document
              .querySelector('meta[name="twitter:creator"]')
              ?.getAttribute("content"),
            description: document
              .querySelector('meta[name="twitter:description"]')
              ?.getAttribute("content"),
            image: document
              .querySelector('meta[name="twitter:image"]')
              ?.getAttribute("content"),
            site: document
              .querySelector('meta[name="twitter:site"]')
              ?.getAttribute("content"),
            title: document
              .querySelector('meta[name="twitter:title"]')
              ?.getAttribute("content"),
          };

          return { ogTags, twitterTags };
        });

        // OpenGraph validations
        expect(socialTags.ogTags.title).toBeTruthy();
        expect(socialTags.ogTags.description).toBeTruthy();
        expect(socialTags.ogTags.type).toBeTruthy();
        expect(socialTags.ogTags.url).toBeTruthy();

        if (socialTags.ogTags.image) {
          expect(socialTags.ogTags.image).toMatch(
            /\.(jpg|jpeg|png|webp|gif)$/i,
          );
        }

        // Twitter Card validations
        if (socialTags.twitterTags.card) {
          expect(["summary", "summary_large_image", "app", "player"]).toContain(
            socialTags.twitterTags.card,
          );
        }

        expect(socialTags.twitterTags.title).toBeTruthy();
        expect(socialTags.twitterTags.description).toBeTruthy();

        if (socialTags.twitterTags.image) {
          expect(socialTags.twitterTags.image).toMatch(
            /\.(jpg|jpeg|png|webp|gif)$/i,
          );
        }

        return socialTags;
      },
    );

    await test.info().attach("social-media-tags", {
      body: JSON.stringify(result, null, 2),
      contentType: "application/json",
    });
  });

  test("should have proper canonical URL and link structure", async ({
    page,
  }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    const linkStructure = await page.evaluate(() => {
      const canonical = document
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href");
      const prev = document
        .querySelector('link[rel="prev"]')
        ?.getAttribute("href");
      const next = document
        .querySelector('link[rel="next"]')
        ?.getAttribute("href");
      const alternate = Array.from(
        document.querySelectorAll('link[rel="alternate"]'),
      ).map((link) => ({
        type: link.getAttribute("type"),
        href: link.getAttribute("href"),
        hreflang: link.getAttribute("hreflang"),
      }));

      return { alternate, canonical, next, prev };
    });

    expect(linkStructure.canonical).toBeTruthy();
    expect(linkStructure.canonical).toMatch(/^https?:\/\//);

    // Validate alternate links (for internationalization)
    if (linkStructure.alternate.length > 0) {
      linkStructure.alternate.forEach((link) => {
        if (link.hreflang && link.href) {
          expect(link.href).toMatch(/^https?:\/\//);
          expect(link.hreflang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
        }
      });
    }

    await test.info().attach("link-structure-analysis", {
      body: JSON.stringify(linkStructure, null, 2),
      contentType: "application/json",
    });
  });

  test("should have comprehensive structured data and schema markup", async ({
    page,
  }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    const structuredDataAnalysis = await page.evaluate(() => {
      // Check for JSON-LD structured data
      const jsonLdScripts = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      );
      const jsonLdData = [];

      jsonLdScripts.forEach((script, index) => {
        try {
          const content = script.innerHTML;
          const parsed = JSON.parse(content);
          jsonLdData.push({
            valid: !!(parsed["@context"] && parsed["@type"]),
            type: parsed["@type"],
            context: parsed["@context"],
            data: parsed,
            index,
          });
        } catch (error) {
          jsonLdData.push({
            valid: false,
            error: error.message,
            index,
          });
        }
      });

      // Check for microdata
      const microdataElements = Array.from(
        document.querySelectorAll("[itemscope]"),
      ).map((el) => ({
        itemtype: el.getAttribute("itemtype"),
        itemprops: Array.from(el.querySelectorAll("[itemprop]")).map((prop) =>
          prop.getAttribute("itemprop"),
        ),
      }));

      // Check for RDFa
      const rdfaElements = Array.from(
        document.querySelectorAll("[typeof]"),
      ).map((el) => ({
        typeof: el.getAttribute("typeof"),
        properties: Array.from(el.querySelectorAll("[property]")).map((prop) =>
          prop.getAttribute("property"),
        ),
      }));

      return {
        hasStructuredData:
          jsonLdData.length > 0 ||
          microdataElements.length > 0 ||
          rdfaElements.length > 0,
        jsonLd: { count: jsonLdData.length, data: jsonLdData },
        microdata: { count: microdataElements.length, data: microdataElements },
        rdfa: { count: rdfaElements.length, data: rdfaElements },
      };
    });

    // Validate JSON-LD structured data
    if (structuredDataAnalysis.jsonLd.count > 0) {
      structuredDataAnalysis.jsonLd.data.forEach((item, index) => {
        if (!item.error) {
          expect(item.valid).toBeTruthy();
          expect(item.context).toBe("https://schema.org");
          expect(item.type).toBeTruthy();
        }
      });
    }

    await test.info().attach("structured-data-analysis", {
      body: JSON.stringify(structuredDataAnalysis, null, 2),
      contentType: "application/json",
    });
  });

  test("should have proper SEO files and resources", async ({ page }) => {
    const seoFilesAnalysis = await Promise.all([
      // Check robots.txt
      page.request
        .get("/robots.txt")
        .then(async (response) => ({
          content: response.ok() ? await response.text() : null,
          file: "robots.txt",
          hasUserAgent: response.ok()
            ? (await response.text()).includes("User-agent")
            : false,
          ok: response.ok(),
          status: response.status(),
        }))
        .catch((error) => ({
          error: error.message,
          file: "robots.txt",
          ok: false,
        })),

      // Check sitemap.xml
      page.request
        .get("/sitemap.xml")
        .then(async (response) => ({
          content: response.ok() ? await response.text() : null,
          file: "sitemap.xml",
          hasUrlset: response.ok()
            ? (await response.text()).includes("<urlset")
            : false,
          hasXmlns: response.ok()
            ? (await response.text()).includes("xmlns")
            : false,
          ok: response.ok(),
          status: response.status(),
        }))
        .catch((error) => ({
          error: error.message,
          file: "sitemap.xml",
          ok: false,
        })),

      // Check favicon and icons
      page
        .goto("/")
        .then(async () => {
          await page.waitForLoadState("networkidle");
          return page.evaluate(async () => {
            const favicon = document.querySelector(
              'link[rel="icon"], link[rel="shortcut icon"]',
            );
            const appleTouchIcon = document.querySelector(
              'link[rel="apple-touch-icon"]',
            );
            const manifest = document.querySelector('link[rel="manifest"]');

            const iconTests = [];

            if (favicon) {
              const href = favicon.getAttribute("href");
              iconTests.push({ type: "favicon", exists: !!href, href });
            }

            if (appleTouchIcon) {
              const href = appleTouchIcon.getAttribute("href");
              iconTests.push({
                type: "apple-touch-icon",
                exists: !!href,
                href,
              });
            }

            if (manifest) {
              const href = manifest.getAttribute("href");
              iconTests.push({ type: "manifest", exists: !!href, href });
            }

            return iconTests;
          });
        })
        .catch((error) => ({
          error: error.message,
          icons: [],
        })),
    ]);

    // Validate robots.txt
    const robotsResult = seoFilesAnalysis[0];
    expect(robotsResult.ok).toBeTruthy();
    if (robotsResult.content) {
      expect(robotsResult.hasUserAgent).toBeTruthy();
    }

    // Validate sitemap.xml
    const sitemapResult = seoFilesAnalysis[1];
    expect(sitemapResult.ok).toBeTruthy();
    if (sitemapResult.content) {
      expect(sitemapResult.hasUrlset).toBeTruthy();
      expect(sitemapResult.hasXmlns).toBeTruthy();
    }

    // Validate icons
    const iconsResult = seoFilesAnalysis[2];
    if (Array.isArray(iconsResult) && iconsResult.length > 0) {
      iconsResult.forEach((icon) => {
        expect(icon.exists).toBeTruthy();
        expect(icon.href).toBeTruthy();
      });
    }

    await test.info().attach("seo-files-analysis", {
      body: JSON.stringify(seoFilesAnalysis, null, 2),
      contentType: "application/json",
    });
  });

  test("should have internationalization and content-specific SEO", async ({
    context,
    page,
  }) => {
    const { result } = await withPerformanceMonitoring(
      page,
      context,
      "/en",
      async () => {
        await waitUtils.forNavigation();

        // Check hreflang tags for internationalization
        const hreflangAnalysis = await page.evaluate(() => {
          const hreflangLinks = Array.from(
            document.querySelectorAll('link[rel="alternate"][hreflang]'),
          );
          return hreflangLinks.map((link) => ({
            valid: !!(
              link.getAttribute("hreflang") && link.getAttribute("href")
            ),
            href: link.getAttribute("href"),
            hreflang: link.getAttribute("hreflang"),
          }));
        });

        // Test product page SEO if available
        const productPageTest = await (async () => {
          const productLink = page
            .getByRole("link")
            .filter({ hasText: /product|shop/i })
            .first();

          if ((await productLink.count()) > 0) {
            await productLink.click();
            await waitUtils.forNavigation();

            if (page.url().includes("/product")) {
              return page.evaluate(() => {
                const title = document.title;
                const description = document
                  .querySelector('meta[name="description"]')
                  ?.getAttribute("content");
                const ogType = document
                  .querySelector('meta[property="og:type"]')
                  ?.getAttribute("content");
                const ogPrice = document
                  .querySelector('meta[property="product:price"]')
                  ?.getAttribute("content");
                const ogCurrency = document
                  .querySelector('meta[property="product:price:currency"]')
                  ?.getAttribute("content");

                return {
                  validProductSEO: !!(title && description && ogType),
                  description: {
                    length: description?.length || 0,
                    value: description,
                  },
                  hasProductPage: true,
                  ogType,
                  productMeta: { currency: ogCurrency, price: ogPrice },
                  title: { length: title.length, value: title },
                };
              });
            }
          }

          return { hasProductPage: false };
        })();

        // Validate hreflang tags
        if (hreflangAnalysis.length > 0) {
          hreflangAnalysis.forEach((link) => {
            expect(link.valid).toBeTruthy();
            expect(link.href).toMatch(/^https?:\/\//);
            expect(link.hreflang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
          });
        }

        // Validate product page SEO if available
        if (productPageTest.hasProductPage) {
          expect(productPageTest.validProductSEO).toBeTruthy();
          expect(productPageTest.title.length).toBeGreaterThan(0);
          expect(productPageTest.description.length).toBeGreaterThan(50);

          if (productPageTest.ogType) {
            expect(["product", "website"]).toContain(productPageTest.ogType);
          }
        }

        return { hreflang: hreflangAnalysis, productPage: productPageTest };
      },
    );

    await test.info().attach("internationalization-content-seo", {
      body: JSON.stringify(result, null, 2),
      contentType: "application/json",
    });
  });

  test("should have valid content structure and accessibility for SEO", async ({
    context,
    page,
  }) => {
    const visualTester = createVisualTester(page);

    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        await waitUtils.forNavigation();

        // Comprehensive content structure analysis
        const contentAnalysis = await page.evaluate(() => {
          // Check for duplicate tags
          const duplicates = {
            canonicals: document.querySelectorAll('link[rel="canonical"]')
              .length,
            descriptions: document.querySelectorAll('meta[name="description"]')
              .length,
            titles: document.querySelectorAll("title").length,
          };

          // Check heading hierarchy
          const headings = Array.from(
            document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
          ).map((h) => ({
            hasContent: !!h.textContent?.trim(),
            level: parseInt(h.tagName.substring(1)),
            text: h.textContent?.trim() || "",
          }));

          const h1Count = headings.filter((h) => h.level === 1).length;
          const headingLevels = headings.map((h) => h.level);

          // Check heading hierarchy validity
          let hierarchyValid = true;
          if (headingLevels.length > 1) {
            for (let i = 1; i < headingLevels.length; i++) {
              if (headingLevels[i] - headingLevels[i - 1] > 1) {
                hierarchyValid = false;
                break;
              }
            }
          }

          // Check images alt attributes
          const images = Array.from(document.querySelectorAll("img"))
            .slice(0, 10)
            .map((img) => ({
              alt: img.getAttribute("alt"),
              altLength: img.getAttribute("alt")?.length || 0,
              hasAlt: img.hasAttribute("alt"),
              hasLazyLoading: img.getAttribute("loading") === "lazy",
              loading: img.getAttribute("loading"),
              src: img.getAttribute("src"),
            }));

          const imagesWithoutAlt = images.filter((img) => !img.hasAlt).length;
          const imagesWithLazyLoading = images.filter(
            (img) => img.hasLazyLoading,
          ).length;

          return {
            duplicates,
            headings: {
              hierarchyValid,
              allHaveContent: headings.every((h) => h.hasContent),
              h1Count,
              hierarchy: headingLevels,
              total: headings.length,
            },
            images: {
              altOptimizationScore:
                images.length > 0
                  ? (images.length - imagesWithoutAlt) / images.length
                  : 1,
              total: images.length,
              withLazyLoading: imagesWithLazyLoading,
              withoutAlt: imagesWithoutAlt,
            },
          };
        });

        // Validate duplicate tags
        expect(contentAnalysis.duplicates.titles).toBe(1);
        expect(contentAnalysis.duplicates.descriptions).toBeLessThanOrEqual(1);
        expect(contentAnalysis.duplicates.canonicals).toBeLessThanOrEqual(1);

        // Validate heading hierarchy
        expect(contentAnalysis.headings.h1Count).toBe(1);
        expect(contentAnalysis.headings.hierarchyValid).toBeTruthy();
        expect(contentAnalysis.headings.allHaveContent).toBeTruthy();

        // Validate image accessibility
        expect(contentAnalysis.images.altOptimizationScore).toBeGreaterThan(
          0.8,
        );

        // Take visual regression screenshot for SEO layout
        await visualTester.comparePageState(page, "homepage-seo-structure", {
          animations: "disabled",
          fullPage: true,
        });

        return contentAnalysis;
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    // SEO performance validation
    expect(report.fcp).toBeLessThan(3000);
    expect(report.lcp).toBeLessThan(4000);

    await test.info().attach("content-structure-seo-analysis", {
      body: JSON.stringify({ ...result, performance: report }, null, 2),
      contentType: "application/json",
    });
  });
});
