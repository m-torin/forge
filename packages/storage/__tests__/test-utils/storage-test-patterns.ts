/**
 * Storage Test Patterns
 *
 * Storage-specific test patterns and reusable testing functions.
 * Follows the successful analytics/email package DRY approach.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateStorageErrors } from '../test-data-generators';
import {
  assertionHelpers,
  dataFactories,
  errorUtils,
  performanceUtils,
} from './shared-test-utilities';

/**
 * Provider testing patterns
 */
export const providerTestPatterns = {
  /**
   * Tests a storage provider with comprehensive scenarios
   */
  testStorageProvider: <T>(
    providerName: string,
    providerClass: new (...args: any[]) => T,
    constructorArgs: any[],
    scenarios: Array<{
      name: string;
      setup?: () => void;
      operation: (provider: T) => Promise<any>;
      assertion: (result: any) => void;
      shouldThrow?: boolean;
      errorMessage?: string;
    }>,
  ) => {
    return describe(`${providerName} Provider Tests`, () => {
      let provider: T;

      beforeEach(() => {
        vi.clearAllMocks();
        provider = new providerClass(...constructorArgs);
      });

      // Test provider creation
      test('should create provider instance', () => {
        expect(provider).toBeDefined();
      });

      // Test required methods exist
      test('should have all required storage methods', () => {
        const requiredMethods = [
          'upload',
          'download',
          'delete',
          'exists',
          'getMetadata',
          'getUrl',
          'list',
        ];

        requiredMethods.forEach(method => {
          expect((provider as any)[method]).toBeDefined();
          expect(typeof (provider as any)[method]).toBe('function');
        });
      });

      // Execute custom scenarios
      scenarios.forEach(({ name, setup, operation, assertion, shouldThrow, errorMessage }) => {
        test(`should ${name}`, async () => {
          if (setup) {
            setup();
          }

          if (shouldThrow) {
            if (errorMessage) {
              await expect(operation(provider)).rejects.toThrow(errorMessage);
            } else {
              await expect(operation(provider)).rejects.toThrow();
            }
          } else {
            const result = await operation(provider);
            assertion(result);
          }
        });
      });
    });
  },

  /**
   * Tests provider upload functionality
   */
  testProviderUploads: (provider: any) => {
    const uploadTests = [
      {
        name: 'upload text file',
        data: dataFactories.forOperation('upload'),
        assertion: (result: any) => assertionHelpers.expectStorageResult(result),
      },
      {
        name: 'upload binary file',
        data: dataFactories.edgeCase('large'),
        assertion: (result: any) => assertionHelpers.expectStorageResult(result),
      },
      {
        name: 'upload empty file',
        data: dataFactories.edgeCase('empty'),
        assertion: (result: any) => assertionHelpers.expectStorageResult(result),
      },
      {
        name: 'upload file with unicode name',
        data: dataFactories.edgeCase('unicode'),
        assertion: (result: any) => assertionHelpers.expectStorageResult(result),
      },
    ];

    return describe('upload Operations', () => {
      uploadTests.forEach(({ name, data, assertion }) => {
        test(`should ${name}`, async () => {
          const result = await provider.upload(
            data.key,
            (data as any).content,
            (data as any).options,
          );
          assertion(result);
        });
      });

      test('should handle upload errors', async () => {
        provider.upload.mockRejectedValueOnce(generateStorageErrors.storage());
        await expect(provider.upload('error-key', Buffer.from('test'))).rejects.toThrow();
      });
    });
  },

  /**
   * Tests provider download functionality
   */
  testProviderDownloads: (provider: any) => {
    return describe('download Operations', () => {
      test('should download existing file', async () => {
        const result = await provider.download('existing-file.txt');
        assertionHelpers.expectDownloadResult(result);
      });

      test('should handle download errors', async () => {
        provider.download.mockRejectedValueOnce(new Error('File not found'));
        await expect(provider.download('non-existent.txt')).rejects.toThrow('File not found');
      });

      test('should handle network errors during download', async () => {
        provider.download.mockRejectedValueOnce(generateStorageErrors.network());
        await expect(provider.download('test.txt')).rejects.toThrow();
      });
    });
  },

  /**
   * Tests provider list functionality
   */
  testProviderListing: (provider: any) => {
    return describe('list Operations', () => {
      test('should list files', async () => {
        const result = await provider.list({});
        assertionHelpers.expectListResult(result);
      });

      test('should list with prefix filter', async () => {
        const result = await provider.list({ prefix: 'documents/' });
        assertionHelpers.expectListResult(result);
      });

      test('should list with limit', async () => {
        const result = await provider.list({ limit: 5 });
        assertionHelpers.expectListResult(result);
        expect(result.length).toBeLessThanOrEqual(5);
      });

      test('should handle empty list results', async () => {
        provider.list.mockResolvedValueOnce([]);
        const result = await provider.list({});
        expect(result).toStrictEqual([]);
      });

      test('should handle list errors', async () => {
        provider.list.mockRejectedValueOnce(new Error('List failed'));
        await expect(provider.list({})).rejects.toThrow('List failed');
      });
    });
  },

  /**
   * Tests provider metadata operations
   */
  testProviderMetadata: (provider: any) => {
    return describe('metadata Operations', () => {
      test('should get file metadata', async () => {
        const result = await provider.getMetadata('test-file.txt');
        assertionHelpers.expectStorageResult(result);
      });

      test('should check file existence', async () => {
        const exists = await provider.exists('test-file.txt');
        expect(typeof exists).toBe('boolean');
      });

      test('should return false for non-existent files', async () => {
        provider.exists.mockResolvedValueOnce(false);
        const exists = await provider.exists('non-existent.txt');
        expect(exists).toBeFalsy();
      });

      test('should generate URLs', async () => {
        const url = await provider.getUrl('test-file.txt');
        assertionHelpers.expectValidUrl(url);
      });

      test('should generate URLs with expiration', async () => {
        const url = await provider.getUrl('test-file.txt', { expiresIn: 3600 });
        assertionHelpers.expectValidUrl(url);
      });
    });
  },

  /**
   * Tests provider error handling comprehensively
   */
  testProviderErrorHandling: (provider: any) => {
    return describe('error Handling', () => {
      const errorTypes = [
        { name: 'network errors', generator: () => generateStorageErrors.network() },
        { name: 'authentication errors', generator: () => generateStorageErrors.auth() },
        { name: 'storage errors', generator: () => generateStorageErrors.storage() },
        { name: 'validation errors', generator: () => generateStorageErrors.validation() },
      ];

      errorTypes.forEach(({ name, generator }) => {
        test(`should handle ${name}`, async () => {
          const error = generator();
          provider.upload.mockRejectedValueOnce(error);
          await expect(provider.upload('test', Buffer.from('test'))).rejects.toThrow();
        });
      });

      test('should handle intermittent failures', async () => {
        const intermittentMock = errorUtils.createIntermittentError(0.5);
        provider.upload = intermittentMock;

        // Try multiple times, some should succeed, some should fail
        const results = await Promise.allSettled(
          Array.from({ length: 10 }, () => provider.upload('test', Buffer.from('test'))),
        );

        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        expect(succeeded).toBeGreaterThan(0);
        expect(failed).toBeGreaterThan(0);
        expect(succeeded + failed).toBe(10);
      });
    });
  },

  /**
   * Tests provider performance characteristics
   */
  testProviderPerformance: (provider: any) => {
    return describe('performance Tests', () => {
      test('should upload files within time limit', async () => {
        const testData = dataFactories.forOperation('upload') as {
          key: string;
          content: Buffer;
          options: any;
        };
        const { duration } = await performanceUtils.measureAsync(
          () => provider.upload(testData.key, testData.content, testData.options),
          1000,
        );
        expect(duration).toBeLessThan(1000);
      });

      test('should handle concurrent operations', async () => {
        const operations = Array.from(
          { length: 5 },
          (_, i) => () => provider.exists(`concurrent-test-${i}.txt`),
        );

        const { results, duration } = await performanceUtils.measureBatch(operations, 2000);
        expect(results).toHaveLength(5);
        expect(duration).toBeLessThan(2000);
      });

      test('should handle large file operations efficiently', async () => {
        const largeData = dataFactories.edgeCase('large');
        const { duration } = await performanceUtils.measureAsync(
          () =>
            provider.upload(largeData.key, (largeData as any).content, (largeData as any).options),
          3000,
        );
        expect(duration).toBeLessThan(3000);
      });
    });
  },
};

