import { type Client, Receiver } from '@upstash/qstash';
import { serve } from '@upstash/workflow/nextjs';

import type { WorkflowConfig, WorkflowContext } from '../types';

/**
 * Enhanced workflow builder with all configuration options
 * Based on Upstash Workflow documentation
 */
export class WorkflowBuilder<TPayload = unknown> {
  private config: WorkflowConfig;

  constructor(config: Partial<WorkflowConfig> = {}) {
    this.config = {
      retries: 3,
      verbose: process.env.NODE_ENV === 'development',
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
    this.config.initialPayloadParser = parser as any;
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
    return serve<TPayload>(handler, {
      ...this.config,
      verbose: this.config.verbose ? true : undefined,
    } as any);
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
    return createWorkflow<T>()
      .withRetries(3)
      .withVerboseLogging(false)
      .withReceiver(
        new Receiver({
          currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
          nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
        }),
      );
  },

  /**
   * Create a workflow for local development
   */
  development<T = unknown>() {
    return createWorkflow<T>().withRetries(1).withVerboseLogging(true).withReceiver(undefined); // Skip verification in dev
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
};
