/**
 * Storage Shared Test Utilities
 *
 * Core utilities for storage testing following the successful email package DRY pattern.
 * Provides shared utilities, mock helpers, assertion patterns, and performance testing.
 */

import { vi } from 'vitest';
import { generateStorageErrors, generateStorageResults } from '../test-data-generators';

/**
 * Mock creation utilities
 */
export const mockUtils = {
  /**
   * Creates a mock storage provider with all required methods
   */
  createStorageProvider: (scenario: 'success' | 'error' | 'partial' = 'success') => {
    const baseMethods = {
      upload: vi.fn(),
      download: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      getMetadata: vi.fn(),
      getUrl: vi.fn(),
      list: vi.fn(),
    };

    switch (scenario) {
      case 'success':
        return {
          ...baseMethods,
          upload: vi.fn().mockResolvedValue(generateStorageResults.upload()),
          download: vi.fn().mockResolvedValue(new Blob(['test data'])),
          delete: vi.fn().mockResolvedValue(undefined),
          exists: vi.fn().mockResolvedValue(true),
          getMetadata: vi.fn().mockResolvedValue(generateStorageResults.metadata()),
          getUrl: vi.fn().mockResolvedValue('https://example.com/signed-url'),
          list: vi.fn().mockResolvedValue(generateStorageResults.list(3)),
        };

      case 'error':
        const error = generateStorageErrors.network();
        return {
          ...baseMethods,
          upload: vi.fn().mockRejectedValue(error),
          download: vi.fn().mockRejectedValue(error),
          delete: vi.fn().mockRejectedValue(error),
          exists: vi.fn().mockRejectedValue(error),
          getMetadata: vi.fn().mockRejectedValue(error),
          getUrl: vi.fn().mockRejectedValue(error),
          list: vi.fn().mockRejectedValue(error),
        };

      case 'partial':
        return {
          ...baseMethods,
          upload: vi.fn().mockResolvedValue(generateStorageResults.upload()),
          download: vi.fn().mockResolvedValue(new Blob(['test data'])),
          delete: vi.fn().mockRejectedValue(generateStorageErrors.storage()),
          exists: vi.fn().mockResolvedValue(true),
          getMetadata: vi.fn().mockResolvedValue(generateStorageResults.metadata()),
          getUrl: vi.fn().mockResolvedValue('https://example.com/signed-url'),
          list: vi.fn().mockResolvedValue(generateStorageResults.list(1)),
        };

      default:
        return baseMethods;
    }
  },

  /**
   * Creates a mock multi-storage manager
   */
  createMultiStorageManager: (scenario: 'success' | 'error' = 'success') => {
    const providers = {
      documents: mockUtils.createStorageProvider(scenario),
      images: mockUtils.createStorageProvider(scenario),
      cache: mockUtils.createStorageProvider(scenario),
    };

    return {
      getProvider: vi
        .fn()
        .mockImplementation((name: string) => providers[name as keyof typeof providers]),
      getProviderNames: vi.fn().mockReturnValue(Object.keys(providers)),
      upload: vi.fn().mockImplementation(async (key: string, content: any, options: any) => {
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
          const allResults = await Promise.all(Object.values(providers).map(p => p.list(options)));
          return allResults.flat();
        }
        return providers[provider as keyof typeof providers].list(options);
      }),
      getCloudflareImagesProvider: vi.fn().mockReturnValue(providers.images),
    };
  },

  /**
   * Creates mock action results
   */
  createActionResult: (success: boolean, data?: any, error?: string) => ({
    success,
    data: success ? data : null,
    error: success ? null : error,
  }),

  /**
   * Resets all mocks to clean state
   */
  resetAllMocks: () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  },

  /**
   * Restores all mocks to original implementations
   */
  restoreAllMocks: () => {
    vi.restoreAllMocks();
  },
};

/**
 * Data factory utilities
 */