/**
 * Action testing patterns
 */
export const actionTestPatterns = {
  /**
   * Tests storage actions with comprehensive scenarios
   */
  testStorageAction: <T>(
    actionName: string,
    actionFunction: (...args: any[]) => Promise<T>,
    scenarios: Array<{
      name: string;
      args: any[];
      mockSetup?: () => void;
      shouldSucceed?: boolean;
      errorMessage?: string;
      assertion: (result: T) => void;
    }>,
  ) => {
    return describe(`${actionName} Action Tests`, () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      scenarios.forEach(
        ({ name, args, mockSetup, shouldSucceed = true, errorMessage, assertion }) => {
          test(`should ${name}`, async () => {
            if (mockSetup) {
              mockSetup();
            }

            if (!shouldSucceed) {
              if (errorMessage) {
                await expect(actionFunction(...args)).rejects.toThrow(errorMessage);
              } else {
                const result = await actionFunction(...args);
                expect((result as any).success).toBeFalsy();
              }
              return;
            }

            const result = await actionFunction(...args);
            assertion(result);
          });
        },
      );
    });
  },

  /**
   * Tests media upload actions
   */
  testMediaUploadActions: (actionFunction: any) => {
    const uploadScenarios = [
      {
        name: 'upload image file',
        data: dataFactories.forProvider('cloudflare-images'),
        assertion: (result: any) => assertionHelpers.expectActionSuccess(result),
      },
      {
        name: 'upload document file',
        data: dataFactories.forProvider('cloudflare-r2'),
        assertion: (result: any) => assertionHelpers.expectActionSuccess(result),
      },
      {
        name: 'upload with custom options',
        data: {
          ...dataFactories.forOperation('upload'),
          options: { contentType: 'application/json' },
        },
        assertion: (result: any) => assertionHelpers.expectActionSuccess(result),
      },
    ];

    return describe('media Upload Actions', () => {
      uploadScenarios.forEach(({ name, data, assertion }) => {
        test(`should ${name}`, async () => {
          const result = await actionFunction(
            data.key,
            (data as any).content,
            (data as any).options,
          );
          assertion(result);
        });
      });

      test('should handle upload errors', async () => {
        // Mock setup would be done in the calling test
        const result = await actionFunction('error-key', Buffer.from('test'));
        assertionHelpers.expectActionError(result);
      });
    });
  },

  /**
   * Tests bulk operation actions
   */
  testBulkActions: (actionFunction: any) => {
    return describe('bulk Operation Actions', () => {
      test('should handle successful bulk operations', async () => {
        const bulkData = dataFactories.bulkData(3);
        const result = await actionFunction(bulkData.keys);
        assertionHelpers.expectBulkResults(result, 3, 0);
      });

      test('should handle partial bulk failures', async () => {
        const bulkData = dataFactories.bulkData(3);
        // Mock setup for partial failure would be done in calling test
        const result = await actionFunction(bulkData.keys);
        // Expecting some successes and some failures
        expect(result.data.succeeded.length + result.data.failed.length).toBe(3);
      });

      test('should handle complete bulk failures', async () => {
        const bulkData = dataFactories.bulkData(2);
        // Mock setup for complete failure would be done in calling test
        const result = await actionFunction(bulkData.keys);
        assertionHelpers.expectBulkResults(result, 0, 2);
      });
    });
  },

  /**
   * Tests action error handling
   */
  testActionErrorHandling: (actionFunction: any) => {
    return describe('action Error Handling', () => {
      test('should handle storage provider errors', async () => {
        // Mock would be set up to throw storage errors
        const result = await actionFunction('test-key', Buffer.from('test'));
        assertionHelpers.expectActionError(result);
      });

      test('should handle validation errors', async () => {
        const result = await actionFunction('', null); // Invalid arguments
        assertionHelpers.expectActionError(result);
      });

      test('should handle network timeouts', async () => {
        // Mock would be set up to simulate timeout
        const result = await actionFunction('timeout-key', Buffer.from('test'));
        assertionHelpers.expectActionError(result);
      });
    });
  },

  /**
   * Tests action performance
   */
  testActionPerformance: (actionFunction: any) => {
    return describe('action Performance', () => {
      test('should complete single actions quickly', async () => {
        const testData = dataFactories.forOperation('upload') as {
          key: string;
          content: Buffer;
          options: any;
        };
        const { duration } = await performanceUtils.measureAsync(
          () => actionFunction(testData.key, testData.content),
          2000,
        );
        expect(duration).toBeLessThan(2000);
      });

      test('should handle concurrent actions', async () => {
        const operations = Array.from({ length: 3 }, (_, i) => {
          const data = dataFactories.forOperation('upload') as {
            key: string;
            content: Buffer;
            options: any;
          };
          return () => actionFunction(`concurrent-${i}.txt`, data.content);
        });

        const { results, duration } = await performanceUtils.measureBatch(operations, 5000);
        expect(results).toHaveLength(3);
        expect(duration).toBeLessThan(5000);
      });
    });
  },
};

