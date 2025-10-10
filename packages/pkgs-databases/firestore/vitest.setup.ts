import { vi } from 'vitest';

// Global test setup for Firestore package

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
