/**
 * Workflow Definitions Registry
 * 
 * This module exports all workflow definitions available in the workers app.
 * Each workflow definition includes:
 * - The workflow handler function imported from @repo/orchestration
 * - Local metadata and configuration
 * - Default payloads for testing
 * - Input/output schemas for validation
 */

import { workflowDefinition as basicWorkflow } from './basic/definition';
import { workflowDefinition as kitchenSinkWorkflow } from './kitchen-sink/definition';
import { workflowDefinition as imageProcessingWorkflow } from './image-processing/definition';

// Export individual workflow definitions
export { basicWorkflow, kitchenSinkWorkflow, imageProcessingWorkflow };

// Export as a registry for easy iteration
export const workflowRegistry = {
  'basic-workflow': basicWorkflow,
  'kitchen-sink-workflow': kitchenSinkWorkflow,
  'image-processing-workflow': imageProcessingWorkflow,
} as const;

// Export workflow IDs for type safety
export type WorkflowId = keyof typeof workflowRegistry;

// Helper to get workflow by ID
export function getWorkflowDefinition(id: WorkflowId) {
  return workflowRegistry[id];
}

// Helper to list all workflows
export function listWorkflows() {
  return Object.values(workflowRegistry).map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    category: workflow.metadata.category,
    tags: workflow.metadata.tags,
    icon: workflow.metadata.icon,
    color: workflow.metadata.color,
    estimatedDuration: workflow.metadata.estimatedDuration,
  }));
}

// Helper to get workflows by category
export function getWorkflowsByCategory(category: string) {
  return Object.values(workflowRegistry).filter(
    workflow => workflow.metadata.category === category
  );
}

// Helper to get workflows by tag
export function getWorkflowsByTag(tag: string) {
  return Object.values(workflowRegistry).filter(
    workflow => workflow.metadata.tags.includes(tag)
  );
}

// Categories for grouping workflows in UI
export const workflowCategories = {
  examples: {
    name: 'Examples',
    description: 'Example workflows demonstrating various features',
    icon: '📚',
  },
  media: {
    name: 'Media Processing',
    description: 'Workflows for processing images, videos, and other media',
    icon: '🎬',
  },
  data: {
    name: 'Data Processing',
    description: 'ETL, data transformation, and analytics workflows',
    icon: '📊',
  },
  integration: {
    name: 'Integrations',
    description: 'Workflows that integrate with external services',
    icon: '🔌',
  },
} as const;

// Export type for workflow definition
export type WorkflowDefinition = typeof basicWorkflow;