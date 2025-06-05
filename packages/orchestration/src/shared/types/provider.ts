/**
 * Provider Configuration Types
 * Defines configuration options for different workflow providers
 */

import type { z } from 'zod';

/**
 * Base provider configuration
 */
export interface BaseProviderConfig {
  /**
   * Provider name
   */
  name: string;
  
  /**
   * Enable debug logging
   */
  debug?: boolean;
  
  /**
   * Custom logger
   */
  logger?: {
    debug: (message: string, data?: any) => void;
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
  };
  
  /**
   * Provider-specific options
   */
  options?: Record<string, any>;
}

/**
 * Upstash Workflow provider configuration
 */
export interface UpstashWorkflowConfig extends BaseProviderConfig {
  name: 'upstash-workflow';
  
  /**
   * QStash configuration
   */
  qstash: {
    /**
     * QStash token
     */
    token: string;
    
    /**
     * Base URL for QStash (optional)
     */
    baseUrl?: string;
    
    /**
     * Default retry configuration
     */
    retries?: {
      maxRetries?: number;
      backoffMultiplier?: number;
      initialInterval?: number;
    };
  };
  
  /**
   * Redis configuration (optional, for persistence)
   */
  redis?: {
    /**
     * Redis URL
     */
    url: string;
    
    /**
     * Redis token
     */
    token: string;
    
    /**
     * Key prefix
     */
    keyPrefix?: string;
  };
  
  /**
   * Workflow serving configuration
   */
  serving?: {
    /**
     * Base URL for workflow endpoints
     */
    baseUrl: string;
    
    /**
     * Authentication method
     */
    auth?: {
      type: 'bearer' | 'qstash' | 'custom';
      token?: string;
      customValidator?: (req: Request) => Promise<boolean>;
    };
  };
}

/**
 * Temporal provider configuration (future implementation)
 */
export interface TemporalProviderConfig extends BaseProviderConfig {
  name: 'temporal';
  
  /**
   * Temporal connection options
   */
  connection: {
    address: string;
    namespace?: string;
    tls?: {
      cert: string;
      key: string;
    };
  };
  
  /**
   * Worker options
   */
  worker?: {
    taskQueue: string;
    maxConcurrentActivities?: number;
    maxConcurrentWorkflows?: number;
  };
}

/**
 * BullMQ provider configuration (future implementation)
 */
export interface BullMQProviderConfig extends BaseProviderConfig {
  name: 'bullmq';
  
  /**
   * Redis connection
   */
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  
  /**
   * Queue options
   */
  queue?: {
    defaultJobOptions?: {
      removeOnComplete?: boolean;
      removeOnFail?: boolean;
      attempts?: number;
      backoff?: {
        type: 'exponential' | 'fixed';
        delay: number;
      };
    };
  };
}

/**
 * Inngest provider configuration (future implementation)
 */
export interface InngestProviderConfig extends BaseProviderConfig {
  name: 'inngest';
  
  /**
   * Inngest client configuration
   */
  client: {
    /**
     * Inngest app ID
     */
    appId: string;
    
    /**
     * Inngest event key
     */
    eventKey?: string;
    
    /**
     * Inngest signing key
     */
    signingKey?: string;
    
    /**
     * Base URL
     */
    baseUrl?: string;
  };
  
  /**
   * Function configuration
   */
  functions?: {
    /**
     * Default concurrency
     */
    concurrency?: number;
    
    /**
     * Default rate limit
     */
    rateLimit?: {
      limit: number;
      period: string;
    };
  };
}

/**
 * Union type of all provider configurations
 */
export type ProviderConfig = 
  | UpstashWorkflowConfig
  | TemporalProviderConfig
  | BullMQProviderConfig
  | InngestProviderConfig;

/**
 * Provider selection criteria
 */
export interface ProviderSelectionCriteria {
  /**
   * Required features
   */
  features?: Array<
    | 'scheduling'
    | 'deduplication'
    | 'rate-limiting'
    | 'distributed-execution'
    | 'long-running'
    | 'event-driven'
    | 'batch-processing'
    | 'versioning'
  >;
  
  /**
   * Performance requirements
   */
  performance?: {
    maxLatency?: number;
    minThroughput?: number;
    maxConcurrency?: number;
  };
  
  /**
   * Cost preferences
   */
  cost?: {
    maxPerExecution?: number;
    billingModel?: 'pay-per-use' | 'subscription' | 'self-hosted';
  };
  
  /**
   * Infrastructure preferences
   */
  infrastructure?: {
    hosting?: 'cloud' | 'self-hosted' | 'hybrid';
    region?: string;
    compliance?: string[];
  };
}

/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
  /**
   * Supported features
   */
  features: Set<string>;
  
  /**
   * Performance characteristics
   */
  performance: {
    typicalLatency: number;
    maxThroughput: number;
    maxConcurrency: number;
  };
  
  /**
   * Cost model
   */
  cost: {
    model: 'pay-per-use' | 'subscription' | 'self-hosted';
    estimatedCostPerExecution?: number;
  };
  
  /**
   * Infrastructure details
   */
  infrastructure: {
    type: 'cloud' | 'self-hosted' | 'hybrid';
    regions: string[];
    compliance: string[];
  };
  
  /**
   * Limitations
   */
  limitations?: {
    maxExecutionTime?: number;
    maxPayloadSize?: number;
    maxStepsPerWorkflow?: number;
  };
}

/**
 * Provider factory function type
 */
export type ProviderFactory<T extends ProviderConfig> = (
  config: T
) => Promise<import('./workflow').WorkflowProvider>;

/**
 * Provider registry entry
 */
export interface ProviderRegistryEntry {
  /**
   * Provider name
   */
  name: string;
  
  /**
   * Provider factory
   */
  factory: ProviderFactory<any>;
  
  /**
   * Provider capabilities
   */
  capabilities: ProviderCapabilities;
  
  /**
   * Configuration schema
   */
  configSchema?: z.ZodSchema<any>;
}

/**
 * Provider initialization options
 */
export interface ProviderInitOptions {
  /**
   * Skip health checks
   */
  skipHealthCheck?: boolean;
  
  /**
   * Connection timeout
   */
  connectionTimeout?: number;
  
  /**
   * Retry configuration
   */
  retries?: {
    maxAttempts: number;
    backoff: number;
  };
}