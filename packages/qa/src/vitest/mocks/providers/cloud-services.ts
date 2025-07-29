// Centralized cloud services mocks for all tests in the monorepo
import { vi } from 'vitest';

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({}),
    destroy: vi.fn(),
  })),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
  ListObjectsV2Command: vi.fn(),
  CopyObjectCommand: vi.fn(),
  CreateMultipartUploadCommand: vi.fn(),
  UploadPartCommand: vi.fn(),
  CompleteMultipartUploadCommand: vi.fn(),
  AbortMultipartUploadCommand: vi.fn(),
}));

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: vi.fn().mockImplementation(() => ({
    done: vi.fn().mockResolvedValue({ Location: 'https://mock.s3.amazonaws.com/file.jpg' }),
    abort: vi.fn(),
    on: vi.fn(),
  })),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://mock-signed-url.s3.amazonaws.com/file.jpg'),
}));

// Mock Vercel Blob
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({
    url: 'https://mock.vercel-storage.com/file.jpg',
    pathname: 'file.jpg',
    contentType: 'image/jpeg',
    contentDisposition: 'inline',
  }),
  del: vi.fn().mockResolvedValue(undefined),
  head: vi.fn().mockResolvedValue({
    url: 'https://mock.vercel-storage.com/file.jpg',
    contentType: 'image/jpeg',
    size: 1024,
    uploadedAt: new Date(),
  }),
  list: vi.fn().mockResolvedValue({
    blobs: [],
    cursor: null,
    hasMore: false,
  }),
}));

// Mock Upstash QStash
vi.mock('@upstash/qstash', () => ({
  Client: vi.fn().mockImplementation(() => ({
    publishJSON: vi.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
    publish: vi.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
    batchJSON: vi.fn().mockResolvedValue([{ messageId: 'mock-message-id' }]),
    batch: vi.fn().mockResolvedValue([{ messageId: 'mock-message-id' }]),
    schedules: {
      create: vi.fn().mockResolvedValue({ scheduleId: 'mock-schedule-id' }),
      get: vi.fn().mockResolvedValue(null),
      list: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    messages: {
      get: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    dlq: {
      list: vi.fn().mockResolvedValue({ messages: [] }),
      get: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  })),
  Receiver: vi.fn().mockImplementation(() => ({
    verify: vi.fn().mockReturnValue(true),
  })),
}));

// Mock Upstash Workflow
vi.mock('@upstash/workflow/nextjs', () => ({
  serve: vi.fn(handler => handler),
  WorkflowContext: vi.fn(),
}));

// Mock Upstash Ratelimit
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
    }),
    blockUntil: vi.fn().mockResolvedValue(null),
    resetUsedTokens: vi.fn().mockResolvedValue(undefined),
  })),
  // Rate limit algorithms
  slidingWindow: vi.fn(),
  fixedWindow: vi.fn(),
  tokenBucket: vi.fn(),
}));

// Mock Google Cloud Storage (if used)
vi.mock('@google-cloud/storage', () => ({
  Storage: vi.fn().mockImplementation(() => ({
    bucket: vi.fn().mockReturnValue({
      file: vi.fn().mockReturnValue({
        save: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue([]),
        exists: vi.fn().mockResolvedValue([true]),
        download: vi.fn().mockResolvedValue([Buffer.from('mock data')]),
        getSignedUrl: vi.fn().mockResolvedValue(['https://mock-signed-url.storage.googleapis.com']),
        getMetadata: vi.fn().mockResolvedValue([{ size: 1024, contentType: 'image/jpeg' }]),
      }),
      getFiles: vi.fn().mockResolvedValue([[]]),
      upload: vi.fn().mockResolvedValue([]),
    }),
  })),
}));

// Mock Storage Interface (R2/S3 compatible)
export const mockStorage = {
  upload: async (key: string, data: any, options?: any) => ({
    url: `https://mock-r2.example.com/${key}`,
    key,
    size:
      data instanceof ArrayBuffer ? data.byteLength : data instanceof Buffer ? data.length : 1024,
    lastModified: new Date(),
    contentType: options?.contentType || 'application/octet-stream',
    etag: `"${Math.random().toString(36).substr(2, 9)}"`,
  }),
  get: async (key: string) => ({
    url: `https://mock-r2.example.com/${key}`,
    key,
    data: Buffer.from('mock data'),
    metadata: {
      contentType: 'application/octet-stream',
      size: 1024,
      lastModified: new Date(),
    },
  }),
  set: async (key: string, value: any, options?: any) => {
    return 'OK';
  },
  delete: async (key: string) => {
    return 1; // Number of deleted objects
  },
  exists: async (key: string) => {
    return Math.random() > 0.5; // Randomly return true/false for testing
  },
  getMetadata: async (key: string) => ({
    key,
    url: `https://mock-r2.example.com/${key}`,
    size: 1024,
    lastModified: new Date(),
    contentType: 'application/octet-stream',
    etag: `"${Math.random().toString(36).substr(2, 9)}"`,
  }),
  list: async (options?: { prefix?: string; limit?: number; cursor?: string }) => ({
    objects: [
      {
        key: 'example-file.txt',
        url: 'https://mock-r2.example.com/example-file.txt',
        size: 1024,
        lastModified: new Date(),
        contentType: 'text/plain',
      },
    ],
    cursor: null,
    hasMore: false,
  }),
  download: async (key: string) => new Blob(['mock data'], { type: 'application/octet-stream' }),
  getUrl: async (key: string, options?: { expiresIn?: number }) =>
    `https://mock-r2.example.com/${key}${options?.expiresIn ? '?expires=' + (Date.now() + options.expiresIn * 1000) : ''}`,
  getSignedUrl: async (
    key: string,
    options?: { expiresIn?: number; method?: 'GET' | 'PUT' | 'DELETE' },
  ) =>
    `https://mock-r2.example.com/${key}?signature=mock-signature&expires=${Date.now() + (options?.expiresIn || 3600) * 1000}`,
};

// Export aliases for different storage types
export const storage = mockStorage;
export const multiStorage = mockStorage;
export const r2Storage = mockStorage;
export const s3Storage = mockStorage;

// Export helper functions
export const mockS3Response = (data: any) => ({
  $metadata: {
    httpStatusCode: 200,
    requestId: 'mock-request-id',
    attempts: 1,
    totalRetryDelay: 0,
  },
  ...data,
});

export const mockQStashMessage = (payload: any) => ({
  messageId: 'mock-message-id',
  url: 'https://mock-api.com/webhook',
  body: JSON.stringify(payload),
  headers: {
    'content-type': 'application/json',
  },
  createdAt: Date.now(),
});

export const mockStorageFile = (key: string, overrides: any = {}) => ({
  key,
  url: `https://mock-storage.example.com/${key}`,
  size: 1024,
  lastModified: new Date(),
  contentType: 'application/octet-stream',
  etag: `"${Math.random().toString(36).substr(2, 9)}"`,
  ...overrides,
});

export const mockUploadResult = (key: string, overrides: any = {}) => ({
  url: `https://mock-storage.example.com/${key}`,
  key,
  size: 1024,
  lastModified: new Date(),
  contentType: 'application/octet-stream',
  ...overrides,
});

export const resetCloudServiceMocks = () => {
  vi.clearAllMocks();
};
