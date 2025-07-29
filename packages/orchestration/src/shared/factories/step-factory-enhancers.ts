/**
 * Optional Enhancers for Workflow Steps
 *
 * Provides optional enhancer functions that can be composed with simple steps
 * to add advanced functionality like retry, circuit breaking, monitoring, etc.
 */

import { createServerObservability, logInfo } from '@repo/observability/server/next';
import { initializePerformanceData, updatePerformanceData } from './step-factory/step-performance';
import { SimpleWorkflowStep, StepExecutionResult } from './step-factory/step-types';

/**
 * Compose multiple enhancers together
 */
export function compose<TInput = unknown, TOutput = unknown>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  ...enhancers: ((
    step: SimpleWorkflowStep<TInput, TOutput>,
  ) => SimpleWorkflowStep<TInput, TOutput>)[]
): SimpleWorkflowStep<TInput, TOutput> {
  return enhancers.reduce((currentStep, enhancer: any) => enhancer(currentStep), step);
}

/**
 * Add circuit breaker protection to a workflow step
 */
export function withStepCircuitBreaker<TInput = unknown, TOutput = unknown>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  options: {
    failureThreshold?: number;
    monitoringPeriod?: number;
    resetTimeout?: number;
  } = {},
): SimpleWorkflowStep<TInput, TOutput> {
  const { failureThreshold = 5, resetTimeout = 60000 } = options;

  let failures = 0;
  let lastFailureTime = 0;
  let state: 'closed' | 'half-open' | 'open' = 'closed';

  return {
    execute: async (input: TInput) => {
      const now = Date.now();

      // Check if circuit should reset
      if (state === 'open' && now - lastFailureTime > resetTimeout) {
        state = 'half-open';
        failures = 0;
      }

      // Circuit is open - fail fast
      if (state === 'open') {
        return {
          error: {
            code: 'CIRCUIT_BREAKER_OPEN',
            message: 'Circuit breaker is open',
            retryable: false,
            stepId: 'circuit-breaker',
            timestamp: new Date(),
          },
          performance: { duration: 0, startTime: now },
          success: false,
        };
      }

      const result = await step.execute(input);

      if (result.success) {
        // Success - reset circuit
        failures = 0;
        state = 'closed';
      } else {
        // Failure - increment counter
        failures++;
        lastFailureTime = now;

        if (failures >= failureThreshold) {
          state = 'open';
        }
      }

      return result;
    },
    validate: step.validate,
  };
}

/**
 * Add monitoring capabilities to a workflow step
 */
export function withStepMonitoring<TInput = unknown, TOutput = unknown>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  options: {
    enableDetailedLogging?: boolean;
    enableProgressReporting?: boolean;
    trackCustomMetrics?: boolean;
    onStepComplete?: (stepName: string, duration: number, success: boolean) => void;
  } = {},
): SimpleWorkflowStep<TInput, TOutput> {
  return {
    execute: async (input: TInput) => {
      // const startTime = Date.now();
      const performance = initializePerformanceData(true);

      if (options.enableDetailedLogging) {
        // Fire and forget logging
        (async () => {
          try {
            const _logger = await createServerObservability();
            logInfo('Step execution started', {
              timestamp: new Date().toISOString(),
              component: 'MONITOR',
            });
          } catch {
            // Fallback to console if logger fails
          }
        })();
      }

      const result = await step.execute(input);

      // Update performance with monitoring data
      updatePerformanceData(performance, true);
      result.performance = performance;

      if (options.enableDetailedLogging) {
        // Fire and forget logging
        (async () => {
          try {
            const _logger = await createServerObservability();
            logInfo('Step execution completed', {
              duration: performance.duration,
              component: 'MONITOR',
            });
          } catch {
            // Fallback to console if logger fails
          }
        })();
      }

      // Call the onStepComplete callback if provided
      if (options.onStepComplete) {
        options.onStepComplete('step', performance.duration || 0, result.success);
      }

      return result;
    },
    validate: step.validate,
  };
}

/**
 * Add retry capabilities to a workflow step
 */
export function withStepRetry<TInput = unknown, TOutput = unknown>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  options: {
    backoff?: 'exponential' | 'fixed' | 'linear';
    delay?: number;
    jitter?: boolean;
    maxAttempts?: number;
  } = {},
): SimpleWorkflowStep<TInput, TOutput> {
  const { backoff = 'exponential', delay = 1000, jitter = false, maxAttempts = 3 } = options;

  return {
    execute: async (input: TInput) => {
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = await step.execute(input);

        if (result.success) {
          return result;
        }

        lastError = result.error;

        // Don't retry on last attempt
        if (attempt === maxAttempts) {
          break;
        }

        // Calculate delay
        let waitTime = delay;
        if (backoff === 'exponential') {
          waitTime = delay * Math.pow(2, attempt - 1);
        } else if (backoff === 'linear') {
          waitTime = delay * attempt;
        }

        if (jitter) {
          waitTime += Math.random() * 1000;
        }

        await new Promise((resolve: any) => setTimeout(resolve, waitTime));
      }

      return {
        error:
          lastError instanceof Error
            ? { message: lastError.message }
            : { message: String(lastError) },
        performance: { duration: 0, startTime: Date.now() },
        shouldRetry: false,
        success: false,
      };
    },
    validate: step.validate,
  };
}

/**
 * Add timeout protection to a workflow step
 */
export function withStepTimeout<TInput = unknown, TOutput = unknown>(
  step: SimpleWorkflowStep<TInput, TOutput>,
  timeoutMs: number,
): SimpleWorkflowStep<TInput, TOutput> {
  return {
    execute: async (input: TInput) => {
      const timeoutPromise = new Promise<StepExecutionResult<TOutput>>((_resolve, reject) => {
        setTimeout(() => {
          reject(new Error(`Step execution timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      try {
        return await Promise.race([step.execute(input), timeoutPromise]);
      } catch (error) {
        return {
          error: {
            code: 'STEP_TIMEOUT_ERROR',
            message:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Timeout error',
            retryable: true,
            stepId: 'timeout',
            timestamp: new Date(),
          },
          performance: { duration: timeoutMs, startTime: Date.now() },
          success: false,
        };
      }
    },
    validate: step.validate,
  };
}
