/**
 * Test coverage for validation.ts utilities
 * Tests configuration validation functions and schemas
 */

import { describe, expect, vi } from 'vitest';

// Import after mocking
import {
  validateProviderConfig,
  validateRetryConfig,
  validateScheduleConfig,
  validateWorkflowDefinition,
  validateWorkflowStep,
} from '../../src/shared/utils/validation';

// Mock dependencies
vi.mock('../../../src/shared/utils/errors', () => ({
  ConfigurationError: vi.fn().mockImplementation((message, path, context) => {
    const error = new Error(message);
    (error as any).name = 'ConfigurationError';
    (error as any).configPath = path;
    (error as any).context = context;
    return error;
  }),
  WorkflowValidationError: vi.fn().mockImplementation((message, errors, context) => {
    const error = new Error(message);
    (error as any).name = 'WorkflowValidationError';
    (error as any).validationErrors = errors;
    (error as any).context = context;
    return error;
  }),
}));

describe('validation Utilities', () => {
  describe('validateRetryConfig', () => {
    test('should validate valid retry config', () => {
      const validConfig = {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential' as const,
      };

      expect(() => validateRetryConfig(validConfig)).not.toThrow();
    });

    test('should validate retry config with all options', () => {
      const validConfig = {
        maxAttempts: 5,
        delay: 500,
        backoff: 'fixed' as const,
        jitter: true,
        maxDelay: 10000,
      };

      expect(() => validateRetryConfig(validConfig)).not.toThrow();
    });

    test('should throw ConfigurationError for invalid maxAttempts', () => {
      const invalidConfig = {
        maxAttempts: 0,
        delay: 1000,
        backoff: 'exponential' as const,
      };

      expect(() => validateRetryConfig(invalidConfig)).toThrow();
    });

    test('should throw ConfigurationError for invalid delay', () => {
      const invalidConfig = {
        maxAttempts: 3,
        delay: -1000,
        backoff: 'exponential' as const,
      };

      expect(() => validateRetryConfig(invalidConfig)).toThrow();
    });

    test('should throw ConfigurationError for invalid backoff', () => {
      const invalidConfig = {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'invalid' as any,
      };

      expect(() => validateRetryConfig(invalidConfig)).toThrow();
    });

    test('should handle maxAttempts exceeding limit', () => {
      const invalidConfig = {
        maxAttempts: 15,
        delay: 1000,
        backoff: 'exponential' as const,
      };

      expect(() => validateRetryConfig(invalidConfig)).toThrow();
    });
  });

  describe('validateScheduleConfig', () => {
    test('should validate valid schedule config', () => {
      const validConfig = {
        workflowId: 'test-workflow',
        enabled: true,
      };

      expect(() => validateScheduleConfig(validConfig)).not.toThrow();
    });

    test('should validate schedule config with all options', () => {
      const validConfig = {
        workflowId: 'test-workflow',
        cron: '0 0 * * *',
        enabled: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        runAt: new Date('2024-06-01'),
        timezone: 'UTC',
        maxRetries: 3,
        retryDelay: 1000,
        input: { key: 'value' },
        metadata: { source: 'test' },
      };

      expect(() => validateScheduleConfig(validConfig)).not.toThrow();
    });

    test('should throw ConfigurationError for missing workflowId', () => {
      const invalidConfig = {
        enabled: true,
      } as any;

      expect(() => validateScheduleConfig(invalidConfig)).toThrow();
    });

    test('should throw ConfigurationError for empty workflowId', () => {
      const invalidConfig = {
        workflowId: '',
        enabled: true,
      };

      expect(() => validateScheduleConfig(invalidConfig)).toThrow();
    });

    test('should handle dates correctly', () => {
      const validConfig = {
        workflowId: 'test-workflow',
        startDate: new Date(),
        endDate: new Date(),
        runAt: new Date(),
      };

      expect(() => validateScheduleConfig(validConfig)).not.toThrow();
    });
  });

  describe('validateProviderConfig', () => {
    test('should validate upstash workflow provider config', () => {
      const validConfig = {
        type: 'upstash-workflow' as const,
        baseUrl: 'https://test.upstash.io',
        qstash: {
          token: 'test-token',
        },
      };

      expect(() => validateProviderConfig(validConfig)).not.toThrow();
    });

    test('should validate rate limit provider config', () => {
      const validConfig = {
        type: 'rate-limit' as const,
        maxRequests: 100,
        windowMs: 60000,
      };

      expect(() => validateProviderConfig(validConfig)).not.toThrow();
    });

    test('should throw ConfigurationError for unknown provider type', () => {
      const invalidConfig = {
        type: 'unknown-provider' as any,
      };

      expect(() => validateProviderConfig(invalidConfig)).toThrow();
    });

    test('should throw ConfigurationError for invalid upstash config', () => {
      const invalidConfig = {
        type: 'upstash-workflow' as const,
        baseUrl: '',
        qstash: {
          token: '',
        },
      };

      expect(() => validateProviderConfig(invalidConfig)).toThrow();
    });

    test('should throw ConfigurationError for invalid rate limit config', () => {
      const invalidConfig = {
        type: 'rate-limit' as const,
        maxRequests: 0,
        windowMs: -1000,
      };

      expect(() => validateProviderConfig(invalidConfig)).toThrow();
    });
  });

  describe('validateWorkflowDefinition', () => {
    test('should validate valid workflow definition', () => {
      const validDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        steps: [
          {
            id: 'step-1',
            name: 'First Step',
            type: 'function',
            function: vi.fn(),
          },
        ],
      };

      const result = validateWorkflowDefinition(validDefinition);

      expect(result).toEqual(validDefinition);
    });

    test('should validate workflow with minimal required fields', () => {
      const validDefinition = {
        id: 'minimal-workflow',
        name: 'Minimal Workflow',
        steps: [],
      };

      const result = validateWorkflowDefinition(validDefinition);

      expect(result).toEqual(validDefinition);
    });

    test('should validate workflow with complex steps', () => {
      const validDefinition = {
        id: 'complex-workflow',
        name: 'Complex Workflow',
        steps: [
          {
            id: 'step-1',
            name: 'HTTP Request',
            type: 'http',
            url: 'https://api.example.com',
            method: 'GET',
          },
          {
            id: 'step-2',
            name: 'Processing',
            type: 'function',
            function: vi.fn(),
            retry: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
          },
        ],
        timeout: 30000,
        retry: {
          maxAttempts: 2,
          delay: 500,
          backoff: 'fixed',
        },
      };

      const result = validateWorkflowDefinition(validDefinition);

      expect(result).toEqual(validDefinition);
    });

    test('should throw WorkflowValidationError for missing id', () => {
      const invalidDefinition = {
        name: 'No ID Workflow',
        steps: [],
      } as any;

      expect(() => validateWorkflowDefinition(invalidDefinition)).toThrow();
    });

    test('should throw WorkflowValidationError for missing name', () => {
      const invalidDefinition = {
        id: 'no-name-workflow',
        steps: [],
      } as any;

      expect(() => validateWorkflowDefinition(invalidDefinition)).toThrow();
    });

    test('should throw WorkflowValidationError for invalid steps', () => {
      const invalidDefinition = {
        id: 'invalid-steps-workflow',
        name: 'Invalid Steps Workflow',
        steps: 'not-an-array' as any,
      };

      expect(() => validateWorkflowDefinition(invalidDefinition)).toThrow();
    });

    test('should handle workflow with schedule', () => {
      const validDefinition = {
        id: 'scheduled-workflow',
        name: 'Scheduled Workflow',
        steps: [],
        schedule: {
          workflowId: 'scheduled-workflow',
          cron: '0 0 * * *',
          enabled: true,
        },
      };

      const result = validateWorkflowDefinition(validDefinition);

      expect(result).toEqual(validDefinition);
    });
  });

  describe('validateWorkflowStep', () => {
    test('should validate valid workflow step', () => {
      const validStep = {
        id: 'test-step',
        name: 'Test Step',
        type: 'function',
        function: vi.fn(),
      };

      const result = validateWorkflowStep(validStep);

      expect(result).toEqual(validStep);
    });

    test('should validate HTTP step', () => {
      const validStep = {
        id: 'http-step',
        name: 'HTTP Step',
        type: 'http',
        url: 'https://api.example.com/data',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          key: 'value',
        },
      };

      const result = validateWorkflowStep(validStep);

      expect(result).toEqual(validStep);
    });

    test('should validate step with retry configuration', () => {
      const validStep = {
        id: 'retry-step',
        name: 'Retry Step',
        type: 'function',
        function: vi.fn(),
        retry: {
          maxAttempts: 3,
          delay: 1000,
          backoff: 'exponential',
        },
      };

      const result = validateWorkflowStep(validStep);

      expect(result).toEqual(validStep);
    });

    test('should validate step with condition', () => {
      const validStep = {
        id: 'conditional-step',
        name: 'Conditional Step',
        type: 'function',
        function: vi.fn(),
        condition: 'previousStep.success === true',
      };

      const result = validateWorkflowStep(validStep);

      expect(result).toEqual(validStep);
    });

    test('should throw WorkflowValidationError for missing id', () => {
      const invalidStep = {
        name: 'No ID Step',
        type: 'function',
        function: vi.fn(),
      } as any;

      expect(() => validateWorkflowStep(invalidStep)).toThrow();
    });

    test('should throw WorkflowValidationError for missing name', () => {
      const invalidStep = {
        id: 'no-name-step',
        type: 'function',
        function: vi.fn(),
      } as any;

      expect(() => validateWorkflowStep(invalidStep)).toThrow();
    });

    test('should throw WorkflowValidationError for missing type', () => {
      const invalidStep = {
        id: 'no-type-step',
        name: 'No Type Step',
        function: vi.fn(),
      } as any;

      expect(() => validateWorkflowStep(invalidStep)).toThrow();
    });

    test('should throw WorkflowValidationError for invalid HTTP step', () => {
      const invalidStep = {
        id: 'invalid-http-step',
        name: 'Invalid HTTP Step',
        type: 'http',
        url: 'not-a-url',
        method: 'INVALID_METHOD',
      };

      expect(() => validateWorkflowStep(invalidStep)).toThrow();
    });

    test('should handle step with timeout', () => {
      const validStep = {
        id: 'timeout-step',
        name: 'Timeout Step',
        type: 'function',
        function: vi.fn(),
        timeout: 5000,
      };

      const result = validateWorkflowStep(validStep);

      expect(result).toEqual(validStep);
    });

    test('should handle step with dependencies', () => {
      const validStep = {
        id: 'dependent-step',
        name: 'Dependent Step',
        type: 'function',
        function: vi.fn(),
        dependsOn: ['step-1', 'step-2'],
      };

      const result = validateWorkflowStep(validStep);

      expect(result).toEqual(validStep);
    });
  });

  describe('edge Cases and Error Handling', () => {
    test('should handle null and undefined inputs gracefully', () => {
      expect(() => validateRetryConfig(null as any)).toThrow();
      expect(() => validateRetryConfig(undefined as any)).toThrow();
      expect(() => validateScheduleConfig(null as any)).toThrow();
      expect(() => validateScheduleConfig(undefined as any)).toThrow();
      expect(() => validateProviderConfig(null as any)).toThrow();
      expect(() => validateProviderConfig(undefined as any)).toThrow();
      expect(() => validateWorkflowDefinition(null as any)).toThrow();
      expect(() => validateWorkflowDefinition(undefined as any)).toThrow();
      expect(() => validateWorkflowStep(null as any)).toThrow();
      expect(() => validateWorkflowStep(undefined as any)).toThrow();
    });

    test('should handle empty objects', () => {
      expect(() => validateRetryConfig({} as any)).toThrow();
      expect(() => validateScheduleConfig({} as any)).toThrow();
      expect(() => validateProviderConfig({} as any)).toThrow();
      expect(() => validateWorkflowDefinition({} as any)).toThrow();
      expect(() => validateWorkflowStep({} as any)).toThrow();
    });

    test('should validate JSON values correctly', () => {
      const validDefinition = {
        id: 'json-workflow',
        name: 'JSON Workflow',
        steps: [],
        metadata: {
          string: 'value',
          number: 42,
          boolean: true,
          null: null,
          array: [1, 2, 3],
          object: { nested: 'value' },
        },
      };

      const result = validateWorkflowDefinition(validDefinition);

      expect(result).toEqual(validDefinition);
    });

    test('should handle complex nested structures', () => {
      const complexDefinition = {
        id: 'complex-workflow',
        name: 'Complex Workflow',
        steps: [
          {
            id: 'complex-step',
            name: 'Complex Step',
            type: 'http',
            url: 'https://api.example.com/complex',
            method: 'POST',
            headers: {
              Authorization: 'Bearer token',
              'Content-Type': 'application/json',
            },
            body: {
              data: {
                nested: {
                  deep: {
                    value: 'test',
                    array: [1, 2, { nested: true }],
                  },
                },
              },
            },
            retry: {
              maxAttempts: 5,
              delay: 2000,
              backoff: 'exponential',
              maxDelay: 30000,
              jitter: true,
            },
            timeout: 15000,
            dependsOn: ['prep-step'],
            condition: 'context.shouldRun === true',
          },
        ],
        retry: {
          maxAttempts: 3,
          delay: 1000,
          backoff: 'linear',
        },
        timeout: 60000,
        metadata: {
          version: '2.0',
          tags: ['api', 'integration'],
          config: {
            retries: true,
            logging: false,
          },
        },
      };

      const result = validateWorkflowDefinition(complexDefinition);

      expect(result).toEqual(complexDefinition);
    });
  });
});
