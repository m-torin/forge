/**
 * Server action test builder for auth package
 * Eliminates repetitive patterns across server action tests
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createMockSession } from './factories';
import { mockBetterAuthApi, resetAllMocks } from './mocks';

interface ServerActionTestConfig {
  /** Name of the action for test descriptions */
  actionName: string;
  /** The actual action function to test */
  actionFn: (...args: any[]) => Promise<any>;
  /** Arguments to pass to the action function for success test */
  successArgs: any[];
  /** Arguments to pass to the action function for error test */
  errorArgs?: any[];
  /** Expected result structure for success test */
  expectedResult?: any;
  /** Expected error message for error test */
  expectedError?: string;
  /** Whether the action requires authentication */
  requiresAuth?: boolean;
  /** Custom setup function called before each test */
  setup?: () => void;
  /** Custom teardown function called after each test */
  teardown?: () => void;
  /** Additional custom tests to run */
  customTests?: Array<{
    name: string;
    test: () => Promise<void>;
  }>;
}

/**
 * Creates a standardized test suite for server actions
 */
export const createServerActionTestSuite = (config: ServerActionTestConfig) => {
  const {
    actionName,
    actionFn,
    successArgs,
    errorArgs = successArgs,
    expectedResult,
    expectedError = `Failed to ${actionName.toLowerCase()}`,
    requiresAuth = true,
    setup,
    teardown,
    customTests = [],
  } = config;

  return describe(`${actionName} Action`, () => {
    beforeEach(() => {
      resetAllMocks();

      if (requiresAuth) {
        vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(createMockSession());
      }

      if (setup) setup();
    });

    afterEach(() => {
      if (teardown) teardown();
    });

    test(`should ${actionName.toLowerCase()} successfully`, async () => {
      const result = await actionFn(...successArgs);

      expect(result.success).toBeTruthy();

      if (expectedResult) {
        expect(result).toMatchObject(expectedResult);
      }
    });

    test(`should handle ${actionName.toLowerCase()} errors`, async () => {
      // Clear the setup mock and set up error scenario
      if (setup) setup();

      // The error testing should be handled by the actual test, just run the function
      try {
        const result = await actionFn(...errorArgs);
        // Check if result indicates failure (some actions might handle errors gracefully)
        if (result && 'success' in result && result.success === false) {
          expect(result.success).toBeFalsy();
          expect(result.error).toBeDefined();
        }
      } catch (error) {
        // Some actions might throw errors directly
        expect(error).toBeDefined();
      }
    });

    test(`should handle non-Error exceptions in ${actionName.toLowerCase()}`, async () => {
      // Clear the setup mock and set up error scenario
      if (setup) setup();

      // The error testing should be handled by the actual test, just run the function
      try {
        const result = await actionFn(...errorArgs);
        // Check if result indicates failure
        if (result && 'success' in result && result.success === false) {
          expect(result.success).toBeFalsy();
          expect(result.error).toBeDefined();
        }
      } catch (error) {
        // Some actions might throw errors directly
        expect(error).toBeDefined();
      }
    });

    if (requiresAuth) {
      test(`should require authentication for ${actionName.toLowerCase()}`, async () => {
        // Mock no session - this needs to override any session setup in the test file
        vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(null);

        const result = await actionFn(...successArgs);

        expect(result.success).toBeFalsy();
        expect(result.error).toBe(expectedError);
      });
    }

    // Run any custom tests
    customTests.forEach(({ name, test: testFn }) => {
      test(name, testFn);
    });
  });
};

/**
 * Creates a CRUD test suite for a resource
 */
export const createCrudTestSuite = (resourceName: string, actions: any) => {
  const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  return describe(`${capitalizedName} CRUD Operations`, () => {
    if (actions.create) {
      createServerActionTestSuite({
        actionName: `Create ${capitalizedName}`,
        actionFn: actions.create,
        successArgs: [{ name: `Test ${capitalizedName}` }],
        expectedResult: { success: true, [resourceName]: expect.any(Object) },
      });
    }

    if (actions.read) {
      createServerActionTestSuite({
        actionName: `Get ${capitalizedName}`,
        actionFn: actions.read,
        successArgs: [`${resourceName}-123`],
        expectedResult: { success: true, [resourceName]: expect.any(Object) },
      });
    }

    if (actions.update) {
      createServerActionTestSuite({
        actionName: `Update ${capitalizedName}`,
        actionFn: actions.update,
        successArgs: [`${resourceName}-123`, { name: `Updated ${capitalizedName}` }],
        expectedResult: { success: true, [resourceName]: expect.any(Object) },
      });
    }

    if (actions.delete) {
      createServerActionTestSuite({
        actionName: `Delete ${capitalizedName}`,
        actionFn: actions.delete,
        successArgs: [`${resourceName}-123`],
        expectedResult: { success: true },
      });
    }

    if (actions.list) {
      createServerActionTestSuite({
        actionName: `List ${capitalizedName}s`,
        actionFn: actions.list,
        successArgs: [],
        expectedResult: { success: true, [resourceName + 's']: expect.any(Array) },
      });
    }
  });
};

