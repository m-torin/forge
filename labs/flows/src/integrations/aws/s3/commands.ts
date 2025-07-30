// src/integrations/aws/s3/commands.ts

/**
 * AWS S3 Command Implementations
 *
 * Provides wrapped AWS S3 commands with integrated validation, error handling,
 * and middleware support through the Flowbuilder integration factory.
 */

import {
  // AWS S3 Command Classes
  PutObjectCommand as AWSPutObjectCommand,
  GetObjectCommand as AWSGetObjectCommand,
  DeleteObjectCommand as AWSDeleteObjectCommand,
  DeleteObjectsCommand as AWSDeleteObjectsCommand,
  HeadObjectCommand as AWSHeadObjectCommand,
  CopyObjectCommand as AWSCopyObjectCommand,
  GetObjectAttributesCommand as AWSGetObjectAttributesCommand,
  RestoreObjectCommand as AWSRestoreObjectCommand,

  // Bucket Commands
  CreateBucketCommand as AWSCreateBucketCommand,
  DeleteBucketCommand as AWSDeleteBucketCommand,
  ListBucketsCommand as AWSListBucketsCommand,
  PutBucketPolicyCommand as AWSPutBucketPolicyCommand,
  GetBucketPolicyCommand as AWSGetBucketPolicyCommand,
  PutBucketLifecycleConfigurationCommand as AWSPutBucketLifecycleConfigurationCommand,
  GetBucketLifecycleConfigurationCommand as AWSGetBucketLifecycleConfigurationCommand,
  PutBucketEncryptionCommand as AWSPutBucketEncryptionCommand,
  GetBucketEncryptionCommand as AWSGetBucketEncryptionCommand,
  DeleteBucketEncryptionCommand as AWSDeleteBucketEncryptionCommand,
  PutPublicAccessBlockCommand as AWSPutPublicAccessBlockCommand,
  GetPublicAccessBlockCommand as AWSGetPublicAccessBlockCommand,

  // Multipart Upload Commands
  CreateMultipartUploadCommand as AWSCreateMultipartUploadCommand,
  UploadPartCommand as AWSUploadPartCommand,
  CompleteMultipartUploadCommand as AWSCompleteMultipartUploadCommand,
  AbortMultipartUploadCommand as AWSAbortMultipartUploadCommand,
  ListMultipartUploadsCommand as AWSListMultipartUploadsCommand,
  ListPartsCommand as AWSListPartsCommand,

  // Types
  type PutObjectCommandInput,
  type PutObjectCommandOutput,
  type GetObjectCommandInput,
  type GetObjectCommandOutput,
  type DeleteObjectCommandInput,
  type DeleteObjectCommandOutput,
  type DeleteObjectsCommandInput,
  type DeleteObjectsCommandOutput,
  type HeadObjectCommandInput,
  type HeadObjectCommandOutput,
  type CopyObjectCommandInput,
  type CopyObjectCommandOutput,
  type CreateBucketCommandInput,
  type CreateBucketCommandOutput,
  type DeleteBucketCommandInput,
  type DeleteBucketCommandOutput,
  type ListBucketsCommandInput,
  type ListBucketsCommandOutput,
  type PutBucketPolicyCommandInput,
  type PutBucketPolicyCommandOutput,
  type GetBucketPolicyCommandInput,
  type GetBucketPolicyCommandOutput,
  type PutBucketLifecycleConfigurationCommandInput,
  type PutBucketLifecycleConfigurationCommandOutput,
  type GetBucketLifecycleConfigurationCommandInput,
  type GetBucketLifecycleConfigurationCommandOutput,
  type PutBucketEncryptionCommandInput,
  type PutBucketEncryptionCommandOutput,
  type GetBucketEncryptionCommandInput,
  type GetBucketEncryptionCommandOutput,
  type DeleteBucketEncryptionCommandInput,
  type DeleteBucketEncryptionCommandOutput,
  type PutPublicAccessBlockCommandInput,
  type PutPublicAccessBlockCommandOutput,
  type GetPublicAccessBlockCommandInput,
  type GetPublicAccessBlockCommandOutput,
  type CreateMultipartUploadCommandInput,
  type CreateMultipartUploadCommandOutput,
  type UploadPartCommandInput,
  type UploadPartCommandOutput,
  type CompleteMultipartUploadCommandInput,
  type CompleteMultipartUploadCommandOutput,
  type AbortMultipartUploadCommandInput,
  type AbortMultipartUploadCommandOutput,
  type ListMultipartUploadsCommandInput,
  type ListMultipartUploadsCommandOutput,
  type ListPartsCommandInput,
  type ListPartsCommandOutput,
  GetObjectAttributesCommandInput,
  GetObjectAttributesCommandOutput,
  RestoreObjectCommandInput,
  RestoreObjectCommandOutput,
} from '@aws-sdk/client-s3';

