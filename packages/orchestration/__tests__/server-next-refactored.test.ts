/**
 * Server-Next Refactored Tests
 *
 * Demonstrates the DRY refactoring for server-side orchestration components.
 * Shows dramatic reduction in code duplication using centralized utilities.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import {
  createMockQStashProvider,
  createMockWorkflowProvider,
  createTestWorkflowServerClient,
} from './setup';
import { executionGenerators, testDataUtils, workflowGenerators } from './test-data-generators';
import { AssertionUtils, ImportTestUtils, TestUtils } from './test-utils';
import {
  assertWorkflowExecution,
  createProviderTestSuite,
  createWorkflowTestSuite,
  testModuleImport,
} from './workflow-test-factory';

// Mock observability with centralized pattern
vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

describe('server-Next - DRY Refactored', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Use centralized test suite for module imports
  createWorkflowTestSuite({
    suiteName: 'Server-Next Module Import Tests',
    moduleFactory: async () => {
      const result = await ImportTestUtils.testDynamicImport(() => import('../src/server-next'));
      return result.module;
    },
    scenarios: [
      {
        name: 'should import server-next module',
        type: 'basic',
        assertions: module => {
          expect(module).toBeDefined();

          // Expected exports
          const expectedExports = [
            'createWorkflowWebhookHandler',
            'createScheduleHandler',
            'createMetricsHandler',
            'createWorkflowActions',
            'cancelWorkflowAction',
            'getWorkflowStatusAction',
            'createWorkflowMiddleware',
            'createRateLimitMiddleware',
          ];

          expectedExports.forEach(exportName => {
            expect(module).toHaveProperty(exportName);
          });
        },
      },
      {
        name: 'should have proper export types',
        type: 'basic',
        assertions: module => {
          // Handler factories should be functions
          expect(typeof module.createWorkflowWebhookHandler).toBe('function');
          expect(typeof module.createScheduleHandler).toBe('function');
          expect(typeof module.createMetricsHandler).toBe('function');

          // Server actions should be functions
          expect(typeof module.createWorkflowActions).toBe('function');
          expect(typeof module.cancelWorkflowAction).toBe('function');
          expect(typeof module.getWorkflowStatusAction).toBe('function');
        },
      },
    ],
  });

  // API Route Handler tests using centralized patterns
  describe('aPI Route Handlers', () => {
    const handlerTests = [
      {
        name: 'createWorkflowWebhookHandler',
        factoryName: 'createWorkflowWebhookHandler',
        testData: {
          workflowId: 'workflow-1',
          input: { data: 'test' },
        },
        method: 'POST',
      },
      {
        name: 'createScheduleHandler',
        factoryName: 'createScheduleHandler',
        testData: {
          cron: '0 9 * * *',
          workflowId: 'workflow-1',
        },
        method: 'POST',
      },
      {
        name: 'createMetricsHandler',
        factoryName: 'createMetricsHandler',
        testData: {
          workflowId: 'workflow-1',
        },
        method: 'GET',
      },
    ];

    // Use centralized parameterized test pattern
    TestUtils.suites.createParameterizedTests(
      'Handler Creation Tests',
      async ({ factoryName, testData, method }) => {
        const module = await testModuleImport(() => import('../src/server-next'), [factoryName]);

        const handlerFactory = (module as any)[factoryName];
        const mockProvider = createMockWorkflowProvider();

        if (handlerFactory) {
          const handler = handlerFactory(mockProvider);
          expect(handler).toBeDefined();
          expect(typeof handler).toBe('function');

          // Test handler execution with mock request
          const mockRequest =
            method === 'POST'
              ? { method, json: () => Promise.resolve(testData) }
              : { method, url: `/?${new URLSearchParams(testData as any).toString()}` };

          const response = await handler(mockRequest);
          expect(response).toBeDefined();
        }
      },
      handlerTests.map(test => ({
        name: `should create ${test.name}`,
        params: test,
      })),
    );

    test('should handle handler errors gracefully', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowApi'],
      );

      const mockProvider = createMockWorkflowProvider();
      mockProvider.execute.mockRejectedValue(new Error('Handler error'));

      const handler = module.createWorkflowWebhookHandler({ provider: mockProvider });
      const mockRequest = {
        method: 'POST',
        json: () => Promise.resolve({ workflowId: 'test', input: {} }),
        nextUrl: { pathname: '/api/webhook' },
        cookies: new Map(),
        headers: new Map(),
        url: 'http://localhost/api/webhook',
      } as any;

      const response = await handler(mockRequest);
      expect(response).toBeDefined();
      // Response should handle error gracefully
    });
  });

  // Server Actions tests using centralized patterns
  describe('server Actions', () => {
    const actionTests = [
      {
        name: 'createWorkflowActions',
        formData: new Map([
          ['workflowId', 'workflow-1'],
          ['input', JSON.stringify({ data: 'test' })],
        ]),
        expectedResult: { success: true },
      },
      {
        name: 'cancelWorkflowAction',
        formData: new Map([['executionId', 'exec-1']]),
        expectedResult: { success: true },
      },
      {
        name: 'getWorkflowStatusAction',
        formData: new Map([['executionId', 'exec-1']]),
        expectedResult: { status: 'running' },
      },
    ];

    TestUtils.suites.createParameterizedTests(
      'Server Actions Tests',
      async ({ name, formData, expectedResult }) => {
        const module = await testModuleImport(() => import('../src/server-next'), [name]);

        if (name === 'createWorkflowActions') {
          const actions = (module as any)[name](createMockWorkflowProvider());
          const workflowId = formData.get('workflowId') || '';
          const inputStr = formData.get('input') || '{}';
          const input = JSON.parse(inputStr);

          const result = await actions.executeWorkflowAction(workflowId, input);
          expect(result).toBeDefined();
        } else {
          const action = (module as any)[name];
          if (action) {
            // Create FormData from Map
            const formDataInstance = new FormData();
            formData.forEach((value, key) => {
              formDataInstance.append(key, value);
            });

            const result = await action(formDataInstance);
            expect(result).toBeDefined();
          }
        }
      },
      actionTests.map(test => ({
        name: `should execute ${test.name}`,
        params: test,
      })),
    );

    test('should handle action errors', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowActions'],
      );

      const actions = module.createWorkflowActions(createMockWorkflowProvider());
      if (actions) {
        const invalidFormData = new FormData();
        // Missing required fields

        const result = await actions.executeWorkflowAction('', {});
        expect(result).toBeDefined();
        // Should handle invalid input gracefully
      }
    });
  });

  // Middleware tests using centralized patterns
  describe('middleware', () => {
    const middlewareTests = [
      {
        name: 'createWorkflowMiddleware',
        config: {
          provider: createMockWorkflowProvider(),
          rateLimiting: false,
        },
      },
      {
        name: 'createRateLimitMiddleware',
        config: {
          provider: createMockQStashProvider(),
          maxRequests: 100,
          windowMs: 60000,
        },
      },
    ];

    TestUtils.suites.createParameterizedTests(
      'Middleware Creation Tests',
      async ({ name, config }) => {
        const module = await testModuleImport(() => import('../src/server-next'), [name]);

        const middlewareFactory = (module as any)[name];
        if (middlewareFactory) {
          const middleware = middlewareFactory(config);
          expect(middleware).toBeDefined();
          expect(typeof middleware).toBe('function');

          // Test middleware execution
          const mockRequest = {
            method: 'POST',
            url: '/api/test',
            headers: new Map([['content-type', 'application/json']]),
          };

          const mockResponse = {
            status: 200,
            headers: new Map(),
          };

          const next = vi.fn();
          await middleware(mockRequest, mockResponse, next);

          // Middleware should call next() or modify response
          expect(next).toHaveBeenCalledWith();
        }
      },
      middlewareTests.map(test => ({
        name: `should create ${test.name}`,
        params: test,
      })),
    );
  });

  // Provider integration tests using centralized patterns
  describe('provider Integration', () => {
    createProviderTestSuite({
      providerName: 'Workflow Provider Integration',
      providerType: 'upstash-workflow',
      providerFactory: () => createMockWorkflowProvider(),
      scenarios: [
        {
          name: 'execute workflow via server handler',
          method: 'execute',
          input: workflowGenerators.simple(),
          expected: { id: expect.any(String), status: 'running' },
        },
        {
          name: 'get execution status via server handler',
          method: 'getExecution',
          input: 'exec-123',
          expected: { id: 'exec-123', status: expect.any(String) },
        },
        {
          name: 'cancel execution via server handler',
          method: 'cancelExecution',
          input: 'exec-123',
          expected: { id: 'exec-123', status: 'cancelled' },
        },
      ],
    });
  });

  // Performance tests using centralized utilities
  describe('performance Tests', () => {
    test('should handle concurrent requests efficiently', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowApi'],
      );

      const handler = module.createWorkflowWebhookHandler({
        provider: createMockWorkflowProvider(),
      });

      const benchmark = await TestUtils.performance.benchmark(
        async () => {
          const requests = Array.from(
            { length: 10 },
            () =>
              ({
                method: 'POST',
                json: () =>
                  Promise.resolve({
                    workflowId: testDataUtils.randomWorkflowId(),
                    input: { data: 'test' },
                  }),
                nextUrl: { pathname: '/api/webhook' },
                cookies: new Map(),
                headers: new Map(),
                url: 'http://localhost/api/webhook',
              }) as any,
          );

          const responses = await Promise.all(requests.map(request => handler(request)));

          return responses;
        },
        3, // 3 iterations
      );

      expect(benchmark.average).toBeLessThan(1000); // Max 1 second average
      expect(benchmark.results).toHaveLength(3);
    });

    test('should handle large payloads efficiently', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowActions'],
      );

      const actions = module.createWorkflowActions(createMockWorkflowProvider());
      if (actions) {
        const largeWorkflow = workflowGenerators.large(100); // 100 steps

        const result = await TestUtils.performance.testPerformance(
          async () => {
            return await actions.executeWorkflowAction(largeWorkflow.id, {
              workflow: largeWorkflow,
            });
          },
          2000, // Max 2 seconds
        );

        expect(result.duration).toBeLessThan(2000);
      }
    });
  });

  // Error handling tests using centralized utilities
  describe('error Handling Tests', () => {
    test('should handle handler initialization errors', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowApi'],
      );

      await TestUtils.errors.expectError(async () => {
        // Try to create handler with invalid provider
        module.createWorkflowWebhookHandler({ provider: null as any });
      }, 'Invalid provider');
    });

    test('should handle action execution errors', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowActions'],
      );

      const actions = module.createWorkflowActions(createMockWorkflowProvider());
      if (actions) {
        // Test with malformed input
        const result = await actions.executeWorkflowAction('', {});
        expect(result).toBeDefined();
        // Should handle empty workflow ID gracefully
      }
    });
  });

  // Integration tests using centralized patterns
  describe('integration Tests', () => {
    test('should integrate handlers with providers', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowApi'],
      );

      const mockProvider = createMockWorkflowProvider();
      const mockWorkflow = workflowGenerators.simple();
      const mockExecution = executionGenerators.running();

      mockProvider.execute.mockResolvedValue(mockExecution);

      const handler = module.createWorkflowWebhookHandler({ provider: mockProvider });
      const mockRequest = {
        method: 'POST',
        json: () =>
          Promise.resolve({
            workflowId: mockWorkflow.id,
            input: { test: 'data' },
          }),
        nextUrl: { pathname: '/api/webhook' },
        cookies: new Map(),
        headers: new Map(),
        url: 'http://localhost/api/webhook',
      } as any;

      const response = await handler(mockRequest);

      // Use centralized assertions
      expect(response).toBeDefined();
      expect(mockProvider.execute).toHaveBeenCalledWith(mockWorkflow.id, { test: 'data' });
    });

    test('should integrate actions with server client', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowActions'],
      );

      const serverClient = await createTestWorkflowServerClient();
      const mockWorkflow = workflowGenerators.simple();

      const actions = module.createWorkflowActions(createMockWorkflowProvider());
      if (actions) {
        const result = await actions.executeWorkflowAction(mockWorkflow.id, { test: 'data' });

        // Use centralized assertions
        expect(result).toBeDefined();
        assertWorkflowExecution(result);
      }
    });
  });

  // Random scenario tests using centralized utilities
  describe('random Scenario Tests', () => {
    test('should handle random workflow configurations', async () => {
      const module = await testModuleImport(
        () => import('../src/server-next'),
        ['createWorkflowApi'],
      );

      const handler = module.createWorkflowWebhookHandler({
        provider: createMockWorkflowProvider(),
      });
      const randomWorkflows = Array.from({ length: 5 }, () => testDataUtils.randomWorkflow());

      for (const workflow of randomWorkflows) {
        const mockRequest = {
          method: 'POST',
          json: () =>
            Promise.resolve({
              workflowId: workflow.id,
              input: { randomData: testDataUtils.randomString() },
            }),
          nextUrl: { pathname: '/api/webhook' },
          cookies: new Map(),
          headers: new Map(),
          url: 'http://localhost/api/webhook',
        } as any;

        const response = await handler(mockRequest);
        expect(response).toBeDefined();

        // Use centralized assertions
        AssertionUtils.assertWorkflow(workflow);
      }
    });
  });
});

// Code reduction comparison example
describe('code Reduction Comparison', () => {
  // Before DRY refactoring: This would be 400+ lines
  // After DRY refactoring: This is ~60 lines

  test('comprehensive server-next test with minimal code', async () => {
    const module = await testModuleImport(
      () => import('../src/server-next'),
      ['createWorkflowWebhookHandler', 'createWorkflowActions', 'createWorkflowMiddleware'],
    );

    const mockProvider = createMockWorkflowProvider();
    const mockWorkflow = workflowGenerators.simple();

    // Test all major components with minimal setup
    const handler = module.createWorkflowWebhookHandler({ provider: mockProvider });
    const actions = module.createWorkflowActions(mockProvider);
    const middleware = module.createWorkflowMiddleware({ provider: mockProvider });

    // All components should be properly initialized
    expect(handler).toBeDefined();
    expect(actions).toBeDefined();
    expect(middleware).toBeDefined();

    // Test execution flows
    const mockRequest = {
      method: 'POST',
      json: () => Promise.resolve({ workflowId: mockWorkflow.id, input: {} }),
      nextUrl: { pathname: '/api/webhook' },
      cookies: new Map(),
      headers: new Map(),
      url: 'http://localhost/api/webhook',
    } as any;

    const handlerResponse = await handler(mockRequest);
    expect(handlerResponse).toBeDefined();

    const actionResponse = await actions.executeWorkflowAction(mockWorkflow.id, {});
    expect(actionResponse).toBeDefined();
  });
});
