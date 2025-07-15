import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  CircuitBreakerError,
  ConfigurationError,
  createOrchestrationError,
  createProviderError,
  createProviderErrorWithCode,
  createValidationError,
  createWorkflowExecutionError,
  createWorkflowExecutionErrorWithCode,
  extractErrorDetails,
  isRetryableError,
  OrchestrationError,
  OrchestrationErrorCodes,
  ProviderError,
  RateLimitError,
  TimeoutError,
  WorkflowExecutionError,
  WorkflowValidationError,
} from '../../src/shared/utils/errors';

describe('error utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OrchestrationError', () => {
    test('should create basic orchestration error', () => {
      const error = new OrchestrationError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('OrchestrationError');
      expect(error.code).toBe('ORCHESTRATION_ERROR');
      expect(error.retryable).toBe(false);
      expect(error.context).toBeUndefined();
    });

    test('should create error with custom code and retryable flag', () => {
      const error = new OrchestrationError('Custom error', 'CUSTOM_CODE', true, { key: 'value' });

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.retryable).toBe(true);
      expect(error.context).toEqual({ key: 'value' });
    });

    test('should serialize error to JSON', () => {
      const error = new OrchestrationError('JSON error', 'JSON_CODE', true, { test: 'data' });

      const json = error.toJSON();

      expect(json.message).toBe('JSON error');
      expect(json.code).toBe('JSON_CODE');
      expect(json.retryable).toBe(true);
      expect(json.context).toEqual({ test: 'data' });
      expect(json.name).toBe('OrchestrationError');
      expect(json.stack).toBeDefined();
    });
  });

  describe('CircuitBreakerError', () => {
    test('should create circuit breaker error', () => {
      const error = new CircuitBreakerError('Circuit breaker open', 'user-service', 'open', {
        attempts: 3,
      });

      expect(error.message).toBe('Circuit breaker open');
      expect(error.name).toBe('CircuitBreakerError');
      expect(error.code).toBe('CIRCUIT_BREAKER_OPEN');
      expect(error.retryable).toBe(true);
      expect(error.circuitName).toBe('user-service');
      expect(error.state).toBe('open');
      expect(error.context).toEqual({ attempts: 3 });
    });

    test('should create half-open circuit breaker error', () => {
      const error = new CircuitBreakerError(
        'Circuit breaker half-open',
        'data-service',
        'half-open',
      );

      expect(error.circuitName).toBe('data-service');
      expect(error.state).toBe('half-open');
    });
  });

  describe('ConfigurationError', () => {
    test('should create configuration error', () => {
      const error = new ConfigurationError('Invalid configuration', 'database.url', {
        provided: 'invalid-url',
      });

      expect(error.message).toBe('Invalid configuration');
      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.retryable).toBe(false);
      expect(error.configPath).toBe('database.url');
      expect(error.context).toEqual({ provided: 'invalid-url' });
    });

    test('should create configuration error without path', () => {
      const error = new ConfigurationError('Config error');

      expect(error.configPath).toBeUndefined();
    });
  });

  describe('ProviderError', () => {
    test('should create provider error with defaults', () => {
      const error = new ProviderError('Provider failed', 'upstash', 'workflow');

      expect(error.message).toBe('Provider failed');
      expect(error.name).toBe('ProviderError');
      expect(error.code).toBe('PROVIDER_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.providerName).toBe('upstash');
      expect(error.providerType).toBe('workflow');
    });

    test('should create provider error with custom options', () => {
      const error = new ProviderError(
        'Custom provider error',
        'redis',
        'cache',
        'CUSTOM_PROVIDER_ERROR',
        false,
        { timeout: 5000 },
      );

      expect(error.code).toBe('CUSTOM_PROVIDER_ERROR');
      expect(error.retryable).toBe(false);
      expect(error.context).toEqual({ timeout: 5000 });
    });
  });

  describe('RateLimitError', () => {
    test('should create rate limit error', () => {
      const error = new RateLimitError('Rate limit exceeded', 100, 60, 30, {
        endpoint: '/api/data',
      });

      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.retryable).toBe(true);
      expect(error.limit).toBe(100);
      expect(error.window).toBe(60);
      expect(error.retryAfter).toBe(30);
      expect(error.context).toEqual({ endpoint: '/api/data' });
    });

    test('should create rate limit error without retryAfter', () => {
      const error = new RateLimitError('Rate limited', 50, 120);

      expect(error.retryAfter).toBeUndefined();
    });
  });

  describe('TimeoutError', () => {
    test('should create timeout error', () => {
      const error = new TimeoutError('Operation timed out', 5000, { operation: 'database-query' });

      expect(error.message).toBe('Operation timed out');
      expect(error.name).toBe('TimeoutError');
      expect(error.code).toBe('OPERATION_TIMEOUT');
      expect(error.retryable).toBe(false);
      expect(error.timeoutMs).toBe(5000);
      expect(error.context).toEqual({ operation: 'database-query' });
    });
  });

  describe('WorkflowExecutionError', () => {
    test('should create workflow execution error with defaults', () => {
      const error = new WorkflowExecutionError('Workflow failed', 'workflow-123');

      expect(error.message).toBe('Workflow failed');
      expect(error.name).toBe('WorkflowExecutionError');
      expect(error.code).toBe('WORKFLOW_EXECUTION_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.workflowId).toBe('workflow-123');
      expect(error.executionId).toBeUndefined();
      expect(error.stepId).toBeUndefined();
    });

    test('should create workflow execution error with context', () => {
      const error = new WorkflowExecutionError(
        'Step failed',
        'workflow-456',
        'STEP_EXECUTION_FAILED',
        false,
        {
          executionId: 'exec-789',
          stepId: 'step-1',
          metadata: { attempt: 2 },
        },
      );

      expect(error.code).toBe('STEP_EXECUTION_FAILED');
      expect(error.retryable).toBe(false);
      expect(error.executionId).toBe('exec-789');
      expect(error.stepId).toBe('step-1');
      expect(error.context).toEqual({
        executionId: 'exec-789',
        stepId: 'step-1',
        metadata: { attempt: 2 },
      });
    });
  });

  describe('WorkflowValidationError', () => {
    test('should create workflow validation error', () => {
      const validationErrors = [
        { message: 'Missing field', path: 'steps[0].name', rule: 'required' },
        { message: 'Invalid type', path: 'timeout', rule: 'number', value: 'invalid' },
      ];

      const error = new WorkflowValidationError('Validation failed', validationErrors, {
        source: 'user-input',
      });

      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('WorkflowValidationError');
      expect(error.code).toBe('WORKFLOW_VALIDATION_ERROR');
      expect(error.retryable).toBe(false);
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.context).toEqual({ source: 'user-input' });
    });
  });

  describe('createOrchestrationError', () => {
    test('should create error with minimal options', () => {
      const error = createOrchestrationError('Simple error');

      expect(error.message).toBe('Simple error');
      expect(error.code).toBe('ORCHESTRATION_ERROR');
      expect(error.retryable).toBe(false);
    });

    test('should create error with all options', () => {
      const originalError = new Error('Original error');
      const error = createOrchestrationError('Wrapped error', {
        code: OrchestrationErrorCodes.PROVIDER_ERROR,
        retryable: true,
        context: { key: 'value' },
        originalError,
      });

      expect(error.message).toBe('Wrapped error');
      expect(error.code).toBe('PROVIDER_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.context?.key).toBe('value');
      expect(error.context?.originalError).toEqual({
        message: 'Original error',
        name: 'Error',
        stack: originalError.stack,
      });
    });
  });

  describe('createProviderError', () => {
    test('should create provider error with defaults', () => {
      const error = createProviderError('Provider error', 'upstash', 'workflow');

      expect(error).toBeInstanceOf(ProviderError);
      expect(error.message).toBe('Provider error');
      expect(error.providerName).toBe('upstash');
      expect(error.providerType).toBe('workflow');
      expect(error.code).toBe('PROVIDER_ERROR');
      expect(error.retryable).toBe(true);
    });

    test('should create provider error with original error', () => {
      const originalError = new Error('Connection failed');
      const error = createProviderError('Provider unavailable', 'redis', 'cache', {
        code: 'PROVIDER_UNHEALTHY',
        retryable: false,
        originalError,
      });

      expect(error.code).toBe('PROVIDER_UNHEALTHY');
      expect(error.retryable).toBe(false);
      expect(error.context?.originalError?.message).toBe('Connection failed');
    });
  });

  describe('createProviderErrorWithCode', () => {
    test('should create provider error with enum code', () => {
      const error = createProviderErrorWithCode(
        'Provider not found',
        'missing-provider',
        'unknown',
        {
          code: OrchestrationErrorCodes.PROVIDER_NOT_FOUND,
          retryable: false,
        },
      );

      expect(error.code).toBe('PROVIDER_NOT_FOUND');
      expect(error.retryable).toBe(false);
    });
  });

  describe('createValidationError', () => {
    test('should create validation error with defaults', () => {
      const error = createValidationError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('STEP_INPUT_VALIDATION_ERROR');
      expect(error.retryable).toBe(false);
    });

    test('should create validation error with validation details', () => {
      const validationErrors = [{ field: 'name', message: 'Required' }];
      const error = createValidationError('Input validation failed', {
        code: OrchestrationErrorCodes.WORKFLOW_VALIDATION_ERROR,
        validationErrors,
        validationResult: { valid: false, errors: 2 },
        context: { source: 'api' },
      });

      expect(error.code).toBe('WORKFLOW_VALIDATION_ERROR');
      expect(error.context?.validationErrors).toEqual(validationErrors);
      expect(error.context?.validationResult).toEqual({ valid: false, errors: 2 });
      expect(error.context?.source).toBe('api');
    });
  });

  describe('createWorkflowExecutionError', () => {
    test('should create workflow execution error with defaults', () => {
      const error = createWorkflowExecutionError('Execution failed', 'workflow-123');

      expect(error).toBeInstanceOf(WorkflowExecutionError);
      expect(error.message).toBe('Execution failed');
      expect(error.workflowId).toBe('workflow-123');
      expect(error.code).toBe('WORKFLOW_EXECUTION_ERROR');
      expect(error.retryable).toBe(true);
    });

    test('should create workflow execution error with all options', () => {
      const originalError = new Error('Step failed');
      const error = createWorkflowExecutionError('Step execution failed', 'workflow-456', {
        code: 'STEP_EXECUTION_FAILED',
        executionId: 'exec-789',
        stepId: 'step-1',
        retryable: false,
        originalError,
      });

      expect(error.code).toBe('STEP_EXECUTION_FAILED');
      expect(error.executionId).toBe('exec-789');
      expect(error.stepId).toBe('step-1');
      expect(error.retryable).toBe(false);
      expect(error.context?.originalError?.message).toBe('Step failed');
    });
  });

  describe('createWorkflowExecutionErrorWithCode', () => {
    test('should create workflow execution error with enum code', () => {
      const error = createWorkflowExecutionErrorWithCode('Step timed out', 'workflow-789', {
        code: OrchestrationErrorCodes.STEP_TIMEOUT_ERROR,
        stepId: 'step-2',
        retryable: true,
      });

      expect(error.code).toBe('STEP_TIMEOUT_ERROR');
      expect(error.stepId).toBe('step-2');
      expect(error.retryable).toBe(true);
    });
  });

  describe('extractErrorDetails', () => {
    test('should extract details from basic error', () => {
      const error = new Error('Basic error');
      error.name = 'CustomError';

      const details = extractErrorDetails(error);

      expect(details.message).toBe('Basic error');
      expect(details.name).toBe('CustomError');
      expect(details.stack).toBeDefined();
    });

    test('should extract details from OrchestrationError', () => {
      const error = new OrchestrationError('Orchestration error', 'CUSTOM_CODE', true, {
        key: 'value',
      });

      const details = extractErrorDetails(error);

      expect(details.message).toBe('Orchestration error');
      expect(details.code).toBe('CUSTOM_CODE');
      expect(details.retryable).toBe(true);
      expect(details.context).toEqual({ key: 'value' });
    });

    test('should extract details from WorkflowExecutionError', () => {
      const error = new WorkflowExecutionError(
        'Workflow failed',
        'workflow-123',
        'WORKFLOW_EXECUTION_ERROR',
        true,
        { executionId: 'exec-456', stepId: 'step-1' },
      );

      const details = extractErrorDetails(error);

      expect(details.workflowId).toBe('workflow-123');
      expect(details.executionId).toBe('exec-456');
      expect(details.stepId).toBe('step-1');
    });

    test('should extract details from ProviderError', () => {
      const error = new ProviderError('Provider failed', 'upstash', 'workflow');

      const details = extractErrorDetails(error);

      expect(details.providerName).toBe('upstash');
      expect(details.providerType).toBe('workflow');
    });
  });

  describe('isRetryableError', () => {
    test('should identify retryable OrchestrationError', () => {
      const retryableError = new OrchestrationError('Error', 'CODE', true);
      const nonRetryableError = new OrchestrationError('Error', 'CODE', false);

      expect(isRetryableError(retryableError)).toBe(true);
      expect(isRetryableError(nonRetryableError)).toBe(false);
    });

    test('should identify retryable network errors', () => {
      const networkErrors = [
        new Error('ECONNRESET'),
        new Error('ENOTFOUND'),
        new Error('ECONNREFUSED'),
        new Error('ETIMEDOUT'),
        new Error('EAI_AGAIN'),
        new Error('Connection failed with RATE_LIMIT'),
        new Error('SERVICE_UNAVAILABLE error occurred'),
        new Error('INTERNAL_SERVER_ERROR: Server error'),
      ];

      networkErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    test('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        new Error('Validation failed'),
        new Error('Invalid input'),
        new Error('Not found'),
        new Error('Unauthorized access'),
      ];

      nonRetryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(false);
      });
    });

    test('should handle errors with undefined message', () => {
      const error = new Error();
      error.message = undefined as any;

      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('OrchestrationErrorCodes enum', () => {
    test('should contain expected error codes', () => {
      expect(OrchestrationErrorCodes.ORCHESTRATION_ERROR).toBe('ORCHESTRATION_ERROR');
      expect(OrchestrationErrorCodes.PROVIDER_ERROR).toBe('PROVIDER_ERROR');
      expect(OrchestrationErrorCodes.WORKFLOW_EXECUTION_ERROR).toBe('WORKFLOW_EXECUTION_ERROR');
      expect(OrchestrationErrorCodes.CONFIGURATION_ERROR).toBe('CONFIGURATION_ERROR');
      expect(OrchestrationErrorCodes.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Edge Cases', () => {
    test('should handle Error.captureStackTrace gracefully when unavailable', () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      delete (Error as any).captureStackTrace;

      const error = new OrchestrationError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.stack).toBeDefined();

      // Restore
      Error.captureStackTrace = originalCaptureStackTrace;
    });

    test('should handle null/undefined context in error creation', () => {
      const error = createOrchestrationError('Test', {
        context: undefined,
        originalError: undefined,
      });

      expect(error.context).toEqual({});
    });

    test('should handle empty validation errors array', () => {
      const error = new WorkflowValidationError('Validation failed', []);

      expect(error.validationErrors).toEqual([]);
    });
  });
});
