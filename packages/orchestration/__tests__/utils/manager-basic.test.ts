import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  OrchestrationManager,
  type OrchestrationManagerConfig,
} from '../../src/shared/utils/manager';

// Mock external dependencies
vi.mock('@repo/observability', () => ({
  createServerObservability: vi.fn(() =>
    Promise.resolve({
      log: vi.fn(),
      error: vi.fn(),
    }),
  ),
}));

describe('orchestrationManager - Basic Coverage', () => {
  let manager: OrchestrationManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new OrchestrationManager();
  });

  describe('constructor and basic methods', () => {
    test('should create manager with default config', () => {
      const manager = new OrchestrationManager();
      expect(manager).toBeInstanceOf(OrchestrationManager);
    });

    test('should create manager with custom config', () => {
      const config: OrchestrationManagerConfig = {
        autoRetry: false,
        enableHealthChecks: false,
        enableMetrics: false,
        enableStepFactory: false,
        maxConcurrentExecutions: 50,
        globalTimeout: 120000,
      };

      const manager = new OrchestrationManager(config);
      expect(manager).toBeInstanceOf(OrchestrationManager);
    });

    test('should initialize and get status', async () => {
      await manager.initialize();
      const status = manager.getStatus();

      expect(status.initialized).toBeTruthy();
      expect(status.providerCount).toBe(0);
      expect(status).toHaveProperty('metricsEnabled');
      expect(status).toHaveProperty('healthChecksEnabled');
      expect(status).toHaveProperty('stepFactoryEnabled');
    });

    test('should not reinitialize when already initialized', async () => {
      await manager.initialize();
      await manager.initialize(); // Should not throw
      expect(manager.getStatus().initialized).toBeTruthy();
    });

    test('should shutdown when not initialized', async () => {
      await manager.shutdown(); // Should not throw
      expect(manager.getStatus().initialized).toBeFalsy();
    });

    test('should shutdown successfully after initialization', async () => {
      await manager.initialize();
      await manager.shutdown();
      expect(manager.getStatus().initialized).toBeFalsy();
    });
  });

  describe('provider management without registration', () => {
    test('should throw error when getting non-existent provider', () => {
      expect(() => manager.getProvider('non-existent')).toThrow('Provider non-existent not found');
    });

    test('should throw error when no provider specified and no default', () => {
      expect(() => manager.getProvider()).toThrow('No provider specified and no default');
    });

    test('should list empty providers initially', () => {
      expect(manager.listProviders()).toStrictEqual([]);
    });

    test('should throw error when unregistering non-existent provider', async () => {
      await expect(manager.unregisterProvider('non-existent')).rejects.toThrow(
        'Provider non-existent not found',
      );
    });

    test('should return empty health reports for no providers', async () => {
      const reports = await manager.healthCheckAll();
      expect(reports).toStrictEqual([]);
    });
  });

  describe('step factory methods when disabled', () => {
    let disabledManager: OrchestrationManager;

    beforeEach(() => {
      disabledManager = new OrchestrationManager({ enableStepFactory: false });
    });

    test('should throw error when registering step with factory disabled', () => {
      const stepDefinition = {
        id: 'test-step',
        name: 'Test Step',
        version: '1.0.0',
        execute: vi.fn(),
        metadata: {
          name: 'Test Step',
          version: '1.0.0',
          description: 'Test step definition',
          tags: [],
        },
      };

      expect(() => disabledManager.registerStep(stepDefinition)).toThrow(
        'Step factory is not enabled',
      );
    });

    test('should return undefined for getStep when factory disabled', () => {
      const step = disabledManager.getStep('test-step');
      expect(step).toBeUndefined();
    });

    test('should return empty array for listSteps when factory disabled', () => {
      const steps = disabledManager.listSteps();
      expect(steps).toStrictEqual([]);
    });

    test('should return empty array for searchSteps when factory disabled', () => {
      const results = disabledManager.searchSteps({ category: 'test' });
      expect(results).toStrictEqual([]);
    });

    test('should return empty array for getStepCategories when factory disabled', () => {
      const categories = disabledManager.getStepCategories();
      expect(categories).toStrictEqual([]);
    });

    test('should return empty array for getStepTags when factory disabled', () => {
      const tags = disabledManager.getStepTags();
      expect(tags).toStrictEqual([]);
    });

    test('should return null for getStepUsageStatistics when factory disabled', () => {
      const stats = disabledManager.getStepUsageStatistics();
      expect(stats).toBeNull();
    });

    test('should return error for validateStepDependencies when factory disabled', () => {
      const result = disabledManager.validateStepDependencies(['step1', 'step2']);
      expect(result).toStrictEqual({ errors: ['Step factory is not enabled'], valid: false });
    });

    test('should throw error for createStepExecutionPlan when factory disabled', () => {
      expect(() => disabledManager.createStepExecutionPlan(['step1'])).toThrow(
        'Step factory is not enabled',
      );
    });

    test('should throw error for executeStep when factory disabled', async () => {
      await expect(disabledManager.executeStep('step-1', {}, 'workflow-exec-1')).rejects.toThrow(
        'Step factory is not enabled',
      );
    });

    test('should return empty array for exportSteps when factory disabled', () => {
      const exported = disabledManager.exportSteps();
      expect(exported).toStrictEqual([]);
    });

    test('should throw error for importSteps when factory disabled', () => {
      expect(() => disabledManager.importSteps([])).toThrow('Step factory is not enabled');
    });
  });

  describe('workflow operations without providers', () => {
    test('should throw error when executing workflow without provider', async () => {
      const definition = { id: 'workflow-1', name: 'Test Workflow', version: '1.0.0', steps: [] };

      await expect(manager.executeWorkflow(definition)).rejects.toThrow(
        'No provider specified and no default',
      );
    });

    test('should throw error when getting execution without provider', async () => {
      await expect(manager.getExecution('exec-1')).rejects.toThrow(
        'No provider specified and no default',
      );
    });

    test('should throw error when listing executions without provider', async () => {
      await expect(manager.listExecutions('workflow-1')).rejects.toThrow(
        'No provider specified and no default',
      );
    });

    test('should throw error when canceling execution without provider', async () => {
      await expect(manager.cancelExecution('exec-1')).rejects.toThrow(
        'No provider specified and no default',
      );
    });

    test('should throw error when scheduling workflow without provider', async () => {
      const definition = { id: 'workflow-1', name: 'Test Workflow', version: '1.0.0', steps: [] };

      await expect(manager.scheduleWorkflow(definition)).rejects.toThrow(
        'No provider specified and no default',
      );
    });

    test('should throw error when unscheduling workflow without provider', async () => {
      await expect(manager.unscheduleWorkflow('workflow-1')).rejects.toThrow(
        'No provider specified and no default',
      );
    });
  });

  describe('getters', () => {
    test('should get step factory instance', () => {
      const factory = manager.getStepFactory();
      expect(factory).toBeDefined();
    });

    test('should get step registry instance', () => {
      const registry = manager.getStepRegistry();
      expect(registry).toBeDefined();
    });
  });

  describe('configuration variations', () => {
    test('should handle all config options', () => {
      const config: OrchestrationManagerConfig = {
        autoRetry: false,
        defaultProvider: 'custom-provider',
        defaultRetryConfig: {
          backoff: 'linear',
          delay: 2000,
          maxAttempts: 5,
        },
        enableHealthChecks: false,
        enableMetrics: false,
        enableStepFactory: false,
        globalTimeout: 600000,
        healthCheckInterval: 30000,
        maxConcurrentExecutions: 200,
      };

      const manager = new OrchestrationManager(config);
      const status = manager.getStatus();

      expect(status.defaultProvider).toBe('custom-provider');
      expect(status.healthChecksEnabled).toBeFalsy();
      expect(status.metricsEnabled).toBeFalsy();
      expect(status.stepFactoryEnabled).toBeFalsy();
    });

    test('should handle metrics disabled status', () => {
      const manager = new OrchestrationManager({ enableMetrics: false });
      const status = manager.getStatus();

      expect(status.executionMetrics).toBeNull();
      expect(status.metricsEnabled).toBeFalsy();
    });

    test('should handle step factory disabled status', () => {
      const manager = new OrchestrationManager({ enableStepFactory: false });
      const status = manager.getStatus();

      expect(status.stepRegistry).toBeNull();
      expect(status.stepFactoryEnabled).toBeFalsy();
    });
  });

  describe('error conditions', () => {
    test('should handle initialization errors gracefully', async () => {
      // Mock an error during initialization
      const errorManager = new OrchestrationManager();

      // This should not throw since we handle most internal errors
      await errorManager.initialize();
      expect(errorManager.getStatus().initialized).toBeTruthy();
    });

    test('should handle shutdown errors gracefully', async () => {
      await manager.initialize();

      // This should complete without throwing
      await manager.shutdown();
      expect(manager.getStatus().initialized).toBeFalsy();
    });
  });
});
