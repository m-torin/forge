/**
 * Workflow execution status
 */
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Individual workflow step
 */
export interface WorkflowStep {
  id: string;
  name: string;
  status: WorkflowStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  output?: unknown;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecution {
  workflowRunId: string;
  status: WorkflowStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  steps: WorkflowStep[];
}

/**
 * Workflow list response
 */
export interface WorkflowListResponse {
  workflows: WorkflowExecution[];
  total: number;
  hasMore: boolean;
}

/**
 * Get the base URL for workflow endpoints
 */
export function getWorkflowBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for server-side
  return 'http://localhost:3303';
}
