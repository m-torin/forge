/**
 * Storage Test Setup and Mock Management
 *
 * Centralized test setup and mock management for all storage functionality.
 * Integrates with @repo/qa centralized mocks and provides storage-specific scenarios.
 * Follows the successful email package DRY pattern.
 */

import { vi } from 'vitest';
import {
  generateFileContent,
  generateStorageErrors,
  generateStorageResults,
} from '../test-data-generators';

// Import centralized mocks from @repo/qa
import '@repo/qa/vitest/setup/node-package';

/**
 * Storage provider mock scenarios
 */
export const storageProviderMockScenarios = {
  /**
   * Success scenario - all operations succeed
   */
  allSuccess: () => ({
    upload: vi.fn().mockResolvedValue(generateStorageResults.upload()),
    download: vi.fn().mockResolvedValue(generateFileContent.asBlobs().textBlob),
    delete: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(true),
    getMetadata: vi.fn().mockResolvedValue(generateStorageResults.metadata()),
    getUrl: vi.fn().mockResolvedValue('https://example.com/signed-url'),
    list: vi.fn().mockResolvedValue(generateStorageResults.list(3)),
  }),

  /**
   * Partial success scenario - some operations fail
   */
  partialSuccess: () => ({
    upload: vi.fn().mockResolvedValue(generateStorageResults.upload()),
    download: vi.fn().mockResolvedValue(generateFileContent.asBlobs().textBlob),
    delete: vi.fn().mockRejectedValue(generateStorageErrors.storage()),
    exists: vi.fn().mockResolvedValue(true),
    getMetadata: vi.fn().mockResolvedValue(generateStorageResults.metadata()),
    getUrl: vi.fn().mockResolvedValue('https://example.com/signed-url'),
    list: vi.fn().mockResolvedValue(generateStorageResults.list(1)),
  }),

  /**
   * Network error scenario - all operations fail with network errors
   */
  networkError: () => {
    const networkError = generateStorageErrors.network();
    return {
      upload: vi.fn().mockRejectedValue(networkError),
      download: vi.fn().mockRejectedValue(networkError),
      delete: vi.fn().mockRejectedValue(networkError),
      exists: vi.fn().mockRejectedValue(networkError),
      getMetadata: vi.fn().mockRejectedValue(networkError),
      getUrl: vi.fn().mockRejectedValue(networkError),
      list: vi.fn().mockRejectedValue(networkError),
    };
  },

  /**
   * Authentication error scenario
   */
  authError: () => {
    const authError = generateStorageErrors.auth();
    return {
      upload: vi.fn().mockRejectedValue(authError),
      download: vi.fn().mockRejectedValue(authError),
      delete: vi.fn().mockRejectedValue(authError),
      exists: vi.fn().mockRejectedValue(authError),
      getMetadata: vi.fn().mockRejectedValue(authError),
      getUrl: vi.fn().mockRejectedValue(authError),
      list: vi.fn().mockRejectedValue(authError),
    };
  },

  /**
   * File not found scenario
   */
  fileNotFound: () => ({
    upload: vi.fn().mockResolvedValue(generateStorageResults.upload()),
    download: vi.fn().mockRejectedValue(new Error('File not found')),
    delete: vi.fn().mockRejectedValue(new Error('File not found')),
    exists: vi.fn().mockResolvedValue(false),
    getMetadata: vi.fn().mockRejectedValue(new Error('File not found')),
    getUrl: vi.fn().mockRejectedValue(new Error('File not found')),
    list: vi.fn().mockResolvedValue([]),
  }),

  /**
   * Custom scenario builder
   */
  custom: (overrides: Record<string, any>) => ({
    upload: vi.fn().mockResolvedValue(generateStorageResults.upload()),
    download: vi.fn().mockResolvedValue(generateFileContent.asBlobs().textBlob),
    delete: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(true),
    getMetadata: vi.fn().mockResolvedValue(generateStorageResults.metadata()),
    getUrl: vi.fn().mockResolvedValue('https://example.com/signed-url'),
    list: vi.fn().mockResolvedValue(generateStorageResults.list(3)),
    ...overrides,
  }),
};

/**
 * Cloudflare R2 provider specific mocks
 */
