// src/integrations/aws/s3/validation.ts

import { OperationContext } from '#/lib/integrationFactory';
import {
  S3ErrorCode,
  createS3ValidationError,
  type S3ErrorMetadata,
} from './errors';

export interface S3ValidationOptions {
  object?: {
    maxSize?: number;
    allowedContentTypes?: (string | RegExp)[];
    requiredMetadata?: string[];
    validateChecksum?: boolean;
    enforceEncryption?: boolean;
  };

  bucket?: {
    namePattern?: RegExp;
    maxNameLength?: number;
    validateTags?: boolean;
    requireEncryption?: boolean;
    allowedRegions?: string[];
  };

  multipart?: {
    minPartSize?: number;
    maxPartSize?: number;
    validatePartNumbers?: boolean;
    maxParts?: number;
  };

  acl?: {
    allowedGrants?: string[];
    validatePermissions?: boolean;
    enforcePrivate?: boolean;
  };

  security?: {
    validateKmsKey?: boolean;
    validatePolicy?: boolean;
    enforceSSE?: boolean;
    allowedPrincipals?: string[];
  };

  custom?: {
    validators?: Array<(input: any) => void>;
    transformers?: Array<(input: any) => any>;
  };
}

export const DEFAULT_VALIDATION_OPTIONS: Readonly<S3ValidationOptions> = {
  object: {
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB for regular uploads
    allowedContentTypes: ['*'],
    validateChecksum: true,
    enforceEncryption: true,
  },

  bucket: {
    namePattern: /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/,
    maxNameLength: 63,
    validateTags: true,
    requireEncryption: true,
  },

  multipart: {
    minPartSize: 5 * 1024 * 1024, // 5MB
    maxPartSize: 5 * 1024 * 1024 * 1024, // 5GB
    validatePartNumbers: true,
    maxParts: 10000,
  },
} as const;

export interface ValidationResult {
  valid: boolean;
  errors: S3ErrorMetadata[];
  warnings: S3ErrorMetadata[];
  metadata: Record<string, unknown>;
}

export const validateS3Input = (
  input: any,
  operationName: string,
  options: S3ValidationOptions = DEFAULT_VALIDATION_OPTIONS,
  context?: OperationContext,
): ValidationResult => {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    metadata: {},
  };

  try {
    // Object Operations Validation
    if ('Body' in input) {
      validateObjectInput(input, options.object);
    }

    // Bucket Operations Validation
    if ('Bucket' in input) {
      validateBucketInput(input.Bucket, options.bucket);
    }

    // Multipart Upload Validation
    if ('UploadId' in input) {
      validateMultipartInput(input, options.multipart);
    }

    // ACL Validation
    if ('ACL' in input || 'AccessControlPolicy' in input) {
      validateAclInput(input, options.acl);
    }

    // Add validation metadata to context if provided
    if (context) {
      const newMetadata: Record<string, unknown> = {
        ...context.metadata,
        validation: {
          performed: true,
          timestamp: new Date().toISOString(),
          options: { ...options },
        },
      };
      (context as any).metadata = newMetadata;
    }
  } catch (error) {
    result.valid = false;
    if (error instanceof Error) {
      result.errors.push({
        s3ErrorCode: S3ErrorCode.VALIDATION_ERROR,
        message: error.message,
        operation: operationName,
        timestamp: new Date().toISOString(),
      } as S3ErrorMetadata);
    }
  }

  return result;
};

/**
 * Validates the Object input.
 * @param input - The input parameters for the S3 operation.
 * @param options - Validation options for the object.
 */
