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

import basicWorkflow from './basic/definition';
import imageProcessingWorkflow from './image-processing/definition';
import importExternalMediaWorkflow from './import-external-media/definition';
import kitchenSinkWorkflow from './kitchen-sink/definition';

// Export individual workflow definitions
export { basicWorkflow, imageProcessingWorkflow, importExternalMediaWorkflow, kitchenSinkWorkflow };

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
