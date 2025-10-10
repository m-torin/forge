/**
 * Logtail (Better Stack) Provider Mock Factory
 *
 * Centralized mock factory for Logtail/Better Stack observability testing.
 * Supports @logtail/js and @logtail/next packages.
 */

import type { Mock } from "vitest";
import { vi } from "vitest";

/**
 * Logtail mock client interface
 */
export interface MockLogtailClient {
  // Core logging methods
  trace: Mock;
  debug: Mock;
  info: Mock;
  warn: Mock;
  error: Mock;

  // Lifecycle management
  flush: Mock;

  // Context management
  with: Mock;
  withContext: Mock;

  // Error handling
  captureException?: Mock;
  captureMessage?: Mock;
}

/**
 * Logtail mock scenarios for different test cases
 */
export interface LogtailMockScenarios {
  success: () => void;
  flushError: () => void;
  loggingError: () => void;
  reset: () => void;
}

/**
 * Configuration for Logtail mock factory
 */
export interface LogtailMockConfig {
  package?: "@logtail/js" | "@logtail/next";
  includeContextMethods?: boolean;
  mockReturnValues?: {
    flush?: boolean;
  };
}

/**
 * Create a comprehensive Logtail mock client
 */
export function createLogtailMock(config: LogtailMockConfig = {}): {
  mockClient: MockLogtailClient;
  MockLogtailClass: Mock;
  scenarios: LogtailMockScenarios;
  resetMocks: () => void;
} {
  const {
    package: logtailPackage = "@logtail/js",
    includeContextMethods = true,
    mockReturnValues = {},
  } = config;

  // Create mock client with all methods
  const mockClient: MockLogtailClient = {
    // Core logging methods
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),

    // Lifecycle management
    flush: vi.fn().mockResolvedValue(mockReturnValues.flush ?? true),

    // Context management
    with: vi.fn().mockReturnThis(),
    withContext: vi.fn().mockReturnThis(),
  };

  // Add package-specific methods
  if (logtailPackage === "@logtail/next") {
    vi.spyOn(mockClient, "captureException").mockImplementation(() => {});
    vi.spyOn(mockClient, "captureMessage").mockImplementation(() => {});
  }

  // Mock Logtail class constructor
  const MockLogtailClass = vi.fn().mockImplementation(() => mockClient);

  // Mock scenarios for different test cases
  const scenarios: LogtailMockScenarios = {
    success: () => {
      mockClient.trace.mockReturnValue(undefined);
      mockClient.debug.mockReturnValue(undefined);
      mockClient.info.mockReturnValue(undefined);
      mockClient.warn.mockReturnValue(undefined);
      mockClient.error.mockReturnValue(undefined);
      mockClient.flush.mockResolvedValue(true);
      mockClient.with.mockReturnValue(mockClient);
      mockClient.withContext.mockReturnValue(mockClient);
    },

    flushError: () => {
      mockClient.flush.mockRejectedValue(new Error("Logtail flush failed"));
    },

    loggingError: () => {
      mockClient.trace.mockImplementation(() => {
        throw new Error("Logtail trace failed");
      });
      mockClient.debug.mockImplementation(() => {
        throw new Error("Logtail debug failed");
      });
      mockClient.info.mockImplementation(() => {
        throw new Error("Logtail info failed");
      });
      mockClient.warn.mockImplementation(() => {
        throw new Error("Logtail warn failed");
      });
      mockClient.error.mockImplementation(() => {
        throw new Error("Logtail error failed");
      });
    },

    reset: () => {
      Object.values(mockClient).forEach((mock) => {
        if (typeof mock?.mockReset === "function") {
          mock.mockReset();
        }
      });
      MockLogtailClass.mockReset();
      // Restore default implementations
      scenarios.success();
    },
  };

  const resetMocks = () => {
    scenarios.reset();
  };

  // Set up default successful scenario
  scenarios.success();

  return {
    mockClient,
    MockLogtailClass,
    scenarios,
    resetMocks,
  };
}

/**
 * Create a Logtail mock for dynamic imports
 */
export function createLogtailDynamicImportMock(
  config: LogtailMockConfig = {},
): Mock {
  const { MockLogtailClass } = createLogtailMock(config);

  return vi.fn().mockImplementation((moduleName: string) => {
    if (moduleName.includes("@logtail/")) {
      return Promise.resolve(MockLogtailClass);
    }
    return Promise.reject(new Error(`Unknown module: ${moduleName}`));
  });
}

/**
 * Setup Logtail mocks for vitest with automatic module mocking
 */
// Create a default mock instance for static mocking
const defaultLogTailMock = createLogtailMock();

// Mock both common Logtail packages to handle dynamic imports at module level
vi.mock("@logtail/js", () => ({
  default: defaultLogTailMock.MockLogtailClass,
  Logtail: defaultLogTailMock.MockLogtailClass,
}));

vi.mock("@logtail/next", () => ({
  default: defaultLogTailMock.MockLogtailClass,
  Logtail: defaultLogTailMock.MockLogtailClass,
}));

export function setupLogtailMocks(config: LogtailMockConfig = {}) {
  const { mockClient, MockLogtailClass, scenarios, resetMocks } =
    createLogtailMock(config);

  // Mock common environment variables
  vi.mock("../../src/env", () => ({
    safeEnv: () => ({
      LOGTAIL_SOURCE_TOKEN: "test-token",
      BETTERSTACK_SOURCE_TOKEN: "test-token",
      BETTERSTACK_ENABLED: true,
      BETTER_STACK_SOURCE_TOKEN: "test-token",
      BETTER_STACK_INGESTING_URL: "https://in.logs.betterstack.com",
      BETTER_STACK_LOG_LEVEL: "info",
      NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: "test-token",
      NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: "https://in.logs.betterstack.com",
      NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL: "info",
      NEXT_PUBLIC_LOGTAIL_TOKEN: "test-token",
      NEXT_PUBLIC_BETTERSTACK_TOKEN: "test-token",
    }),
  }));

  return {
    mockClient,
    MockLogtailClass,
    scenarios,
    resetMocks,
  };
}

/**
 * Standard Logtail test data generators
 */
export const logtailTestData = {
  error: (message = "Test error") => new Error(message),

  context: (overrides = {}) => ({
    extra: { key: "value" },
    tags: { component: "test" },
    user: { id: "123" },
    ...overrides,
  }),

  user: (overrides = {}) => ({
    id: "123",
    email: "test@example.com",
    name: "Test User",
    ...overrides,
  }),

  breadcrumb: (overrides = {}) => ({
    message: "Test breadcrumb",
    level: "info" as const,
    timestamp: Date.now() / 1000,
    ...overrides,
  }),

  initConfig: (overrides = {}) => ({
    sourceToken: "test-token",
    endpoint: "https://in.logs.betterstack.com",
    ...overrides,
  }),

  logEntry: (level = "info", message = "Test message", data = {}) => ({
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  }),
};
