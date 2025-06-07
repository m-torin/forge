import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

import {
  createDefaultBenchmarkerConfig,
  PerformanceBenchmarker,
} from "./performance-benchmarker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "../../../");

// Initialize benchmarker
const config = createDefaultBenchmarkerConfig(projectRoot);

// Ensure directories exist
if (!existsSync(config.baselineDir)) {
  mkdirSync(config.baselineDir, { recursive: true });
}
if (!existsSync(config.reportsDir)) {
  mkdirSync(config.reportsDir, { recursive: true });
}

const benchmarker = new PerformanceBenchmarker(config);

/**
 * Core page performance benchmark suite
 */
test.describe("Core Page Performance", () => {
  const pages = [
    { name: "Homepage", url: "/", selector: "main" },
    { name: "About", url: "/about", selector: "main" },
    {
      name: "Products",
      url: "/products",
      selector: '[data-testid="product-grid"]',
    },
    {
      name: "Product Detail",
      url: "/products/example-product",
      selector: '[data-testid="product-detail"]',
    },
    {
      name: "Shopping Cart",
      url: "/cart",
      selector: '[data-testid="cart-content"]',
    },
    { name: "Checkout", url: "/checkout", selector: "form" },
  ];

  pages.forEach(({ name, url, selector }) => {
    test(`${name} - Performance Benchmark`, async ({ page }) => {
      test.slow(); // Mark as slow test

      const fullUrl = `${process.env.BASE_URL || "http://localhost:3200"}${url}`;

      console.log(`🏃‍♂️ Benchmarking ${name} (${fullUrl})`);

      const metrics = await benchmarker.benchmark(page, fullUrl, {
        device: "desktop",
        environment: process.env.NODE_ENV || "test",
      });

      // Assert performance thresholds
      expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds max
      expect(metrics.fcp).toBeLessThan(2000); // 2 seconds FCP
      expect(metrics.lcp).toBeLessThan(4000); // 4 seconds LCP
      expect(metrics.cls).toBeLessThan(0.1); // CLS < 0.1
      expect(metrics.tti).toBeLessThan(5000); // 5 seconds TTI

      console.log(`✅ ${name} performance metrics:`, {
        cls: metrics.cls.toFixed(3),
        fcp: `${Math.round(metrics.fcp)}ms`,
        lcp: `${Math.round(metrics.lcp)}ms`,
        loadTime: `${Math.round(metrics.loadTime)}ms`,
        tti: `${Math.round(metrics.tti)}ms`,
      });
    });

    test(`${name} - Mobile Performance Benchmark`, async ({ page }) => {
      test.slow();

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const fullUrl = `${process.env.BASE_URL || "http://localhost:3200"}${url}`;

      console.log(`📱 Mobile benchmarking ${name} (${fullUrl})`);

      const metrics = await benchmarker.benchmark(page, fullUrl, {
        device: "mobile",
        environment: process.env.NODE_ENV || "test",
      });

      // Mobile thresholds are typically more lenient
      expect(metrics.loadTime).toBeLessThan(8000); // 8 seconds max on mobile
      expect(metrics.fcp).toBeLessThan(3000); // 3 seconds FCP
      expect(metrics.lcp).toBeLessThan(6000); // 6 seconds LCP
      expect(metrics.cls).toBeLessThan(0.15); // CLS < 0.15
      expect(metrics.tti).toBeLessThan(8000); // 8 seconds TTI

      console.log(`📱 ${name} mobile metrics:`, {
        cls: metrics.cls.toFixed(3),
        fcp: `${Math.round(metrics.fcp)}ms`,
        lcp: `${Math.round(metrics.lcp)}ms`,
        loadTime: `${Math.round(metrics.loadTime)}ms`,
        tti: `${Math.round(metrics.tti)}ms`,
      });
    });
  });
});

/**
 * Baseline establishment suite
 */
