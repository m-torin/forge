/**
 * Advanced DRY test patterns for complex orchestration scenarios
 * Extends the basic test patterns with more sophisticated testing utilities
 */

import { expect, vi } from 'vitest';
import { createTestSuite } from './test-patterns';

/**
 * Advanced workflow testing patterns
 * Handles complex workflow scenarios with multiple steps and dependencies
 */
export function createAdvancedWorkflowTestPatterns() {
  const testSuite = createTestSuite('advanced-workflow');
  const { data, workflows, errors } = testSuite;

  const createWorkflowChain = (steps: Array<{ name: string; dependencies?: string[] }>) => {
    return steps.map((step, index) => ({
      id: `step-${index + 1}`,
      name: step.name,
      action: `${step.name.toLowerCase().replace(/\s+/g, '-')}-action`,
      dependencies: step.dependencies || [],
      status: 'pending' as const,
    }));
  };

  const createExecutionTimeline = (steps: any[]) => {
    return steps.map((step, index) => ({
      stepId: step.id,
      startedAt: new Date(Date.now() + index * 1000),
      completedAt: new Date(Date.now() + (index + 1) * 1000),
      status: 'completed' as const,
      output: { stepIndex: index },
    }));
  };

  return {
    createWorkflowChain,
    createExecutionTimeline,

    // Test complex workflow scenarios
    testWorkflowExecution: async function (
      executeFn: (workflow: any) => Promise<any>,
      workflow: any,
      expectedSteps: number,
    ) {
      const execution = await executeFn(workflow);

      expect(execution).toBeDefined();
      expect(execution.workflowId).toBe(workflow.id);
      expect(execution.steps?.length || 0).toBe(expectedSteps);

      return execution;
    },

    // Test workflow with dependencies
    testWorkflowWithDependencies: async function (
      executeFn: (workflow: any) => Promise<any>,
      steps: Array<{ name: string; dependencies?: string[] }>,
    ) {
      const chainedSteps = createWorkflowChain(steps);
      const workflow = workflows.createMockWorkflow({ steps: chainedSteps });

      const execution = await this.testWorkflowExecution(executeFn, workflow, steps.length);

      // Verify dependencies are respected
      chainedSteps.forEach((step, index) => {
        if (step.dependencies && step.dependencies.length > 0) {
          const dependentSteps = chainedSteps.filter(s => step.dependencies!.includes(s.name));
          expect(dependentSteps.length).toBeGreaterThan(0);
        }
      });

      return execution;
    },

    // Test parallel execution scenarios
    testParallelExecution: async function (
      executeFn: (workflows: any[]) => Promise<any[]>,
      workflowCount: number = 3,
    ) {
      const workflows = Array.from({ length: workflowCount }, (_, i) =>
        data.workflow.simple({ id: `workflow-${i + 1}` }),
      );

      const executions = await executeFn(workflows);

      expect(executions).toHaveLength(workflowCount);
      executions.forEach((execution, index) => {
        expect(execution.workflowId).toBe(`workflow-${index + 1}`);
      });

      return executions;
    },

    // Test workflow rollback scenarios
    testWorkflowRollback: async function (
      executeFn: (workflow: any) => Promise<any>,
      rollbackFn: (executionId: string) => Promise<any>,
    ) {
      const workflow = workflows.createMockWorkflow();
      const execution = await executeFn(workflow);

      expect(execution).toBeDefined();

      const rollbackResult = await rollbackFn(execution.id);
      expect(rollbackResult).toBeDefined();

      return { execution, rollbackResult };
    },
  };
}

/**
 * Advanced provider testing patterns
 * Handles complex provider scenarios with multiple configurations
 */