export const dataFactories = {
  /**
   * Creates test data for specific provider type
   */
  forProvider: (providerType: 'cloudflare-r2' | 'vercel-blob' | 'cloudflare-images') => {
    const baseData = {
      key: 'test-file.txt',
      content: Buffer.from('test content'),
      options: {},
    };

    switch (providerType) {
      case 'cloudflare-r2':
        return {
          ...baseData,
          key: 'documents/test-file.pdf',
          options: { contentType: 'application/pdf' },
        };

      case 'vercel-blob':
        return {
          ...baseData,
          key: 'cache/temp-file.json',
          options: { contentType: 'application/json' },
        };

      case 'cloudflare-images':
        return {
          ...baseData,
          key: 'photo.jpg',
          content: new File(['image data'], 'photo.jpg', { type: 'image/jpeg' }),
          options: { contentType: 'image/jpeg' },
        };

      default:
        return baseData;
    }
  },

  /**
   * Creates test data for specific operation
   */
  forOperation: (operation: 'upload' | 'download' | 'delete' | 'list' | 'exists' | 'getUrl') => {
    const baseData = {
      key: 'test-file.txt',
      content: Buffer.from('test content'),
      options: {},
    };

    switch (operation) {
      case 'upload':
        return {
          ...baseData,
          options: { contentType: 'text/plain' },
        };

      case 'download':
        return {
          key: 'existing-file.txt',
        };

      case 'delete':
        return {
          key: 'file-to-delete.txt',
        };

      case 'list':
        return {
          options: { prefix: 'documents/', limit: 10 },
        };

      case 'exists':
        return {
          key: 'check-existence.txt',
        };

      case 'getUrl':
        return {
          key: 'generate-url.txt',
          options: { expiresIn: 3600 },
        };

      default:
        return baseData;
    }
  },

  /**
   * Creates edge case test data
   */
  edgeCase: (caseType: 'empty' | 'large' | 'unicode' | 'special-chars') => {
    switch (caseType) {
      case 'empty':
        return {
          key: 'empty-file.txt',
          content: Buffer.alloc(0),
          options: {},
        };

      case 'large':
        return {
          key: 'large-file.bin',
          content: Buffer.alloc(1024 * 1024, 'x'), // 1MB
          options: { contentType: 'application/octet-stream' },
        };

      case 'unicode':
        return {
          key: '测试文件-🌍.txt',
          content: Buffer.from('Hello 世界 🌍'),
          options: { contentType: 'text/plain; charset=utf-8' },
        };

      case 'special-chars':
        return {
          key: 'file with spaces & symbols.txt',
          content: Buffer.from('Content with special chars: !@#$%^&*()'),
          options: {},
        };

      default:
        return dataFactories.forOperation('upload');
    }
  },

  /**
   * Creates bulk operation test data
   */
  bulkData: (count: number = 5) => ({
    keys: Array.from({ length: count }, (_, i) => `bulk-file-${i}.txt`),
    contents: Array.from({ length: count }, (_, i) => Buffer.from(`Bulk content ${i}`)),
    options: Array.from({ length: count }, (_, i) => ({ contentType: 'text/plain' })),
  }),
};

/**
 * Assertion helper utilities
 */
