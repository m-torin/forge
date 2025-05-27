import { vi } from 'vitest';

// Mock environment variables
vi.mock('./keys', () => ({
  keys: () => ({
    RESEND_TOKEN: 'test-resend-token',
  }),
}));
