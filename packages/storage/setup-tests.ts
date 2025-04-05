import "@repo/testing/src/vitest/core/setup";
import { vi } from "vitest";

// Mock environment variables
process.env.BLOB_READ_WRITE_TOKEN = "test-blob-token";
process.env.NODE_ENV = "test";

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi
    .fn()
    .mockImplementation(
      ({
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        return () => env;
      },
    ),
}));

// Mock @vercel/blob
vi.mock("@vercel/blob", () => {
  return {
    del: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue({
      blob: new Blob(["test content"]),
      contentDisposition: "attachment",
      contentType: "application/octet-stream",
      size: 1024,
    }),
    head: vi.fn().mockResolvedValue({
      pathname: "/test-blob",
      url: "https://example.com/test-blob",
      contentDisposition: "attachment",
      contentType: "application/octet-stream",
      size: 1024,
      uploadedAt: new Date(),
    }),
    list: vi.fn().mockResolvedValue({
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
    }),
    put: vi.fn().mockResolvedValue({
      pathname: "/test-blob",
      url: "https://example.com/test-blob",
      contentDisposition: "attachment",
      contentType: "application/octet-stream",
      size: 1024,
    }),
  };
});

// Mock @vercel/blob/client
vi.mock("@vercel/blob/client", () => {
  return {
    // Client-side functions
    getPutUrl: vi.fn().mockResolvedValue({
      url: "https://example.com/upload-url",
      headers: {
        "Content-Type": "application/octet-stream",
      },
    }),
    getUrl: vi.fn().mockImplementation((pathname) => {
      return `https://example.com${pathname}`;
    }),
  };
});
