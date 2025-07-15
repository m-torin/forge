/**
 * Workflow Step Factory System
 *
 * Export all step factory functionality including the core factory,
 * step templates, and utility functions.
 */

// Simple function-based API (recommended for new code)
export { createStep, createStepWithValidation, toSimpleStep } from './step-factory';

// Legacy complex API (for backward compatibility)
export {
  StandardWorkflowStep,
  StepFactory,
  createWorkflowStep,
  defaultStepFactory,
  matchError,
  when,
} from './step-factory';

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
export type { SimpleWorkflowStep, StepExecutionResult } from './step-factory/step-types';
// Export individual modules for granular access
export * as StepTypes from './step-factory/step-types';
export * as StepValidation from './step-factory/step-validation';

// Step registry exports
export { StepRegistry, defaultStepRegistry } from './step-registry';

export type {
  StepCompositionConfig,
  StepDependencyNode,
  StepExecutionPlan,
  StepRegistryEntry,
  StepSearchFilters,
} from './step-registry';

// Step templates exports
export {
  ConditionalInputSchema,
  ConditionalOutputSchema,
  DataTransformationInputSchema,
  DataTransformationOutputSchema,
  DatabaseQueryInputSchema,
  DatabaseQueryOutputSchema,
  FileProcessingInputSchema,
  FileProcessingOutputSchema,
  HttpRequestInputSchema,
  HttpRequestOutputSchema,
  NotificationInputSchema,
  NotificationOutputSchema,
  StepTemplates,
  createConditionalStep,
  createDataTransformationStep,
  createDatabaseQueryStep,
  createDelayStep,
  createFileProcessingStep,
  createHttpRequestStep,
  createNotificationStep,
} from './step-templates';

export type {
  ConditionalInput,
  ConditionalOutput,
  DataTransformationInput,
  DataTransformationOutput,
  DatabaseQueryInput,
  DatabaseQueryOutput,
  FileProcessingInput,
  FileProcessingOutput,
  HttpRequestInput,
  HttpRequestOutput,
  NotificationInput,
  NotificationOutput,
  StepTemplateType,
} from './step-templates';
