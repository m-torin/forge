# Advanced Orchestration Features

This document describes the advanced features implemented in Phase 3 of the orchestration package.

## Overview

The advanced features provide production-ready capabilities for complex workflow orchestration
scenarios:

1. **Enhanced Scheduling** - Advanced cron scheduling with timezone handling
2. **Monitoring & Observability** - Comprehensive workflow metrics and execution tracking
3. **Next.js Integration** - React hooks and API route helpers for seamless Next.js integration
4. **Saga Pattern** - Distributed transaction management for complex workflows
5. **Versioning & Composition** - Workflow versioning and composition utilities
6. **Testing & Development** - Comprehensive testing utilities and development tools

## Enhanced Scheduling

### Features

- Advanced cron expression support
- Timezone-aware scheduling
- Schedule management (pause, resume, delete)
- Catch-up execution for missed schedules
- Health monitoring for schedules

### Usage

```typescript
import { createAdvancedScheduler, ScheduleUtils } from '@repo/orchestration';

const scheduler = createAdvancedScheduler(provider);

// Create a schedule
const scheduleId = await scheduler.createSchedule(workflowId, {
  cron: '0 9 * * MON-FRI', // Weekdays at 9 AM
  timezone: 'America/New_York',
  maxExecutions: 100,
  catchUp: true,
});

// Manage schedule
await scheduler.pauseSchedule(scheduleId);
await scheduler.resumeSchedule(scheduleId);

// Health check
const healthChecks = await scheduler.performHealthCheck([scheduleId]);
```

## Monitoring & Observability

### Features

- Real-time workflow metrics
- Execution history tracking
- Performance analytics
- Alert rules and notifications
- Dashboard data generation

### Usage

```typescript
import { createWorkflowMonitor, MonitoringUtils } from '@repo/orchestration';

const monitor = createWorkflowMonitor(provider);

// Record execution events
monitor.recordExecutionStart(executionId, workflowId, metadata);
monitor.recordExecutionCompletion(executionId, 'completed', output);

// Get metrics
const metrics = monitor.getWorkflowMetrics(workflowId);
const history = monitor.getExecutionHistory(workflowId, { limit: 10 });

// Create alert rules
const ruleId = monitor.createAlertRule({
  name: 'High Error Rate',
  workflowId: '*',
  condition: {
    metric: 'successRate',
    operator: '<',
    threshold: 0.8,
    timeWindow: 60,
  },
  severity: 'high',
  channels: [{ type: 'email', target: 'admin@example.com' }],
  enabled: true,
  cooldown: 30,
});

// Dashboard data
const dashboard = monitor.getDashboardData(['workflow1', 'workflow2']);
```

## Next.js Integration

### React Hooks

```typescript
'use client';
import { useWorkflow, useWorkflowMetrics, useExecutionHistory } from '@repo/orchestration';

function WorkflowComponent() {
  const { execute, execution, isExecuting, error } = useWorkflow(workflowId, { provider });
  const { metrics } = useWorkflowMetrics(workflowId, { provider });
  const { executions } = useExecutionHistory(workflowId, { provider });

  const handleExecute = async () => {
    try {
      await execute({ input: 'data' });
    } catch (err) {
      console.error('Execution failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleExecute} disabled={isExecuting}>
        {isExecuting ? 'Running...' : 'Execute Workflow'}
      </button>
      {execution && <div>Status: {execution.status}</div>}
      {metrics && <div>Success Rate: {metrics.successRate * 100}%</div>}
    </div>
  );
}
```

### API Routes

```typescript
// app/api/workflows/[workflowId]/route.ts
import { createWorkflowApi } from '@repo/orchestration';

const api = createWorkflowApi({
  provider,
  authenticate: async (request) => {
    // Implement authentication
    return { userId: 'user123', roles: ['admin'] };
  },
  authorize: async (user, action, resource) => {
    // Implement authorization
    return user.roles.includes('admin');
  },
});

export const GET = api.getWorkflow;
export const POST = api.executeWorkflow;
```

### Server Actions

