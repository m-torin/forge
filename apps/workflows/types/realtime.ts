export interface WorkflowEvent {
  type:
    | 'workflow-started'
    | 'workflow-completed'
    | 'workflow-failed'
    | 'step-started'
    | 'step-completed'
    | 'step-failed'
    | 'metrics-updated';
  workflowId: string;
  executionId: string;
  timestamp: Date;
  data: any;
}

export interface StepEvent {
  type: 'step-started' | 'step-completed' | 'step-failed';
  workflowId: string;
  executionId: string;
  stepId: string;
  timestamp: Date;
  data: any;
}

export interface MetricsEvent {
  type: 'metrics-updated';
  timestamp: Date;
  data: {
    activeExecutions: number;
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    resourceUsage: {
      cpu: number;
      memory: number;
    };
  };
}

export interface WebSocketMessage {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
}

export interface ClientSubscription {
  clientId: string;
  workflowIds: string[];
  eventTypes: string[];
}

export type RealtimeEvent = WorkflowEvent | StepEvent | MetricsEvent;
