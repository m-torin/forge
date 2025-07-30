// index.ts

export * from './core';

export type {
  OperationContext,
  OperationResult,
  OperationOptions,
  OperationExecutor,
  CloudOperationOptions,
} from './operations/types';

export { OperationBuilder, createOperation } from './operations/builder';

export {
  OperationFactory,
  createOperationFactory,
  type FactoryOptions,
} from './operations/factory';

export {
  CloudOperation,
  WithTimeout,
  WithRetries,
  WithCache,
  composeDecorators,
  getOperationFactory,
  setOperationFactory,
} from './operations/decorators';

export { createAWSCommand, flowbuilderOperation } from './wrappers';
