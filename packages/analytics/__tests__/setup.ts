import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Note: Centralized mocks were causing import resolution issues
// Package-specific mocks defined below:

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
};

// Mock Vercel Analytics (not yet in centralized mocks)
vi.mock('@vercel/analytics', () => ({
  Analytics: vi.fn(),
  track: vi.fn(),
}));

// Mock React hooks (app-specific, not in centralized mocks)
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: vi.fn(fn => fn),
    useEffect: vi.fn(fn => fn()),
    useMemo: vi.fn(fn => fn()),
    useRef: vi.fn(() => ({ current: null })),
    useState: vi.fn(initial => [initial, vi.fn()]),
  };
});

// Browser APIs are already mocked in centralized mocks

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