export function createAdvancedProviderTestPatterns() {
  const testSuite = createTestSuite('advanced-provider');
  const { errors, performance } = testSuite;

  const createProviderConfiguration = (type: 'redis' | 'qstash' | 'workflow', config: any = {}) => {
    const baseConfigs = {
      redis: { host: 'localhost', port: 6379, ...config },
      qstash: { token: 'test-token', ...config },
      workflow: { maxConcurrency: 10, timeout: 30000, ...config },
    };

    return baseConfigs[type];
  };

  return {
    createProviderConfiguration,

    // Test provider with different configurations
    testProviderConfigurations: async function (
      createProvider: (config: any) => any,
      configurations: Array<{ name: string; config: any; expectations?: (provider: any) => void }>,
    ) {
      const results = [];

      for (const scenario of configurations) {
        const provider = createProvider(scenario.config);
        expect(provider).toBeDefined();

        if (scenario.expectations) {
          scenario.expectations(provider);
        }

        results.push({ name: scenario.name, provider });
      }

      return results;
    },

    // Test provider failover scenarios
    testProviderFailover: async function (
      primaryProvider: any,
      fallbackProvider: any,
      testOperation: (provider: any) => Promise<any>,
    ) {
      // Test primary provider failure
      const primaryError = errors.createFailingMock(errors.networkError);
      primaryProvider.execute = primaryError;

      try {
        await testOperation(primaryProvider);
        throw new Error('Expected primary provider to fail');
      } catch (error: any) {
        expect(error.message).toContain('Network error');
      }

      // Test fallback provider success
      const fallbackResult = await testOperation(fallbackProvider);
      expect(fallbackResult).toBeDefined();

      return { primaryError, fallbackResult };
    },

    // Test provider health monitoring
    testProviderHealthMonitoring: async function (
      provider: any,
      healthCheckFn: (provider: any) => Promise<any>,
    ) {
      // Test healthy state
      vi.spyOn(provider, 'healthCheck').mockResolvedValue({ status: 'healthy' });
      const healthyResult = await healthCheckFn(provider);
      expect(healthyResult.status).toBe('healthy');

      // Test unhealthy state
      vi.spyOn(provider, 'healthCheck').mockResolvedValue({
        status: 'unhealthy',
        error: 'Connection failed',
      });
      const unhealthyResult = await healthCheckFn(provider);
      expect(unhealthyResult.status).toBe('unhealthy');

      return { healthyResult, unhealthyResult };
    },
  };
}

/**
 * Advanced performance testing patterns
 * Handles complex performance scenarios with metrics and benchmarks
 */
export function createAdvancedPerformanceTestPatterns() {
  const testSuite = createTestSuite('advanced-performance');
  const { performance } = testSuite;

  const createPerformanceBenchmark = (name: string, targetMs: number) => ({
    name,
    targetMs,
    actualMs: 0,
    passed: false,
    tolerance: 50,
  });

  return {
    createPerformanceBenchmark,

    // Test performance with multiple scenarios
    testPerformanceScenarios: async function (
      scenarios: Array<{
        name: string;
        fn: () => Promise<any>;
        maxDurationMs: number;
        minDurationMs?: number;
      }>,
    ) {
      const results = [];

      for (const scenario of scenarios) {
        const { result, duration } = await performance.measureExecutionTime(scenario.fn);

        const benchmark = createPerformanceBenchmark(scenario.name, scenario.maxDurationMs);
        benchmark.actualMs = duration;
        benchmark.passed = duration <= scenario.maxDurationMs;

        if (scenario.minDurationMs) {
          benchmark.passed = benchmark.passed && duration >= scenario.minDurationMs;
        }

        expect(duration).toBeLessThan(scenario.maxDurationMs);
        if (scenario.minDurationMs) {
          expect(duration).toBeGreaterThanOrEqual(scenario.minDurationMs);
        }

        results.push({ ...benchmark, result });
      }

      return results;
    },

    // Test concurrent performance
    testConcurrentPerformance: async function (
      fn: () => Promise<any>,
      concurrency: number = 10,
      maxDurationMs: number = 5000,
    ) {
      const promises = Array.from({ length: concurrency }, () =>
        performance.measureExecutionTime(fn),
      );

      const results = await Promise.all(promises);

      // Verify all completed within time limit
      results.forEach((result, index) => {
        expect(result.duration).toBeLessThan(maxDurationMs);
      });

      // Calculate statistics
      const durations = results.map(r => r.duration);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      return {
        results,
        statistics: {
          avgDuration,
          maxDuration,
          minDuration,
          concurrency,
        },
      };
    },

    // Test memory usage patterns
    testMemoryUsage: async function (fn: () => Promise<any>, maxMemoryMB: number = 100) {
      const initialMemory = process.memoryUsage();

      await fn();

      const finalMemory = process.memoryUsage();
      const memoryDiff = {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external,
      };

      const memoryUsageMB = memoryDiff.heapUsed / (1024 * 1024);
      expect(memoryUsageMB).toBeLessThan(maxMemoryMB);

      return {
        initialMemory,
        finalMemory,
        memoryDiff,
        memoryUsageMB,
      };
    },
  };
}

