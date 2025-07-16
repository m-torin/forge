import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the database/redis/server module
vi.mock('@repo/database/redis/server', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    ping: vi.fn().mockResolvedValue('PONG'),
  },
}));

// Mock the QStash client
vi.mock('@upstash/qstash', () => ({
  Client: vi.fn().mockImplementation(() => ({
    publishJSON: vi.fn(),
    batchJSON: vi.fn(),
  })),
  QStashWorkflowAbort: vi.fn(),
}));

/**
 * Test suite for server.ts file
 * Tests all exports and functionality
 */
describe('orchestration server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exports', () => {
    test('should export provider classes', async () => {
      const { RateLimitProvider, UpstashWorkflowProvider } = await import('../src/server');
      
      expect(RateLimitProvider).toBeDefined();
      expect(typeof RateLimitProvider).toBe('function');
      expect(UpstashWorkflowProvider).toBeDefined();
      expect(typeof UpstashWorkflowProvider).toBe('function');
    });

    test('should export pattern utilities', async () => {
      const {
        BatchManager,
        CircuitBreakerConfigs,
        circuitBreakerManager,
        RetryStrategies,
        withBatch,
        withCircuitBreaker,
        withRetry,
      } = await import('../src/server');
      
      expect(BatchManager).toBeDefined();
      expect(typeof BatchManager).toBe('function');
      expect(CircuitBreakerConfigs).toBeDefined();
      expect(typeof CircuitBreakerConfigs).toBe('object');
      expect(circuitBreakerManager).toBeDefined();
      expect(typeof circuitBreakerManager).toBe('object');
      expect(RetryStrategies).toBeDefined();
      expect(typeof RetryStrategies).toBe('object');
      expect(withBatch).toBeDefined();
      expect(typeof withBatch).toBe('function');
      expect(withCircuitBreaker).toBeDefined();
      expect(typeof withCircuitBreaker).toBe('function');
      expect(withRetry).toBeDefined();
      expect(typeof withRetry).toBe('function');
    });

    test('should export error utilities', async () => {
      const {
        createOrchestrationError,
        createProviderError,
        createWorkflowExecutionError,
        OrchestrationError,
        OrchestrationErrorCodes,
        OrchestrationManager,
        ProviderError,
        validateProviderConfig,
        validateWorkflowDefinition,
        withRateLimit,
        WorkflowExecutionError,
      } = await import('../src/server');
      
      expect(createOrchestrationError).toBeDefined();
      expect(typeof createOrchestrationError).toBe('function');
      expect(createProviderError).toBeDefined();
      expect(typeof createProviderError).toBe('function');
      expect(createWorkflowExecutionError).toBeDefined();
      expect(typeof createWorkflowExecutionError).toBe('function');
      expect(OrchestrationError).toBeDefined();
      expect(typeof OrchestrationError).toBe('function');
      expect(OrchestrationErrorCodes).toBeDefined();
      expect(typeof OrchestrationErrorCodes).toBe('object');
      expect(OrchestrationManager).toBeDefined();
      expect(typeof OrchestrationManager).toBe('function');
      expect(ProviderError).toBeDefined();
      expect(typeof ProviderError).toBe('function');
      expect(validateProviderConfig).toBeDefined();
      expect(typeof validateProviderConfig).toBe('function');
      expect(validateWorkflowDefinition).toBeDefined();
      expect(typeof validateWorkflowDefinition).toBe('function');
      expect(withRateLimit).toBeDefined();
      expect(typeof withRateLimit).toBe('function');
      expect(WorkflowExecutionError).toBeDefined();
      expect(typeof WorkflowExecutionError).toBe('function');
    });

    test('should export QStash utilities', async () => {
      const { QStashClient, QStashWorkflowAbort } = await import('../src/server');
      
      expect(QStashClient).toBeDefined();
      expect(typeof QStashClient).toBe('function');
      expect(QStashWorkflowAbort).toBeDefined();
      expect(typeof QStashWorkflowAbort).toBe('function');
    });
  });

  describe('createWorkflowEngine', () => {
    test('should create workflow engine with default configuration', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      
      expect(engine).toBeDefined();
      expect(typeof engine).toBe('object');
      expect(engine.executeWorkflow).toBeDefined();
      expect(typeof engine.executeWorkflow).toBe('function');
      expect(engine.getExecution).toBeDefined();
      expect(typeof engine.getExecution).toBe('function');
      expect(engine.getStatus).toBeDefined();
      expect(typeof engine.getStatus).toBe('function');
      expect(engine.healthCheck).toBeDefined();
      expect(typeof engine.healthCheck).toBe('function');
      expect(engine.initialize).toBeDefined();
      expect(typeof engine.initialize).toBe('function');
      expect(engine.listExecutions).toBeDefined();
      expect(typeof engine.listExecutions).toBe('function');
      expect(engine.manager).toBeDefined();
      expect(engine.scheduleWorkflow).toBeDefined();
      expect(typeof engine.scheduleWorkflow).toBe('function');
      expect(engine.shutdown).toBeDefined();
      expect(typeof engine.shutdown).toBe('function');
    });

    test('should create workflow engine with custom configuration', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const config = {
        defaultProvider: 'test-provider',
        enableHealthChecks: true,
        enableMetrics: true,
        providers: [],
      };
      
      const engine = createWorkflowEngine(config);
      
      expect(engine).toBeDefined();
      expect(typeof engine).toBe('object');
    });

    test('should handle getStatus method', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      const status = engine.getStatus();
      
      expect(status).toBeDefined();
      expect(typeof status).toBe('object');
    });

    test('should handle healthCheck method', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      const healthResult = await engine.healthCheck();
      
      expect(healthResult).toBeDefined();
      expect(Array.isArray(healthResult)).toBe(true);
    });

    test('should handle initialize method', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      
      await expect(engine.initialize()).resolves.not.toThrow();
    });

    test('should handle shutdown method', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      
      await expect(engine.shutdown()).resolves.not.toThrow();
    });

    test('should handle executeWorkflow method', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      const definition = {
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
      
      // This should not throw during validation
      await expect(engine.executeWorkflow(definition)).rejects.toThrow();
    });

    test('should handle getExecution method', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      
      await expect(engine.getExecution('test-execution-id')).rejects.toThrow();
    });

    test('should handle listExecutions method', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      
      await expect(engine.listExecutions('test-workflow-id')).rejects.toThrow();
    });

    test('should handle scheduleWorkflow method', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const engine = createWorkflowEngine();
      const definition = {
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
      
      await expect(engine.scheduleWorkflow(definition)).rejects.toThrow();
    });

    test('should handle provider registration during initialization', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const config = {
        providers: [
          {
            name: 'test-rate-limit',
            type: 'rate-limit' as const,
            config: {
              maxRequests: 100,
              windowMs: 60000,
            },
          },
        ],
      };
      
      const engine = createWorkflowEngine(config);
      
      // Should not throw during initialization
      await expect(engine.initialize()).resolves.not.toThrow();
    });

    test('should handle upstash-workflow provider registration', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const config = {
        providers: [
          {
            name: 'test-upstash',
            type: 'upstash-workflow' as const,
            config: {
              baseUrl: 'https://test.upstash.io',
              qstashToken: 'test-token',
            },
          },
        ],
      };
      
      const engine = createWorkflowEngine(config);
      
      // Should not throw during initialization
      await expect(engine.initialize()).resolves.not.toThrow();
    });

    test('should throw error for unknown provider type', async () => {
      const { createWorkflowEngine } = await import('../src/server');
      
      const config = {
        providers: [
          {
            name: 'test-unknown',
            type: 'unknown' as any,
            config: {},
          },
        ],
      };
      
      const engine = createWorkflowEngine(config);
      
      await expect(engine.initialize()).rejects.toThrow('Unknown provider type: unknown');
    });
  });

  describe('workflowEngine default instance', () => {
    test('should export default workflow engine instance', async () => {
      const { workflowEngine } = await import('../src/server');
      
      expect(workflowEngine).toBeDefined();
      expect(typeof workflowEngine).toBe('object');
      expect(workflowEngine.executeWorkflow).toBeDefined();
      expect(workflowEngine.getExecution).toBeDefined();
      expect(workflowEngine.getStatus).toBeDefined();
      expect(workflowEngine.healthCheck).toBeDefined();
      expect(workflowEngine.initialize).toBeDefined();
      expect(workflowEngine.listExecutions).toBeDefined();
      expect(workflowEngine.manager).toBeDefined();
      expect(workflowEngine.scheduleWorkflow).toBeDefined();
      expect(workflowEngine.shutdown).toBeDefined();
    });

    test('should be able to call methods on default instance', async () => {
      const { workflowEngine } = await import('../src/server');
      
      const status = workflowEngine.getStatus();
      expect(status).toBeDefined();
      
      const healthResult = await workflowEngine.healthCheck();
      expect(healthResult).toBeDefined();
    });
  });

  describe('module structure', () => {
    test('should have all expected exports', async () => {
      const module = await import('../src/server');
      const exports = Object.keys(module);
      
      // Should have a reasonable number of exports
      expect(exports.length).toBeGreaterThan(10);
      
      // Should include key exports
      expect(exports).toContain('createWorkflowEngine');
      expect(exports).toContain('workflowEngine');
      expect(exports).toContain('UpstashWorkflowProvider');
      expect(exports).toContain('OrchestrationManager');
      expect(exports).toContain('validateWorkflowDefinition');
    });

    test('should not export any undefined values', async () => {
      const module = await import('../src/server');
      const exports = Object.keys(module);
      
      for (const exportName of exports) {
        expect(module[exportName]).toBeDefined();
      }
    });
  });

  describe('functional integration tests', () => {
    test('should be able to create and validate workflow definition', async () => {
      const { createWorkflowEngine, validateWorkflowDefinition } = await import('../src/server');
      
      const definition = {
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
      
      const validatedDefinition = validateWorkflowDefinition(definition);
      expect(validatedDefinition).toBeDefined();
      expect(validatedDefinition.id).toBe('test-workflow');
      
      const engine = createWorkflowEngine();
      expect(engine).toBeDefined();
    });

    test('should be able to create orchestration error', async () => {
      const { createOrchestrationError, OrchestrationErrorCodes } = await import('../src/server');
      
      const error = createOrchestrationError('Test error', {
        code: OrchestrationErrorCodes.WORKFLOW_EXECUTION_ERROR,
      });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
    });

    test('should be able to use pattern utilities', async () => {
      const { RetryStrategies, CircuitBreakerConfigs } = await import('../src/server');
      
      expect(RetryStrategies).toBeDefined();
      expect(typeof RetryStrategies).toBe('object');
      expect(CircuitBreakerConfigs).toBeDefined();
      expect(typeof CircuitBreakerConfigs).toBe('object');
    });
  });
});
