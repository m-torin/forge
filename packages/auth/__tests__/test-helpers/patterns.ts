/**
 * Reusable test patterns for auth package
 * Provides common test scenarios to reduce duplication
 */

import { expect } from 'vitest';

/**
 * Common result structure for server actions
 */
interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

/**
 * Tests the success pattern for server actions
 */
export const testSuccessPattern = async <T>(
  actionFn: Function,
  mockSetup: () => void,
  expectedResult: Partial<ActionResult<T>>,
  expectedCall?: any,
) => {
  mockSetup();
  const result = await actionFn();

  expect(result.success).toBeTruthy();

  // Handle partial matching to avoid date comparison issues
  if (expectedResult.success !== undefined) {
    expect(result.success).toBe(expectedResult.success);
  }

  if (expectedResult.data !== undefined) {
    if (typeof expectedResult.data === 'object' && expectedResult.data !== null) {
      // For object data, check structure but be flexible with dates
      expect(result.data).toMatchObject(expectedResult.data);
    } else {
      expect(result.data).toBe(expectedResult.data);
    }
  }

  if (expectedCall) {
    expect(expectedCall.mock).toHaveBeenCalledWith(expectedCall.args);
  }
};

/**
 * Tests the error pattern for server actions
 */
export const testErrorPattern = async (
  actionFn: Function,
  mockError: Error | string,
  expectedErrorMessage: string,
  mockApiCall?: any,
) => {
  if (mockApiCall) {
    mockApiCall.mockRejectedValue(mockError);
  }

  const result = await actionFn();

  expect(result.success).toBeFalsy();
  expect(result.error).toBe(expectedErrorMessage);
  expect(result.data).toBeNull();
};

/**
 * Tests authentication requirement pattern
 */
export const testAuthRequiredPattern = async (
  actionFn: Function,
  mockGetSession: any,
  expectedErrorMessage: string = 'Not authenticated',
) => {
  mockGetSession.mockResolvedValue(null);

  const result = await actionFn();

  expect(result.success).toBeFalsy();
  expect(result.error).toBe(expectedErrorMessage);
};

/**
 * Tests permission requirement pattern
 */
export const testPermissionRequiredPattern = async (
  actionFn: Function,
  mockPermissionCheck: any,
  expectedErrorMessage: string = 'Insufficient permissions',
) => {
  mockPermissionCheck.mockResolvedValue(false);

  const result = await actionFn();

  expect(result.success).toBeFalsy();
  expect(result.error).toBe(expectedErrorMessage);
};

/**
 * Tests validation error pattern
 */
export const testValidationErrorPattern = async (
  actionFn: Function,
  invalidInput: any,
  expectedErrorMessage: string,
) => {
  const result = await actionFn(invalidInput);

  expect(result.success).toBeFalsy();
  expect(result.error).toContain(expectedErrorMessage);
};

/**
 * Tests API call pattern verification
 */
export const testApiCallPattern = (
  mockApiCall: any,
  expectedCall: {
    body?: any;
    query?: any;
    headers?: any;
  },
) => {
  expect(mockApiCall).toHaveBeenCalledWith(expect.objectContaining(expectedCall));
};

/**
 * Tests concurrent action calls pattern
 */
export const testConcurrentCallsPattern = async (
  actions: Array<() => Promise<any>>,
  expectedResults: Array<{ success: boolean; [key: string]: any }>,
) => {
  const results = await Promise.all(actions.map(action => action()));

  results.forEach((result, index) => {
    expect(result).toMatchObject(expectedResults[index]);
  });
};

/**
 * Tests bulk operations pattern
 */
export const testBulkOperationPattern = async (
  bulkActionFn: Function,
  items: any[],
  expectedSuccessCount: number,
  expectedFailureCount: number,
) => {
  const result = await bulkActionFn(items);

  expect(result.success).toBeTruthy();
  expect(result.results).toHaveLength(items.length);

  const successCount = result.results.filter((r: any) => r.success).length;
  const failureCount = result.results.filter((r: any) => !r.success).length;

  expect(successCount).toBe(expectedSuccessCount);
  expect(failureCount).toBe(expectedFailureCount);
};

/**
 * Tests pagination pattern
 */
export const testPaginationPattern = (
  result: any,
  expectedPage: number,
  expectedLimit: number,
  expectedTotal: number,
) => {
  expect(result.pagination).toMatchObject({
    page: expectedPage,
    limit: expectedLimit,
    total: expectedTotal,
    pages: Math.ceil(expectedTotal / expectedLimit),
  });
};

/**
 * Tests search/filter pattern
 */