test.describe("Performance Baseline Establishment", () => {
  test.skip(({}, testInfo) => {
    // Only run in baseline establishment mode
    return !process.env.ESTABLISH_BASELINE;
  });

  const criticalPages = [
    { name: "Homepage", url: "/" },
    { name: "Products", url: "/products" },
    { name: "Product Detail", url: "/products/example-product" },
  ];

  criticalPages.forEach(({ name, url }) => {
    test(`Establish ${name} Baseline - Desktop`, async ({ page }) => {
      test.slow();

      const fullUrl = `${process.env.BASE_URL || "http://localhost:3200"}${url}`;

      console.log(`📊 Establishing baseline for ${name} (${fullUrl})`);

      const baseline = await benchmarker.establishBaseline(page, fullUrl, {
        commitHash: process.env.COMMIT_HASH,
        device: "desktop",
        environment: "production",
        version: process.env.APP_VERSION || "1.0.0",
      });

      console.log(`✅ Baseline established for ${name}:`, {
        cls: baseline.metrics.cls.toFixed(3),
        fcp: `${Math.round(baseline.metrics.fcp)}ms`,
        lcp: `${Math.round(baseline.metrics.lcp)}ms`,
        loadTime: `${Math.round(baseline.metrics.loadTime)}ms`,
      });
    });

    test(`Establish ${name} Baseline - Mobile`, async ({ page }) => {
      test.slow();

      await page.setViewportSize({ width: 375, height: 667 });

      const fullUrl = `${process.env.BASE_URL || "http://localhost:3200"}${url}`;

      console.log(`📱 Establishing mobile baseline for ${name} (${fullUrl})`);

      const baseline = await benchmarker.establishBaseline(page, fullUrl, {
        commitHash: process.env.COMMIT_HASH,
        device: "mobile",
        environment: "production",
        version: process.env.APP_VERSION || "1.0.0",
      });

      console.log(`📱 Mobile baseline established for ${name}:`, {
        cls: baseline.metrics.cls.toFixed(3),
        fcp: `${Math.round(baseline.metrics.fcp)}ms`,
        lcp: `${Math.round(baseline.metrics.lcp)}ms`,
        loadTime: `${Math.round(baseline.metrics.loadTime)}ms`,
      });
    });
  });
});

/**
 * Performance regression detection suite
 */
