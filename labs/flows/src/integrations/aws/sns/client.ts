// src/integrations/aws/sns/client.ts

import { snsClient } from '../awsClients';
import {
  createAWSCommand,
  type OperationContext,
  type WrapperConfig,
} from '#/lib/integrationFactory';
import { SNSValidationOptions, validateSNSInput } from './validation';
import {
  SNSErrorCode,
  SNSErrorMetadata,
  createSNSValidationError,
  mapSNSError,
} from './errors';
import { randomUUID } from 'crypto';

/**
 * Extended options for SNS commands, combining base wrapper config with SNS-specific options
 */
export type SNSCommandOptions = WrapperConfig & {
  signal?: AbortSignal;
  validation?: SNSValidationOptions;
  telemetry?: {
    enabled?: boolean;
    attributes?: string[];
    [key: string]: unknown;
  };
};

// Type-safe client definition
type AWSSendable = {
  config: {
    region?: string;
    [key: string]: any;
  };
  send: (command: any, options?: { abortSignal?: AbortSignal }) => Promise<any>;
};

/**
 * Creates a standardized SNS command with built-in validation, error handling, and middleware support.
 */
export const createSNSCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
  defaultConfig?: SNSCommandOptions,
): ((input: TInput, options?: SNSCommandOptions) => Promise<TOutput>) => {
  // Validate required parameters
  if (!operationName) {
    throw new Error('Operation name is required');
  }

  // Create the base AWS command with SNS-specific defaults
  const command = createAWSCommand<TInput, TOutput, AWSSendable>(
    'sns',
    operationName,
    CommandClass,
    snsClient as AWSSendable,
    {
      ...defaultConfig,
      metadata: {
        service: 'sns',
        operation: operationName,
        version: process.env.SERVICE_VERSION,
      },
    },
  );

  /**
   * Wrapped command function that adds SNS-specific validation and error handling
   */
  return async (
    input: TInput,
    options: SNSCommandOptions = {},
  ): Promise<TOutput> => {
    // Create operation context
    const context: OperationContext = {
      id: randomUUID(),
      name: operationName,
      service: 'sns',
      attempt: 1,
      signal: options.signal || new AbortController().signal,
      startTime: Date.now(),
      metadata: {
        validation: options.validation,
        timestamp: new Date().toISOString(),
      },
    };

    // Perform SNS-specific input validation
    const validationResult = validateSNSInput(
      input,
      operationName,
      options.validation,
      context,
    );

    if (!validationResult.valid) {
      throw createSNSValidationError(
        `Validation failed: ${validationResult.errors.map((e: SNSErrorMetadata) => e.message).join('; ')}`,
        SNSErrorCode.GENERAL_VALIDATION_ERROR,
        operationName,
        { metadata: validationResult.metadata },
      );
    }

    try {
      // Execute command with merged context and options
      return await command(input, {
        ...options,
        metadata: {
          ...context.metadata,
          ...options.metadata,
        },
      });
    } catch (error) {
      // Map AWS errors to our domain errors
      if (error instanceof Error) {
        const mappedError = mapSNSError(error, operationName, {
          topicArn: (input as any).TopicArn,
          messageId: (input as any).MessageId,
          ...context.metadata,
        });

        if (mappedError) {
          throw mappedError;
        }
      }
      throw error;
    }
  };
};

// Default configurations for different operation types
export const MESSAGE_OPERATION_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 15_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    bucketSize: 100,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10000,
  },
  validation: {
    message: {
      validateStructure: true,
      validateAttributes: true,
    },
  },
};

export const BATCH_OPERATION_DEFAULTS: Partial<SNSCommandOptions> = {
  ...MESSAGE_OPERATION_DEFAULTS,
  timeout: 30_000,
  retries: 5,
  validation: {
    message: {
      validateStructure: true,
      validateAttributes: true,
    },
    topic: {
      validateName: true,
      fifo: false,
    },
  },
};

export const TOPIC_MANAGEMENT_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 30_000,
  retries: 2,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 25,
    resetTimeout: 60000,
    bucketSize: 100,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10000,
  },
  validation: {
    topic: {
      validateName: true,
      validateAttributes: true,
    },
  },
};

// Helper functions for creating commands with specific defaults
export const createMessageCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
) =>
  createSNSCommand<TInput, TOutput>(
    operationName,
    CommandClass,
    MESSAGE_OPERATION_DEFAULTS,
  );

export const createBatchCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
) =>
  createSNSCommand<TInput, TOutput>(
    operationName,
    CommandClass,
    BATCH_OPERATION_DEFAULTS,
  );

export const createTopicCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
) =>
  createSNSCommand<TInput, TOutput>(
    operationName,
    CommandClass,
    TOPIC_MANAGEMENT_DEFAULTS,
  );
