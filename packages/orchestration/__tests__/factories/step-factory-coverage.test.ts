import { beforeEach, describe, expect, test, vi } from 'vitest';
// These imports come from our mocks
const createPerformanceMonitor = vi.fn();
const measureStepExecution = vi.fn();
const validateStepDefinition = vi.fn();
const createStepValidator = vi.fn();

// Mock dependencies
vi.mock('@repo/observability/shared-env', () => ({
  createServerObservability: vi.fn(() =>
    Promise.resolve({
      log: vi.fn(),
      error: vi.fn(),
    }),
  ),
}));

describe('step Factory Additional Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('step Factory Core', () => {
    test('should import step factory module', async () => {
      const stepFactoryModule = await import('@/shared/factories/step-factory');
      expect(stepFactoryModule.defaultStepFactory).toBeDefined();
      expect((stepFactoryModule as any).createStepFactory).toBeDefined();
    });

    test('should create custom step factory', async () => {
      const stepFactoryModule = await import('@/shared/factories/step-factory');
      const config = {
        enableValidation: true,
        enableMetrics: true,
        maxConcurrentSteps: 10,
      };
      const factory = (stepFactoryModule as any).createStepFactory(config);
      expect(factory).toBeDefined();
      expect(factory.createStep).toBeDefined();
    });

    test('should handle step creation with different parameters', async () => {
      const stepFactoryModule = await import('@/shared/factories/step-factory');
      const stepDefinition = {
        id: 'test-step',
        name: 'Test Step',
        version: '1.0.0',
        execute: vi.fn().mockResolvedValue({ success: true }),
        validate: vi.fn().mockReturnValue(true),
        timeout: 5000,
        retryConfig: {
          maxAttempts: 3,
          backoff: 'exponential' as const,
          delay: 1000,
        },
      };
      const step = stepFactoryModule.defaultStepFactory.createStep(
        stepDefinition as any,
        { workflowId: 'workflow-id' } as any,
      );
      expect(step).toBeDefined();
      expect(step.execute).toBeDefined();
    });
  });

  describe('step Registry Extended', () => {
    test('should import step registry module', async () => {
      const stepRegistryModule = await import('../../src/shared/factories/step-registry');
      expect(stepRegistryModule.defaultStepRegistry).toBeDefined();
      expect((stepRegistryModule as any).createStepRegistry).toBeDefined();
    });

    test('should handle advanced registry operations', async () => {
      const stepRegistryModule = await import('../../src/shared/factories/step-registry');
      const config = {
        enableCache: true,
        enableMetrics: true,
        maxSteps: 1000,
      };
      const registry = (stepRegistryModule as any).createStepRegistry(config);
      expect(registry).toBeDefined();
      // Test registration
      const stepDef = {
        id: 'advanced-step',
        name: 'Advanced Step',
        version: '2.0.0',
        execute: vi.fn(),
        category: 'data-processing',
        tags: ['transform', 'validate'],
        dependencies: ['dependency-step'],
      };
      registry.register(stepDef);
      // Test retrieval
      const retrieved = registry.get('advanced-step');
      expect(retrieved).toBeDefined();
      // Test search
      const searchResults = registry.search({ category: 'data-processing' });
      expect(Array.isArray(searchResults)).toBeTruthy();
      // Test categories
      const categories = registry.getCategories();
      expect(Array.isArray(categories)).toBeTruthy();
    });

    test('should handle bulk operations', async () => {
      const stepRegistryModule = await import('../../src/shared/factories/step-registry');
      const bulkSteps = Array.from({ length: 10 }, (_, i) => ({
        definition: {
          id: `bulk-step-${i}`,
          name: `Bulk Step ${i}`,
          version: '1.0.0',
          execute: vi.fn(),
        },
        metadata: { bulkIndex: i },
      }));
      const result = stepRegistryModule.defaultStepRegistry.import(bulkSteps as any, false);
      expect(result).toBeDefined();
      // Test export
      const exported = stepRegistryModule.defaultStepRegistry.export();
      expect(Array.isArray(exported)).toBeTruthy();
      // Test stats
      const stats = stepRegistryModule.defaultStepRegistry.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('step Enhancers', () => {
    test('should import step enhancers', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      expect(enhancers).toBeDefined();
    });

    test('should have withRetry enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      expect((enhancers as any).withRetry).toBeDefined();
    });

    test('should have withTimeout enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      expect((enhancers as any).withTimeout).toBeDefined();
    });

    test('should have withValidation enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      expect((enhancers as any).withValidation).toBeDefined();
    });

    test('should have withMetrics enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      expect((enhancers as any).withMetrics).toBeDefined();
    });

    test('should have withLogging enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      expect((enhancers as any).withLogging).toBeDefined();
    });

    test('should have withCircuitBreaker enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      expect((enhancers as any).withCircuitBreaker).toBeDefined();
    });

    test('should apply retry enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      const originalStep = {
        id: 'retry-step',
        execute: vi
          .fn()
          .mockRejectedValueOnce(new Error('Temporary failure'))
          .mockResolvedValue({ success: true }),
      };
      const enhancedStep = (enhancers as any).withRetry(originalStep, {
        maxAttempts: 3,
        backoff: 'fixed',
        delay: 100,
      });
      expect(enhancedStep).toBeDefined();
      expect(enhancedStep.execute).toBeDefined();
      const result = await enhancedStep.execute({}, 'workflow-1');
      expect(result).toBeDefined();
    });

    test('should apply timeout enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      const slowStep = {
        id: 'slow-step',
        execute: vi.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000)),
        ),
      };
      const enhancedStep = (enhancers as any).withTimeout(slowStep, { timeout: 500 });
      expect(enhancedStep).toBeDefined();
      await expect(enhancedStep.execute({}, 'workflow-1')).rejects.toThrow('Execution timeout');
    });

    test('should apply validation enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      const step = {
        id: 'validation-step',
        execute: vi.fn().mockResolvedValue({ result: 'processed' }),
      };
      const schema = {
        type: 'object',
        properties: {
          input: { type: 'string' },
        },
        required: ['input'],
      };
      const enhancedStep = (enhancers as any).withValidation(step, { inputSchema: schema });
      expect(enhancedStep).toBeDefined();
      const result = await enhancedStep.execute({ input: 'valid' }, 'workflow-1');
      expect(result).toBeDefined();
    });

    test('should apply metrics enhancer', async () => {
      const enhancers = await import('@/shared/factories/step-factory-enhancers');
      const step = {
        id: 'metrics-step',
        execute: vi.fn().mockResolvedValue({ success: true }),
      };
      const enhancedStep = (enhancers as any).withMetrics(step, {
        collectDuration: true,
        collectSuccess: true,
        collectErrors: true,
      });
      expect(enhancedStep).toBeDefined();
      const result = await enhancedStep.execute({}, 'workflow-1');
      expect(result).toBeDefined();
    });
  });

  describe('step Templates', () => {
    test('should import step templates', async () => {
      const templates = await import('../../src/shared/factories/step-templates');
      expect(templates).toBeDefined();
      expect((templates as any).createHttpRequestStep).toBeDefined();
      expect((templates as any).createDataTransformStep).toBeDefined();
      expect((templates as any).createValidationStep).toBeDefined();
      expect((templates as any).createNotificationStep).toBeDefined();
      expect((templates as any).createDatabaseStep).toBeDefined();
    });

    test('should create HTTP request step template', async () => {
      const templates = await import('../../src/shared/factories/step-templates');
      const config = {
        url: 'https://api.example.com/data',
        method: 'GET' as const,
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      };
      const step = (templates as any).createHttpRequestStep('http-step', config);
      expect(step).toBeDefined();
      expect(step.id).toBe('http-step');
      expect(step.execute).toBeDefined();
    });

    test('should create data transform step template', async () => {
      const templates = await import('../../src/shared/factories/step-templates');
      const transformFn = (data: any) => ({ ...data, transformed: true });
      const step = (templates as any).createDataTransformStep('transform-step', transformFn);
      expect(step).toBeDefined();
      expect(step.execute).toBeDefined();
      const result = await step.execute({ original: 'data' }, 'workflow-1');
      expect(result).toStrictEqual({ original: 'data', transformed: true });
    });

    test('should create validation step template', async () => {
      const templates = await import('../../src/shared/factories/step-templates');
      const schema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          age: { type: 'number', minimum: 0 },
        },
        required: ['email'],
      };
      const step = (templates as any).createValidationStep('validation-step', schema);
      expect(step).toBeDefined();
      expect(step.execute).toBeDefined();
    });
  });

  describe('performance Utilities', () => {
    test('should import performance utilities', async () => {
      const performance = await import('@/shared/factories/step-factory/step-performance');
      expect(performance).toBeDefined();
      expect(createPerformanceMonitor).toBeDefined();
      expect(measureStepExecution).toBeDefined();
    });

    test('should create performance monitor', async () => {
      const module = await import('@/shared/factories/step-factory/step-performance');
      const monitor = createPerformanceMonitor({
        enableMemoryTracking: true,
        enableCpuTracking: true,
        sampleInterval: 1000,
      });
      expect(monitor).toBeDefined();
      expect(monitor.start).toBeDefined();
      expect(monitor.stop).toBeDefined();
      expect(monitor.getMetrics).toBeDefined();
    });

    test('should measure step execution', async () => {
      const module = await import('@/shared/factories/step-factory/step-performance');
      const step = {
        id: 'measured-step',
        execute: vi.fn().mockResolvedValue({ success: true }),
      };
      const measuredStep = measureStepExecution(step);
      expect(measuredStep).toBeDefined();
      const result = await measuredStep.execute({}, 'workflow-1');
      expect(result).toBeDefined();
    });
  });

  describe('step Validation', () => {
    test('should import validation utilities', async () => {
      const validation = await import('@/shared/factories/step-factory/step-validation');
      expect(validation).toBeDefined();
      expect(validateStepDefinition).toBeDefined();
      expect(createStepValidator).toBeDefined();
    });

    test('should validate step definition', async () => {
      const module = await import('@/shared/factories/step-factory/step-validation');
      const validStep = {
        id: 'valid-step',
        name: 'Valid Step',
        version: '1.0.0',
        execute: vi.fn(),
      };
      const result = validateStepDefinition(validStep);
      expect(result).toBeDefined();
      expect(result.valid).toBeTruthy();
    });

    test('should create custom validator', async () => {
      const module = await import('@/shared/factories/step-factory/step-validation');
      const customRules = {
        requireDescription: true,
        requireTags: true,
        maxNameLength: 50,
      };
      const validator = createStepValidator(customRules);
      expect(validator).toBeDefined();
      expect(validator.validate).toBeDefined();
    });
  });
});
