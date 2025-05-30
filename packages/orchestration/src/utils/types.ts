import { z } from 'zod';

import type { BaseOperationResult } from './results';
// Import types from QStash and Workflow
import type { Client } from '@upstash/qstash';
import type { Receiver } from '@upstash/qstash';
import type { WorkflowContext } from '@upstash/workflow';

// Re-export WorkflowContext from @upstash/workflow
export type { WorkflowContext } from '@upstash/workflow';

// Workflow reference type for calling other workflows
export interface WorkflowReference {
  name: string;
  url: string;
  version?: string;
}

export interface CallOptions {
  body?: unknown;
  flowControl?: {
    key: string;
    rate?: number;
    parallelism?: number;
    period?: string;
  };
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  retries?: number; // defaults to 0
  timeout?: number; // in seconds
  url: string;
  workflow?: WorkflowReference; // For serveMany - calling another workflow
}

export interface CallResponse<T> {
  body: T;
  headers: Record<string, string>;
  status: number;
}

export interface WaitOptions {
  timeout?: number | string; // in seconds or duration string like "1d", "1000s"
}

export interface EventResult<T> {
  eventData?: T;
  timeout: boolean;
}

// Notify response types
export interface NotifyResponse {
  error?: string;
  messageId: string;
  waiter: Waiter;
}

export interface Waiter {
  deadline: number; // Unix timestamp
  headers: Record<string, string[]>;
  timeoutBody?: unknown;
  timeoutHeaders?: Record<string, string[]>;
  timeoutUrl?: string;
  url: string;
}

// Invoke options and result
export interface InvokeOptions {
  body?: unknown;
  flowControl?: {
    key: string;
    rate?: number;
    parallelism?: number;
    period?: string;
  };
  headers?: Record<string, string>;
  retries?: number;
  workflow: WorkflowReference; // The workflow to invoke
  workflowRunId?: string;
}

export interface InvokeResult<T> {
  body?: T;
  isCanceled: boolean;
  isFailed: boolean;
}

// Workflow configuration (updated with all options from docs)
export interface WorkflowConfig {
  baseUrl?: string;
  disableTelemetry?: boolean;
  env?: Record<string, string | undefined>;
  failureFunction?: (params: {
    context: WorkflowContext;
    failStatus: number;
    failResponse: unknown;
    failHeaders?: Record<string, string>;
  }) => Promise<void>;
  failureUrl?: string;
  flowControl?: {
    key: string;
    rate?: number;
    period?: string;
    parallelism?: number;
  };
  initialPayloadParser?: <T>(initialPayload: unknown) => T;
  qstashClient?: Client; // QStash Client instance
  receiver?: Receiver; // QStash Receiver instance
  retries?: number;
  url?: string;
  verbose?: boolean;
}

// Scraping workflow types
export const ScrapingConfigSchema = z.object({
  urls: z.array(z.string().url()),
  config: z
    .object({
      cacheResults: z.boolean().default(true),
      enableDeduplication: z.boolean().default(true),
      maxConcurrency: z.number().min(1).max(20).default(5),
      rateLimitPerMinute: z.number().min(1).max(100).default(60),
      retryAttempts: z.number().min(1).max(5).default(3),
      scheduleCron: z.string().optional(),
      waitForApproval: z.boolean().optional(),
    })
    .default({}),
  selectors: z.record(z.string()),
});

export type ScrapingConfig = z.infer<typeof ScrapingConfigSchema>;

export interface ScrapingResult extends BaseOperationResult {
  results: {
    url: string;
    data?: unknown;
    error?: string;
    success: boolean;
  }[];
  sessionId: string;
  summary: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    deduplicated: number;
  };
}

// Scheduled workflow types
export interface ScheduledWorkflowPayload {
  cron?: string;
  data: unknown;
  scheduleId?: string;
}

// Workflow run and status types
export type WorkflowState = 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED';

export interface WorkflowStep {
  steps: {
    stepName: string;
    stepType: string;
    startedAt: number;
    completedAt?: number;
    status: string;
  }[];
  type: 'single' | 'parallel' | 'batch';
}

export interface WorkflowRun {
  dlqId?: string;
  failureFunction?: unknown;
  invoker?: {
    runId: string;
    url: string;
    createdAt: number;
  };
  steps: WorkflowStep[];
  workflowRunCompletedAt?: number;
  workflowRunCreatedAt: number;
  workflowRunId: string;
  workflowRunResponse?: unknown;
  workflowState: WorkflowState;
  workflowUrl: string;
}