export const cloudflareR2MockScenarios = {
  /**
   * Standard R2 success scenario
   */
  success: () => ({
    ...storageProviderMockScenarios.allSuccess(),
    getPublicUrl: vi
      .fn()
      .mockImplementation((key: string) => `https://pub-test-bucket.r2.dev/${key}`),
    getPresignedUploadUrl: vi.fn().mockResolvedValue({
      url: 'https://test-bucket.r2.cloudflarestorage.com/presigned-upload',
      headers: { 'Content-Type': 'text/plain' },
    }),
    getPresignedDownloadUrl: vi
      .fn()
      .mockResolvedValue('https://test-bucket.r2.cloudflarestorage.com/presigned-download'),
    uploadFromUrl: vi.fn().mockResolvedValue(generateStorageResults.upload()),
  }),

  /**
   * R2 with custom domain
   */
  withCustomDomain: () => ({
    ...storageProviderMockScenarios.allSuccess(),
    getPublicUrl: vi.fn().mockImplementation((key: string) => `https://cdn.example.com/${key}`),
  }),

  /**
   * R2 API error scenario
   */
  apiError: () => ({
    ...storageProviderMockScenarios.networkError(),
    getPublicUrl: vi
      .fn()
      .mockImplementation((key: string) => `https://pub-test-bucket.r2.dev/${key}`),
    getPresignedUploadUrl: vi.fn().mockRejectedValue(generateStorageErrors.provider.cloudflareR2()),
    getPresignedDownloadUrl: vi
      .fn()
      .mockRejectedValue(generateStorageErrors.provider.cloudflareR2()),
    uploadFromUrl: vi.fn().mockRejectedValue(generateStorageErrors.provider.cloudflareR2()),
  }),
};

/**
 * Vercel Blob provider specific mocks
 */
export const vercelBlobMockScenarios = {
  /**
   * Standard Vercel Blob success scenario
   */
  success: () => {
    const mockPut = vi.fn().mockResolvedValue({
      pathname: 'test-key',
      url: 'https://blob.vercel.com/test-key',
    });
    const mockHead = vi.fn().mockResolvedValue({
      contentType: 'text/plain',
      size: 1024,
      uploadedAt: '2023-01-01T00:00:00Z',
    });
    const mockDel = vi.fn().mockResolvedValue(undefined);
    const mockList = vi.fn().mockResolvedValue({
      blobs: generateStorageResults.list(3).map((item: any) => ({
        pathname: item.key,
        url: item.url,
        size: item.size,
        uploadedAt: '2023-01-01T00:00:00Z',
      })),
    });

    return {
      upload: vi.fn().mockImplementation(async (key: string, content: any, options: any) => {
        await mockPut(key, content, options);
        const metadata = await mockHead(key);
        return generateStorageResults.upload({
          key,
          size: metadata.size,
          contentType: metadata.contentType,
        });
      }),
      download: vi.fn().mockResolvedValue(generateFileContent.asBlobs().textBlob),
      delete: vi.fn().mockImplementation(async (key: string) => {
        await mockDel(key);
      }),
      exists: vi.fn().mockImplementation(async (key: string) => {
        try {
          await mockHead(key);
          return true;
        } catch {
          return false;
        }
      }),
      getMetadata: vi.fn().mockImplementation(async (key: string) => {
        const metadata = await mockHead(key);
        return generateStorageResults.metadata({
          key,
          size: metadata.size,
          contentType: metadata.contentType,
        });
      }),
      getUrl: vi.fn().mockImplementation(async (key: string) => {
        const metadata = await mockHead(key);
        return metadata.url || `https://blob.vercel.com/${key}`;
      }),
      list: vi.fn().mockImplementation(async (options: any) => {
        const result = await mockList(options);
        return result.blobs.map((blob: any) => ({
          key: blob.pathname,
          url: blob.url,
          size: blob.size,
          lastModified: new Date(blob.uploadedAt),
        }));
      }),
      // Expose mocks for direct testing
      _mocks: { put: mockPut, head: mockHead, del: mockDel, list: mockList },
    };
  },

  /**
   * Vercel Blob API error scenario
   */
  apiError: () => {
    const blobError = generateStorageErrors.provider.vercelBlob();
    return {
      ...storageProviderMockScenarios.networkError(),
      _mocks: {
        put: vi.fn().mockRejectedValue(blobError),
        head: vi.fn().mockRejectedValue(blobError),
        del: vi.fn().mockRejectedValue(blobError),
        list: vi.fn().mockRejectedValue(blobError),
      },
    };
  },

  /**
   * Token validation error
   */
  invalidToken: () => ({
    upload: vi.fn().mockRejectedValue(new Error('Vercel Blob token is required')),
    download: vi.fn().mockRejectedValue(new Error('Vercel Blob token is required')),
    delete: vi.fn().mockRejectedValue(new Error('Vercel Blob token is required')),
    exists: vi.fn().mockResolvedValue(false),
    getMetadata: vi.fn().mockRejectedValue(new Error('Vercel Blob token is required')),
    getUrl: vi.fn().mockRejectedValue(new Error('Vercel Blob token is required')),
    list: vi.fn().mockRejectedValue(new Error('Vercel Blob token is required')),
  }),
};