test.describe("Performance Regression Detection", () => {
  test.skip(({}, testInfo) => {
    // Only run in regression detection mode
    return !process.env.CHECK_REGRESSION;
  });

  const criticalPages = [
    { name: "Homepage", url: "/" },
    { name: "Products", url: "/products" },
    { name: "Product Detail", url: "/products/example-product" },
  ];

  criticalPages.forEach(({ name, url }) => {
    test(`${name} - Regression Check Desktop`, async ({ page }) => {
      test.slow();

      const fullUrl = `${process.env.BASE_URL || "http://localhost:3200"}${url}`;

      console.log(
        `🔍 Checking for performance regressions on ${name} (${fullUrl})`,
      );

      try {
        const comparison = await benchmarker.compareWithBaseline(
          page,
          fullUrl,
          {
            baselineEnvironment: "production",
            device: "desktop",
            environment: "test",
          },
        );

        console.log(`📊 Performance comparison for ${name}:`);
        console.log(`   Overall status: ${comparison.overallStatus}`);
        console.log(`   Performance score: ${comparison.score}/100`);

        // Log significant changes
        Object.entries(comparison.differences).forEach(([metric, diff]) => {
          if (Math.abs(diff.percentageChange) > 10) {
            const emoji = diff.status === "improved" ? "📈" : "📉";
            console.log(
              `   ${emoji} ${metric}: ${diff.percentageChange.toFixed(1)}% ${diff.status}`,
            );
          }
        });

        // Assert no major regressions
        expect(comparison.overallStatus).not.toBe("failed");
        expect(comparison.score).toBeGreaterThan(60);

        // Check specific critical metrics
        expect(comparison.differences.loadTime.percentageChange).toBeLessThan(
          25,
        );
        expect(comparison.differences.fcp.percentageChange).toBeLessThan(25);
        expect(comparison.differences.lcp.percentageChange).toBeLessThan(25);
      } catch (error) {
        if (error.message.includes("No baseline found")) {
          console.log(
            `⚠️  No baseline found for ${name}, skipping regression check`,
          );
          test.skip();
        } else {
          throw error;
        }
      }
    });

    test(`${name} - Regression Check Mobile`, async ({ page }) => {
      test.slow();

      await page.setViewportSize({ width: 375, height: 667 });

      const fullUrl = `${process.env.BASE_URL || "http://localhost:3200"}${url}`;

      console.log(
        `📱 Checking for mobile performance regressions on ${name} (${fullUrl})`,
      );

      try {
        const comparison = await benchmarker.compareWithBaseline(
          page,
          fullUrl,
          {
            baselineEnvironment: "production",
            device: "mobile",
            environment: "test",
          },
        );

        console.log(`📱 Mobile performance comparison for ${name}:`);
        console.log(`   Overall status: ${comparison.overallStatus}`);
        console.log(`   Performance score: ${comparison.score}/100`);

        // Mobile allows for slightly more lenient thresholds
        expect(comparison.overallStatus).not.toBe("failed");
        expect(comparison.score).toBeGreaterThan(50);

        expect(comparison.differences.loadTime.percentageChange).toBeLessThan(
          30,
        );
        expect(comparison.differences.fcp.percentageChange).toBeLessThan(30);
        expect(comparison.differences.lcp.percentageChange).toBeLessThan(30);
      } catch (error) {
        if (error.message.includes("No baseline found")) {
          console.log(
            `⚠️  No mobile baseline found for ${name}, skipping regression check`,
          );
          test.skip();
        } else {
          throw error;
        }
      }
    });
  });
});

/**
 * Custom performance scenarios
 */