```typescript
// app/actions/workflows.ts
import { createWorkflowActions } from '@repo/orchestration';

const actions = createWorkflowActions(provider);

export const executeWorkflow = actions.executeWorkflow;
export const cancelExecution = actions.cancelExecution;
```

## Saga Pattern

### Features

- Distributed transaction management
- Automatic compensation on failure
- Step-by-step execution control
- Retry mechanisms
- Conditional execution

### Usage

```typescript
import { createSaga, createSagaOrchestrator } from '@repo/orchestration';

// Define a saga
const paymentSaga = createSaga('payment-saga', 'Payment Processing')
  .step(
    'validate-payment',
    'Validate Payment',
    async (context) => {
      // Validate payment details
      return { valid: true };
    },
    {
      compensation: async (context) => {
        // Cleanup validation
      },
    }
  )
  .step(
    'charge-card',
    'Charge Credit Card',
    async (context) => {
      // Charge the card
      return { transactionId: '12345' };
    },
    {
      compensation: async (context) => {
        // Refund the charge
      },
      retry: { maxAttempts: 3, delay: 1000 },
    }
  )
  .step(
    'update-inventory',
    'Update Inventory',
    async (context) => {
      // Update inventory
      return { updated: true };
    },
    {
      compensation: async (context) => {
        // Restore inventory
      },
    }
  )
  .build();

// Execute saga
const orchestrator = createSagaOrchestrator(provider);
orchestrator.registerSaga(paymentSaga);

const executionId = await orchestrator.executeSaga('payment-saga', {
  amount: 100,
  cardToken: 'token123',
});
```

## Workflow Versioning & Composition

### Versioning

```typescript
import { createWorkflowVersionManager } from '@repo/orchestration';

const versionManager = createWorkflowVersionManager(provider);

// Create version
await versionManager.createVersion(workflowId, definition, '1.2.0', {
  description: 'Added error handling improvements',
  migration: {
    fromVersion: '1.1.0',
    instructions: 'Update step configurations',
    automaticMigration: true,
  },
});

// Manage versions
await versionManager.activateVersion(workflowId, '1.2.0');
await versionManager.deprecateVersion(workflowId, '1.1.0');

// Get migration path
const migrationPath = versionManager.getMigrationPath(workflowId, '1.0.0', '1.2.0');
```

### Composition

```typescript
import { createWorkflowComposer } from '@repo/orchestration';

const composer = createWorkflowComposer(provider, versionManager);

// Define composition
const orderProcessing: WorkflowComposition = {
  id: 'order-processing',
  name: 'Order Processing Workflow',
  strategy: 'sequential',
  errorHandling: 'fail-fast',
  workflows: [
    {
      workflowId: 'payment-workflow',
      version: '1.2.0',
      alias: 'payment',
      order: 1,
      inputMapping: { amount: 'order.total', card: 'payment.card' },
      outputMapping: { transactionId: 'payment.transactionId' },
    },
    {
      workflowId: 'inventory-workflow',
      alias: 'inventory',
      order: 2,
      condition: (context) => context.getResult('payment')?.success === true,
    },
    {
      workflowId: 'shipping-workflow',
      alias: 'shipping',
      order: 3,
    },
  ],
};

composer.createComposition(orderProcessing);

// Execute composition
const executionId = await composer.executeComposition('order-processing', {
  order: { total: 100, items: ['item1'] },
  payment: { card: 'token123' },
});
```

### Bulk Operations

```typescript
import { createBulkOperationManager } from '@repo/orchestration';

const bulkManager = createBulkOperationManager(provider);

// Execute multiple workflows
const operationId = await bulkManager.executeBulkOperation({
  type: 'execute',
  targets: [
    { workflowId: 'workflow1', input: { data: 'a' } },
    { workflowId: 'workflow2', input: { data: 'b' } },
    { workflowId: 'workflow3', input: { data: 'c' } },
  ],
  config: {
    concurrency: 3,
    batchSize: 5,
    errorHandling: 'continue',
  },
});

// Monitor progress
const operation = bulkManager.getBulkOperation(operationId);
console.log(`Progress: ${operation.progress.completed}/${operation.progress.total}`);
```

## Testing & Development

### Mock Provider

