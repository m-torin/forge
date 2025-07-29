import { vi } from 'vitest';

// Mock Upstash Workflow serve function
export const createMockWorkflowServe = () => {
  return vi.fn().mockImplementation((handler: Function) => {
    // Return Next.js route handler object
    return {
      GET: async () => {
        return Response.json({ status: 'ok' }, { status: 200 });
      },
      POST: async (request: any) => {
        const body = await request.json();
        const context = {
          cancel: vi.fn(),
          requestPayload: body,
          run: vi.fn().mockImplementation(async (id: string, fn: Function) => {
            return await fn();
          }),
          sleep: vi
            .fn()
            .mockImplementation(
              (ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms)),
            ),
          waitUntil: vi.fn(),
        };

        await handler(context);
        return Response.json({ success: true }, { status: 200 });
      },
    };
  });
};

// Mock workflow execution context
export const createMockWorkflowContext = (payload: any = {}) => ({
  cancel: vi.fn().mockResolvedValue(true),
  env: {
    QSTASH_TOKEN: 'test-token',
    UPSTASH_REDIS_REST_TOKEN: 'test-redis-token',
    UPSTASH_REDIS_REST_URL: 'https://test-redis.upstash.io',
  },
  requestPayload: payload,
  run: vi.fn().mockImplementation(async (name: string, fn: Function) => {
    return await fn();
  }),
  sleep: vi
    .fn()
    .mockImplementation((ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms))),
  waitUntil: vi.fn(),
});

// Mock workflow client
export const createMockWorkflowClient = () => ({
  cancel: vi.fn().mockResolvedValue(true),
  getResult: vi.fn().mockResolvedValue({ success: true }),
  run: vi.fn().mockResolvedValue({ executionId: 'exec_123' }),
});

// Setup workflow mocks for module mocking
export const setupWorkflowMocks = () => {
  const mockServe = createMockWorkflowServe();
  const mockClient = createMockWorkflowClient();

  // Mock @upstash/workflow
  vi.doMock('@upstash/workflow', () => ({
    Client: vi.fn().mockImplementation(() => mockClient),
    serve: mockServe,
  }));

  // Mock @upstash/workflow/nextjs
  vi.doMock('@upstash/workflow/nextjs', () => ({
    serve: mockServe,
  }));

  return {
    serve: mockServe,
    client: mockClient,
  };
};

// Reset workflow mocks
export const resetWorkflowMocks = (mocks: ReturnType<typeof setupWorkflowMocks>) => {
  vi.clearAllMocks();

  // Reset mock implementations
  Object.values(mocks.client).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};

// Create test workflow definition
export const createTestWorkflowDefinition = (overrides: any = {}) => ({
  id: 'test-workflow',
  name: 'Test Workflow',
  steps: [
    {
      id: 'step-1',
      name: 'First Step',
      action: 'process-data',
    },
    {
      id: 'step-2',
      name: 'Second Step',
      action: 'send-notification',
      dependsOn: ['step-1'],
    },
  ],
  version: '1.0.0',
  ...overrides,
});

// Create test execution
export const createTestExecution = (overrides: any = {}) => ({
  id: 'exec_123',
  input: { test: 'data' },
  metadata: {
    trigger: {
      type: 'manual' as const,
      payload: { test: 'data' },
      timestamp: new Date(),
    },
  },
  startedAt: new Date(),
  status: 'pending' as const,
  steps: [
    {
      attempts: 0,
      status: 'pending' as const,
      stepId: 'step-1',
    },
    {
      attempts: 0,
      status: 'pending' as const,
      stepId: 'step-2',
    },
  ],
  workflowId: 'test-workflow',
  ...overrides,
});

// Enhanced workflow testing scenarios
export const createWorkflowTestScenarios = () => {
  return {
    // Simple workflow
    simple: createTestWorkflowDefinition({
      steps: [
        {
          id: 'step-1',
          name: 'Simple Step',
          action: 'log-message',
        },
      ],
    }),

    // Complex workflow with dependencies
    complex: createTestWorkflowDefinition({
      id: 'complex-workflow',
      steps: [
        {
          id: 'step-1',
          name: 'Data Processing',
          action: 'process-data',
        },
        {
          id: 'step-2',
          name: 'Validation',
          action: 'validate-data',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-3',
          name: 'Notification',
          action: 'send-notification',
          dependsOn: ['step-2'],
        },
        {
          id: 'step-4',
          name: 'Cleanup',
          action: 'cleanup-temp-files',
          dependsOn: ['step-3'],
        },
      ],
    }),

    // Workflow with parallel steps
    parallel: createTestWorkflowDefinition({
      id: 'parallel-workflow',
      steps: [
        {
          id: 'step-1',
          name: 'Init',
          action: 'initialize',
        },
        {
          id: 'step-2a',
          name: 'Process A',
          action: 'process-a',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-2b',
          name: 'Process B',
          action: 'process-b',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-3',
          name: 'Merge',
          action: 'merge-results',
          dependsOn: ['step-2a', 'step-2b'],
        },
      ],
    }),

    // Workflow with error handling
    errorHandling: createTestWorkflowDefinition({
      id: 'error-workflow',
      steps: [
        {
          id: 'step-1',
          name: 'Risky Operation',
          action: 'risky-operation',
        },
        {
          id: 'step-2',
          name: 'Error Handler',
          action: 'handle-error',
          onError: 'continue',
        },
      ],
    }),
  };
};

// Enhanced provider creation for different scenarios
export const createWorkflowProviderScenarios = () => {
  const baseMocks = setupWorkflowMocks();

  return {
    // Standard successful provider
    successful: createMockWorkflowContext({ test: 'data' }),

    // Provider that fails operations
    failing: {
      ...createMockWorkflowContext(),
      run: vi.fn().mockRejectedValue(new Error('Workflow operation failed')),
    },

    // Provider with network issues
    networkError: {
      ...createMockWorkflowContext(),
      run: vi.fn().mockRejectedValue(new Error('Network error')),
    },

    // Provider with timeout issues
    timeout: {
      ...createMockWorkflowContext(),
      run: vi.fn().mockImplementation(async () => {
        await new Promise((resolve: any) => setTimeout(resolve, 1000));
        throw new Error('Timeout');
      }),
    },

    // Provider for testing cancellation
    cancellation: {
      ...createMockWorkflowContext(),
      cancel: vi.fn().mockResolvedValue(true),
    },

    // Clean up function
    cleanup: () => resetWorkflowMocks(baseMocks),
  };
};

// Mock instances
export const mockWorkflowServe = createMockWorkflowServe();
export const mockWorkflowClient = createMockWorkflowClient();
export const mockWorkflowContext = createMockWorkflowContext();

// Vitest mocks
export const mockUpstashWorkflow = {
  Client: vi.fn().mockImplementation(() => mockWorkflowClient),
  serve: mockWorkflowServe,
};

// Helper functions for test setup
export const setupWorkflowEnvironment = (): void => {
  process.env.QSTASH_TOKEN = 'test-workflow-token';
  process.env.UPSTASH_WORKFLOW_URL = 'https://test-workflow.upstash.io';
};

export const cleanupWorkflowEnvironment = (): void => {
  delete process.env.QSTASH_TOKEN;
  delete process.env.UPSTASH_WORKFLOW_URL;
};

// Mock the @upstash/workflow modules for automatic Vitest usage
vi.mock('@upstash/workflow', () => ({
  Client: vi.fn().mockImplementation(() => createMockWorkflowClient()),
  serve: createMockWorkflowServe(),
}));

vi.mock('@upstash/workflow/nextjs', () => ({
  serve: createMockWorkflowServe(),
}));
