/**
 * Step Factory Module Exports
 *
 * Central export point for all step factory components after modularization.
 */

// Export types from step-types
export type {
  NonEmptyArray,
  StepId,
  ExecutionId,
  ProgressState,
  ErrorCode,
  StepExecutionConfig,
  StepValidationConfig,
  ValidationResult,
  StepMetadata,
  StepPerformanceData,
  StepExecutionContext,
  StepExecutionResult,
  StepExecutionFunction,
  WorkflowStepDefinition,
  StepFactoryConfig,
} from './step-types';

// Export validation functions
export { validateStepInput, validateStepOutput, validateStepDefinition } from './step-validation';

// Export performance monitoring functions
export {
  initializePerformanceData,
  updatePerformanceData,
  createProgressReporter,
  addCustomMetric,
  calculatePerformanceStats,
  formatPerformanceData,
} from './step-performance';

// Re-export everything from the main step-factory module
export {
  createWorkflowStep,
  StandardWorkflowStep,
  StepFactory,
  defaultStepFactory,
  matchError,
  when,
} from '../step-factory';
