/**
 * Example mock validation testing for Vitest
 * This demonstrates how to use the mock validation utilities
 */

import { describe, expect, test, vi, type Mock } from 'vitest';
import { mockHealth, mockValidation, runtimeValidation } from '../utils/mock-validation';

// Example service to mock
interface UserService {
  getUser(id: string): Promise<{ id: string; name: string; email: string }>;
  createUser(userData: {
    name: string;
    email: string;
  }): Promise<{ id: string; name: string; email: string }>;
  updateUser(
    id: string,
    updates: Partial<{ name: string; email: string }>,
  ): Promise<{ id: string; name: string; email: string }>;
  deleteUser(id: string): Promise<void>;
}

// Example API client to mock
interface ApiClient {
  get(url: string): Promise<any>;
  post(url: string, data: any): Promise<any>;
  put(url: string, data: any): Promise<any>;
  delete(url: string): Promise<any>;
}

describe('mock Validation Examples', () => {
  describe('basic Mock Validation', () => {
    test('should validate a well-configured mock', () => {
      const mockUserService = vi.fn();
      mockUserService.mockName('UserService.getUser');
      mockUserService.mockResolvedValue({ id: '1', name: 'John', email: 'john@example.com' });

      // Call the mock
      mockUserService('user-123');

      // Validate the mock
      const validation = mockValidation.validateMock(mockUserService, {
        expectCalled: true,
        minCalls: 1,
        validateArgs: true,
        validateReturnValues: true,
        validateConfig: true,
      });

      expect(validation.valid).toBeTruthy();
      expect(validation.errors).toHaveLength(0);
      expect(validation.coverage.called).toBeTruthy();
      expect(validation.coverage.callCount).toBe(1);
    });

    test('should detect unused mock', () => {
      const unusedMock = vi.fn();
      unusedMock.mockName('UnusedService.someMethod');

      const validation = mockValidation.validateMock(unusedMock, {
        checkUnused: true,
      });

      expect(validation.valid).toBeTruthy(); // Not an error, just a warning
      expect(validation.warnings).toContain('Mock was created but never called');
      expect(validation.coverage.called).toBeFalsy();
    });

    test('should detect mock with missing implementation', () => {
      const mockWithoutImpl = vi.fn();
      // No implementation set

      const validation = mockValidation.validateMock(mockWithoutImpl, {
        validateConfig: true,
      });

      expect(validation.warnings).toContain('Mock has no implementation defined');
      expect(validation.warnings).toContain('Mock has no descriptive name set');
    });

    test('should validate mock call count bounds', () => {
      const mockService = vi.fn();
      mockService.mockName('BoundedService.method');

      // Call mock 5 times
      for (let i = 0; i < 5; i++) {
        mockService(`call-${i}`);
      }

      // Validate with bounds
      const validation = mockValidation.validateMock(mockService, {
        minCalls: 3,
        maxCalls: 4, // This should fail
      });

      expect(validation.valid).toBeFalsy();
      expect(validation.errors).toContain('Mock was called 5 times, expected at most 4');
    });

    test('should validate mock arguments consistency', () => {
      const mockService = vi.fn();
      mockService.mockName('InconsistentService.method');

      // Call with different argument counts
      mockService('arg1');
      mockService('arg1', 'arg2');
      mockService('arg1', 'arg2', 'arg3');

      const validation = mockValidation.validateMock(mockService, {
        validateArgs: true,
      });

      expect(validation.warnings).toContain(
        'Mock called with inconsistent argument counts: 2 calls',
      );
    });

    test('should validate mock return values', () => {
      const mockService = vi.fn();
      mockService.mockName('ThrowingService.method');

      // Mock implementations that throw and return undefined
      mockService
        .mockImplementationOnce(() => {
          throw new Error('Test error');
        })
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => ({ success: true }));

      // Call mock
      try {
        mockService('call1');
      } catch {
        // Expected to throw
      }
      mockService('call2');
      mockService('call3');

      const validation = mockValidation.validateMock(mockService, {
        validateReturnValues: true,
      });

      expect(validation.warnings).toContain('Mock threw errors in 1 calls');
      expect(validation.warnings).toContain('Mock returned undefined in 1 calls');
    });
  });

  describe('mock Health Checking', () => {
    test('should check mock health', () => {
      const healthyMock = vi.fn();
      healthyMock.mockName('HealthyService.method');
      healthyMock.mockResolvedValue({ success: true });

      // Call mock a reasonable number of times
      for (let i = 0; i < 10; i++) {
        healthyMock(`data-${i}`);
      }

      const health = mockHealth.checkMockHealth(healthyMock);

      expect(health.healthy).toBeTruthy();
      expect(health.issues).toHaveLength(0);
      expect(health.performance.avgCallTime).toBeLessThan(100);
    });

    test('should detect performance issues', () => {
      const slowMock = vi.fn();
      slowMock.mockName('SlowService.method');

      // Simulate excessive calls
      for (let i = 0; i < 1500; i++) {
        slowMock(`data-${i}`);
      }

      const health = mockHealth.checkMockHealth(slowMock);

      expect(health.healthy).toBeFalsy();
      expect(health.issues).toContain('Mock has excessive calls: 1500');
      expect(health.suggestions).toContain('Consider batching calls or reviewing test logic');
    });

    test('should generate health report', () => {
      // Create some mocks with different health states
      const healthyMock = vi.fn().mockName('HealthyMock');
      const unhealthyMock = vi.fn().mockName('UnhealthyMock');

      healthyMock('test');

      // Make unhealthy mock with excessive calls
      for (let i = 0; i < 1100; i++) {
        unhealthyMock(`data-${i}`);
      }

      const report = mockHealth.generateHealthReport([unhealthyMock]);

      expect(report).toContain('=== Mock Health Report ===');
      expect(report).toContain('Total mocks:');
      expect(report).toContain('Performance Summary:');
    });
  });

  describe('runtime Validation', () => {
    test('should validate mock behavior at runtime', () => {
      const mockApi = vi.fn();
      mockApi.mockName('ApiClient.get');
      mockApi.mockResolvedValue({ data: 'test' });

      const expectedBehavior = {
        args: ['/api/users'],
        returns: { data: 'test' },
      };

      // Note: This is simplified for demo purposes
      // In practice, you'd test the actual mock behavior
      const isValid = runtimeValidation.validateAtRuntime(mockApi, expectedBehavior);

      expect(isValid).toBeTruthy();
    });

    test('should validate mock behavior consistency', () => {
      const consistentMock = vi.fn();
      consistentMock.mockName('ConsistentService.method');

      // Set up consistent behavior
      consistentMock.mockImplementation((input: string) => {
        return input.toUpperCase();
      });

      // Call with same arguments multiple times
      const result1 = consistentMock('test');
      const result2 = consistentMock('test');
      const result3 = consistentMock('hello');

      expect(result1).toBe('TEST');
      expect(result2).toBe('TEST');
      expect(result3).toBe('HELLO');

      const isConsistent = runtimeValidation.validateBehaviorConsistency(consistentMock);
      expect(isConsistent).toBeTruthy();
    });

    test('should detect inconsistent mock behavior', () => {
      const inconsistentMock = vi.fn();
      inconsistentMock.mockName('InconsistentService.method');

      // Set up inconsistent behavior
      inconsistentMock
        .mockReturnValueOnce('result1')
        .mockReturnValueOnce('result2')
        .mockReturnValueOnce('result1'); // Same args, different result

      inconsistentMock('same-input');
      inconsistentMock('same-input'); // This should return different result
      inconsistentMock('same-input'); // This should return same as first

      const isConsistent = runtimeValidation.validateBehaviorConsistency(inconsistentMock);
      expect(isConsistent).toBeFalsy();
    });

    test('should create runtime validator', () => {
      const mockService = vi.fn();
      mockService.mockName('ValidatedService.method');

      const expectations = [
        { args: ['input1'], returns: 'output1' },
        { args: ['input2'], returns: 'output2' },
        { args: ['error'], throws: 'Error message' },
      ];

      const validator = runtimeValidation.createRuntimeValidator(expectations);

      // Set up mock to meet expectations
      mockService.mockImplementation((input: string) => {
        if (input === 'error') {
          throw new Error('Error message');
        }
        return input.replace('input', 'output');
      });

      const isValid = validator(mockService);
      expect(isValid).toBeTruthy();
    });
  });

  describe('mock Validation Suite', () => {
    test('should validate all mocks in test suite', () => {
      // Create several mocks
      const mock1 = vi.fn().mockName('Service1.method');
      const mock2 = vi.fn().mockName('Service2.method');
      const mock3 = vi.fn().mockName('Service3.method');

      // Use some mocks
      mock1('test1');
      mock2('test2');
      // mock3 is unused

      const results = mockValidation.validateAllMocks([mock1, mock2, mock3], {
        checkUnused: true,
        validateConfig: true,
      });

      expect(results).toHaveLength(3);

      // Check that mock3 has unused warning
      const mock3Result = results.find(r => !r.coverage.called);
      expect(mock3Result?.warnings).toContain('Mock was created but never called');
    });

    test('should create validation report', () => {
      const mock1 = vi.fn().mockName('ReportMock1');
      const mock2 = vi.fn().mockName('ReportMock2');

      mock1('test');
      // mock2 is unused

      const results = mockValidation.validateAllMocks([mock1, mock2], {
        checkUnused: true,
      });

      const report = mockValidation.createValidationReport(results);

      expect(report).toContain('=== Mock Validation Report ===');
      expect(report).toContain('Total mocks:');
      expect(report).toContain('Coverage Summary:');
      expect(report).toContain('Used mocks:');
      expect(report).toContain('Unused mocks:');
    });

    test('should assert all mocks are valid', () => {
      const validMock = vi.fn().mockName('ValidMock');
      validMock('test');

      // This should not throw
      expect(() => {
        mockValidation.assertAllMocksValid([validMock], {
          expectCalled: false, // Don't require calls
          validateConfig: true,
        });
      }).not.toThrow();
    });

    test('should throw when mocks are invalid', () => {
      const invalidMock = vi.fn().mockName('InvalidMock');
      // Don't call the mock, but expect it to be called

      expect(() => {
        mockValidation.assertAllMocksValid([invalidMock], {
          expectCalled: true, // This will fail
        });
      }).toThrow('Mock validation failed');
    });

    test('should get mock usage statistics', () => {
      const usedMock = vi.fn().mockName('UsedMock');
      const unusedMock = vi.fn().mockName('UnusedMock');

      usedMock('test1');
      usedMock('test2');
      // unusedMock is not called

      const stats = mockValidation.getMockUsageStats([usedMock, unusedMock]);

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.used).toBeGreaterThan(0);
      expect(stats.unused).toBeGreaterThan(0);
      expect(stats.totalCalls).toBeGreaterThan(0);
      expect(stats.averageCalls).toBeGreaterThan(0);
    });
  });

  describe('advanced Mock Validation', () => {
    test('should validate complex mock scenarios', async () => {
      // Create a complex mock scenario
      const userService = vi.fn<UserService['getUser']>();
      userService.mockName('UserService.getUser');

      userService.mockImplementation(async (id: string) => {
        if (id === 'error') {
          throw new Error('User not found');
        }
        return {
          id,
          name: `User ${id}`,
          email: `user${id}@example.com`,
        };
      });

      // Test various scenarios
      const testScenarios = [
        { id: '1', expectSuccess: true },
        { id: '2', expectSuccess: true },
        { id: 'error', expectSuccess: false },
      ];

      // Test success cases
      const successCases = testScenarios.filter(s => s.expectSuccess);
      const errorCases = testScenarios.filter(s => !s.expectSuccess);

      await Promise.all(
        successCases.map(async scenario => {
          const result = await userService(scenario.id);
          expect(result.id).toBe(scenario.id);
        }),
      );

      await Promise.all(
        errorCases.map(async scenario => {
          await expect(userService(scenario.id)).rejects.toThrow('User not found');
        }),
      );

      // Validate the mock after all scenarios
      const validation = mockValidation.validateMock(userService, {
        expectCalled: true,
        minCalls: 3,
        maxCalls: 3,
        validateArgs: true,
        validateReturnValues: true,
        validateConfig: true,
      });

      expect(validation.valid).toBeTruthy();
      expect(validation.coverage.callCount).toBe(3);
    });

    test('should use custom validators', () => {
      const mockApi = vi.fn();
      mockApi.mockName('ApiClient.request');

      // Custom validator that checks if mock is used for specific endpoints
      const customValidator = (mock: Mock) => {
        const errors: string[] = [];
        const calls = mock.mock.calls;

        const hasUserEndpoint = calls.some(call => call[0] && call[0].includes('/users'));

        if (!hasUserEndpoint) {
          errors.push('Mock should be used with /users endpoint');
        }

        return errors;
      };

      // Use mock without user endpoint
      mockApi('/api/posts');

      const validation = mockValidation.validateMock(mockApi, {
        customValidators: [customValidator],
      });

      expect(validation.valid).toBeFalsy();
      expect(validation.errors).toContain('Mock should be used with /users endpoint');
    });
  });
});