/**
 * Cloudflare Images provider specific mocks
 */
export const cloudflareImagesMockScenarios = {
  /**
   * Standard Cloudflare Images success scenario
   */
  success: () => ({
    ...storageProviderMockScenarios.allSuccess(),
    createVariant: vi.fn().mockResolvedValue({
      id: 'variant-id',
      options: { width: 100, height: 100 },
    }),
    getDirectUploadUrl: vi.fn().mockResolvedValue({
      uploadURL: 'https://upload.imagedelivery.net/direct-upload',
      id: 'upload-id-123',
    }),
    getImageUrl: vi
      .fn()
      .mockImplementation(
        (id: string, variant?: string) =>
          `https://imagedelivery.net/account-hash/${id}${variant ? `/${variant}` : '/public'}`,
      ),
  }),

  /**
   * Image processing error scenario
   */
  processingError: () => ({
    upload: vi.fn().mockRejectedValue(generateStorageErrors.provider.cloudflareImages()),
    download: vi.fn().mockResolvedValue(generateFileContent.asBlobs().imageBlob),
    delete: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(true),
    getMetadata: vi.fn().mockResolvedValue(generateStorageResults.metadata()),
    getUrl: vi.fn().mockResolvedValue('https://imagedelivery.net/account-hash/image-id/public'),
    list: vi.fn().mockResolvedValue(generateStorageResults.list(3)),
    createVariant: vi.fn().mockRejectedValue(new Error('Image processing failed')),
    getDirectUploadUrl: vi.fn().mockResolvedValue({
      uploadURL: 'https://upload.imagedelivery.net/direct-upload',
      id: 'upload-id-123',
    }),
  }),
};

/**
 * Multi-storage manager mock scenarios
 */
export const multiStorageMockScenarios = {
  /**
   * Standard multi-storage success scenario
   */
  success: () => {
    const providers = {
      documents: storageProviderMockScenarios.allSuccess(),
      images: cloudflareImagesMockScenarios.success(),
      cache: vercelBlobMockScenarios.success(),
    };

    return {
      getProvider: vi
        .fn()
        .mockImplementation((name: string) => providers[name as keyof typeof providers]),
      getProviderNames: vi.fn().mockReturnValue(Object.keys(providers)),
      upload: vi.fn().mockImplementation(async (key: string, content: any, options: any) => {
        // Route based on file extension or explicit provider
        const provider =
          options?.provider || (key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'images' : 'documents');
        return providers[provider as keyof typeof providers].upload(key, content, options);
      }),
      download: vi.fn().mockImplementation(async (key: string) => {
        const provider = key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'images' : 'documents';
        return providers[provider as keyof typeof providers].download(key);
      }),
      delete: vi.fn().mockImplementation(async (key: string) => {
        const provider = key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'images' : 'documents';
        return providers[provider as keyof typeof providers].delete(key);
      }),
      exists: vi.fn().mockImplementation(async (key: string) => {
        const provider = key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'images' : 'documents';
        return providers[provider as keyof typeof providers].exists(key);
      }),
      getMetadata: vi.fn().mockImplementation(async (key: string) => {
        const provider = key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'images' : 'documents';
        return providers[provider as keyof typeof providers].getMetadata(key);
      }),
      getUrl: vi.fn().mockImplementation(async (key: string, options: any) => {
        const provider = key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'images' : 'documents';
        return providers[provider as keyof typeof providers].getUrl(key, options);
      }),
      list: vi.fn().mockImplementation(async (options: any) => {
        const provider = options?.provider || 'documents';
        if (provider === 'all') {
          // Return results from all providers
          const allResults = await Promise.all(Object.values(providers).map(p => p.list(options)));
          return allResults.flat();
        }
        return providers[provider as keyof typeof providers].list(options);
      }),
      getCloudflareImagesProvider: vi.fn().mockReturnValue(providers.images),
    };
  },

  /**
   * Provider not found scenario
   */
  providerNotFound: () => ({
    getProvider: vi.fn().mockReturnValue(undefined),
    getProviderNames: vi.fn().mockReturnValue(['documents']),
    upload: vi.fn().mockRejectedValue(new Error("Provider 'non-existent' not found")),
    download: vi.fn().mockRejectedValue(new Error("Provider 'non-existent' not found")),
    delete: vi.fn().mockRejectedValue(new Error("Provider 'non-existent' not found")),
    exists: vi.fn().mockRejectedValue(new Error("Provider 'non-existent' not found")),
    getMetadata: vi.fn().mockRejectedValue(new Error("Provider 'non-existent' not found")),
    getUrl: vi.fn().mockRejectedValue(new Error("Provider 'non-existent' not found")),
    list: vi.fn().mockRejectedValue(new Error("Provider 'non-existent' not found")),
    getCloudflareImagesProvider: vi.fn().mockReturnValue(undefined),
  }),
};

