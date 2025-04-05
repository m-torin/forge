/**
 * Framework-agnostic mocks for testing
 *
 * These mocks can be used with any testing setup.
 */
import { vi } from "vitest";

/**
 * Setup console mocks to prevent noisy console output in tests
 */
export function setupConsoleMocks(): void {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  // Mock console methods
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
  console.info = vi.fn();
  console.debug = vi.fn();

  // Add restore function to global afterAll
  // @ts-ignore - afterAll is defined in the global scope
  if (typeof afterAll === "function") {
    // @ts-ignore - afterAll is defined in the global scope
    afterAll(() => {
      // Restore original console methods
      if (originalConsole.log) {
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
        console.info = originalConsole.info;
        console.debug = originalConsole.debug;
      }
    });
  }
}

/**
 * Restore original console methods
 */
export function restoreConsoleMocks(): void {
  // This is a no-op if setupConsoleMocks wasn't called
  // The actual restoration happens in the afterAll hook
  console.warn(
    "restoreConsoleMocks is deprecated. Console mocks are automatically restored in afterAll.",
  );
}

/**
 * Mock the Date object to return a fixed date
 * @param fixedDate - The date to fix to (defaults to 2023-01-01)
 * @returns Function to restore the original Date
 */
export function mockDate(fixedDate: Date = new Date("2023-01-01")): () => void {
  const RealDate = global.Date;

  // @ts-ignore - we're intentionally mocking the Date constructor
  global.Date = class extends RealDate {
    constructor(...args: any[]) {
      super();
      if (args.length === 0) {
        return new RealDate(fixedDate);
      }
      // @ts-ignore - spread argument with any[] type
      return new RealDate(...args);
    }

    static now() {
      return fixedDate.getTime();
    }
  };

  // Return function to restore original Date
  return () => {
    global.Date = RealDate;
  };
}

/**
 * Mock fetch API
 * @param mockResponse - The response to return from fetch
 * @returns The mock fetch function for assertions
 */
export function mockFetch(mockResponse: any = {}): jest.Mock {
  const mockFetchFn = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    text: () => Promise.resolve(JSON.stringify(mockResponse)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(mockResponse)])),
    ...mockResponse,
  });

  // @ts-ignore - we're intentionally mocking global fetch
  global.fetch = mockFetchFn;

  return mockFetchFn;
}
