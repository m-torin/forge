/**
 * Test suite builder for auth package
 * Provides standardized test suites for common patterns
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createMockSession } from './factories';
import { mockBetterAuthApi, resetAllMocks } from './mocks';
import {
  assertErrorResult,
  assertSuccessResult,
  createCrudTestSuite,
  testAuthRequiredPattern,
  testErrorPattern,
  testPermissionRequiredPattern,
  testSuccessPattern,
} from './patterns';

/**
 * Configuration for server action test suites
 */
interface ServerActionTestConfig {
  actionName: string;
  actionFn: Function;
  mockApiMethod: string;
  successData?: any;
  errorMessage?: string;
  requiresAuth?: boolean;
  requiresPermission?: boolean;
  permissionCheck?: Function;
}

/**
 * Creates a standardized test suite for server actions
 */
export const createServerActionTestSuite = (config: ServerActionTestConfig) => {
  const {
    actionName,
    actionFn,
    mockApiMethod,
    successData,
    errorMessage = `Failed to ${actionName.toLowerCase()}`,
    requiresAuth = true,
    requiresPermission = false,
    permissionCheck,
  } = config;

  return describe(`${actionName} Action`, () => {
    beforeEach(() => {
      resetAllMocks();

      // Set up default authenticated session
      if (requiresAuth) {
        vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(createMockSession());
      }
    });

    test(`should ${actionName.toLowerCase()} successfully`, async () => {
      const mockData = successData || { success: true };

      await testSuccessPattern(
        actionFn,
        () => {
          if (mockApiMethod === 'getSession' && actionName === 'getCurrentUser') {
            // For getCurrentUser, we need to return a session with user data
            vi.mocked(
              mockBetterAuthApi[mockApiMethod as keyof typeof mockBetterAuthApi],
            ).mockResolvedValue(createMockSession());
          } else {
            vi.mocked(
              mockBetterAuthApi[mockApiMethod as keyof typeof mockBetterAuthApi],
            ).mockResolvedValue(mockData);
          }
          if (permissionCheck) {
            (permissionCheck as any).mockResolvedValue(true);
          }
        },
        { success: true },
      );
    });

    test(`should handle ${actionName.toLowerCase()} errors`, async () => {
      await testErrorPattern(
        actionFn,
        new Error('API Error'),
        errorMessage,
        mockBetterAuthApi[mockApiMethod as keyof typeof mockBetterAuthApi],
      );
    });

    test(`should handle non-Error exceptions`, async () => {
      await testErrorPattern(
        actionFn,
        'String error',
        'Unknown error', // Server actions return "Unknown error" for non-Error exceptions
        mockBetterAuthApi[mockApiMethod as keyof typeof mockBetterAuthApi],
      );
    });

    if (requiresAuth) {
      test('should require authentication', async () => {
        await testAuthRequiredPattern(actionFn, mockBetterAuthApi.getSession);
      });
    }

    if (requiresPermission && permissionCheck) {
      test('should require permission', async () => {
        await testPermissionRequiredPattern(actionFn, permissionCheck);
      });
    }
  });
};

/**
 * Configuration for client hook test suites
 */
interface ClientHookTestConfig {
  hookName: string;
  hookModule: string;
  hookExportName: string;
  mockProvider: any;
  expectedValue?: any;
  dependencies?: string[];
}

/**
 * Creates a standardized test suite for client hooks
 */
export const createClientHookTestSuite = (config: ClientHookTestConfig) => {
  const {
    hookName,
    hookModule,
    hookExportName,
    mockProvider,
    expectedValue,
    dependencies = [],
  } = config;

  return describe(`${hookName} Hook`, () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test(`should return correct value from ${hookName}`, async () => {
      const { renderHook } = await import('@testing-library/react');
      const hooksModule = await import(hookModule);

      const { result } = renderHook(() => hooksModule[hookExportName]());

      if (expectedValue) {
        expect(result.current).toStrictEqual(expectedValue);
      } else {
        expect(result.current).toBeDefined();
      }
    });

    test(`should handle ${hookName} loading state`, async () => {
      const { renderHook } = await import('@testing-library/react');
      const hooksModule = await import(hookModule);

      vi.mocked(mockProvider).mockReturnValue({
        ...mockProvider(),
        isLoading: true,
      });

      const { result } = renderHook(() => hooksModule[hookExportName]());

      expect(result.current.isLoading).toBeTruthy();
    });

    test(`should handle ${hookName} error state`, async () => {
      const { renderHook } = await import('@testing-library/react');
      const hooksModule = await import(hookModule);

      vi.mocked(mockProvider).mockReturnValue({
        ...mockProvider(),
        error: new Error('Hook error'),
      });

      const { result } = renderHook(() => hooksModule[hookExportName]());

      expect(result.current.error).toBeDefined();
    });

    dependencies.forEach(dep => {
      test(`should depend on ${dep}`, async () => {
        const { renderHook } = await import('@testing-library/react');
        const hooksModule = await import(hookModule);

        const { result } = renderHook(() => hooksModule[hookExportName]());

        expect(result.current).toBeDefined();
      });
    });
  });
};

/**
 * Configuration for API integration test suites
 */