test.describe("Custom Performance Scenarios", () => {
  test("Heavy Product Grid Performance", async ({ page }) => {
    test.slow();

    const url = `${process.env.BASE_URL || "http://localhost:3200"}/products?limit=50`;

    console.log(`🔍 Testing heavy product grid performance`);

    const metrics = await benchmarker.collectMetrics(page, url, {
      additionalTimings: {
        gridRenderTime: async () => {
          return await page.evaluate(() => {
            const start = performance.now();
            // Simulate checking when grid is fully rendered
            return new Promise<number>((resolve) => {
              const observer = new MutationObserver(() => {
                const grid = document.querySelector(
                  '[data-testid="product-grid"]',
                );
                if (grid && grid.children.length >= 20) {
                  observer.disconnect();
                  resolve(performance.now() - start);
                }
              });
              observer.observe(document.body, {
                childList: true,
                subtree: true,
              });
            });
          });
        },
      },
      waitForSelector: '[data-testid="product-grid"]',
    });

    // Assert that grid loads within reasonable time
    expect(metrics.loadTime).toBeLessThan(8000);
    expect(metrics.customTimings.gridRenderTime).toBeLessThan(3000);

    console.log(`✅ Heavy grid metrics:`, {
      gridRenderTime: `${Math.round(metrics.customTimings.gridRenderTime)}ms`,
      loadTime: `${Math.round(metrics.loadTime)}ms`,
    });
  });

  test("Search Performance", async ({ page }) => {
    test.slow();

    const url = `${process.env.BASE_URL || "http://localhost:3200"}/search?q=product`;

    console.log(`🔍 Testing search performance`);

    const metrics = await benchmarker.collectMetrics(page, url, {
      additionalTimings: {
        searchResultTime: async () => {
          return await page.evaluate(() => {
            const start = performance.now();
            return new Promise<number>((resolve) => {
              const observer = new MutationObserver(() => {
                const results = document.querySelector(
                  '[data-testid="search-results"]',
                );
                if (results && results.children.length > 0) {
                  observer.disconnect();
                  resolve(performance.now() - start);
                }
              });
              observer.observe(document.body, {
                childList: true,
                subtree: true,
              });
            });
          });
        },
      },
      waitForSelector: '[data-testid="search-results"]',
    });

    expect(metrics.loadTime).toBeLessThan(6000);
    expect(metrics.customTimings.searchResultTime).toBeLessThan(2000);

    console.log(`✅ Search metrics:`, {
      loadTime: `${Math.round(metrics.loadTime)}ms`,
      searchResultTime: `${Math.round(metrics.customTimings.searchResultTime)}ms`,
    });
  });

  test("Authentication Flow Performance", async ({ page }) => {
    test.slow();

    const loginUrl = `${process.env.BASE_URL || "http://localhost:3200"}/auth/sign-in`;

    console.log(`🔐 Testing authentication flow performance`);

    // Test login page load
    const loginMetrics = await benchmarker.collectMetrics(page, loginUrl, {
      waitForSelector: 'form[data-testid="sign-in-form"]',
    });

    // Test form interaction performance
    const formInteractionTime = await page.evaluate(() => {
      const start = performance.now();
      const emailInput = document.querySelector(
        'input[type="email"]',
      ) as HTMLInputElement;
      const passwordInput = document.querySelector(
        'input[type="password"]',
      ) as HTMLInputElement;

      if (emailInput && passwordInput) {
        emailInput.value = "test@example.com";
        passwordInput.value = "password";

        // Trigger input events
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));
        passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      return performance.now() - start;
    });

    expect(loginMetrics.loadTime).toBeLessThan(4000);
    expect(formInteractionTime).toBeLessThan(100); // Form should be responsive

    console.log(`✅ Auth flow metrics:`, {
      formInteractionTime: `${Math.round(formInteractionTime)}ms`,
      loadTime: `${Math.round(loginMetrics.loadTime)}ms`,
    });
  });
});

/**
 * Bundle size and asset optimization tests
 */
test.describe("Bundle Size and Asset Optimization", () => {
  test("JavaScript Bundle Size Analysis", async ({ page }) => {
    const url = `${process.env.BASE_URL || "http://localhost:3200"}/`;

    console.log(`📦 Analyzing JavaScript bundle sizes`);

    await page.goto(url);

    const bundleAnalysis = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      const stylesheets = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      );

      return {
        inlineScripts: document.querySelectorAll("script:not([src])").length,
        inlineStyles: document.querySelectorAll("style").length,
        scriptCount: scripts.length,
        stylesheetCount: stylesheets.length,
      };
    });

    // Assert reasonable bundle counts
    expect(bundleAnalysis.scriptCount).toBeLessThan(20); // Not too many script files
    expect(bundleAnalysis.stylesheetCount).toBeLessThan(10); // Not too many CSS files

    console.log(`📦 Bundle analysis:`, bundleAnalysis);
  });

  test("Image Optimization Check", async ({ page }) => {
    const url = `${process.env.BASE_URL || "http://localhost:3200"}/products`;

    console.log(`🖼️  Checking image optimization`);

    await page.goto(url);
    await page.waitForSelector("img", { timeout: 10000 });

    const imageAnalysis = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img"));

      return {
        largeImages: images.filter((img) => {
          const rect = img.getBoundingClientRect();
          return rect.width > 1000 || rect.height > 1000;
        }).length,
        lazyImages: images.filter((img) => img.loading === "lazy").length,
        totalImages: images.length,
        withoutAlt: images.filter((img) => !img.alt).length,
      };
    });

    // Assert good image practices
    expect(imageAnalysis.withoutAlt).toBe(0); // All images should have alt text
    expect(imageAnalysis.lazyImages).toBeGreaterThan(0); // Some images should be lazy loaded

    console.log(`🖼️  Image analysis:`, imageAnalysis);
  });
});
