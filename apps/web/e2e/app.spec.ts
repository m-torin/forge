import { expect, test } from "@repo/testing/e2e";
import { AppTestHelpers, PerformanceUtils, WaitUtils } from "@repo/testing/e2e";

import type { AppTestConfig } from "@repo/testing/e2e";

test.describe("Web App", () => {
  let helpers: AppTestHelpers;
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    const config: AppTestConfig = {
      name: "web",
      appDirectory: "/Users/torin/repos/new--/forge/apps/web",
      baseURL: "http://localhost:3200",
      port: 3200,
    };
    helpers = new AppTestHelpers(config);
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test("app should load successfully", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // The web app should respond with a 200 status
    await expect(page).toHaveTitle(/.*/); // Any title is acceptable for now
    await helpers.checkBasicUI(page);
  });

  test("should display the homepage content", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load and check for any content
    await waitUtils.forNavigation();

    // Check that the page has some content
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
  });

  test("should have good performance metrics", async ({ page }) => {
    await page.goto("/");

    // Measure page load performance
    const metrics = await perfUtils.measurePageLoad();

    // Assert reasonable performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint).toBeLessThan(3000); // 3 seconds
    }
  });

  test("health check endpoint should be accessible", async ({ page }) => {
    const response = await page.request.get("/api/health");
    expect(response.ok()).toBeTruthy();
  });
});
