// Import after mocking
import { createMiddleware, defaults, withVercelToolbar } from "@nosecone/next";
import { describe, expect, it, vi } from "vitest";

import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from "../middleware";

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(),
  },
}));

// Mock @nosecone/next
vi.mock("@nosecone/next", () => ({
  createMiddleware: vi.fn(() => vi.fn()),
  defaults: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
    xContentTypeOptions: true,
    xFrameOptions: { action: "sameorigin" },
  },
  withVercelToolbar: vi.fn((options) => ({
    ...options,
    contentSecurityPolicy: {
      directives: {
        connectSrc: ["'self'", "vercel.com"],
      },
    },
  })),
}));

describe.skip("Security Middleware", () => {
  describe("noseconeOptions", () => {
    it("extends defaults with contentSecurityPolicy disabled", () => {
      // Check that noseconeOptions extends defaults
      expect(noseconeOptions).toEqual({
        ...defaults,
        contentSecurityPolicy: false,
      });
    });
  });

  describe("noseconeOptionsWithToolbar", () => {
    it("calls withVercelToolbar with noseconeOptions", () => {
      // Check that noseconeOptionsWithToolbar calls withVercelToolbar
      expect(withVercelToolbar).toHaveBeenCalledWith(noseconeOptions);

      // Check that noseconeOptionsWithToolbar returns the result of withVercelToolbar
      expect(noseconeOptionsWithToolbar).toEqual({
        ...noseconeOptions,
        contentSecurityPolicy: {
          directives: {
            connectSrc: ["'self'", "vercel.com"],
          },
        },
      });
    });
  });

  describe("noseconeMiddleware", () => {
    it("exports createMiddleware from @nosecone/next", () => {
      // Check that noseconeMiddleware is the same as createMiddleware
      expect(noseconeMiddleware).toBe(createMiddleware);
    });

    it("creates middleware that can be called with options", () => {
      // Create middleware with options
      const middleware = noseconeMiddleware({
        xFrameOptions: { action: "deny" },
      });

      // Check that createMiddleware was called with the options
      expect(createMiddleware).toHaveBeenCalledWith({
        xFrameOptions: { action: "deny" },
      });

      // Verify middleware is a function
      expect(typeof middleware).toBe("function");
    });
  });
});
