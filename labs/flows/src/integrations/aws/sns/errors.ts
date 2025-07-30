// src/integrations/aws/sns/errors.ts

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
 * SNS-specific error codes extending base error codes
 */
export enum SNSErrorCode {
  // Message Validation Errors
  MESSAGE_TOO_LARGE = 'SNS_MESSAGE_TOO_LARGE',
  MESSAGE_INVALID_FORMAT = 'SNS_MESSAGE_INVALID_FORMAT',
  MESSAGE_GROUP_ID_REQUIRED = 'SNS_MESSAGE_GROUP_ID_REQUIRED',
  MESSAGE_DEDUPLICATION_REQUIRED = 'SNS_MESSAGE_DEDUPLICATION_REQUIRED',
  MESSAGE_ATTRIBUTES_INVALID = 'SNS_MESSAGE_ATTRIBUTES_INVALID',

  // Topic Management Errors
  TOPIC_NAME_INVALID = 'SNS_TOPIC_NAME_INVALID',
  TOPIC_NOT_FOUND = 'SNS_TOPIC_NOT_FOUND',
  TOPIC_LIMIT_EXCEEDED = 'SNS_TOPIC_LIMIT_EXCEEDED',
  TOPIC_DELETED = 'SNS_TOPIC_DELETED',
  TOPIC_POLICY_INVALID = 'SNS_TOPIC_POLICY_INVALID',

  // Subscription Errors
  SUBSCRIPTION_INVALID = 'SNS_SUBSCRIPTION_INVALID',
  SUBSCRIPTION_LIMIT_EXCEEDED = 'SNS_SUBSCRIPTION_LIMIT_EXCEEDED',
  SUBSCRIPTION_PROTOCOL_INVALID = 'SNS_SUBSCRIPTION_PROTOCOL_INVALID',
  SUBSCRIPTION_PENDING = 'SNS_SUBSCRIPTION_PENDING',
  SUBSCRIPTION_DELETED = 'SNS_SUBSCRIPTION_DELETED',

  // FIFO Topic Errors
  FIFO_TOPIC_NAME_INVALID = 'SNS_FIFO_TOPIC_NAME_INVALID',
  FIFO_CONTENT_DEDUP_DISABLED = 'SNS_FIFO_CONTENT_DEDUP_DISABLED',
  FIFO_MESSAGE_GROUP_REQUIRED = 'SNS_FIFO_MESSAGE_GROUP_REQUIRED',

  // Permission Errors
  PERMISSION_INVALID = 'SNS_PERMISSION_INVALID',
  PERMISSION_DENIED = 'SNS_PERMISSION_DENIED',
  POLICY_ATTRIBUTE_INVALID = 'SNS_POLICY_ATTRIBUTE_INVALID',

  // Rate Limiting & Throttling
  THROTTLING_EXCEEDED = 'SNS_THROTTLING_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'SNS_RATE_LIMIT_EXCEEDED',

  // General Errors
  GENERAL_VALIDATION_ERROR = 'SNS_GENERAL_VALIDATION_ERROR',
  INTERNAL_ERROR = 'SNS_INTERNAL_ERROR',
  INVALID_PARAMETER = 'SNS_INVALID_PARAMETER',
  INVALID_SECURITY_TOKEN = 'SNS_INVALID_SECURITY_TOKEN',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
}

/**
 * SNS-specific error metadata interface
 */
export interface SNSErrorMetadata extends ErrorMetadata {
  snsErrorCode: SNSErrorCode;
  topicArn?: string;
  messageId?: string;
  subscriptionArn?: string;
  timestamp: string;
  region?: string;
  accountId?: string;
  requestId?: string;
  retryAttempt?: number;
}

/**
 * SNS-specific retry strategy configuration
 */
export interface SNSRetryStrategy extends RetryStrategy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: FactoryError) => boolean;
}

/**
 * Default retry strategy for SNS operations
 */
export const DEFAULT_SNS_RETRY_STRATEGY: Readonly<SNSRetryStrategy> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  shouldRetry: (error: FactoryError) => {
    if (error instanceof SNSFactoryError) {
      return isRetryableSNSError(error);
    }
    return false;
  },
} as const;

/**
 * SNS-specific factory error with retry capabilities
 */
export class SNSFactoryError extends AWSFactoryError implements RetryableError {
  readonly retryStrategy: SNSRetryStrategy;