export const testSearchPattern = (result: any, searchTerm: string, expectedMatchCount: number) => {
  expect(result.data).toHaveLength(expectedMatchCount);

  if (searchTerm && result.data.length > 0) {
    result.data.forEach((item: any) => {
      const matchesSearch = Object.values(item).some(
        value =>
          typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      expect(matchesSearch).toBeTruthy();
    });
  }
};

/**
 * Tests rate limiting pattern
 */
export const testRateLimitPattern = async (actionFn: Function, maxAttempts: number) => {
  const promises = Array.from({ length: maxAttempts + 1 }, () => actionFn());
  const results = await Promise.all(promises);

  const successCount = results.filter(r => r.success).length;
  const rateLimitedCount = results.filter(
    r => !r.success && r.error?.includes('rate limit'),
  ).length;

  expect(successCount).toBe(maxAttempts);
  expect(rateLimitedCount).toBe(1);
};

/**
 * Tests async operation cleanup pattern
 */
export const testCleanupPattern = async (
  actionFn: Function,
  cleanupFn: Function,
  verifyCleanup: Function,
) => {
  await actionFn();
  await cleanupFn();

  const cleanupVerification = await verifyCleanup();
  expect(cleanupVerification).toBeTruthy();
};

/**
 * Tests error recovery pattern
 */
export const testErrorRecoveryPattern = async (
  actionFn: Function,
  mockError: Error,
  recoveryFn: Function,
  mockApiCall: any,
) => {
  // First call fails
  mockApiCall.mockRejectedValueOnce(mockError);
  const firstResult = await actionFn();
  expect(firstResult.success).toBeFalsy();

  // Recovery action
  await recoveryFn();

  // Second call succeeds
  mockApiCall.mockResolvedValueOnce({ success: true });
  const secondResult = await actionFn();
  expect(secondResult.success).toBeTruthy();
};

/**
 * Tests input sanitization pattern
 */
export const testSanitizationPattern = (
  sanitizeFn: Function,
  dirtyInput: any,
  expectedCleanInput: any,
) => {
  const result = sanitizeFn(dirtyInput);
  expect(result).toStrictEqual(expectedCleanInput);
};

/**
 * Tests caching pattern
 */
export const testCachingPattern = async (
  actionFn: Function,
  mockApiCall: any,
  cacheKey: string,
) => {
  const expectedResult = { data: 'cached-data' };
  mockApiCall.mockResolvedValue(expectedResult);

  // First call should hit API
  const firstResult = await actionFn();
  expect(mockApiCall).toHaveBeenCalledTimes(1);
  expect(firstResult).toMatchObject(expectedResult);

  // Second call should use cache
  const secondResult = await actionFn();
  expect(mockApiCall).toHaveBeenCalledTimes(1); // Still only called once
  expect(secondResult).toMatchObject(expectedResult);
};

/**
 * Creates a test suite for standard CRUD operations
 */
export const createCrudTestSuite = (
  resourceName: string,
  actions: {
    create: Function;
    read: Function;
    update: Function;
    delete: Function;
  },
  mocks: {
    api: any;
    data: any;
  },
) => {
  return {
    [`should create ${resourceName}`]: async () => {
      await testSuccessPattern(
        actions.create,
        () => mocks.api.create.mockResolvedValue(mocks.data),
        { success: true, data: mocks.data },
      );
    },

    [`should read ${resourceName}`]: async () => {
      await testSuccessPattern(actions.read, () => mocks.api.read.mockResolvedValue(mocks.data), {
        success: true,
        data: mocks.data,
      });
    },

    [`should update ${resourceName}`]: async () => {
      const updatedData = { ...mocks.data, updated: true };
      await testSuccessPattern(
        actions.update,
        () => mocks.api.update.mockResolvedValue(updatedData),
        { success: true, data: updatedData },
      );
    },

    [`should delete ${resourceName}`]: async () => {
      await testSuccessPattern(
        actions.delete,
        () => mocks.api.delete.mockResolvedValue({ success: true }),
        { success: true },
      );
    },

    [`should handle ${resourceName} creation errors`]: async () => {
      await testErrorPattern(
        actions.create,
        new Error('Creation failed'),
        `Failed to create ${resourceName}`,
        mocks.api.create,
      );
    },

    [`should handle ${resourceName} read errors`]: async () => {
      await testErrorPattern(
        actions.read,
        new Error('Read failed'),
        `Failed to read ${resourceName}`,
        mocks.api.read,
      );
    },
  };
};

/**
 * Common assertion helpers
 */
export const assertValidResult = (result: any) => {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('success');
  expect(typeof result.success).toBe('boolean');
};

export const assertSuccessResult = (result: any, expectedData?: any) => {
  assertValidResult(result);
  expect(result.success).toBeTruthy();

  if (expectedData) {
    expect(result.data).toMatchObject(expectedData);
  }
};

export const assertErrorResult = (result: any, expectedError?: string) => {
  assertValidResult(result);
  expect(result.success).toBeFalsy();
  expect(result.data).toBeNull();

  if (expectedError) {
    expect(result.error).toBe(expectedError);
  }
};
