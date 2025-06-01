import { basicWorkflow, type BasicWorkflowPayload } from '@repo/orchestration';

/**
 * Basic Workflow Definition
 *
 * This local definition wraps the basic workflow from @repo/orchestration
 * and provides app-specific metadata and default payload configuration.
 *
 * Features:
 * - Sequential steps and parallel processing
 * - Priority-based task sorting with batch processing
 * - Enhanced context with utilities and deduplication
 * - Simple approval workflows with waitForEvent
 * - Parallel validation checks (inventory, fraud detection)
 * - Automatic retries and comprehensive error handling
 */

export const workflowDefinition = {
  id: 'basic-workflow',
  name: 'Basic Task Processing Workflow',
  description: 'Demonstrates core Upstash Workflow patterns with enhanced utilities',
  version: '1.0.0',

  // Import the workflow function from @repo/orchestration
  handler: basicWorkflow,

  // Metadata for UI/documentation
  metadata: {
    category: 'examples',
    color: '#3B82F6', // blue
    estimatedDuration: '30-60 seconds',
    features: [
      'Sequential processing',
      'Parallel task execution',
      'Priority-based sorting',
      'Approval gates',
      'Validation checks',
      'Error handling with retries',
    ],
    icon: '📋',
    tags: ['task-queue', 'background-jobs', 'batch-processing'],
  },

  // Default payload for testing/examples
  defaultPayload: {
    requiresValidation: true,
    name: 'Sample Task Processing',
    requiresApproval: false,
    tasks: [
      { id: 'task-1', data: { type: 'process', value: 'High priority item' }, priority: 10 },
      { id: 'task-2', data: { type: 'validate', value: 'Medium priority item' }, priority: 5 },
      { id: 'task-3', data: { type: 'transform', value: 'Another high priority' }, priority: 8 },
      { id: 'task-4', data: { type: 'archive', value: 'Low priority item' }, priority: 3 },
      { id: 'task-5', data: { type: 'notify', value: 'Medium-high priority' }, priority: 7 },
    ],
  } satisfies BasicWorkflowPayload,

  // Configuration for the workflow runtime
  config: {
    enableDeduplication: true,
    queueConcurrency: 10,
    retries: 3,
    timeout: 300, // 5 minutes
  },

  // Input validation schema (for UI forms)
  inputSchema: {
    type: 'object',
    properties: {
      requiresValidation: {
        type: 'boolean',
        default: true,
        description: 'Enable validation checks (resources, quality, security)',
      },
      name: {
        type: 'string',
        default: 'Task Processing Job',
        description: 'Name for this task processing job',
      },
      dedupId: {
        type: 'string',
        description: 'Optional deduplication ID to prevent duplicate executions',
      },
      requiresApproval: {
        type: 'boolean',
        default: false,
        description: 'Whether tasks require manual approval before processing',
      },
      tasks: {
        type: 'array',
        description: 'List of tasks to process',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique task identifier',
            },
            data: {
              type: 'object',
              description: 'Task-specific data payload',
            },
            priority: {
              type: 'number',
              description: 'Task priority (higher = more important)',
              maximum: 10,
              minimum: 1,
            },
          },
          required: ['id', 'priority', 'data'],
        },
        minItems: 1,
      },
    },
    required: ['tasks'],
  },
};

// Export the type for use in other parts of the app
export type BasicWorkflowDefinition = typeof workflowDefinition;
