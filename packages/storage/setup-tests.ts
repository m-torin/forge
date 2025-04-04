import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';

// Mock environment variables
process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';
process.env.NODE_ENV = 'test';

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
    const env = {};
    Object.keys(server).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    return () => env;
  }),
}));

// Mock @vercel/blob
vi.mock('@vercel/blob', () => {
  return {
    put: vi.fn().mockResolvedValue({
      url: 'https://example.com/test-blob',
      pathname: '/test-blob',
      contentType: 'application/octet-stream',
      contentDisposition: 'attachment',
      size: 1024,
    }),
    list: vi.fn().mockResolvedValue({
      blobs: [
        {
          url: 'https://example.com/test-blob-1',
          pathname: '/test-blob-1',
          contentType: 'application/octet-stream',
          contentDisposition: 'attachment',
          size: 1024,
          uploadedAt: new Date(),
        },
      ],
      cursor: null,
    }),
    get: vi.fn().mockResolvedValue({
      blob: new Blob(['test content']),
      contentType: 'application/octet-stream',
      contentDisposition: 'attachment',
      size: 1024,
    }),
    del: vi.fn().mockResolvedValue(undefined),
    head: vi.fn().mockResolvedValue({
      url: 'https://example.com/test-blob',
      pathname: '/test-blob',
      contentType: 'application/octet-stream',
      contentDisposition: 'attachment',
      size: 1024,
      uploadedAt: new Date(),
    }),
  };
});

// Mock @vercel/blob/client
vi.mock('@vercel/blob/client', () => {
  return {
    // Client-side functions
    getPutUrl: vi.fn().mockResolvedValue({
      url: 'https://example.com/upload-url',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    }),
    getUrl: vi.fn().mockImplementation((pathname) => {
      return `https://example.com${pathname}`;
    }),
  };
});
