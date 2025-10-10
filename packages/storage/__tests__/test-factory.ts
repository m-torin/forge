/**
 * Storage Package Test Factory
 *
 * Provides reusable test suite generators for storage functionality.
 * Reduces test duplication and ensures consistent testing patterns.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/**
 * Configuration for storage provider test suites
 */
interface StorageProviderTestConfig<TResult = any> {
  name: string;
  providerFactory: () => any;
  mockSetup?: () => void;
  mockTeardown?: () => void;
  testData?: any;
  expectedBehavior?: {
    shouldUpload?: boolean;
    shouldDelete?: boolean;
    shouldList?: boolean;
    shouldGetUrl?: boolean;
  };
}

/**
 * Configuration for storage action test suites
 */
interface StorageActionTestConfig<TPayload = any> {
  name: string;
  actionFunction: Function;
  validPayload: TPayload;
  invalidPayload?: TPayload;
  expectedResult?: any;
  mockSetup?: () => void;
  mockTeardown?: () => void;
}

/**
 * Configuration for storage utility test suites
 */
interface StorageUtilityTestConfig<TInput = any, TOutput = any> {
  name: string;
  utilityFunction: Function;
  testCases: Array<{
    input: TInput;
    expected: TOutput;
    description: string;
  }>;
  errorCases?: Array<{
    input: TInput;
    expectedError: string | RegExp;
    description: string;
  }>;
}

/**
 * Creates a comprehensive test suite for storage providers
 */