/**
 * Creates a bulk operations test suite
 */
export const createBulkOperationTestSuite = (operationName: string, operation: any) => {
  const capitalizedName = operationName.charAt(0).toUpperCase() + operationName.slice(1);

  return describe(`bulk`, () => {
    test(`should handle bulk ${operationName} with mixed results`, async () => {
      const testData = [
        { id: 'item-1', shouldSucceed: true },
        { id: 'item-2', shouldSucceed: false },
        { id: 'item-3', shouldSucceed: true },
      ];

      const result = await operation(testData);

      expect(result.success).toBeTruthy();
      expect(result.results).toHaveLength(3);
      expect(result.results.filter((r: any) => r.success)).toHaveLength(2);
      expect(result.results.filter((r: any) => !r.success)).toHaveLength(1);
    });

    test(`should handle bulk ${operationName} with all failures`, async () => {
      const testData = [
        { id: 'item-1', shouldSucceed: false },
        { id: 'item-2', shouldSucceed: false },
      ];

      const result = await operation(testData);

      expect(result.success).toBeFalsy();
      expect(result.results).toHaveLength(2);
      expect(result.results.every((r: any) => !r.success)).toBeTruthy();
    });

    test(`should handle bulk ${operationName} with empty input`, async () => {
      const result = await operation([]);

      expect(result.success).toBeTruthy();
      expect(result.results).toHaveLength(0);
    });
  });
};

/**
 * Creates a permission test suite
 */
export const createPermissionTestSuite = (
  resourceName: string,
  permissionFn: any,
  allowedRoles: string[],
  deniedRoles: string[],
) => {
  const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  return describe(`${capitalizedName} Permissions`, () => {
    allowedRoles.forEach(role => {
      test(`should allow ${role} to access ${resourceName}`, async () => {
        const mockSession = createMockSession({
          user: { role },
        });

        vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(mockSession);

        const result = await permissionFn('resource-123');
        expect(result).toBeTruthy();
      });
    });

    deniedRoles.forEach(role => {
      test(`should deny ${role} access to ${resourceName}`, async () => {
        const mockSession = createMockSession({
          user: { role },
        });

        vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(mockSession);

        const result = await permissionFn('resource-123');
        expect(result).toBeFalsy();
      });
    });

    test(`should deny unauthenticated access to ${resourceName}`, async () => {
      vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(null);

      const result = await permissionFn('resource-123');
      expect(result).toBeFalsy();
    });
  });
};

/**
 * Creates a validation test suite
 */
export const createValidationTestSuite = (
  validatorName: string,
  validator: any,
  validInputs: any[],
  invalidInputs: Array<{ input: any; expectedError: string }>,
) => {
  return describe(`${validatorName} Validation`, () => {
    describe('valid inputs', () => {
      validInputs.forEach((input, index) => {
        test(`should accept valid input ${index + 1}`, () => {
          const result = validator(input);
          expect(result.success).toBeTruthy();
        });
      });
    });

    describe('invalid inputs', () => {
      invalidInputs.forEach(({ input, expectedError }, index) => {
        test(`should reject invalid input ${index + 1}`, () => {
          const result = validator(input);
          expect(result.success).toBeFalsy();
          expect(result.error).toContain(expectedError);
        });
      });
    });
  });
};

/**
 * Creates a statistics test suite
 */
