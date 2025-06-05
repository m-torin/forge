/**
 * Provider configuration and management types
 */

import type { WorkflowProvider } from './workflow';

export interface ProviderConfig {
  /** Provider-specific configuration */
  config: Record<string, any>;
  /** Whether this provider is enabled */
  enabled: boolean;
  /** Environment where this provider should be used */
  environment?: 'development' | 'staging' | 'production' | 'all';
  /** Features supported by this provider */
  features?: ProviderFeature[];
  /** Provider name/identifier */
  name: string;
  /** Priority for provider selection (higher = preferred) */
  priority?: number;
  /** Provider type */
  type: 'upstash-workflow' | 'upstash-qstash' | 'rate-limit' | 'custom';
}

export interface UpstashWorkflowConfig extends ProviderConfig {
  name: string;
  type: 'upstash-workflow';
  enabled: boolean;
  config: {
    baseUrl: string;
    qstashToken: string;
    redisUrl: string;
    redisToken: string;
  };
}

export interface UpstashQStashConfig extends ProviderConfig {
  config: {
    /** QStash token */
    token: string;
    /** Current signing key */
    currentSigningKey?: string;
    /** Next signing key for rotation */
    nextSigningKey?: string;
    /** Base URL for callbacks */
    baseUrl: string;
    /** Default retry configuration */
    retries?: number;
    /** Default delay in seconds */
    delay?: number;
  };
  type: 'upstash-qstash';
}

export interface RateLimitConfig extends ProviderConfig {
  config: {
    /** Redis URL for rate limit storage */
    redisUrl: string;
    /** Redis token */
    redisToken?: string;
    /** Default rate limit settings */
    defaultLimit?: {
      /** Number of requests */
      requests: number;
      /** Time window in seconds */
      window: number;
    };
    /** Rate limit algorithm */
    algorithm?: 'sliding-window' | 'fixed-window' | 'token-bucket';
  };
  type: 'rate-limit';
}

export interface CustomProviderConfig extends ProviderConfig {
  config: {
    /** Custom provider class or factory function */
    provider: WorkflowProvider | (() => WorkflowProvider) | (() => Promise<WorkflowProvider>);
    /** Additional configuration for custom provider */
    [key: string]: any;
  };
  type: 'custom';
}

export type AnyProviderConfig =
  | UpstashWorkflowConfig
  | UpstashQStashConfig
  | RateLimitConfig
  | CustomProviderConfig;

export interface ProviderRegistry {
  /** Get all registered providers */
  getAllProviders(): WorkflowProvider[];
  /** Get the default provider for workflow execution */
  getDefaultProvider(): WorkflowProvider | null;
  /** Get a specific provider */
  getProvider(name: string): WorkflowProvider | null;
  /** Get providers by type */
  getProvidersByType(type: ProviderConfig['type']): WorkflowProvider[];
  /** Health check all providers */
  healthCheckAll(): Promise<ProviderHealthReport[]>;
  /** Register a provider */
  register(config: AnyProviderConfig): Promise<void>;
  /** Unregister a provider */
  unregister(name: string): Promise<void>;
}

export interface ProviderHealthReport {
  /** Additional details */
  details?: Record<string, any>;
  /** Error details if unhealthy */
  error?: string;
  /** Provider name */
  name: string;
  /** Response time in milliseconds */
  responseTime: number;
  /** Health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
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

export type ProviderFeature =
  | 'workflow-execution'
  | 'scheduling'
  | 'rate-limiting'
  | 'retries'
  | 'webhooks'
  | 'batch-processing'
  | 'state-management'
  | 'monitoring'
  | 'dead-letter-queue';

export interface ProviderCapabilities {
  /** Maximum concurrent executions */
  maxConcurrency?: number;
  /** Maximum execution timeout */
  maxTimeout?: number;
  /** Maximum workflow definition size */
  maxWorkflowSize?: number;
  /** Supported retry strategies */
  retryStrategies?: ('fixed' | 'exponential' | 'linear')[];
  /** Whether provider supports scheduling */
  supportsScheduling: boolean;
  /** Whether provider supports state persistence */
  supportsStatePersistence: boolean;
  /** Whether provider supports webhooks */
  supportsWebhooks: boolean;
}

export interface ProviderContext {
  /** Current execution environment */
  environment: 'development' | 'staging' | 'production';
  /** Additional context data */
  metadata?: Record<string, any>;
  /** Request context (if available) */
  request?: {
    headers: Record<string, string>;
    url: string;
    method: string;
  };
  /** User context (if available) */
  user?: {
    id: string;
    permissions: string[];
  };
}
