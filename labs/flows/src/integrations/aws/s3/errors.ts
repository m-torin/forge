// src/integrations/aws/s3/errors.ts

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

export enum S3ErrorCode {
  // Object Operation Errors
  OBJECT_TOO_LARGE = 'S3_OBJECT_TOO_LARGE',
  OBJECT_NOT_FOUND = 'S3_OBJECT_NOT_FOUND',
  OBJECT_ALREADY_EXISTS = 'S3_OBJECT_ALREADY_EXISTS',
  INVALID_OBJECT_STATE = 'S3_INVALID_OBJECT_STATE',
  CHECKSUM_MISMATCH = 'S3_CHECKSUM_MISMATCH',

  // Bucket Operation Errors
  BUCKET_NOT_FOUND = 'S3_BUCKET_NOT_FOUND',
  BUCKET_ALREADY_EXISTS = 'S3_BUCKET_ALREADY_EXISTS',
  BUCKET_NOT_EMPTY = 'S3_BUCKET_NOT_EMPTY',
  INVALID_BUCKET_NAME = 'S3_INVALID_BUCKET_NAME',
  BUCKET_POLICY_ERROR = 'S3_BUCKET_POLICY_ERROR',

  // Multipart Upload Errors
  UPLOAD_NOT_FOUND = 'S3_UPLOAD_NOT_FOUND',
  INVALID_PART_ORDER = 'S3_INVALID_PART_ORDER',
  INCOMPLETE_UPLOAD = 'S3_INCOMPLETE_UPLOAD',
  PART_SIZE_ERROR = 'S3_PART_SIZE_ERROR',

  // Access Control Errors
  INVALID_ACL = 'S3_INVALID_ACL',
  PERMISSION_DENIED = 'S3_PERMISSION_DENIED',
  PUBLIC_ACCESS_DENIED = 'S3_PUBLIC_ACCESS_DENIED',

  // Encryption Errors
  KMS_KEY_INVALID = 'S3_KMS_KEY_INVALID',
  ENCRYPTION_ERROR = 'S3_ENCRYPTION_ERROR',
  SSE_ERROR = 'S3_SSE_ERROR',

  // Versioning Errors
  VERSION_NOT_FOUND = 'S3_VERSION_NOT_FOUND',
  INVALID_VERSION_ID = 'S3_INVALID_VERSION_ID',

  // Replication Errors
  REPLICATION_ERROR = 'S3_REPLICATION_ERROR',
  INVALID_REPLICATION_RULE = 'S3_INVALID_REPLICATION_RULE',

  // Lifecycle Errors
  LIFECYCLE_CONFIG_ERROR = 'S3_LIFECYCLE_CONFIG_ERROR',
  INVALID_LIFECYCLE_RULE = 'S3_INVALID_LIFECYCLE_RULE',

  // General Errors
  VALIDATION_ERROR = 'S3_VALIDATION_ERROR',
  NETWORK_ERROR = 'S3_NETWORK_ERROR',
  THROTTLING_ERROR = 'S3_THROTTLING_ERROR',
  UNEXPECTED_ERROR = 'S3_UNEXPECTED_ERROR',

  // **Added Error Codes**
  BUCKET_ENCRYPTION_REQUIRED = 'S3_BUCKET_ENCRYPTION_REQUIRED',
  MISSING_UPLOAD_ID = 'S3_MISSING_UPLOAD_ID',
  TOO_MANY_PARTS = 'S3_TOO_MANY_PARTS',
  PART_SIZE_TOO_SMALL = 'S3_PART_SIZE_TOO_SMALL',
  PART_SIZE_TOO_LARGE = 'S3_PART_SIZE_TOO_LARGE',
  INVALID_PERMISSION = 'S3_INVALID_PERMISSION',
  ENFORCE_PRIVATE_ACL = 'S3_ENFORCE_PRIVATE_ACL',

  // **Additional Error Codes from Validation.ts**
  INVALID_CONTENT_TYPE = 'S3_INVALID_CONTENT_TYPE',
  MISSING_METADATA = 'S3_MISSING_METADATA',
  ENCRYPTION_REQUIRED = 'S3_ENCRYPTION_REQUIRED',
  BUCKET_NAME_TOO_LONG = 'S3_BUCKET_NAME_TOO_LONG',
  INVALID_BUCKET_REGION = 'S3_INVALID_BUCKET_REGION',
}

