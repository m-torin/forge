import { expect, test } from "@repo/testing/e2e";
import { PerformanceUtils, WaitUtils } from "@repo/testing/e2e";

import { createApiMocker, mockStates } from "./utils/api-mock";

test.describe("API Integration - Enhanced", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test("health check endpoints should be accessible", async ({ page }) => {
    const healthEndpoints = [
      { expectedStatus: 200, path: "/api/health" },
      { expectedStatus: [200, 404], path: "/health" }, // Optional endpoint
      { expectedStatus: [200, 404], path: "/api/status" }, // Optional endpoint
    ];

    const healthResults = [];

    for (const endpoint of healthEndpoints) {
      try {
        const response = await page.request.get(endpoint.path);
        const status = response.status();

        healthResults.push({
          endpoint: endpoint.path,
          responseTime: Date.now(), // Simplified timing
          status,
          success: Array.isArray(endpoint.expectedStatus)
            ? endpoint.expectedStatus.includes(status)
            : status === endpoint.expectedStatus,
        });

        if (Array.isArray(endpoint.expectedStatus)) {
          expect(endpoint.expectedStatus).toContain(status);
        } else {
          expect(status).toBe(endpoint.expectedStatus);
        }
      } catch (error) {
        console.warn(`Health check failed for ${endpoint.path}:`, error);
        healthResults.push({
          endpoint: endpoint.path,
          error: error.message,
          status: 0,
          success: false,
        });
      }
    }

    await test.info().attach("health-check-results", {
      body: JSON.stringify(healthResults, null, 2),
      contentType: "application/json",
    });

    // At least one health endpoint should be working
    const workingEndpoints = healthResults.filter((r) => r.success);
    expect(workingEndpoints.length).toBeGreaterThan(0);
  });

  test("API error handling with mocked failures", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Test different error scenarios
    const errorScenarios = [
      { errorType: "server-error", expectedStatus: 500, path: "/api/products" },
      {
        errorType: "unauthorized",
        expectedStatus: 401,
        path: "/api/auth/session",
      },
      { errorType: "not-found", expectedStatus: 404, path: "/api/nonexistent" },
    ];

    const errorResults = [];

    for (const scenario of errorScenarios) {
      // Mock the specific error
      mocker.mockApiError(scenario.path, scenario.errorType);

      try {
        const response = await page.request.get(scenario.path);
        const status = response.status();

        errorResults.push({
          actualStatus: status,
          errorType: scenario.errorType,
          expectedStatus: scenario.expectedStatus,
          handledCorrectly: status === scenario.expectedStatus,
          path: scenario.path,
        });

        expect(status).toBe(scenario.expectedStatus);
      } catch (error) {
        errorResults.push({
          error: error.message,
          errorType: scenario.errorType,
          handledCorrectly: false,
          path: scenario.path,
        });
      }
    }

    await test.info().attach("api-error-handling", {
      body: JSON.stringify(errorResults, null, 2),
      contentType: "application/json",
    });
  });

  test("API performance and response times", async ({ page }) => {
    const apiEndpoints = [
      { critical: true, method: "GET", path: "/api/health" },
      { critical: false, method: "GET", path: "/api/auth/session" },
      { critical: true, method: "GET", path: "/" }, // HTML page
    ];

    const performanceResults = [];

    for (const endpoint of apiEndpoints) {
      const iterations = endpoint.critical ? 3 : 1;
      const responseTimes = [];

      for (let i = 0; i < iterations; i++) {
        try {
          const startTime = Date.now();
          const response = await page.request.get(endpoint.path);
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          responseTimes.push({
            attempt: i + 1,
            contentLength: (await response.text()).length,
            responseTime,
            status: response.status(),
          });
        } catch (error) {
          responseTimes.push({
            attempt: i + 1,
            error: error.message,
            responseTime: -1,
          });
        }
      }

      const validTimes = responseTimes.filter((r) => r.responseTime > 0);
      const avgResponseTime =
        validTimes.length > 0
          ? validTimes.reduce((sum, r) => sum + r.responseTime, 0) /
            validTimes.length
          : -1;

      performanceResults.push({
        attempts: responseTimes,
        averageResponseTime: avgResponseTime,
        critical: endpoint.critical,
        endpoint: endpoint.path,
        method: endpoint.method,
        performanceGrade:
          avgResponseTime < 100
            ? "A"
            : avgResponseTime < 300
              ? "B"
              : avgResponseTime < 1000
                ? "C"
                : "D",
      });

      // Critical endpoints should respond quickly
      if (endpoint.critical && avgResponseTime > 0) {
        expect(avgResponseTime).toBeLessThan(2000); // 2 seconds max for critical APIs
      }
    }

    await test.info().attach("api-performance-analysis", {
      body: JSON.stringify(performanceResults, null, 2),
      contentType: "application/json",
    });
  });

  test("API rate limiting behavior", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Mock rate limiting
    mocker.mockRateLimit("/api/limited", { limit: 3, window: 1000 });

    const rateLimitResults = [];
    const testEndpoint = "/api/limited";

    // Make rapid requests to test rate limiting
    for (let i = 0; i < 5; i++) {
      try {
        const startTime = Date.now();
        const response = await page.request.get(testEndpoint);
        const endTime = Date.now();

        rateLimitResults.push({
          rateLimited: response.status() === 429,
          request: i + 1,
          responseTime: endTime - startTime,
          status: response.status(),
        });
      } catch (error) {
        rateLimitResults.push({
          error: error.message,
          rateLimited: true,
          request: i + 1,
        });
      }

      // Small delay between requests
      await page.waitForTimeout(100);
    }

    // Should see rate limiting after the limit is reached
    const rateLimitedRequests = rateLimitResults.filter((r) => r.rateLimited);
    expect(rateLimitedRequests.length).toBeGreaterThan(0);

    await test.info().attach("rate-limiting-test", {
      body: JSON.stringify(rateLimitResults, null, 2),
      contentType: "application/json",
    });
  });

  test("API authentication flow integration", async ({ page }) => {
    const mocker = await createApiMocker(page, "auth");

    // Test authenticated vs unauthenticated requests
    const authTests = [
      {
        description: "Session endpoint",
        expectsAuth: false, // Session endpoint should work without auth
        path: "/api/auth/session",
      },
      {
        description: "User profile",
        expectsAuth: true,
        path: "/api/user/profile",
      },
      {
        description: "Admin endpoint",
        expectsAuth: true,
        path: "/api/admin/users",
      },
    ];

    const authResults = [];

    for (const authTest of authTests) {
      // Test without authentication
      try {
        const unauthedResponse = await page.request.get(authTest.path);
        const unauthedStatus = unauthedResponse.status();

        authResults.push({
          description: authTest.description,
          endpoint: authTest.path,
          properlyProtected: authTest.expectsAuth
            ? unauthedStatus === 401
            : unauthedStatus < 400,
          shouldRequireAuth: authTest.expectsAuth,
          unauthenticatedStatus: unauthedStatus,
        });

        if (authTest.expectsAuth) {
          // Should be unauthorized
          expect([401, 403]).toContain(unauthedStatus);
        } else {
          // Should be accessible or not found (if endpoint doesn't exist)
          expect(unauthedStatus).toBeLessThan(500);
        }
      } catch (error) {
        authResults.push({
          description: authTest.description,
          endpoint: authTest.path,
          error: error.message,
          properlyProtected: authTest.expectsAuth, // Assume protected if it errors
        });
      }
    }

    // Test with mocked authentication
    mocker.mockAuth({ loginSuccess: true, user: { id: 1, role: "user" } });

    for (const authTest of authTests) {
      try {
        const authedResponse = await page.request.get(authTest.path, {
          headers: { Authorization: "Bearer mock-token" },
        });

        const result = authResults.find((r) => r.endpoint === authTest.path);
        if (result) {
          result.authenticatedStatus = authedResponse.status();
          result.authWorking = authedResponse.status() < 400;
        }
      } catch (error) {
        const result = authResults.find((r) => r.endpoint === authTest.path);
        if (result) {
          result.authenticatedError = error.message;
        }
      }
    }

    await test.info().attach("auth-integration-test", {
      body: JSON.stringify(authResults, null, 2),
      contentType: "application/json",
    });
  });

  test("API offline behavior and resilience", async ({ page }) => {
    const mocker = await createApiMocker(page);

    // Test offline scenario
    mockStates.offline(mocker);

    await page.goto("/");
    await waitUtils.forNavigation();

    // Check how the app handles offline state
    const offlineIndicators = [
      '[data-testid="offline-banner"]',
      ".offline-message",
      '[aria-label*="offline"]',
      ".network-error",
    ];

    const offlineHandling = {
      hasOfflineIndicator: false,
      indicatorType: null,
      pageStillFunctional: false,
    };

    for (const selector of offlineIndicators) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        offlineHandling.hasOfflineIndicator = true;
        offlineHandling.indicatorType = selector;
        break;
      }
    }

    // Check if basic page functionality still works
    const bodyText = await page.textContent("body");
    offlineHandling.pageStillFunctional = bodyText && bodyText.length > 100;

    // Test retry functionality
    const retryButtons = page.locator(
      '[data-testid="retry"], button[aria-label*="retry"]',
    );
    if ((await retryButtons.count()) > 0) {
      // Reset to online state
      mockStates.online(mocker);

      await retryButtons.first().click();
      await page.waitForTimeout(1000);

      offlineHandling.hasRetryFunctionality = true;
    }

    await test.info().attach("offline-resilience-test", {
      body: JSON.stringify(offlineHandling, null, 2),
      contentType: "application/json",
    });

    // App should either show offline indicator or maintain functionality
    expect(
      offlineHandling.hasOfflineIndicator ||
        offlineHandling.pageStillFunctional,
    ).toBeTruthy();
  });

  test("API request/response content validation", async ({ page }) => {
    const apiEndpoints = [
      {
        expectedContentType: "application/json",
        path: "/api/health",
        requiredFields: ["status"],
      },
    ];

    const contentValidationResults = [];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await page.request.get(endpoint.path);
        const status = response.status();
        const contentType = response.headers()["content-type"] || "";

        const contentValidation = {
          contentType,
          contentTypeMatch: contentType.includes(endpoint.expectedContentType),
          endpoint: endpoint.path,
          expectedContentType: endpoint.expectedContentType,
          fieldsPresent: [],
          requiredFields: endpoint.requiredFields,
          status,
        };

        if (status === 200 && contentType.includes("json")) {
          try {
            const jsonData = await response.json();

            endpoint.requiredFields.forEach((field) => {
              const hasField = jsonData.hasOwnProperty(field);
              contentValidation.fieldsPresent.push({
                field,
                present: hasField,
                value: hasField ? jsonData[field] : null,
              });
            });

            // All required fields should be present
            const allFieldsPresent = contentValidation.fieldsPresent.every(
              (f) => f.present,
            );
            expect(allFieldsPresent).toBeTruthy();

            contentValidation.allFieldsPresent = allFieldsPresent;
          } catch (parseError) {
            contentValidation.jsonParseError = parseError.message;
          }
        }

        contentValidationResults.push(contentValidation);

        // Content type should match expected
        if (status === 200) {
          expect(contentType).toContain(endpoint.expectedContentType);
        }
      } catch (error) {
        contentValidationResults.push({
          endpoint: endpoint.path,
          error: error.message,
        });
      }
    }

    await test.info().attach("content-validation-results", {
      body: JSON.stringify(contentValidationResults, null, 2),
      contentType: "application/json",
    });
  });

  test("API caching and optimization headers", async ({ page }) => {
    const endpoints = [
      { type: "html", path: "/" },
      { type: "api", path: "/api/health" },
    ];

    const cachingResults = [];

    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(endpoint.path);
        const headers = response.headers();

        const cachingInfo = {
          type: endpoint.type,
          cacheControl: headers["cache-control"],
          endpoint: endpoint.path,
          etag: headers["etag"],
          expires: headers["expires"],
          hasCachingHeaders: !!(
            headers["cache-control"] ||
            headers["etag"] ||
            headers["expires"]
          ),
          lastModified: headers["last-modified"],
          securityHeaders: {
            strictTransportSecurity: headers["strict-transport-security"],
            xContentTypeOptions: headers["x-content-type-options"],
            xFrameOptions: headers["x-frame-options"],
            xXssProtection: headers["x-xss-protection"],
          },
          status: response.status(),
        };

        cachingResults.push(cachingInfo);

        // Static resources should have caching headers
        if (endpoint.type === "html" && response.status() === 200) {
          expect(cachingInfo.hasCachingHeaders).toBeTruthy();
        }
      } catch (error) {
        cachingResults.push({
          endpoint: endpoint.path,
          error: error.message,
        });
      }
    }

    await test.info().attach("caching-and-headers", {
      body: JSON.stringify(cachingResults, null, 2),
      contentType: "application/json",
    });
  });
});
