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
    tags: ['task-queue', 'background-jobs', 'batch-processing'],
    icon: '📋',
    color: '#3B82F6', // blue
    estimatedDuration: '30-60 seconds',
    features: [
      'Sequential processing',
      'Parallel task execution',
      'Priority-based sorting',
      'Approval gates',
      'Validation checks',
      'Error handling with retries'
    ]
  },
  
  // Default payload for testing/examples
  defaultPayload: {
    name: 'Sample Task Processing',
    requiresApproval: false,
    requiresValidation: true,
    tasks: [
      { id: 'task-1', priority: 10, data: { type: 'process', value: 'High priority item' } },
      { id: 'task-2', priority: 5, data: { type: 'validate', value: 'Medium priority item' } },
      { id: 'task-3', priority: 8, data: { type: 'transform', value: 'Another high priority' } },
      { id: 'task-4', priority: 3, data: { type: 'archive', value: 'Low priority item' } },
      { id: 'task-5', priority: 7, data: { type: 'notify', value: 'Medium-high priority' } }
    ]
  } satisfies BasicWorkflowPayload,
  
  // Configuration for the workflow runtime
  config: {
    retries: 3,
    timeout: 300, // 5 minutes
    queueConcurrency: 10,
    enableDeduplication: true
  },
  
  // Input validation schema (for UI forms)
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name for this task processing job',
        default: 'Task Processing Job'
      },
      requiresApproval: {
        type: 'boolean',
        description: 'Whether tasks require manual approval before processing',
        default: false
      },
      requiresValidation: {
        type: 'boolean',
        description: 'Enable validation checks (resources, quality, security)',
        default: true
      },
      tasks: {
        type: 'array',
        description: 'List of tasks to process',
        minItems: 1,
        items: {
          type: 'object',
          required: ['id', 'priority', 'data'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique task identifier'
            },
            priority: {
              type: 'number',
              description: 'Task priority (higher = more important)',
              minimum: 1,
              maximum: 10
            },
            data: {
              type: 'object',
              description: 'Task-specific data payload'
            }
          }
        }
      },
      dedupId: {
        type: 'string',
        description: 'Optional deduplication ID to prevent duplicate executions'
      }
    },
    required: ['tasks']
  }
};

// Export the type for use in other parts of the app
export type BasicWorkflowDefinition = typeof workflowDefinition;