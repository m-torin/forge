export interface ScheduleConfig {
  workflowId: string;
  cron: string;
  timezone?: string;
  input?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}