import { basicWorkflow } from '@repo/orchestration/examples';
import type { WorkflowDefinition } from '../types';

const definition: WorkflowDefinition = {
  metadata: {
    id: 'basic',
    title: 'Basic Workflow',
    description: 'Essential workflow pattern with validation, batch processing, and error handling',
    tags: ['demo', 'batch', 'validation'],
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    color: 'blue',
    features: [
      'Input validation with custom logic',
      'Batch processing with configurable size',
      'Detailed progress tracking',
      'Comprehensive error handling',
      'Task prioritization',
      'Optional approval steps',
    ],
  },
  
  defaultPayload: {
    requiresValidation: true,
    name: 'Enhanced Basic Processing',
    batchSize: 5,
    requiresApproval: false,
    taskId: `task-${Date.now()}`,
    tasks: [
      { id: '1', data: { type: 'urgent' }, priority: 10 },
      { id: '2', data: { type: 'normal' }, priority: 5 },
      { id: '3', data: { type: 'batch' }, priority: 8 },
    ],
  },
  
  workflow: basicWorkflow,
};

export default definition;