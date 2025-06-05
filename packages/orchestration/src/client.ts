/**
 * Client-side exports for the orchestration package
 * These exports are safe for browser environments
 */

// Type-only exports for client-side usage
export type {
  // Workflow types
  WorkflowContext,
  StepResult,
  WorkflowStep,
  WorkflowDefinition,
  WorkflowExecutionOptions,
  WorkflowExecutionResult,
  WorkflowProvider,
  WorkflowBuilder,
} from './shared/types/workflow';

export type {
  // Provider types
  BaseProviderConfig,
  UpstashWorkflowConfig,
  ProviderConfig,
  ProviderSelectionCriteria,
  ProviderCapabilities,
  ProviderRegistryEntry,
  ProviderInitOptions,
} from './shared/types/provider';

export type {
  // Pattern types
  CircuitBreakerState,
  CircuitBreakerConfig,
  RetryConfig,
  RateLimitConfig,
  BatchConfig,
  ParallelConfig,
  PipelineStage,
  FanOutFanInConfig,
  SagaConfig,
  CompositionPatterns,
  DeduplicationConfig,
  EventSourcingConfig,
  WorkflowHooks,
  WorkflowMiddleware,
} from './shared/types/patterns';

export type {
  // Upstash types
  UpstashWorkflowContext,
  UpstashStepConfig,
  UpstashRuntimeInfo,
  UpstashStepResult,
  UpstashWorkflowState,
  UpstashEventType,
  UpstashEvent,
  UpstashPersistenceAdapter,
  UpstashMetrics,
  UpstashHealthCheck,
  UpstashStepBuilder,
  UpstashWorkflowBuilder,
} from './providers/upstash-workflow/types';

import type { WorkflowExecutionResult } from './shared/types/workflow';

// Error classes (client-safe)
export {
  OrchestrationError,
  ProviderError,
  ProviderNotFoundError,
  ProviderInitializationError,
  ProviderNotAvailableError,
  WorkflowError,
  WorkflowValidationError,
  WorkflowExecutionError,
  WorkflowTimeoutError,
  WorkflowNotFoundError,
  StepError,
  StepValidationError,
  StepExecutionError,
  StepTimeoutError,
  RateLimitError,
  CircuitBreakerError,
  DeduplicationError,
  ConfigurationError,
  AuthenticationError,
  AuthorizationError,
  ErrorUtils,
} from './shared/utils/errors';

// Import for internal use
import { OrchestrationError, WorkflowExecutionError } from './shared/utils/errors';

// Client-side utilities for workflow status checking
export interface WorkflowStatusClient {
  /**
   * Get workflow execution status
   */
  getStatus(runId: string): Promise<WorkflowExecutionResult>;
  
  /**
   * List workflow executions
   */
  list(options?: {
    workflowId?: string;
    status?: WorkflowExecutionResult['status'];
    limit?: number;
    offset?: number;
  }): Promise<WorkflowExecutionResult[]>;
}

/**
 * Create a client-side workflow status checker
 * This connects to your API endpoints to check workflow status
 */
export function createWorkflowStatusClient(config: {
  baseUrl: string;
  headers?: Record<string, string>;
}): WorkflowStatusClient {
  return {
    async getStatus(runId: string): Promise<WorkflowExecutionResult> {
      const response = await fetch(`${config.baseUrl}/api/workflows/status/${runId}`, {
        headers: config.headers,
      });
      
      if (!response.ok) {
        throw new WorkflowExecutionError(
          'unknown',
          runId,
          `Failed to get workflow status: ${response.statusText}`
        );
      }
      
      return response.json();
    },
    
    async list(options?: {
      workflowId?: string;
      status?: WorkflowExecutionResult['status'];
      limit?: number;
      offset?: number;
    }): Promise<WorkflowExecutionResult[]> {
      const params = new URLSearchParams();
      if (options?.workflowId) params.set('workflowId', options.workflowId);
      if (options?.status) params.set('status', options.status);
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.offset) params.set('offset', options.offset.toString());
      
      const response = await fetch(`${config.baseUrl}/api/workflows?${params}`, {
        headers: config.headers,
      });
      
      if (!response.ok) {
        throw new OrchestrationError(
          `Failed to list workflows: ${response.statusText}`,
          'LIST_FAILED'
        );
      }
      
      return response.json();
    },
  };
}