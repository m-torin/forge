import { beforeEach, describe, expect, test, vi } from 'vitest';

import { WorkflowValidationError } from '#/shared/utils/errors';
import {
  apiSchemas,
  commonSchemas,
  createValidatedHandler,
  sanitizeInput,
  validatePathParams,
  validateQueryParams,
  validateRequestBody,
} from '../../src/shared/utils/input-validation';

describe('input-validation utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('commonSchemas', () => {
    test('should validate workflow ID', () => {
      expect(() => commonSchemas.workflowId.parse('valid-workflow_123')).not.toThrow();
      expect(() => commonSchemas.workflowId.parse('workflow.test')).not.toThrow();
      expect(() => commonSchemas.workflowId.parse('')).toThrow();
      expect(() => commonSchemas.workflowId.parse('invalid@workflow')).toThrow();
      expect(() => commonSchemas.workflowId.parse('a'.repeat(256))).toThrow();
    });

    test('should validate execution ID', () => {
      expect(() => commonSchemas.executionId.parse('exec-123_test.run')).not.toThrow();
      expect(() => commonSchemas.executionId.parse('')).toThrow();
      expect(() => commonSchemas.executionId.parse('invalid#exec')).toThrow();
    });

    test('should validate schedule ID', () => {
      expect(() => commonSchemas.scheduleId.parse('schedule-daily_backup.v1')).not.toThrow();
      expect(() => commonSchemas.scheduleId.parse('')).toThrow();
      expect(() => commonSchemas.scheduleId.parse('schedule with spaces')).toThrow();
    });

    test('should validate alert ID', () => {
      expect(() => commonSchemas.alertId.parse('alert-critical_error.v2')).not.toThrow();
      expect(() => commonSchemas.alertId.parse('')).toThrow();
      expect(() => commonSchemas.alertId.parse('alert/invalid')).toThrow();
    });

    test('should validate limit with coercion', () => {
      expect(commonSchemas.limit.parse('25')).toBe(25);
      expect(commonSchemas.limit.parse(50)).toBe(50);
      expect(commonSchemas.limit.parse(undefined)).toBe(10); // default
      expect(() => commonSchemas.limit.parse('0')).toThrow();
      expect(() => commonSchemas.limit.parse('101')).toThrow();
      expect(() => commonSchemas.limit.parse('invalid')).toThrow();
    });

    test('should validate offset with coercion', () => {
      expect(commonSchemas.offset.parse('100')).toBe(100);
      expect(commonSchemas.offset.parse(0)).toBe(0);
      expect(commonSchemas.offset.parse(undefined)).toBe(0); // default
      expect(() => commonSchemas.offset.parse('-1')).toThrow();
      expect(() => commonSchemas.offset.parse('invalid')).toThrow();
    });

    test('should validate date string', () => {
      expect(() => commonSchemas.dateString.parse('2023-12-25T10:30:00Z')).not.toThrow();
      expect(() => commonSchemas.dateString.parse('2023-12-25T10:30:00.000Z')).not.toThrow();
      expect(() => commonSchemas.dateString.parse('invalid-date')).toThrow();
      expect(() => commonSchemas.dateString.parse('2023-12-25')).toThrow();
    });

    test('should validate tags array', () => {
      expect(() => commonSchemas.tags.parse(['tag1', 'tag2', 'tag3'])).not.toThrow();
      expect(() => commonSchemas.tags.parse([])).not.toThrow();
      expect(() => commonSchemas.tags.parse(['a'.repeat(51)])).toThrow(); // tag too long
      expect(() => commonSchemas.tags.parse(Array(21).fill('tag'))).toThrow(); // too many tags
    });

    test('should validate metadata object', () => {
      expect(() => commonSchemas.metadata.parse({ key: 'value', number: 42 })).not.toThrow();
      expect(() => commonSchemas.metadata.parse({})).not.toThrow();

      // Test size limit
      const largeObject = { data: 'x'.repeat(10001) };
      expect(() => commonSchemas.metadata.parse(largeObject)).toThrow();

      // Test circular reference handling
      const circular: any = { name: 'test' };
      circular.self = circular;
      expect(() => commonSchemas.metadata.parse(circular)).toThrow();
    });
  });

  describe('apiSchemas', () => {
    test('should validate execute workflow request', () => {
      const validRequest = {
        input: { data: 'test' },
        options: {
          priority: 'high' as const,
          delay: 5000,
          timeout: 30000,
        },
      };

      expect(() => apiSchemas.executeWorkflow.parse(validRequest)).not.toThrow();
      expect(() => apiSchemas.executeWorkflow.parse({})).not.toThrow(); // all optional

      // Invalid priority
      expect(() =>
        apiSchemas.executeWorkflow.parse({
          options: { priority: 'invalid' },
        }),
      ).toThrow();

      // Invalid delay
      expect(() =>
        apiSchemas.executeWorkflow.parse({
          options: { delay: -1 },
        }),
      ).toThrow();

      // Invalid timeout
      expect(() =>
        apiSchemas.executeWorkflow.parse({
          options: { timeout: 500 },
        }),
      ).toThrow();
    });

    test('should validate create schedule request', () => {
      const validRequest = {
        config: {
          cron: '0 9 * * *',
          timezone: 'UTC',
          enabled: true,
          maxExecutions: 100,
          input: { data: 'test' },
          metadata: { source: 'api' },
        },
      };

      expect(() => apiSchemas.createSchedule.parse(validRequest)).not.toThrow();
      expect(() => apiSchemas.createSchedule.parse({ config: {} })).not.toThrow();

      // Invalid maxExecutions
      expect(() =>
        apiSchemas.createSchedule.parse({
          config: { maxExecutions: 0 },
        }),
      ).toThrow();

      expect(() =>
        apiSchemas.createSchedule.parse({
          config: { maxExecutions: -5 },
        }),
      ).toThrow();
    });

    test('should validate create alert rule request', () => {
      const validRequest = {
        rule: {
          name: 'High Error Rate',
          condition: {
            type: 'failure_rate' as const,
            threshold: 0.1,
            window: 300000, // 5 minutes
          },
          actions: [
            {
              type: 'email' as const,
              config: { recipients: ['admin@example.com'] },
            },
          ],
          enabled: true,
        },
      };

      expect(() => apiSchemas.createAlertRule.parse(validRequest)).not.toThrow();

      // Invalid condition type
      expect(() =>
        apiSchemas.createAlertRule.parse({
          rule: {
            name: 'Test',
            condition: { type: 'invalid', threshold: 1, window: 60000 },
            actions: [],
          },
        }),
      ).toThrow();

      // Invalid window (too short)
      expect(() =>
        apiSchemas.createAlertRule.parse({
          rule: {
            name: 'Test',
            condition: { type: 'error', threshold: 1, window: 30000 },
            actions: [],
          },
        }),
      ).toThrow();

      // Invalid action type
      expect(() =>
        apiSchemas.createAlertRule.parse({
          rule: {
            name: 'Test',
            condition: { type: 'error', threshold: 1, window: 60000 },
            actions: [{ type: 'invalid', config: {} }],
          },
        }),
      ).toThrow();
    });

    test('should validate acknowledge alert request', () => {
      expect(() => apiSchemas.acknowledgeAlert.parse({})).not.toThrow();
      expect(() => apiSchemas.acknowledgeAlert.parse({ note: 'Fixed issue' })).not.toThrow();

      // Note too long
      expect(() =>
        apiSchemas.acknowledgeAlert.parse({
          note: 'x'.repeat(1001),
        }),
      ).toThrow();
    });
  });

  describe('sanitizeInput', () => {
    test('should sanitize strings', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('onclick="malicious()"')).toBe('malicious()');
      expect(sanitizeInput('data:text/html,<script>')).toBe('text/html,script');
      expect(sanitizeInput('vbscript:msgbox("test")')).toBe('msgbox(test)');
      expect(sanitizeInput('  normal text  ')).toBe('normal text');
    });

    test('should sanitize arrays', () => {
      const input = ['<script>bad</script>', 'normal', 'javascript:alert(1)'];
      const result = sanitizeInput(input);

      expect(result).toStrictEqual(['scriptbad/script', 'normal', 'alert(1)']);
    });

    test('should sanitize objects', () => {
      const input = {
        '<script>': 'value',
        normal: '<div>content</div>',
        nested: {
          'javascript:': 'bad',
          good: 'clean',
        },
      };

      const result = sanitizeInput(input);

      expect(result).toStrictEqual({
        script: 'value',
        normal: 'divcontent/div',
        nested: {
          '': 'bad',
          good: 'clean',
        },
      });
    });

    test('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBeNull();
      expect(sanitizeInput(undefined)).toBeUndefined();
    });

    test('should handle numbers and booleans', () => {
      expect(sanitizeInput(42)).toBe(42);
      expect(sanitizeInput(true)).toBeTruthy();
      expect(sanitizeInput(false)).toBeFalsy();
    });

    test('should handle nested structures', () => {
      const input = {
        data: [
          { name: '<script>test</script>', value: 123 },
          { name: 'normal', tags: ['<div>', 'safe'] },
        ],
      };

      const result = sanitizeInput(input);

      expect(result).toStrictEqual({
        data: [
          { name: 'scripttest/script', value: 123 },
          { name: 'normal', tags: ['div', 'safe'] },
        ],
      });
    });
  });

  describe('validateRequestBody', () => {
    test('should validate and sanitize body', () => {
      const schema = commonSchemas.workflowId;
      const result = validateRequestBody(schema, 'workflow-123');

      expect(result).toBe('workflow-123');
    });

    test('should throw WorkflowValidationError on validation failure', () => {
      const schema = commonSchemas.limit;

      expect(() => validateRequestBody(schema, 'invalid')).toThrow(WorkflowValidationError);
    });

    test('should include validation error details', () => {
      const schema = commonSchemas.workflowId;

      expect(() => validateRequestBody(schema, '')).toThrow(WorkflowValidationError);

      // Test error details by catching the error
      let thrownError: any = null;
      try {
        validateRequestBody(schema, '');
      } catch (error) {
        thrownError = error;
      }

      // Verify error details outside of conditional
      expect(thrownError).toBeInstanceOf(WorkflowValidationError);
      expect(thrownError.validationErrors).toBeDefined();
      expect(thrownError.validationErrors.length).toBeGreaterThan(0);
      expect(thrownError.validationErrors[0]).toHaveProperty('message');
      expect(thrownError.validationErrors[0]).toHaveProperty('path');
      expect(thrownError.validationErrors[0]).toHaveProperty('rule');
    });

    test('should rethrow non-Zod errors', () => {
      const schema = {
        parse: vi.fn(() => {
          throw new Error('Custom error');
        }),
      } as any;

      expect(() => validateRequestBody(schema, {})).toThrow('Custom error');
    });
  });

  describe('validateQueryParams', () => {
    test('should validate URL search params', () => {
      const schema = { parse: vi.fn().mockReturnValue(25) } as any;
      const params = new URLSearchParams('limit=25');

      const result = validateQueryParams(schema, params);
      expect(result).toBe(25);
    });

    test('should handle multiple values for same key', () => {
      const schema = commonSchemas.tags;
      const params = new URLSearchParams();
      params.append('tags', 'tag1');
      params.append('tags', 'tag2');
      params.append('tags', 'tag3');

      // This would create an object like { tags: ['tag1', 'tag2', 'tag3'] }
      // But our schema expects an array directly, so this will fail validation
      expect(() => validateQueryParams(schema, params)).toThrow('Request validation failed');
    });

    test('should handle single values', () => {
      const schema = { parse: vi.fn().mockReturnValue('test-workflow-123') } as any;
      const params = new URLSearchParams('workflowId=test-workflow-123');

      const result = validateQueryParams(schema, params);
      expect(result).toBe('test-workflow-123');
    });

    test('should convert repeated params to arrays', () => {
      const params = new URLSearchParams();
      params.append('tag', 'value1');
      params.append('tag', 'value2');
      params.append('single', 'value');

      const schema = {
        parse: vi.fn().mockReturnValue({ tag: ['value1', 'value2'], single: 'value' }),
      } as any;

      validateQueryParams(schema, params);

      // Check that the converted object has arrays for repeated keys
      const convertedObj = schema.parse.mock.calls[0][0];
      expect(convertedObj.tag).toStrictEqual(['value1', 'value2']);
      expect(convertedObj.single).toBe('value');
    });
  });

  describe('validatePathParams', () => {
    test('should validate path parameters', () => {
      const schema = { parse: vi.fn().mockReturnValue('workflow-123') } as any;
      const params = { id: 'workflow-123' };

      const result = validatePathParams(schema, params);
      expect(result).toBe('workflow-123');
    });

    test('should handle array values by taking first element', () => {
      const schema = { parse: vi.fn().mockReturnValue('workflow-123') } as any;
      const params = { id: ['workflow-123', 'workflow-456'] };

      const result = validatePathParams(schema, params);
      expect(result).toBe('workflow-123');
    });

    test('should normalize all params to strings', () => {
      const schema = {
        parse: vi.fn().mockReturnValue({ id: 'normalized' }),
      } as any;

      validatePathParams(schema, {
        stringParam: 'value',
        arrayParam: ['first', 'second'],
      });

      const normalizedObj = schema.parse.mock.calls[0][0];
      expect(normalizedObj.stringParam).toBe('value');
      expect(normalizedObj.arrayParam).toBe('first');
    });
  });

  describe('createValidatedHandler', () => {
    test('should create handler with body validation', async () => {
      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const handler = createValidatedHandler({
        bodySchema: commonSchemas.workflowId,
        handler: mockHandler,
      });

      const mockRequest = {
        method: 'POST',
        json: vi.fn().mockResolvedValue('test-workflow'),
      };

      await handler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith({
        body: 'test-workflow',
        query: undefined,
        params: undefined,
        request: mockRequest,
      });
    });

    test('should create handler with query validation', async () => {
      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const mockSchema = { parse: vi.fn().mockReturnValue(50) } as any;
      const handler = createValidatedHandler({
        querySchema: mockSchema,
        handler: mockHandler,
      });

      const mockRequest = {
        method: 'GET',
        url: 'https://example.com/api?limit=50',
      };

      await handler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith({
        body: undefined,
        query: 50,
        params: undefined,
        request: mockRequest,
      });
    });

    test('should create handler with params validation', async () => {
      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const mockSchema = { parse: vi.fn().mockReturnValue('workflow-123') } as any;
      const handler = createValidatedHandler({
        paramsSchema: mockSchema,
        handler: mockHandler,
      });

      const mockRequest = { method: 'GET' };
      const context = { params: { id: 'workflow-123' } };

      await handler(mockRequest, context);

      expect(mockHandler).toHaveBeenCalledWith({
        body: undefined,
        query: undefined,
        params: 'workflow-123',
        request: mockRequest,
      });
    });

    test('should skip body validation for GET requests', async () => {
      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const handler = createValidatedHandler({
        bodySchema: commonSchemas.workflowId,
        handler: mockHandler,
      });

      const mockRequest = { method: 'GET' };

      await handler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith({
        body: undefined,
        query: undefined,
        params: undefined,
        request: mockRequest,
      });
    });

    test('should skip body validation for HEAD requests', async () => {
      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const handler = createValidatedHandler({
        bodySchema: commonSchemas.workflowId,
        handler: mockHandler,
      });

      const mockRequest = { method: 'HEAD' };

      await handler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith({
        body: undefined,
        query: undefined,
        params: undefined,
        request: mockRequest,
      });
    });

    test('should return 400 on validation error', async () => {
      const mockHandler = vi.fn();
      const handler = createValidatedHandler({
        bodySchema: commonSchemas.workflowId,
        handler: mockHandler,
      });

      const mockRequest = {
        method: 'POST',
        json: vi.fn().mockResolvedValue(''), // Invalid workflow ID
      };

      const response = await handler(mockRequest);

      expect(response.status).toBe(400);
      expect(await response.json()).toStrictEqual({
        error: 'Validation failed',
        details: expect.any(Array),
      });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test('should rethrow non-validation errors', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Server error'));
      const handler = createValidatedHandler({
        handler: mockHandler,
      });

      const mockRequest = { method: 'GET' };

      await expect(handler(mockRequest)).rejects.toThrow('Server error');
    });

    test('should handle all validation types together', async () => {
      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const mockBodySchema = { parse: vi.fn().mockReturnValue({ input: { data: 'test' } }) } as any;
      const mockQuerySchema = { parse: vi.fn().mockReturnValue(25) } as any;
      const mockParamsSchema = { parse: vi.fn().mockReturnValue('test-workflow') } as any;

      const handler = createValidatedHandler({
        bodySchema: mockBodySchema,
        querySchema: mockQuerySchema,
        paramsSchema: mockParamsSchema,
        handler: mockHandler,
      });

      const mockRequest = {
        method: 'POST',
        url: 'https://example.com/api/workflows/test-workflow?limit=25',
        json: vi.fn().mockResolvedValue({ input: { data: 'test' } }),
      };

      const context = { params: { id: 'test-workflow' } };

      await handler(mockRequest, context);

      expect(mockHandler).toHaveBeenCalledWith({
        body: { input: { data: 'test' } },
        query: 25,
        params: 'test-workflow',
        request: mockRequest,
      });
    });
  });

  describe('edge Cases', () => {
    test('should handle empty objects in sanitization', () => {
      expect(sanitizeInput({})).toStrictEqual({});
    });

    test('should handle complex nested sanitization', () => {
      const complex = {
        level1: {
          level2: {
            level3: ['<script>', { 'javascript:': 'value' }],
          },
        },
      };

      const result = sanitizeInput(complex);

      expect(result).toStrictEqual({
        level1: {
          level2: {
            level3: ['script', { '': 'value' }],
          },
        },
      });
    });

    test('should handle special characters in sanitization', () => {
      const input = {
        'key"with"quotes': 'value<with>tags',
        "key'with'apostrophes": "value'with'apostrophes",
      };

      const result = sanitizeInput(input);

      expect(result).toStrictEqual({
        keywithquotes: 'valuewithtags',
        keywithapostrophes: 'valuewithapostrophes',
      });
    });

    test('should handle URLSearchParams edge cases', () => {
      const params = new URLSearchParams();
      // Empty params
      const schema = {
        parse: vi.fn().mockReturnValue({}),
      } as any;

      validateQueryParams(schema, params);

      expect(schema.parse).toHaveBeenCalledWith({});
    });

    test('should handle createValidatedHandler without context', async () => {
      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const handler = createValidatedHandler({
        paramsSchema: commonSchemas.workflowId,
        handler: mockHandler,
      });

      const mockRequest = { method: 'GET' };

      await handler(mockRequest); // No context parameter

      expect(mockHandler).toHaveBeenCalledWith({
        body: undefined,
        query: undefined,
        params: undefined,
        request: mockRequest,
      });
    });
  });
});
