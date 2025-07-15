/**
 * Step Factory Module Exports
 *
 * Central export point for all step factory components after modularization.
 */

// Re-export everything from the main step-factory module
export {
  StandardWorkflowStep,
  StepFactory,
  createWorkflowStep,
  defaultStepFactory,
  matchError,
  when,
} from '../step-factory';

// Export performance monitoring functions
export {
  addCustomMetric,
  calculatePerformanceStats,
  createProgressReporter,
  formatPerformanceData,
  initializePerformanceData,
  updatePerformanceData,
} from './step-performance';

// Export types from step-types
export type {
  ErrorCode,
  ExecutionId,
  NonEmptyArray,
  ProgressState,
  StepExecutionConfig,
  StepExecutionContext,
  StepExecutionFunction,
  StepExecutionResult,
  StepFactoryConfig,
  StepId,
  StepMetadata,
  StepPerformanceData,
  StepValidationConfig,
  ValidationResult,
  WorkflowStepDefinition,
} from './step-types';

// Export validation functions
export { validateStepDefinition, validateStepInput, validateStepOutput } from './step-validation';