export interface S3ErrorMetadata extends ErrorMetadata {
  s3ErrorCode: S3ErrorCode;
  bucket?: string;
  key?: string;
  versionId?: string;
  uploadId?: string;
  requestId?: string;
  region?: string;
  timestamp: string;
  retryAttempt?: number; // **Added Property**
}

export interface S3RetryStrategy extends RetryStrategy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: FactoryError) => boolean;
}

export const DEFAULT_S3_RETRY_STRATEGY: S3RetryStrategy = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  shouldRetry: (error: FactoryError) => {
    if (error instanceof S3FactoryError) {
      return isRetryableS3Error(error);
    }
    return false;
  },
};

export class S3FactoryError extends AWSFactoryError implements RetryableError {
  readonly retryStrategy: S3RetryStrategy;

  constructor(
    message: string,
    code: ErrorCode,
    operation: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: S3ErrorMetadata,
    cause?: Error,
    retryStrategy: S3RetryStrategy = DEFAULT_S3_RETRY_STRATEGY,
  ) {
    const finalMetadata: S3ErrorMetadata = {
      timestamp: new Date().toISOString(),
      ...metadata,
      s3ErrorCode: metadata?.s3ErrorCode || S3ErrorCode.UNEXPECTED_ERROR,
    };

    super(message, code, 's3', operation, severity, finalMetadata, cause);
    this.retryStrategy = retryStrategy;
  }

  get canRetry(): boolean {
    const attempts = (this.metadata as S3ErrorMetadata).retryAttempt || 0;
    return (
      attempts < this.retryStrategy.maxAttempts &&
      this.retryStrategy.shouldRetry(this)
    );
  }

  get retryDelay(): number {
    const attempts = (this.metadata as S3ErrorMetadata).retryAttempt || 0;
    const delay = Math.min(
      this.retryStrategy.baseDelay * Math.pow(2, attempts),
      this.retryStrategy.maxDelay,
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      ...super.toJSON(),
      bucket: (this.metadata as S3ErrorMetadata)?.bucket,
      key: (this.metadata as S3ErrorMetadata)?.key,
      s3ErrorCode: (this.metadata as S3ErrorMetadata)?.s3ErrorCode,
      canRetry: this.canRetry,
      retryDelay: this.retryDelay,
    });
  }
}

export const mapS3Error = (
  error: any,
  operation: string,
  metadata?: Metadata,
): S3FactoryError | undefined => {
  if (error instanceof FactoryError) {
    return undefined;
  }

  const awsMetadata: Partial<S3ErrorMetadata> = {
    ...metadata,
    requestId: error.$metadata?.requestId,
    region: error.$metadata?.region,
  };

  const createError = (
    message: string,
    code: ErrorCode,
    s3ErrorCode: S3ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ): S3FactoryError => {
    return new S3FactoryError(
      message,
      code,
      operation,
      severity,
      {
        ...awsMetadata,
        s3ErrorCode,
        timestamp: new Date().toISOString(),
      },
      error instanceof Error ? error : undefined,
    );
  };

  switch (error.name || error.code) {
    case 'NoSuchBucket':
      return createError(
        `Bucket ${awsMetadata.bucket} not found`,
        ErrorCode.NOT_FOUND,
        S3ErrorCode.BUCKET_NOT_FOUND,
        ErrorSeverity.HIGH,
      );

    case 'NoSuchKey':
      return createError(
        `Object ${awsMetadata.key} not found in bucket ${awsMetadata.bucket}`,
        ErrorCode.NOT_FOUND,
        S3ErrorCode.OBJECT_NOT_FOUND,
      );

    case 'EntityTooLarge':
      return createError(
        'Object size exceeds allowed limits',
        ErrorCode.VALIDATION,
        S3ErrorCode.OBJECT_TOO_LARGE,
        ErrorSeverity.MEDIUM,
      );

    case 'InvalidBucketName':
      return createError(
        `Invalid bucket name: ${awsMetadata.bucket}`,
        ErrorCode.VALIDATION,
        S3ErrorCode.INVALID_BUCKET_NAME,
      );

    case 'BucketAlreadyExists':
      return createError(
        `Bucket ${awsMetadata.bucket} already exists`,
        ErrorCode.ALREADY_EXISTS,
        S3ErrorCode.BUCKET_ALREADY_EXISTS,
      );

    case 'BucketNotEmpty':
      return createError(
        `Bucket ${awsMetadata.bucket} is not empty`,
        ErrorCode.PRECONDITION_FAILED,
        S3ErrorCode.BUCKET_NOT_EMPTY,
        ErrorSeverity.HIGH,
      );

    case 'InvalidArgument':
      return createError(
        'Invalid argument provided to operation',
        ErrorCode.VALIDATION,
        S3ErrorCode.VALIDATION_ERROR,
      );

    case 'NoSuchUpload':
      return createError(
        `Upload ${awsMetadata.uploadId} not found`,
        ErrorCode.NOT_FOUND,
        S3ErrorCode.UPLOAD_NOT_FOUND,
      );

    case 'AccessDenied':
      return createError(
        'Access denied',
        ErrorCode.PERMISSION,
        S3ErrorCode.PERMISSION_DENIED,
        ErrorSeverity.HIGH,
      );

    case 'InvalidPart':
    case 'InvalidPartOrder':
      return createError(
        'Invalid multipart upload configuration',
        ErrorCode.VALIDATION,
        S3ErrorCode.INVALID_PART_ORDER,
      );

    case 'ThrottlingException':
    case 'SlowDown':
      return createError(
        'Request throttled by S3',
        ErrorCode.RATE_LIMIT,
        S3ErrorCode.THROTTLING_ERROR,
      );

    case 'KMSInvalidKeyUsage':
      return createError(
        'Invalid KMS key configuration',
        ErrorCode.CONFIGURATION,
        S3ErrorCode.KMS_KEY_INVALID,
        ErrorSeverity.HIGH,
      );

    default:
      return createError(
        `Unexpected S3 error: ${error.message || 'Unknown error'}`,
        ErrorCode.UNKNOWN,
        S3ErrorCode.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
      );
  }
};

