// Import shared testing setup
import { vi } from "vitest";

// Mock environment variables
process.env.BLOB_READ_WRITE_TOKEN = "test-blob-token";
process.env.NODE_ENV = "test";

// Create mocks that we'll export and use in our implementation
export const mockCreateEnv = vi
  .fn()
  .mockImplementation(
    ({
      runtimeEnv,
      server,
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
  pathname: "/test-blob",
  url: "https://example.com/test-blob",
  contentDisposition: "attachment",
  contentType: "application/octet-stream",
  size: 1024,
});

export const mockList = vi.fn().mockResolvedValue({
  blobs: [
    {
      pathname: "/test-blob-1",
      url: "https://example.com/test-blob-1",
      contentDisposition: "attachment",
      contentType: "application/octet-stream",
      size: 1024,
      uploadedAt: new Date(),
    },
  ],
  cursor: null,
});

export const mockGet = vi.fn().mockResolvedValue({
  blob: new Blob(["test content"]),
  contentDisposition: "attachment",
  contentType: "application/octet-stream",
  size: 1024,
});

export const mockDel = vi.fn().mockResolvedValue(undefined);

export const mockHead = vi.fn().mockResolvedValue({
  pathname: "/test-blob",
  url: "https://example.com/test-blob",
  contentDisposition: "attachment",
  contentType: "application/octet-stream",
  size: 1024,
  uploadedAt: new Date(),
});

export const mockGetPutUrl = vi.fn().mockResolvedValue({
  url: "https://example.com/upload-url",
  headers: {
    "Content-Type": "application/octet-stream",
  },
});

export const mockGetUrl = vi.fn().mockImplementation((pathname: string) => {
  return `https://example.com${pathname}`;
});

export const mockCreateMultipartUpload = vi.fn().mockResolvedValue(undefined);
export const mockCompleteMultipartUpload = vi.fn().mockResolvedValue(undefined);
export const mockCreateFolder = vi.fn().mockResolvedValue(undefined);

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: mockCreateEnv,
}));

// Mock @vercel/blob
vi.mock("@vercel/blob", () => {
  return {
    BlobAccessError: class BlobAccessError extends Error {},
    del: mockDel,
    get: mockGet,
    head: mockHead,
    list: mockList,
    put: mockPut,
  };
});

// Mock @vercel/blob/client
vi.mock("@vercel/blob/client", () => {
  return {
    completeMultipartUpload: mockCompleteMultipartUpload,
    createFolder: mockCreateFolder,
    createMultipartUpload: mockCreateMultipartUpload,
    // Client-side functions
    getPutUrl: mockGetPutUrl,
    getUrl: mockGetUrl,
  };
});
