// operations/index.ts

// Builder
export { OperationBuilder, createOperation } from './builder';

// Decorators
export {
  CloudOperation,
  WithTimeout,
  WithRetries,
  WithCache,
  composeDecorators,
  getOperationFactory,
  setOperationFactory,
  resetFactory,
} from './decorators';

// Factory
export { OperationFactory, createOperationFactory } from './factory';
export type { FactoryOptions } from './factory';

// Types
export type {
  OperationContext,
  OperationOptions,
  OperationResult,
  OperationExecutor,
  OperationMiddleware,
} from './types';
