// client.ts
import { sqsClient } from '../awsClients';
import {
  createAWSCommand,
  type OperationContext,
  type WrapperConfig,
} from '#/lib/integrationFactory';
import { SQSValidationOptions, validateSQSInput } from './validation';
import { SQSErrorCode, createSQSValidationError } from './errors';
import { randomUUID } from 'crypto';

/**
 * Extended options for SQS commands, combining base wrapper config with SQS-specific validation
 * @typedef {Object} SQSCommandOptions
 * @extends {Partial<WrapperConfig>}
 */
export type SQSCommandOptions = Partial<WrapperConfig> & {
  validation?: Partial<SQSValidationOptions>;
  telemetry?: {
    enabled?: boolean;
    attributes?: string[];
    [key: string]: unknown;
  };
};

// Type-safe client definition matching the constraint
type AWSSendable = {
  config: {
    region?: string;
    [key: string]: any;
  };
  send: (command: any, options?: { abortSignal?: AbortSignal }) => Promise<any>;
};

/**
 * Creates a standardized SQS command with built-in validation, error handling, and middleware support.
 * Leverages factory defaults for cross-cutting concerns while adding SQS-specific functionality.
 *
 * @template TInput - The input type for the SQS operation
 * @template TOutput - The expected output type from the SQS operation
 * @param {string} operationName - The name of the SQS operation (e.g., 'SendMessage')
 * @param {new (input: TInput) => any} CommandClass - The AWS SDK command class
 * @param {SQSCommandOptions} [defaultConfig] - Optional default configuration
 * @returns {(input: TInput, options?: SQSCommandOptions) => Promise<TOutput>}
 *
 * @example
 * ```typescript
 * const SendMessageCommand = createSQSCommand<SendMessageCommandInput, SendMessageCommandOutput>(
 *   'SendMessage',
 *   AWSSendMessageCommand,
 *   {
 *     timeout: 15000,
 *     cache: { ttl: 60 }
 *   }
 * );
 * ```
 */
export const createSQSCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
  defaultConfig?: SQSCommandOptions,
): ((input: TInput, options?: SQSCommandOptions) => Promise<TOutput>) => {
  // Validate required parameters
  if (!operationName) {
    throw new Error('Operation name is required');
  }

  // Create the base AWS command with SQS-specific defaults
  const command = createAWSCommand<TInput, TOutput, AWSSendable>(
    'sqs',
    operationName,
    CommandClass,
    sqsClient as AWSSendable,
    {
      // Let factory handle most middleware defaults
      ...defaultConfig,
      metadata: {
        service: 'sqs',
        operation: operationName,
        version: process.env.SERVICE_VERSION,
      },
    },
  );

  /**
   * Wrapped command function that adds SQS-specific validation and error handling
   * while delegating core functionality to the factory.
   *
   * @param {TInput} input - The input parameters for the SQS operation
   * @param {SQSCommandOptions} [options] - Optional runtime configuration
   * @returns {Promise<TOutput>} The result of the SQS operation
   * @throws {SQSValidationError} When validation fails or SQS-specific errors occur
   */
  return async (
    input: TInput,
    options: SQSCommandOptions = {},
  ): Promise<TOutput> => {
    // Create complete operation context
    const context: OperationContext = {
      id: randomUUID(),
      name: operationName,
      service: 'sqs',
      attempt: 1,
      signal: new AbortController().signal,
      startTime: Date.now(),
      metadata: {
        validation: options.validation,
        timestamp: new Date().toISOString(),
      },
    };

    // Perform SQS-specific input validation
    const validationResult = validateSQSInput(
      input,
      operationName,
      options.validation,
      context,
    );

    // Handle validation failures with specific error details
    if (!validationResult.valid) {
      throw createSQSValidationError(
        `Validation failed: ${validationResult.errors.map((e) => e.message).join('; ')}`,
        SQSErrorCode.GENERAL_VALIDATION_ERROR,
        operationName,
        { metadata: validationResult.metadata },
      );
    }

    // Execute command with merged context and options
    return command(input, {
      ...options,
      metadata: {
        ...context.metadata,
        ...options.metadata,
      },
    });
  };
};

/**
 * Usage Examples:
 *
 * @example
 * // Create a command with custom configuration
 * const SendMessageCommand = createSQSCommand<SendMessageCommandInput, SendMessageCommandOutput>(
 *   'SendMessage',
 *   AWSSendMessageCommand,
 *   {
 *     timeout: 15000,
 *     cache: {
 *       ttl: 60,
 *       key: 'sqs:message:{queueUrl}'
 *     }
 *   }
 * );
 *
 * @example
 * // Use the command with runtime options
 * const result = await SendMessageCommand(
 *   {
 *     QueueUrl: 'my-queue',
 *     MessageBody: 'hello'
 *   },
 *   {
 *     timeout: 5000,
 *     validation: {
 *       message: {
 *         maxSize: 262144 // 256 KB
 *       }
 *     }
 *   }
 * );
 */