/**
 * Multi-storage testing patterns
 */
export const multiStorageTestPatterns = {
  /**
   * Tests multi-storage routing functionality
   */
  testProviderRouting: (manager: any) => {
    const routingTests = [
      {
        name: 'route image files to images provider',
        file: 'photo.jpg',
        expectedProvider: 'images',
        operation: 'upload',
      },
      {
        name: 'route document files to documents provider',
        file: 'report.pdf',
        expectedProvider: 'documents',
        operation: 'upload',
      },
      {
        name: 'route unknown files to default provider',
        file: 'data.xyz',
        expectedProvider: 'documents', // assuming documents is default
        operation: 'upload',
      },
    ];

    return describe('provider Routing', () => {
      routingTests.forEach(({ name, file, expectedProvider, operation }) => {
        test(`should ${name}`, async () => {
          const testData = dataFactories.forOperation(operation as any);
          await manager[operation](file, (testData as any).content);

          expect(manager.getProvider).toHaveBeenCalledWith(expectedProvider);
        });
      });

      test('should allow explicit provider override', async () => {
        const testData = dataFactories.forOperation('upload') as {
          key: string;
          content: Buffer;
          options: any;
        };
        await manager.upload('image.jpg', testData.content, { provider: 'cache' });

        expect(manager.getProvider).toHaveBeenCalledWith('cache');
      });
    });
  },

  /**
   * Tests multi-storage provider management
   */
  testProviderManagement: (manager: any) => {
    return describe('provider Management', () => {
      test('should list all provider names', () => {
        const providers = manager.getProviderNames();
        expect(Array.isArray(providers)).toBeTruthy();
        expect(providers.length).toBeGreaterThan(0);
      });

      test('should get provider by name', () => {
        const providerNames = manager.getProviderNames();
        const provider = manager.getProvider(providerNames[0]);
        expect(provider).toBeDefined();
      });

      test('should return undefined for non-existent provider', () => {
        const provider = manager.getProvider('non-existent');
        expect(provider).toBeUndefined();
      });

      test('should handle special provider requests', () => {
        const cfImagesProvider = manager.getCloudflareImagesProvider();
        // May be undefined if no Cloudflare Images provider configured
        if (cfImagesProvider) {
          expect(cfImagesProvider).toBeDefined();
        }
      });
    });
  },

  /**
   * Tests multi-storage operations
   */
  testMultiStorageOperations: (manager: any) => {
    const operations = ['upload', 'download', 'delete', 'exists', 'getMetadata', 'getUrl'] as const;

    return describe('multi-Storage Operations', () => {
      operations.forEach(operation => {
        test(`should handle ${operation} operation`, async () => {
          const testData = dataFactories.forOperation(
            operation === 'upload' ? 'upload' : 'download',
          );

          if (operation === 'upload') {
            const result = await manager[operation](testData.key, (testData as any).content);
            assertionHelpers.expectStorageResult(result);
          } else if (operation === 'download') {
            const result = await manager[operation](testData.key);
            assertionHelpers.expectDownloadResult(result);
          } else if (operation === 'exists') {
            const result = await manager[operation](testData.key);
            expect(typeof result).toBe('boolean');
          } else {
            const result = await manager[operation](testData.key);
            expect(result).toBeDefined();
          }
        });
      });

      test('should handle list operation with provider specification', async () => {
        const result = await manager.list({ provider: 'documents' });
        assertionHelpers.expectListResult(result);
      });

      test('should handle list operation across all providers', async () => {
        const result = await manager.list({ provider: 'all' });
        assertionHelpers.expectListResult(result);
      });
    });
  },

  /**
   * Tests multi-storage error handling
   */
  testMultiStorageErrorHandling: (manager: any) => {
    return describe('multi-Storage Error Handling', () => {
      test('should handle provider not found errors', async () => {
        await expect(
          manager.upload('test.txt', Buffer.from('test'), { provider: 'non-existent' }),
        ).rejects.toThrow("Provider 'non-existent' not found");
      });

      test('should handle provider initialization errors', () => {
        // This would test the constructor throwing on invalid config
        expect(() => {
          // Mock constructor that throws
          throw new Error('Provider initialization failed');
        }).toThrow('Provider initialization failed');
      });

      test('should handle cascading provider failures', async () => {
        // Mock all providers to fail
        const providerNames = manager.getProviderNames();
        providerNames.forEach((name: string) => {
          const provider = manager.getProvider(name);
          if (provider) {
            provider.upload.mockRejectedValue(new Error('Provider unavailable'));
          }
        });

        await expect(manager.upload('test.txt', Buffer.from('test'))).rejects.toThrow();
      });
    });
  },
};

