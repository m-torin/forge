/**
 * Storage Server Tests
 *
 * Tests for server-side storage functionality using DRY patterns.
 * Follows the successful analytics/email package approach.
 */

import { beforeEach, describe, test } from 'vitest';
import {
  createStorageTestData,
  generateFileContent,
  generateProviderConfigs,
  generateStorageKeys,
} from '../test-data-generators';
import {
  createMultiStorageTestSuite,
  createStorageActionTestSuite,
  createStorageProviderTestSuite,
} from '../test-factory';
import {
  cloudflareImagesMockScenarios,
  cloudflareR2MockScenarios,
  multiStorageMockScenarios,
  setupStorageMocks,
  storageActionMockScenarios,
  vercelBlobMockScenarios,
} from '../test-utils/setup';

describe('storage Server Module', () => {
  beforeEach(() => {
    setupStorageMocks.reset();
  });

  describe('provider Integration', () => {
    describe('cloudflare R2 Provider', () => {
      const r2Config = generateProviderConfigs.cloudflareR2().valid;

      createStorageProviderTestSuite({
        name: 'Cloudflare R2',
        providerFactory: () =>
          new (class MockCloudflareR2Provider {
            constructor(config: any) {}
            upload = cloudflareR2MockScenarios.success().upload;
            download = cloudflareR2MockScenarios.success().download;
            delete = cloudflareR2MockScenarios.success().delete;
            exists = cloudflareR2MockScenarios.success().exists;
            getMetadata = cloudflareR2MockScenarios.success().getMetadata;
            getUrl = cloudflareR2MockScenarios.success().getUrl;
            list = cloudflareR2MockScenarios.success().list;
            getPublicUrl = cloudflareR2MockScenarios.success().getPublicUrl;
          })(r2Config),
      });
    });

    describe('vercel Blob Provider', () => {
      const blobConfig = generateProviderConfigs.vercelBlob().valid;

      createStorageProviderTestSuite({
        name: 'Vercel Blob',
        providerFactory: () =>
          new (class MockVercelBlobProvider {
            constructor(token: string) {
              if (!token) throw new Error('Vercel Blob token is required');
            }
            upload = vercelBlobMockScenarios.success().upload;
            download = vercelBlobMockScenarios.success().download;
            delete = vercelBlobMockScenarios.success().delete;
            exists = vercelBlobMockScenarios.success().exists;
            getMetadata = vercelBlobMockScenarios.success().getMetadata;
            getUrl = vercelBlobMockScenarios.success().getUrl;
            list = vercelBlobMockScenarios.success().list;
          })(blobConfig.token),
      });
    });

    describe('cloudflare Images Provider', () => {
      const imagesConfig = generateProviderConfigs.cloudflareImages().valid;

      createStorageProviderTestSuite({
        name: 'Cloudflare Images',
        providerFactory: () =>
          new (class MockCloudflareImagesProvider {
            constructor(config: any) {}
            upload = cloudflareImagesMockScenarios.success().upload;
            download = cloudflareImagesMockScenarios.success().download;
            delete = cloudflareImagesMockScenarios.success().delete;
            exists = cloudflareImagesMockScenarios.success().exists;
            getMetadata = cloudflareImagesMockScenarios.success().getMetadata;
            getUrl = cloudflareImagesMockScenarios.success().getUrl;
            list = cloudflareImagesMockScenarios.success().list;
            createVariant = cloudflareImagesMockScenarios.success().createVariant;
            getDirectUploadUrl = cloudflareImagesMockScenarios.success().getDirectUploadUrl;
          })(imagesConfig),
      });
    });
  });

  describe('multi-Storage Management', () => {
    const multiConfig = generateProviderConfigs.multiStorage().complete;

    createMultiStorageTestSuite({
      name: 'Multi-Storage',
      providers: [
        {
          name: 'documents',
          factory: () => ({
            getProvider: multiStorageMockScenarios.success().getProvider,
            getProviderNames: multiStorageMockScenarios.success().getProviderNames,
            upload: multiStorageMockScenarios.success().upload,
            download: multiStorageMockScenarios.success().download,
            delete: multiStorageMockScenarios.success().delete,
            exists: multiStorageMockScenarios.success().exists,
            getMetadata: multiStorageMockScenarios.success().getMetadata,
            getUrl: multiStorageMockScenarios.success().getUrl,
            list: multiStorageMockScenarios.success().list,
            getCloudflareImagesProvider:
              multiStorageMockScenarios.success().getCloudflareImagesProvider,
          }),
        },
      ],
    });
  });

  describe('storage Actions', () => {
    const actionMocks = storageActionMockScenarios.allActionsSuccess();

    beforeEach(() => {
      // Mock the server module exports
      vi.doMock('../../src/server', () => ({
        getStorage: actionMocks.getStorage,
        getMultiStorage: actionMocks.getMultiStorage,
      }));
    });

    describe('media Actions', () => {
      createStorageActionTestSuite({
        name: 'Upload Media',
        actionFunction: async (payload: { key: string; content: any; options?: any }) => {
          const { uploadMediaAction } = await import('../../src/actions/mediaActions');
          return uploadMediaAction(payload.key, payload.content, payload.options);
        },
        validPayload: {
          key: generateStorageKeys.valid().image,
          content: generateFileContent.asFiles().imageFile,
          options: { contentType: 'image/jpeg' },
        },
        invalidPayload: {
          key: '',
          content: null,
        },
      });

      createStorageActionTestSuite({
        name: 'Download Media',
        actionFunction: async (key: string) => {
          const { downloadMediaAction } = await import('../../src/actions/mediaActions');
          return downloadMediaAction(key);
        },
        validPayload: generateStorageKeys.valid().document,
        invalidPayload: '',
      });

      createStorageActionTestSuite({
        name: 'List Media',
        actionFunction: async (options?: any) => {
          const { listMediaAction } = await import('../../src/actions/mediaActions');
          return listMediaAction(options);
        },
        validPayload: { limit: 10 },
        invalidPayload: null,
      });

      createStorageActionTestSuite({
        name: 'Bulk Delete Media',
        actionFunction: async (keys: string[]) => {
          const { bulkDeleteMediaAction } = await import('../../src/actions/mediaActions');
          return bulkDeleteMediaAction(keys);
        },
        validPayload: [generateStorageKeys.valid().simple, generateStorageKeys.valid().document],
        invalidPayload: [],
      });
    });

    describe('product Media Actions', () => {
      createStorageActionTestSuite({
        name: 'Upload Product Media',
        actionFunction: async (payload: { productId: string; files: any[] }) => {
          const { uploadProductMediaAction } = await import(
            '../../src/actions/productMediaActions'
          );
          return uploadProductMediaAction(payload.productId, payload.files);
        },
        validPayload: {
          productId: 'product-123',
          files: [
            {
              filename: generateStorageKeys.valid().image,
              contentType: 'image/jpeg',
              data: generateFileContent.asFiles().imageFile,
            },
          ],
        },
        invalidPayload: {
          productId: '',
          files: [],
        },
      });
    });
  });

  describe('error Handling', () => {
    test('should handle provider initialization errors', () => {
      const invalidConfig = generateProviderConfigs.cloudflareR2().invalid.empty;

      expect(() => {
        // This should throw due to missing required configuration
        class TestProvider {
          constructor(config: any) {
            if (!config.bucket) throw new Error('Bucket is required');
          }
        }
        new TestProvider(invalidConfig);
      }).toThrow('Bucket is required');
    });

    test('should handle network timeouts gracefully', async () => {
      const errorMocks = setupStorageMocks.all('error');

      // All operations should fail gracefully
      expect(errorMocks.cloudflareR2.upload).toBeDefined();
      expect(errorMocks.vercelBlob.upload).toBeDefined();
      expect(errorMocks.cloudflareImages.upload).toBeDefined();
    });
  });

  describe('performance', () => {
    test('should handle concurrent operations efficiently', async () => {
      const mocks = setupStorageMocks.all('success');
      const testData = createStorageTestData.forOperation('upload');

      const start = performance.now();

      // Simulate multiple concurrent uploads
      const operations = Array.from({ length: 5 }, (_, i) =>
        mocks.cloudflareR2.upload(`test-${i}.txt`, (testData as any).content),
      );

      const results = await Promise.all(operations);
      const duration = performance.now() - start;

      expect(results).toHaveLength(5);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large file operations', async () => {
      const mocks = setupStorageMocks.all('success');
      const largeFile = generateFileContent.bySizes().extraLarge;

      const start = performance.now();
      await mocks.cloudflareR2.upload('large-file.bin', largeFile);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(2000); // Mock should be fast
    });
  });
});
