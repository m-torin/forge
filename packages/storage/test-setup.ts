import { vi } from 'vitest';

// Mock Vercel Blob
vi.mock('@vercel/blob', (_: any) => ({
  del: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}));

// Mock environment variables
vi.mock('./keys', (_: any) => ({
  keys: () => ({
    BLOB_READ_WRITE_TOKEN: 'test-blob-token',
  }),
}));
