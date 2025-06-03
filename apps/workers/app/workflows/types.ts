// Workflow type definitions
export interface WorkflowDefinition {
  defaultPayload: any;
  metadata: {
    id: string;
    title: string;
    description: string;
    difficulty?: string;
    estimatedTime?: string;
    features?: string[];
    tags?: string[];
    color?: string;
  };
  workflow: (context: any) => Promise<any>;
}

export interface WorkflowStep {
  config: Record<string, any>;
  id: string;
  name: string;
  type: 'action' | 'condition' | 'parallel' | 'loop';
}

export interface WorkflowContext<T = any> {
  env: Record<string, string>;
  requestPayload: T;
  workflowRunId: string;
}

export interface WorkflowResult {
  data?: any;
  error?: string;
  success: boolean;
}