export const assertionHelpers = {
  /**
   * Asserts that a storage result has the expected structure
   */
  expectStorageResult: (result: any, expectedKey?: string) => {
    expect(result).toMatchObject({
      key: expectedKey || expect.any(String),
      url: expect.any(String),
      size: expect.any(Number),
    });

    if (result.contentType) {
      expect(typeof result.contentType).toBe('string');
    }

    if (result.lastModified) {
      expect(result.lastModified).toBeInstanceOf(Date);
    }
  },

  /**
   * Asserts that a download result is valid
   */
  expectDownloadResult: (result: any) => {
    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBeGreaterThanOrEqual(0);
  },

  /**
   * Asserts that a list result is valid
   */
  expectListResult: (result: any, minItems: number = 0) => {
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBeGreaterThanOrEqual(minItems);

    if (result.length > 0) {
      result.forEach((item: any) => {
        assertionHelpers.expectStorageResult(item);
      });
    }
  },

  /**
   * Asserts that an action result is successful
   */
  expectActionSuccess: (result: any, expectedData?: any) => {
    expect(result).toMatchObject({
      success: true,
      error: null,
    });

    if (expectedData !== undefined) {
      expect(result.data).toEqual(expectedData);
    } else {
      expect(result.data).toBeDefined();
    }
  },

  /**
   * Asserts that an action result is an error
   */
  expectActionError: (result: any, expectedError?: string) => {
    expect(result).toMatchObject({
      success: false,
      data: null,
    });

    expect(result.error).toBeDefined();
    if (expectedError) {
      expect(result.error).toContain(expectedError);
    }
  },

  /**
   * Asserts that a URL is valid
   */
  expectValidUrl: (url: string) => {
    expect(typeof url).toBe('string');
    expect(url).toMatch(/^https?:\/\//);
    expect(() => new URL(url)).not.toThrow();
  },

  /**
   * Asserts that provider mocks were called correctly
   */
  expectProviderCalls: (provider: any, method: string, expectedArgs?: any[]) => {
    expect(provider[method]).toHaveBeenCalledWith();

    if (expectedArgs) {
      expect(provider[method]).toHaveBeenCalledWith(...expectedArgs);
    }
  },

  /**
   * Asserts bulk operation results
   */
  expectBulkResults: (result: any, expectedSuccesses: number, expectedFailures: number = 0) => {
    if (expectedFailures === 0) {
      assertionHelpers.expectActionSuccess(result);
      expect(result.data.succeeded).toHaveLength(expectedSuccesses);
      expect(result.data.failed).toHaveLength(0);
    } else {
      expect(result.success).toBeFalsy();
      expect(result.data.succeeded).toHaveLength(expectedSuccesses);
      expect(result.data.failed).toHaveLength(expectedFailures);
    }
  },
};

/**
 * Performance testing utilities
 */
export const performanceUtils = {
  /**
   * Measures the performance of an async operation
   */
  measureAsync: async <T>(
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
   * Measures the performance of a batch of operations
   */
  measureBatch: async <T>(
    operations: Array<() => Promise<T>>,
    maxDuration: number = 5000,
  ): Promise<{ results: T[]; duration: number; avgDuration: number }> => {
    const start = performance.now();
    const results = await Promise.all(operations.map(op => op()));
    const duration = performance.now() - start;
    const avgDuration = duration / operations.length;

    expect(duration).toBeLessThan(maxDuration);
    expect(results).toHaveLength(operations.length);

    return { results, duration, avgDuration };
  },

  /**
   * Measures memory usage during operation (approximate)
   */
  measureMemory: async <T>(
    operation: () => Promise<T>,
  ): Promise<{ result: T; memoryDelta: number }> => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const memBefore = process.memoryUsage().heapUsed;
    const result = await operation();
    const memAfter = process.memoryUsage().heapUsed;
    const memoryDelta = memAfter - memBefore;

    return { result, memoryDelta };
  },

  /**
   * Creates a performance test for a specific operation
   */
  createPerformanceTest: <T>(
    name: string,
    operation: () => Promise<T>,
    maxDuration: number = 1000,
  ) => {
    return async () => {
      const { result, duration } = await performanceUtils.measureAsync(operation, maxDuration);

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(maxDuration);

      return { result, duration };
    };
  },
};

/**
 * Error simulation utilities
 */
export const errorUtils = {
  /**
   * Creates network error scenarios
   */
  networkErrors: () => [
    new Error('Network request failed'),
    new Error('Connection timeout'),
    new Error('DNS resolution failed'),
    new Error('Service unavailable'),
  ],

  /**
   * Creates authentication error scenarios
   */
  authErrors: () => [
    new Error('Invalid credentials'),
    new Error('Access denied'),
    new Error('Token expired'),
    new Error('Insufficient permissions'),
  ],

  /**
   * Creates storage-specific error scenarios
   */
  storageErrors: () => [
    new Error('File not found'),
    new Error('Storage quota exceeded'),
    new Error('File too large'),
    new Error('Invalid file type'),
  ],

  /**
   * Simulates intermittent errors
   */
  createIntermittentError: (failureRate: number = 0.3) => {
    return vi.fn().mockImplementation(() => {
      if (Math.random() < failureRate) {
        throw new Error('Intermittent failure');
      }
      return generateStorageResults.upload();
    });
  },

  /**
   * Simulates timeout errors
   */
  createTimeoutError: (delay: number = 1000) => {
    return vi.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), delay);
      });
    });
  },
};

/**
 * Test pattern utilities
 */
