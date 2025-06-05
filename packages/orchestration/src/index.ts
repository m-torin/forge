/**
 * Orchestration Package - Main exports
 * This package provides workflow orchestration capabilities using various providers
 */

// Re-export everything from shared
export * from './shared/index';

// Re-export providers
export * from './providers/index';

// Re-export convenience functions from server
export { createWorkflowEngine, workflowEngine } from './server';

// Re-export client utilities
export { createWorkflowClient, WorkflowClient, workflowClient } from './client';
export type { WorkflowClientConfig } from './client';

// Re-export Next.js integrations
export * from './client-next';
export * from './server-next';