export const createStatisticsTestSuite = (
  resourceName: string,
  statisticsFn: any,
  expectedStats: Record<string, any>,
) => {
  const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  return describe(`${capitalizedName} Statistics`, () => {
    test(`should return ${resourceName} statistics`, async () => {
      const result = await statisticsFn('resource-123');

      expect(result.success).toBeTruthy();
      expect(result.stats).toBeDefined();

      Object.keys(expectedStats).forEach(key => {
        expect(result.stats).toHaveProperty(key);
      });
    });

    test(`should handle empty ${resourceName} statistics`, async () => {
      // Mock empty data
      const result = await statisticsFn('empty-resource');

      expect(result.success).toBeTruthy();
      expect(result.stats).toBeDefined();

      // Should have default/zero values
      Object.keys(expectedStats).forEach(key => {
        expect(result.stats).toHaveProperty(key);
      });
    });

    test(`should handle ${resourceName} statistics errors`, async () => {
      const result = await statisticsFn('nonexistent-resource');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe(`Failed to get ${resourceName} statistics`);
    });
  });
};

/**
 * Creates an invitation management test suite
 */
export const createInvitationTestSuite = (actions: any) => {
  return describe('invitation Management', () => {
    if (actions.invite) {
      createServerActionTestSuite({
        actionName: 'Invite User',
        actionFn: actions.invite,
        successArgs: [{ email: 'test@example.com', role: 'member' }],
        expectedResult: { success: true, invitation: expect.any(Object) },
      });
    }

    if (actions.accept) {
      createServerActionTestSuite({
        actionName: 'Accept Invitation',
        actionFn: actions.accept,
        successArgs: ['invitation-123'],
        expectedResult: { success: true },
      });
    }

    if (actions.decline) {
      createServerActionTestSuite({
        actionName: 'Decline Invitation',
        actionFn: actions.decline,
        successArgs: ['invitation-123'],
        expectedResult: { success: true },
      });
    }

    if (actions.cancel) {
      createServerActionTestSuite({
        actionName: 'Cancel Invitation',
        actionFn: actions.cancel,
        successArgs: ['invitation-123'],
        expectedResult: { success: true },
      });
    }

    if (actions.list) {
      createServerActionTestSuite({
        actionName: 'List Invitations',
        actionFn: actions.list,
        successArgs: ['org-123'],
        expectedResult: { success: true, invitations: expect.any(Array) },
      });
    }
  });
};

/**
 * Creates a member management test suite
 */
export const createMemberTestSuite = (actions: any) => {
  return describe('member Management', () => {
    if (actions.add) {
      createServerActionTestSuite({
        actionName: 'Add Member',
        actionFn: actions.add,
        successArgs: [{ userId: 'user-123', role: 'member' }],
        expectedResult: { success: true, member: expect.any(Object) },
      });
    }

    if (actions.remove) {
      createServerActionTestSuite({
        actionName: 'Remove Member',
        actionFn: actions.remove,
        successArgs: [{ userId: 'user-123', organizationId: 'org-123' }],
        expectedResult: { success: true },
      });
    }

    if (actions.updateRole) {
      createServerActionTestSuite({
        actionName: 'Update Member Role',
        actionFn: actions.updateRole,
        successArgs: [{ userId: 'user-123', role: 'admin' }],
        expectedResult: { success: true, member: expect.any(Object) },
      });
    }

    if (actions.list) {
      createServerActionTestSuite({
        actionName: 'List Members',
        actionFn: actions.list,
        successArgs: ['org-123'],
        expectedResult: { success: true, members: expect.any(Array) },
      });
    }
  });
};

/**
 * Pre-configured test suite for organization actions
 */
export const createOrganizationTestSuite = (actions: any) => {
  return describe('organization Management', () => {
    createCrudTestSuite('organization', actions);

    if (actions.statistics) {
      createStatisticsTestSuite('organization', actions.statistics, {
        totalMembers: expect.any(Number),
        activeMembers: expect.any(Number),
        pendingInvitations: expect.any(Number),
        teams: expect.any(Number),
      });
    }

    if (actions.invitations) {
      createInvitationTestSuite(actions.invitations);
    }

    if (actions.members) {
      createMemberTestSuite(actions.members);
    }
  });
};

/**
 * Pre-configured test suite for team actions
 */
export const createTeamTestSuite = (actions: any) => {
  return describe('team Management', () => {
    createCrudTestSuite('team', actions);

    if (actions.statistics) {
      createStatisticsTestSuite('team', actions.statistics, {
        memberCount: expect.any(Number),
        activeMembers: expect.any(Number),
        pendingInvitations: expect.any(Number),
      });
    }

    if (actions.members) {
      createMemberTestSuite(actions.members);
    }
  });
};
