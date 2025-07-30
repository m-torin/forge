// src/integrations/aws/eventbridge/client.ts

import { eventBridgeClient } from '../awsClients';
import {
  createAWSCommand,
  type OperationContext,
  type WrapperConfig,
} from '#/lib/integrationFactory';
import {
  EventBridgeValidationOptions,
  validateEventBridgeInput,
} from './validation';
import {
  EventBridgeErrorCode,
  createEventBridgeValidationError,
  EventBridgeErrorMetadata,
} from './errors';
import { randomUUID } from 'crypto';

/**
 * Extended options for EventBridge commands, combining base wrapper config with EventBridge-specific validation.
 */
export type EventBridgeCommandOptions = Partial<WrapperConfig> & {
  /**
   * Optional validation configurations specific to EventBridge operations.
   */
  validation?: Partial<EventBridgeValidationOptions>;

  /**
   * Optional telemetry configurations for tracking and monitoring.
   */
  telemetry?: {
    enabled?: boolean;
    attributes?: string[];
    [key: string]: unknown;
  };
};

/**
 * Type-safe client definition matching the constraint.
 * Represents the AWS SDK client with necessary configurations.
 */
type AWSSendable = {
  config: {
    region?: string;
    [key: string]: any;
  };
  send: (command: any, options?: { abortSignal?: AbortSignal }) => Promise<any>;
};

/**
 * Creates a standardized EventBridge command with built-in validation, error handling, and middleware support.
 * Leverages factory defaults for cross-cutting concerns while adding EventBridge-specific functionality.
 *
 * @template TInput - The input type for the EventBridge operation.
 * @template TOutput - The expected output type from the EventBridge operation.
 * @param {string} operationName - The name of the EventBridge operation (e.g., 'PutEvents').
 * @param {new (input: TInput) => any} CommandClass - The AWS SDK command class.
 * @param {EventBridgeCommandOptions} [defaultConfig] - Optional default configuration.
 * @returns {(input: TInput, options?: EventBridgeCommandOptions) => Promise<TOutput>}
 *   A function that executes the configured EventBridge command.
 *
 * @example
 * ```typescript
 * const PutEventsCommand = createEventBridgeCommand<PutEventsCommandInput, PutEventsCommandOutput>(
 *   'PutEvents',
 *   AWSEventBridgePutEventsCommand,
 *   {
 *     timeout: 15000,
 *     cache: { ttl: 60 },
 *   }
 * );
 * ```
 */
export const createEventBridgeCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
  defaultConfig?: EventBridgeCommandOptions,
): ((
  input: TInput,
  options?: EventBridgeCommandOptions,
) => Promise<TOutput>) => {
  // Validate that the operation name is provided.
  if (!operationName) {
    throw new Error('Operation name is required');
  }

  // Create the base AWS command with EventBridge-specific defaults.
  const command = createAWSCommand<TInput, TOutput, AWSSendable>(
    'eventbridge',
    operationName,
    CommandClass,
    eventBridgeClient as AWSSendable,
    {
      // Merge default configurations; factory handles most middleware defaults.
      ...defaultConfig,
      metadata: {
        service: 'eventbridge',
        operation: operationName,
        version: process.env.SERVICE_VERSION,
      },
    },
  );

  /**
   * Wrapped command function that adds EventBridge-specific validation and error handling
   * while delegating core functionality to the factory.
   *
   * @param {TInput} input - The input parameters for the EventBridge operation.
   * @param {EventBridgeCommandOptions} [options] - Optional runtime configuration.
   * @returns {Promise<TOutput>} - The result of the EventBridge operation.
   * @throws {EventBridgeFactoryError} - When validation fails or EventBridge-specific errors occur.
   */
  return async (
    input: TInput,
    options: EventBridgeCommandOptions = {},
  ): Promise<TOutput> => {
    // Create a complete operation context with a unique ID and initial metadata.
    const context: OperationContext = {
      id: randomUUID(),
      name: operationName,
      service: 'eventbridge',
      attempt: 1,
      signal: new AbortController().signal,
      startTime: Date.now(),
      metadata: {
        validation: options.validation,
        timestamp: new Date().toISOString(),
      },
    };

    /**
     * Perform EventBridge-specific input validation.
     * Throws an error if validation fails.
     */
    const validationResult = validateEventBridgeInput(
      input,
      operationName,
      options.validation,
      context,
    );

    // Handle validation failures by throwing a structured validation error.
    if (!validationResult.valid) {
      throw createEventBridgeValidationError(
        `Validation failed: ${validationResult.errors
          .map((e: EventBridgeErrorMetadata) => e.message)
          .join('; ')}`,
        EventBridgeErrorCode.GENERAL_VALIDATION_ERROR, // Replaced VALIDATION_ERROR with existing enum member.
        operationName,
        { metadata: validationResult.metadata },
      );
    }

    /**
     * Execute the AWS command with merged context and options.
     * The factory's middleware pipeline handles the execution flow.
     */
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
 * // Create a command with custom configuration.
 * const PutEventsCommand = createEventBridgeCommand<PutEventsCommandInput, PutEventsCommandOutput>(
 *   'PutEvents',
 *   AWSEventBridgePutEventsCommand,
 *   {
 *     timeout: 15000,
 *     cache: {
 *       ttl: 60,
 *       key: 'eventbridge:event:{eventBusName}',
 *     },
 *   }
 * );
 *
 * @example
 * // Use the command with runtime options.
 * const result = await PutEventsCommand(
 *   {
 *     Entries: [{
 *       Source: 'my-application',
 *       DetailType: 'order.created',
 *       Detail: JSON.stringify({ orderId: '123' }),
 *       EventBusName: 'my-event-bus',
 *     }],
 *   },
 *   {
 *     timeout: 5000,
 *     validation: {
 *       putEvents: {
 *         validateEventSize: true,
 *         validateEventPattern: true,
 *       },
 *     },
 *     telemetry: {
 *       enabled: true,
 *       attributes: ['orderId', 'source'],
 *     },
 *   }
 * );
 */
