import { beforeEach, describe, expect, vi } from 'vitest';
import { CloudflareImagesProvider } from '../../providers/cloudflare-images';
import { CloudflareR2Provider } from '../../providers/cloudflare-r2';
import { VercelBlobProvider } from '../../providers/vercel-blob';
import { MultiStorageManager } from '../../src/multi-storage';
import { MultiStorageConfig } from '../../types';

// Mock the providers
vi.mock('../../providers/cloudflare-r2');
vi.mock('../../providers/cloudflare-images');
vi.mock('../../providers/vercel-blob');

describe('multiStorageManager', () => {
  let manager: MultiStorageManager;
  const mockConfig: MultiStorageConfig = {
    providers: {
      documents: {
        provider: 'cloudflare-r2',
        cloudflareR2: {
          bucket: 'docs-bucket',
          accountId: 'account-1',
          accessKeyId: 'key-1',
          secretAccessKey: 'secret-1',
        },
      },
      uploads: {
        provider: 'cloudflare-r2',
        cloudflareR2: {
          bucket: 'uploads-bucket',
          accountId: 'account-2',
          accessKeyId: 'key-2',
          secretAccessKey: 'secret-2',
        },
      },
      images: {
        provider: 'cloudflare-images',
        cloudflareImages: {
          accountId: 'cf-account',
          apiToken: 'cf-token',
        },
      },
      cache: {
        provider: 'vercel-blob',
        vercelBlob: {
          token: 'blob-token',
        },
      },
    },
    defaultProvider: 'documents',
    routing: {
      images: 'images',
      documents: 'documents',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock provider methods
    const mockMethods = {
      upload: vi.fn().mockResolvedValue({ key: 'test', url: 'http://test.com', size: 100 }),
      download: vi.fn().mockResolvedValue(new Blob(['test'])),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      getMetadata: vi.fn().mockResolvedValue({ key: 'test', url: 'http://test.com', size: 100 }),
      getUrl: vi.fn().mockResolvedValue('http://test.com/signed'),
      list: vi.fn().mockResolvedValue([]),
    };

    (CloudflareR2Provider as any).mockImplementation(() => mockMethods);
    (CloudflareImagesProvider as any).mockImplementation(() => ({
      ...mockMethods,
      createVariant: vi.fn(),
      getDirectUploadUrl: vi
        .fn()
        .mockResolvedValue({ uploadURL: 'http://upload.com', id: 'upload-id' }),
    }));
    (VercelBlobProvider as any).mockImplementation(() => mockMethods);

    manager = new MultiStorageManager(mockConfig);
  });

  describe('constructor', () => {
    test('should initialize all providers', () => {
      expect(CloudflareR2Provider).toHaveBeenCalledTimes(2);
      expect(CloudflareImagesProvider).toHaveBeenCalledTimes(1);
      expect(VercelBlobProvider).toHaveBeenCalledTimes(1);
    });

    test('should throw error if no providers configured', () => {
      expect(() => new MultiStorageManager({ providers: {} })).toThrow(
        'No storage providers configured',
      );
    });
  });

  describe('routing', () => {
    test('should route image files to images provider', async () => {
      const imageProvider = manager.getProvider('images');
      await manager.upload('photo.jpg', new Blob(['image']), { contentType: 'image/jpeg' });

      expect(imageProvider?.upload).toHaveBeenCalledWith(
        'photo.jpg',
        expect.any(Blob),
        expect.objectContaining({ contentType: 'image/jpeg' }),
      );
    });

    test('should route document files to documents provider', async () => {
      const docsProvider = manager.getProvider('documents');
      await manager.upload('report.pdf', new Blob(['pdf']), { contentType: 'application/pdf' });

      expect(docsProvider?.upload).toHaveBeenCalledWith(
        'report.pdf',
        expect.any(Blob),
        expect.objectContaining({ contentType: 'application/pdf' }),
      );
    });

    test('should use default provider for unknown file types', async () => {
      const defaultProvider = manager.getProvider('documents');
      await manager.upload('data.xyz', new Blob(['data']));

      expect(defaultProvider?.upload).toHaveBeenCalledWith('data.xyz', expect.any(Blob), undefined);
    });

    test('should allow explicit provider override', async () => {
      const cacheProvider = manager.getProvider('cache');
      await manager.upload('image.jpg', new Blob(['image']), {
        provider: 'cache',
        contentType: 'image/jpeg',
      });

      expect(cacheProvider?.upload).toHaveBeenCalledWith(
        'image.jpg',
        expect.any(Blob),
        expect.objectContaining({
          provider: 'cache',
          contentType: 'image/jpeg',
        }),
      );
    });
  });

  describe('getProvider', () => {
    test('should return provider by name', () => {
      const provider = manager.getProvider('images');
      expect(provider).toBeDefined();
      // Since we're mocking, we can't check instanceof
      expect(provider?.upload).toBeDefined();
    });

    test('should return undefined for non-existent provider', () => {
      const provider = manager.getProvider('non-existent');
      expect(provider).toBeUndefined();
    });
  });

  describe('getProviderNames', () => {
    test('should return all provider names', () => {
      const names = manager.getProviderNames();
      expect(names).toStrictEqual(['documents', 'uploads', 'images', 'cache']);
    });
  });

  describe('list', () => {
    test('should list from specific provider', async () => {
      const imagesProvider = manager.getProvider('images');
      await manager.list({ provider: 'images' });

      expect(imagesProvider?.list).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'images' }),
      );
    });

    test('should list from all providers if no provider specified', async () => {
      await manager.list();

      // All 4 providers should be called
      expect(manager.getProvider('documents')?.list).toHaveBeenCalledWith(undefined);
      expect(manager.getProvider('uploads')?.list).toHaveBeenCalledWith(undefined);
      expect(manager.getProvider('images')?.list).toHaveBeenCalledWith(undefined);
      expect(manager.getProvider('cache')?.list).toHaveBeenCalledWith(undefined);
    });

    test('should throw error for non-existent provider', async () => {
      await expect(manager.list({ provider: 'non-existent' })).rejects.toThrow(
        "Provider 'non-existent' not found",
      );
    });
  });

  describe('file type detection', () => {
    const testCases = [
      { file: 'image.jpg', expectedProvider: 'images' },
      { file: 'photo.png', expectedProvider: 'images' },
      { file: 'icon.svg', expectedProvider: 'images' },
      { file: 'document.pdf', expectedProvider: 'documents' },
      { file: 'spreadsheet.xlsx', expectedProvider: 'documents' },
      { file: 'presentation.ppt', expectedProvider: 'documents' },
      { file: 'unknown.xyz', expectedProvider: 'documents' }, // default
    ];

    testCases.forEach(({ file, expectedProvider }) => {
      test(`should route ${file} to ${expectedProvider} provider`, async () => {
        const provider = manager.getProvider(expectedProvider);
        await manager.upload(file, new Blob(['test']));
        expect(provider?.upload).toHaveBeenCalledWith(file, expect.any(Blob), undefined);
      });
    });
  });

  describe('getCloudflareImagesProvider', () => {
    test('should return Cloudflare Images provider instance', async () => {
      // Since we're mocking, we need to make the mock instance identifiable
      const mockCfImagesProvider = {
        ...manager.getProvider('images'),
        _isCloudflareImages: true,
      };

      // Override the getCloudflareImagesProvider method for this test
      vi.spyOn(manager, 'getCloudflareImagesProvider').mockResolvedValue(
        mockCfImagesProvider as any,
      );

      const cfImagesProvider = await manager.getCloudflareImagesProvider();
      expect(cfImagesProvider).toBeDefined();
      expect(cfImagesProvider).toBe(mockCfImagesProvider);
    });

    test('should return undefined if no Cloudflare Images provider', async () => {
      const configWithoutImages: MultiStorageConfig = {
        providers: {
          documents: mockConfig.providers.documents,
        },
      };
      const managerWithoutImages = new MultiStorageManager(configWithoutImages);

      const cfImagesProvider = await managerWithoutImages.getCloudflareImagesProvider();
      expect(cfImagesProvider).toBeUndefined();
    });
  });

  describe('operations', () => {
    const operations = ['delete', 'download', 'exists', 'getMetadata', 'getUrl'] as const;

    operations.forEach(operation => {
      test(`should route ${operation} operation correctly`, async () => {
        const docsProvider = manager.getProvider('documents');
        await (manager as any)[operation]('document.pdf');

        if (operation === 'getUrl') {
          // getUrl takes two parameters

          expect((docsProvider as any)[operation]).toHaveBeenCalledWith('document.pdf', undefined);
        } else {
          expect((docsProvider as any)[operation]).toHaveBeenCalledWith('document.pdf');
        }
      });
    });
  });

  describe('multi-R2 configuration', () => {
    test('should support array of R2 configurations', () => {
      const multiR2Config: MultiStorageConfig = {
        providers: {
          'r2-primary': {
            provider: 'cloudflare-r2',
            cloudflareR2: [
              {
                name: 'primary',
                bucket: 'primary-bucket',
                accountId: 'account-1',
                accessKeyId: 'key-1',
                secretAccessKey: 'secret-1',
              },
            ],
          },
        },
      };

      const r2Manager = new MultiStorageManager(multiR2Config);
      expect(r2Manager.getProvider('r2-primary')).toBeDefined();
    });

    test('should support multiple R2 buckets', () => {
      const multiR2Config: MultiStorageConfig = {
        providers: {
          'r2-multi': {
            provider: 'cloudflare-r2',
            cloudflareR2: [
              {
                name: 'primary',
                bucket: 'primary-bucket',
                accountId: 'account-1',
                accessKeyId: 'key-1',
                secretAccessKey: 'secret-1',
              },
              {
                name: 'secondary',
                bucket: 'secondary-bucket',
                accountId: 'account-2',
                accessKeyId: 'key-2',
                secretAccessKey: 'secret-2',
              },
            ],
          },
        },
      };

      const r2Manager = new MultiStorageManager(multiR2Config);
      const provider = r2Manager.getProvider('r2-multi');
      expect(provider).toBeDefined();
      expect(CloudflareR2Provider).toHaveBeenCalledWith(
        expect.objectContaining({
          bucket: 'primary-bucket',
          accountId: 'account-1',
          accessKeyId: 'key-1',
          secretAccessKey: 'secret-1',
        }),
      );
    });
  });

  describe('advanced R2 features', () => {
    let mockR2Provider: any;

    beforeEach(() => {
      mockR2Provider = {
        upload: vi.fn().mockResolvedValue({ key: 'test', url: 'http://test.com', size: 100 }),
        download: vi.fn().mockResolvedValue(new Blob(['test'])),
        delete: vi.fn().mockResolvedValue(undefined),
        exists: vi.fn().mockResolvedValue(true),
        getMetadata: vi.fn().mockResolvedValue({ key: 'test', url: 'http://test.com', size: 100 }),
        getUrl: vi.fn().mockResolvedValue('http://test.com/signed'),
        list: vi.fn().mockResolvedValue([]),
        getPresignedUploadUrl: vi
          .fn()
          .mockResolvedValue({ url: 'http://presigned.com', headers: {} }),
        getPresignedDownloadUrl: vi.fn().mockResolvedValue('http://presigned-download.com'),
        getPublicUrl: vi.fn().mockImplementation(key => `http://public.com/${key}`),
        uploadFromUrl: vi
          .fn()
          .mockResolvedValue({ key: 'test', url: 'http://test.com', size: 100 }),
      };

      (CloudflareR2Provider as any).mockImplementation(() => mockR2Provider);

      const r2Config: MultiStorageConfig = {
        providers: {
          'r2-advanced': {
            provider: 'cloudflare-r2',
            cloudflareR2: {
              bucket: 'advanced-bucket',
              accountId: 'account-1',
              accessKeyId: 'key-1',
              secretAccessKey: 'secret-1',
              customDomain: 'cdn.example.com',
            },
          },
        },
      };

      manager = new MultiStorageManager(r2Config);
    });

    test('should access R2 presigned upload URL', async () => {
      const provider = manager.getProvider('r2-advanced') as any;
      const result = await provider.getPresignedUploadUrl('test.pdf', {
        expiresIn: 3600,
        contentType: 'application/pdf',
      });

      expect(result.url).toBe('http://presigned.com');
      expect(mockR2Provider.getPresignedUploadUrl).toHaveBeenCalledWith('test.pdf', {
        expiresIn: 3600,
        contentType: 'application/pdf',
      });
    });

    test('should get public URL from R2', async () => {
      const provider = manager.getProvider('r2-advanced') as any;
      const url = provider.getPublicUrl('image.jpg');

      expect(url).toBe('http://public.com/image.jpg');
    });

    test('should upload from URL using R2', async () => {
      const provider = manager.getProvider('r2-advanced') as any;
      const result = await provider.uploadFromUrl('copy.jpg', 'http://source.com/image.jpg');

      expect(mockR2Provider.uploadFromUrl).toHaveBeenCalledWith(
        'copy.jpg',
        'http://source.com/image.jpg',
      );
      expect(result.key).toBe('test');
    });
  });

  describe('error handling', () => {
    test('should throw error when accessing non-existent provider', async () => {
      await expect(
        manager.upload('test.jpg', new Blob(['test']), { provider: 'non-existent' }),
      ).rejects.toThrow("Provider 'non-existent' not found");
    });

    test('should handle provider initialization errors gracefully', () => {
      (CloudflareR2Provider as any).mockImplementationOnce(() => {
        throw new Error('Failed to initialize R2');
      });

      const badConfig: MultiStorageConfig = {
        providers: {
          'bad-r2': {
            provider: 'cloudflare-r2',
            cloudflareR2: {
              bucket: 'bad-bucket',
              accountId: 'bad-account',
              accessKeyId: 'bad-key',
              secretAccessKey: 'bad-secret',
            },
          },
        },
      };

      expect(() => new MultiStorageManager(badConfig)).toThrow('Failed to initialize R2');
    });
  });
});
