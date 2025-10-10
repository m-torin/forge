/**
 * Tests for web middleware functionality
 */

import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, vi } from "vitest";

// Mock better-auth/cookies
const mockGetSessionCookie = vi.fn();
vi.mock("better-auth/cookies", () => ({
  getSessionCookie: mockGetSessionCookie,
}));

// Mock NextResponse
vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({
        headers: new Map([]),
        set: vi.fn(),
      })),
      json: vi.fn((data: any, init?: any) => ({
        data,
        status: init?.status || 200,
        headers: new Map([]),
      })),
      redirect: vi.fn((url: string) => ({
        url,
        status: 302,
        headers: new Map([]),
      })),
    },
  };
});

describe("web middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWebMiddleware", () => {
    test("should create middleware function", async () => {
      const webModule = await import("../../src/server/middleware/web");

      const middleware = webModule.createWebMiddleware();

      expect(typeof middleware).toBe("function");
    });

    test("should allow home page as public route", async () => {
      const webModule = await import("../../src/server/middleware/web");

      const middleware = webModule.createWebMiddleware();
      const request = new NextRequest("https://example.com/", {
        method: "GET",
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test("should allow default public routes", async () => {
      const webModule = await import("../../src/server/middleware/web");

      const middleware = webModule.createWebMiddleware();

      const publicRoutes = [
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/_next",
        "/favicon.ico",
        "/.well-known",
      ];

      for (const route of publicRoutes) {
        const request = new NextRequest(`https://example.com${route}`, {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      }
    });

    test("should allow custom public paths", async () => {
      const webModule = await import("../../src/server/middleware/web");

      const middleware = webModule.createWebMiddleware({
        publicPaths: ["/custom-public"],
      });

      const request = new NextRequest("https://example.com/custom-public", {
        method: "GET",
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    describe("aPI routes handling", () => {
      test("should detect API routes correctly", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware({
          requireAuth: true,
        });

        const request = new NextRequest("https://example.com/api/users", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: "Unauthorized",
          }),
          { status: 401 },
        );
      });

      test("should allow auth API routes", async () => {
        const webModule = await import("../../src/server/middleware/web");

        const middleware = webModule.createWebMiddleware();
        const request = new NextRequest(
          "https://example.com/api/auth/session",
          {
            method: "GET",
          },
        );

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      });

      test("should handle API key authentication for API routes", async () => {
        const webModule = await import("../../src/server/middleware/web");

        const mockResponse = {
          headers: { set: vi.fn() },
        } as any;
        vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

        const middleware = webModule.createWebMiddleware();
        const request = new NextRequest("https://example.com/api/users", {
          method: "GET",
          headers: {
            "x-api-key": "test-key",
          },
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
        expect(mockResponse.headers.set).toHaveBeenCalledWith(
          "x-auth-method",
          "api-key",
        );
      });

      test("should handle Bearer token for API routes", async () => {
        const webModule = await import("../../src/server/middleware/web");

        const middleware = webModule.createWebMiddleware();
        const request = new NextRequest("https://example.com/api/users", {
          method: "GET",
          headers: {
            authorization: "Bearer test-token",
          },
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      });

      test("should handle custom API key headers", async () => {
        const webModule = await import("../../src/server/middleware/web");

        const middleware = webModule.createWebMiddleware({
          apiKeyHeaders: ["x-custom-key"],
        });

        const request = new NextRequest("https://example.com/api/users", {
          method: "GET",
          headers: {
            "x-custom-key": "custom-key-value",
          },
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      });

      test("should handle session authentication for API routes", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue({ sessionId: "test-session" });

        const mockResponse = {
          headers: { set: vi.fn() },
        } as any;
        vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

        const middleware = webModule.createWebMiddleware();
        const request = new NextRequest("https://example.com/api/users", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
        expect(mockResponse.headers.set).toHaveBeenCalledWith(
          "x-auth-method",
          "session",
        );
      });

      test("should allow unauthenticated API access when auth not required", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware({
          requireAuth: false,
        });

        const request = new NextRequest("https://example.com/api/users", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      });

      test("should include supported methods in API 401 response", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware({
          apiKeyHeaders: ["x-api-key", "x-custom"],
          requireAuth: true,
        });

        const request = new NextRequest("https://example.com/api/users", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            supportedMethods: {
              "API Key": ["x-api-key: your-api-key", "x-custom: your-api-key"],
              Session: "Include session cookie with request",
            },
          }),
          { status: 401 },
        );
      });
    });

    describe("protected routes handling", () => {
      test("should protect default protected routes", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware();

        const protectedRoutes = [
          "/account",
          "/dashboard",
          "/settings",
          "/admin",
        ];

        for (const route of protectedRoutes) {
          const request = new NextRequest(`https://example.com${route}`, {
            method: "GET",
          });

          await middleware(request);

          expect(NextResponse.redirect).toHaveBeenCalledWith(
            expect.objectContaining({
              href: expect.stringContaining(
                `/sign-in?callbackUrl=${encodeURIComponent(route)}`,
              ),
            }),
          );
        }
      });

      test("should protect custom protected paths", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware({
          protectedPaths: ["/private"],
        });

        const request = new NextRequest("https://example.com/private", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
          expect.objectContaining({
            href: expect.stringContaining("/sign-in?callbackUrl=%2Fprivate"),
          }),
        );
      });

      test("should allow access to protected routes with session", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue({ sessionId: "test-session" });

        const mockResponse = {
          headers: { set: vi.fn() },
        } as any;
        vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

        const middleware = webModule.createWebMiddleware();
        const request = new NextRequest("https://example.com/dashboard", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
        expect(mockResponse.headers.set).toHaveBeenCalledWith(
          "x-auth-method",
          "session",
        );
        expect(mockResponse.headers.set).toHaveBeenCalledWith(
          "x-protected-route",
          "true",
        );
      });

      test("should handle locale prefixes in protected routes", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware();

        // Test 2-letter locale
        const request1 = new NextRequest("https://example.com/en/dashboard", {
          method: "GET",
        });

        await middleware(request1);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
          expect.objectContaining({
            href: expect.stringContaining(
              "/sign-in?callbackUrl=%2Fen%2Fdashboard",
            ),
          }),
        );

        // Test 5-letter locale (en-US)
        const request2 = new NextRequest(
          "https://example.com/en-US/dashboard",
          {
            method: "GET",
          },
        );

        await middleware(request2);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
          expect.objectContaining({
            href: expect.stringContaining(
              "/sign-in?callbackUrl=%2Fen-US%2Fdashboard",
            ),
          }),
        );
      });

      test("should handle nested protected routes", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware();
        const request = new NextRequest(
          "https://example.com/admin/users/edit/123",
          {
            method: "GET",
          },
        );

        await middleware(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith();
      });

      test("should use custom redirect URL", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware({
          redirectTo: "/auth/login",
        });

        const request = new NextRequest("https://example.com/dashboard", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
          expect.objectContaining({
            href: expect.stringContaining(
              "/auth/login?callbackUrl=%2Fdashboard",
            ),
          }),
        );
      });

      test("should allow unprotected routes even without session", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware();
        const request = new NextRequest("https://example.com/about", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      });

      test("should skip protection when requireAuth is false", async () => {
        const webModule = await import("../../src/server/middleware/web");

        mockGetSessionCookie.mockReturnValue(null);

        const middleware = webModule.createWebMiddleware({
          requireAuth: false,
        });

        const request = new NextRequest("https://example.com/dashboard", {
          method: "GET",
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      });
    });

    describe("route detection", () => {
      test("should correctly identify API routes", async () => {
        const webModule = await import("../../src/server/middleware/web");

        const middleware = webModule.createWebMiddleware();

        // Should be API routes
        const apiRoutes = [
          "/api/users",
          "/api/v1/products",
          "/api/admin/settings",
        ];

        for (const route of apiRoutes) {
          mockGetSessionCookie.mockReturnValue(null);
          const request = new NextRequest(`https://example.com${route}`, {
            method: "GET",
          });

          await middleware(request);

          // Should get 401 for unauthorized API access
          expect(NextResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "Unauthorized" }),
            { status: 401 },
          );
        }
      });

      test("should not treat auth API routes as protected", async () => {
        const webModule = await import("../../src/server/middleware/web");

        const middleware = webModule.createWebMiddleware();

        const authRoutes = [
          "/api/auth/session",
          "/api/auth/signin",
          "/api/auth/callback",
        ];

        for (const route of authRoutes) {
          const request = new NextRequest(`https://example.com${route}`, {
            method: "GET",
          });

          await middleware(request);

          expect(NextResponse.next).toHaveBeenCalledWith();
        }
      });

      test("should handle route prefix matching correctly", async () => {
        const webModule = await import("../../src/server/middleware/web");

        const middleware = webModule.createWebMiddleware({
          publicPaths: ["/docs"],
        });

        const request = new NextRequest(
          "https://example.com/docs/getting-started",
          {
            method: "GET",
          },
        );

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      });
    });
  });

  describe("default middleware", () => {
    test("should export default webMiddleware", async () => {
      const webModule = await import("../../src/server/middleware/web");

      expect(webModule.webMiddleware).toBeDefined();
      expect(typeof webModule.webMiddleware).toBe("function");
    });

    test("should work with default settings", async () => {
      const webModule = await import("../../src/server/middleware/web");

      const request = new NextRequest("https://example.com/sign-in", {
        method: "GET",
      });

      const result = await webModule.webMiddleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });
  });

  describe("edge cases", () => {
    test("should handle empty header values for API keys", async () => {
      const webModule = await import("../../src/server/middleware/web");

      mockGetSessionCookie.mockReturnValue(null);

      const middleware = webModule.createWebMiddleware();
      const request = new NextRequest("https://example.com/api/users", {
        method: "GET",
        headers: {
          "x-api-key": "",
        },
      });

      await middleware(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Unauthorized" }),
        { status: 401 },
      );
    });

    test("should handle malformed locale patterns", async () => {
      const webModule = await import("../../src/server/middleware/web");

      mockGetSessionCookie.mockReturnValue({ sessionId: "test" });

      const middleware = webModule.createWebMiddleware();

      // Invalid locale patterns shouldn't be treated as locales
      const request = new NextRequest(
        "https://example.com/admin123/dashboard",
        {
          method: "GET",
        },
      );

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test("should handle very long URLs", async () => {
      const webModule = await import("../../src/server/middleware/web");

      mockGetSessionCookie.mockReturnValue(null);

      const middleware = webModule.createWebMiddleware();
      const longPath = "/dashboard/" + "very-long-segment/".repeat(50);
      const request = new NextRequest(`https://example.com${longPath}`, {
        method: "GET",
      });

      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining(
            `callbackUrl=${encodeURIComponent(longPath)}`,
          ),
        }),
      );
    });

    test("should handle URLs with query parameters", async () => {
      const webModule = await import("../../src/server/middleware/web");

      mockGetSessionCookie.mockReturnValue(null);

      const middleware = webModule.createWebMiddleware();
      const request = new NextRequest(
        "https://example.com/dashboard?tab=settings&filter=active",
        {
          method: "GET",
        },
      );

      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining(
            "callbackUrl=%2Fdashboard%3Ftab%3Dsettings%26filter%3Dactive",
          ),
        }),
      );
    });

    test("should handle missing headers gracefully", async () => {
      const webModule = await import("../../src/server/middleware/web");

      const middleware = webModule.createWebMiddleware();
      const request = new NextRequest("https://example.com/about", {
        method: "GET",
      });

      // Simulate request without headers
      Object.defineProperty(request, "headers", {
        value: {
          get: vi.fn(() => null),
        },
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });
  });
});
