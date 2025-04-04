// Import shared testing setup
import { vi } from 'vitest';

// Mock environment variables
process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';
process.env.NODE_ENV = 'test';

// Create mocks that we'll export and use in our implementation
export const mockCreateEnv = vi
  .fn()
  .mockImplementation(
    ({
      server,
      runtimeEnv,
    }: {
      server: Record<string, unknown>;
      runtimeEnv: Record<string, unknown>;
    }) => {
      const env: Record<string, unknown> = {};
      Object.keys(server).forEach((key) => {
        env[key] = runtimeEnv[key];
      });
      return env;
    },
  );

export const mockPut = vi.fn().mockResolvedValue({
  url: 'https://example.com/test-blob',
  pathname: '/test-blob',
  contentType: 'application/octet-stream',
  contentDisposition: 'attachment',
  size: 1024,
});

export const mockList = vi.fn().mockResolvedValue({
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
});

export const mockGet = vi.fn().mockResolvedValue({
  blob: new Blob(['test content']),
  contentType: 'application/octet-stream',
  contentDisposition: 'attachment',
  size: 1024,
});

export const mockDel = vi.fn().mockResolvedValue(undefined);

export const mockHead = vi.fn().mockResolvedValue({
  url: 'https://example.com/test-blob',
  pathname: '/test-blob',
  contentType: 'application/octet-stream',
  contentDisposition: 'attachment',
  size: 1024,
  uploadedAt: new Date(),
});

export const mockGetPutUrl = vi.fn().mockResolvedValue({
  url: 'https://example.com/upload-url',
  headers: {
    'Content-Type': 'application/octet-stream',
  },
});

export const mockGetUrl = vi.fn().mockImplementation((pathname: string) => {
  return `https://example.com${pathname}`;
});

export const mockCreateMultipartUpload = vi.fn().mockResolvedValue(undefined);
export const mockCompleteMultipartUpload = vi.fn().mockResolvedValue(undefined);
export const mockCreateFolder = vi.fn().mockResolvedValue(undefined);

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: mockCreateEnv,
}));

// Mock @vercel/blob
vi.mock('@vercel/blob', () => {
  return {
    put: mockPut,
    list: mockList,
    get: mockGet,
    del: mockDel,
    head: mockHead,
    BlobAccessError: class BlobAccessError extends Error {},
  };
});

// Mock @vercel/blob/client
vi.mock('@vercel/blob/client', () => {
  return {
    // Client-side functions
    getPutUrl: mockGetPutUrl,
    getUrl: mockGetUrl,
    createMultipartUpload: mockCreateMultipartUpload,
    completeMultipartUpload: mockCompleteMultipartUpload,
    createFolder: mockCreateFolder,
  };
});
