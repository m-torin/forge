'use client';

// Export types
export * from './types';

// Export registry functionality
export * from './registry';

// Export validation utilities
export * from './validation';

// Export core form functionality - exclude createZodResolver to avoid conflict
export {
  useFormWithRegistry,
  FormProvider,
  useFormContext,
  useFieldValidation,
  createFormContext,
  createDependencyGraph
} from './core';

// Export async validation
export * from './async-validation';

// Export form stepper
export * from './form-stepper';

// Export components
export * from './components';

// Export examples
export * as Examples from './examples';

// Re-export renamed functions to avoid breaking changes
export { createZodResolver as zodResolver } from './validation';
export { createFieldIndex } from './registry';
// createFormContext and createDependencyGraph are already exported from ./core
