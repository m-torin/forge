/**
 * Workflow Step Factory System
 *
 * Export all step factory functionality including the core factory,
 * step templates, and utility functions.
 */

// Simple function-based API (recommended for new code)
export { createStep, createStepWithValidation } from './step-factory';

// Enhancer functions from separate module
export {
  withStepMonitoring,
  withStepRetry,
  withStepCircuitBreaker,
  withStepTimeout,
  compose,
} from './step-factory-enhancers';

// Legacy complex API (for backward compatibility)
export {
  createWorkflowStep,
  StandardWorkflowStep,
  StepFactory,
  defaultStepFactory,
  matchError,
  when,
} from './step-factory';

// Simple API types
export type { SimpleWorkflowStep, StepExecutionResult } from './step-factory/step-types';

// Legacy API types
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
  StepExecutionFunction,
  WorkflowStepDefinition,
  StepFactoryConfig,
} from './step-factory';

// Export individual modules for granular access
export * as StepTypes from './step-factory/step-types';
export * as StepValidation from './step-factory/step-validation';
export * as StepPerformance from './step-factory/step-performance';

// Step templates exports
export {
  StepTemplates,
  createHttpRequestStep,
  createDatabaseQueryStep,
  createFileProcessingStep,
  createNotificationStep,
  createDataTransformationStep,
  createConditionalStep,
  createDelayStep,
  HttpRequestInputSchema,
  HttpRequestOutputSchema,
  DatabaseQueryInputSchema,
  DatabaseQueryOutputSchema,
  FileProcessingInputSchema,
  FileProcessingOutputSchema,
  NotificationInputSchema,
  NotificationOutputSchema,
  DataTransformationInputSchema,
  DataTransformationOutputSchema,
  ConditionalInputSchema,
  ConditionalOutputSchema,
} from './step-templates';

export type {
  StepTemplateType,
  HttpRequestInput,
  HttpRequestOutput,
  DatabaseQueryInput,
  DatabaseQueryOutput,
  FileProcessingInput,
  FileProcessingOutput,
  NotificationInput,
  NotificationOutput,
  DataTransformationInput,
  DataTransformationOutput,
  ConditionalInput,
  ConditionalOutput,
} from './step-templates';

// Step registry exports
export { StepRegistry, defaultStepRegistry } from './step-registry';

export type {
  StepRegistryEntry,
  StepSearchFilters,
  StepCompositionConfig,
  StepDependencyNode,
  StepExecutionPlan,
} from './step-registry';
