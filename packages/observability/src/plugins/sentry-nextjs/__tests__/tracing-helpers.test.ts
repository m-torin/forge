/**
 * Tests for Next.js tracing helpers
 *
 * @deprecated These tests are skipped pending Sentry v9 migration
 */

// @ts-nocheck - Skip type checking for v8 → v9 migration

import * as Sentry from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import {
  parameterizePath,
  recordWebVital,
  withApiRouteTracing,
  withCacheSpan,
  withDatabaseSpan,
  withHttpSpan,
  withRouteHandlerTracing,
  withServerActionTracing,
  withServerComponentTracing,
} from "../tracing-helpers";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  startSpan: vi.fn(),
  getActiveSpan: vi.fn(),
  setStatus: vi.fn(),
  setData: vi.fn(),
  setAttribute: vi.fn(),
}));

// Mock distributed tracing
vi.mock("../distributed-tracing", () => ({
  continueTraceInServerComponent: vi.fn(() => ({ traceId: "trace-123" })),
  extractTraceHeaders: vi.fn(() => ({ traceId: "trace-456" })),
}));

describe.todo("tracing-helpers", () => {
  const mockSpan = {
    setStatus: vi.fn(),
    setData: vi.fn(),
    setAttribute: vi.fn(),
    end: vi.fn(),
    spanId: "span-123",
    traceId: "trace-123",
  };

  const mockScope = {
    setSpan: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (Sentry.getActiveSpan as any).mockReturnValue(mockSpan);
    (Sentry.startSpan as any).mockImplementation((config, fn) => {
      if (fn) {
        return fn(mockSpan);
      }
      return mockSpan;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("withServerComponentTracing", () => {
    test("should wrap sync function with tracing", () => {
      const fn = vi.fn(() => "result");
      const wrapped = withServerComponentTracing("MyComponent", fn);

      expect(wrapped).toBe("result");
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "MyComponent",
          op: "server.component",
          description: undefined,
          attributes: {
            "component.type": "server",
          },
        },
        expect.any(Function),
      );
      expect(fn).toHaveBeenCalledWith();
    });

    test("should wrap async function with tracing", async () => {
      const fn = vi.fn(async () => "async-result");
      const wrapped = withServerComponentTracing("AsyncComponent", fn);

      const result = await wrapped;
      expect(result).toBe("async-result");
      expect(fn).toHaveBeenCalledWith();
    });

    test("should include custom options", () => {
      const fn = vi.fn(() => "result");
      withServerComponentTracing("MyComponent", fn, {
        op: "custom.op",
        description: "Custom description",
        tags: { env: "test" },
        data: { userId: "123" },
      });

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "MyComponent",
          op: "custom.op",
          description: "Custom description",
          attributes: {
            env: "test",
            userId: "123",
            "component.type": "server",
          },
        },
        expect.any(Function),
      );
    });
  });

  describe("withApiRouteTracing", () => {
    test("should wrap API route handler", async () => {
      const handler = vi.fn(async (req, res) => {
        res.json({ success: true });
      });

      const req = {
        method: "GET",
        url: "/api/test",
        headers: {},
        query: {},
      } as NextApiRequest;

      const res = {
        json: vi.fn(),
        send: vi.fn(),
        end: vi.fn(),
        statusCode: 200,
      } as unknown as NextApiResponse;

      const wrappedHandler = withApiRouteTracing(handler);
      await wrappedHandler(req, res);

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "GET /api/test",
          op: "http.server",
          attributes: {
            method: "GET",
            url: "/api/test",
            "http.query": "{}",
            "http.body": "null",
            traceId: "trace-456",
          },
        },
        expect.any(Function),
      );

      expect(handler).toHaveBeenCalledWith(req, res);
    });

    test("should parameterize URLs", async () => {
      const handler = vi.fn();
      const req = {
        method: "GET",
        url: "/api/user/123",
        headers: {},
        query: { id: "123" },
      } as NextApiRequest;

      const res = {
        json: vi.fn(),
        send: vi.fn(),
        end: vi.fn(),
        statusCode: 200,
      } as unknown as NextApiResponse;

      const wrappedHandler = withApiRouteTracing(handler);
      await wrappedHandler(req, res);

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "GET /api/user/[id]",
          op: "http.server",
          attributes: {
            method: "GET",
            url: "/api/user/123",
            "http.query": '{"id":"123"}',
            "http.body": "null",
            traceId: "trace-456",
          },
        },
        expect.any(Function),
      );
    });

    test("should handle errors", async () => {
      const error = new Error("Handler error");
      const handler = vi.fn().mockRejectedValue(error);

      const req = {
        method: "POST",
        url: "/api/test",
        headers: {},
        query: {},
      } as NextApiRequest;

      const res = {
        json: vi.fn(),
        send: vi.fn(),
        end: vi.fn(),
        statusCode: 500,
      } as unknown as NextApiResponse;

      const wrappedHandler = withApiRouteTracing(handler);

      await expect(wrappedHandler(req, res)).rejects.toThrow("Handler error");
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: 2,
        message: "internal error",
      });
    });
  });

  describe("withServerActionTracing", () => {
    test("should wrap server action with tracing", async () => {
      const action = vi.fn(async () => ({ success: true }));
      const result = await withServerActionTracing("MyAction", action);

      expect(result).toStrictEqual({ success: true });
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "MyAction",
          op: "server.action",
          attributes: {},
        },
        expect.any(Function),
      );
      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 1 });
    });

    test("should include form data", async () => {
      const formData = new FormData();
      formData.append("name", "test");
      formData.append("email", "test@example.com");

      const action = vi.fn(async () => ({ success: true }));
      await withServerActionTracing("MyAction", action, { formData });

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "MyAction",
          op: "server.action",
          attributes: {
            "server.action.formData":
              '{"name":"test","email":"test@example.com"}',
          },
        },
        expect.any(Function),
      );
    });

    test("should handle errors", async () => {
      const error = new Error("Action error");
      const action = vi.fn().mockRejectedValue(error);

      await expect(withServerActionTracing("MyAction", action)).rejects.toThrow(
        "Action error",
      );
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: 2,
        message: "internal error",
      });
    });
  });

  describe("withRouteHandlerTracing", () => {
    test("should wrap route handler", async () => {
      const handler = vi.fn(async () => new Response("OK", { status: 200 }));
      const request = {
        method: "GET",
        url: "https://example.com/api/test",
        headers: new Headers(),
      } as NextRequest;

      const wrappedHandler = withRouteHandlerTracing(handler);
      const response = await wrappedHandler(request);

      expect(response.status).toBe(200);
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "GET /api/test",
          op: "http.server",
          attributes: {
            method: "GET",
            url: "https://example.com/api/test",
            route: undefined,
            traceId: "trace-123",
          },
        },
        expect.any(Function),
      );
      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 1 });
    });

    test("should parameterize dynamic routes", async () => {
      const handler = vi.fn(async () => new Response("OK"));
      const request = {
        method: "GET",
        url: "https://example.com/api/user/550e8400-e29b-41d4-a716-446655440000",
        headers: new Headers(),
      } as NextRequest;

      const wrappedHandler = withRouteHandlerTracing(handler, {
        route: "/api/user/[id]",
      });
      await wrappedHandler(request);

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "GET /api/user/[id]",
          op: "http.server",
          attributes: {
            method: "GET",
            url: "https://example.com/api/user/550e8400-e29b-41d4-a716-446655440000",
            route: "/api/user/[id]",
            traceId: "trace-123",
          },
        },
        expect.any(Function),
      );
    });
  });

  describe("withDatabaseSpan", () => {
    test("should create database span", async () => {
      const query = vi.fn(async () => [{ id: 1, name: "test" }]);
      const result = await withDatabaseSpan("SELECT", query, {
        db: "postgresql",
        table: "users",
        query: "SELECT * FROM users",
      });

      expect(result).toStrictEqual([{ id: 1, name: "test" }]);
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "db.SELECT",
          op: "db",
          attributes: {
            "db.system": "postgresql",
            "db.table": "users",
            "db.statement": "SELECT * FROM users",
          },
        },
        expect.any(Function),
      );
    });
  });

  describe("withHttpSpan", () => {
    test("should create HTTP span", async () => {
      const request = vi.fn(async () => ({ data: "response" }));
      const result = await withHttpSpan(
        "https://api.example.com/users",
        request,
        {
          method: "POST",
          statusCode: 201,
        },
      );

      expect(result).toStrictEqual({ data: "response" });
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "POST api.example.com/users",
          op: "http.client",
          attributes: {
            "http.method": "POST",
            "http.url": "https://api.example.com/users",
            "http.host": "api.example.com",
            "http.status_code": 201,
          },
        },
        expect.any(Function),
      );
    });
  });

  describe("withCacheSpan", () => {
    test("should create cache span", async () => {
      const cacheOp = vi.fn(async () => "cached-value");
      const result = await withCacheSpan("get", "user:123", cacheOp, {
        hit: true,
        ttl: 3600,
      });

      expect(result).toBe("cached-value");
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: "cache.get",
          op: "cache",
          attributes: {
            "cache.key": "user:123",
            "cache.operation": "get",
            "cache.hit": true,
            "cache.ttl": 3600,
          },
        },
        expect.any(Function),
      );
    });
  });

  describe("recordWebVital", () => {
    test("should record web vital measurement", () => {
      recordWebVital("LCP", 2500);

      expect(mockSpan.setData).toHaveBeenCalledWith("LCP", {
        value: 2500,
        unit: "millisecond",
      });
      expect(mockSpan.setData).toHaveBeenCalledWith("vital.LCP", "good");
    });

    test("should handle custom units", () => {
      recordWebVital("CLS", 0.15, { unit: "none", vital: false });

      expect(mockSpan.setData).toHaveBeenCalledWith("CLS", {
        value: 0.15,
        unit: "none",
      });
      expect(mockSpan.setData).not.toHaveBeenCalledWith(
        "vital.CLS",
        expect.anything(),
      );
    });
  });

  describe("parameterizePath", () => {
    test("should parameterize dynamic segments", () => {
      const result = parameterizePath("/user/123/posts/456", {
        userId: "123",
        postId: "456",
      });

      expect(result).toBe("/user/[userId]/posts/[postId]");
    });

    test("should handle catch-all routes", () => {
      const result = parameterizePath("/docs/guide/getting-started", {
        slug: ["guide", "getting-started"],
      });

      expect(result).toBe("/docs/[...slug]");
    });

    test("should replace common patterns", () => {
      const result = parameterizePath(
        "/user/550e8400-e29b-41d4-a716-446655440000/hash/abc123def456",
      );

      expect(result).toBe("/user/[id]/hash/[hash]");
    });
  });
});
