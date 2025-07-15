// src/integrations/aws/s3/client.ts

/**
 * AWS S3 Client Module
 *
 * This module provides standardized AWS S3 command implementations with built-in
 * validation, error handling, and middleware support through the Flowbuilder integration factory.
 * It leverages TypeScript's strong typing to ensure type safety and robustness.
 */

import crypto from 'crypto'; // Ensure crypto is imported for UUID generation
import { s3Client } from '../awsClients';
import {
  type OperationContext,
  type WrapperConfig,
} from '#/lib/integrationFactory';
import { S3ValidationOptions, validateS3Input } from './validation';
import {
  S3ErrorCode,
  createS3ValidationError,
  mapS3Error,
  isRetryableS3Error, // Imported function to check retryable errors
  S3FactoryError,
} from './errors';

/**
 * TelemetryOptions Interface
 *
 * Defines the structure for telemetry configuration within S3CommandOptions.
 */
export interface TelemetryOptions {
  enabled: boolean;
  attributes: string[];
  // Add other telemetry-related properties as needed
}

/**
 * S3CommandOptions Type
 *
 * Extends WrapperConfig with additional properties specific to S3 commands.
 */
export type S3CommandOptions = Partial<WrapperConfig> & {
  validation?: Partial<S3ValidationOptions>;
  multipart?: {
    partSize?: number;
    queueSize?: number;
    leavePartsOnError?: boolean;
  };
  checksum?: {
    algorithm?: string;
    enabled?: boolean;
  };
  signal?: AbortSignal; // Added Property for AbortController integration
  telemetry?: TelemetryOptions; // Added Property for Telemetry configuration
};

/**
 * Default Retry Strategy for S3 Operations
 *
 * Defines the default retry behavior for S3 commands.
 */
export const DEFAULT_S3_RETRY_STRATEGY = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  shouldRetry: (error: unknown): boolean => {
    // Updated to accept 'unknown'
    if (error instanceof S3FactoryError) {
      return isRetryableS3Error(error);
    }
    return false;
  },
};

/**
 * SECURITY_OPERATION_DEFAULTS Configuration
 *
 * Default configurations for security-related S3 operations.
 */
const SECURITY_OPERATION_DEFAULTS: S3CommandOptions = {
  timeout: 12_000, // 12 seconds
  retries: 3,
  telemetry: {
    enabled: true,
    attributes: ['Bucket'],
  },
  validation: {
    security: {
      validateKmsKey: true,
      enforceSSE: true,
      allowedPrincipals: process.env.AWS_ACCOUNT_ID ? [`arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/S3AccessRole`] : [],
    },
  },
  checksum: {
    enabled: false,
  },
};

/**
 * OBJECT_OPERATION_DEFAULTS Configuration
 *
 * Default configurations for object-related S3 operations.
 */
export const OBJECT_OPERATION_DEFAULTS: S3CommandOptions = {
  timeout: 30_000, // 30 seconds
  retries: 3,
  validation: {
    object: {
      maxSize: 5 * 1024 * 1024 * 1024, // 5GB
      validateChecksum: true,
      enforceEncryption: true,
      allowedContentTypes: ['image/png', 'application/pdf'],
      requiredMetadata: ['author', 'version'],
    },
  },
  telemetry: {
    enabled: true,
    attributes: ['Bucket', 'Key'],
  },
  checksum: {
    enabled: true,
    algorithm: 'SHA256',
  },
};

/**
 * MULTIPART_OPERATION_DEFAULTS Configuration
 *
 * Default configurations for multipart upload S3 operations.
 */
export const MULTIPART_OPERATION_DEFAULTS: S3CommandOptions = {
  timeout: 3600_000, // 1 hour
  retries: 5,
  multipart: {
    partSize: 5 * 1024 * 1024, // 5MB
    queueSize: 4,
    leavePartsOnError: false,
  },
  validation: {
    multipart: {
      minPartSize: 5 * 1024 * 1024, // 5MB
      validatePartNumbers: true,
      maxParts: 10000,
    },
  },
  telemetry: {
    enabled: true,
    attributes: ['Bucket', 'Key', 'UploadId'],
  },
  checksum: {
    enabled: true,
    algorithm: 'SHA256',
  },
};

/**
 * BUCKET_OPERATION_DEFAULTS Configuration
 *
 * Default configurations for bucket-related S3 operations.
 */
