/**
 * Client-side orchestration exports (non-Next.js)
 * Lightweight utilities and types for client-side workflow interaction
 *
 * This file provides client-side orchestration functionality for non-Next.js applications.
 * Use this in browser environments, client-side applications, and standalone JavaScript.
 *
 * For Next.js applications, use '@repo/orchestration/client/next' instead.
 */

import { RetryStrategies, withRetry } from './shared/patterns/retry';
// Core types (re-export for client usage)
// Import types for internal use
import {
  ListExecutionsOptions,
  WorkflowData,
  WorkflowDefinition,
  WorkflowExecution,
} from './shared/types/index';
// Import for internal use
import { validateWorkflowDefinition } from './shared/utils/index';
// Import consolidated timeout utilities
import { createTimeoutSignal } from '@repo/core-utils/shared/timeout';

// Client-side patterns (safe for browser usage)
export {
  retryFast,
  retryNetwork,
  retryStandard,
  RetryStrategies,
  withRetry,
} from './shared/patterns/retry';

export type { RetryOptions } from './shared/patterns/retry';

export type {
  ListExecutionsOptions,
  RetryConfig,
  ScheduleConfig,
  WorkflowDefinition,
  WorkflowError,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowStep,
  WorkflowStepExecution,
} from './shared/types/index';

// Client-specific utilities
export {
  OrchestrationError,
  sanitizeConfig,
  validateWorkflowDefinition,
  WorkflowExecutionError,
  WorkflowValidationError,
} from './shared/utils/index';

export type { ValidationError } from './shared/utils/index';

/**
 * Client configuration
 */
export interface WorkflowClientConfig {
  /** API key for authentication */
  apiKey?: string;
  /** Base URL for the workflow API */
  baseUrl: string;
  /** Whether to enable automatic retries */
  enableRetries?: boolean;
  /** Custom headers for requests */
  headers?: Record<string, string>;
  /** Default timeout for requests */
  timeout?: number;
}

/**
 * Simple workflow client for browser/client-side usage
 */
export class WorkflowClient {
  private config: Required<WorkflowClientConfig>;

  constructor(config: WorkflowClientConfig) {
    if (!config.baseUrl) {
      throw new Error('baseUrl is required');
    }

    if (config.apiKey !== undefined && !config.apiKey) {
      throw new Error('apiKey cannot be empty string');
    }

    this.config = {
      apiKey: undefined,
      enableRetries: true,
      headers: {},
      timeout: 30000,
      ...config,
    } as Required<WorkflowClientConfig>;
  }

  /**
   * Cancel a workflow execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    const requestFn = async () => {
      const response = await fetch(
        `${this.config.baseUrl}/api/workflows/executions/${executionId}/cancel`,
        {
          headers: {
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
            ...this.config.headers,
          },
          method: 'POST',
          signal: createTimeoutSignal(this.config.timeout),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      try {
        const result = await response.json();
        return result.cancelled || false;
      } catch (_error) {
        // If JSON parsing fails, assume operation was successful
        return true;
      }
    };

    if (this.config.enableRetries) {
      const result = await withRetry(requestFn, RetryStrategies.network);
      if (result.success) {
        return result?.data;
      } else {
        throw result.error;
      }
    } else {
      return requestFn();
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<null | WorkflowExecution> {
    const requestFn = async () => {
      const response = await fetch(
        `${this.config.baseUrl}/api/workflows/executions/${executionId}`,
        {
          headers: {
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
            ...this.config.headers,
          },
          method: 'GET',
          signal: createTimeoutSignal(this.config.timeout),
        },
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      try {
        return await response.json();
      } catch (_error) {
        throw new Error('Failed to parse response as JSON');
      }
    };

    if (this.config.enableRetries) {
      const result = await withRetry(requestFn, RetryStrategies.network);
      if (result.success) {
        return result?.data;
      } else {
        throw result.error;
      }
    } else {
      return requestFn();
    }
  }

  /**
   * List executions for a workflow
   */
  async listExecutions(
    workflowId: string,
    options?: ListExecutionsOptions,
  ): Promise<WorkflowExecution[]> {
    const searchParams = new URLSearchParams();
    if (options?.limit) searchParams.set('limit', options.limit.toString());
    if (options?.cursor) searchParams.set('cursor', options.cursor);
    if (options?.status) {
      searchParams.set('status', options.status.join(','));
    }

    const requestFn = async () => {
      const url = `${this.config.baseUrl}/api/workflows/${workflowId}/executions?${searchParams}`;
      const response = await fetch(url, {
        headers: {
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          ...this.config.headers,
        },
        method: 'GET',
        signal: createTimeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      try {
        return await response.json();
      } catch (_error) {
        throw new Error('Failed to parse response as JSON');
      }
    };

    if (this.config.enableRetries) {
      const result = await withRetry(requestFn, RetryStrategies.network);
      if (result.success) {
        return result?.data;
      } else {
        throw result.error;
      }
    } else {
      return requestFn();
    }
  }

  /**
   * Submit a workflow for execution
   */
  async submitWorkflow(
    definition: WorkflowDefinition,
    input?: WorkflowData,
  ): Promise<{ executionId: string; status: string }> {
    // Validate the workflow definition
    const validatedDefinition = validateWorkflowDefinition(definition);

    const requestFn = async () => {
      const response = await fetch(`${this.config.baseUrl}/api/workflows/execute`, {
        body: JSON.stringify({
          definition: validatedDefinition,
          input,
        }),
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          ...this.config.headers,
        },
        method: 'POST',
        signal: createTimeoutSignal(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      try {
        return await response.json();
      } catch (_error) {
        throw new Error('Failed to parse response as JSON');
      }
    };

    if (this.config.enableRetries) {
      const result = await withRetry(requestFn, RetryStrategies.network);
      if (result.success) {
        return result?.data;
      } else {
        throw result.error;
      }
    } else {
      return requestFn();
    }
  }
}

/**
 * Create a workflow client
 */
export function createWorkflowClient(config: WorkflowClientConfig): WorkflowClient {
  return new WorkflowClient(config);
}

/**
 * Default workflow client (requires configuration)
 */
export const workflowClient = {
  create: createWorkflowClient,
};
