/**
 * Server-only exports for the orchestration package
 * These exports require Node.js environment and process.env access
 */

// Re-export everything from the main index for server use
export * from './index';

// New orchestration architecture exports
// Export only types that are not in index.ts
export type {
  WorkflowProvider,
  WorkflowDefinition,
  WorkflowExecutionOptions,
  WorkflowExecutionResult,
  StepResult,
} from './shared/types/workflow';
export * from './shared/types/provider';
export type {
  BatchConfig,
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
  ProviderError,
  ProviderNotFoundError,
  ProviderInitializationError,
  ProviderNotAvailableError,
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
} from './shared/utils/errors';
export { 
  OrchestrationError,
  ErrorUtils,
  OrchestrationManager, 
  createOrchestrationManager 
} from './shared/utils/manager';

// Provider exports
export * from './providers/upstash-workflow/provider';
export type {
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

// Provider registry
import type { ProviderRegistryEntry } from './shared/types/provider';
import { createUpstashWorkflowProvider } from './providers/upstash-workflow/provider';

export const AVAILABLE_PROVIDERS: Record<string, ProviderRegistryEntry> = {
  'upstash-workflow': {
    name: 'upstash-workflow',
    factory: createUpstashWorkflowProvider,
    capabilities: {
      features: new Set([
        'scheduling',
        'deduplication',
        'rate-limiting',
        'distributed-execution',
        'event-driven',
        'batch-processing',
      ]),
      performance: {
        typicalLatency: 100,
        maxThroughput: 10000,
        maxConcurrency: 1000,
      },
      cost: {
        model: 'pay-per-use',
        estimatedCostPerExecution: 0.00001,
      },
      infrastructure: {
        type: 'cloud',
        regions: ['us-east-1', 'eu-west-1'],
        compliance: ['SOC2', 'GDPR'],
      },
      limitations: {
        maxExecutionTime: 15 * 60 * 1000, // 15 minutes
        maxPayloadSize: 1024 * 1024, // 1MB
        maxStepsPerWorkflow: 100,
      },
    },
  },
};

// Legacy exports (kept for backward compatibility)
// Server-specific workflow builders that use process.env
export { workflows } from './runtime/core/workflow-builder';

// Server-only utilities that require database access
export * from './utils/product-classification';
export * from './utils/ai-integration';

// Server-only runtime components
export * from './runtime/core/dev-server';

// Server-only environment utilities
export {
  env,
  ENV_CONFIGS,
  envLog,
  getApiBaseUrl,
  getBooleanEnvVar,
  getDefaultMaxRetries,
  getDefaultTimeout,
  getEnvConfig,
  getEnvironment,
  getEnvVar,
  getNumericEnvVar,
  getRequiredEnvVar,
  isCacheEnabled,
  isDevelopment,
  isFeatureEnabled,
  isLocalQStash,
  isProduction,
  isStrictMode,
  isTest,
} from './utils/environment';