import {
  createObjectCommand,
  createBucketCommand,
  createMultipartCommand,
  createSecurityCommand,
  type S3CommandOptions,
} from './client';

// ----------------------------------------
// Default Configurations
// ----------------------------------------

/**
 * Default configuration for object operations
 * Includes retry logic and circuit breaking for object reliability
 */
const _OBJECT_OPERATION_DEFAULTS: S3CommandOptions = {
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
 * Default configuration for bucket operations
 * Conservative timeouts and circuit breaking for administrative tasks
 */
const _BUCKET_OPERATION_DEFAULTS: S3CommandOptions = {
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
 * Default configuration for multipart upload operations
 * Extended timeouts and retries for handling multiple parts
 */
const _MULTIPART_OPERATION_DEFAULTS: S3CommandOptions = {
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
 * Default configuration for security operations
 * Ensures encryption and access controls are consistently applied
 */
const _SECURITY_OPERATION_DEFAULTS: S3CommandOptions = {
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
      allowedPrincipals: ['arn:aws:iam::123456789012:role/S3AccessRole'],
    },
  },
  checksum: {
    enabled: false,
  },
};

// ----------------------------------------
// Object Operations
// ----------------------------------------

/**
 * PutObjectCommand - Uploads an object to S3
 * @example
 * ```typescript
 * const result = await ObjectOperations.PutObjectCommand({
 *   Bucket: "my-bucket",
 *   Key: "example.txt",
 *   Body: "Hello World",
 *   ContentType: "text/plain"
 * }, {
 *   validation: {
 *     object: {
 *       enforceEncryption: true
 *     }
 *   }
 * });
 * ```
 */
export const PutObjectCommand = createObjectCommand<
  PutObjectCommandInput,
  PutObjectCommandOutput
>('PutObject', AWSPutObjectCommand);

/**
 * GetObjectCommand - Retrieves an object from S3
 * @example
 * ```typescript
 * const data = await ObjectOperations.GetObjectCommand({
 *   Bucket: "my-bucket",
 *   Key: "example.txt"
 * });
 * ```
 */
export const GetObjectCommand = createObjectCommand<
  GetObjectCommandInput,
  GetObjectCommandOutput
>('GetObject', AWSGetObjectCommand);

/**
 * DeleteObjectCommand - Deletes an object from S3
 * @example
 * ```typescript
 * await ObjectOperations.DeleteObjectCommand({
 *   Bucket: "my-bucket",
 *   Key: "example.txt"
 * });
 * ```
 */
export const DeleteObjectCommand = createObjectCommand<
  DeleteObjectCommandInput,
  DeleteObjectCommandOutput
>('DeleteObject', AWSDeleteObjectCommand);

/**
 * DeleteObjectsCommand - Deletes multiple objects from S3 in a single request
 * @example
 * ```typescript
 * await ObjectOperations.DeleteObjectsCommand({
 *   Bucket: "my-bucket",
 *   Delete: {
 *     Objects: [
 *       { Key: "example1.txt" },
 *       { Key: "example2.txt" }
 *     ],
 *     Quiet: false
 *   }
 * });
 * ```
 */
export const DeleteObjectsCommand = createObjectCommand<
  DeleteObjectsCommandInput,
  DeleteObjectsCommandOutput
>('DeleteObjects', AWSDeleteObjectsCommand);

/**
 * HeadObjectCommand - Retrieves metadata from an object without returning the object itself
 * @example
 * ```typescript
 * const metadata = await ObjectOperations.HeadObjectCommand({
 *   Bucket: "my-bucket",
 *   Key: "example.txt"
 * });
 * ```
 */
export const HeadObjectCommand = createObjectCommand<
  HeadObjectCommandInput,
  HeadObjectCommandOutput
>('HeadObject', AWSHeadObjectCommand);

/**
 * CopyObjectCommand - Creates a copy of an object that is already stored in S3
 * @example
 * ```typescript
 * const copyResult = await ObjectOperations.CopyObjectCommand({
 *   Bucket: "destination-bucket",
 *   CopySource: "source-bucket/example.txt",
 *   Key: "copied-example.txt"
 * });
 * ```
 */
export const CopyObjectCommand = createObjectCommand<
  CopyObjectCommandInput,
  CopyObjectCommandOutput
>('CopyObject', AWSCopyObjectCommand);

/**
 * GetObjectAttributesCommand - Retrieves attributes of an object
 * @example
 * ```typescript
 * const attributes = await ObjectOperations.GetObjectAttributesCommand({
 *   Bucket: "my-bucket",
 *   Key: "example.txt",
 *   ObjectAttributes: ["Metadata", "StorageClass"]
 * });
 * ```
 */
export const GetObjectAttributesCommand = createObjectCommand<
  GetObjectAttributesCommandInput,
  GetObjectAttributesCommandOutput
>('GetObjectAttributes', AWSGetObjectAttributesCommand);

/**
 * RestoreObjectCommand - Restores an archived object from Glacier or Deep Archive
 * @example
 * ```typescript
 * await ObjectOperations.RestoreObjectCommand({
 *   Bucket: "my-bucket",
 *   Key: "archived-example.txt",
 *   RestoreRequest: {
 *     Days: 7,
 *     GlacierJobParameters: {
 *       Tier: "Standard"
 *     }
 *   }
 * });
 * ```
 */
export const RestoreObjectCommand = createObjectCommand<
  RestoreObjectCommandInput,
  RestoreObjectCommandOutput
>('RestoreObject', AWSRestoreObjectCommand);

// ----------------------------------------
// Bucket Operations
// ----------------------------------------

/**
 * CreateBucketCommand - Creates a new S3 bucket
 * @example
 * ```typescript
 * const bucket = await BucketOperations.CreateBucketCommand({
 *   Bucket: "my-new-bucket",
 *   CreateBucketConfiguration: {
 *     LocationConstraint: "us-west-2"
 *   },
 *   ObjectOwnership: "BucketOwnerEnforced"
 * }, {
 *   validation: {
 *     bucket: {
 *       requireEncryption: true
 *     }
 *   }
 * });
 * ```
 */
export const CreateBucketCommand = createBucketCommand<
  CreateBucketCommandInput,
  CreateBucketCommandOutput
>('CreateBucket', AWSCreateBucketCommand);

/**
 * DeleteBucketCommand - Deletes an existing S3 bucket
 * @example
 * ```typescript
 * await BucketOperations.DeleteBucketCommand({
 *   Bucket: "my-old-bucket"
 * });
 * ```
 */
export const DeleteBucketCommand = createBucketCommand<
  DeleteBucketCommandInput,
  DeleteBucketCommandOutput
>('DeleteBucket', AWSDeleteBucketCommand);

/**
 * ListBucketsCommand - Lists all S3 buckets in your AWS account
 * @example
 * ```typescript
 * const buckets = await BucketOperations.ListBucketsCommand({});
 * console.log(buckets.Buckets);
 * ```
 */
export const ListBucketsCommand = createBucketCommand<
  ListBucketsCommandInput,
  ListBucketsCommandOutput
>('ListBuckets', AWSListBucketsCommand);

/**
 * PutBucketPolicyCommand - Applies a policy to a specified bucket
 * @example
 * ```typescript
 * await BucketOperations.PutBucketPolicyCommand({
 *   Bucket: "my-bucket",
 *   Policy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: "*",
 *         Action: "s3:GetObject",
 *         Resource: "arn:aws:s3:::my-bucket/*"
 *       }
 *     ]
 *   })
 * });
 * ```
 */
export const PutBucketPolicyCommand = createBucketCommand<
  PutBucketPolicyCommandInput,
  PutBucketPolicyCommandOutput
>('PutBucketPolicy', AWSPutBucketPolicyCommand);

/**
 * GetBucketPolicyCommand - Retrieves the policy of a specified bucket
 * @example
 * ```typescript
 * const policy = await BucketOperations.GetBucketPolicyCommand({
 *   Bucket: "my-bucket"
 * });
 * console.log(policy.Policy);
 * ```
 */
export const GetBucketPolicyCommand = createBucketCommand<
  GetBucketPolicyCommandInput,
  GetBucketPolicyCommandOutput
>('GetBucketPolicy', AWSGetBucketPolicyCommand);

/**
 * PutBucketLifecycleConfigurationCommand - Sets the lifecycle configuration for a bucket
 * @example
 * ```typescript
 * await BucketOperations.PutBucketLifecycleConfigurationCommand({
 *   Bucket: "my-bucket",
 *   LifecycleConfiguration: {
 *     Rules: [
 *       {
 *         ID: "Archive old logs",
 *         Prefix: "logs/",
 *         Status: "Enabled",
 *         Transition: {
 *           Days: 30,
 *           StorageClass: "GLACIER"
 *         }
 *       }
 *     ]
 *   }
 * });
 * ```
 */
export const PutBucketLifecycleConfigurationCommand = createBucketCommand<
  PutBucketLifecycleConfigurationCommandInput,
  PutBucketLifecycleConfigurationCommandOutput
>('PutBucketLifecycleConfiguration', AWSPutBucketLifecycleConfigurationCommand);

/**
 * GetBucketLifecycleConfigurationCommand - Retrieves the lifecycle configuration of a bucket
 * @example
 * ```typescript
 * const lifecycle = await BucketOperations.GetBucketLifecycleConfigurationCommand({
 *   Bucket: "my-bucket"
 * });
 * console.log(lifecycle.Rules);
 * ```
 */
export const GetBucketLifecycleConfigurationCommand = createBucketCommand<
  GetBucketLifecycleConfigurationCommandInput,
  GetBucketLifecycleConfigurationCommandOutput
>('GetBucketLifecycleConfiguration', AWSGetBucketLifecycleConfigurationCommand);

// ----------------------------------------
// Multipart Upload Operations
// ----------------------------------------

/**
 * CreateMultipartUploadCommand - Initiates a multipart upload and returns an upload ID
 * @example
 * ```typescript
 * const multipartUpload = await MultipartOperations.CreateMultipartUploadCommand({
 *   Bucket: "my-bucket",
 *   Key: "large-file.zip",
 *   ContentType: "application/zip"
 * }, {
 *   multipart: {
 *     partSize: 10 * 1024 * 1024, // 10MB parts
 *     queueSize: 4
 *   }
 * });
 * ```
 */
export const CreateMultipartUploadCommand = createMultipartCommand<
  CreateMultipartUploadCommandInput,
  CreateMultipartUploadCommandOutput
>('CreateMultipartUpload', AWSCreateMultipartUploadCommand);

/**
 * UploadPartCommand - Uploads a single part in a multipart upload
 * @example
 * ```typescript
 * const partUpload = await MultipartOperations.UploadPartCommand({
 *   Bucket: "my-bucket",
 *   Key: "large-file.zip",
 *   UploadId: uploadId,
 *   PartNumber: 1,
 *   Body: partData
 * });
 * ```
 */
export const UploadPartCommand = createMultipartCommand<
  UploadPartCommandInput,
  UploadPartCommandOutput
>('UploadPart', AWSUploadPartCommand);

/**
 * CompleteMultipartUploadCommand - Completes a multipart upload by assembling previously uploaded parts
 * @example
 * ```typescript
 * await MultipartOperations.CompleteMultipartUploadCommand({
 *   Bucket: "my-bucket",
 *   Key: "large-file.zip",
 *   UploadId: uploadId,
 *   MultipartUpload: { Parts: parts }
 * });
 * ```
 */
export const CompleteMultipartUploadCommand = createMultipartCommand<
  CompleteMultipartUploadCommandInput,
  CompleteMultipartUploadCommandOutput
>('CompleteMultipartUpload', AWSCompleteMultipartUploadCommand);

/**
 * AbortMultipartUploadCommand - Aborts a multipart upload, discarding any uploaded parts
 * @example
 * ```typescript
 * await MultipartOperations.AbortMultipartUploadCommand({
 *   Bucket: "my-bucket",
 *   Key: "large-file.zip",
 *   UploadId: uploadId
 * });
 * ```
 */
export const AbortMultipartUploadCommand = createMultipartCommand<
  AbortMultipartUploadCommandInput,
  AbortMultipartUploadCommandOutput
>('AbortMultipartUpload', AWSAbortMultipartUploadCommand);

/**
 * ListMultipartUploadsCommand - Lists in-progress multipart uploads for a bucket
 * @example
 * ```typescript
 * const uploads = await MultipartOperations.ListMultipartUploadsCommand({
 *   Bucket: "my-bucket"
 * });
 * console.log(uploads.Uploads);
 * ```
 */
export const ListMultipartUploadsCommand = createMultipartCommand<
  ListMultipartUploadsCommandInput,
  ListMultipartUploadsCommandOutput
>('ListMultipartUploads', AWSListMultipartUploadsCommand);

/**
 * ListPartsCommand - Lists the parts that have been uploaded for a specific multipart upload
 * @example
 * ```typescript
 * const parts = await MultipartOperations.ListPartsCommand({
 *   Bucket: "my-bucket",
 *   Key: "large-file.zip",
 *   UploadId: uploadId
 * });
 * console.log(parts.Parts);
 * ```
 */
export const ListPartsCommand = createMultipartCommand<
  ListPartsCommandInput,
  ListPartsCommandOutput
>('ListParts', AWSListPartsCommand);

// ----------------------------------------
// Security Operations
// ----------------------------------------

/**
 * PutBucketEncryptionCommand - Sets the encryption configuration for a bucket
 * @example
 * ```typescript
 * await SecurityOperations.PutBucketEncryptionCommand({
 *   Bucket: "my-secure-bucket",
 *   ServerSideEncryptionConfiguration: {
 *     Rules: [
 *       {
 *         ApplyServerSideEncryptionByDefault: {
 *           SSEAlgorithm: "AES256"
 *         }
 *       }
 *     ]
 *   }
 * });
 * ```
 */
export const PutBucketEncryptionCommand = createSecurityCommand<
  PutBucketEncryptionCommandInput,
  PutBucketEncryptionCommandOutput
>('PutBucketEncryption', AWSPutBucketEncryptionCommand);

/**
 * GetBucketEncryptionCommand - Retrieves the encryption configuration of a bucket
 * @example
 * ```typescript
 * const encryption = await SecurityOperations.GetBucketEncryptionCommand({
 *   Bucket: "my-secure-bucket"
 * });
 * console.log(encryption.ServerSideEncryptionConfiguration);
 * ```
 */
export const GetBucketEncryptionCommand = createSecurityCommand<
  GetBucketEncryptionCommandInput,
  GetBucketEncryptionCommandOutput
>('GetBucketEncryption', AWSGetBucketEncryptionCommand);

/**
 * DeleteBucketEncryptionCommand - Removes the encryption configuration from a bucket
 * @example
 * ```typescript
 * await SecurityOperations.DeleteBucketEncryptionCommand({
 *   Bucket: "my-secure-bucket"
 * });
 * ```
 */
export const DeleteBucketEncryptionCommand = createSecurityCommand<
  DeleteBucketEncryptionCommandInput,
  DeleteBucketEncryptionCommandOutput
>('DeleteBucketEncryption', AWSDeleteBucketEncryptionCommand);

/**
 * PutPublicAccessBlockCommand - Sets the public access block configuration for a bucket
 * @example
 * ```typescript
 * await SecurityOperations.PutPublicAccessBlockCommand({
 *   Bucket: "my-bucket",
 *   PublicAccessBlockConfiguration: {
 *     BlockPublicAcls: true,
 *     IgnorePublicAcls: true,
 *     BlockPublicPolicy: true,
 *     RestrictPublicBuckets: true
 *   }
 * });
 * ```
 */
export const PutPublicAccessBlockCommand = createSecurityCommand<
  PutPublicAccessBlockCommandInput,
  PutPublicAccessBlockCommandOutput
>('PutPublicAccessBlock', AWSPutPublicAccessBlockCommand);

/**
 * GetPublicAccessBlockCommand - Retrieves the public access block configuration of a bucket
 * @example
 * ```typescript
 * const publicAccess = await SecurityOperations.GetPublicAccessBlockCommand({
 *   Bucket: "my-bucket"
 * });
 * console.log(publicAccess.PublicAccessBlockConfiguration);
 * ```
 */
export const GetPublicAccessBlockCommand = createSecurityCommand<
  GetPublicAccessBlockCommandInput,
  GetPublicAccessBlockCommandOutput
>('GetPublicAccessBlock', AWSGetPublicAccessBlockCommand);

// ----------------------------------------
// Export Operation Groups
// ----------------------------------------

export const ObjectOperations = {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  GetObjectAttributesCommand,
  RestoreObjectCommand,
};

export const BucketOperations = {
  CreateBucketCommand,
  DeleteBucketCommand,
  ListBucketsCommand,
  PutBucketPolicyCommand,
  GetBucketPolicyCommand,
  PutBucketLifecycleConfigurationCommand,
  GetBucketLifecycleConfigurationCommand,
};

export const MultipartOperations = {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListMultipartUploadsCommand,
  ListPartsCommand,
};

export const SecurityOperations = {
  PutBucketEncryptionCommand,
  GetBucketEncryptionCommand,
  DeleteBucketEncryptionCommand,
  PutPublicAccessBlockCommand,
  GetPublicAccessBlockCommand,
};

// ----------------------------------------
// Export Everything Individually as Well
// ----------------------------------------

export * from './client';

/**
 * Usage Examples:
 *
 * @example
 * // Simple object upload
 * const result = await ObjectOperations.PutObjectCommand({
 *   Bucket: "my-bucket",
 *   Key: "example.txt",
 *   Body: "Hello World",
 *   ContentType: "text/plain"
 * }, {
 *   validation: {
 *     object: {
 *       enforceEncryption: true
 *     }
 *   }
 * });
 *
 * @example
 * // Multipart upload with progress tracking
 * const multipartUpload = await MultipartOperations.CreateMultipartUploadCommand({
 *   Bucket: "my-bucket",
 *   Key: "large-file.zip",
 *   ContentType: "application/zip"
 * }, {
 *   multipart: {
 *     partSize: 10 * 1024 * 1024, // 10MB parts
 *     queueSize: 4
 *   }
 * });
 *
 * const uploadId = multipartUpload.UploadId;
 * const parts = [];
 *
 * // Upload parts
 * for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
 *   const partUpload = await MultipartOperations.UploadPartCommand({
 *     Bucket: "my-bucket",
 *     Key: "large-file.zip",
 *     UploadId: uploadId,
 *     PartNumber: partNumber,
 *     Body: partData
 *   });
 *   parts.push({
 *     PartNumber: partNumber,
 *     ETag: partUpload.ETag
 *   });
 * }
 *
 * // Complete the multipart upload
 * await MultipartOperations.CompleteMultipartUploadCommand({
 *   Bucket: "my-bucket",
 *   Key: "large-file.zip",
 *   UploadId: uploadId,
 *   MultipartUpload: { Parts: parts }
 * });
 *
 * @example
 * // Create bucket with encryption
 * const bucket = await BucketOperations.CreateBucketCommand({
 *   Bucket: "my-secure-bucket",
 *   ObjectOwnership: "BucketOwnerEnforced"
 * }, {
 *   validation: {
 *     bucket: {
 *       requireEncryption: true
 *     }
 *   }
 * });
 */
