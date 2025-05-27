import { vi } from 'vitest';

// Mock environment variables
vi.mock('./keys', () => ({
  keys: () => ({
    KNOCK_SECRET_API_KEY: 'test-knock-key',
  }),
}));