/**
 * Storage action mock scenarios
 */
export const storageActionMockScenarios = {
  /**
   * All actions succeed
   */
  allActionsSuccess: () => {
    const mockStorage = storageProviderMockScenarios.allSuccess();
    const mockMultiStorage = multiStorageMockScenarios.success();

    return {
      getStorage: vi.fn().mockReturnValue(mockStorage),
      getMultiStorage: vi.fn().mockReturnValue(mockMultiStorage),
      storage: mockStorage,
      multiStorage: mockMultiStorage,
    };
  },

  /**
   * Storage operations fail
   */
  storageFailure: () => {
    const mockStorage = storageProviderMockScenarios.networkError();
    const mockMultiStorage = multiStorageMockScenarios.providerNotFound();

    return {
      getStorage: vi.fn().mockReturnValue(mockStorage),
      getMultiStorage: vi.fn().mockReturnValue(mockMultiStorage),
      storage: mockStorage,
      multiStorage: mockMultiStorage,
    };
  },

  /**
   * Partial failure scenario
   */
  partialFailure: () => {
    const mockStorage = storageProviderMockScenarios.partialSuccess();
    const mockMultiStorage = multiStorageMockScenarios.success();

    return {
      getStorage: vi.fn().mockReturnValue(mockStorage),
      getMultiStorage: vi.fn().mockReturnValue(mockMultiStorage),
      storage: mockStorage,
      multiStorage: mockMultiStorage,
    };
  },
};

/**
 * Global mock setup utilities
 */
export const setupStorageMocks = {
  /**
   * Sets up all storage mocks for testing
   */
  all: (scenario: 'success' | 'error' | 'partial' = 'success') => {
    const scenarios = {
      success: {
        cloudflareR2: cloudflareR2MockScenarios.success(),
        vercelBlob: vercelBlobMockScenarios.success(),
        cloudflareImages: cloudflareImagesMockScenarios.success(),
        multiStorage: multiStorageMockScenarios.success(),
        actions: storageActionMockScenarios.allActionsSuccess(),
      },
      error: {
        cloudflareR2: cloudflareR2MockScenarios.apiError(),
        vercelBlob: vercelBlobMockScenarios.apiError(),
        cloudflareImages: cloudflareImagesMockScenarios.processingError(),
        multiStorage: multiStorageMockScenarios.providerNotFound(),
        actions: storageActionMockScenarios.storageFailure(),
      },
      partial: {
        cloudflareR2: cloudflareR2MockScenarios.success(),
        vercelBlob: vercelBlobMockScenarios.success(),
        cloudflareImages: cloudflareImagesMockScenarios.processingError(),
        multiStorage: multiStorageMockScenarios.success(),
        actions: storageActionMockScenarios.partialFailure(),
      },
    };

    return scenarios[scenario];
  },

  /**
   * Sets up provider-specific mocks
   */
  provider: (
    providerName: 'cloudflare-r2' | 'vercel-blob' | 'cloudflare-images',
    scenario: 'success' | 'error' = 'success',
  ) => {
    const mockScenarios = {
      'cloudflare-r2': {
        success: cloudflareR2MockScenarios.success(),
        error: cloudflareR2MockScenarios.apiError(),
      },
      'vercel-blob': {
        success: vercelBlobMockScenarios.success(),
        error: vercelBlobMockScenarios.apiError(),
      },
      'cloudflare-images': {
        success: cloudflareImagesMockScenarios.success(),
        error: cloudflareImagesMockScenarios.processingError(),
      },
    };

    return mockScenarios[providerName][scenario];
  },

  /**
   * Resets all mocks to clean state
   */
  reset: () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  },

  /**
   * Restores original implementations
   */
  restore: () => {
    vi.restoreAllMocks();
  },
};

