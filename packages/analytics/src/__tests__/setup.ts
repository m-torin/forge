import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
};

// Mock PostHog
vi.mock('posthog-js', () => ({
  default: {
    identify: vi.fn(),
    capture: vi.fn(),
    getFeatureFlag: vi.fn(),
    init: vi.fn(),
    isFeatureEnabled: vi.fn(),
    loaded: vi.fn(),
    onFeatureFlags: vi.fn(),
    register: vi.fn(),
    reset: vi.fn(),
    unregister: vi.fn(),
  },
}));

// Mock PostHog Node
vi.mock('posthog-node', () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    identify: vi.fn(),
    capture: vi.fn(),
    flush: vi.fn(),
    getFeatureFlag: vi.fn(),
    isFeatureEnabled: vi.fn(),
    shutdown: vi.fn(),
  })),
}));

// Mock Segment
vi.mock('@segment/analytics-next', () => ({
  AnalyticsBrowser: {
    load: vi.fn().mockReturnValue({
      identify: vi.fn(),
      alias: vi.fn(),
      group: vi.fn(),
      page: vi.fn(),
      reset: vi.fn(),
      track: vi.fn(),
    }),
  },
}));

// Mock Vercel Analytics
vi.mock('@vercel/analytics', () => ({
  Analytics: vi.fn(),
  track: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: vi.fn((fn) => fn),
    useEffect: vi.fn((fn) => fn()),
    useMemo: vi.fn((fn) => fn()),
    useRef: vi.fn(() => ({ current: null })),
    useState: vi.fn((initial) => [initial, vi.fn()]),
  };
});

// Setup DOM globals
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })),
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  clear: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
