// Setup security test environment directly
import { vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Only set essential test environment variables, leave specific ones to individual tests
process.env.NODE_ENV = 'test';
process.env.CI = 'true';
process.env.SKIP_ENV_VALIDATION = 'true';

// Mock console for security package
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};