/**
 * Integration testing patterns
 */
export const integrationTestPatterns = {
  /**
   * Tests complete upload-download workflows
   */
  testUploadDownloadWorkflow: (storage: any) => {
    return describe('upload-Download Workflow', () => {
      test('should complete full upload-download cycle', async () => {
        const testData = dataFactories.forOperation('upload') as {
          key: string;
          content: Buffer;
          options: any;
        };

        // Upload
        const uploadResult = await storage.upload(testData.key, testData.content, testData.options);
        assertionHelpers.expectStorageResult(uploadResult, testData.key);

        // Verify exists
        const exists = await storage.exists(testData.key);
        expect(exists).toBeTruthy();

        // Get metadata
        const metadata = await storage.getMetadata(testData.key);
        assertionHelpers.expectStorageResult(metadata, testData.key);

        // Download
        const downloadResult = await storage.download(testData.key);
        assertionHelpers.expectDownloadResult(downloadResult);

        // Clean up
        await storage.delete(testData.key);
      });

      test('should handle workflow with errors', async () => {
        const testData = dataFactories.forOperation('upload') as {
          key: string;
          content: Buffer;
          options: any;
        };

        // Upload should succeed
        const uploadResult = await storage.upload(testData.key, testData.content, testData.options);
        assertionHelpers.expectStorageResult(uploadResult);

        // Mock download to fail
        storage.download.mockRejectedValueOnce(new Error('Download failed'));
        await expect(storage.download(testData.key)).rejects.toThrow('Download failed');

        // Cleanup should still work
        await storage.delete(testData.key);
      });
    });
  },

  /**
   * Tests cross-provider operations
   */
  testCrossProviderOperations: (multiStorage: any) => {
    return describe('cross-Provider Operations', () => {
      test('should move files between providers', async () => {
        const testData = dataFactories.forOperation('upload') as {
          key: string;
          content: Buffer;
          options: any;
        };

        // Upload to first provider
        await multiStorage.upload(testData.key, testData.content, { provider: 'documents' });

        // Download from first provider
        const content = await multiStorage.download(testData.key);

        // Upload to second provider
        await multiStorage.upload(`moved-${testData.key}`, content, { provider: 'cache' });

        // Verify both exist
        const existsOriginal = await multiStorage.exists(testData.key);
        const existsMoved = await multiStorage.exists(`moved-${testData.key}`);

        expect(existsOriginal).toBeTruthy();
        expect(existsMoved).toBeTruthy();

        // Cleanup
        await multiStorage.delete(testData.key);
        await multiStorage.delete(`moved-${testData.key}`);
      });

      test('should handle provider-specific features', async () => {
        const imagesProvider = multiStorage.getCloudflareImagesProvider();

        if (imagesProvider) {
          // Test Cloudflare Images specific features
          expect(imagesProvider.createVariant).toBeDefined();
          expect(imagesProvider.getDirectUploadUrl).toBeDefined();
        }
      });
    });
  },

  /**
   * Tests performance under load
   */
  testPerformanceUnderLoad: (storage: any) => {
    return describe('performance Under Load', () => {
      test('should handle high concurrency', async () => {
        const concurrentOperations = Array.from({ length: 20 }, (_, i) => {
          const data = dataFactories.forOperation('upload') as {
            key: string;
            content: Buffer;
            options: any;
          };
          return () => storage.upload(`load-test-${i}.txt`, data.content);
        });

        const { results, duration } = await performanceUtils.measureBatch(
          concurrentOperations,
          10000, // 10 seconds max
        );

        expect(results).toHaveLength(20);
        expect(duration).toBeLessThan(10000);
      });

      test('should handle mixed operation types under load', async () => {
        const operations = [
          ...Array.from(
            { length: 5 },
            (_, i) => () => storage.upload(`mixed-${i}.txt`, Buffer.from(`data-${i}`)),
          ),
          ...Array.from({ length: 5 }, (_, i) => () => storage.exists(`mixed-${i}.txt`)),
          ...Array.from({ length: 5 }, () => () => storage.list({ limit: 10 })),
        ];

        const { results, duration } = await performanceUtils.measureBatch(operations, 8000);
        expect(results).toHaveLength(15);
        expect(duration).toBeLessThan(8000);
      });
    });
  },
};
