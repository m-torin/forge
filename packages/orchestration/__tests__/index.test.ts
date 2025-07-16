import { describe, expect, test } from 'vitest';

/**
 * Test suite for the main orchestration package index file
 * Tests all exports to ensure they are properly available
 */
describe('orchestration package index', () => {
  describe('type exports', () => {
    test('should export workflow types', async () => {
      const module = await import('../src/index');
      
      // We can't directly test types at runtime, but we can test that the module loads
      expect(module).toBeDefined();
      expect(typeof module).toBe('object');
    });
  });

  describe('error utilities', () => {
    test('should export OrchestrationErrorCodes', async () => {
      const { OrchestrationErrorCodes } = await import('../src/index');
      
      expect(OrchestrationErrorCodes).toBeDefined();
      expect(typeof OrchestrationErrorCodes).toBe('object');
      expect(OrchestrationErrorCodes.WORKFLOW_EXECUTION_ERROR).toBeDefined();
    });

    test('should export createOrchestrationError', async () => {
      const { createOrchestrationError } = await import('../src/index');
      
      expect(createOrchestrationError).toBeDefined();
      expect(typeof createOrchestrationError).toBe('function');
    });
  });

  describe('validation utilities', () => {
    test('should export validateWorkflowDefinition', async () => {
      const { validateWorkflowDefinition } = await import('../src/index');
      
      expect(validateWorkflowDefinition).toBeDefined();
      expect(typeof validateWorkflowDefinition).toBe('function');
    });

    test('should export validateWorkflowStep', async () => {
      const { validateWorkflowStep } = await import('../src/index');
      
      expect(validateWorkflowStep).toBeDefined();
      expect(typeof validateWorkflowStep).toBe('function');
    });
  });

  describe('step factory exports', () => {
    test('should export StepFactory', async () => {
      const { StepFactory } = await import('../src/index');
      
      expect(StepFactory).toBeDefined();
      expect(typeof StepFactory).toBe('function');
    });

    test('should export StepRegistry', async () => {
      const { StepRegistry } = await import('../src/index');
      
      expect(StepRegistry).toBeDefined();
      expect(typeof StepRegistry).toBe('function');
    });

    test('should export StepTemplates', async () => {
      const { StepTemplates } = await import('../src/index');
      
      expect(StepTemplates).toBeDefined();
      expect(typeof StepTemplates).toBe('object');
    });

    test('should export step utility functions', async () => {
      const {
        compose,
        createStep,
        createStepWithValidation,
        toSimpleStep,
        withStepCircuitBreaker,
        withStepMonitoring,
        withStepRetry,
        withStepTimeout,
      } = await import('../src/index');
      
      expect(compose).toBeDefined();
      expect(typeof compose).toBe('function');
      expect(createStep).toBeDefined();
      expect(typeof createStep).toBe('function');
      expect(createStepWithValidation).toBeDefined();
      expect(typeof createStepWithValidation).toBe('function');
      expect(toSimpleStep).toBeDefined();
      expect(typeof toSimpleStep).toBe('function');
      expect(withStepCircuitBreaker).toBeDefined();
      expect(typeof withStepCircuitBreaker).toBe('function');
      expect(withStepMonitoring).toBeDefined();
      expect(typeof withStepMonitoring).toBe('function');
      expect(withStepRetry).toBeDefined();
      expect(typeof withStepRetry).toBe('function');
      expect(withStepTimeout).toBeDefined();
      expect(typeof withStepTimeout).toBe('function');
    });
  });

  describe('workflow utilities', () => {
    test('should export configuration constants', async () => {
      const {
        CIRCUIT_BREAKER_CONFIGS,
        CommonSchemas,
        RATE_LIMITER_CONFIGS,
        RETRY_STRATEGIES,
      } = await import('../src/index');
      
      expect(CIRCUIT_BREAKER_CONFIGS).toBeDefined();
      expect(typeof CIRCUIT_BREAKER_CONFIGS).toBe('object');
      expect(CommonSchemas).toBeDefined();
      expect(typeof CommonSchemas).toBe('object');
      expect(RATE_LIMITER_CONFIGS).toBeDefined();
      expect(typeof RATE_LIMITER_CONFIGS).toBe('object');
      expect(RETRY_STRATEGIES).toBeDefined();
      expect(typeof RETRY_STRATEGIES).toBe('object');
    });

    test('should export ProgressReporter', async () => {
      const { ProgressReporter } = await import('../src/index');
      
      expect(ProgressReporter).toBeDefined();
      expect(typeof ProgressReporter).toBe('function');
    });

    test('should export utility functions', async () => {
      const {
        addError,
        addFailedResult,
        addSuccessfulResult,
        addWarning,
        createErrorAccumulator,
        createMemoryEfficientProcessor,
        createPartialSuccessResult,
        createStepIdentifier,
        createTimestamp,
        formatDuration,
        getErrorSummary,
        hasCriticalErrors,
        hasErrors,
        isValidIdentifier,
        processBatch,
        sanitizeIdentifier,
        streamProcess,
        updateSuccessRate,
        withFallback,
      } = await import('../src/index');
      
      expect(addError).toBeDefined();
      expect(typeof addError).toBe('function');
      expect(addFailedResult).toBeDefined();
      expect(typeof addFailedResult).toBe('function');
      expect(addSuccessfulResult).toBeDefined();
      expect(typeof addSuccessfulResult).toBe('function');
      expect(addWarning).toBeDefined();
      expect(typeof addWarning).toBe('function');
      expect(createErrorAccumulator).toBeDefined();
      expect(typeof createErrorAccumulator).toBe('function');
      expect(createMemoryEfficientProcessor).toBeDefined();
      expect(typeof createMemoryEfficientProcessor).toBe('function');
      expect(createPartialSuccessResult).toBeDefined();
      expect(typeof createPartialSuccessResult).toBe('function');
      expect(createStepIdentifier).toBeDefined();
      expect(typeof createStepIdentifier).toBe('function');
      expect(createTimestamp).toBeDefined();
      expect(typeof createTimestamp).toBe('function');
      expect(formatDuration).toBeDefined();
      expect(typeof formatDuration).toBe('function');
      expect(getErrorSummary).toBeDefined();
      expect(typeof getErrorSummary).toBe('function');
      expect(hasCriticalErrors).toBeDefined();
      expect(typeof hasCriticalErrors).toBe('function');
      expect(hasErrors).toBeDefined();
      expect(typeof hasErrors).toBe('function');
      expect(isValidIdentifier).toBeDefined();
      expect(typeof isValidIdentifier).toBe('function');
      expect(processBatch).toBeDefined();
      expect(typeof processBatch).toBe('function');
      expect(sanitizeIdentifier).toBeDefined();
      expect(typeof sanitizeIdentifier).toBe('function');
      expect(streamProcess).toBeDefined();
      expect(typeof streamProcess).toBe('function');
      expect(updateSuccessRate).toBeDefined();
      expect(typeof updateSuccessRate).toBe('function');
      expect(withFallback).toBeDefined();
      expect(typeof withFallback).toBe('function');
    });
  });

  describe('rate limiting utilities', () => {
    test('should export rate limit functions', async () => {
      const {
        createRateLimitHeaders,
        createRateLimiter,
        withRateLimit,
        createWorkflowRateLimiter,
      } = await import('../src/index');
      
      expect(createRateLimitHeaders).toBeDefined();
      expect(typeof createRateLimitHeaders).toBe('function');
      expect(createRateLimiter).toBeDefined();
      expect(typeof createRateLimiter).toBe('function');
      expect(withRateLimit).toBeDefined();
      expect(typeof withRateLimit).toBe('function');
      expect(createWorkflowRateLimiter).toBeDefined();
      expect(typeof createWorkflowRateLimiter).toBe('function');
    });
  });

  describe('providers and workflow engine', () => {
    test('should export UpstashWorkflowProvider', async () => {
      const { UpstashWorkflowProvider } = await import('../src/index');
      
      expect(UpstashWorkflowProvider).toBeDefined();
      expect(typeof UpstashWorkflowProvider).toBe('function');
    });

    test('should export createWorkflowEngine', async () => {
      const { createWorkflowEngine } = await import('../src/index');
      
      expect(createWorkflowEngine).toBeDefined();
      expect(typeof createWorkflowEngine).toBe('function');
    });
  });

  describe('module structure', () => {
    test('should have all expected exports', async () => {
      const module = await import('../src/index');
      const exports = Object.keys(module);
      
      // Should have a reasonable number of exports
      expect(exports.length).toBeGreaterThan(20);
      
      // Should include key exports
      expect(exports).toContain('OrchestrationErrorCodes');
      expect(exports).toContain('createOrchestrationError');
      expect(exports).toContain('validateWorkflowDefinition');
      expect(exports).toContain('StepFactory');
      expect(exports).toContain('UpstashWorkflowProvider');
      expect(exports).toContain('createWorkflowEngine');
    });

    test('should not export any undefined values', async () => {
      const module = await import('../src/index');
      const exports = Object.keys(module);
      
      for (const exportName of exports) {
        expect(module[exportName]).toBeDefined();
      }
    });
  });

  describe('functional tests', () => {
    test('should be able to create an orchestration error', async () => {
      const { createOrchestrationError, OrchestrationErrorCodes } = await import('../src/index');
      
      const error = createOrchestrationError('Test error', {
        code: OrchestrationErrorCodes.WORKFLOW_EXECUTION_ERROR,
      });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
    });

    test('should be able to validate a workflow definition', async () => {
      const { validateWorkflowDefinition } = await import('../src/index');
      
      const validDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Test Step',
            type: 'task',
            action: 'test-action',
          },
        ],
      };
      
      expect(() => validateWorkflowDefinition(validDefinition)).not.toThrow();
    });

    test('should be able to create a step identifier', async () => {
      const { createStepIdentifier } = await import('../src/index');
      
      const identifier = createStepIdentifier('test-step');
      
      expect(identifier).toBeDefined();
      expect(typeof identifier).toBe('string');
      expect(identifier).toContain('test-step');
    });

    test('should be able to format duration', async () => {
      const { formatDuration } = await import('../src/index');
      
      const formatted = formatDuration(1500);
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    test('should be able to create error accumulator', async () => {
      const { createErrorAccumulator } = await import('../src/index');
      
      const accumulator = createErrorAccumulator();
      
      expect(accumulator).toBeDefined();
      expect(typeof accumulator).toBe('object');
      expect(accumulator.errors).toBeDefined();
      expect(Array.isArray(accumulator.errors)).toBe(true);
    });
  });
});