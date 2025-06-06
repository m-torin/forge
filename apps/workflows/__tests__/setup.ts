import { vi } from 'vitest';
import { beforeEach, afterEach } from 'vitest';

// Mock environment variables
// @ts-ignore - NODE_ENV is read-only but we need to set it for tests
process.env.NODE_ENV = 'test';
process.env.QSTASH_TOKEN = 'test-token';
process.env.QSTASH_CURRENT_SIGNING_KEY = 'test-signing-key';
process.env.QSTASH_NEXT_SIGNING_KEY = 'test-next-signing-key';
process.env.WS_PORT = '3102';
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:3102/ws';

// Mock console.log for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// Mock setTimeout/setInterval for deterministic tests
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});
