import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  sanitizeConfig,
  validateEnvironmentVariables,
  validateProviderConfig,
  validateRetryConfig,
  validateScheduleConfig,
  validateWorkflowDefinition,
  validateWorkflowStep,
} from '../../src/shared/utils/validation';

// We'll test the actual validation functions, not custom ones
describe('validation utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateWorkflowDefinition', () => {
    test('should validate valid workflow definition', () => {
      const definition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            action: 'processData',
          },
        ],
      };

      expect(() => validateWorkflowDefinition(definition)).not.toThrow();
    });

    test('should reject workflow without id', () => {
      const definition = {
        name: 'Test Workflow',
        steps: [],
      };

      expect(() => validateWorkflowDefinition(definition as any)).toThrow('Invalid workflow definition');
    });

    test('should reject workflow without steps', () => {
      const definition = {
        id: 'test-workflow',
        name: 'Test Workflow',
      };

      expect(() => validateWorkflowDefinition(definition as any)).toThrow('Invalid workflow definition');
    });

    test('should reject workflow with empty steps array', () => {
      const definition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        steps: [],
      };

      expect(() => validateWorkflowDefinition(definition)).toThrow('Invalid workflow definition');
    });

    test('should validate workflow with multiple steps', () => {
      const definition = {
        id: 'multi-step-workflow',
        name: 'Multi Step Workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            action: 'processData',
          },
          {
            id: 'step2',
            name: 'Second Step',
            action: 'validateData',
          },
        ],
      };

      expect(() => validateWorkflowDefinition(definition)).not.toThrow();
    });

    test('should handle workflow with description', () => {
      const definition = {
        id: 'described-workflow',
        name: 'Described Workflow',
        version: '1.0.0',
        description: 'A workflow with description',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            action: 'processData',
          },
        ],
      };

      expect(() => validateWorkflowDefinition(definition)).not.toThrow();
    });
  });

  describe('validateWorkflowStep', () => {
    test('should validate valid workflow step', () => {
      const step = {
        id: 'test-step',
        name: 'Test Step',
        action: 'processData',
      };

      expect(() => validateWorkflowStep(step)).not.toThrow();
    });

    test('should reject step without id', () => {
      const step = {
        name: 'Test Step',
        type: 'task',
      };

      expect(() => validateWorkflowStep(step as any)).toThrow('Invalid workflow step');
    });

    test('should reject step without action', () => {
      const step = {
        id: 'test-step',
        name: 'Test Step',
      };

      expect(() => validateWorkflowStep(step as any)).toThrow('Invalid workflow step');
    });

    test('should validate step with valid actions', () => {
      const validActions = [
        'processData',
        'validateInput',
        'sendEmail',
        'calculateSum',
        'logActivity',
      ];

      validActions.forEach(action => {
        const step = {
          id: `${action}-step`,
          name: `${action} Step`,
          action,
        };

        expect(() => validateWorkflowStep(step)).not.toThrow();
      });
    });

    test('should validate step with optional fields', () => {
      const step = {
        id: 'optional-step',
        name: 'Optional Step',
        action: 'processData',
        optional: true,
        condition: 'data.isValid',
      };

      expect(() => validateWorkflowStep(step)).not.toThrow();
    });

    test('should validate step with timeout', () => {
      const step = {
        id: 'timeout-step',
        name: 'Timeout Step',
        action: 'processData',
        timeout: 5000,
      };

      expect(() => validateWorkflowStep(step)).not.toThrow();
    });

    test('should validate step with dependencies', () => {
      const step = {
        id: 'dependent-step',
        name: 'Dependent Step',
        action: 'processData',
        dependsOn: ['step1', 'step2'],
      };

      expect(() => validateWorkflowStep(step)).not.toThrow();
    });
  });

  describe('validateScheduleConfig', () => {
    test('should validate valid cron schedule', () => {
      const config = {
        workflowId: 'workflow-456',
        cron: '0 0 * * *', // Daily at midnight
        enabled: true,
      };

      expect(() => validateScheduleConfig(config)).not.toThrow();
    });

    test('should validate schedule with runAt date', () => {
      const config = {
        workflowId: 'workflow-789',
        runAt: new Date('2024-12-31T23:59:59Z'),
        enabled: true,
      };

      expect(() => validateScheduleConfig(config)).not.toThrow();
    });

    test('should validate disabled schedule', () => {
      const config = {
        workflowId: 'workflow-123',
        cron: '0 12 * * *',
        enabled: false,
      };

      expect(() => validateScheduleConfig(config)).not.toThrow();
    });

    test('should validate schedule with metadata', () => {
      const config = {
        workflowId: 'workflow-456',
        cron: '0 6 * * *',
        enabled: true,
        metadata: {
          createdBy: 'admin',
          department: 'operations',
        },
      };

      expect(() => validateScheduleConfig(config)).not.toThrow();
    });
  });

  describe('validateRetryConfig', () => {
    test('should validate valid retry configuration', () => {
      const config = {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential',
      };

      expect(() => validateRetryConfig(config)).not.toThrow();
    });

    test('should validate retry config with different backoff strategies', () => {
      const strategies = ['linear', 'exponential', 'fixed'];

      strategies.forEach(backoff => {
        const config = {
          maxAttempts: 3,
          delay: 1000,
          backoff,
        };

        expect(() => validateRetryConfig(config)).not.toThrow();
      });
    });

    test('should validate retry config with jitter', () => {
      const config = {
        maxAttempts: 5,
        delay: 500,
        backoff: 'exponential',
        jitter: true,
      };

      expect(() => validateRetryConfig(config)).not.toThrow();
    });

    test('should validate retry config with max delay', () => {
      const config = {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential',
        maxDelay: 30000,
      };

      expect(() => validateRetryConfig(config)).not.toThrow();
    });
  });

  describe('validateProviderConfig', () => {
    test('should validate Upstash workflow provider config', () => {
      const config = {
        type: 'upstash-workflow',
        name: 'upstash-provider',
        enabled: true,
        config: {
          baseUrl: 'https://qstash.upstash.io',
          qstashToken: 'qstash-token-123',
          redisUrl: 'https://redis-url.upstash.io',
          redisToken: 'redis-token-123',
        },
      };

      expect(() => validateProviderConfig(config)).not.toThrow();
    });

    test('should validate Upstash QStash provider config', () => {
      const config = {
        type: 'upstash-qstash',
        name: 'qstash-provider',
        enabled: true,
        config: {
          baseUrl: 'https://qstash.upstash.io',
          token: 'qstash-token-456',
          retries: 3,
          delay: 1000,
        },
      };

      expect(() => validateProviderConfig(config)).not.toThrow();
    });

    test('should validate rate limit provider config', () => {
      const config = {
        type: 'rate-limit',
        name: 'rate-limiter',
        enabled: true,
        config: {
          redisUrl: 'https://redis-url.upstash.io',
          redisToken: 'redis-token-789',
          algorithm: 'sliding-window',
          defaultLimit: {
            requests: 100,
            window: 60,
          },
        },
      };

      expect(() => validateProviderConfig(config)).not.toThrow();
    });
  });

  describe('validateEnvironmentVariables', () => {
    test('should validate required environment variables', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        TEST_VAR_1: 'value1',
        TEST_VAR_2: 'value2',
      };

      const errors = validateEnvironmentVariables(['TEST_VAR_1', 'TEST_VAR_2']);

      expect(errors).toHaveLength(0);

      process.env = originalEnv;
    });

    test('should return errors for missing variables', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        TEST_VAR_1: 'value1',
        // TEST_VAR_2 is missing
      };

      const errors = validateEnvironmentVariables(['TEST_VAR_1', 'TEST_VAR_2']);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.message.includes('TEST_VAR_2'))).toBeTruthy();

      process.env = originalEnv;
    });

    test('should handle empty required variables list', () => {
      const errors = validateEnvironmentVariables([]);

      expect(errors).toHaveLength(0);
    });

    test('should validate with prefix pattern', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        WORKFLOW_API_KEY: 'key123',
        WORKFLOW_SECRET: 'secret456',
      };

      const errors = validateEnvironmentVariables(['WORKFLOW_API_KEY', 'WORKFLOW_SECRET']);

      expect(errors).toHaveLength(0);

      process.env = originalEnv;
    });
  });

  describe('sanitizeConfig', () => {
    test('should sanitize config with sensitive data', () => {
      const config = {
        appName: 'MyApp',
        password: 'secret123',
        apiKey: 'key-abc-123',
        timeout: 5000,
        token: 'bearer-token',
      };

      const sanitized = sanitizeConfig(config);

      expect(sanitized.appName).toBe('MyApp');
      expect(sanitized.timeout).toBe(5000);
      expect(sanitized.password).not.toBe('secret123');
      expect(sanitized.apiKey).not.toBe('key-abc-123');
      expect(sanitized.token).not.toBe('bearer-token');
    });

    test('should handle nested config objects', () => {
      const config = {
        database: {
          host: 'localhost',
          password: 'db-secret',
          port: 5432,
        },
        redis: {
          url: 'redis://localhost:6379',
          token: 'redis-token',
        },
        features: {
          enableMetrics: true,
          enableLogging: true,
        },
      };

      const sanitized = sanitizeConfig(config);

      expect(sanitized.database.host).toBe('localhost');
      expect(sanitized.database.port).toBe(5432);
      expect(sanitized.database.password).not.toBe('db-secret');
      expect(sanitized.redis.url).toBe('redis://localhost:6379');
      expect(sanitized.redis.token).not.toBe('redis-token');
      expect(sanitized.features.enableMetrics).toBeTruthy();
    });

    test('should handle arrays in config', () => {
      const config = {
        servers: ['server1.com', 'server2.com'],
        secrets: ['secret1', 'secret2'],
        ports: [3000, 3001, 3002],
      };

      const sanitized = sanitizeConfig(config);

      expect(sanitized.servers).toStrictEqual(['server1.com', 'server2.com']);
      expect(sanitized.ports).toStrictEqual([3000, 3001, 3002]);
      expect(sanitized.secrets).not.toStrictEqual(['secret1', 'secret2']);
    });

    test('should handle null and undefined values', () => {
      const config = {
        value1: null,
        value2: undefined,
        password: 'secret',
        normalValue: 'visible',
      };

      const sanitized = sanitizeConfig(config);

      expect(sanitized.value1).toBeNull();
      expect(sanitized.value2).toBeUndefined();
      expect(sanitized.normalValue).toBe('visible');
      expect(sanitized.password).not.toBe('secret');
    });
  });

  describe('edge Cases', () => {
    test('should handle null and undefined inputs gracefully', () => {
      expect(() => validateWorkflowDefinition(null as any)).toThrow('Invalid workflow definition');
      expect(() => validateWorkflowDefinition(undefined as any)).toThrow('Invalid workflow definition');
      expect(() => validateWorkflowStep(null as any)).toThrow('Invalid workflow step');
      expect(() => validateWorkflowStep(undefined as any)).toThrow('Invalid workflow step');
    });

    test('should handle empty objects', () => {
      expect(() => validateWorkflowDefinition({})).toThrow('Invalid workflow definition');
      expect(() => validateWorkflowStep({})).toThrow('Invalid workflow step');
      expect(() => validateScheduleConfig({})).toThrow('Invalid schedule configuration');
    });

    test('should handle very large workflow definitions', () => {
      const largeDefinition = {
        id: 'large-workflow',
        name: 'Large Workflow',
        version: '1.0.0',
        steps: Array(100)
          .fill(0)
          .map((_, i) => ({
            id: `step-${i}`,
            name: `Step ${i}`,
            action: 'processData',
          })),
      };

      expect(() => validateWorkflowDefinition(largeDefinition)).not.toThrow();
    });

    test('should handle special characters in identifiers', () => {
      const definition = {
        id: 'workflow-with-special-chars_123',
        name: 'Workflow with Special Characters',
        version: '1.0.0',
        steps: [
          {
            id: 'step_with_underscores-and-dashes.123',
            name: 'Step with Special Characters',
            action: 'processData',
          },
        ],
      };

      expect(() => validateWorkflowDefinition(definition)).not.toThrow();
    });

    test('should sanitize very large config objects', () => {
      const largeConfig: any = {};
      for (let i = 0; i < 1000; i++) {
        largeConfig[`field${i}`] = `value${i}`;
      }
      largeConfig.password = 'secret';
      largeConfig.apiKey = 'key123';

      const sanitized = sanitizeConfig(largeConfig);

      expect(sanitized.field0).toBe('value0');
      expect(sanitized.field999).toBe('value999');
      expect(sanitized.password).not.toBe('secret');
      expect(sanitized.apiKey).not.toBe('key123');
    });
  });
});