/**
 * Test assertion helpers
 */
export const storageAssertions = {
  /**
   * Asserts upload operation was successful
   */
  expectUploadSuccess: (result: any, expectedKey?: string) => {
    expect(result).toMatchObject({
      key: expectedKey || expect.any(String),
      url: expect.any(String),
      size: expect.any(Number),
    });
    if (result.contentType) {
      expect(typeof result.contentType).toBe('string');
    }
  },

  /**
   * Asserts download operation was successful
   */
  expectDownloadSuccess: (result: any) => {
    expect(result).toBeInstanceOf(Blob);
  },

  /**
   * Asserts list operation was successful
   */
  expectListSuccess: (result: any, minItems: number = 0) => {
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBeGreaterThanOrEqual(minItems);
    if (result.length > 0) {
      expect(result[0]).toMatchObject({
        key: expect.any(String),
        url: expect.any(String),
      });
    }
  },

  /**
   * Asserts metadata operation was successful
   */
  expectMetadataSuccess: (result: any, expectedKey?: string) => {
    expect(result).toMatchObject({
      key: expectedKey || expect.any(String),
      size: expect.any(Number),
    });
  },

  /**
   * Asserts URL generation was successful
   */
  expectUrlSuccess: (result: any) => {
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^https?:\/\//);
  },

  /**
   * Asserts action result was successful
   */
  expectActionSuccess: (result: any, expectedData?: any) => {
    expect(result.success).toBeTruthy();
    if (expectedData !== undefined) {
      expect(result.data).toEqual(expectedData);
    } else {
      expect(result.data).toBeDefined();
    }
    expect(result.error).toBeNull();
  },

  /**
   * Asserts action result was an error
   */
  expectActionError: (result: any, expectedError?: string) => {
    expect(result.success).toBeFalsy();
    expect(result.error).toBeDefined();
    if (expectedError) {
      expect(result.error).toContain(expectedError);
    }
  },

  /**
   * Asserts provider mock was called correctly
   */
  expectProviderCalled: (mockProvider: any, method: string, expectedArgs?: any[]) => {
    expect(mockProvider[method]).toHaveBeenCalledWith();
    if (expectedArgs) {
      expect(mockProvider[method]).toHaveBeenCalledWith(...expectedArgs);
    }
  },

  /**
   * Asserts multi-storage routing worked correctly
   */
  expectMultiStorageRouting: (
    mockMultiStorage: any,
    expectedProvider: string,
    operation: string,
  ) => {
    expect(mockMultiStorage.getProvider).toHaveBeenCalledWith(expectedProvider);
    expect(mockMultiStorage[operation]).toHaveBeenCalledWith();
  },
};

/**
 * Performance test utilities
 */
export const storagePerformanceUtils = {
  /**
   * Measures operation performance
   */
  measurePerformance: async <T>(
    operation: () => Promise<T>,
    maxDuration: number = 1000,
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(maxDuration);
    return { result, duration };
  },

  /**
   * Measures batch operation performance
   */
  measureBatchPerformance: async <T>(
    operations: Array<() => Promise<T>>,
    maxDuration: number = 5000,
  ): Promise<{ results: T[]; duration: number }> => {
    const start = performance.now();
    const results = await Promise.all(operations.map(op => op()));
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(maxDuration);
    expect(results).toHaveLength(operations.length);
    return { results, duration };
  },
};

/**
 * Storage test environment setup
 */
export const storageTestEnvironment = {
  /**
   * Sets up test environment with all mocks
   */
  setup: (scenario: 'success' | 'error' | 'partial' = 'success') => {
    const mocks = setupStorageMocks.all(scenario);

    // Mock external dependencies if not already mocked by @repo/qa
    if (!vi.isMockFunction(global.fetch)) {
      vi.stubGlobal('fetch', vi.fn());
    }

    return mocks;
  },

  /**
   * Tears down test environment
   */
  teardown: () => {
    setupStorageMocks.restore();
    vi.unstubAllGlobals();
  },

  /**
   * Resets test environment between tests
   */
  reset: () => {
    setupStorageMocks.reset();
  },
};
