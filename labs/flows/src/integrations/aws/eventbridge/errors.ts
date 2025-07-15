// src/integrations/aws/eventbridge/errors.ts

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
 * EventBridge-specific error codes that extend the base error codes.
 */
export enum EventBridgeErrorCode {
  // Event Validation Errors
  EVENT_TOO_LARGE = 'EB_EVENT_TOO_LARGE',
  EVENT_INVALID_FORMAT = 'EB_EVENT_INVALID_FORMAT',
  EVENT_MISSING_REQUIRED = 'EB_EVENT_MISSING_REQUIRED',

  // Put Events Errors
  PUT_EVENTS_LIMIT_EXCEEDED = 'EB_PUT_EVENTS_LIMIT_EXCEEDED',
  INVALID_PARTITION_KEY = 'EB_INVALID_PARTITION_KEY',

  // Rule Configuration Errors
  RULE_INVALID_NAME = 'EB_RULE_INVALID_NAME',
  RULE_ALREADY_EXISTS = 'EB_RULE_ALREADY_EXISTS',
  RULE_NOT_FOUND = 'EB_RULE_NOT_FOUND',

  // Permission Errors
  PERMISSION_DENIED = 'EB_PERMISSION_DENIED',
  INVALID_ROLE = 'EB_INVALID_ROLE',

  // Resource Limit Errors
  EVENT_BUS_LIMIT_EXCEEDED = 'EB_EVENT_BUS_LIMIT_EXCEEDED',

  // KMS Errors
  KMS_KEY_DISABLED = 'EB_KMS_KEY_DISABLED',
  KMS_KEY_INVALID = 'EB_KMS_KEY_INVALID',

  // General Validation Errors
  GENERAL_VALIDATION_ERROR = 'EB_GENERAL_VALIDATION_ERROR',
  VALIDATION_ERROR = 'EB_VALIDATION_ERROR', // Added to resolve TS2339: Property 'VALIDATION_ERROR' does not exist
  EVENT_ATTRIBUTE_INVALID_KEY = 'EB_EVENT_ATTRIBUTE_INVALID_KEY',
  EVENT_ATTRIBUTE_INVALID_VALUE = 'EB_EVENT_ATTRIBUTE_INVALID_VALUE',
  EVENT_BUS_INVALID_ARN = 'EB_EVENT_BUS_INVALID_ARN',
  TARGET_INVALID_ID = 'EB_TARGET_INVALID_ID',
  TARGET_INVALID_ARN = 'EB_TARGET_INVALID_ARN',
  POLICY_INVALID_FORMAT = 'EB_POLICY_INVALID_FORMAT',
  POLICY_INVALID_ACCESS = 'EB_POLICY_INVALID_ACCESS',
  POLICY_STATEMENTS_INVALID = 'EB_POLICY_STATEMENTS_INVALID',
  TARGET_INVALID_RULE = 'EB_TARGET_INVALID_RULE',
}

/**
 * EventBridge-specific metadata interface extending the base ErrorMetadata.
 */
export interface EventBridgeErrorMetadata extends ErrorMetadata {
  eventBridgeErrorCode: EventBridgeErrorCode;
  eventBusName?: string;
  ruleName?: string;
  eventId?: string;
  requestId?: string;
  retryAttempt?: number;
  timestamp: string; // Ensures timestamp is always present
  region?: string;
  accountId?: string;
}

/**
 * Retry strategy configuration for EventBridge errors.
 */
export interface EventBridgeRetryStrategy extends RetryStrategy {
  maxAttempts: number;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  shouldRetry: (error: FactoryError) => boolean;
}

/**
 * Default retry strategy for EventBridge operations.
 */
export const DEFAULT_EVENTBRIDGE_RETRY_STRATEGY: EventBridgeRetryStrategy = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  shouldRetry: (error: FactoryError) => {
    if (error instanceof EventBridgeFactoryError) {
      return isRetryableEventBridgeError(error);
    }
    return false;
  },
};

/**
 * Creates an EventBridge-specific factory error with retry capabilities.
 */
export class EventBridgeFactoryError
  extends AWSFactoryError
  implements RetryableError
{
  readonly retryStrategy: EventBridgeRetryStrategy;

  constructor(
    message: string,
    code: ErrorCode,
    operation: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: EventBridgeErrorMetadata,
    cause?: Error,
    retryStrategy: EventBridgeRetryStrategy = DEFAULT_EVENTBRIDGE_RETRY_STRATEGY,
  ) {
    const finalMetadata: EventBridgeErrorMetadata = {
      timestamp: new Date().toISOString(),
      ...metadata,
      eventBridgeErrorCode:
        metadata?.eventBridgeErrorCode ||
        EventBridgeErrorCode.GENERAL_VALIDATION_ERROR,
    };

    super(
      message,
      code,
      'eventbridge',
      operation,
      severity,
      finalMetadata,
      cause,
    );
    this.retryStrategy = retryStrategy;
  }

  /**
   * Determines if this error can be retried.
   */
  get canRetry(): boolean {
    const attempts =
      (this.metadata as EventBridgeErrorMetadata).retryAttempt || 0;
    return (
      attempts < this.retryStrategy.maxAttempts &&
      this.retryStrategy.shouldRetry(this)
    );
  }

  /**
   * Gets the delay before the next retry attempt.
   */
  get retryDelay(): number {
    const attempts =
      (this.metadata as EventBridgeErrorMetadata).retryAttempt || 0;
    const delay = Math.min(
      this.retryStrategy.baseDelay * Math.pow(2, attempts),
      this.retryStrategy.maxDelay,
    );
    return delay + Math.random() * 100; // Add jitter
  }

  /**
   * Adds EventBridge-specific properties to JSON representation.
   */
  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      ...super.toJSON(),
      eventBusName: (this.metadata as EventBridgeErrorMetadata)?.eventBusName,
      eventBridgeErrorCode: (this.metadata as EventBridgeErrorMetadata)
        ?.eventBridgeErrorCode,
      retryAttempt: (this.metadata as EventBridgeErrorMetadata)?.retryAttempt,
      canRetry: this.canRetry,
      retryDelay: this.retryDelay,
    });
  }
}

