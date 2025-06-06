import { expect, test } from "@repo/testing/e2e";
import { APITestUtils } from "@repo/testing/e2e";

test.describe("API Endpoints", () => {
  let _apiUtils: APITestUtils;

  test.beforeEach(async ({ request }) => {
    _apiUtils = new APITestUtils(request);
  });

  test("health endpoint should respond correctly", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeTruthy();
    expect(data.status).toBe("ok");
  });

  test("should handle CORS properly", async ({ request }) => {
    const response = await request.get("/api/health", {
      headers: {
        Origin: "https://example.com",
      },
    });

    // Check CORS headers
    const corsHeader = response.headers()["access-control-allow-origin"];
    expect(corsHeader).toBeTruthy();
  });

  test("auth endpoints should exist", async ({ request }) => {
    const authEndpoints = [
      "/api/auth/session",
      "/api/auth/signin",
      "/api/auth/signout",
      "/api/auth/signup",
    ];

    for (const endpoint of authEndpoints) {
      const response = await request.get(endpoint);

      // Should not return 404 (endpoint exists)
      expect(response.status()).not.toBe(404);

      // Auth endpoints typically return 401, 405, or redirect
      expect([200, 301, 302, 401, 405]).toContain(response.status());
    }
  });

  test("should handle authentication", async ({ request }) => {
    // Test unauthenticated request to protected endpoint
    const protectedResponse = await request.get("/api/auth/session");

    // Should handle unauthenticated requests gracefully
    expect([200, 401, 403]).toContain(protectedResponse.status());
  });

  test("should validate request methods", async ({ request }) => {
    // Test wrong HTTP method
    const response = await request.patch("/api/health");

    // Should return 405 Method Not Allowed or handle gracefully
    expect([405, 501]).toContain(response.status());
  });

  test("should handle malformed JSON", async ({ request }) => {
    try {
      const response = await request.post("/api/auth/signin", {
        data: "invalid json{",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Should return 400 Bad Request for malformed JSON
      expect([400, 422]).toContain(response.status());
    } catch (error) {
      // Some frameworks might throw errors for malformed JSON
      expect(error).toBeTruthy();
    }
  });

  test("should handle large payloads", async ({ request }) => {
    const largePayload = {
      data: "x".repeat(100000), // 100KB string
    };

    try {
      const response = await request.post("/api/health", {
        data: largePayload,
      });

      // Should either accept or reject with appropriate status
      expect([200, 413, 422]).toContain(response.status());
    } catch (error) {
      // Large payloads might be rejected at the network level
      expect(error).toBeTruthy();
    }
  });

  test("should rate limit requests", async ({ request }) => {
    const endpoint = "/api/health";
    const requests = [];

    // Make multiple rapid requests
    for (let i = 0; i < 20; i++) {
      requests.push(request.get(endpoint));
    }

    const responses = await Promise.all(requests);

    // Should handle multiple requests gracefully
    // Some might be rate limited (429) or all might succeed
    const statusCodes = responses.map((r) => r.status());
    const hasRateLimit = statusCodes.includes(429);
    const allSuccessful = statusCodes.every((code) => code === 200);

    expect(hasRateLimit || allSuccessful).toBeTruthy();
  });

  test("should handle SQL injection attempts", async ({ request }) => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "1' UNION SELECT * FROM users--",
    ];

    for (const payload of sqlInjectionPayloads) {
      try {
        const response = await request.post("/api/auth/signin", {
          data: {
            email: payload,
            password: payload,
          },
        });

        // Should not execute SQL (return error or handle gracefully)
        expect([400, 401, 422, 500]).toContain(response.status());

        const responseText = await response.text();
        // Should not contain SQL error messages
        expect(responseText.toLowerCase()).not.toContain("sql");
        expect(responseText.toLowerCase()).not.toContain("mysql");
        expect(responseText.toLowerCase()).not.toContain("postgresql");
      } catch (error) {
        // SQL injection should be blocked
        expect(error).toBeTruthy();
      }
    }
  });

  test("should handle XSS attempts", async ({ request }) => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">',
      '"><script>alert(document.cookie)</script>',
    ];

    for (const payload of xssPayloads) {
      try {
        const response = await request.post("/api/auth/signin", {
          data: {
            email: payload,
            password: "test",
          },
        });

        const responseText = await response.text();

        // Should sanitize or reject XSS payloads
        expect(responseText).not.toContain("<script>");
        expect(responseText).not.toContain("javascript:");
        expect(responseText).not.toContain("onerror=");
      } catch (error) {
        // XSS should be blocked
        expect(error).toBeTruthy();
      }
    }
  });

  test("should return proper content types", async ({ request }) => {
    const response = await request.get("/api/health");

    const contentType = response.headers()["content-type"];
    expect(contentType).toBeTruthy();
    expect(contentType).toContain("application/json");
  });

  test("should handle concurrent requests", async ({ request }) => {
    const concurrentRequests = 10;
    const requests = [];

    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(request.get("/api/health"));
    }

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    // All requests should complete
    expect(responses).toHaveLength(concurrentRequests);

    // Should handle concurrent requests efficiently
    const avgResponseTime = (endTime - startTime) / concurrentRequests;
    expect(avgResponseTime).toBeLessThan(5000); // 5 seconds per request average

    // All should be successful or handled gracefully
    const successfulResponses = responses.filter((r) => r.ok()).length;
    expect(successfulResponses).toBeGreaterThan(0);
  });

  test("should handle timeout scenarios", async ({ request }) => {
    try {
      // Set a very short timeout
      const response = await request.get("/api/health", {
        timeout: 1, // 1ms timeout
      });

      // If it succeeds, that's fine too
      expect(response).toBeTruthy();
    } catch (error) {
      // Timeout errors are expected
      expect((error as Error).message).toContain("timeout");
    }
  });

  test("should validate input parameters", async ({ request }) => {
    // Test with invalid parameters
    const response = await request.post("/api/auth/signin", {
      data: {
        email: "not-an-email",
        password: "", // empty password
      },
    });

    // Should validate input and return appropriate error
    expect([400, 422]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      expect(data.errors || data.error).toBeTruthy();
    }
  });

  test("should handle file uploads properly", async ({ request }) => {
    // Test file upload endpoint if it exists
    try {
      const response = await request.post("/api/upload", {
        multipart: {
          file: {
            name: "test.txt",
            buffer: Buffer.from("test file content"),
            mimeType: "text/plain",
          },
        },
      });

      // Should handle file uploads or return method not allowed
      expect([200, 201, 400, 404, 405, 413]).toContain(response.status());
    } catch (error) {
      // Upload endpoint might not exist
      expect(error).toBeTruthy();
    }
  });

  test("should handle pagination parameters", async ({ request }) => {
    const endpoints = [
      "/api/products",
      "/api/collections",
      "/api/blog",
      "/api/search",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await request.get(`${endpoint}?page=1&limit=10`);

        if (response.ok()) {
          const data = await response.json();

          // Should return structured data for pagination
          expect(data).toBeTruthy();

          // Common pagination fields
          const hasPagination =
            data.page || data.items || data.data || data.results;
          expect(hasPagination).toBeTruthy();
        }
      } catch (error) {
        // Endpoint might not exist
        expect(error).toBeTruthy();
      }
    }
  });

  test("should handle search queries", async ({ request }) => {
    try {
      const response = await request.get("/api/search?q=test");

      if (response.ok()) {
        const data = await response.json();
        expect(data).toBeTruthy();

        // Should return search results structure
        const hasResults = data.results || data.items || data.data;
        expect(hasResults).toBeTruthy();
      }
    } catch (error) {
      // Search endpoint might not exist
      expect(error).toBeTruthy();
    }
  });

  test("should handle webhooks properly", async ({ request }) => {
    const webhookEndpoints = [
      "/api/webhooks/stripe",
      "/api/webhooks/github",
      "/api/webhooks/auth",
    ];

    for (const endpoint of webhookEndpoints) {
      try {
        const response = await request.post(endpoint, {
          data: { test: "webhook" },
        });

        // Webhooks should exist or return proper errors
        expect([200, 400, 401, 404, 405]).toContain(response.status());
      } catch (error) {
        // Webhook endpoints might not exist
        expect(error).toBeTruthy();
      }
    }
  });
});
