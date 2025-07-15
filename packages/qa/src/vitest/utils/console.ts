// Centralized console and logging mock utilities for all tests in the monorepo
import { vi } from 'vitest';

/**
 * Mock console interface
 */
export interface MockConsole {
  log: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
  trace: ReturnType<typeof vi.fn>;
  group: ReturnType<typeof vi.fn>;
  groupCollapsed: ReturnType<typeof vi.fn>;
  groupEnd: ReturnType<typeof vi.fn>;
  table: ReturnType<typeof vi.fn>;
  time: ReturnType<typeof vi.fn>;
  timeEnd: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  countReset: ReturnType<typeof vi.fn>;
  assert: ReturnType<typeof vi.fn>;
  dir: ReturnType<typeof vi.fn>;
  dirxml: ReturnType<typeof vi.fn>;
}

/**
 * Create a mock console with all methods
 */
export function createMockConsole(
  options: {
    suppress?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
    captureOutput?: boolean;
  } = {},
): MockConsole {
  const { suppress = true, logLevel = 'none', captureOutput = false } = options;

  const shouldLog = (level: string) => {
    if (suppress && logLevel === 'none') return false;

    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  };

  const createMockFn = (level: string) => {
    const mockFn = vi.fn();

    if (captureOutput) {
      mockFn.mockImplementation((...args) => {
        if (shouldLog(level)) {
          const consoleFn = console[level as keyof Console];
          if (typeof consoleFn === 'function') {
            (consoleFn as (...args: any[]) => void)(...args);
          }
        }
      });
    }

    return mockFn;
  };

  return {
    log: createMockFn('info'),
    error: createMockFn('error'),
    warn: createMockFn('warn'),
    info: createMockFn('info'),
    debug: createMockFn('debug'),
    trace: createMockFn('debug'),
    group: vi.fn(),
    groupCollapsed: vi.fn(),
    groupEnd: vi.fn(),
    table: createMockFn('info'),
    time: vi.fn(),
    timeEnd: vi.fn(),
    clear: vi.fn(),
    count: vi.fn(),
    countReset: vi.fn(),
    assert: vi.fn(),
    dir: createMockFn('info'),
    dirxml: createMockFn('info'),
  };
}

/**
 * Apply mock console globally
 */
export function mockConsoleGlobally(
  options?: Parameters<typeof createMockConsole>[0],
): MockConsole {
  const mockConsole = createMockConsole(options);

  global.console = {
    ...console,
    ...mockConsole,
  } as any;

  return mockConsole;
}

/**
 * Restore original console
 */
let originalConsole: Console | null = null;

export function restoreConsole(): void {
  if (originalConsole) {
    global.console = originalConsole;
    originalConsole = null;
  }
}

/**
 * Temporarily suppress console output
 */
export function suppressConsole(): () => void {
  if (!originalConsole) {
    originalConsole = global.console;
  }

  const mockConsole = mockConsoleGlobally({ suppress: true });

  return () => {
    restoreConsole();
  };
}

/**
 * Clear all console mocks
 */
export function clearConsoleMocks(mockConsole: MockConsole) {
  Object.values(mockConsole).forEach(fn => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear();
    }
  });
}

/**
 * Helper for tests that need clean console state
 */
export function withMockedConsole<T>(
  testFn: (mockConsole: MockConsole) => T,
  options?: Parameters<typeof createMockConsole>[0],
): T {
  const originalConsole = global.console;
  const mockConsole = mockConsoleGlobally(options);

  try {
    return testFn(mockConsole);
  } finally {
    global.console = originalConsole;
  }
}

/**
 * Console presets for common scenarios
 */
export const CONSOLE_PRESETS = {
  minimal: {
    error: { enabled: false },
    warn: { enabled: false },
    info: { enabled: false },
    debug: { enabled: false },
  },
  nextjs: {
    error: { enabled: true, patterns: [/Warning:/, /Error:/] },
    warn: { enabled: false },
    info: { enabled: false },
    debug: { enabled: false },
  },
  verbose: {
    error: { enabled: true },
    warn: { enabled: true },
    info: { enabled: true },
    debug: { enabled: false },
  },
  full: {
    error: { enabled: true },
    warn: { enabled: true },
    info: { enabled: true },
    debug: { enabled: true },
  },
};

/**
 * Setup console suppression with configuration
 */
export function setupConsoleSuppression(config: any): MockConsole {
  return mockConsoleGlobally({
    suppress: true,
    logLevel: 'none',
    captureOutput: false,
  });
}

/**
 * Create console suppression configuration
 */
export function createConsoleSuppression(options: any): () => MockConsole {
  return () => setupConsoleSuppression(options);
}

// Export everything for easy access
export {
  createMockConsole as createMockLogger,
  mockConsoleGlobally as mockLogger,
  suppressConsole as suppressLogs,
};
