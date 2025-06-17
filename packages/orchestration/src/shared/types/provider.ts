/**
 * Provider configuration and management types
 */

import { WorkflowProvider } from './workflow';

export type AnyProviderConfig =
  | CustomProviderConfig
  | RateLimitConfig
  | UpstashQStashConfig
  | UpstashWorkflowConfig;

export interface CustomProviderConfig extends ProviderConfig {
  config: {
    /** Additional configuration for custom provider */
    [key: string]: any;
    /** Custom provider class or factory function */
    provider: (() => Promise<WorkflowProvider>) | (() => WorkflowProvider) | WorkflowProvider;
  };
  type: 'custom';
}

export interface ProviderCapabilities {
  /** Maximum concurrent executions */
  maxConcurrency?: number;
  /** Maximum execution timeout */
  maxTimeout?: number;
  /** Maximum workflow definition size */
  maxWorkflowSize?: number;
  /** Supported retry strategies */
  retryStrategies?: ('exponential' | 'fixed' | 'linear')[];
  /** Whether provider supports scheduling */
  supportsScheduling: boolean;
  /** Whether provider supports state persistence */
  supportsStatePersistence: boolean;
  /** Whether provider supports webhooks */
  supportsWebhooks: boolean;
}

export interface ProviderConfig {
  /** Provider-specific configuration */
  config: Record<string, unknown>;
  /** Whether this provider is enabled */
  enabled: boolean;
  /** Environment where this provider should be used */
  environment?: 'all' | 'development' | 'production' | 'staging';
  /** Features supported by this provider */
  features?: ProviderFeature[];
  /** Provider name/identifier */
  name: string;
  /** Priority for provider selection (higher = preferred) */
  priority?: number;
  /** Provider type */
  type: 'custom' | 'rate-limit' | 'upstash-qstash' | 'upstash-workflow';
}

export interface ProviderContext {
  /** Current execution environment */
  environment: 'development' | 'production' | 'staging';
  /** Additional context data */
  metadata?: Record<string, unknown>;
  /** Request context (if available) */
  request?: {
    headers: Record<string, string>;
    method: string;
    url: string;
  };
  /** User context (if available) */
  user?: {
    id: string;
    permissions: string[];
  };
}

export type ProviderFeature =
  | 'batch-processing'
  | 'dead-letter-queue'
  | 'monitoring'
  | 'rate-limiting'
  | 'retries'
  | 'scheduling'
  | 'state-management'
  | 'webhooks'
  | 'workflow-execution';

export interface ProviderHealthReport {
  /** Additional details */
  details?: Record<string, unknown>;
  /** Error details if unhealthy */
  error?: string;
  /** Provider name */
  name: string;
  /** Response time in milliseconds */
  responseTime: number;
  /** Health status */
  status: 'degraded' | 'healthy' | 'unhealthy';
  /** When health check was performed */
  timestamp: Date;
  /** Provider type */
  type: string;
}

export interface ProviderMetrics {
  /** Current active executions */
  activeExecutions: number;
  /** Average execution time in milliseconds */
  averageExecutionTime: number;
  /** Failed executions */
  failedExecutions: number;
  periodEnd: Date;
  /** Metrics collection period */
  periodStart: Date;
  /** Provider name */
  providerName: string;
  /** Successful executions */
  successfulExecutions: number;
  /** Total executions handled */
  totalExecutions: number;
}

export interface ProviderRegistry {
  /** Get all registered providers */
  getAllProviders(): WorkflowProvider[];
  /** Get the default provider for workflow execution */
  getDefaultProvider(): null | WorkflowProvider;
  /** Get a specific provider */
  getProvider(name: string): null | WorkflowProvider;
  /** Get providers by type */
  getProvidersByType(type: ProviderConfig['type']): WorkflowProvider[];
  /** Health check all providers */
  healthCheckAll(): Promise<ProviderHealthReport[]>;
  /** Register a provider */
  register(config: AnyProviderConfig): Promise<void>;
  /** Unregister a provider */
  unregister(name: string): Promise<void>;
}

export interface RateLimitConfig extends ProviderConfig {
  config: {
    /** Rate limit algorithm */
    algorithm?: 'fixed-window' | 'sliding-window' | 'token-bucket';
    /** Default rate limit settings */
    defaultLimit?: {
      /** Number of requests */
      requests: number;
      /** Time window in seconds */
      window: number;
    };
    /** Redis token */
    redisToken?: string;
    /** Redis URL for rate limit storage */
    redisUrl: string;
  };
  type: 'rate-limit';
}

export interface UpstashQStashConfig extends ProviderConfig {
  config: {
    /** Base URL for callbacks */
    baseUrl: string;
    /** Current signing key */
    currentSigningKey?: string;
    /** Default delay in seconds */
    delay?: number;
    /** Next signing key for rotation */
    nextSigningKey?: string;
    /** Default retry configuration */
    retries?: number;
    /** QStash token */
    token: string;
  };
  type: 'upstash-qstash';
}

export interface UpstashWorkflowConfig extends ProviderConfig {
  config: {
    baseUrl: string;
    qstashToken: string;
    redisToken: string;
    redisUrl: string;
    webhookUrlPattern?: string;
  };
  enabled: boolean;
  name: string;
  type: 'upstash-workflow';
}
