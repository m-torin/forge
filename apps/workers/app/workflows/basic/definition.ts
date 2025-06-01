import { basicWorkflow } from '@repo/orchestration/examples';

import { wrapWorkflow } from '../workflow-wrapper';

import type { WorkflowDefinition } from '../types';

const definition: WorkflowDefinition = {
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

  workflow: wrapWorkflow(basicWorkflow),
};

export default definition;
