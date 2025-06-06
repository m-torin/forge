export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  tags?: string[];
  category?: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;

  // Function signature
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;

  // Configuration
  timeout?: number;
  retries?: number;
  concurrency?: number;

  // Development metadata
  filePath: string;
  lastModified: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;

  // Timing
  startedAt: Date;
  completedAt?: Date;
  duration?: number;

  // Steps
  steps: StepExecution[];

  // Metadata
  triggeredBy: string;
  environment: string;
  version: string;

  // Performance
  metrics: ExecutionMetrics;
}

export interface StepExecution {
  id: string;
  name: string;
  status: WorkflowStatus;
  input?: any;
  output?: any;
  error?: string;

  // Timing
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;

  // Attempts
  attempt: number;
  maxAttempts: number;

  // Performance
  metrics: StepMetrics;
}

export interface ExecutionMetrics {
  cpuUsage?: number;
  memoryUsage?: number;
  networkCalls?: number;
  databaseQueries?: number;
  cacheHits?: number;
  cacheMisses?: number;
}

export interface StepMetrics {
  cpuTime?: number;
  memoryPeak?: number;
  ioOperations?: number;
  networkLatency?: number;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  payload: Record<string, any>;
  triggeredBy: string;
  scheduledFor?: Date;
}

export interface WorkflowSchedule {
  id: string;
  workflowId: string;
  cron: string;
  timezone: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  payload: Record<string, any>;
}
