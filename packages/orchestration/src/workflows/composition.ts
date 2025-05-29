import { createWorkflow } from '../client/workflow-builder';

import { approvalGate, parallelExecute, processBatch } from './patterns';

import type { WorkflowContext } from '../types';

/**
 * Workflow composition utilities for building complex workflows
 * from reusable components
 */

/**
 * Compose multiple workflow steps into a single workflow
 */
export function composeWorkflow<T = unknown>(
  steps: {
    name: string;
    handler: (context: WorkflowContext<T>, data: any) => Promise<any>;
    condition?: (data: any) => boolean;
    errorHandler?: (error: Error, context: WorkflowContext<T>) => Promise<any>;
  }[],
) {
  return async (context: WorkflowContext<T>) => {
    let currentData = context.requestPayload;
    const results: Record<string, any> = {};

    for (const step of steps) {
      // Check condition if provided
      if (step.condition && !step.condition(currentData)) {
        continue;
      }

      try {
        const result = await context.run(step.name, async () => step.handler(context, currentData));

        results[step.name] = result;
        currentData = result; // Pass result to next step
      } catch (error) {
        if (step.errorHandler) {
          const errorResult = await context.run(`${step.name}-error`, async () =>
            step.errorHandler!(error as Error, context),
          );
          results[`${step.name}-error`] = errorResult;
          currentData = errorResult;
        } else {
          throw error;
        }
      }
    }

    return {
      finalResult: currentData,
      stepResults: results,
    };
  };
}

/**
 * Create a data processing workflow with common patterns
 */
export function createDataProcessingWorkflow<T, R>(config: {
  extract: (context: WorkflowContext<T>) => Promise<any[]>;
  transform?: {
    name: string;
    operation: (data: any[]) => Promise<any[]>;
    parallel?: boolean;
  }[];
  load: (context: WorkflowContext<T>, data: any[]) => Promise<R>;
  validate?: (data: any[]) => Promise<{ valid: boolean; errors?: string[] }>;
  requiresApproval?: (data: any[]) => boolean;
  batchSize?: number;
}) {
  return createWorkflow<T>()
    .withRetries(3)
    .build(async (context) => {
      // Extract phase
      const extractedData = await context.run('extract', () => config.extract(context));

      let transformedData = extractedData;

      // Transform phase
      if (config.transform && config.transform.length > 0) {
        // Separate parallel and sequential transforms
        const parallelTransforms = config.transform.filter((t) => t.parallel);
        const sequentialTransforms = config.transform.filter((t) => !t.parallel);

        // Execute parallel transforms
        if (parallelTransforms.length > 0) {
          const parallelOps = Object.fromEntries(
            parallelTransforms.map((t) => [t.name, () => t.operation(transformedData)]),
          );

          const parallelResults = await parallelExecute(context, parallelOps, {
            stepPrefix: 'transform-parallel',
          });

          // Merge parallel results (assuming last one wins for now)
          transformedData = Object.values(parallelResults).pop() as any[];
        }

        // Execute sequential transforms
        for (const transform of sequentialTransforms) {
          transformedData = await context.run(`transform-${transform.name}`, () =>
            transform.operation(transformedData),
          );
        }
      }

      // Validation phase
      if (config.validate) {
        const validation = await context.run('validate', () => config.validate!(transformedData));

        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
        }
      }

      // Approval phase
      if (config.requiresApproval && config.requiresApproval(transformedData)) {
        await approvalGate(context, {
          approvalId: `data-approval-${context.workflowRunId}`,
          notificationData: {
            preview: transformedData.slice(0, 5),
            recordCount: transformedData.length,
          },
          timeout: '30m',
        });
      }

      // Load phase with batching
      if (config.batchSize && config.batchSize > 0) {
        const results = await processBatch(context, {
          batchSize: config.batchSize,
          items: transformedData,
          processor: async (batch) => config.load(context, [batch]),
          stepPrefix: 'load',
        });
        return results;
      } else {
        return await context.run('load', () => config.load(context, transformedData));
      }
    });
}

/**
 * Create an event-driven workflow with state management
 */
export function createEventDrivenWorkflow<TState = any>(config: {
  initialState: TState;
  events: Record<
    string,
    {
      handler: (context: WorkflowContext<any>, state: TState, eventData: any) => Promise<TState>;
      timeout?: string;
      nextEvent?: string;
    }
  >;
  finalizer?: (context: WorkflowContext<any>, state: TState) => Promise<any>;
}) {
  return createWorkflow()
    .withRetries(1) // Event-driven workflows typically shouldn't retry
    .build(async (context) => {
      let state = config.initialState;
      let currentEvent =
        (context.requestPayload as any).startEvent || Object.keys(config.events)[0];

      while (currentEvent && config.events[currentEvent]) {
        const eventConfig = config.events[currentEvent];

        // Wait for event
        const { eventData, timeout } = await context.waitForEvent(
          `wait-${currentEvent}`,
          currentEvent,
          { timeout: (eventConfig.timeout || '1h') as any },
        );

        if (timeout) {
          // Handle timeout
          await context.run(`${currentEvent}-timeout`, async () => {
            console.log(`Event ${currentEvent} timed out`);
          });
          break;
        }

        // Process event
        state = await context.run(`process-${currentEvent}`, () =>
          eventConfig.handler(context, state, eventData),
        );

        // Move to next event
        currentEvent = eventConfig.nextEvent || '';
      }

      // Run finalizer if provided
      if (config.finalizer) {
        return await context.run('finalize', () => config.finalizer!(context, state));
      }

      return state;
    });
}

