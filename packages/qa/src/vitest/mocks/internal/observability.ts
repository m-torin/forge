import { vi } from "vitest";

/**
 * Centralized @repo/observability mocks
 * Composites existing Sentry, Logtail, and Logtape mocks for unified usage
 */

// Base observability mock interface
const createObservabilityMock = () => ({
  track: vi.fn(),
  capture: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
  addBreadcrumb: vi.fn(),
  close: vi.fn().mockResolvedValue(true),
  withScope: vi.fn((callback) =>
    callback({ setTag: vi.fn(), setUser: vi.fn() }),
  ),
  identify: vi.fn(),
  reset: vi.fn(),
  group: vi.fn(),
  alias: vi.fn(),
  page: vi.fn(),
  startTransaction: vi.fn(() => ({
    finish: vi.fn(),
    setStatus: vi.fn(),
    setData: vi.fn(),
    setTag: vi.fn(),
  })),
  getCurrentHub: vi.fn(() => ({
    getClient: vi.fn(),
    getScope: vi.fn(),
  })),
  configureScope: vi.fn(),
  // LogTape specific methods
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
  // Logtail specific methods
  flush: vi.fn().mockResolvedValue(undefined),
  // Performance monitoring
  measure: vi.fn(),
  mark: vi.fn(),
});

/**
 * Setup observability mocks for different entry points
 */
export function setupObservabilityMocks(
  options: {
    entryPoints?: (
      | "server"
      | "server/next"
      | "server/edge"
      | "client"
      | "client/next"
    )[];
    mockImplementation?: Partial<ReturnType<typeof createObservabilityMock>>;
  } = {},
) {
  const {
    entryPoints = [
      "server",
      "server/next",
      "server/edge",
      "client",
      "client/next",
    ],
    mockImplementation = {},
  } = options;

  const baseMock = { ...createObservabilityMock(), ...mockImplementation };

  // Mock all common entry points
  if (entryPoints.includes("server")) {
    vi.mock("@repo/observability/server", () => baseMock);
  }

  if (entryPoints.includes("server/next")) {
    vi.mock("@repo/observability/server/next", () => baseMock);
  }

  if (entryPoints.includes("server/edge")) {
    vi.mock("@repo/observability/server/edge", () => baseMock);
  }

  if (entryPoints.includes("client")) {
    vi.mock("@repo/observability/client", () => baseMock);
  }

  if (entryPoints.includes("client/next")) {
    vi.mock("@repo/observability/client/next", () => baseMock);
  }

  // Mock the base package
  vi.mock("@repo/observability", () => baseMock);

  return baseMock;
}

/**
 * Create scenarios for different observability states
 */
export const observabilityScenarios = {
  /**
   * Normal functioning observability
   */
  working: (baseMock = createObservabilityMock()) => ({
    ...baseMock,
    track: vi.fn().mockResolvedValue(true),
    capture: vi.fn().mockResolvedValue("event-id"),
    captureException: vi.fn().mockResolvedValue("error-id"),
    flush: vi.fn().mockResolvedValue(true),
  }),

  /**
   * Observability service failing
   */
  failing: (baseMock = createObservabilityMock()) => ({
    ...baseMock,
    track: vi.fn().mockRejectedValue(new Error("Observability service down")),
    capture: vi.fn().mockRejectedValue(new Error("Failed to capture")),
    captureException: vi
      .fn()
      .mockRejectedValue(new Error("Failed to capture exception")),
    flush: vi.fn().mockRejectedValue(new Error("Failed to flush")),
  }),

  /**
   * Observability disabled/offline mode
   */
  disabled: (baseMock = createObservabilityMock()) => ({
    ...baseMock,
    track: vi.fn().mockResolvedValue(false),
    capture: vi.fn().mockResolvedValue(null),
    captureException: vi.fn().mockResolvedValue(null),
    flush: vi.fn().mockResolvedValue(false),
  }),

  /**
   * Performance monitoring focused
   */
  performance: (baseMock = createObservabilityMock()) => ({
    ...baseMock,
    startTransaction: vi.fn(() => ({
      finish: vi.fn(),
      setStatus: vi.fn(),
      setData: vi.fn((key, value) =>
        console.log(`Transaction data: ${key} = ${value}`),
      ),
      setTag: vi.fn((key, value) =>
        console.log(`Transaction tag: ${key} = ${value}`),
      ),
    })),
    measure: vi.fn((name, startMark, endMark) => {
      console.log(
        `Performance measure: ${name} from ${startMark} to ${endMark}`,
      );
      return { duration: 100 };
    }),
    mark: vi.fn((name) => console.log(`Performance mark: ${name}`)),
  }),
};

/**
 * Helper to create observability mock with specific behavior
 */
export function createObservabilityMockWithBehavior(
  scenario: keyof typeof observabilityScenarios = "working",
) {
  return observabilityScenarios[scenario]();
}

/**
 * Reset all observability mocks
 */
export function resetObservabilityMocks() {
  vi.clearAllMocks();
}

export default setupObservabilityMocks;