export const testPatterns = {
  /**
   * Tests CRUD operations for a provider
   */
  testCrudOperations: (provider: any, testData: any) => {
    return {
      async testCreate() {
        const result = await provider.upload(testData.key, testData.content, testData.options);
        assertionHelpers.expectStorageResult(result, testData.key);
        return result;
      },

      async testRead() {
        const result = await provider.download(testData.key);
        assertionHelpers.expectDownloadResult(result);
        return result;
      },

      async testUpdate() {
        const newContent = Buffer.from('updated content');
        const result = await provider.upload(testData.key, newContent, testData.options);
        assertionHelpers.expectStorageResult(result, testData.key);
        return result;
      },

      async testDelete() {
        const result = await provider.delete(testData.key);
        expect(result).toBeUndefined();
      },

      async testList() {
        const result = await provider.list({ prefix: 'test-' });
        assertionHelpers.expectListResult(result);
        return result;
      },

      async testExists() {
        const exists = await provider.exists(testData.key);
        expect(typeof exists).toBe('boolean');
        return exists;
      },
    };
  },

  /**
   * Tests error handling for a provider
   */
  testErrorHandling: (provider: any) => {
    return {
      async testUploadError() {
        provider.upload.mockRejectedValueOnce(generateStorageErrors.storage());
        await expect(provider.upload('error-key', Buffer.from('test'))).rejects.toThrow();
      },

      async testDownloadError() {
        provider.download.mockRejectedValueOnce(new Error('File not found'));
        await expect(provider.download('non-existent')).rejects.toThrow();
      },

      async testDeleteError() {
        provider.delete.mockRejectedValueOnce(new Error('Delete failed'));
        await expect(provider.delete('error-key')).rejects.toThrow();
      },

      async testNetworkError() {
        const networkError = generateStorageErrors.network();
        provider.upload.mockRejectedValueOnce(networkError);
        await expect(provider.upload('test', Buffer.from('test'))).rejects.toThrow();
      },
    };
  },

  /**
   * Tests performance characteristics
   */
  testPerformance: (provider: any, testData: any) => {
    return {
      async testUploadPerformance() {
        return performanceUtils.createPerformanceTest(
          'upload performance',
          () => provider.upload(testData.key, testData.content, testData.options),
          1000,
        )();
      },

      async testBatchPerformance() {
        const operations = Array.from(
          { length: 5 },
          (_, i) => () => provider.upload(`batch-${i}.txt`, testData.content),
        );

        return performanceUtils.measureBatch(operations, 3000);
      },

      async testConcurrentOperations() {
        const concurrentOps = Array.from({ length: 10 }, () => () => provider.exists(testData.key));

        return performanceUtils.measureBatch(concurrentOps, 2000);
      },
    };
  },
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validates storage provider interface
   */
  validateProviderInterface: (provider: any) => {
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
      expect(provider[method]).toBeDefined();
      expect(typeof provider[method]).toBe('function');
    });
  },

  /**
   * Validates multi-storage manager interface
   */
  validateMultiStorageInterface: (manager: any) => {
    const requiredMethods = [
      'getProvider',
      'getProviderNames',
      'upload',
      'download',
      'delete',
      'exists',
      'getMetadata',
      'getUrl',
      'list',
    ];

    requiredMethods.forEach(method => {
      expect(manager[method]).toBeDefined();
      expect(typeof manager[method]).toBe('function');
    });
  },

  /**
   * Validates action function interface
   */
  validateActionInterface: (actionFn: any) => {
    expect(typeof actionFn).toBe('function');
  },

  /**
   * Validates configuration structure
   */
  validateConfiguration: (config: any, requiredFields: string[]) => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
    expect(config).not.toBeNull();

    requiredFields.forEach(field => {
      expect(config[field]).toBeDefined();
    });
  },
};

/**
 * Test environment utilities
 */
export const environmentUtils = {
  /**
   * Sets up a clean test environment
   */
  setupCleanEnvironment: () => {
    mockUtils.resetAllMocks();

    // Clear any global state
    if (global.fetch && vi.isMockFunction(global.fetch)) {
      (global.fetch as any).mockClear();
    }
  },

  /**
   * Tears down test environment
   */
  teardownEnvironment: () => {
    mockUtils.restoreAllMocks();

    // Clean up global state
    if (global.gc) {
      global.gc();
    }
  },

  /**
   * Creates isolated test context
   */
  createIsolatedContext: () => {
    const originalEnv = process.env;
    const originalConsole = console;

    return {
      restore: () => {
        process.env = originalEnv;
        console = originalConsole;
      },

      setEnv: (envVars: Record<string, string>) => {
        process.env = { ...originalEnv, ...envVars };
      },

      mockConsole: () => {
        console = {
          ...originalConsole,
          log: vi.fn(),
          error: vi.fn(),
          warn: vi.fn(),
          info: vi.fn(),
        };
      },
    };
  },
};