export interface WorkflowStatus {
  completedAt?: number;
  createdAt: number;
  state: WorkflowState;
  steps: {
    stepName: string;
    stepType: string;
    startedAt: number;
    completedAt?: number;
    status: string;
  }[];
}

export interface NotifyResult {
  error?: string;
  messageId: string;
  waiter: Waiter;
}

/**
 * Options for triggering a workflow
 */
export interface TriggerOptions {
  body?: unknown;
  delay?: string;
  flowControl?: {
    key: string;
    rate?: number;
    parallelism?: number;
    period?: string;
  };
  headers?: Record<string, string>;
  retries?: number;
  url: string;
  workflowRunId?: string;
}

/**
 * Options for getting workflow logs
 */
export interface LogsOptions {
  count?: number;
  cursor?: string;
  state?: WorkflowState;
  workflowCreatedAt?: number;
  workflowRunId?: string;
  workflowUrl?: string;
}

/**
 * Options for canceling workflows
 */
export type CancelOptions =
  | { ids: string | string[] }
  | { urlStartingWith: string }
  | { all: true };

/**
 * Options for notifying a workflow
 */
export interface NotifyOptions {
  eventData?: unknown;
  eventId: string;
}

/**
 * Options for waiting for workflow completion
 */
export interface WaitForCompletionOptions {
  pollingInterval?: number;
  timeout?: number;
}

// Circuit breaker types
export interface CircuitBreakerConfig {
  failureThreshold?: number;
  recoveryTimeout?: number;
  successThreshold?: number;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

// Rate limiter types
export interface RateLimiterConfig {
  keyPrefix?: string;
  maxRequests: number;
  windowMs: number;
}

// ===== Common Constants =====

// Default timeouts and delays
export const DEFAULT_TIMEOUTS = {
  api: 30000,
  fanout: 100,
  polling: 2000,
  retry: 1000,
  workflow: 300000,
} as const;

// Default retry configurations
export const DEFAULT_RETRIES = {
  aggressive: 7,
  api: 3,
  conservative: 2,
  network: 5,
} as const;

// Environment-specific configurations
export const ENV_CONFIGS = {
  development: {
    logLevel: 'debug',
    maxEntries: 1000,
    skipDeduplication: true,
    ttl: 60 * 1000, // 1 minute
  },
  production: {
    logLevel: 'info',
    maxEntries: 10000,
    skipDeduplication: false,
    ttl: 30 * 60 * 1000, // 30 minutes
  },
  test: {
    logLevel: 'debug',
    maxEntries: 100,
    skipDeduplication: true,
    ttl: 30 * 1000, // 30 seconds
  },
} as const;

// Common CRON patterns
export const CRON_PATTERNS = {
  everyDayMidnight: '0 0 * * *',
  businessHours: '0 9-17 * * 1-5',
  everyDayNoon: '0 12 * * *',
  everyHour: '0 * * * *',
  everyMinute: '* * * * *',
  everyMonday: '0 0 * * 1',
  everyThreeHours: '0 */3 * * *',
  everyWeekday: '0 0 * * 1-5',
  firstOfMonth: '0 0 1 * *',
  quarterly: '0 0 1 */3 *',
  twiceDaily: '0 9,17 * * *',
} as const;

// ===== Common Result Types =====
// Re-export from centralized results module for backward compatibility
export type {
  BaseOperationResult,
  BatchOperationResult,
  HealthCheckResult,
  OperationResult,
  PaginatedResult,
  StreamResult,
  ValidationResult,
} from './results';

// Deprecated type alias for backward compatibility
/** @deprecated Use BatchOperationResult instead */
export type BatchResult<T> = import('./results').BatchOperationResult<T>;

// Retry configuration
export interface RetryConfig {
  baseDelayMs: number;
  jitter?: boolean;
  maxAttempts: number;
  maxDelayMs: number;
  multiplier?: number;
  strategy?: 'exponential' | 'linear' | 'constant';
}

// ===== Common Utility Types =====

// Environment type
export type Environment = 'development' | 'production' | 'test';

// Log level type
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Generic callback types
export type AsyncCallback<T = void, R = void> = (data: T) => Promise<R>;
export type SyncCallback<T = void, R = void> = (data: T) => R;

// Error with context
export interface ContextualError extends Error {
  context?: Record<string, unknown>;
  retryable?: boolean;
  retryAfter?: number;
}
