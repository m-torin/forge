// src/integrations/aws/sqs/errors.ts

import {
  ErrorCode,
  ErrorSeverity,
  FactoryError,
  AWSFactoryError,
  RetryableError,
  ErrorMetadata,
  RetryStrategy,
  Metadata,
} from '#/lib/integrationFactory';

/**
 * SQS-specific error codes that extend the base error codes
 */
export enum SQSErrorCode {
  // Message Validation Errors
  MESSAGE_TOO_LARGE = 'SQS_MESSAGE_TOO_LARGE',
  MESSAGE_INVALID_FORMAT = 'SQS_MESSAGE_INVALID_FORMAT',
  MESSAGE_MISSING_REQUIRED = 'SQS_MESSAGE_MISSING_REQUIRED',
  MESSAGE_NOT_IN_FLIGHT = 'SQS_MESSAGE_NOT_IN_FLIGHT',

  // Batch Operation Errors
  BATCH_SIZE_EXCEEDED = 'SQS_BATCH_SIZE_EXCEEDED',
  BATCH_ENTRY_INVALID = 'SQS_BATCH_ENTRY_INVALID',
  BATCH_ID_DUPLICATED = 'SQS_BATCH_ID_DUPLICATED',

  // Queue Configuration Errors
  QUEUE_INVALID_NAME = 'SQS_QUEUE_INVALID_NAME',
  QUEUE_ATTRIBUTES_INVALID = 'SQS_QUEUE_ATTRIBUTES_INVALID',
  QUEUE_PERMISSION_INVALID = 'SQS_QUEUE_PERMISSION_INVALID',

  // Visibility Timeout Errors
  VISIBILITY_TIMEOUT_INVALID = 'SQS_VISIBILITY_TIMEOUT_INVALID',
  VISIBILITY_TIMEOUT_EXCEEDED = 'SQS_VISIBILITY_TIMEOUT_EXCEEDED',
  VISIBILITY_TIMEOUT_INCONSISTENT = 'SQS_VISIBILITY_TIMEOUT_INCONSISTENT',

  // Resource Limit Errors
  QUEUE_LIMIT_EXCEEDED = 'SQS_QUEUE_LIMIT_EXCEEDED',
  THROUGHPUT_EXCEEDED = 'SQS_THROUGHPUT_EXCEEDED',

  // Security & Authentication Errors
  KMS_KEY_DISABLED = 'SQS_KMS_KEY_DISABLED',
  KMS_KEY_INVALID = 'SQS_KMS_KEY_INVALID',
  POLICY_INVALID = 'SQS_POLICY_INVALID',

  // Policy Validation Errors
  POLICY_INVALID_FORMAT = 'SQS_POLICY_INVALID_FORMAT',
  POLICY_INVALID_ACCESS = 'SQS_POLICY_INVALID_ACCESS',
  POLICY_STATEMENTS_INVALID = 'SQS_POLICY_STATEMENTS_INVALID',

  // FIFO Queue Errors
  MESSAGE_GROUP_ID_REQUIRED = 'SQS_MESSAGE_GROUP_ID_REQUIRED',
  MESSAGE_DEDUPLICATION_ID_REQUIRED = 'SQS_MESSAGE_DEDUPLICATION_ID_REQUIRED',
  CONTENT_BASED_DEDUPLICATION_REQUIRED = 'SQS_CONTENT_BASED_DEDUPLICATION_REQUIRED',
  QUEUE_FIFONAME_INVALID = 'SQS_QUEUE_FIFONAME_INVALID',

  // Tag Validation Errors
  TAG_KEY_INVALID = 'SQS_TAG_KEY_INVALID',
  TAG_VALUE_INVALID = 'SQS_TAG_VALUE_INVALID',
  TAG_KEY_FORMAT_INVALID = 'SQS_TAG_KEY_FORMAT_INVALID',
  TAG_VALUE_EMPTY = 'SQS_TAG_VALUE_EMPTY',