/**
 * Maps AWS EventBridge errors to EventBridge factory errors with proper retry handling.
 */
export const mapEventBridgeError = (
  error: any,
  operation: string,
  metadata?: Metadata,
): EventBridgeFactoryError | undefined => {
  // Early return if error is already a factory error.
  if (error instanceof FactoryError) {
    return undefined;
  }

  // Extract AWS request metadata.
  const awsMetadata: Partial<EventBridgeErrorMetadata> = {
    ...metadata,
    requestId: error.$metadata?.requestId,
    region: error.$metadata?.region,
    accountId: error.$metadata?.accountId,
  };

  // Helper function to create error with consistent retry strategy.
  const createError = (
    message: string,
    code: ErrorCode,
    eventBridgeErrorCode: EventBridgeErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ): EventBridgeFactoryError => {
    return new EventBridgeFactoryError(
      message,
      code,
      operation,
      severity,
      {
        ...awsMetadata,
        eventBridgeErrorCode,
        timestamp: awsMetadata.timestamp || new Date().toISOString(), // Ensure timestamp is set.
      },
      error instanceof Error ? error : undefined,
      DEFAULT_EVENTBRIDGE_RETRY_STRATEGY,
    );
  };

  // Map EventBridge error codes with proper retry configuration.
  switch (error.name || error.code) {
    // Event Bus Errors.
    case 'EventBusAlreadyExistsException':
      return createError(
        `Event bus ${awsMetadata.eventBusName} already exists`,
        ErrorCode.ALREADY_EXISTS,
        EventBridgeErrorCode.EVENT_BUS_LIMIT_EXCEEDED, // Consider using a more appropriate code if available.
        ErrorSeverity.HIGH,
      );

    case 'ResourceNotFoundException':
      return createError(
        `Resource not found: ${awsMetadata.eventBusName}`,
        ErrorCode.NOT_FOUND,
        EventBridgeErrorCode.RULE_NOT_FOUND,
      );

    // Put Events Errors.
    case 'InvalidEventPatternException':
      return createError(
        'Invalid event pattern',
        ErrorCode.VALIDATION,
        EventBridgeErrorCode.EVENT_INVALID_FORMAT,
      );

    case 'InvalidStateException':
      return createError(
        'Invalid state for the requested operation',
        ErrorCode.INVALID_STATE,
        EventBridgeErrorCode.EVENT_MISSING_REQUIRED,
      );

    // Permission Errors.
    case 'AccessDeniedException':
      return createError(
        'Access denied for the requested operation',
        ErrorCode.PERMISSION_DENIED,
        EventBridgeErrorCode.PERMISSION_DENIED,
        ErrorSeverity.HIGH,
      );

    // KMS Errors.
    case 'KmsAccessDeniedException':
    case 'KmsDisabledException':
      return createError(
        'KMS key error',
        ErrorCode.CONNECTION,
        EventBridgeErrorCode.KMS_KEY_DISABLED,
        ErrorSeverity.HIGH,
      );

    // Throughput Errors.
    case 'InternalException':
    case 'ServiceUnavailableException':
      return createError(
        'Service is temporarily unavailable',
        ErrorCode.SERVICE_UNAVAILABLE, // Ensure SERVICE_UNAVAILABLE is added to ErrorCode enum in integrationFactory.
        EventBridgeErrorCode.EVENT_BUS_LIMIT_EXCEEDED, // Consider using a more appropriate code if available.
      );

    // Return undefined for unhandled errors.
    default:
      return undefined;
  }
};

/**
 * Determines if an error is a retryable EventBridge error.
 */
export const isRetryableEventBridgeError = (error: unknown): boolean => {
  if (!(error instanceof EventBridgeFactoryError)) {
    return false;
  }

  const nonRetryableCodes = new Set([
    EventBridgeErrorCode.EVENT_TOO_LARGE,
    EventBridgeErrorCode.EVENT_INVALID_FORMAT,
    EventBridgeErrorCode.EVENT_MISSING_REQUIRED,
    EventBridgeErrorCode.RULE_INVALID_NAME,
    EventBridgeErrorCode.RULE_ALREADY_EXISTS,
    EventBridgeErrorCode.PERMISSION_DENIED,
    EventBridgeErrorCode.KMS_KEY_INVALID,
    EventBridgeErrorCode.INVALID_ROLE,
  ]);

  return !nonRetryableCodes.has(
    (error.metadata as EventBridgeErrorMetadata)?.eventBridgeErrorCode,
  );
};

/**
 * Helper to create an EventBridge validation error.
 */
export const createEventBridgeValidationError = (
  message: string,
  eventBridgeErrorCode: EventBridgeErrorCode,
  operation: string,
  metadata?: Omit<
    EventBridgeErrorMetadata,
    'eventBridgeErrorCode' | 'timestamp'
  >, // Omit to enforce inclusion.
): EventBridgeFactoryError => {
  return new EventBridgeFactoryError(
    message,
    ErrorCode.VALIDATION, // Ensure 'VALIDATION' exists in ErrorCode enum.
    operation,
    ErrorSeverity.MEDIUM,
    {
      ...metadata,
      eventBridgeErrorCode,
      timestamp: new Date().toISOString(), // Ensure timestamp is set.
    },
  );
};
