export interface JrSitemapsWorkflowPayload {
  trigger: 'manual' | 'scheduled' | 'child';
  customSitemaps?: string[];
  batchSize?: number;
  skipUnchanged?: boolean;
  progressWebhook?: string;
  parentRunId?: string;
  batchIndex?: number;
  isPriorityBatch?: boolean;
}

export interface JrSitemapsProcessingStats {
  totalSitemapsProcessed: number;
  totalUrlsFound: number;
  totalUrlsInserted: number;
  totalUrlsUpdated: number;
  skippedDueToDuplicates: number;
  prioritySitemapsProcessed: number;
  failedSitemaps: string[];
  errors: JrSitemapsErrorDetail[];
  warnings: string[];
  processingTimeMs: number;
  childWorkflowIds?: string[];
  totalUniqueUrls?: number;
  lastUpdated?: string;
}

export interface JrSitemapsErrorDetail {
  url: string;
  error: string;
  timestamp: string;
}

export interface JrSitemapResult {
  url: string;
  success: boolean;
  urlsProcessed: number;
  inserted: number;
  updated: number;
  skipped: number;
  isPriority: boolean;
  error?: string;
}

export interface JrSitemapUrlDetails {
  url: string;
  firstSeen: string;
  lastSeen: string;
  source: string;
  updateCount: number;
}

export interface JrSitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/**
 * JR-Sitemaps workflow execution status
 */
export type JrSitemapsWorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Individual JR-Sitemaps workflow step
 */
export interface JrSitemapsWorkflowStep {
  id: string;
  name: string;
  status: JrSitemapsWorkflowStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  output?: unknown;
  sitemapUrl?: string;
  urlsProcessed?: number;
  isPriority?: boolean;
}

/**
 * JR-Sitemaps workflow execution result
 */
export interface JrSitemapsWorkflowExecution {
  workflowRunId: string;
  status: JrSitemapsWorkflowStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  steps: JrSitemapsWorkflowStep[];
  stats?: {
    totalSitemaps: number;
    totalUrls: number;
    prioritySitemaps: number;
    childWorkflows: number;
  };
}

/**
 * JR-Sitemaps workflow list response
 */
export interface JrSitemapsWorkflowListResponse {
  workflows: JrSitemapsWorkflowExecution[];
  total: number;
  hasMore: boolean;
}

/**
 * JR-Sitemaps workflow input for triggering
 */
export interface JrSitemapsWorkflowInput {
  customSitemaps?: string[];
  batchSize?: number;
  skipUnchanged?: boolean;
}

/**
 * JR-Sitemaps workflow trigger options
 */
export interface JrSitemapsTriggerWorkflowInput {
  workflowRunId?: string;
  retries?: number;
  delay?: string | number;
}

/**
 * Get the base URL for JR-Sitemaps workflow endpoints
 */
export function getJrSitemapsWorkflowBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for server-side
  return 'http://localhost:3303';
}
