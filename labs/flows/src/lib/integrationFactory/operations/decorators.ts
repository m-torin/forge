// decorators.ts
import { CacheConfig, FactoryError, ErrorCode, ErrorSeverity, wrapError } from '../core';
import type { OperationContext, CloudOperationOptions } from './types';
import { createOperationFactory, type OperationFactory } from './factory';

class FactoryManager {
  private static instance?: OperationFactory;

  static getFactory(): OperationFactory {
    if (!this.instance) {
      this.instance = createOperationFactory();
    }
    return this.instance;
  }

  static async setFactory(factory: OperationFactory): Promise<void> {
    if (this.instance) {
      await this.instance.dispose();
    }
    this.instance = factory;
  }

  static async reset(): Promise<void> {
    if (this.instance) {
      await this.instance.dispose();
      delete this.instance;
    }
  }
}

export const getOperationFactory = (): OperationFactory =>
  FactoryManager.getFactory();

export const setOperationFactory = async (
  factory: OperationFactory,
): Promise<void> => FactoryManager.setFactory(factory);

export const resetFactory = async (): Promise<void> => FactoryManager.reset();

export const CloudOperation = (
  options: CloudOperationOptions = {},
): MethodDecorator => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ): TypedPropertyDescriptor<any> => {
    const originalMethod = descriptor.value;
    const factory = getOperationFactory();

    descriptor.value = async function (...args: unknown[]) {
      const service = options.service || this.constructor.name;
      const name = options.name || propertyKey.toString();

      const operation = factory.createOperation(
        name,
        service,
        async (context: OperationContext) => {
          if (!originalMethod) {
            throw new FactoryError(
              'Method implementation missing',
              ErrorCode.INVALID_STATE,
              ErrorSeverity.HIGH,
            );
          }

          if (context.signal?.aborted) {
            throw new FactoryError(
              'Operation aborted',
              ErrorCode.ABORTED,
              ErrorSeverity.MEDIUM,
            );
          }

          return wrapError(
            async () => originalMethod.apply(this, [...args, context]),
            ErrorCode.OPERATION,
            {
              ...context.metadata,
              className: this.constructor.name,
              methodName: propertyKey.toString(),
            },
            context.signal,
          );
        },
        options,
      );

      return operation.execute();
    };

    return descriptor;
  };
};

export const WithTimeout = (ms: number): MethodDecorator =>
  CloudOperation({ timeout: ms });

export const WithRetries = (count: number): MethodDecorator =>
  CloudOperation({ retries: count });

export const WithCache = (key: string, ttl: number = 300): MethodDecorator => {
  const cache: CacheConfig = {
    enabled: true,
    key,
    ttl,
  };

  return CloudOperation({ cache });
};

export const composeDecorators = (
  ...decorators: MethodDecorator[]
): MethodDecorator => {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) =>
    decorators.reduceRight(
      (desc, decorator) => decorator(target, propertyKey, desc) ?? desc,
      descriptor,
    );
};
