/**
 * Tests for Sentry plugin tracing functionality
 */

import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import type { SentryPluginConfig } from "../plugin";
import { SentryPlugin } from "../plugin";

// Mock environment
vi.mock("../env", () => ({
  safeEnv: vi.fn(() => ({
    SENTRY_DSN: "https://key@sentry.io/project",
    SENTRY_ENVIRONMENT: "test",
    SENTRY_TRACES_SAMPLE_RATE: 1.0,
  })),
}));

describe.todo("sentryPlugin - Tracing", () => {
  let plugin: SentryPlugin;
  let mockSentryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Sentry client
    mockSentryClient = {
      init: vi.fn(),
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      addBreadcrumb: vi.fn(),
      withScope: vi.fn(),
      getCurrentScope: vi.fn(),
      getActiveTransaction: vi.fn(),
      startTransaction: vi.fn(),
      startSpan: vi.fn(),
      configureScope: vi.fn(),
      getCurrentHub: vi.fn(),
      flush: vi.fn(),
      close: vi.fn(),
      browserTracingIntegration: vi.fn(() => ({ name: "BrowserTracing" })),
      replayIntegration: vi.fn(() => ({ name: "Replay" })),
      profilesIntegration: vi.fn(() => ({ name: "Profiling" })),
    };

    // Mock dynamic import
    vi.doMock("@sentry/nextjs", () => mockSentryClient);

    const config: SentryPluginConfig = {
      sentryPackage: "@sentry/nextjs",
      dsn: "https://key@sentry.io/project",
    };

    plugin = new SentryPlugin(config);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("transaction Management", () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    test("should start transaction", () => {
      const mockTransaction = {
        setMeasurement: vi.fn(),
        setTag: vi.fn(),
        finish: vi.fn(),
        startChild: vi.fn(),
      };

      mockSentryClient.startTransaction.mockReturnValue(mockTransaction);

      const context = {
        name: "test-transaction",
        op: "http.server",
        data: { method: "GET" },
      };

      const result = plugin.startTransaction(context);

      expect(result).toBe(mockTransaction);
      expect(mockSentryClient.startTransaction).toHaveBeenCalledWith(
        context,
        undefined,
      );
    });

    test("should start transaction with custom sampling context", () => {
      const mockTransaction = { finish: vi.fn() };
      mockSentryClient.startTransaction.mockReturnValue(mockTransaction);

      const context = { name: "test", op: "custom" };
      const samplingContext = { request: { method: "POST" } };

      plugin.startTransaction(context, samplingContext);

      expect(mockSentryClient.startTransaction).toHaveBeenCalledWith(
        context,
        samplingContext,
      );
    });

    test("should handle missing startTransaction method", () => {
      mockSentryClient.startTransaction = undefined;
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = plugin.startTransaction({ name: "test" });

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        "startTransaction not available in this Sentry version",
      );
    });

    test("should get active transaction", () => {
      const mockTransaction = { name: "active-transaction" };
      mockSentryClient.getActiveTransaction.mockReturnValue(mockTransaction);

      const result = plugin.getActiveTransaction();

      expect(result).toBe(mockTransaction);
      expect(mockSentryClient.getActiveTransaction).toHaveBeenCalledWith();
    });

    test("should get active transaction from scope fallback", () => {
      const mockTransaction = { name: "scope-transaction" };
      const mockScope = { getTransaction: vi.fn(() => mockTransaction) };

      mockSentryClient.getActiveTransaction = undefined;
      mockSentryClient.getCurrentScope.mockReturnValue(mockScope);

      const result = plugin.getActiveTransaction();

      expect(result).toBe(mockTransaction);
      expect(mockScope.getTransaction).toHaveBeenCalledWith();
    });
  });

  describe("span Management", () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    test("should start span", () => {
      const mockSpan = { finish: vi.fn() };
      mockSentryClient.startSpan.mockReturnValue(mockSpan);

      const context = {
        name: "test-span",
        op: "db.query",
        data: { table: "users" },
      };

      const result = plugin.startSpan(context);

      expect(result).toBe(mockSpan);
      expect(mockSentryClient.startSpan).toHaveBeenCalledWith(context);
    });

    test("should start span from active transaction fallback", () => {
      const mockSpan = { finish: vi.fn() };
      const mockTransaction = { startChild: vi.fn(() => mockSpan) };

      mockSentryClient.startSpan = undefined;
      mockSentryClient.getActiveTransaction.mockReturnValue(mockTransaction);

      const context = { name: "child-span" };
      const result = plugin.startSpan(context);

      expect(result).toBe(mockSpan);
      expect(mockTransaction.startChild).toHaveBeenCalledWith(context);
    });

    test("should return undefined when no span creation method available", () => {
      mockSentryClient.startSpan = undefined;
      mockSentryClient.getActiveTransaction.mockReturnValue(null);

      const result = plugin.startSpan({ name: "test" });

      expect(result).toBeUndefined();
    });
  });

  describe("scope Management", () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    test("should configure scope", () => {
      const callback = vi.fn();

      plugin.configureScope(callback);

      expect(mockSentryClient.configureScope).toHaveBeenCalledWith(callback);
    });

    test("should use withScope fallback", () => {
      const callback = vi.fn();
      mockSentryClient.configureScope = undefined;

      plugin.configureScope(callback);

      expect(mockSentryClient.withScope).toHaveBeenCalledWith(callback);
    });

    test("should get current hub", () => {
      const mockHub = { getScope: vi.fn() };
      mockSentryClient.getCurrentHub.mockReturnValue(mockHub);

      const result = plugin.getCurrentHub();

      expect(result).toBe(mockHub);
      expect(mockSentryClient.getCurrentHub).toHaveBeenCalledWith();
    });
  });

  describe("performance Measurements", () => {
    let mockTransaction: any;

    beforeEach(async () => {
      await plugin.initialize();
      mockTransaction = {
        setMeasurement: vi.fn(),
        setTag: vi.fn(),
        setData: vi.fn(),
        traceId: "trace-123",
        spanId: "span-456",
      };
      mockSentryClient.getActiveTransaction.mockReturnValue(mockTransaction);
    });

    test("should set measurement on active transaction", () => {
      plugin.setMeasurement("response_time", 150, "millisecond");

      expect(mockTransaction.setMeasurement).toHaveBeenCalledWith(
        "response_time",
        150,
        "millisecond",
      );
    });

    test("should handle no active transaction", () => {
      mockSentryClient.getActiveTransaction.mockReturnValue(null);

      plugin.setMeasurement("response_time", 150);

      expect(mockTransaction.setMeasurement).not.toHaveBeenCalled();
    });

    test("should record web vital", () => {
      plugin.recordWebVital("LCP", 2500, {
        unit: "millisecond",
        rating: "good",
      });

      expect(mockTransaction.setMeasurement).toHaveBeenCalledWith(
        "lcp",
        2500,
        "millisecond",
      );
      expect(mockTransaction.setTag).toHaveBeenCalledWith(
        "webvital.lcp.rating",
        "good",
      );
      expect(mockSentryClient.captureMessage).toHaveBeenCalledWith(
        "Web Vital: LCP",
        {
          level: "info",
          tags: {
            "webvital.name": "LCP",
            "webvital.value": 2500,
            "webvital.unit": "millisecond",
            "webvital.rating": "good",
          },
          contexts: {
            trace: {
              trace_id: "trace-123",
              span_id: "span-456",
            },
          },
        },
      );
    });

    test("should add performance entries", () => {
      const entries: PerformanceEntry[] = [
        {
          name: "navigation",
          entryType: "navigation",
          startTime: 0,
          duration: 1500,
        } as PerformanceNavigationTiming,
        {
          name: "https://example.com/script.js",
          entryType: "resource",
          startTime: 100,
          duration: 200,
        } as PerformanceResourceTiming,
      ];

      plugin.addPerformanceEntries(entries);

      expect(mockSentryClient.addBreadcrumb).toHaveBeenCalledTimes(2);
      expect(mockSentryClient.addBreadcrumb).toHaveBeenCalledWith({
        category: "performance",
        type: "navigation",
        data: {
          name: "navigation",
          duration: 1500,
          startTime: 0,
        },
      });
    });
  });

  describe("performance API Integration", () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    test("should create performance mark", () => {
      const mockPerformance = {
        mark: vi.fn(),
      };
      Object.defineProperty(global, "performance", {
        value: mockPerformance,
        configurable: true,
      });

      plugin.mark("test-mark", { detail: { step: 1 } });

      expect(mockPerformance.mark).toHaveBeenCalledWith("test-mark", {
        detail: { step: 1 },
      });
      expect(mockSentryClient.addBreadcrumb).toHaveBeenCalledWith({
        category: "performance.mark",
        message: "test-mark",
        data: { step: 1 },
        timestamp: expect.any(Number),
      });
    });

    test("should create performance measure", () => {
      const mockMeasure = {
        name: "test-measure",
        duration: 150,
        startTime: 1000,
      };

      const mockPerformance = {
        measure: vi.fn(),
        getEntriesByName: vi.fn(() => [mockMeasure]),
      };

      Object.defineProperty(global, "performance", {
        value: mockPerformance,
        configurable: true,
      });

      const mockTransaction = {
        setMeasurement: vi.fn(),
      };
      mockSentryClient.getActiveTransaction.mockReturnValue(mockTransaction);

      plugin.measure("test-measure", "start-mark", "end-mark");

      expect(mockPerformance.measure).toHaveBeenCalledWith(
        "test-measure",
        "start-mark",
        "end-mark",
      );
      expect(mockTransaction.setMeasurement).toHaveBeenCalledWith(
        "test-measure",
        150,
        "millisecond",
      );
      expect(mockSentryClient.addBreadcrumb).toHaveBeenCalledWith({
        category: "performance.measure",
        message: "test-measure",
        data: {
          duration: 150,
          startTime: 1000,
        },
        timestamp: 1,
      });
    });

    test("should handle performance measure with options", () => {
      const mockMeasure = {
        name: "test-measure",
        duration: 100,
        startTime: 2000,
      };

      const mockPerformance = {
        measure: vi.fn(),
        getEntriesByName: vi.fn(() => [mockMeasure]),
      };

      Object.defineProperty(global, "performance", {
        value: mockPerformance,
        configurable: true,
      });

      const options = { start: 1000, end: 1100 };
      plugin.measure("test-measure", options);

      expect(mockPerformance.measure).toHaveBeenCalledWith(
        "test-measure",
        options,
      );
    });
  });

  describe("plugin State Management", () => {
    test("should not perform tracing operations when disabled", () => {
      plugin.enabled = false;

      const result = plugin.startTransaction({ name: "test" });
      expect(result).toBeUndefined();

      const span = plugin.startSpan({ name: "test" });
      expect(span).toBeUndefined();

      plugin.setMeasurement("test", 100);
      plugin.recordWebVital("LCP", 2500);
      plugin.mark("test-mark");
      plugin.measure("test-measure");

      expect(mockSentryClient.startTransaction).not.toHaveBeenCalled();
      expect(mockSentryClient.startSpan).not.toHaveBeenCalled();
    });

    test("should not perform operations when client is not available", async () => {
      plugin = new SentryPlugin({ dsn: "invalid-dsn" });
      // Don't initialize to keep client undefined

      const result = plugin.startTransaction({ name: "test" });
      expect(result).toBeUndefined();
    });
  });

  describe("flush and Cleanup", () => {
    beforeEach(async () => {
      await plugin.initialize();
    });

    test("should flush client", async () => {
      mockSentryClient.flush.mockResolvedValue(true);

      const result = await plugin.flush(5000);

      expect(result).toBeTruthy();
      expect(mockSentryClient.flush).toHaveBeenCalledWith(5000);
    });

    test("should handle flush errors", async () => {
      mockSentryClient.flush.mockRejectedValue(new Error("Flush failed"));

      const result = await plugin.flush();

      expect(result).toBeFalsy();
    });

    test("should return true when flush is not available", async () => {
      mockSentryClient.flush = undefined;

      const result = await plugin.flush();

      expect(result).toBeTruthy();
    });
  });
});
