import {
  createResponse,
  withWorkflowErrorHandling,
  workflowError,
} from '../../utils/error-handling';
import { StateMachine } from '../../utils/helpers';
import { devLog } from '../../utils/observability';
import { createWorkflow } from '../core/workflow-builder';

import { approvalGate, parallelExecute, processBatchPattern } from './patterns';

import type { WorkflowContext } from '../../utils/types';

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
        devLog.workflow(context, `Skipping step ${step.name} due to condition`);
        continue;
      }

      try {
        const result = await context.run(step.name, async () =>
          withWorkflowErrorHandling(() => step.handler(context, currentData), `step:${step.name}`, {
            stepName: step.name,
            workflowRunId: context.workflowRunId,
          }),
        );

        results[step.name] = result;
        currentData = result; // Pass result to next step
        devLog.workflow(context, `Completed step ${step.name}`, { result });
      } catch (error) {
        if (step.errorHandler) {
          const errorResult = await context.run(`${step.name}-error`, async () =>
            withWorkflowErrorHandling(
              () => step.errorHandler!(error as Error, context),
              `error-handler:${step.name}`,
              { stepName: step.name, workflowRunId: context.workflowRunId },
            ),
          );
          results[`${step.name}-error`] = errorResult;
          currentData = errorResult;
          devLog.workflow(context, `Handled error for step ${step.name}`, { error: String(error) });
        } else {
          throw error;
        }
      }
    }

    return createResponse(
      'success',
      {
        finalResult: currentData,
        stepResults: results,
      },
      { workflowRunId: context.workflowRunId },
    );
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
      try {
        // Extract phase
        const extractedData = await context.run('extract', () =>
          withWorkflowErrorHandling(() => config.extract(context), 'extract-phase', {
            workflowRunId: context.workflowRunId,
          }),
        );

        devLog.workflow(context, 'Extract phase completed', {
          extractedCount: extractedData.length,
        });
        let transformedData = extractedData;

        // Transform phase
        if (config.transform && config.transform.length > 0) {
          // Separate parallel and sequential transforms
          const parallelTransforms = config.transform.filter((t) => t.parallel);
          const sequentialTransforms = config.transform.filter((t) => !t.parallel);

          // Execute parallel transforms
          if (parallelTransforms.length > 0) {
            const parallelOps = Object.fromEntries(
              parallelTransforms.map((t) => [
                t.name,
                () =>
                  withWorkflowErrorHandling(
                    () => t.operation(transformedData),
                    `transform:${t.name}`,
                    { transformName: t.name, workflowRunId: context.workflowRunId },
                  ),
              ]),
            );

            const parallelResults = await parallelExecute(context, parallelOps, {
              stepPrefix: 'transform-parallel',
            });

            // Merge parallel results (assuming last one wins for now)
            transformedData = Object.values(parallelResults).pop() as any[];
            devLog.workflow(context, 'Parallel transforms completed', {
              resultCount: transformedData.length,
            });
          }

          // Execute sequential transforms
          for (const transform of sequentialTransforms) {
            transformedData = await context.run(`transform-${transform.name}`, () =>
              withWorkflowErrorHandling(
                () => transform.operation(transformedData),
                `transform:${transform.name}`,
                { transformName: transform.name, workflowRunId: context.workflowRunId },
              ),
            );
            devLog.workflow(context, `Sequential transform ${transform.name} completed`, {
              resultCount: transformedData.length,
            });
          }
        }

        // Validation phase
        if (config.validate) {
          const validation = await context.run('validate', () =>
            withWorkflowErrorHandling(() => config.validate!(transformedData), 'validation-phase', {
              workflowRunId: context.workflowRunId,
            }),
          );

          if (!validation.valid) {
            throw workflowError.validation(
              `Validation failed: ${validation.errors?.join(', ')}`,
              'transformedData',
            );
          }
          devLog.workflow(context, 'Validation phase completed successfully');
        }

        // Approval phase
        if (config.requiresApproval && config.requiresApproval(transformedData)) {
          devLog.workflow(context, 'Approval required, waiting for approval gate');
          await approvalGate(context, {
            approvalId: `data-approval-${context.workflowRunId}`,
            notificationData: {
              preview: transformedData.slice(0, 5),
              recordCount: transformedData.length,
            },
            timeout: '30m',
          });
          devLog.workflow(context, 'Approval received, proceeding with load phase');
        }

        // Load phase with batching
        if (config.batchSize && config.batchSize > 0) {
          devLog.workflow(context, `Starting batch load with size ${config.batchSize}`);
          const results = await processBatchPattern(context, {
            batchSize: config.batchSize,
            items: transformedData,
            processor: async (batch: any) =>
              withWorkflowErrorHandling(() => config.load(context, [batch]), 'batch-load', {
                batchSize: config.batchSize,
                workflowRunId: context.workflowRunId,
              }),
            stepPrefix: 'load',
          });
          return createResponse('success', results, {
            itemsProcessed: transformedData.length,
            processingType: 'batch',
            workflowRunId: context.workflowRunId,
          });
        } else {
          devLog.workflow(context, 'Starting single load operation');
          const result = await context.run('load', () =>
            withWorkflowErrorHandling(() => config.load(context, transformedData), 'load-phase', {
              workflowRunId: context.workflowRunId,
            }),
          );
          return createResponse('success', result, {
            itemsProcessed: transformedData.length,
            processingType: 'single',
            workflowRunId: context.workflowRunId,
          });
        }
      } catch (error) {
        devLog.error('Data processing workflow failed', error);
        throw error;
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
      // Create state machine transitions
      const transitions = Object.fromEntries(
        Object.entries(config.events).map(([event, { nextEvent }]) => [
          event,
          nextEvent ? { next: nextEvent } : {},
        ]),
      );

      const stateMachine = new StateMachine(
        (context.requestPayload as any).startEvent || Object.keys(config.events)[0],
        transitions,
        config.initialState,
      );

      let currentEvent = stateMachine.getState();
      let state = stateMachine.getContext() || config.initialState;

      devLog.workflow(context, 'Starting event-driven workflow', {
        initialEvent: currentEvent,
        initialState: state,
      });

      while (currentEvent && config.events[currentEvent]) {
        const eventConfig = config.events[currentEvent];

        devLog.workflow(context, `Waiting for event: ${currentEvent}`, {
          timeout: eventConfig.timeout || '1h',
        });

        // Wait for event
        const { eventData, timeout } = await context.waitForEvent(
          `wait-${currentEvent}`,
          currentEvent,
          { timeout: (eventConfig.timeout || '1h') as any },
        );

        if (timeout) {
          // Handle timeout
          await context.run(`${currentEvent}-timeout`, async () => {
            devLog.workflow(context, `Event ${currentEvent} timed out`);
          });
          break;
        }

        // Process event
        state = await context.run(`process-${currentEvent}`, () =>
          withWorkflowErrorHandling(
            () => eventConfig.handler(context, state, eventData),
            `event:${currentEvent}`,
            {
              eventData,
              eventName: currentEvent,
              workflowRunId: context.workflowRunId,
            },
          ),
        );

        devLog.workflow(context, `Processed event: ${currentEvent}`, {
          newState: state,
          nextEvent: eventConfig.nextEvent,
        });

        // Move to next event using state machine
        if (eventConfig.nextEvent && stateMachine.canTransition('next')) {
          currentEvent = stateMachine.transition('next', state);
        } else {
          currentEvent = eventConfig.nextEvent || '';
        }
      }

      // Run finalizer if provided
      if (config.finalizer) {
        devLog.workflow(context, 'Running finalizer');
        const result = await context.run('finalize', () =>
          withWorkflowErrorHandling(() => config.finalizer!(context, state), 'finalizer', {
            finalState: state,
            workflowRunId: context.workflowRunId,
          }),
        );
        return createResponse('success', result, {
          eventsProcessed: Object.keys(config.events).length,
          finalState: state,
          workflowRunId: context.workflowRunId,
        });
      }

      return createResponse('success', state, {
        finalState: state,
        workflowRunId: context.workflowRunId,
      });
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

    devLog.workflow(context, 'Starting saga workflow', {
      stepNames: config.steps.map((s) => s.name),
      totalSteps: config.steps.length,
    });

    try {
      // Execute all steps
      for (const step of config.steps) {
        devLog.workflow(context, `Executing saga step: ${step.name}`);

        const result = await context.run(`${step.name}-execute`, () =>
          withWorkflowErrorHandling(
            () => step.execute(context, lastResult),
            `saga-execute:${step.name}`,
            { stepName: step.name, workflowRunId: context.workflowRunId },
          ),
        );

        completedSteps.push({ result, step });
        lastResult = result;

        devLog.workflow(context, `Completed saga step: ${step.name}`, {
          completedSteps: completedSteps.length,
          totalSteps: config.steps.length,
        });
      }

      return createResponse(
        'success',
        {
          completedSteps: completedSteps.map((s) => s.step.name),
          result: lastResult,
        },
        {
          sagaType: 'success',
          stepsCompleted: completedSteps.length,
          workflowRunId: context.workflowRunId,
        },
      );
    } catch (error) {
      devLog.workflow(context, 'Saga workflow failed, starting compensation', {
        error: String(error),
        stepsToCompensate: completedSteps.length,
      });

      // Compensate in reverse order
      const stepsToCompensate = [...completedSteps].reverse();

      for (const { result, step } of stepsToCompensate) {
        try {
          devLog.workflow(context, `Compensating step: ${step.name}`);

          await context.run(`${step.name}-compensate`, () =>
            withWorkflowErrorHandling(
              () => step.compensate(context, result, error as Error),
              `saga-compensate:${step.name}`,
              { stepName: step.name, workflowRunId: context.workflowRunId },
            ),
          );

          devLog.workflow(context, `Compensation completed for step: ${step.name}`);
        } catch (compensateError) {
          devLog.error(`Failed to compensate ${step.name}:`, compensateError);
          // Continue compensating other steps
        }
      }

      devLog.workflow(context, 'Saga compensation completed');
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

    devLog.workflow(context, `Starting monitored workflow: ${config.name}`);

    try {
      // Record start metric
      if (config.metrics?.onStart) {
        await context.run('metrics-start', () =>
          withWorkflowErrorHandling(
            () => config.metrics!.onStart!(context),
            `metrics-start:${config.name}`,
            { workflowName: config.name, workflowRunId: context.workflowRunId },
          ),
        );
        devLog.workflow(context, 'Start metrics recorded');
      }

      // Execute main handler
      const result = await withWorkflowErrorHandling(
        () => config.handler(context),
        `workflow:${config.name}`,
        { workflowName: config.name, workflowRunId: context.workflowRunId },
      );

      // Record completion metric
      const duration = Date.now() - startTime;
      devLog.workflow(context, `Workflow ${config.name} completed`, { duration });

      if (config.metrics?.onComplete) {
        await context.run('metrics-complete', () =>
          withWorkflowErrorHandling(
            () => config.metrics!.onComplete!(context, result, duration),
            `metrics-complete:${config.name}`,
            { duration, workflowName: config.name, workflowRunId: context.workflowRunId },
          ),
        );
        devLog.workflow(context, 'Completion metrics recorded');
      }

      return createResponse(
        'success',
        {
          metrics: {
            duration,
            status: 'completed',
            workflowName: config.name,
          },
          result,
        },
        {
          duration,
          workflowName: config.name,
          workflowRunId: context.workflowRunId,
        },
      );
    } catch (error) {
      // Record error metric
      const duration = Date.now() - startTime;
      devLog.workflow(context, `Workflow ${config.name} failed`, {
        duration,
        error: String(error),
      });

      if (config.metrics?.onError) {
        await context.run('metrics-error', () =>
          withWorkflowErrorHandling(
            () => config.metrics!.onError!(context, error as Error, duration),
            `metrics-error:${config.name}`,
            {
              duration,
              error: String(error),
              workflowName: config.name,
              workflowRunId: context.workflowRunId,
            },
          ),
        );
        devLog.workflow(context, 'Error metrics recorded');
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

  devLog.workflow(context, `Branching workflow`, {
    availableBranches: Object.keys(config.branches),
    branchKey,
    hasDefault: !!config.default,
  });

  if (!handler) {
    throw workflowError.notFound(`branch handler`, branchKey);
  }

  return await context.run('branch-handler', () =>
    withWorkflowErrorHandling(() => handler(context, config.data), `branch:${branchKey}`, {
      branchKey,
      workflowRunId: context.workflowRunId,
    }),
  );
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

    devLog.workflow(context, 'Starting workflow chain', {
      totalWorkflows: workflows.length,
      workflowNames: workflows.map((w) => w.name),
    });

    for (const { name, transform, workflow: _workflow } of workflows) {
      devLog.workflow(context, `Executing chain workflow: ${name}`, { currentData });

      // Execute workflow with transformed data
      const result = await context.run('chain-workflow', async () =>
        withWorkflowErrorHandling(
          () => {
            // In a real implementation, you would use context.invoke
            // For now, we'll just return a placeholder with proper logging
            devLog.workflow(context, `Would invoke ${name} workflow with data:`, currentData);
            return Promise.resolve({ data: currentData, success: true });
          },
          `workflow-chain:${name}`,
          { workflowName: name, workflowRunId: context.workflowRunId },
        ),
      );

      results[name] = result;

      // Transform result for next workflow
      currentData = transform ? transform(result) : result;

      devLog.workflow(context, `Completed chain workflow: ${name}`, {
        result,
        transformedData: currentData,
      });
    }

    return createResponse(
      'success',
      {
        chainResults: results,
        finalResult: currentData,
      },
      {
        chainType: 'sequential',
        workflowRunId: context.workflowRunId,
        workflowsExecuted: workflows.length,
      },
    );
  });
}
