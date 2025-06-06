import { basicWorkflow } from '@repo/orchestration/examples';

export interface BasicPayload {
  batchSize: number;
  name: string;
  requiresApproval: boolean;
  requiresValidation: boolean;
  taskId: string;
  tasks: {
    id: string;
    data: any;
    priority: number;
  }[];
}

interface WorkflowDefinition {
  defaultPayload: BasicPayload;
  metadata: {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    features: string[];
    tags: string[];
    color?: string;
  };
  workflow: (context: any) => Promise<any>;
}

const basicDefinition: WorkflowDefinition = {
  defaultPayload: {
    requiresValidation: true,
    name: 'Enhanced Basic Processing',
    batchSize: 5,
    requiresApproval: false,
    taskId: `task-${Date.now()}`,
    tasks: [
      { id: '1', data: { test: true }, priority: 5 },
      { id: '2', data: { name: 'task2' }, priority: 3 },
    ],
  },
  metadata: {
    id: 'basic',
    color: 'blue',
    description: 'Essential workflow pattern with validation, batch processing, and error handling',
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    features: [
      'Input validation with custom logic',
      'Batch processing with configurable size',
      'Detailed progress tracking',
      'Comprehensive error handling',
      'Task prioritization',
      'Optional approval steps',
    ],
    tags: ['demo', 'batch', 'validation'],
    title: 'Basic Workflow',
  },
  workflow: async (context: any) => {
    return await basicWorkflow(context);
  },
};

export default basicDefinition;
