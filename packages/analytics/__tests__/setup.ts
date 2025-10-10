import { beforeEach, vi } from "vitest";

// Centralized mocks from @repo/qa are automatically loaded via createReactPackageConfig setup files

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
};

// Mock React hooks (app-specific, not in centralized mocks)
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useCallback: vi.fn((fn) => fn),
    useEffect: vi.fn((fn) => fn()),
    useMemo: vi.fn((fn) => fn()),
    useRef: vi.fn(() => ({ current: null })),
    useState: vi.fn((initial) => [initial, vi.fn()]),
  };
});

// Common analytics test configuration
export const createAnalyticsTestConfig = (overrides = {}) => ({
  providers: {
    console: {},
    ...overrides,
  },
});

// Common analytics creation patterns
export const createTestAnalytics = async (
  config = createAnalyticsTestConfig(),
) => {
  const { createClientAnalytics } = await import("#/client/index");
  return createClientAnalytics(config);
};

export const createTestServerAnalytics = async (
  config = createAnalyticsTestConfig(),
) => {
  const { createServerAnalytics } = await import("#/server/index");
  return createServerAnalytics(config);
};

// Export test factories and generators
export * from "./emitter-test-factory";
// Note: createTestData is already exported from emitter-test-factory, so we don't re-export from test-data-generators
export {
  ecommerceTestData,
  edgeCaseTestData,
  testPatterns,
  userTestData,
  validateTestData,
} from "./test-data-generators";

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
