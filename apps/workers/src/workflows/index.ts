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
import { workflowDefinition as imageProcessingWorkflow } from './image-processing/definition';
import { workflowDefinition as importExternalMediaWorkflow } from './import-external-media/definition';
import { workflowDefinition as kitchenSinkWorkflow } from './kitchen-sink/definition';

// Export individual workflow definitions
export { basicWorkflow, imageProcessingWorkflow, importExternalMediaWorkflow, kitchenSinkWorkflow };

// Export as a registry for easy iteration
export const workflowRegistry = {
  'basic-workflow': basicWorkflow,
  'image-processing-workflow': imageProcessingWorkflow,
  'import-external-media-workflow': importExternalMediaWorkflow,
  'kitchen-sink-workflow': kitchenSinkWorkflow,
} as const;

// Export workflow IDs for type safety
export type WorkflowId = keyof typeof workflowRegistry;

// Helper to get workflow by ID
export function getWorkflowDefinition(id: WorkflowId) {
  return workflowRegistry[id];
}

// Helper to list all workflows
export function listWorkflows() {
  return Object.values(workflowRegistry).map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    category: workflow.metadata.category,
    color: workflow.metadata.color,
    description: workflow.description,
    estimatedDuration: workflow.metadata.estimatedDuration,
    icon: workflow.metadata.icon,
    tags: workflow.metadata.tags,
  }));
}

// Helper to get workflows by category
export function getWorkflowsByCategory(category: string) {
  return Object.values(workflowRegistry).filter(
    (workflow) => workflow.metadata.category === category,
  );
}

// Helper to get workflows by tag
export function getWorkflowsByTag(tag: string) {
  return Object.values(workflowRegistry).filter((workflow) => workflow.metadata.tags.includes(tag));
}

// Categories for grouping workflows in UI
export const workflowCategories = {
  data: {
    name: 'Data Processing',
    description: 'ETL, data transformation, and analytics workflows',
    icon: '📊',
  },
  examples: {
    name: 'Examples',
    description: 'Example workflows demonstrating various features',
    icon: '📚',
  },
  integration: {
    name: 'Integrations',
    description: 'Workflows that integrate with external services',
    icon: '🔌',
  },
  media: {
    name: 'Media Processing',
    description: 'Workflows for processing images, videos, and other media',
    icon: '🎬',
  },
} as const;

// Export type for workflow definition
export type WorkflowDefinition = typeof basicWorkflow;