  constructor(
    message: string,
    code: ErrorCode,
    operation: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: SNSErrorMetadata,
    cause?: Error,
    retryStrategy: SNSRetryStrategy = DEFAULT_SNS_RETRY_STRATEGY,
  ) {
    const finalMetadata: SNSErrorMetadata = {
      timestamp: new Date().toISOString(),
      ...metadata,
      snsErrorCode:
        metadata?.snsErrorCode || SNSErrorCode.GENERAL_VALIDATION_ERROR,
    };

    super(message, code, 'sns', operation, severity, finalMetadata, cause);
    this.retryStrategy = retryStrategy;
  }

  /**
   * Determines if this error can be retried
   */
  get canRetry(): boolean {
    const attempts = (this.metadata as SNSErrorMetadata).retryAttempt || 0;
    return (
      attempts < this.retryStrategy.maxAttempts &&
      this.retryStrategy.shouldRetry(this)
    );
  }

  /**
   * Gets the delay before the next retry attempt
   */
  get retryDelay(): number {
    const attempts = (this.metadata as SNSErrorMetadata).retryAttempt || 0;
    const delay = Math.min(
      this.retryStrategy.baseDelay * Math.pow(2, attempts),
      this.retryStrategy.maxDelay,
    );
    return delay + Math.random() * 100; // Add jitter
  }

  /**
   * Enhanced JSON representation with SNS-specific properties
   */
  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      ...super.toJSON(),
      topicArn: (this.metadata as SNSErrorMetadata)?.topicArn,
      snsErrorCode: (this.metadata as SNSErrorMetadata)?.snsErrorCode,
      retryAttempt: (this.metadata as SNSErrorMetadata)?.retryAttempt,
      canRetry: this.canRetry,
      retryDelay: this.retryDelay,
    });
  }
}

/**
 * Maps AWS SNS errors to SNS factory errors
 */
export const mapSNSError = (
  error: any,
  operation: string,
  metadata?: Metadata,
): SNSFactoryError | undefined => {
  if (error instanceof FactoryError) {
    return undefined;
  }

  const awsMetadata: Partial<SNSErrorMetadata> = {
    ...metadata,
    requestId: error.$metadata?.requestId,
    region: error.$metadata?.region,
    accountId: error.$metadata?.accountId,
  };

  const createError = (
    message: string,
    code: ErrorCode,
    snsErrorCode: SNSErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ): SNSFactoryError => {
    return new SNSFactoryError(
      message,
      code,
      operation,
      severity,
      {
        ...awsMetadata,
        snsErrorCode,
        timestamp: awsMetadata.timestamp || new Date().toISOString(),
      },
      error instanceof Error ? error : undefined,
      DEFAULT_SNS_RETRY_STRATEGY,
    );
  };

  // Map specific AWS SNS error codes
  switch (error.name || error.code) {
    // Topic Existence Errors
    case 'NotFound':
    case 'TopicNotFound':
      return createError(
        `Topic ${awsMetadata.topicArn} does not exist`,
        ErrorCode.NOT_FOUND,
        SNSErrorCode.TOPIC_NOT_FOUND,
        ErrorSeverity.HIGH,
      );

    // Message Size Errors
    case 'InvalidParameter':
    case 'MessageTooLong':
      return createError(
        'Message size exceeds the 256 KB limit',
        ErrorCode.VALIDATION,
        SNSErrorCode.MESSAGE_TOO_LARGE,
      );

    // Authorization Errors
    case 'AuthorizationError':
      return createError(
        'Not authorized to perform SNS operation',
        ErrorCode.PERMISSION_DENIED,
        SNSErrorCode.PERMISSION_DENIED,
        ErrorSeverity.HIGH,
      );

    // Throttling Errors
    case 'ThrottledException':
    case 'Throttling':
      return createError(
        'Operation throttled due to exceeded throughput',
        ErrorCode.RATE_LIMIT,
        SNSErrorCode.THROTTLING_EXCEEDED,
      );

    // Invalid Token Errors
    case 'InvalidSecurityToken':
      return createError(
        'Invalid security token used',
        ErrorCode.AUTHENTICATION,
        SNSErrorCode.INVALID_SECURITY_TOKEN,
        ErrorSeverity.HIGH,
      );

    // Subscription Errors
    case 'SubscriptionLimitExceeded':
      return createError(
        'Subscription limit exceeded for topic',
        ErrorCode.RESOURCE_EXHAUSTED,
        SNSErrorCode.SUBSCRIPTION_LIMIT_EXCEEDED,
      );

    // Topic Limit Errors
    case 'TopicLimitExceeded':
      return createError(
        'Account topic limit exceeded',
        ErrorCode.RESOURCE_EXHAUSTED,
        SNSErrorCode.TOPIC_LIMIT_EXCEEDED,
        ErrorSeverity.HIGH,
      );

    // FIFO Topic Errors
    case 'InvalidFifoTopic':
      return createError(
        'Invalid FIFO topic configuration',
        ErrorCode.VALIDATION,
        SNSErrorCode.FIFO_TOPIC_NAME_INVALID,
      );

    // Policy Errors
    case 'InvalidParameter.Policy':
      return createError(
        'Invalid policy document',
        ErrorCode.VALIDATION,
        SNSErrorCode.TOPIC_POLICY_INVALID,
        ErrorSeverity.HIGH,
      );

    // Internal Errors
    case 'InternalError':
    case 'ServiceUnavailable':
      return createError(
        'SNS service encountered an internal error',
        ErrorCode.INTERNAL,
        SNSErrorCode.INTERNAL_ERROR,
        ErrorSeverity.HIGH,
      );

    // Subscription Protocol Errors
    case 'InvalidParameter.Protocol':
      return createError(
        'Invalid subscription protocol specified',
        ErrorCode.VALIDATION,
        SNSErrorCode.SUBSCRIPTION_PROTOCOL_INVALID,
      );

    // Message Group Errors
    case 'InvalidParameter.MessageGroup':
      return createError(
        'Invalid or missing message group ID for FIFO topic',
        ErrorCode.VALIDATION,
        SNSErrorCode.FIFO_MESSAGE_GROUP_REQUIRED,
      );

    // Return undefined for unhandled errors
    default:
      return undefined;
  }
};