/**
 * Create a saga pattern workflow for distributed transactions
 */
export function createSagaWorkflow<T>(config: {
  steps: {
    name: string;
    execute: (context: WorkflowContext<T>, data: any) => Promise<any>;
    compensate: (context: WorkflowContext<T>, data: any, error: Error) => Promise<void>;
  }[];
}) {
  return createWorkflow<T>().build(async (context) => {
    const completedSteps: { step: (typeof config.steps)[0]; result: any }[] = [];
    let lastResult = context.requestPayload;

    try {
      // Execute all steps
      for (const step of config.steps) {
        const result = await context.run(`${step.name}-execute`, () =>
          step.execute(context, lastResult),
        );

        completedSteps.push({ result, step });
        lastResult = result;
      }

      return {
        completedSteps: completedSteps.map((s) => s.step.name),
        result: lastResult,
        success: true,
      };
    } catch (error) {
      // Compensate in reverse order
      const stepsToCompensate = [...completedSteps].reverse();

      for (const { result, step } of stepsToCompensate) {
        try {
          await context.run(`${step.name}-compensate`, () =>
            step.compensate(context, result, error as Error),
          );
        } catch (compensateError) {
          console.error(`Failed to compensate ${step.name}:`, compensateError);
          // Continue compensating other steps
        }
      }

      throw error;
    }
  });
}

/**
 * Create a workflow with built-in monitoring and metrics
 */
export function createMonitoredWorkflow<T, R>(config: {
  name: string;
  handler: (context: WorkflowContext<T>) => Promise<R>;
  metrics?: {
    onStart?: (context: WorkflowContext<T>) => Promise<void>;
    onComplete?: (context: WorkflowContext<T>, result: R, duration: number) => Promise<void>;
    onError?: (context: WorkflowContext<T>, error: Error, duration: number) => Promise<void>;
  };
}) {
  return createWorkflow<T>().build(async (context) => {
    const startTime = Date.now();

    try {
      // Record start metric
      if (config.metrics?.onStart) {
        await context.run('metrics-start', () => config.metrics!.onStart!(context));
      }

      // Execute main handler
      const result = await config.handler(context);

      // Record completion metric
      const duration = Date.now() - startTime;
      if (config.metrics?.onComplete) {
        await context.run('metrics-complete', () =>
          config.metrics!.onComplete!(context, result, duration),
        );
      }

      return {
        metrics: {
          duration,
          status: 'completed',
          workflowName: config.name,
        },
        result,
      };
    } catch (error) {
      // Record error metric
      const duration = Date.now() - startTime;
      if (config.metrics?.onError) {
        await context.run('metrics-error', () =>
          config.metrics!.onError!(context, error as Error, duration),
        );
      }

      throw error;
    }
  });
}

/**
 * Workflow branching utility
 */
export async function branch<T>(
  context: WorkflowContext<any>,
  config: {
    condition: (data: T) => string;
    branches: Record<string, (context: WorkflowContext<any>, data: T) => Promise<any>>;
    default?: (context: WorkflowContext<any>, data: T) => Promise<any>;
    data: T;
  },
) {
  const branchKey = config.condition(config.data);
  const handler = config.branches[branchKey] || config.default;

  if (!handler) {
    throw new Error(`No handler found for branch: ${branchKey}`);
  }

  return await context.run(`branch-${branchKey}`, () => handler(context, config.data));
}

/**
 * Create a workflow chain that passes results between workflows
 */
export function createWorkflowChain<T>(
  workflows: {
    name: string;
    workflow: (context: WorkflowContext<any>) => Promise<any>;
    transform?: (result: any) => any;
  }[],
) {
  return createWorkflow<T>().build(async (context) => {
    let currentData: any = context.requestPayload;
    const results: Record<string, any> = {};

    for (const { name, transform, workflow } of workflows) {
      // Execute workflow with transformed data
      const result = await context.run(`chain-${name}`, async () => {
        // In a real implementation, you would use context.invoke
        // For now, we'll just return a placeholder
        console.log(`Would invoke ${name} workflow with data:`, currentData);
        return { data: currentData, success: true };
      });

      results[name] = result;

      // Transform result for next workflow
      currentData = transform ? transform(result) : result;
    }

    return {
      chainResults: results,
      finalResult: currentData,
    };
  });
}