const validateObjectInput = (
  input: any,
  options?: S3ValidationOptions['object'],
) => {
  if (!options) return;

  // Validate object size
  if (options.maxSize && input.Body) {
    const size =
      input.Body instanceof Uint8Array
        ? input.Body.length
        : typeof input.Body === 'string'
          ? new TextEncoder().encode(input.Body).length
          : 0;

    if (size > options.maxSize) {
      throw createS3ValidationError(
        `Object size ${size} exceeds maximum allowed ${options.maxSize}`,
        S3ErrorCode.OBJECT_TOO_LARGE,
        'ValidateObject',
        { size, maxSize: options.maxSize },
      );
    }
  }

  // Validate allowed content types
  if (
    options.allowedContentTypes &&
    options.allowedContentTypes.length > 0 &&
    input.ContentType
  ) {
    const isAllowed = options.allowedContentTypes.some((pattern) => {
      if (pattern instanceof RegExp) return pattern.test(input.ContentType);
      return pattern === input.ContentType;
    });

    if (!isAllowed) {
      throw createS3ValidationError(
        `Content type "${input.ContentType}" is not allowed.`,
        S3ErrorCode.INVALID_CONTENT_TYPE,
        'ValidateObject',
        {
          contentType: input.ContentType,
          allowed: options.allowedContentTypes,
        },
      );
    }
  }

  // Validate required metadata
  if (
    options.requiredMetadata &&
    options.requiredMetadata.length > 0 &&
    input.Metadata
  ) {
    const missingMetadata = options.requiredMetadata.filter(
      (key) => !(key in input.Metadata),
    );
    if (missingMetadata.length > 0) {
      throw createS3ValidationError(
        `Missing required metadata: ${missingMetadata.join(', ')}`,
        S3ErrorCode.MISSING_METADATA,
        'ValidateObject',
        { missingMetadata },
      );
    }
  }

  // Validate checksum
  if (options.validateChecksum && input.Checksum) {
    // Implement checksum validation logic here
    // Example:
    const calculatedChecksum = calculateChecksum(input.Body);
    if (calculatedChecksum !== input.Checksum) {
      throw createS3ValidationError(
        `Checksum mismatch: expected ${input.Checksum}, calculated ${calculatedChecksum}`,
        S3ErrorCode.CHECKSUM_MISMATCH,
        'ValidateObject',
        { expected: input.Checksum, calculated: calculatedChecksum },
      );
    }
  }

  // Enforce encryption
  if (options.enforceEncryption) {
    const encryption = input.ServerSideEncryption;
    if (!encryption || encryption === 'NONE') {
      throw createS3ValidationError(
        `Encryption is required but not enforced.`,
        S3ErrorCode.ENCRYPTION_REQUIRED,
        'ValidateObject',
        { encryption },
      );
    }
  }
};

/**
 * Validates the Bucket input.
 * @param bucketName - The name of the S3 bucket.
 * @param options - Validation options for the bucket.
 */
const validateBucketInput = (
  bucketName: string,
  options?: S3ValidationOptions['bucket'],
) => {
  if (!options) return;

  // Validate bucket name pattern
  if (options.namePattern && !options.namePattern.test(bucketName)) {
    throw createS3ValidationError(
      `Bucket name "${bucketName}" does not match the required pattern.`,
      S3ErrorCode.INVALID_BUCKET_NAME,
      'ValidateBucket',
      { bucketName, pattern: options.namePattern.toString() },
    );
  }

  // Validate bucket name length
  if (options.maxNameLength && bucketName.length > options.maxNameLength) {
    throw createS3ValidationError(
      `Bucket name "${bucketName}" exceeds the maximum length of ${options.maxNameLength}.`,
      S3ErrorCode.BUCKET_NAME_TOO_LONG,
      'ValidateBucket',
      { bucketName, maxNameLength: options.maxNameLength },
    );
  }

  // Validate allowed regions
  if (options.allowedRegions && options.allowedRegions.length > 0) {
    // Assume a function getBucketRegion exists to fetch the bucket's region
    const bucketRegion = getBucketRegion(bucketName);
    if (!options.allowedRegions.includes(bucketRegion)) {
      throw createS3ValidationError(
        `Bucket region "${bucketRegion}" is not allowed.`,
        S3ErrorCode.INVALID_BUCKET_REGION,
        'ValidateBucket',
        { bucketName, bucketRegion, allowedRegions: options.allowedRegions },
      );
    }
  }

  // Enforce encryption
  if (options.requireEncryption) {
    // Assume a function isBucketEncrypted exists to check encryption
    const isEncrypted = isBucketEncrypted(bucketName);
    if (!isEncrypted) {
      throw createS3ValidationError(
        `Bucket "${bucketName}" requires encryption but it is not enforced.`,
        S3ErrorCode.BUCKET_ENCRYPTION_REQUIRED,
        'ValidateBucket',
        { bucketName },
      );
    }
  }

  // Additional validations can be added here (e.g., validateTags)
};

/**
 * Validates Multipart Upload input.
 * @param input - The input parameters for multipart upload.
 * @param options - Validation options for multipart uploads.
 */
