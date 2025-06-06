import { WorkflowDefinition, WorkflowExecution, WorkflowStatus } from './workflow';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface WorkflowListResponse {
  workflows: WorkflowDefinition[];
  total: number;
}

export interface ExecutionListResponse {
  executions: WorkflowExecution[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkflowExecuteRequest {
  payload: Record<string, any>;
  schedule?: {
    cron: string;
    timezone: string;
  };
}

export interface WorkflowExecuteResponse {
  executionId: string;
  status: WorkflowStatus;
  message: string;
}

export interface WorkflowStatusRequest {
  executionIds: string[];
}

export interface WorkflowStatusResponse {
  executions: Record<string, WorkflowExecution>;
}

export interface MetricsResponse {
  activeExecutions: number;
  totalExecutions: number;
  totalWorkflows: number;
  successRate: number;
  averageExecutionTime: number;
  executionsByStatus: Record<WorkflowStatus, number>;
  executionsByWorkflow: Record<string, number>;
  recentActivity: Array<{
    timestamp: Date;
    workflowId: string;
    status: WorkflowStatus;
    duration?: number;
  }>;
  resourceUsage: {
    cpu: number;
    memory: number;
    activeConnections: number;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  services: {
    qstash: 'connected' | 'disconnected' | 'error';
    redis: 'connected' | 'disconnected' | 'not-configured';
    websocket: 'running' | 'stopped' | 'error';
  };
  metrics: {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
  };
}
