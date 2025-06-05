/**
 * Orchestration Package - Main exports
 * This package provides workflow orchestration capabilities using various providers
 */

// Re-export everything from shared
export * from './shared/index.js';

// Re-export providers
export * from './providers/index.js';

// Re-export convenience functions from server
export { createWorkflowEngine, workflowEngine } from './server.js';

// Re-export client utilities
export { createWorkflowClient, WorkflowClient, workflowClient } from './client.js';
export type { WorkflowClientConfig } from './client.js';

// Re-export Next.js integrations
export * from './client-next.js';
export * from './server-next.js';