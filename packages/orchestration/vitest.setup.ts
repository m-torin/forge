import { vi } from 'vitest';

// Mock server-only module to prevent errors in tests
vi.mock('server-only', () => ({}));

// Mock database redis server module to prevent server-only imports
vi.mock('@repo/database/redis/server', () => ({
  redis: {
    ping: vi.fn().mockResolvedValue('PONG'),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
  },
}));
