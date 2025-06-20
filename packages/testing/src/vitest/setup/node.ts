import { afterEach, beforeEach, vi } from 'vitest';

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Suppress specific console errors during tests
export function suppressConsoleErrors(patterns: RegExp[] = [/Warning:/, /Error:/]): void {
  const originalError = console.error;

  beforeEach(() => {
    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && patterns.some((pattern) => pattern.test(args[0]))) {
        return;
      }
      originalError.call(console, ...args);
    };
  });

  afterEach(() => {
    console.error = originalError;
  });
}

// Set environment variables for tests
export function setTestEnv(envVars: Record<string, string>): void {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...envVars };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
}

export default {
  setTestEnv,
  suppressConsoleErrors,
};
