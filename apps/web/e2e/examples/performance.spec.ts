import { expect, test } from "@playwright/test";

import {
  PerformanceMonitor,
  withPerformanceMonitoring,
} from "../utils/performance-monitor";

test.describe("Performance Tests", () => {
  test("homepage should meet performance thresholds", async ({
    context,
    page,
  }) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        // Perform interactions that should be measured
        await expect(page.locator("h1")).toBeVisible();
        await page.locator("button").first().click();
        return "test completed";
      },
      {
        fcp: { error: 2500, warning: 1500 },
        // Custom thresholds for this test
        lcp: { error: 3500, warning: 2000 },
      },
    );

    // Test passed if no errors were thrown by withPerformanceMonitoring
    expect(result).toBe("test completed");

    // Optionally attach performance data to test results
    await test.info().attach("performance-report", {
      body: JSON.stringify(report, null, 2),
      contentType: "application/json",
    });
  });

  test("product page performance", async ({ context, page }) => {
    const monitor = new PerformanceMonitor(page, context);

    await page.goto("/en/products/unified/test-product");
    await page.waitForLoadState("networkidle");

    const metrics = await monitor.collectMetrics();
    const violations = monitor.checkThresholds(metrics);

    // Log performance data
    console.log("Product page metrics:", metrics);

    // Ensure no critical violations
    const errors = violations.filter((v) => v.severity === "error");
    expect(errors).toHaveLength(0);

    // Attach detailed metrics
    await test.info().attach("product-page-metrics", {
      body: JSON.stringify({ metrics, violations }, null, 2),
      contentType: "application/json",
    });
  });

  test("checkout flow performance", async ({ context, page }) => {
    const monitor = new PerformanceMonitor(page, context);
    const pages = [
      "/en/cart",
      "/en/checkout",
      "/en/checkout/shipping",
      "/en/checkout/payment",
    ];

    const allMetrics = [];

    for (const url of pages) {
      await page.goto(url);
      const metrics = await monitor.collectMetrics();
      allMetrics.push({ url, metrics });
      monitor.reset(); // Reset for next page
    }

    // Ensure all pages meet basic performance criteria
    for (const { url, metrics } of allMetrics) {
      expect(metrics.loadComplete).toBeLessThan(5000); // 5 second max
      expect(metrics.lcp).toBeLessThan(4000); // 4 second LCP max
    }

    await test.info().attach("checkout-flow-metrics", {
      body: JSON.stringify(allMetrics, null, 2),
      contentType: "application/json",
    });
  });
});
