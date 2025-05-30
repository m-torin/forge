import { createResponse, extractPayload, validatePayload, workflowError } from '../../runtime';
import { withDeduplication } from '../../runtime/deduplication';
import { formatPercentage, isDevelopment } from '../../utils/helpers';
import { devLog } from '../../utils/observability';

import type { EnhancedContext } from '../../runtime';
import type { WorkflowContext } from '../../utils/types';

/**
 * Enhanced Basic Workflow Example
 * Demonstrates core Upstash Workflow patterns with enhanced utilities:
 * - Sequential steps and parallel processing
 * - Priority-based task sorting with batch processing
 * - Enhanced context with utilities and deduplication
 * - Simple approval workflows with waitForEvent
 * - Parallel validation checks (inventory, fraud detection)
 * - Automatic retries and comprehensive error handling
 *
 * Perfect for: Task queues, background jobs, batch processing, simple order workflows
 */

export interface BasicWorkflowPayload {
  // Enhanced features
  name?: string;
  orderId?: string; // For deduplication compatibility
  requiresApproval?: boolean;
  requiresValidation?: boolean;
  taskId?: string;
  tasks: { id: string; priority: number; data: any }[];

  // Explicit deduplication support
  dedupId?: string;
}

// Main Basic workflow logic
export async function basicWorkflow(context: EnhancedContext<BasicWorkflowPayload>) {
  // Development logging
  devLog.workflow(context, 'Starting basic workflow', {
    payload: context.requestPayload,
    workflowRunId: context.workflowRunId,
  });

  // Extract payload with enhanced defaults
  const payload = extractPayload(context, {
    requiresValidation: false,
    name: 'Enhanced Basic Task Processing',
    requiresApproval: false,
    taskId: `task-${Date.now()}`,
    tasks: [],
  });

  const {
    requiresValidation: _requiresValidation,
    name,
    requiresApproval: _requiresApproval,
    taskId: _taskId,
    tasks,
  } = payload;

  // Handle deduplication with flexible ID extraction
  const result = await withDeduplication(
    context,
    async () => {
      // Validate payload
      const validation = validatePayload(payload, ['tasks']);
      if (!validation.valid) {
        return workflowError.validation(validation.errors.join(', '));
      }

      if (!Array.isArray(tasks) || tasks.length === 0) {
        return workflowError.validation('Tasks must be a non-empty array');
      }

      devLog.workflow(context, `Starting enhanced basic workflow: ${name}`);
      devLog.workflow(context, `Processing ${tasks.length} tasks with enhanced features`);

      return processEnhancedBasicWorkflow(context, payload);
    },
    {
      debug: context.dev?.isDevelopment,
      // Uses dedupId by default, with fallback to taskId for compatibility
    },
  );

  return result;
}