  // Redrive Policy Errors
  REDRIVE_POLICY_INVALID = 'SQS_REDRIVE_POLICY_INVALID',
  MAX_RECEIVE_COUNT_INVALID = 'SQS_MAX_RECEIVE_COUNT_INVALID',
  REDRIVE_POLICY_STRUCTURE_INVALID = 'SQS_REDRIVE_POLICY_STRUCTURE_INVALID',

  // Message Body Validation Errors
  MESSAGE_BODY_INVALID = 'SQS_MESSAGE_BODY_INVALID',

  // Encryption Errors
  ENCRYPTION_NOT_ENABLED = 'SQS_ENCRYPTION_NOT_ENABLED',

  // KMS Key Errors
  KMS_KEY_INVALID_FORMAT = 'SQS_KMS_KEY_INVALID_FORMAT',

  // General Validation Errors
  GENERAL_VALIDATION_ERROR = 'SQS_GENERAL_VALIDATION_ERROR',
  QUEUE_TAG_INVALID_KEY = 'QUEUE_TAG_INVALID_KEY',
  QUEUE_TAG_INVALID_VALUE = 'QUEUE_TAG_INVALID_VALUE',
  MESSAGE_ATTRIBUTE_INVALID_KEY = 'MESSAGE_ATTRIBUTE_INVALID_KEY',
  MESSAGE_ATTRIBUTE_INVALID_TYPE = 'MESSAGE_ATTRIBUTE_INVALID_TYPE',
  QUEUE_ATTRIBUTE_DISALLOWED = 'QUEUE_ATTRIBUTE_DISALLOWED',
}
/**
 * SQS-specific metadata interface extending the base ErrorMetadata
 */
export interface SQSErrorMetadata extends ErrorMetadata {
  sqsErrorCode: SQSErrorCode;
  queueUrl?: string;
  queueArn?: string;
  messageId?: string;
  batchId?: string;
  receiptHandle?: string;
  requestId?: string;
  retryAttempt?: number;
  timestamp: string; // Ensures timestamp is always present
  region?: string;
  accountId?: string;
}

/**
 * Retry strategy configuration for SQS errors
 */
export interface SQSRetryStrategy extends RetryStrategy {
  maxAttempts: number;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  shouldRetry: (error: FactoryError) => boolean;
}

/**
 * Default retry strategy for SQS operations
 */
export const DEFAULT_SQS_RETRY_STRATEGY: SQSRetryStrategy = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  shouldRetry: (error: FactoryError) => {
    if (error instanceof SQSFactoryError) {
      return isRetryableSQSError(error);
    }
    return false;
  },
};

/**
 * Creates an SQS-specific factory error with retry capabilities
 */
export class SQSFactoryError extends AWSFactoryError implements RetryableError {
  readonly retryStrategy: SQSRetryStrategy;

  constructor(
    message: string,
    code: ErrorCode,
    operation: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: SQSErrorMetadata,
    cause?: Error,
    retryStrategy: SQSRetryStrategy = DEFAULT_SQS_RETRY_STRATEGY,
  ) {
    const finalMetadata: SQSErrorMetadata = {
      timestamp: new Date().toISOString(),
      ...metadata,
      sqsErrorCode:
        metadata?.sqsErrorCode || SQSErrorCode.GENERAL_VALIDATION_ERROR,
    };

    super(message, code, 'sqs', operation, severity, finalMetadata, cause);
    this.retryStrategy = retryStrategy;
  }

  /**
   * Determines if this error can be retried
   */
  get canRetry(): boolean {
    const attempts = (this.metadata as SQSErrorMetadata).retryAttempt || 0;
    return (
      attempts < this.retryStrategy.maxAttempts &&
      this.retryStrategy.shouldRetry(this)
    );
  }

  /**
   * Gets the delay before the next retry attempt
   */
  get retryDelay(): number {
    const attempts = (this.metadata as SQSErrorMetadata).retryAttempt || 0;
    const delay = Math.min(
      this.retryStrategy.baseDelay * Math.pow(2, attempts),
      this.retryStrategy.maxDelay,
    );
    return delay + Math.random() * 100; // Add jitter
  }