export const isRetryableS3Error = (error: unknown): boolean => {
  if (!(error instanceof S3FactoryError)) {
    return false;
  }

  const nonRetryableCodes = new Set([
    S3ErrorCode.BUCKET_ALREADY_EXISTS,
    S3ErrorCode.INVALID_BUCKET_NAME,
    S3ErrorCode.OBJECT_TOO_LARGE,
    S3ErrorCode.INVALID_ACL,
    S3ErrorCode.KMS_KEY_INVALID,
    S3ErrorCode.INVALID_PART_ORDER,
    S3ErrorCode.INVALID_VERSION_ID,
    S3ErrorCode.INVALID_REPLICATION_RULE,
    S3ErrorCode.INVALID_LIFECYCLE_RULE,
    S3ErrorCode.BUCKET_POLICY_ERROR,
  ]);

  return !nonRetryableCodes.has(
    (error.metadata as S3ErrorMetadata)?.s3ErrorCode,
  );
};

export const createS3ValidationError = (
  message: string,
  s3ErrorCode: S3ErrorCode,
  operation: string,
  metadata?: Omit<S3ErrorMetadata, 's3ErrorCode' | 'timestamp'>,
): S3FactoryError => {
  return new S3FactoryError(
    message,
    ErrorCode.VALIDATION,
    operation,
    ErrorSeverity.MEDIUM,
    {
      ...metadata,
      s3ErrorCode,
      timestamp: new Date().toISOString(),
    },
  );
};

// Helper function for access control errors
export const createS3AccessError = (
  message: string,
  operation: string,
  metadata?: Omit<S3ErrorMetadata, 's3ErrorCode' | 'timestamp'>,
): S3FactoryError => {
  return createS3ValidationError(
    message,
    S3ErrorCode.PERMISSION_DENIED,
    operation,
    metadata,
  );
};

// Helper function for encryption errors
export const createS3EncryptionError = (
  message: string,
  operation: string,
  metadata?: Omit<S3ErrorMetadata, 's3ErrorCode' | 'timestamp'>,
): S3FactoryError => {
  return createS3ValidationError(
    message,
    S3ErrorCode.ENCRYPTION_ERROR,
    operation,
    metadata,
  );
};

// Helper function for multipart upload errors
export const createS3MultipartError = (
  message: string,
  operation: string,
  metadata?: Omit<S3ErrorMetadata, 's3ErrorCode' | 'timestamp'>,
): S3FactoryError => {
  return createS3ValidationError(
    message,
    S3ErrorCode.INCOMPLETE_UPLOAD,
    operation,
    metadata,
  );
};