// Enhanced processing function combining all features
async function processEnhancedBasicWorkflow(
  context: WorkflowContext<any>,
  payload: BasicWorkflowPayload,
) {
  const { requiresValidation, name, requiresApproval, taskId, tasks } = payload;

  // Step 1: Task validation (if enabled)
  let taskValidationResult = null;
  if (requiresValidation) {
    taskValidationResult = await context.run('validate-task-requirements', async () => {
      devLog.workflow(context, `Validating requirements for task ${taskId}`);

      // Simulate parallel validation checks (like inventory, fraud detection)
      const [resourceCheck, qualityCheck, securityCheck] = await Promise.all([
        // Resource availability check
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                available: true,
                resources: ['cpu', 'memory', 'storage'],
                status: 'checked',
              }),
            500,
          ),
        ),

        // Quality assurance check
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                criteria: ['format', 'completeness', 'accuracy'],
                passed: true,
                score: 95,
              }),
            700,
          ),
        ),

        // Security validation
        new Promise((resolve) =>
          setTimeout(() => {
            // Check for QStash signature header
            const hasSignature = context.headers?.['upstash-signature'] !== undefined;

            // Always pass in development mode
            const secure = context.dev?.isDevelopment || hasSignature;

            devLog.workflow(context, 'Security check', {
              hasSignature,
              headers: Object.keys(context.headers || {}),
              isDevelopment: context.dev?.isDevelopment,
              secure,
            });

            resolve({
              checks: ['auth', 'permissions', 'integrity'],
              riskLevel: secure ? 'low' : 'high',
              secure,
            });
          }, 300),
        ),
      ]);

      if (!(resourceCheck as any).available) {
        throw new Error('Required resources not available');
      }

      if (!(qualityCheck as any).passed) {
        throw new Error('Quality check failed');
      }

      if (!(securityCheck as any).secure) {
        throw new Error('Security validation failed');
      }

      return {
        validatedAt: new Date().toISOString(),
        validationPassed: true,
        qualityCheck,
        resourceCheck,
        securityCheck,
      };
    });
  }

  // Step 2: Initialize and sort tasks by priority
  const sortedTasks = await context.run('initialize-enhanced', async () => {
    const sorted = [...tasks].sort((a, b) => b.priority - a.priority);
    devLog.workflow(
      context,
      `Sorted ${sorted.length} tasks by priority (highest: ${sorted[0]?.priority}, lowest: ${sorted[sorted.length - 1]?.priority})`,
    );

    // Add enhanced task metadata
    const enhancedTasks = sorted.map((task, index) => ({
      ...task,
      assignedAt: new Date().toISOString(),
      enhancedId: `${taskId}-${task.id}`,
      metadata: {
        validationRequired: requiresValidation,
        approvalRequired: requiresApproval,
        index,
      },
    }));

    return enhancedTasks;
  });

  // Step 3: Handle approval if required
  let approvalResult = null;
  if (requiresApproval) {
    devLog.workflow(context, `Task ${taskId} requires approval before processing`);

    if (isDevelopment() && process.env.SKIP_AUTO_APPROVAL === 'true') {
      approvalResult = { approved: true, approver: 'auto', notes: 'Development auto-approval' };
      devLog.workflow(context, 'Skipping approval wait in development');
    } else {
      try {
        const eventId = `approve-${taskId}`;
        const { eventData, timeout } = await context.waitForEvent('task-approval', eventId, {
          timeout: '5m',
        });

        if (timeout) {
          return workflowError.generic(
            new Error('Approval timeout - task not approved within 5 minutes'),
          );
        }

        approvalResult = eventData;
      } catch (error) {
        return workflowError.generic(error);
      }
    }

    if (!(approvalResult as any)?.approved) {
      return workflowError.generic(
        new Error(`Task rejected: ${(approvalResult as any)?.notes || 'No reason provided'}`),
      );
    }

    devLog.workflow(context, `Task ${taskId} approved by ${(approvalResult as any).approver}`);
  }

  // Step 4: Process all tasks in parallel with enhanced features
  const results = await Promise.all(
    sortedTasks.map((task: any, index: number) => {
      const stepName = `enhanced-process-task-${index + 1}`;
      return context.run(stepName, async () => {
        devLog.workflow(
          context,
          `Processing enhanced task ${task.id} (priority: ${task.priority})`,
        );

        // Enhanced processing with multiple stages
        const processingStages = {
          validation: null as any,
          execution: null as any,
          preparation: null as any,
        };

        // Stage 1: Preparation
        processingStages.preparation = await new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                prepared: true,
                preparedAt: new Date().toISOString(),
                resources: ['allocated', 'initialized'],
              }),
            200, // Fixed delay instead of random
          );
        });

        // Stage 2: Execution with enhanced error handling
        try {
          processingStages.execution = await new Promise((resolve, reject) => {
            const processingTime = 750; // Fixed processing time

            setTimeout(() => {
              // Enhanced success/failure logic with retries
              if (false) {
                // Disable random failures
                reject(new Error(`Enhanced task ${task.id} encountered processing error`));
              } else {
                resolve({
                  enhanced: true,
                  executedAt: new Date().toISOString(),
                  processingTime,
                  result: `Enhanced processing of ${JSON.stringify(task.data)}`,
                });
              }
            }, processingTime);
          });
        } catch (error) {
          // Enhanced retry logic
          devLog.workflow(context, `Task ${task.id} failed, implementing enhanced retry...`);
          processingStages.execution = {
            enhanced: true,
            executedAt: new Date().toISOString(),
            originalError: (error as Error).message,
            processingTime: 100,
            recovered: true,
            result: `Fallback processing of ${JSON.stringify(task.data)}`,
          };
        }

        // Stage 3: Post-execution validation
        processingStages.validation = await new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                validated: true,
                validatedAt: new Date().toISOString(),
                checksPassed: ['integrity', 'format', 'completeness'],
              }),
            100, // Fixed delay
          );
        });

        return {
          enhanced: true,
          enhancedId: task.enhancedId,
          metadata: task.metadata,
          priority: task.priority,
          processedAt: new Date().toISOString(),
          processingTime: processingStages.execution.processingTime,
          result: processingStages.execution.result,
          stages: processingStages,
          taskId: task.id,
        };
      });
    }),
  );

  // Step 5: Generate enhanced summary
  const enhancedSummary = await context.run('generate-enhanced-summary', async () => {
    const totalProcessingTime = results.reduce((sum: number, r: any) => sum + r.processingTime, 0);
    const successfulTasks = results.filter((r) => !r.stages?.execution?.recovered).length;
    const recoveredTasks = results.filter((r) => r.stages?.execution?.recovered).length;

    return {
      validation: taskValidationResult,
      name,
      approval: approvalResult,
      averageProcessingTime: totalProcessingTime / results.length,
      completedAt: new Date().toISOString(),
      enhancedFeatures: {
        validationEnabled: requiresValidation,
        approvalEnabled: requiresApproval,
        deduplicationEnabled: true,
        enhancedErrorHandling: true,
      },
      processedTasks: results.length,
      processingTime: totalProcessingTime,
      recoveredTasks,
      results,
      successfulTasks,
      successRate: formatPercentage(((successfulTasks + recoveredTasks) / tasks.length) * 100),
      taskId,
      totalTasks: tasks.length,
      workflowRunId: context.workflowRunId,
    };
  });

  return createResponse('success', enhancedSummary, {
    completedAt: new Date().toISOString(),
    enhanced: true,
    workflowRunId: context.workflowRunId,
  });
}
