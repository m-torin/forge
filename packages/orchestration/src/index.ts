/**
 * Orchestration Package - Main exports
 * This package provides workflow orchestration capabilities using various providers
 * 
 * For environment-specific imports, use:
 * - @repo/orchestration/client - Client-side only
 * - @repo/orchestration/server - Server-side only
 * - @repo/orchestration/client/next - Next.js client features
 * - @repo/orchestration/server/next - Next.js server features
 */

// Only export core shared types that are needed across all environments
export type {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowStep,
  WorkflowStepStatus,
  WorkflowContext,
  WorkflowError,
  WorkflowProvider,
  OrchestrationError,
} from './shared/types/index';

// Export shared utilities that are environment-agnostic
export {
  createOrchestrationError,
  isOrchestrationError,
  OrchestrationErrorCodes,
} from './shared/utils/errors';

// Export validation utilities
export {
  validateWorkflowDefinition,
  validateWorkflowStep,
} from './shared/utils/validation';
