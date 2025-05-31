import type { WorkflowContext } from '@upstash/workflow';

/**
 * Workflow definition for self-contained workflows
 */
export interface WorkflowDefinition {
  // Metadata
  metadata: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    color?: string;
    icon?: string;
    features: string[];
  };
  
  // Default payload example
  defaultPayload: Record<string, any>;
  
  // The workflow implementation
  workflow: (context: WorkflowContext<any>) => Promise<any>;
  
  // Optional server action for direct execution
  action?: (payload: any) => Promise<any>;
}