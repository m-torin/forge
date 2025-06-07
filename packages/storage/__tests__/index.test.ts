import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock external modules
const mockKeys = vi.fn();
vi.mock('../keys', () => ({
  keys: mockKeys,
}));

const mockVercelBlobProvider = vi.fn();
const mockCloudflareR2Provider = vi.fn();

vi.mock('../providers/vercel-blob', () => ({
  VercelBlobProvider: mockVercelBlobProvider,
}));

vi.mock('../providers/cloudflare-r2', () => ({
  CloudflareR2Provider: mockCloudflareR2Provider,
}));

// Mock console.warn to test warning behavior
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Storage Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockConsoleWarn.mockClear();
  });

  describe('createStorageProvider', () => {
    it('should create Vercel Blob provider with valid config', async () => {
      const mockProviderInstance = {
        delete: vi.fn(),
        download: vi.fn(),
        exists: vi.fn(),
        getMetadata: vi.fn(),
        getUrl: vi.fn(),
        list: vi.fn(),
        upload: vi.fn(),
      };
      mockVercelBlobProvider.mockReturnValue(mockProviderInstance);

      const { createStorageProvider } = await import('../index');

      const config = {
        provider: 'vercel-blob' as const,
        vercelBlob: {
          token: 'test-token',
        },
      };

      const result = createStorageProvider(config);

      expect(mockVercelBlobProvider).toHaveBeenCalledWith('test-token');
      expect(result).toBe(mockProviderInstance);
    });

    it('should create Cloudflare R2 provider with valid config', async () => {
      const mockProviderInstance = {
        delete: vi.fn(),
        download: vi.fn(),
        exists: vi.fn(),
        getMetadata: vi.fn(),
        getUrl: vi.fn(),
        list: vi.fn(),
        upload: vi.fn(),
      };
      mockCloudflareR2Provider.mockReturnValue(mockProviderInstance);

      const { createStorageProvider } = await import('../index');

      const config = {
        provider: 'cloudflare-r2' as const,
        cloudflareR2: {
          accessKeyId: 'test-access-key',
          accountId: 'test-account',
          bucket: 'test-bucket',
          secretAccessKey: 'test-secret-key',
        },
      };

      const result = createStorageProvider(config);

      expect(mockCloudflareR2Provider).toHaveBeenCalledWith({
        accessKeyId: 'test-access-key',
        accountId: 'test-account',
        bucket: 'test-bucket',
        secretAccessKey: 'test-secret-key',
      });
      expect(result).toBe(mockProviderInstance);
    });

    it('should throw error for Vercel Blob provider without token', async () => {
      const { createStorageProvider } = await import('../index');

      const config = {
        provider: 'vercel-blob' as const,
        vercelBlob: {
          token: '',
        },
      };

      expect(() => createStorageProvider(config)).toThrow('Vercel Blob token is required');
    });

    it('should throw error for Vercel Blob provider without vercelBlob config', async () => {
      const { createStorageProvider } = await import('../index');

      const config = {
        provider: 'vercel-blob' as const,
      };

      expect(() => createStorageProvider(config)).toThrow('Vercel Blob token is required');
    });

    it('should throw error for Cloudflare R2 provider without config', async () => {
      const { createStorageProvider } = await import('../index');

      const config = {
        provider: 'cloudflare-r2' as const,
      };

      expect(() => createStorageProvider(config)).toThrow(
        'Cloudflare R2 configuration is required',
      );
    });

    it('should throw error for unknown provider', async () => {
      const { createStorageProvider } = await import('../index');

      const config = {
        provider: 'unknown-provider' as any,
      };

      expect(() => createStorageProvider(config)).toThrow(
        'Unknown storage provider: unknown-provider',
      );
    });
  });

  describe('MockStorageProvider', () => {
    let mockProvider: any;

    beforeEach(async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { initializeStorage } = await import('../index');
      mockProvider = initializeStorage();
    });

    it('should upload data and store in memory', async () => {
      const buffer = Buffer.from('test data');
      const result = await mockProvider.upload('test-key', buffer, {
        contentType: 'text/plain',
      });

      expect(result).toEqual({
        url: 'https://mock-storage.example.com/test-key',
        contentType: 'text/plain',
        key: 'test-key',
        lastModified: expect.any(Date),
        size: 9, // length of 'test data'
      });
    });

    it('should upload data with default content type', async () => {
      const buffer = Buffer.from('test data');
      const result = await mockProvider.upload('test-key', buffer);

      expect(result.contentType).toBe('application/octet-stream');
    });

    it('should upload non-Buffer data with default size', async () => {
      const blob = new Blob(['test']);
      const result = await mockProvider.upload('test-key', blob);

      expect(result.size).toBe(1024); // default size for non-Buffer
    });

    it('should download mock blob', async () => {
      const result = await mockProvider.download('test-key');

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/plain');

      const text = await result.text();
      expect(text).toBe('mock data');
    });

    it('should delete objects from storage', async () => {
      await mockProvider.upload('test-key', Buffer.from('test'));
      expect(await mockProvider.exists('test-key')).toBe(true);

      await mockProvider.delete('test-key');
      expect(await mockProvider.exists('test-key')).toBe(false);
    });

    it('should check if objects exist', async () => {
      expect(await mockProvider.exists('missing-key')).toBe(false);

      await mockProvider.upload('test-key', Buffer.from('test'));
      expect(await mockProvider.exists('test-key')).toBe(true);
    });

    it('should generate mock URLs', async () => {
      const result = await mockProvider.getUrl('test-key');
      expect(result).toBe('https://mock-storage.example.com/test-key');
    });

    it('should list stored objects', async () => {
      await mockProvider.upload('file1.txt', Buffer.from('data1'));
      await mockProvider.upload('file2.txt', Buffer.from('data2'));

      const result = await mockProvider.list();

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('file1.txt');
      expect(result[1].key).toBe('file2.txt');
    });

    it('should get metadata for existing objects', async () => {
      const uploadResult = await mockProvider.upload('test-key', Buffer.from('test'));
      const metadata = await mockProvider.getMetadata('test-key');

      expect(metadata).toEqual(uploadResult);
    });

    it('should throw error when getting metadata for missing objects', async () => {
      await expect(mockProvider.getMetadata('missing-key')).rejects.toThrow(
        'Object with key missing-key not found',
      );
    });
  });

  describe('initializeStorage', () => {
    it('should return singleton instance when already initialized', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { initializeStorage } = await import('../index');

      const instance1 = initializeStorage();
      const instance2 = initializeStorage();

      expect(instance1).toBe(instance2);
    });

    it('should create mock provider when no STORAGE_PROVIDER is configured', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { initializeStorage } = await import('../index');
      const result = initializeStorage();

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Storage service is disabled: Missing STORAGE_PROVIDER configuration',
      );
      expect(result).toBeDefined();
      expect(typeof result.upload).toBe('function');
    });

    it('should log warning only once for missing provider', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { initializeStorage } = await import('../index');

      initializeStorage();
      initializeStorage();

      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
    });

    it('should create Vercel Blob provider with valid configuration', async () => {
      const mockProviderInstance = { upload: vi.fn() };
      mockVercelBlobProvider.mockReturnValue(mockProviderInstance);

      mockKeys.mockReturnValue({
        BLOB_READ_WRITE_TOKEN: 'test-token',
        STORAGE_PROVIDER: 'vercel-blob',
      });

      const { initializeStorage } = await import('../index');
      const result = initializeStorage();

      expect(mockVercelBlobProvider).toHaveBeenCalledWith('test-token');
      expect(result).toBe(mockProviderInstance);
    });

    it('should create Cloudflare R2 provider with valid configuration', async () => {
      const mockProviderInstance = { upload: vi.fn() };
      mockCloudflareR2Provider.mockReturnValue(mockProviderInstance);

      mockKeys.mockReturnValue({
        R2_ACCESS_KEY_ID: 'test-access-key',
        R2_ACCOUNT_ID: 'test-account',
        R2_BUCKET: 'test-bucket',
        R2_SECRET_ACCESS_KEY: 'test-secret-key',
        STORAGE_PROVIDER: 'cloudflare-r2',
      });

      const { initializeStorage } = await import('../index');
      const result = initializeStorage();

      expect(mockCloudflareR2Provider).toHaveBeenCalledWith({
        accessKeyId: 'test-access-key',
        accountId: 'test-account',
        bucket: 'test-bucket',
        secretAccessKey: 'test-secret-key',
      });
      expect(result).toBe(mockProviderInstance);
    });

    it('should throw error for Vercel Blob without token', async () => {
      mockKeys.mockReturnValue({
        BLOB_READ_WRITE_TOKEN: undefined,
        STORAGE_PROVIDER: 'vercel-blob',
      });

      const { initializeStorage } = await import('../index');

      expect(() => initializeStorage()).toThrow(
        'BLOB_READ_WRITE_TOKEN is required for Vercel Blob provider',
      );
    });

    it('should throw error for incomplete R2 configuration', async () => {
      mockKeys.mockReturnValue({
        R2_ACCESS_KEY_ID: undefined, // Missing
        R2_ACCOUNT_ID: 'test-account',
        R2_BUCKET: 'test-bucket',
        R2_SECRET_ACCESS_KEY: 'test-secret-key',
        STORAGE_PROVIDER: 'cloudflare-r2',
      });

      const { initializeStorage } = await import('../index');

      expect(() => initializeStorage()).toThrow('R2 configuration is incomplete');
    });

    it('should handle all missing R2 configuration fields', async () => {
      const testCases = [
        {
          description: 'missing R2_ACCOUNT_ID',
          env: {
            R2_ACCESS_KEY_ID: 'test-access-key',
            R2_ACCOUNT_ID: undefined,
            R2_BUCKET: 'test-bucket',
            R2_SECRET_ACCESS_KEY: 'test-secret-key',
            STORAGE_PROVIDER: 'cloudflare-r2',
          },
        },
        {
          description: 'missing R2_SECRET_ACCESS_KEY',
          env: {
            R2_ACCESS_KEY_ID: 'test-access-key',
            R2_ACCOUNT_ID: 'test-account',
            R2_BUCKET: 'test-bucket',
            R2_SECRET_ACCESS_KEY: undefined,
            STORAGE_PROVIDER: 'cloudflare-r2',
          },
        },
        {
          description: 'missing R2_BUCKET',
          env: {
            R2_ACCESS_KEY_ID: 'test-access-key',
            R2_ACCOUNT_ID: 'test-account',
            R2_BUCKET: undefined,
            R2_SECRET_ACCESS_KEY: 'test-secret-key',
            STORAGE_PROVIDER: 'cloudflare-r2',
          },
        },
      ];

      for (const testCase of testCases) {
        vi.resetModules();
        mockKeys.mockReturnValue(testCase.env);

        const { initializeStorage } = await import('../index');

        expect(() => initializeStorage(), testCase.description).toThrow(
          'R2 configuration is incomplete',
        );
      }
    });
  });

  describe('getStorage', () => {
    it('should return existing storage instance', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { getStorage, initializeStorage } = await import('../index');

      const initialized = initializeStorage();
      const retrieved = getStorage();

      expect(retrieved).toBe(initialized);
    });

    it('should initialize storage if not already done', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { getStorage } = await import('../index');
      const result = getStorage();

      expect(result).toBeDefined();
      expect(typeof result.upload).toBe('function');
    });
  });

  describe('storage helper object', () => {
    it('should provide all required storage methods', async () => {
      const { storage } = await import('../index');

      expect(typeof storage.upload).toBe('function');
      expect(typeof storage.download).toBe('function');
      expect(typeof storage.delete).toBe('function');
      expect(typeof storage.exists).toBe('function');
      expect(typeof storage.list).toBe('function');
      expect(typeof storage.getUrl).toBe('function');
      expect(typeof storage.getMetadata).toBe('function');
    });

    it('should use the storage instance for operations', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { getStorage, storage } = await import('../index');

      // Get the instance first to initialize it
      const instance = getStorage();

      // Test that storage methods exist and can be called
      // (We test the actual functionality through MockStorageProvider tests above)
      await expect(storage.upload('test-key', Buffer.from('test'))).resolves.toBeDefined();
      await expect(storage.download('test-key')).resolves.toBeDefined();
      await expect(storage.exists('test-key')).resolves.toBeDefined();
      await expect(storage.getUrl('test-key')).resolves.toBeDefined();
      await expect(storage.list()).resolves.toBeDefined();

      // Test that the instance is properly used
      expect(instance).toBeDefined();
      expect(typeof instance.upload).toBe('function');
    });
  });

  describe('exports', () => {
    it('should export all expected functions and objects', async () => {
      const module = await import('../index');

      expect(typeof module.createStorageProvider).toBe('function');
      expect(typeof module.initializeStorage).toBe('function');
      expect(typeof module.getStorage).toBe('function');
      expect(typeof module.keys).toBe('function');
      expect(typeof module.storage).toBe('object');
      expect(typeof module.storage.upload).toBe('function');
      expect(typeof module.storage.download).toBe('function');
      expect(typeof module.storage.delete).toBe('function');
      expect(typeof module.storage.exists).toBe('function');
      expect(typeof module.storage.list).toBe('function');
      expect(typeof module.storage.getUrl).toBe('function');
      expect(typeof module.storage.getMetadata).toBe('function');
    });
  });

  describe('singleton behavior and state management', () => {
    it('should maintain singleton across multiple getStorage calls', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { getStorage } = await import('../index');

      const instance1 = getStorage();
      const instance2 = getStorage();
      const instance3 = getStorage();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should maintain state in mock provider across operations within same test', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { getStorage } = await import('../index');
      const storage = getStorage();

      // Upload and verify it exists
      await storage.upload('test-key', Buffer.from('test'));
      expect(await storage.exists('test-key')).toBe(true);

      // Get the same storage instance and verify state persists
      const sameStorage = getStorage();
      expect(await sameStorage.exists('test-key')).toBe(true);

      // Get metadata to verify upload worked
      const metadata = await storage.getMetadata('test-key');
      expect(metadata.key).toBe('test-key');
      expect(metadata.size).toBe(4); // 'test' is 4 bytes
    });

    it('should handle multiple uploads correctly', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { getStorage } = await import('../index');
      const storage = getStorage();

      // Upload multiple files
      await storage.upload('file1.txt', Buffer.from('data1'));
      await storage.upload('file2.txt', Buffer.from('data2'));
      await storage.upload('file3.txt', Buffer.from('data3'));

      // Verify all exist
      expect(await storage.exists('file1.txt')).toBe(true);
      expect(await storage.exists('file2.txt')).toBe(true);
      expect(await storage.exists('file3.txt')).toBe(true);

      // List and verify count
      const list = await storage.list();
      expect(list).toHaveLength(3);

      // Verify we can get metadata for each file
      const metadata1 = await storage.getMetadata('file1.txt');
      expect(metadata1.key).toBe('file1.txt');
      expect(metadata1.size).toBe(5); // 'data1' is 5 bytes
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle provider creation errors gracefully', async () => {
      // Clear module cache to ensure fresh import
      vi.resetModules();

      mockVercelBlobProvider.mockImplementation(() => {
        throw new Error('Provider initialization failed');
      });

      mockKeys.mockReturnValue({
        BLOB_READ_WRITE_TOKEN: 'test-token',
        STORAGE_PROVIDER: 'vercel-blob',
      });

      const { initializeStorage } = await import('../index');

      expect(() => initializeStorage()).toThrow('Provider initialization failed');
    });

    it('should handle keys() function errors', async () => {
      vi.resetModules();

      mockKeys.mockImplementation(() => {
        throw new Error('Environment configuration error');
      });

      const { initializeStorage } = await import('../index');

      expect(() => initializeStorage()).toThrow('Environment configuration error');
    });

    it('should handle warning logging for missing configuration', async () => {
      vi.resetModules();
      mockConsoleWarn.mockClear();

      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { initializeStorage } = await import('../index');

      // First call should log warning
      initializeStorage();
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Storage service is disabled: Missing STORAGE_PROVIDER configuration',
      );

      // Second call should not log warning again
      initializeStorage();
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
    });

    it('should create working mock storage when configuration is missing', async () => {
      mockKeys.mockReturnValue({
        STORAGE_PROVIDER: undefined,
      });

      const { getStorage } = await import('../index');
      const storage = getStorage();

      // Test that mock storage actually works
      await storage.upload('test-file', Buffer.from('test content'));

      expect(await storage.exists('test-file')).toBe(true);
      expect(await storage.getUrl('test-file')).toBe('https://mock-storage.example.com/test-file');

      const blob = await storage.download('test-file');
      expect(blob).toBeInstanceOf(Blob);

      const metadata = await storage.getMetadata('test-file');
      expect(metadata.key).toBe('test-file');
      expect(metadata.url).toBe('https://mock-storage.example.com/test-file');
    });
  });
});
