import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createStorageProvider, initializeStorage, storage } from '../index';

import type { StorageConfig } from '../types';

// Mock providers
vi.mock('../providers/vercel-blob', () => ({
  VercelBlobProvider: vi.fn().mockImplementation(() => ({
    delete: vi.fn(),
    download: vi.fn(),
    exists: vi.fn(),
    getMetadata: vi.fn(),
    getUrl: vi.fn(),
    list: vi.fn(),
    upload: vi.fn(),
  })),
}));

vi.mock('../providers/cloudflare-r2', () => ({
  CloudflareR2Provider: vi.fn().mockImplementation(() => ({
    delete: vi.fn(),
    download: vi.fn(),
    exists: vi.fn(),
    getMetadata: vi.fn(),
    getUrl: vi.fn(),
    list: vi.fn(),
    upload: vi.fn(),
  })),
}));

// Mock keys
vi.mock('../keys', () => ({
  keys: vi.fn().mockReturnValue({
    BLOB_READ_WRITE_TOKEN: 'test-token',
    STORAGE_PROVIDER: 'vercel-blob',
  }),
}));

describe('@repo/storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createStorageProvider', () => {
    it('creates Vercel Blob provider', () => {
      const config: StorageConfig = {
        provider: 'vercel-blob',
        vercelBlob: { token: 'test-token' },
      };

      const provider = createStorageProvider(config);
      expect(provider).toBeDefined();
      expect(provider.upload).toBeDefined();
      expect(provider.download).toBeDefined();
      expect(provider.delete).toBeDefined();
    });

    it('creates Cloudflare R2 provider', () => {
      const config: StorageConfig = {
        provider: 'cloudflare-r2',
        cloudflareR2: {
          accessKeyId: 'test-key',
          accountId: 'test-account',
          bucket: 'test-bucket',
          secretAccessKey: 'test-secret',
        },
      };

      const provider = createStorageProvider(config);
      expect(provider).toBeDefined();
    });

    it('throws error for unknown provider', () => {
      const config = {
        provider: 'unknown',
      } as any;

      expect(() => createStorageProvider(config)).toThrowError('Unknown storage provider: unknown');
    });
  });

  describe('storage helper', () => {
    it('provides all storage methods', () => {
      expect(storage.upload).toBeDefined();
      expect(storage.download).toBeDefined();
      expect(storage.delete).toBeDefined();
      expect(storage.exists).toBeDefined();
      expect(storage.list).toBeDefined();
      expect(storage.getUrl).toBeDefined();
      expect(storage.getMetadata).toBeDefined();
    });

    it('delegates to storage provider instance', async () => {
      const mockData = Buffer.from('test');
      await storage.upload('test-key', mockData);

      const provider = initializeStorage();
      expect(provider.upload).toHaveBeenCalledWith('test-key', mockData, undefined);
    });
  });
});