/**
 * Determines if an SNS error is retryable
 */
export const isRetryableSNSError = (error: unknown): boolean => {
  if (!(error instanceof SNSFactoryError)) {
    return false;
  }

  const nonRetryableCodes = new Set([
    SNSErrorCode.MESSAGE_TOO_LARGE,
    SNSErrorCode.TOPIC_NAME_INVALID,
    SNSErrorCode.TOPIC_POLICY_INVALID,
    SNSErrorCode.PERMISSION_DENIED,
    SNSErrorCode.INVALID_SECURITY_TOKEN,
    SNSErrorCode.FIFO_TOPIC_NAME_INVALID,
    SNSErrorCode.MESSAGE_GROUP_ID_REQUIRED,
    SNSErrorCode.MESSAGE_DEDUPLICATION_REQUIRED,
    SNSErrorCode.SUBSCRIPTION_PROTOCOL_INVALID,
    SNSErrorCode.TOPIC_LIMIT_EXCEEDED,
    SNSErrorCode.SUBSCRIPTION_LIMIT_EXCEEDED,
    SNSErrorCode.MESSAGE_ATTRIBUTES_INVALID,
    SNSErrorCode.POLICY_ATTRIBUTE_INVALID,
  ]);

  return !nonRetryableCodes.has(
    (error.metadata as SNSErrorMetadata)?.snsErrorCode,
  );
};

/**
 * Creates an SNS validation error with consistent formatting
 */
export const createSNSValidationError = (
  message: string,
  snsErrorCode: SNSErrorCode,
  operation: string,
  metadata?: Omit<SNSErrorMetadata, 'snsErrorCode' | 'timestamp'>,
): SNSFactoryError => {
  return new SNSFactoryError(
    message,
    ErrorCode.VALIDATION,
    operation,
    ErrorSeverity.MEDIUM,
    {
      ...metadata,
      snsErrorCode,
      timestamp: new Date().toISOString(),
    },
  );
};

/**
 * Example usage:
 * ```typescript
 * try {
 *   await publishToTopic(message);
 * } catch (error) {
 *   if (error instanceof SNSFactoryError) {
 *     if (error.metadata.snsErrorCode === SNSErrorCode.TOPIC_NOT_FOUND) {
 *       // Handle missing topic
 *     } else if (error.canRetry) {
 *       // Implement retry logic
 *       await delay(error.retryDelay);
 *       // Retry operation
 *     }
 *   }
 *   throw error;
 * }
 * ```
 */