  /**
   * Adds SQS-specific properties to JSON representation
   */
  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      ...super.toJSON(),
      queueUrl: (this.metadata as SQSErrorMetadata)?.queueUrl,
      sqsErrorCode: (this.metadata as SQSErrorMetadata)?.sqsErrorCode,
      retryAttempt: (this.metadata as SQSErrorMetadata)?.retryAttempt,
      canRetry: this.canRetry,
      retryDelay: this.retryDelay,
    });
  }
}

/**
 * Maps AWS errors to SQS factory errors with proper retry handling
 */
export const mapSQSError = (
  error: any,
  operation: string,
  metadata?: Metadata,
): SQSFactoryError | undefined => {
  // Early return if error is already a factory error
  if (error instanceof FactoryError) {
    return undefined;
  }

  // Extract AWS request metadata
  const awsMetadata: Partial<SQSErrorMetadata> = {
    ...metadata,
    requestId: error.$metadata?.requestId,
    region: error.$metadata?.region,
    accountId: error.$metadata?.accountId,
  };

  // Helper function to create error with consistent retry strategy
  const createError = (
    message: string,
    code: ErrorCode,
    sqsErrorCode: SQSErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ): SQSFactoryError => {
    return new SQSFactoryError(
      message,
      code,
      operation,
      severity,
      {
        ...awsMetadata,
        sqsErrorCode,
        timestamp: awsMetadata.timestamp || new Date().toISOString(), // Ensure timestamp is set
      },
      error instanceof Error ? error : undefined,
      DEFAULT_SQS_RETRY_STRATEGY,
    );
  };

  // Map SQS error codes with proper retry configuration
  switch (error.name || error.code) {
    // Queue Existence Errors
    case 'QueueDoesNotExist':
    case 'AWS.SimpleQueueService.NonExistentQueue':
      return createError(
        `Queue ${awsMetadata.queueUrl} does not exist`,
        ErrorCode.NOT_FOUND,
        SQSErrorCode.QUEUE_INVALID_NAME,
        ErrorSeverity.HIGH,
      );

    // Message State Errors
    case 'MessageNotInflight':
    case 'AWS.SimpleQueueService.InvalidMessageState':
      return createError(
        'Message is not available for processing',
        ErrorCode.INVALID_STATE,
        SQSErrorCode.MESSAGE_NOT_IN_FLIGHT,
      );

    // Batch Processing Errors
    case 'AWS.SimpleQueueService.TooManyEntriesInBatchRequest':
    case 'BatchRequestTooLong':
      return createError(
        'Batch size exceeds service limits',
        ErrorCode.VALIDATION,
        SQSErrorCode.BATCH_SIZE_EXCEEDED,
      );

    // Message Size Errors
    case 'MessageTooLong':
    case 'AWS.SimpleQueueService.MessageTooLong':
      return createError(
        'Message size exceeds the 256 KB limit',
        ErrorCode.VALIDATION,
        SQSErrorCode.MESSAGE_TOO_LARGE,
      );

    // Batch Entry Errors
    case 'AWS.SimpleQueueService.BatchEntryIdsNotDistinct':
      return createError(
        'Batch contains duplicate message IDs',
        ErrorCode.VALIDATION,
        SQSErrorCode.BATCH_ID_DUPLICATED,
      );

    // Visibility Timeout Errors
    case 'AWS.SimpleQueueService.InvalidVisibilityTimeout':
      return createError(
        'Invalid visibility timeout value',
        ErrorCode.VALIDATION,
        SQSErrorCode.VISIBILITY_TIMEOUT_INVALID,
      );

    // Queue Attribute Errors
    case 'AWS.SimpleQueueService.InvalidAttributeName':
    case 'AWS.SimpleQueueService.InvalidAttributeValue':
      return createError(
        'Invalid queue attribute configuration',
        ErrorCode.VALIDATION,
        SQSErrorCode.QUEUE_ATTRIBUTES_INVALID,
        ErrorSeverity.HIGH,
      );

    // KMS Errors
    case 'AWS.SimpleQueueService.KmsKeyDisabled':
      return createError(
        'KMS key is disabled',
        ErrorCode.CONNECTION,
        SQSErrorCode.KMS_KEY_DISABLED,
        ErrorSeverity.HIGH,
      );

    // Throughput Errors
    case 'AWS.SimpleQueueService.ThrottlingError':
    case 'ThrottlingException':
      return createError(
        'Operation throttled due to exceeded throughput',
        ErrorCode.RATE_LIMIT,
        SQSErrorCode.THROUGHPUT_EXCEEDED,
      );

    // Queue Limits
    case 'AWS.SimpleQueueService.QueueLimitExceeded':
      return createError(
        'Account queue limit exceeded',
        ErrorCode.RESOURCE_EXHAUSTED,
        SQSErrorCode.QUEUE_LIMIT_EXCEEDED,
        ErrorSeverity.HIGH,
      );

    // Policy Errors
    case 'AWS.SimpleQueueService.InvalidPolicy':
      return createError(
        'Invalid queue policy document',
        ErrorCode.VALIDATION,
        SQSErrorCode.POLICY_INVALID,
        ErrorSeverity.HIGH,
      );

    // Return undefined for unhandled errors
    default:
      return undefined;
  }
};

