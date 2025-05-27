import { vi } from 'vitest';

// Mock environment variables for testing
process.env.ARCJET_KEY = 'ajkey_test_key_12345';

// Suppress console output during tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
