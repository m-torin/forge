import { vi } from 'vitest';

// Storage environment is set via vitest config env option

// Mock global fetch for storage tests
global.fetch = vi.fn();

// Mock the storage env module with centralized environment values
vi.mock('./env', () => ({
  env: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || 'test-blob-token',
    STORAGE_PROVIDER: 'vercel-blob',
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.S3_BUCKET_NAME,
    R2_CREDENTIALS: undefined,
    CLOUDFLARE_IMAGES_ACCOUNT_ID: undefined,
    CLOUDFLARE_IMAGES_API_TOKEN: undefined,
    CLOUDFLARE_IMAGES_DELIVERY_URL: undefined,
    CLOUDFLARE_IMAGES_SIGNING_KEY: undefined,
    STORAGE_CONFIG: undefined,
    STORAGE_LOG_LEVEL: 'error',
    STORAGE_LOG_PERFORMANCE: 'false',
    STORAGE_LOG_PROVIDER: 'console',
  },
}));

// Mock the keys module only if not testing keys itself
if (!process.env.VITEST_TEST_FILEPATH?.includes('keys.test')) {
  vi.mock('./keys', () => ({
    keys: () => ({
      BLOB_READ_WRITE_TOKEN: 'test-blob-token',
      STORAGE_PROVIDER: 'vercel-blob',
      R2_ACCOUNT_ID: undefined,
      R2_ACCESS_KEY_ID: undefined,
      R2_SECRET_ACCESS_KEY: undefined,
      R2_BUCKET: undefined,
      R2_CREDENTIALS: undefined,
      CLOUDFLARE_IMAGES_ACCOUNT_ID: undefined,
      CLOUDFLARE_IMAGES_API_TOKEN: undefined,
      CLOUDFLARE_IMAGES_DELIVERY_URL: undefined,
      CLOUDFLARE_IMAGES_SIGNING_KEY: undefined,
      STORAGE_CONFIG: undefined,
      STORAGE_LOG_LEVEL: 'error',
      STORAGE_LOG_PERFORMANCE: false,
      STORAGE_LOG_PROVIDER: 'console',
    }),
  }));
}