```typescript
import { createMockWorkflowProvider, createWorkflowTestRunner } from '@repo/orchestration';

const mockProvider = createMockWorkflowProvider();

// Configure mock behavior
mockProvider.configureMock('test-workflow', {
  behavior: 'success',
  delay: 100,
  result: { success: true },
});

// Register test workflow
mockProvider.registerWorkflow({
  id: 'test-workflow',
  name: 'Test Workflow',
  steps: [{ id: 'step1', name: 'Test Step' }],
});
```

### Test Runner

```typescript
const testRunner = createWorkflowTestRunner(mockProvider, true);

const testSuite: WorkflowTestSuite = {
  name: 'Payment Workflow Tests',
  workflowId: 'payment-workflow',
  scenarios: [
    {
      name: 'Successful Payment',
      input: { amount: 100, card: 'valid-card' },
      expectedOutput: { success: true, transactionId: 'tx123' },
      mocks: {
        'payment-service': {
          behavior: 'success',
          result: { transactionId: 'tx123' },
        },
      },
    },
    {
      name: 'Failed Payment',
      input: { amount: 100, card: 'invalid-card' },
      expectedError: 'Payment failed',
      mocks: {
        'payment-service': {
          behavior: 'failure',
          error: new Error('Payment failed'),
        },
      },
    },
  ],
};

const result = await testRunner.runTestSuite(testSuite);
console.log(`Test suite ${result.suiteName}: ${result.status}`);
console.log(`Passed: ${result.stats.passed}/${result.stats.total}`);
```

### Development Server

```typescript
import { createWorkflowDevServer } from '@repo/orchestration';

const devServer = createWorkflowDevServer(provider);

// Start development server
await devServer.start(3000);

// Watch tests
await devServer.watchTests([testSuite]);

// Hot reload workflows
await devServer.reloadWorkflow('payment-workflow');
```

### Debugging Utilities

```typescript
import { WorkflowDebugUtils } from '@repo/orchestration';

// Validate workflow definition
const errors = WorkflowDebugUtils.validateWorkflowDefinition(workflow);
if (errors.length > 0) {
  console.error('Workflow validation errors:', errors);
}

// Create execution trace
const trace = WorkflowDebugUtils.createExecutionTrace(execution);
console.log(trace);

// Generate test scenarios
const scenarios = WorkflowDebugUtils.generateTestScenarios(workflow);
```

## Best Practices

### Scheduling

- Use timezone-aware scheduling for global applications
- Implement health checks for critical schedules
- Use catch-up execution carefully to avoid overwhelming the system
- Monitor schedule execution frequency and adjust as needed

### Monitoring

- Set up alert rules for critical metrics (error rate, execution time)
- Use appropriate time windows for metrics collection
- Implement proper logging for workflow executions
- Monitor resource usage and queue sizes

### Saga Pattern

- Design compensation actions carefully
- Keep saga steps idempotent
- Use timeouts for external service calls
- Implement proper error handling and logging

### Versioning

- Follow semantic versioning for workflow versions
- Provide migration instructions for breaking changes
- Test version compatibility thoroughly
- Use feature flags for gradual rollouts

### Testing

- Write comprehensive test scenarios for all code paths
- Use mock providers for isolated testing
- Implement automated testing in CI/CD pipelines
- Test error conditions and edge cases

### Performance

- Monitor execution metrics and optimize bottlenecks
- Use appropriate concurrency levels for bulk operations
- Implement caching for frequently accessed data
- Scale providers based on load patterns

## Architecture Considerations

### Scalability

- Use horizontal scaling for workflow providers
- Implement proper load balancing
- Use distributed caching for shared state
- Monitor resource usage and scale accordingly

### Reliability

- Implement proper error handling and retry mechanisms
- Use circuit breakers for external dependencies
- Implement backup and recovery procedures
- Monitor system health continuously

### Security

- Implement proper authentication and authorization
- Use secure communication channels
- Audit workflow executions and access
- Implement proper secrets management

### Maintainability

- Use modular design with clear interfaces
- Implement comprehensive logging and monitoring
- Use version control for workflow definitions
- Document workflows and their dependencies
