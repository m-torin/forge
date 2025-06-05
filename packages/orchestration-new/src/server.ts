/**
 * Server-side orchestration exports
 * Core workflow management and execution functionality
 */

import {
  RateLimitProvider,
  UpstashWorkflowProvider,
} from './providers/index.js';
// Core types
// Import for internal use
import {
  OrchestrationManager,
  validateWorkflowDefinition,
} from './shared/utils/index.js';

export type * from './shared/types/index.js';

// Manager and utilities
export { 
  createProviderError,
  createWorkflowExecutionError,
  OrchestrationError,
  OrchestrationManager,
  ProviderError,
  validateProviderConfig,
  validateWorkflowDefinition,
  WorkflowExecutionError,
} from './shared/utils/index.js';

export type { 
  OrchestrationManagerConfig,
  ValidationError,
} from './shared/utils/index.js';

// Providers
export { 
  RateLimitProvider,
  UpstashWorkflowProvider,
} from './providers/index.js';

export type {
  RateLimitProviderOptions,
  UpstashWorkflowProviderOptions,
} from './providers/index.js';

// Patterns
export {
  BatchManager,
  CircuitBreakerConfigs,
  circuitBreakerManager,
  RetryStrategies,
  withBatch,
  withCircuitBreaker,
  withRetry,
} from './shared/patterns/index.js';

export type {
  BatchOptions,
  CircuitBreakerOptions,
  RetryOptions,
} from './shared/patterns/index.js';

// Convenience functions for common use cases

/**
 * Create a workflow engine with default configuration
 */
export function createWorkflowEngine(config?: {
  providers?: {
    name: string;
    type: 'upstash-workflow' | 'rate-limit';
    config: Record<string, any>;
  }[];
  defaultProvider?: string;
  enableHealthChecks?: boolean;
  enableMetrics?: boolean;
}) {
  const manager = new OrchestrationManager({
    defaultProvider: config?.defaultProvider,
    enableHealthChecks: config?.enableHealthChecks,
    enableMetrics: config?.enableMetrics,
  });

  return {
    manager,
    
    async initialize() {
      await manager.initialize();
      
      // Register providers if configured
      if (config?.providers) {
        for (const providerConfig of config.providers) {
          let provider;
          
          switch (providerConfig.type) {
            case 'upstash-workflow':
              provider = new UpstashWorkflowProvider(providerConfig.config as any);
              break;
            case 'rate-limit':
              provider = new RateLimitProvider(providerConfig.config as any);
              break;
            default:
              throw new Error(`Unknown provider type: ${providerConfig.type}`);
          }
          
          await manager.registerProvider(providerConfig.name, provider as any);
        }
      }
    },
    
    async executeWorkflow(definition: any, input?: Record<string, any>, providerName?: string) {
      const validatedDefinition = validateWorkflowDefinition(definition);
      return manager.executeWorkflow(validatedDefinition, input, providerName);
    },
    
    async getExecution(executionId: string, providerName?: string) {
      return manager.getExecution(executionId, providerName);
    },
    
    async listExecutions(workflowId: string, options?: any, providerName?: string) {
      return manager.listExecutions(workflowId, options, providerName);
    },
    
    async scheduleWorkflow(definition: any, providerName?: string) {
      const validatedDefinition = validateWorkflowDefinition(definition);
      return manager.scheduleWorkflow(validatedDefinition, providerName);
    },
    
    async healthCheck() {
      return manager.healthCheckAll();
    },
    
    getStatus() {
      return manager.getStatus();
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