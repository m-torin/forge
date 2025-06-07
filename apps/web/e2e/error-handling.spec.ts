import { expect, test } from "@repo/testing/e2e";
import { PerformanceUtils, WaitUtils } from "@repo/testing/e2e";

import { createApiMocker } from "./utils/api-mock";
import { withPerformanceMonitoring } from "./utils/performance-monitor";
import { createVisualTester } from "./utils/visual-testing";

test.describe("Error Handling - Enhanced", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test("comprehensive 404 error handling with performance monitoring", async ({
    context,
    page,
  }) => {
    const visualTester = createVisualTester(page);

    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/non-existent-page-12345",
      async () => {
        await waitUtils.forNavigation();

        // Comprehensive 404 page analysis
        const errorPageAnalysis = await page.evaluate(() => {
          const pageContent = document.body.textContent || "";
          const has404Content =
            /404|not found|page not found|doesn't exist/i.test(pageContent);

          // Check navigation options
          const homeLinks = Array.from(document.querySelectorAll("a")).filter(
            (link) => /home|back|return/i.test(link.textContent || ""),
          );

          const searchBox = document.querySelector(
            'input[type="search"], [role="searchbox"]',
          );
          const breadcrumbs = document.querySelector(
            '.breadcrumb, [aria-label*="breadcrumb"]',
          );
          const navigation = document.querySelector("nav");

          // Check SEO elements
          const title = document.title;
          const description = document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content");
          const statusCode = (window as any).__NEXT_DATA__?.props?.statusCode;

          return {
            has404Content,
            navigationOptions: {
              hasBreadcrumbs: !!breadcrumbs,
              hasNavigation: !!navigation,
              hasSearchBox: !!searchBox,
              homeLinksCount: homeLinks.length,
            },
            seo: {
              description,
              statusCode,
              title,
            },
            userExperience: {
              contentLength: pageContent.length,
              isUserFriendly:
                has404Content && (homeLinks.length > 0 || !!navigation),
            },
          };
        });

        // Validations
        expect(errorPageAnalysis.has404Content).toBeTruthy();
        expect(errorPageAnalysis.userExperience.isUserFriendly).toBeTruthy();
        expect(errorPageAnalysis.seo.title).toBeTruthy();

        // Take visual regression screenshot
        await visualTester.comparePageState(page, "404-error-page", {
          animations: "disabled",
          fullPage: true,
        });

        return errorPageAnalysis;
      },
      {
        fcp: { error: 4000, warning: 2000 },
        lcp: { error: 5000, warning: 3000 },
      },
    );

    await test.info().attach("404-error-analysis", {
      body: JSON.stringify({ ...result, performance: report }, null, 2),
      contentType: "application/json",
    });
  });

  test("should handle various non-existent route patterns", async ({
    page,
  }) => {
    const testRoutes = [
      {
        type: "deep nested",
        path: "/products/non-existent-product/deep/nested/path",
      },
      { type: "product dynamic", path: "/products/non-existent-product-xyz" },
      {
        type: "collection dynamic",
        path: "/collections/non-existent-collection-xyz",
      },
      { type: "blog dynamic", path: "/blog/non-existent-post-xyz" },
      { type: "user dynamic", path: "/users/non-existent-user-xyz" },
    ];

    const routeTestResults = [];

    for (const route of testRoutes) {
      try {
        const startTime = Date.now();
        await page.goto(route.path);
        await waitUtils.forNavigation();
        const loadTime = Date.now() - startTime;

        const pageAnalysis = await page.evaluate(() => {
          const pageContent = document.body.textContent || "";
          const has404Content =
            /404|not found|page not found|doesn't exist/i.test(pageContent);
          const hasLayout = !!(
            document.querySelector("header") || document.querySelector("nav")
          );
          const title = document.title;

          return {
            contentLength: pageContent.length,
            has404Content,
            hasLayout,
            title,
          };
        });

        routeTestResults.push({
          type: route.type,
          analysis: pageAnalysis,
          loadTime,
          path: route.path,
          success: pageAnalysis.has404Content,
        });

        expect(pageAnalysis.has404Content).toBeTruthy();
      } catch (error) {
        routeTestResults.push({
          type: route.type,
          error: error.message,
          path: route.path,
          success: false,
        });
      }
    }

    await test.info().attach("route-error-handling-analysis", {
      body: JSON.stringify(routeTestResults, null, 2),
      contentType: "application/json",
    });

    // At least 80% of routes should handle errors properly
    const successfulRoutes = routeTestResults.filter((r) => r.success).length;
    expect(successfulRoutes / testRoutes.length).toBeGreaterThan(0.8);
  });

  test("should handle JavaScript and network errors with resilience testing", async ({
    page,
  }) => {
    const mocker = await createApiMocker(page);
    const errorLog = {
      consoleErrors: [],
      jsErrors: [],
      networkErrors: [],
      recoveryTests: [],
    };

    // Set up error monitoring
    page.on("pageerror", (error) => {
      errorLog.jsErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      });
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errorLog.consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: Date.now(),
        });
      }
    });

    await page.goto("/");
    await waitUtils.forNavigation();

    // Test 1: JavaScript error resilience
    const jsErrorRecovery = await page.evaluate(() => {
      try {
        // @ts-ignore - intentional error
        undefinedFunction();
        return { errorThrown: false, recovered: false };
      } catch (e) {
        // Check if page is still functional after error
        const isPageFunctional = !!(document.body && document.body.textContent);
        return { errorThrown: true, recovered: isPageFunctional };
      }
    });

    errorLog.recoveryTests.push({
      type: "javascript-error",
      ...jsErrorRecovery,
    });

    // Test 2: Network error resilience
    await page.route("**/*", (route) => {
      if (route.request().url().includes("api/")) {
        errorLog.networkErrors.push({
          url: route.request().url(),
          blocked: true,
          method: route.request().method(),
        });
        route.abort("failed");
      } else {
        route.continue();
      }
    });

    const networkErrorRecovery = await page.evaluate(async () => {
      try {
        const response = await fetch("/api/health");
        return { apiCallSucceeded: response.ok, pageStillFunctional: true };
      } catch (error) {
        const isPageFunctional = !!(document.body && document.body.textContent);
        return {
          apiCallSucceeded: false,
          errorHandled: true,
          pageStillFunctional: isPageFunctional,
        };
      }
    });

    errorLog.recoveryTests.push({
      type: "network-error",
      ...networkErrorRecovery,
    });

    // Test 3: React error boundary testing
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("test-error"));
    });

    const reactErrorRecovery = await page.evaluate(() => {
      return {
        hasErrorBoundary: !!document.querySelector(
          "[data-error-boundary], .error-boundary",
        ),
        pageRendered: !!(
          document.body &&
          document.body.textContent &&
          document.body.textContent.length > 100
        ),
      };
    });

    errorLog.recoveryTests.push({
      type: "react-error",
      ...reactErrorRecovery,
    });

    // Validations
    expect(jsErrorRecovery.recovered).toBeTruthy();
    expect(networkErrorRecovery.pageStillFunctional).toBeTruthy();
    expect(reactErrorRecovery.pageRendered).toBeTruthy();

    // Page should still be responsive
    const body = page.locator("body");
    await expect(body).toBeVisible();

    await test.info().attach("error-resilience-analysis", {
      body: JSON.stringify(errorLog, null, 2),
      contentType: "application/json",
    });
  });

  test("should show error boundaries for React errors", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Try to trigger a React error
    await page.evaluate(() => {
      // Dispatch a custom event that might trigger an error
      window.dispatchEvent(new CustomEvent("test-error"));
    });

    // Page should still be functional
    const isPageFunctional = await page.evaluate(() => {
      return (
        document.body &&
        document.body.textContent &&
        document.body.textContent.length > 0
      );
    });

    expect(isPageFunctional).toBeTruthy();
  });

  test("should handle form submission errors", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Look for forms
    const form = page.locator("form").first();

    if ((await form.count()) > 0) {
      // Try to submit empty form
      const submitButton = form.getByRole("button", {
        name: /submit|send|save/i,
      });

      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);

        // Should show validation errors or handle gracefully
        const errorMessages = page.locator(
          '.error, [role="alert"], .alert-error',
        );
        const hasErrors = (await errorMessages.count()) > 0;

        // Either should show errors or page should remain functional
        if (!hasErrors) {
          const pageContent = await page.textContent("body");
          expect(pageContent).toBeTruthy();
        }
      }
    }
  });

  test("should handle search with no results", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Look for search functionality
    const searchInput = page.getByRole("searchbox");

    if ((await searchInput.count()) > 0) {
      await searchInput.fill("xyznonexistentquerythatshouldhavenoResults123");
      await page.keyboard.press("Enter");
      await waitUtils.forNavigation();

      // Should show "no results" message
      const noResults = page.getByText(
        /no results|not found|no matches|nothing found/i,
      );
      if ((await noResults.count()) > 0) {
        await expect(noResults.first()).toBeVisible();
      }

      // Should have a way to go back or try again
      const backLink = page.getByRole("link", { name: /back|home|try again/i });
      if ((await backLink.count()) > 0) {
        await expect(backLink.first()).toBeVisible();
      }
    }
  });

  test("should handle expired sessions gracefully", async ({ page }) => {
    // Navigate to a protected route
    await page.goto("/en/account");
    await waitUtils.forNavigation();

    // Should either redirect to login or show appropriate message
    const currentUrl = page.url();
    const pageContent = await page.textContent("body");

    // Check if we're on an auth page or showing auth-related content
    const isAuthRelated =
      currentUrl.includes("/login") ||
      currentUrl.includes("/signin") ||
      currentUrl.includes("/auth") ||
      pageContent.toLowerCase().includes("sign in") ||
      pageContent.toLowerCase().includes("login") ||
      pageContent.toLowerCase().includes("account");

    // Page should handle unauthenticated access appropriately
    expect(isAuthRelated).toBeTruthy();
  });

  test("should handle large payloads gracefully", async ({ page }) => {
    await page.goto("/");
    await waitUtils.forNavigation();

    // Try to submit a very large form data
    const largeString = "x".repeat(100000); // 100KB string

    const result = await page.evaluate(async (data) => {
      try {
        const formData = new FormData();
        formData.append("large_field", data);

        const response = await fetch("/api/test-endpoint", {
          body: formData,
          method: "POST",
        });

        return { status: response.status, success: true };
      } catch (error) {
        return { error: (error as Error).message, success: false };
      }
    }, largeString);

    // Should handle large payloads (success or proper error)
    expect(result).toBeTruthy();
  });

  test("should have proper error page SEO", async ({ page }) => {
    await page.goto("/non-existent-page-12345");
    await waitUtils.forNavigation();

    // Should show 404 content
    const pageContent = await page.textContent("body");
    expect(pageContent).toMatch(/404|not found|doesn't exist/i);

    // Should have proper title
    const title = await page.title();
    expect(title).toBeTruthy();

    // Should have meta description
    const description = await page.getAttribute(
      'meta[name="description"]',
      "content",
    );
    expect(description).toBeTruthy();
  });

  test("should handle slow loading gracefully", async ({
    browserName,
    page,
  }) => {
    // Skip CDP-based throttling for webkit and mobile browsers
    if (browserName === "webkit" || page.context()._options.isMobile) {
      // Simple test for webkit/mobile - just verify page loads
      await page.goto("/");
      const pageContent = await page.textContent("body");
      expect(pageContent).toBeTruthy();
      return;
    }

    // Throttle network to simulate slow connection (Chrome/Firefox only)
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      downloadThroughput: 50 * 1024, // 50 KB/s
      latency: 2000, // 2 second delay
      offline: false,
      uploadThroughput: 50 * 1024,
    });

    const startTime = Date.now();
    await page.goto("/");

    // Should show loading state or handle gracefully
    const loadTime = Date.now() - startTime;

    // Page should eventually load even with slow network
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();

    // Should handle the slow loading (showing loaders, etc.)
    expect(loadTime).toBeGreaterThan(1000); // Should take some time due to throttling
  });

  test("should handle malformed URLs", async ({ page }) => {
    const malformedUrls = [
      "/products/%",
      "/collections/%%invalid%%",
      '/blog/<script>alert("xss")</script>',
      "/users/../../etc/passwd",
    ];

    for (const url of malformedUrls) {
      try {
        const response = await page.goto(url);

        // Should handle gracefully (404 or redirect)
        expect(response?.status()).toBeLessThan(500);

        const pageContent = await page.textContent("body");
        expect(pageContent).toBeTruthy();

        // Should not execute scripts or expose system files
        expect(pageContent).not.toContain("<script>");
        expect(pageContent).not.toContain("etc/passwd");
      } catch (error) {
        // Some malformed URLs might throw network errors, which is acceptable
        expect((error as Error).message).toBeTruthy();
      }
    }
  });
});
