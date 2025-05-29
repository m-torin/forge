import { z } from 'zod';

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

// Import types from QStash and Workflow
import type { Client } from '@upstash/qstash';
import type { Receiver } from '@upstash/qstash';
import type { Client as WorkflowClient } from '@upstash/workflow';

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

export interface ScrapingResult {
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
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  workflowRunId?: string;
  retries?: number;
  delay?: string;
  flowControl?: {
    key: string;
    rate?: number;
    parallelism?: number;
    period?: string;
  };
}

/**
 * Options for getting workflow logs
 */
export interface LogsOptions {
  workflowRunId?: string;
  count?: number;
  state?: WorkflowState;
  workflowUrl?: string;
  workflowCreatedAt?: number;
  cursor?: string;
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
  eventId: string;
  eventData?: unknown;
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