/**
 * Determines if an error is a retryable SQS error
 */
export const isRetryableSQSError = (error: unknown): boolean => {
  if (!(error instanceof SQSFactoryError)) {
    return false;
  }

  const nonRetryableCodes = new Set([
    SQSErrorCode.MESSAGE_TOO_LARGE,
    SQSErrorCode.QUEUE_INVALID_NAME,
    SQSErrorCode.POLICY_INVALID,
    SQSErrorCode.KMS_KEY_INVALID,
    SQSErrorCode.BATCH_ID_DUPLICATED,
    SQSErrorCode.POLICY_INVALID_FORMAT,
    SQSErrorCode.POLICY_INVALID_ACCESS,
    SQSErrorCode.POLICY_STATEMENTS_INVALID,
    SQSErrorCode.CONTENT_BASED_DEDUPLICATION_REQUIRED,
    SQSErrorCode.MESSAGE_GROUP_ID_REQUIRED,
    SQSErrorCode.MESSAGE_DEDUPLICATION_ID_REQUIRED,
    SQSErrorCode.TAG_KEY_INVALID,
    SQSErrorCode.TAG_VALUE_INVALID,
    SQSErrorCode.TAG_KEY_FORMAT_INVALID,
    SQSErrorCode.TAG_VALUE_EMPTY,
    SQSErrorCode.REDRIVE_POLICY_INVALID,
    SQSErrorCode.QUEUE_FIFONAME_INVALID,
    SQSErrorCode.MESSAGE_BODY_INVALID,
    SQSErrorCode.ENCRYPTION_NOT_ENABLED,
    SQSErrorCode.VISIBILITY_TIMEOUT_INCONSISTENT,
    SQSErrorCode.KMS_KEY_INVALID_FORMAT,
  ]);

  return !nonRetryableCodes.has(
    (error.metadata as SQSErrorMetadata)?.sqsErrorCode,
  );
};

/**
 * Helper to create an SQS validation error
 */
export const createSQSValidationError = (
  message: string,
  sqsErrorCode: SQSErrorCode,
  operation: string,
  metadata?: Omit<SQSErrorMetadata, 'sqsErrorCode' | 'timestamp'>, // Omit to enforce inclusion
): SQSFactoryError => {
  return new SQSFactoryError(
    message,
    ErrorCode.VALIDATION,
    operation,
    ErrorSeverity.MEDIUM,
    {
      ...metadata,
      sqsErrorCode,
      timestamp: new Date().toISOString(), // Ensure timestamp is set
    },
  );
};