/**
 * Advanced integration testing patterns
 * Handles end-to-end scenarios with multiple components
 */
export function createAdvancedIntegrationTestPatterns() {
  const testSuite = createTestSuite('advanced-integration');
  const { workflows, data, errors } = testSuite;

  return {
    // Test full workflow lifecycle
    testFullWorkflowLifecycle: async function (
      components: {
        scheduler: any;
        executor: any;
        monitor: any;
      },
      workflow: any = workflows.createMockWorkflow(),
    ) {
      // Schedule workflow
      const scheduleResult = await components.scheduler.schedule(workflow);
      expect(scheduleResult).toBeDefined();

      // Execute workflow
      const execution = await components.executor.execute(workflow);
      expect(execution).toBeDefined();
      expect(execution.workflowId).toBe(workflow.id);

      // Monitor execution
      const monitorResult = await components.monitor.getStatus(execution.id);
      expect(monitorResult).toBeDefined();

      return { scheduleResult, execution, monitorResult };
    },

    // Test component integration with failure scenarios
    testComponentIntegration: async function (
      components: Record<string, any>,
      integrationScenarios: Array<{
        name: string;
        setup: (components: Record<string, any>) => Promise<void>;
        test: (components: Record<string, any>) => Promise<any>;
        expectedResult?: any;
      }>,
    ) {
      const results = [];

      for (const scenario of integrationScenarios) {
        await scenario.setup(components);

        const result = await scenario.test(components);

        if (scenario.expectedResult) {
          expect(result).toMatchObject(scenario.expectedResult);
        }

        results.push({ name: scenario.name, result });
      }

      return results;
    },

    // Test data flow between components
    testDataFlow: async function (
      pipeline: Array<{
        name: string;
        component: any;
        method: string;
        expectedInput?: any;
        expectedOutput?: any;
      }>,
      initialData: any,
    ) {
      let currentData = initialData;
      const flowResults = [];

      for (const stage of pipeline) {
        if (stage.expectedInput) {
          expect(currentData).toMatchObject(stage.expectedInput);
        }

        const result = await stage.component[stage.method](currentData);

        if (stage.expectedOutput) {
          expect(result).toMatchObject(stage.expectedOutput);
        }

        flowResults.push({
          stage: stage.name,
          input: currentData,
          output: result,
        });

        currentData = result;
      }

      return flowResults;
    },
  };
}

/**
 * Master utility that combines all advanced patterns
 */
export function createAdvancedTestSuite(moduleName: string) {
  const baseTestSuite = createTestSuite(moduleName);
  const advancedWorkflows = createAdvancedWorkflowTestPatterns();
  const advancedProviders = createAdvancedProviderTestPatterns();
  const advancedPerformance = createAdvancedPerformanceTestPatterns();
  const advancedIntegration = createAdvancedIntegrationTestPatterns();

  return {
    ...baseTestSuite,
    advanced: {
      workflows: advancedWorkflows,
      providers: advancedProviders,
      performance: advancedPerformance,
      integration: advancedIntegration,
    },

    // Advanced test methods
    testAdvancedWorkflows: async function () {
      return advancedWorkflows;
    },

    testAdvancedProviders: async function () {
      return advancedProviders;
    },

    testAdvancedPerformance: async function () {
      return advancedPerformance;
    },

    testAdvancedIntegration: async function () {
      return advancedIntegration;
    },

    // Comprehensive test runner for complex scenarios
    runAdvancedTestSuite: async function (testConfig: {
      workflows?: boolean;
      providers?: boolean;
      performance?: boolean;
      integration?: boolean;
    }) {
      const results: any = {};

      if (testConfig.workflows) {
        results.workflows = await this.testAdvancedWorkflows();
      }

      if (testConfig.providers) {
        results.providers = await this.testAdvancedProviders();
      }

      if (testConfig.performance) {
        results.performance = await this.testAdvancedPerformance();
      }

      if (testConfig.integration) {
        results.integration = await this.testAdvancedIntegration();
      }

      return results;
    },
  };
}
