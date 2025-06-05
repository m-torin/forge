import { Client, Receiver } from '@upstash/qstash';
import { serve } from '@upstash/workflow/nextjs';

import { WorkflowError, WorkflowErrorType } from '../../utils/error-handling';
import { createErrorMessage, isDevelopment } from '../../utils/helpers';
import { devLog } from '../../utils/observability';

import type { WorkflowConfig, WorkflowContext } from '../../utils/types';

/**
 * Enhanced workflow builder with all configuration options
 * Based on Upstash Workflow documentation
 */
export class WorkflowBuilder<TPayload = unknown> {
  private config: WorkflowConfig;

  constructor(config: Partial<WorkflowConfig> = {}) {
    this.config = {
      retries: 3,
      verbose: isDevelopment(),
      ...config,
    };
  }

  /**
   * Set failure URL for webhook callbacks on failure
   */
  withFailureUrl(url: string): this {
    this.config.failureUrl = url;
    return this;
  }

  /**
   * Set failure function for custom error handling
   */
  withFailureFunction(fn: WorkflowConfig['failureFunction']): this {
    this.config.failureFunction = fn;
    return this;
  }

  /**
   * Configure retry attempts
   */
  withRetries(retries: number): this {
    this.config.retries = retries;
    return this;
  }

  /**
   * Enable verbose logging
   */
  withVerboseLogging(verbose = true): this {
    this.config.verbose = verbose;
    return this;
  }

  /**
   * Configure flow control (rate limiting and parallelism)
   */
  withFlowControl(options: {
    key: string;
    rate?: number;
    period?: string;
    parallelism?: number;
  }): this {
    this.config.flowControl = options;
    return this;
  }

  /**
   * Set custom payload parser
   */
  withPayloadParser<T>(parser: (payload: unknown) => T): WorkflowBuilder<T> {
    // Type assertion for the complex type constraint
    this.config.initialPayloadParser = parser as WorkflowConfig['initialPayloadParser'];
    return this as unknown as WorkflowBuilder<T>;
  }

  /**
   * Override workflow URL (useful for local development)
   */
  withUrl(url: string): this {
    this.config.url = url;
    return this;
  }

  /**
   * Set base URL (alternative to full URL override)
   */
  withBaseUrl(baseUrl: string): this {
    this.config.baseUrl = baseUrl;
    return this;
  }

  /**
   * Use custom QStash client
   */
  withQStashClient(client: Client): this {
    this.config.qstashClient = client;
    return this;
  }

  /**
   * Configure receiver for signature verification
   */
  withReceiver(receiver: Receiver | undefined): this {
    this.config.receiver = receiver;
    return this;
  }

  /**
   * Set environment variables
   */
  withEnv(env: Record<string, string | undefined>): this {
    this.config.env = env;
    return this;
  }

  /**
   * Disable telemetry
   */
  withoutTelemetry(): this {
    this.config.disableTelemetry = true;
    return this;
  }

  /**
   * Build the workflow with the configured options
   */
  build(handler: (context: WorkflowContext<TPayload>) => Promise<unknown>) {
    // Wrap the handler with error handling
    const wrappedHandler = async (context: WorkflowContext<TPayload>) => {
      try {
        return await handler(context);
      } catch (error) {
        // If it's already a WorkflowError, rethrow it
        if (error instanceof WorkflowError) {
          throw error;
        }

        // Otherwise, wrap it in a WorkflowError
        throw new WorkflowError(
          WorkflowErrorType.INTERNAL,
          createErrorMessage('Workflow execution failed', error),
          { originalError: String(error) },
        );
      }
    };

    // Fix FlowControl type constraint by ensuring rate is defined
    const serveOptions = {
      ...this.config,
      flowControl:
        this.config.flowControl && this.config.flowControl.rate !== undefined
          ? {
              key: this.config.flowControl.key,
              parallelism: this.config.flowControl.parallelism,
              period: this.config.flowControl.period,
              rate: this.config.flowControl.rate,
            }
          : undefined,
      verbose: this.config.verbose ? true : undefined,
    };

    return serve<TPayload>(wrappedHandler, serveOptions);
  }
}

/**
 * Factory function to create a workflow builder
 */
export function createWorkflow<TPayload = unknown>(
  config?: Partial<WorkflowConfig>,
): WorkflowBuilder<TPayload> {
  return new WorkflowBuilder<TPayload>(config);
}

/**
 * Pre-configured workflow builders for common scenarios
 */
export const workflows = {
  /**
   * Create a workflow with production-ready defaults
   */
  production<T = unknown>() {
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
    
    if (!currentSigningKey || !nextSigningKey) {
      throw new Error('Missing QSTASH signing keys for production workflow');
    }
    
    return createWorkflow<T>()
      .withRetries(3)
      .withVerboseLogging(false)
      .withReceiver(
        new Receiver({
          currentSigningKey,
          nextSigningKey,
        }),
      );
  },

  /**
   * Create a workflow for local development
   */
  development<T = unknown>() {
    // Create local QStash client for development
    const localClient = new Client({
      baseUrl: process.env.QSTASH_URL ?? 'http://localhost:8080',
      token: process.env.QSTASH_TOKEN ?? 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
    });
    
    return createWorkflow<T>()
      .withRetries(1)
      .withVerboseLogging(true)
      .withReceiver(undefined) // Skip verification in dev
      .withQStashClient(localClient)
      .withBaseUrl(process.env.UPSTASH_WORKFLOW_URL ?? 'http://localhost:3400');
  },

  /**
   * Create a rate-limited workflow
   */
  rateLimited<T = unknown>(key: string, rate = 10) {
    return createWorkflow<T>().withFlowControl({
      key,
      period: '1m',
      rate,
    });
  },

  /**
   * Create a workflow with custom error handling
   */
  withErrorHandling<T = unknown>(onError: WorkflowConfig['failureFunction']) {
    return createWorkflow<T>().withFailureFunction(onError).withVerboseLogging(true);
  },

  /**
   * Create a workflow with parallelism control
   */
  parallel<T = unknown>(key: string, parallelism = 5) {
    return createWorkflow<T>().withFlowControl({
      key,
      parallelism,
    });
  },

  /**
   * Create a workflow with retry optimization for critical operations
   */
  critical<T = unknown>(key: string) {
    return createWorkflow<T>()
      .withRetries(5)
      .withFlowControl({
        key,
        parallelism: 3, // Limit concurrent executions
        period: '1m',
        rate: 20, // Allow higher rate for critical operations
      })
      .withFailureFunction(async (params) => {
        devLog.error(
          createErrorMessage('Critical workflow failed', {
            response: params.failResponse,
            status: params.failStatus,
            workflowRunId: params.context.workflowRunId,
          }),
        );

        // Additional failure handling could be implemented here
        // such as sending alerts or logging to monitoring systems
      });
  },

  /**
   * Create a workflow with resource cleanup
   */
  withResources<T = unknown>() {
    return createWorkflow<T>().build(async (_context) => {
      // Import dynamically to avoid circular dependencies
      const { withResources } = await import('../../utils');

      return withResources(async (_resources) => {
        // Your workflow implementation goes here
        // Use resources.add() to register cleanup functions

        // Example:
        // const redis = await createRedisClient();
        // resources.add({ cleanup: async () => await redis.disconnect() });

        // Return your workflow result
        return { success: true };
      });
    });
  },
};
