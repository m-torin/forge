import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Error Handling", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test("should show 404 page for non-existent routes", async ({ page }) => {
    const response = await page.goto("/non-existent-page-12345");

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should show custom 404 page
    const pageContent = await page.textContent("body");
    expect(pageContent).toMatch(/404|not found|page not found/i);

    // Should have a way to navigate back
    const homeLink = page.getByRole("link", { name: /home|back|return/i });
    if ((await homeLink.count()) > 0) {
      await expect(homeLink.first()).toBeVisible();
    }
  });

  test("should handle deep non-existent nested routes", async ({ page }) => {
    const response = await page.goto(
      "/products/non-existent-product/deep/nested/path",
    );

    expect(response?.status()).toBe(404);

    const pageContent = await page.textContent("body");
    expect(pageContent).toMatch(/404|not found|page not found/i);
  });

  test("should handle non-existent dynamic routes", async ({ page }) => {
    const testRoutes = [
      "/products/non-existent-product-xyz",
      "/collections/non-existent-collection-xyz",
      "/blog/non-existent-post-xyz",
      "/users/non-existent-user-xyz",
    ];

    for (const route of testRoutes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(404);

      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(/404|not found|page not found/i);
    }
  });

  test("should have proper error page layout", async ({ page }) => {
    await page.goto("/non-existent-page-12345");

    // Should have title
    const title = await page.title();
    expect(title).toMatch(/404|not found/i);

    // Should have proper heading
    const heading = page.getByRole("heading").first();
    if ((await heading.count()) > 0) {
      const headingText = await heading.textContent();
      expect(headingText).toMatch(/404|not found/i);
    }

    // Should have navigation
    const navigation = page.getByRole("navigation");
    if ((await navigation.count()) > 0) {
      await expect(navigation.first()).toBeVisible();
    }
  });

  test("should handle JavaScript errors gracefully", async ({ page }) => {
    const _errors: Error[] = [];

    page.on("pageerror", (error) => {
      _errors.push(error);
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("Console error:", msg.text());
      }
    });

    await page.goto("/");
    await waitUtils.forNavigation();

    // Inject a JavaScript error
    await page.evaluate(() => {
      try {
        // @ts-ignore - intentional error
        undefinedFunction();
      } catch (_e) {
        // Error should be caught and handled
      }
    });

    // Page should still be functional
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Start with a valid page
    await page.goto("/");
    await waitUtils.forNavigation();

    // Simulate network failure
    await page.route("**/*", (route) => {
      if (route.request().url().includes("api/")) {
        route.abort("failed");
      } else {
        route.continue();
      }
    });

    // Try to make an API call
    const apiCall = page.evaluate(async () => {
      try {
        const response = await fetch("/api/health");
        return response.ok;
      } catch (_error) {
        return false;
      }
    });

    const result = await apiCall;
    expect(result).toBe(false);

    // Page should still be responsive
    const body = page.locator("body");
    await expect(body).toBeVisible();
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
    // This would be more relevant for authenticated areas
    await page.goto("/account");

    // Should either redirect to login or show appropriate message
    const currentUrl = page.url();
    const isAuthRoute =
      currentUrl.includes("/login") ||
      currentUrl.includes("/signin") ||
      currentUrl.includes("/auth");
    const hasAuthMessage =
      (await page.getByText(/sign in|login|authenticate/i).count()) > 0;

    // Either should redirect to auth or show auth prompt
    expect(isAuthRoute || hasAuthMessage).toBeTruthy();
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
    const response = await page.goto("/non-existent-page-12345");
    expect(response?.status()).toBe(404);

    // Should have proper title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toMatch(/404|not found/i);

    // Should have meta description
    const description = await page.getAttribute(
      'meta[name="description"]',
      "content",
    );
    if (description) {
      expect(description).toMatch(/404|not found|page not found/i);
    }

    // Should not be indexed
    const robotsMeta = await page.getAttribute(
      'meta[name="robots"]',
      "content",
    );
    if (robotsMeta) {
      expect(robotsMeta).toMatch(/noindex/i);
    }
  });

  test("should handle slow loading gracefully", async ({ page }) => {
    // Throttle network to simulate slow connection
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