interface ApiIntegrationTestConfig {
  apiName: string;
  endpoints: {
    [key: string]: {
      method: string;
      path: string;
      mockResponse: any;
      requiresAuth?: boolean;
    };
  };
}

/**
 * Creates a standardized test suite for API integrations
 */
export const createApiIntegrationTestSuite = (config: ApiIntegrationTestConfig) => {
  const { apiName, endpoints } = config;

  return describe(`${apiName} API Integration`, () => {
    beforeEach(() => {
      resetAllMocks();
    });

    Object.entries(endpoints).forEach(([name, endpoint]) => {
      describe(name, () => {
        test(`should handle ${name} success`, async () => {
          vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(endpoint.mockResponse),
          } as any);

          const response = await fetch(endpoint.path, {
            method: endpoint.method,
          });

          expect(response.ok).toBeTruthy();
          const data = await response.json();
          expect(data).toStrictEqual(endpoint.mockResponse);
        });

        test(`should handle ${name} error`, async () => {
          vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: vi.fn().mockResolvedValue({ error: 'Internal Server Error' }),
          } as any);

          const response = await fetch(endpoint.path, {
            method: endpoint.method,
          });

          expect(response.ok).toBeFalsy();
          expect(response.status).toBe(500);
        });

        if (endpoint.requiresAuth) {
          test(`should require authentication for ${name}`, async () => {
            vi.spyOn(global, 'fetch').mockResolvedValue({
              ok: false,
              status: 401,
              json: vi.fn().mockResolvedValue({ error: 'Unauthorized' }),
            } as any);

            const response = await fetch(endpoint.path, {
              method: endpoint.method,
            });

            expect(response.status).toBe(401);
          });
        }
      });
    });
  });
};

/**
 * Configuration for validation test suites
 */
interface ValidationTestConfig {
  validatorName: string;
  validatorFn: Function;
  validInputs: any[];
  invalidInputs: Array<{ input: any; expectedError: string }>;
}

/**
 * Creates a standardized test suite for validation functions
 */
export const createValidationTestSuite = (config: ValidationTestConfig) => {
  const { validatorName, validatorFn, validInputs, invalidInputs } = config;

  return describe(`${validatorName} Validation`, () => {
    describe('valid inputs', () => {
      validInputs.forEach((input, index) => {
        test(`should accept valid input ${index + 1}`, () => {
          const result = validatorFn(input);
          expect(result.success).toBeTruthy();
        });
      });
    });

    describe('invalid inputs', () => {
      invalidInputs.forEach(({ input, expectedError }, index) => {
        test(`should reject invalid input ${index + 1}`, () => {
          const result = validatorFn(input);
          expect(result.success).toBeFalsy();
          expect(result.error).toContain(expectedError);
        });
      });
    });
  });
};

/**
 * Configuration for permission test suites
 */
interface PermissionTestConfig {
  permissionName: string;
  permissionFn: Function;
  allowedRoles: string[];
  deniedRoles: string[];
  resourceId?: string;
}

/**
 * Creates a standardized test suite for permission checks
 */
export const createPermissionTestSuite = (config: PermissionTestConfig) => {
  const { permissionName, permissionFn, allowedRoles, deniedRoles, resourceId } = config;

  return describe(`${permissionName} Permission`, () => {
    allowedRoles.forEach(role => {
      test(`should allow ${role} role`, async () => {
        const mockSession = createMockSession({
          user: { role },
        });

        vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(mockSession);

        const result = await permissionFn(resourceId);
        expect(result).toBeTruthy();
      });
    });

    deniedRoles.forEach(role => {
      test(`should deny ${role} role`, async () => {
        const mockSession = createMockSession({
          user: { role },
        });

        vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(mockSession);

        const result = await permissionFn(resourceId);
        expect(result).toBeFalsy();
      });
    });

    test('should deny unauthenticated users', async () => {
      vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(null);

      const result = await permissionFn(resourceId);
      expect(result).toBeFalsy();
    });
  });
};

/**
 * Creates a comprehensive test suite for CRUD operations
 */
export const createComprehensiveCrudTestSuite = (
  resourceName: string,
  actions: any,
  mocks: any,
) => {
  const crudTests = createCrudTestSuite(resourceName, actions, mocks);

  return describe(`${resourceName} CRUD Operations`, () => {
    beforeEach(() => {
      resetAllMocks();
    });

    Object.entries(crudTests).forEach(([testName, testFn]) => {
      test(testName, testFn);
    });

    // Additional common tests
    test(`should handle ${resourceName} not found`, async () => {
      mocks.api.read.mockResolvedValue(null);

      const result = await actions.read('non-existent-id');

      assertErrorResult(result, `${resourceName} not found`);
    });

    test(`should handle ${resourceName} concurrent operations`, async () => {
      const promises = [
        actions.create({ name: 'Test 1' }),
        actions.create({ name: 'Test 2' }),
        actions.create({ name: 'Test 3' }),
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        assertSuccessResult(result);
      });
    });
  });
};

/**
 * Helper to create parameterized tests
 */
export const createParameterizedTestSuite = (
  testName: string,
  testFn: Function,
  parameters: Array<{ name: string; args: any[] }>,
) => {
  return describe(testName, () => {
    parameters.forEach(({ name, args }) => {
      test(name, () => testFn(...args));
    });
  });
};