const validateMultipartInput = (
  input: any,
  options?: S3ValidationOptions['multipart'],
) => {
  if (!options) return;

  const { UploadId, Parts } = input;

  // Validate UploadId presence
  if (!UploadId) {
    throw createS3ValidationError(
      `Missing UploadId for multipart upload.`,
      S3ErrorCode.MISSING_UPLOAD_ID,
      'ValidateMultipart',
      { input },
    );
  }

  // Validate number of parts
  if (options.maxParts && Parts && Parts.length > options.maxParts) {
    throw createS3ValidationError(
      `Number of parts ${Parts.length} exceeds the maximum allowed ${options.maxParts}.`,
      S3ErrorCode.TOO_MANY_PARTS,
      'ValidateMultipart',
      { parts: Parts.length, maxParts: options.maxParts },
    );
  }

  // Validate part sizes
  if (Parts) {
    Parts.forEach((part: any, index: number) => {
      const partSize = part.Size;
      if (options.minPartSize && partSize < options.minPartSize) {
        throw createS3ValidationError(
          `Part ${index + 1} size ${partSize} is smaller than the minimum allowed ${options.minPartSize}.`,
          S3ErrorCode.PART_SIZE_TOO_SMALL,
          'ValidateMultipart',
          { partNumber: index + 1, partSize, minPartSize: options.minPartSize },
        );
      }
      if (options.maxPartSize && partSize > options.maxPartSize) {
        throw createS3ValidationError(
          `Part ${index + 1} size ${partSize} exceeds the maximum allowed ${options.maxPartSize}.`,
          S3ErrorCode.PART_SIZE_TOO_LARGE,
          'ValidateMultipart',
          { partNumber: index + 1, partSize, maxPartSize: options.maxPartSize },
        );
      }
    });
  }

  // Additional validations can be added here (e.g., validatePartNumbers)
};

/**
 * Validates ACL (Access Control List) input.
 * @param input - The input parameters for ACL.
 * @param options - Validation options for ACL.
 */
const validateAclInput = (input: any, options?: S3ValidationOptions['acl']) => {
  if (!options) return;

  const { ACL, AccessControlPolicy } = input;

  // Validate ACL if provided
  if (ACL) {
    if (options.allowedGrants && !options.allowedGrants.includes(ACL)) {
      throw createS3ValidationError(
        `ACL "${ACL}" is not allowed.`,
        S3ErrorCode.INVALID_ACL,
        'ValidateACL',
        { acl: ACL, allowedGrants: options.allowedGrants },
      );
    }
  }

  // Validate AccessControlPolicy if provided
  if (AccessControlPolicy) {
    // Example: Validate permissions
    if (options.validatePermissions) {
      // Implement permission validations here
      // Example:
      const grants = AccessControlPolicy.Grants;
      if (grants && grants.length > 0) {
        grants.forEach((grant: any, index: number) => {
          if (
            options.allowedGrants &&
            !options.allowedGrants.includes(grant.Permission)
          ) {
            throw createS3ValidationError(
              `Grant permission "${grant.Permission}" is not allowed.`,
              S3ErrorCode.INVALID_PERMISSION,
              'ValidateACL',
              { grantNumber: index + 1, permission: grant.Permission },
            );
          }
        });
      }
    }

    // Example: Enforce private ACL
    if (options.enforcePrivate) {
      if (ACL && ACL !== 'private') {
        throw createS3ValidationError(
          `ACL must be set to "private".`,
          S3ErrorCode.ENFORCE_PRIVATE_ACL,
          'ValidateACL',
          { acl: ACL },
        );
      }

      // Alternatively, enforce private via AccessControlPolicy
      // Implement as needed
    }
  }

  // Additional validations can be added here (e.g., validatePermissions, enforcePrivate)
};

/**
 * Placeholder function to calculate checksum.
 * Replace with actual implementation.
 * @param body - The body of the object.
 * @returns The calculated checksum as a string.
 */
const calculateChecksum = (_body: any): string => {
  // Implement actual checksum calculation (e.g., MD5, SHA256)
  // For demonstration purposes, return a dummy checksum
  return 'dummy-checksum';
};

/**
 * Placeholder function to get the region of a bucket.
 * Replace with actual implementation.
 * @param bucketName - The name of the bucket.
 * @returns The region of the bucket.
 */
const getBucketRegion = (_bucketName: string): string => {
  // Implement actual logic to retrieve bucket region
  // For demonstration purposes, return a default region
  return 'us-east-1';
};

/**
 * Placeholder function to check if a bucket is encrypted.
 * Replace with actual implementation.
 * @param bucketName - The name of the bucket.
 * @returns Boolean indicating if the bucket is encrypted.
 */
const isBucketEncrypted = (_bucketName: string): boolean => {
  // Implement actual logic to check bucket encryption
  // For demonstration purposes, return true
  return true;
};
