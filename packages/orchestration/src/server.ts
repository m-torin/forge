/**
 * Server-side orchestration exports (non-Next.js)
 * Core workflow management and execution functionality
 *
 * This file provides server-side orchestration functionality for non-Next.js applications.
 * Use this in Node.js applications, API servers, and standalone server environments.
 *
 * For Next.js applications, use '@repo/orchestration/server/next' instead.
 */

import { redis } from '@repo/database/redis/server';

import { UpstashWorkflowProvider } from './providers/index';
import {
  AnyProviderConfig,
  ListExecutionsOptions,
  WorkflowData,
  WorkflowDefinition,
} from './shared/types/index';
// Core types
// Import for internal use
import { OrchestrationManager, validateWorkflowDefinition } from './shared/utils/index';

// Providers
export { RateLimitProvider, UpstashWorkflowProvider } from './providers/index';

export type { RateLimitProviderOptions, UpstashWorkflowProviderOptions } from './providers/index';

// Patterns
export {
  BatchManager,
  CircuitBreakerConfigs,
  circuitBreakerManager,
  RetryStrategies,
  withBatch,
  withCircuitBreaker,
  withRetry,
} from './shared/patterns/index';

export type { BatchOptions, CircuitBreakerOptions, RetryOptions } from './shared/patterns/index';

export type * from './shared/types/index';

// Manager and utilities
export {
  createOrchestrationError,
  createProviderError,
  createWorkflowExecutionError,
  OrchestrationError,
  OrchestrationErrorCodes,
  OrchestrationManager,
  ProviderError,
  validateProviderConfig,
  validateWorkflowDefinition,
  withRateLimit,
  WorkflowExecutionError,
} from './shared/utils/index';

export type { OrchestrationManagerConfig, ValidationError } from './shared/utils/index';

// Convenience functions for common use cases

/**
 * Create a workflow engine with default configuration
 */
export function createWorkflowEngine(config?: {
  defaultProvider?: string;
  enableHealthChecks?: boolean;
  enableMetrics?: boolean;
  providers?: {
    config: AnyProviderConfig;
    name: string;
    type: 'rate-limit' | 'upstash-workflow';
  }[];
}) {
  const manager = new OrchestrationManager({
    defaultProvider: config?.defaultProvider,
    enableHealthChecks: config?.enableHealthChecks,
    enableMetrics: config?.enableMetrics,
  });

  return {
    async executeWorkflow(
      definition: WorkflowDefinition,
      input?: WorkflowData,
      providerName?: string,
    ) {
      const validatedDefinition = validateWorkflowDefinition(definition);
      return manager.executeWorkflow(validatedDefinition, input, providerName);
    },

    async getExecution(executionId: string, providerName?: string) {
      return manager.getExecution(executionId, providerName);
    },

    getStatus() {
      return manager.getStatus();
    },

    async healthCheck() {
      return manager.healthCheckAll();
    },

    async initialize() {
      await manager.initialize();

      // Register providers if configured
      if (config?.providers) {
        for (const providerConfig of config.providers) {
          let provider;

          switch (providerConfig.type) {
            case 'rate-limit':
              // RateLimitProvider is not a WorkflowProvider, skip registration
              break;
            case 'upstash-workflow':
              provider = new UpstashWorkflowProvider({
                baseUrl: (providerConfig.config as any).baseUrl,
                qstash: {
                  token: (providerConfig.config as any).qstashToken,
                },
                enableRedis: true,
              });
              // Inject Redis client for health checks and state management
              provider.setClients(provider['qstash'], redis);
              await manager.registerProvider(providerConfig.name, provider);
              break;
            default:
              throw new Error(`Unknown provider type: ${providerConfig.type}`);
          }
        }
      }
    },

    async listExecutions(
      workflowId: string,
      options?: ListExecutionsOptions,
      providerName?: string,
    ) {
      return manager.listExecutions(workflowId, options, providerName);
    },

    manager,

    async scheduleWorkflow(definition: WorkflowDefinition, providerName?: string) {
      const validatedDefinition = validateWorkflowDefinition(definition);
      return manager.scheduleWorkflow(validatedDefinition, providerName);
    },

    async shutdown() {
      return manager.shutdown();
    },
  };
}

/**
 * Default workflow engine instance
 */
export const workflowEngine = createWorkflowEngine();

// Re-export Upstash packages for direct usage in workflow routes
export { Client as QStashClient, QStashWorkflowAbort } from '@upstash/qstash';
// Removed blocking script imports from @upstash/workflow/nextjs
// These were causing blocking script loading and were not being used
