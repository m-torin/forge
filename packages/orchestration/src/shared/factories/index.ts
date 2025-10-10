/**
 * Workflow Step Factory System
 *
 * Export all step factory functionality including the core factory,
 * step templates, and utility functions.
 */

// Simple function-based API (recommended for new code)
export { createStep, createStepWithValidation, toSimpleStep } from './step-factory';

// Legacy complex API (for backward compatibility)
export { StepFactory, createWorkflowStep } from './step-factory';

// Legacy API types
export type {
  StepExecutionContext,
  ValidationResult,
  WorkflowStepDefinition,
} from './step-factory';

// Enhancer functions from separate module
export {
  compose,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from './step-factory-enhancers';

export * as StepPerformance from './step-factory/step-performance';

// Simple API types
export type { StepExecutionResult } from './step-factory/step-types';
// Export individual modules for granular access
export * as StepTypes from './step-factory/step-types';
export * as StepValidation from './step-factory/step-validation';

// Step registry exports
export { StepRegistry } from './step-registry';

export type { StepCompositionConfig, StepExecutionPlan, StepSearchFilters } from './step-registry';

// Step templates exports
export { StepTemplates } from './step-templates';
