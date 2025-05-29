import { z } from 'zod';

import type { WorkflowContext } from '@upstash/workflow';

// Re-export WorkflowContext from @upstash/workflow
export type { WorkflowContext } from '@upstash/workflow';

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
  workflow?: any; // For serveMany - calling another workflow
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
  workflow: any; // The workflow to invoke
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
  qstashClient?: any; // Will be QStash Client instance
  receiver?: any; // Will be QStash Receiver instance
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

// Workflow status types
export type WorkflowState = 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED';

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

// Utility type guards
export function isSuccessResult<T>(result: {
  success: boolean;
  data?: T;
  error?: string;
}): result is { success: true; data: T } {
  return result.success === true && result.data !== undefined;
}

export function isErrorResult(result: {
  success: boolean;
  data?: unknown;
  error?: string;
}): result is { success: false; error: string } {
  return result.success === false && result.error !== undefined;
}
