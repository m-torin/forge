export interface ScheduleConfig {
  cron?: string;
  enabled?: boolean;
  endDate?: Date;
  input?: Record<string, unknown>;
  maxRetries?: number;
  metadata?: Record<string, unknown>;
  retryDelay?: number;
  runAt?: Date;
  startDate?: Date;
  timezone?: string;
  workflowId: string;
}

interface ScheduleStatus {
  enabled: boolean;
  errorCount?: number;
  lastRun?: Date;
  nextRun?: Date;
  runCount?: number;
}