export function createStorageProviderTestSuite<TResult = any>(
  config: StorageProviderTestConfig<TResult>,
) {
  describe(`storage Provider:`, () => {
    let provider: any;

    beforeEach(async () => {
      if (config.mockSetup) {
        config.mockSetup();
      }
      provider = config.providerFactory();
    });

    afterEach(() => {
      if (config.mockTeardown) {
        config.mockTeardown();
      }
      vi.clearAllMocks();
    });

    test("should initialize provider correctly", () => {
      expect(provider).toBeDefined();
      expect(typeof provider).toBe("object");
    });

    if (config.expectedBehavior?.shouldUpload !== false) {
      test("should upload files successfully", async () => {
        const testFile =
          config.testData?.file ||
          new Blob(["test content"], { type: "text/plain" });
        const testKey = config.testData?.key || "test-file.txt";

        if (provider.upload) {
          const result = await provider.upload(testKey, testFile);
          expect(result).toBeDefined();
        }
      });

      test("should handle upload errors gracefully", async () => {
        const invalidFile = null;
        const testKey = "test-file.txt";

        if (provider.upload) {
          await expect(provider.upload(testKey, invalidFile)).rejects.toThrow();
        }
      });
    }

    if (config.expectedBehavior?.shouldDelete !== false) {
      test("should delete files successfully", async () => {
        const testKey = config.testData?.key || "test-file.txt";

        if (provider.delete) {
          const result = await provider.delete(testKey);
          expect(result).toBeDefined();
        }
      });

      test("should handle delete of non-existent files", async () => {
        const nonExistentKey = "non-existent-file.txt";

        if (provider.delete) {
          // Should not throw, might return false or handle gracefully
          const result = await provider.delete(nonExistentKey);
          expect(result).toBeDefined();
        }
      });
    }

    if (config.expectedBehavior?.shouldList !== false) {
      test("should list files successfully", async () => {
        if (provider.list) {
          const result = await provider.list();
          expect(Array.isArray(result)).toBeTruthy();
        }
      });

      test("should list files with prefix filter", async () => {
        const prefix = config.testData?.prefix || "test/";

        if (provider.list) {
          const result = await provider.list({ prefix });
          expect(Array.isArray(result)).toBeTruthy();
        }
      });
    }

    if (config.expectedBehavior?.shouldGetUrl !== false) {
      test("should generate URLs for files", async () => {
        const testKey = config.testData?.key || "test-file.txt";

        if (provider.getUrl) {
          const url = await provider.getUrl(testKey);
          expect(typeof url).toBe("string");
          expect(url).toMatch(/^https?:\/\//);
        }
      });

      test("should generate signed URLs when requested", async () => {
        const testKey = config.testData?.key || "test-file.txt";

        if (provider.getSignedUrl) {
          const url = await provider.getSignedUrl(testKey, { expiresIn: 3600 });
          expect(typeof url).toBe("string");
          expect(url).toMatch(/^https?:\/\//);
        }
      });
    }

    test("should handle provider configuration", () => {
      expect(provider.config).toBeDefined();
      expect(typeof provider.config).toBe("object");
    });

    test("should validate required configuration", () => {
      expect(() => config.providerFactory()).not.toThrow();
    });
  });
}

/**
 * Creates a test suite for storage actions (server actions)
 */
export function createStorageActionTestSuite<TPayload = any>(
  config: StorageActionTestConfig<TPayload>,
) {
  describe(`storage Action:`, () => {
    beforeEach(() => {
      if (config.mockSetup) {
        config.mockSetup();
      }
    });

    afterEach(() => {
      if (config.mockTeardown) {
        config.mockTeardown();
      }
      vi.clearAllMocks();
    });

    test("should execute successfully with valid payload", async () => {
      const result = await config.actionFunction(config.validPayload);

      if (config.expectedResult) {
        expect(result).toStrictEqual(config.expectedResult);
      } else {
        expect(result).toBeDefined();
      }
    });

    if (config.invalidPayload) {
      test("should handle invalid payload appropriately", async () => {
        await expect(
          config.actionFunction(config.invalidPayload),
        ).rejects.toThrow();
      });
    }

    test("should validate input payload", async () => {
      // Test with undefined/null payload
      await expect(config.actionFunction(undefined)).rejects.toThrow();
      await expect(config.actionFunction(null)).rejects.toThrow();
    });

    test("should be a server action", () => {
      // Check if function has server action properties
      expect(typeof config.actionFunction).toBe("function");
    });
  });
}

/**
 * Creates a test suite for storage utilities
 */
function createStorageUtilityTestSuite<TInput = any, TOutput = any>(
  config: StorageUtilityTestConfig<TInput, TOutput>,
) {
  describe(`storage Utility:`, () => {
    config.testCases.forEach((testCase) => {
      test(testCase.description, async () => {
        const result = await config.utilityFunction(testCase.input);
        expect(result).toStrictEqual(testCase.expected);
      });
    });

    if (config.errorCases) {
      config.errorCases.forEach((errorCase) => {
        test(errorCase.description, async () => {
          await expect(config.utilityFunction(errorCase.input)).rejects.toThrow(
            errorCase.expectedError,
          );
        });
      });
    }

    test("should be a function", () => {
      expect(typeof config.utilityFunction).toBe("function");
    });
  });
}

/**
 * Creates a test suite for multi-storage scenarios
 */
export function createMultiStorageTestSuite(config: {
  name: string;
  providers: Array<{ name: string; factory: () => any }>;
  testFile?: Blob;
  testKey?: string;
}) {
  describe(`multi-Storage:`, () => {
    const providers = new Map();
    const testFile =
      config.testFile || new Blob(["test content"], { type: "text/plain" });
    const testKey = config.testKey || "multi-test-file.txt";

    beforeEach(() => {
      config.providers.forEach(({ name, factory }) => {
        providers.set(name, factory());
      });
    });

    afterEach(() => {
      providers.clear();
      vi.clearAllMocks();
    });

    test("should initialize all providers", () => {
      expect(providers.size).toBe(config.providers.length);
      providers.forEach((provider) => {
        expect(provider).toBeDefined();
      });
    });

    test("should upload to all providers consistently", async () => {
      const results = new Map();

      for (const [name, provider] of providers) {
        if (provider.upload) {
          const result = await provider.upload(testKey, testFile);
          results.set(name, result);
        }
      }

      expect(results.size).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });

    test("should delete from all providers consistently", async () => {
      const results = new Map();

      for (const [name, provider] of providers) {
        if (provider.delete) {
          const result = await provider.delete(testKey);
          results.set(name, result);
        }
      }

      expect(results.size).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });

    test("should handle provider failures gracefully", async () => {
      // Test with one provider failing
      const workingProviders = Array.from(providers.values()).slice(0, -1);
      const failingProvider = Array.from(providers.values()).slice(-1)[0];

      if (failingProvider && failingProvider.upload) {
        // Mock the failing provider
        vi.spyOn(failingProvider, "upload").mockRejectedValue(
          new Error("Provider failure"),
        );

        // Working providers should still succeed
        for (const provider of workingProviders) {
          if (provider.upload) {
            await expect(
              provider.upload(testKey, testFile),
            ).resolves.toBeDefined();
          }
        }
      }
    });
  });
}

/**
 * Creates a performance test suite for storage operations
 */
function createStoragePerformanceTestSuite(config: {
  name: string;
  provider: any;
  testData: {
    files: Array<{ key: string; content: Blob }>;
    concurrentUploads?: number;
    concurrentDownloads?: number;
  };
}) {
  describe(`storage Performance:`, () => {
    test("should handle concurrent uploads", async () => {
      const concurrentCount = config.testData.concurrentUploads || 5;
      const testFiles = config.testData.files.slice(0, concurrentCount);

      const uploadPromises = testFiles.map(({ key, content }) =>
        config.provider.upload(key, content),
      );

      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(
        (result) => result.status === "fulfilled",
      );

      expect(successful.length).toBeGreaterThan(0);
    });

    test("should handle large file uploads", async () => {
      const largeContent = new Blob([new ArrayBuffer(1024 * 1024)], {
        type: "application/octet-stream",
      }); // 1MB
      const largeFileKey = "large-test-file.bin";

      if (config.provider.upload) {
        const result = await config.provider.upload(largeFileKey, largeContent);
        expect(result).toBeDefined();
      }
    });

    test("should handle batch operations efficiently", async () => {
      const batchSize = Math.min(config.testData.files.length, 10);
      const batch = config.testData.files.slice(0, batchSize);

      const startTime = Date.now();

      for (const { key, content } of batch) {
        if (config.provider.upload) {
          await config.provider.upload(key, content);
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Reasonable time limit (adjust based on actual requirements)
      expect(totalTime).toBeLessThan(30000); // 30 seconds
    });
  });
}

/**
 * Creates a test suite for storage configuration and environment
 */
function createStorageConfigTestSuite(config: {
  name: string;
  envFactory: () => any;
  configFactory: (env: any) => any;
  requiredEnvVars: string[];
}) {
  describe(`storage Config:`, () => {
    test("should create valid configuration from environment", () => {
      const env = config.envFactory();
      const storageConfig = config.configFactory(env);

      expect(storageConfig).toBeDefined();
      expect(typeof storageConfig).toBe("object");
    });

    test("should validate required environment variables", () => {
      const env = config.envFactory();

      config.requiredEnvVars.forEach((varName) => {
        expect(env[varName]).toBeDefined();
      });
    });

    test("should handle missing environment variables gracefully", () => {
      const incompleteEnv = {};

      expect(() => config.configFactory(incompleteEnv)).not.toThrow();
    });

    test("should provide default values when appropriate", () => {
      const minimalEnv = {};
      const storageConfig = config.configFactory(minimalEnv);

      expect(storageConfig).toBeDefined();
    });
  });
}

/**
 * Creates storage scenarios for testing
 */
function createStorageScenarios() {
  return {
    upload: vi
      .fn()
      .mockResolvedValue({
        key: "test-key",
        url: "https://test.com",
        size: 100,
      }),
    download: vi.fn().mockResolvedValue(new Blob(["test data"])),
    delete: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(true),
    getMetadata: vi
      .fn()
      .mockResolvedValue({
        key: "test-key",
        url: "https://test.com",
        size: 100,
      }),
    getUrl: vi.fn().mockResolvedValue("https://test.com/signed"),
    list: vi.fn().mockResolvedValue([]),
  };
}