export const BUCKET_OPERATION_DEFAULTS: S3CommandOptions = {
  timeout: 45_000, // 45 seconds
  retries: 2,
  validation: {
    bucket: {
      validateTags: true,
      requireEncryption: true,
      namePattern: /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/,
      maxNameLength: 63,
      allowedRegions: ['us-east-1', 'us-west-2'],
    },
  },
  telemetry: {
    enabled: true,
    attributes: ['Bucket'],
  },
  checksum: {
    enabled: false,
  },
};

/**
 * createS3Command Function
 *
 * Creates a standardized S3 command with built-in validation and error handling.
 *
 * @param operationName - The name of the S3 operation.
 * @param CommandClass - The AWS SDK command class.
 * @param defaultConfig - The default configuration for the command.
 * @returns A function to execute the S3 command.
 */
export const createS3Command = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
  defaultConfig?: S3CommandOptions,
) => {
  if (!operationName) {
    throw new Error('Operation name is required');
  }

  return async (
    input: TInput,
    options: S3CommandOptions = {},
  ): Promise<TOutput> => {
    const context: OperationContext = {
      id: crypto.randomUUID(),
      name: operationName,
      service: 's3',
      attempt: 1,
      startTime: Date.now(),
      signal: options.signal || new AbortController().signal,
      metadata: {
        bucket: (input as any).Bucket,
        key: (input as any).Key,
        uploadId: (input as any).UploadId,
        validation: options.validation,
        multipart: options.multipart,
        checksum: options.checksum,
        telemetry: options.telemetry,
        timestamp: new Date().toISOString(),
      },
    };

    // Merge defaultConfig with options
    const mergedOptions: S3CommandOptions = {
      ...defaultConfig,
      ...options,
      validation: {
        ...defaultConfig?.validation,
        ...options.validation,
      },
      multipart: {
        ...defaultConfig?.multipart,
        ...options.multipart,
      },
      checksum: {
        ...defaultConfig?.checksum,
        ...options.checksum,
      },
      // telemetry: {
      //   ...defaultConfig?.telemetry,
      //   ...options.telemetry,
      // },
    };

    // Validate input
    const validationResult = validateS3Input(
      input,
      operationName,
      mergedOptions.validation,
      context,
    );

    if (!validationResult.valid) {
      throw createS3ValidationError(
        `Validation failed for ${operationName}: ${validationResult.errors.map((e) => e.message).join('; ')}`,
        S3ErrorCode.VALIDATION_ERROR,
        operationName,
        {
          ...validationResult.metadata,
        },
      );
    }

    try {
      const command = new CommandClass(input);
      const result = await s3Client.send(command, {
        abortSignal: context.signal,
      });
      return result as TOutput;
    } catch (error) {
      const mappedError = mapS3Error(error, operationName, context.metadata);
      if (mappedError) {
        throw mappedError;
      }
      throw error;
    }
  };
};

/**
 * createObjectCommand Function
 *
 * Helper to create object-related S3 commands with predefined defaults.
 *
 * @param operationName - The name of the S3 object operation.
 * @param CommandClass - The AWS SDK object command class.
 * @returns A function to execute the object S3 command.
 */
export const createObjectCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
) =>
  createS3Command<TInput, TOutput>(
    operationName,
    CommandClass,
    OBJECT_OPERATION_DEFAULTS,
  );

/**
 * createBucketCommand Function
 *
 * Helper to create bucket-related S3 commands with predefined defaults.
 *
 * @param operationName - The name of the S3 bucket operation.
 * @param CommandClass - The AWS SDK bucket command class.
 * @returns A function to execute the bucket S3 command.
 */
export const createBucketCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
) =>
  createS3Command<TInput, TOutput>(
    operationName,
    CommandClass,
    BUCKET_OPERATION_DEFAULTS,
  );

/**
 * createMultipartCommand Function
 *
 * Helper to create multipart-related S3 commands with predefined defaults.
 *
 * @param operationName - The name of the S3 multipart operation.
 * @param CommandClass - The AWS SDK multipart command class.
 * @returns A function to execute the multipart S3 command.
 */
export const createMultipartCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
) =>
  createS3Command<TInput, TOutput>(
    operationName,
    CommandClass,
    MULTIPART_OPERATION_DEFAULTS,
  );

/**
 * createSecurityCommand Function
 *
 * Helper to create security-related S3 commands with predefined defaults.
 *
 * @param operationName - The name of the S3 security operation.
 * @param CommandClass - The AWS SDK security command class.
 * @returns A function to execute the security S3 command.
 */
export const createSecurityCommand = <TInput, TOutput>(
  operationName: string,
  CommandClass: new (input: TInput) => any,
) =>
  createS3Command<TInput, TOutput>(
    operationName,
    CommandClass,
    SECURITY_OPERATION_DEFAULTS,
  );
