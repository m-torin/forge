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
  compose,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from './step-factory-enhancers';

// Legacy complex API (for backward compatibility)
export {
  createWorkflowStep,
  defaultStepFactory,
  matchError,
  StandardWorkflowStep,
  StepFactory,
  when,
} from './step-factory';

// Simple API types
export type { SimpleWorkflowStep, StepExecutionResult } from './step-factory/step-types';

// Legacy API types
export type {
  ErrorCode,
  ExecutionId,
  NonEmptyArray,
  ProgressState,
  StepExecutionConfig,
  StepExecutionContext,
  StepExecutionFunction,
  StepFactoryConfig,
  StepId,
  StepMetadata,
  StepPerformanceData,
  StepValidationConfig,
  ValidationResult,
  WorkflowStepDefinition,
} from './step-factory';

// Export individual modules for granular access
export * as StepTypes from './step-factory/step-types';
export * as StepValidation from './step-factory/step-validation';
export * as StepPerformance from './step-factory/step-performance';

// Step templates exports
export {
  ConditionalInputSchema,
  ConditionalOutputSchema,
  createConditionalStep,
  createDatabaseQueryStep,
  createDataTransformationStep,
  createDelayStep,
  createFileProcessingStep,
  createHttpRequestStep,
  createNotificationStep,
  DatabaseQueryInputSchema,
  DatabaseQueryOutputSchema,
  DataTransformationInputSchema,
  DataTransformationOutputSchema,
  FileProcessingInputSchema,
  FileProcessingOutputSchema,
  HttpRequestInputSchema,
  HttpRequestOutputSchema,
  NotificationInputSchema,
  NotificationOutputSchema,
  StepTemplates,
} from './step-templates';

export type {
  ConditionalInput,
  ConditionalOutput,
  DatabaseQueryInput,
  DatabaseQueryOutput,
  DataTransformationInput,
  DataTransformationOutput,
  FileProcessingInput,
  FileProcessingOutput,
  HttpRequestInput,
  HttpRequestOutput,
  NotificationInput,
  NotificationOutput,
  StepTemplateType,
} from './step-templates';

// Step registry exports
export { defaultStepRegistry, StepRegistry } from './step-registry';

export type {
  StepCompositionConfig,
  StepDependencyNode,
  StepExecutionPlan,
  StepRegistryEntry,
  StepSearchFilters,
} from './step-registry';
