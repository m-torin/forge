// aws.ts - Provides AWS service integration with the factory system
import { mapAWSErrorToFactoryError } from '../core/awsErrorMapper';
import type { OperationContext } from '../operations';
import { flowbuilderOperation } from './flowbuilder';

// Configuration types for AWS commands
export interface AWSCommandOptions {
  /** Optional timeout override in ms */
  timeout?: number;
  /** Optional retry count override */
  retries?: number;
  /** AWS-specific command options */
  awsOptions?: Record<string, unknown>;
  /** Additional metadata to include */
  metadata?: Record<string, unknown>;
  /** Cache configuration if needed */
  cache?: {
    enabled: boolean;
    ttl: number;
    key: string;
  };
}

// AWS metadata structure for type safety
interface AWSMetadata {
  aws: {
    service: string;
    operation: string;
    region?: string;
    requestId?: string;
    attempts?: number;
  };
  awsOptions?: Record<string, unknown>;
}

/**
 * Creates a wrapped AWS command with middleware support
 */
export const createAWSCommand = <
  TInput,
  TOutput,
  TClient extends {
    config: {
      region?: string;
      [key: string]: any;
    };
    send: (
      command: any,
      options?: { abortSignal?: AbortSignal },
    ) => Promise<any>;
  },
>(
  serviceName: string,
  operationName: string,
  CommandClass: new (input: TInput) => any,
  client: TClient,
  defaultConfig?: AWSCommandOptions,
): ((input: TInput, options?: AWSCommandOptions) => Promise<TOutput>) => {
  // Validate required parameters
  if (!serviceName || !operationName) {
    throw new Error('Service and operation names are required');
  }

  // Create immutable default config
  const frozenDefaultConfig = Object.freeze({ ...defaultConfig });

  // Create the operation with middleware support
  const operation = flowbuilderOperation<TInput, TOutput>(
    `${serviceName}/${operationName}`,
    async (input: TInput, context: OperationContext): Promise<TOutput> => {
      const command = new CommandClass(input);

      // Merge AWS options with abort signal
      const awsOptions = Object.freeze({
        abortSignal: context.signal,
        ...(context.metadata?.awsOptions as Record<string, unknown>),
      });

      // Initialize AWS metadata safely
      const contextMetadata = context.metadata as Record<string, unknown> &
        Partial<AWSMetadata>;
      contextMetadata.aws = {
        service: serviceName,
        operation: operationName,
        ...(client.config.region && { region: client.config.region }),
      };

      try {
        const result = await client.send(command, awsOptions);

        // Update AWS metadata safely
        const awsMetadata = contextMetadata.aws as AWSMetadata['aws'];
        if (result.$metadata) {
          awsMetadata.requestId = result.$metadata.requestId;
          awsMetadata.attempts = result.$metadata.attempts;
        }

        return result as TOutput;
      } catch (error) {
        throw mapAWSErrorToFactoryError(
          error,
          serviceName,
          operationName,
          context.metadata,
        );
      }
    },
    frozenDefaultConfig,
  );

  // Return the wrapped command function
  return async (
    input: TInput,
    options?: AWSCommandOptions,
  ): Promise<TOutput> => {
    const _config = Object.freeze({
      ...frozenDefaultConfig,
      ...options,
      metadata: {
        ...(frozenDefaultConfig?.metadata || {}),
        ...(options?.metadata || {}),
        awsOptions: options?.awsOptions,
        aws: {
          service: serviceName,
          operation: operationName,
          region: client.config.region,
        },
      },
    });

    const result = await operation.execute(input);

    if (!result.success || result.error || result.data === undefined) {
      throw result.error || new Error('Operation failed without error details');
    }

    return result.data;
  };
};
