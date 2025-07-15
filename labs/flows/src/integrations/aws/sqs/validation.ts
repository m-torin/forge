// src/integrations/aws/sqs/validation.ts

import { OperationContext } from '#/lib/integrationFactory';
import {
  SQSErrorCode,
  createSQSValidationError,
  type SQSErrorMetadata,
} from './errors';
import { SendMessageCommandInput } from '@aws-sdk/client-sqs';

// ----------------------------------------
// Validation Helper Functions
// ----------------------------------------

/**
 * Validates DelaySeconds attribute
 */
export const validateDelaySeconds = (
  value: number,
  options?: SQSValidationOptions['timing'],
): void => {
  const {
    minDelaySeconds,
    maxDelaySeconds,
    validateDelaySeconds: shouldValidate,
  } = options || {};

  if (shouldValidate) {
    if (minDelaySeconds !== undefined && value < minDelaySeconds) {
      throw createSQSValidationError(
        `DelaySeconds ${value} is less than minimum allowed ${minDelaySeconds}`,
        SQSErrorCode.VISIBILITY_TIMEOUT_INVALID,
        'ValidateDelaySeconds',
        { delaySeconds: value, minDelaySeconds },
      );
    }
    if (maxDelaySeconds !== undefined && value > maxDelaySeconds) {
      throw createSQSValidationError(
        `DelaySeconds ${value} exceeds maximum allowed ${maxDelaySeconds}`,
        SQSErrorCode.VISIBILITY_TIMEOUT_INVALID,
        'ValidateDelaySeconds',
        { delaySeconds: value, maxDelaySeconds },
      );
    }
  }
};

/**
 * Validates MaxMessageSize attribute
 */
export const validateMaxMessageSize = (value: number): void => {
  const MAX_SIZE = 256 * 1024; // 256 KB

  if (value > MAX_SIZE) {
    throw createSQSValidationError(
      `MaxMessageSize ${value} exceeds AWS limit of ${MAX_SIZE} bytes`,
      SQSErrorCode.MESSAGE_TOO_LARGE,
      'ValidateMaxMessageSize',
      { maxMessageSize: value, limit: MAX_SIZE },
    );
  }
};

/**
 * Validates MessageRetentionPeriod attribute
 */
export const validateRetentionPeriod = (value: number): void => {
  const MIN_RETENTION = 60; // 60 seconds
  const MAX_RETENTION = 1209600; // 14 days in seconds

  if (value < MIN_RETENTION || value > MAX_RETENTION) {
    throw createSQSValidationError(
      `MessageRetentionPeriod ${value} seconds is out of bounds (${MIN_RETENTION}-${MAX_RETENTION})`,
      SQSErrorCode.VISIBILITY_TIMEOUT_INVALID,
      'ValidateRetentionPeriod',
      { messageRetentionPeriod: value, min: MIN_RETENTION, max: MAX_RETENTION },
    );
  }
};

/**
 * Validates VisibilityTimeout attribute
 */
export const validateVisibilityTimeout = (
  value: number,
  options?: SQSValidationOptions['timing'],
): void => {
  const {
    minVisibilityTimeout,
    maxVisibilityTimeout,
    validateVisibilityTimeout,
  } = options || {};

  if (validateVisibilityTimeout) {
    if (minVisibilityTimeout !== undefined && value < minVisibilityTimeout) {
      throw createSQSValidationError(
        `VisibilityTimeout ${value} is less than minimum allowed ${minVisibilityTimeout}`,
        SQSErrorCode.VISIBILITY_TIMEOUT_INVALID,
        'ValidateVisibilityTimeout',
        { visibilityTimeout: value, minVisibilityTimeout },
      );
    }
    if (maxVisibilityTimeout !== undefined && value > maxVisibilityTimeout) {
      throw createSQSValidationError(
        `VisibilityTimeout ${value} exceeds maximum allowed ${maxVisibilityTimeout}`,
        SQSErrorCode.VISIBILITY_TIMEOUT_INVALID,
        'ValidateVisibilityTimeout',
        { visibilityTimeout: value, maxVisibilityTimeout },
      );
    }
  }
};

/**
 * Validates the structure of RedrivePolicy
 */
export const validateRedrivePolicyStructure = (redrivePolicy: string): void => {
  try {
    const policy = JSON.parse(redrivePolicy);
    if (
      !policy.deadLetterTargetArn ||
      typeof policy.deadLetterTargetArn !== 'string'
    ) {
      throw new Error('RedrivePolicy must include a valid deadLetterTargetArn');
    }
    if (
      policy.maxReceiveCount === undefined ||
      typeof policy.maxReceiveCount !== 'number'
    ) {
      throw new Error('RedrivePolicy must include a valid maxReceiveCount');
    }
  } catch (error) {
    throw createSQSValidationError(
      `Invalid RedrivePolicy structure: ${(error as Error).message}`,
      SQSErrorCode.REDRIVE_POLICY_STRUCTURE_INVALID,
      'ValidateRedrivePolicyStructure',
      { RedrivePolicy: redrivePolicy },
    );
  }
};

/**
 * Validates enhanced queue tags
 */
export const validateQueueTagsEnhanced = (
  tags: Record<string, string>,
): void => {
  for (const [key, value] of Object.entries(tags)) {
    // Example: Ensure tag keys follow a specific pattern
    if (!/^[a-zA-Z0-9-_]+$/.test(key)) {
      throw createSQSValidationError(
        `Invalid tag key format: ${key}`,
        SQSErrorCode.QUEUE_TAG_INVALID_KEY,
        'ValidateQueueTagsEnhanced',
        { tagKey: key },
      );
    }

    // Example: Ensure tag values are not empty
    if (value.trim() === '') {
      throw createSQSValidationError(
        `Tag value for key '${key}' cannot be empty`,
        SQSErrorCode.QUEUE_TAG_INVALID_VALUE,
        'ValidateQueueTagsEnhanced',
        { tagKey: key },
      );
    }

    // Add more tag validations as needed
  }
};

/**
 * Validates message attributes
 */
export const validateMessageAttributes = (
  attributes: Record<string, any>,
  options: SQSValidationOptions['message'],
): void => {
  if (options?.validateMessageAttributes) {
    for (const [key, value] of Object.entries(attributes)) {
      // Validate attribute key
      if (typeof key !== 'string' || key.trim() === '') {
        throw createSQSValidationError(
          `Invalid message attribute key: ${key}`,
          SQSErrorCode.MESSAGE_ATTRIBUTE_INVALID_KEY,
          'ValidateMessageAttributes',
          { attributeKey: key },
        );
      }

      // Validate attribute value type
      const validTypes = ['String', 'Number', 'Binary'];
      if (!validTypes.includes(value.DataType)) {
        throw createSQSValidationError(
          `Invalid data type for attribute '${key}': ${value.DataType}`,
          SQSErrorCode.MESSAGE_ATTRIBUTE_INVALID_TYPE,
          'ValidateMessageAttributes',
          { attributeKey: key, dataType: value.DataType },
        );
      }

      // Add more attribute validations as needed
    }
  }
};

/**
 * Validates queue attributes
 */
export const validateQueueAttributes = (
  attributes: Record<string, any>,
  options: SQSValidationOptions['queue'],
): void => {
  if (options?.validateAttributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (!options.allowedAttributes?.includes(key)) {
        throw createSQSValidationError(
          `Disallowed queue attribute: ${key}`,
          SQSErrorCode.QUEUE_ATTRIBUTE_DISALLOWED,
          'ValidateQueueAttributes',
          { attributeKey: key },
        );
      }

      // Example: Validate specific attribute formats
      switch (key) {
        case 'KmsMasterKeyId':
          validateKmsKeyArn(value);
          break;
        // Add more attribute-specific validations as needed
        default:
          break;
      }
    }
  }
};

/**
 * Validates FIFO queue names
 */
export const validateFifoQueueName = (
  queueName: string,
  isFIFO: boolean,
): void => {
  if (isFIFO && !queueName.endsWith('.fifo')) {
    throw createSQSValidationError(
      'FIFO queue names must end with .fifo',
      SQSErrorCode.QUEUE_FIFONAME_INVALID,
      'ValidateFifoQueueName',
      { queueName },
    );
  }
};

/**
 * Validates the content of the message body
 */
export const validateMessageBodyContent = (body: string): void => {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Message body must be a JSON object');
    }
    // Add more content-specific validations as needed
  } catch (error) {
    throw createSQSValidationError(
      `Invalid message body content: ${(error as Error).message}`,
      SQSErrorCode.MESSAGE_BODY_INVALID,
      'ValidateMessageBodyContent',
      { body },
    );
  }
};

/**
 * Validates Dead Letter Queue (DLQ) configuration
 */
export const validateDLQConfiguration = (redrivePolicy: string): void => {
  try {
    const policy = JSON.parse(redrivePolicy);
    if (
      !policy.deadLetterTargetArn ||
      typeof policy.deadLetterTargetArn !== 'string'
    ) {
      throw new Error(
        'RedrivePolicy must include deadLetterTargetArn and it must be a string',
      );
    }
    if (
      policy.maxReceiveCount === undefined ||
      typeof policy.maxReceiveCount !== 'number'
    ) {
      throw new Error(
        'RedrivePolicy must include maxReceiveCount and it must be a number',
      );
    }
    validateMaxReceiveCount(policy.maxReceiveCount);
  } catch (error) {
    throw createSQSValidationError(
      `Invalid RedrivePolicy format: ${(error as Error).message}`,
      SQSErrorCode.REDRIVE_POLICY_INVALID,
      'ValidateDLQConfiguration',
      { RedrivePolicy: redrivePolicy },
    );
  }
};

/**
 * Validates the maximum receive count in DLQ configuration
 */
export const validateMaxReceiveCount = (maxReceiveCount: number): void => {
  if (
    !Number.isInteger(maxReceiveCount) ||
    maxReceiveCount < 1 ||
    maxReceiveCount > 100
  ) {
    throw createSQSValidationError(
      `Invalid maxReceiveCount: ${maxReceiveCount}. Must be an integer between 1 and 100`,
      SQSErrorCode.MAX_RECEIVE_COUNT_INVALID,
      'ValidateMaxReceiveCount',
      { maxReceiveCount },
    );
  }
};

/**
 * Validates the KMS Key ARN format
 */
export const validateKmsKeyArn = (kmsKeyArn: string): void => {
  const kmsArnRegex = /^arn:aws:kms:[a-z\-0-9]+:\d{12}:key\/[a-f0-9\-]{36}$/;
  if (!kmsArnRegex.test(kmsKeyArn)) {
    throw createSQSValidationError(
      `Invalid KMS Key ARN format: ${kmsKeyArn}`,
      SQSErrorCode.KMS_KEY_INVALID_FORMAT,
      'ValidateKmsKeyArn',
      { kmsKeyArn },
    );
  }
};

/**
 * Validates encryption at rest configuration
 */
export const validateEncryptionAtRest = (
  attributes: Record<string, any>,
): void => {
  const encryptionEnabled =
    attributes?.KmsMasterKeyId || attributes?.EncryptionEnabled;
  if (!encryptionEnabled) {
    throw createSQSValidationError(
      'Encryption at rest must be enabled for the queue',
      SQSErrorCode.ENCRYPTION_NOT_ENABLED,
      'ValidateEncryptionAtRest',
      {},
    );
  }
};

/**
 * Validates Visibility Timeout consistency between main queue and DLQ
 */
export const validateVisibilityTimeoutConsistency = (
  mainQueueTimeout: number,
  dlqTimeout: number,
): void => {
  if (dlqTimeout > mainQueueTimeout) {
    throw createSQSValidationError(
      `DLQ VisibilityTimeout (${dlqTimeout}) cannot exceed main queue VisibilityTimeout (${mainQueueTimeout})`,
      SQSErrorCode.VISIBILITY_TIMEOUT_INCONSISTENT,
      'ValidateVisibilityTimeoutConsistency',
      { mainQueueTimeout, dlqTimeout },
    );
  }
};

/**
 * Validates FIFO queue specific message properties
 */
export const validateFIFOMessage = (
  input: SendMessageCommandInput,
  _options: SQSValidationOptions['message'],
): void => {
  if (!input.MessageGroupId) {
    throw createSQSValidationError(
      'FIFO messages must include MessageGroupId',
      SQSErrorCode.MESSAGE_GROUP_ID_REQUIRED,
      'ValidateFIFOMessage',
      {},
    );
  }
  // Additional FIFO-specific validations can be added here
};

/**
 * Validates the presence of MessageDeduplicationId for FIFO queues
 */
export const validateMessageDeduplicationId = (
  input: SendMessageCommandInput,
  contentBasedDeduplication: boolean,
): void => {
  if (!input.MessageDeduplicationId && !contentBasedDeduplication) {
    throw createSQSValidationError(
      'FIFO messages must include MessageDeduplicationId or enable ContentBasedDeduplication',
      SQSErrorCode.MESSAGE_DEDUPLICATION_ID_REQUIRED,
      'ValidateMessageDeduplicationId',
      {},
    );
  }
};

/**
 * Validates Content-Based Deduplication for FIFO queues
 */
export const validateContentBasedDeduplication = (
  contentBasedDeduplication: boolean,
  isFIFO: boolean,
): void => {
  if (isFIFO) {
    if (!contentBasedDeduplication) {
      throw createSQSValidationError(
        'FIFO queues require ContentBasedDeduplication to be enabled',
        SQSErrorCode.CONTENT_BASED_DEDUPLICATION_REQUIRED,
        'ValidateContentBasedDeduplication',
        {},
      );
    }
  }
};

// ----------------------------------------
// Main Validation Function
// ----------------------------------------

/**
 * Main validation function for SQS inputs
 */
export const validateSQSInput = (
  input: any,
  operationName: string,
  options: SQSValidationOptions = DEFAULT_VALIDATION_OPTIONS,
  context?: OperationContext,
): ValidationResult => {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    metadata: {},
  };

  try {
    // Message Validation
    if ('MessageBody' in input) {
      validateMessage(
        input.MessageBody,
        input.MessageAttributes,
        options.message,
      );
      validateMessageBodyContent(input.MessageBody);
    }

    // Batch Validation
    if ('Entries' in input) {
      validateBatch(input.Entries, options.batch);
    }

    // Queue Validation
    if ('QueueName' in input) {
      validateQueue(input.QueueName, input.Attributes, options.queue);
      if (options.queue?.fifo) {
        validateFifoQueueName(input.QueueName, true);
      }
    }

    // Timing Validation
    if ('VisibilityTimeout' in input.Attributes) {
      validateVisibilityTimeout(
        input.Attributes.VisibilityTimeout,
        options.timing,
      );
    }

    if ('DelaySeconds' in input.Attributes) {
      validateDelaySeconds(input.Attributes.DelaySeconds, options.timing);
    }

    // Security Validation
    if (options.security?.validatePolicy && 'Policy' in input.Attributes) {
      validateIAMPolicy(input.Attributes.Policy);
      validateCrossAccountAccess(input.Attributes.Policy);
      if (options.security.validatePolicyStatements) {
        validatePolicyStatements(input.Attributes.Policy);
      }
    }

    if (
      options.security?.validateEncryptionAtRest &&
      input.Attributes?.KmsMasterKeyId
    ) {
      validateEncryptionAtRest(input.Attributes);
    }

    // Dead Letter Queue (DLQ) Validation
    if ('RedrivePolicy' in input.Attributes) {
      validateRedrivePolicyStructure(input.Attributes.RedrivePolicy);
      validateDLQConfiguration(input.Attributes.RedrivePolicy);
    }

    // FIFO Specific Validations
    if ('MessageGroupId' in input) {
      const contentBasedDeduplication =
        input.Attributes?.ContentBasedDeduplication || false;
      validateFIFOMessage(input as SendMessageCommandInput, options.message);
      validateMessageDeduplicationId(
        input as SendMessageCommandInput,
        contentBasedDeduplication,
      );
      validateContentBasedDeduplication(
        contentBasedDeduplication,
        options.queue?.fifo || false,
      );
    }

    // Queue Tags Validation
    if ('Tags' in input.Attributes && options.queue?.validateTags) {
      validateQueueTagsEnhanced(input.Attributes.Tags);
    }

    // Custom Validations
    if (options.custom?.validators) {
      for (const validator of options.custom.validators) {
        validator(input);
      }
    }

    // Visibility Timeout Consistency (Example usage)
    if (
      input.Attributes?.VisibilityTimeout &&
      input.Attributes?.RedrivePolicy
    ) {
      const dlqPolicy = JSON.parse(input.Attributes.RedrivePolicy);
      const dlqTimeout = dlqPolicy.visibilityTimeout;
      validateVisibilityTimeoutConsistency(
        input.Attributes.VisibilityTimeout,
        dlqTimeout,
      );
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
      // Assigning a new object to replace readonly Record<string, unknown>
      (context as any).metadata = newMetadata;
    }
  } catch (error) {
    result.valid = false;
    if (error instanceof Error) {
      result.errors.push({
        sqsErrorCode: SQSErrorCode.GENERAL_VALIDATION_ERROR, // Replace with specific code if applicable
        message: error.message,
        operation: operationName,
        timestamp: new Date().toISOString(),
      } as SQSErrorMetadata);
    }
  }

  return result;
};

// ----------------------------------------
// Remaining Validation Functions
// ----------------------------------------

/**
 * Validates individual message content
 */
export const validateMessage = (
  body: string,
  attributes: Record<string, any> = {},
  options: SQSValidationOptions['message'] = DEFAULT_VALIDATION_OPTIONS.message,
): void => {
  // Validate message size
  const messageSize = new TextEncoder().encode(body).length;
  if (options?.maxSize && messageSize > options.maxSize) {
    throw createSQSValidationError(
      `Message size ${messageSize} bytes exceeds limit of ${options.maxSize} bytes`,
      SQSErrorCode.MESSAGE_TOO_LARGE,
      'ValidateMessage',
      { messageSize, limit: options.maxSize },
    );
  }

  // Validate message format
  if (options?.format && !options.format.test(body)) {
    throw createSQSValidationError(
      'Message format validation failed',
      SQSErrorCode.MESSAGE_INVALID_FORMAT,
      'ValidateMessage',
      {},
    );
  }

  // Validate message attributes
  if (Object.keys(attributes).length > 0) {
    validateMessageAttributes(attributes, options);
  }
};

/**
 * Validates batch operations
 */
export const validateBatch = (
  entries: any[],
  options: SQSValidationOptions['batch'] = DEFAULT_VALIDATION_OPTIONS.batch,
): void => {
  if (!Array.isArray(entries)) {
    throw createSQSValidationError(
      'Batch entries must be an array',
      SQSErrorCode.BATCH_ENTRY_INVALID,
      'ValidateBatch',
      {},
    );
  }

  // Validate batch size
  if (options?.maxSize && entries.length > options.maxSize) {
    throw createSQSValidationError(
      `Batch size ${entries.length} exceeds maximum of ${options.maxSize}`,
      SQSErrorCode.BATCH_SIZE_EXCEEDED,
      'ValidateBatch',
      { batchSize: entries.length, maxSize: options.maxSize },
    );
  }

  if (options?.minSize && entries.length < options.minSize) {
    throw createSQSValidationError(
      `Batch size ${entries.length} below minimum of ${options.minSize}`,
      SQSErrorCode.BATCH_ENTRY_INVALID,
      'ValidateBatch',
      { batchSize: entries.length, minSize: options.minSize },
    );
  }

  // Validate unique IDs
  if (options?.enforceUniqueIds) {
    const messageIds = new Set();
    for (const entry of entries) {
      if (messageIds.has(entry.Id)) {
        throw createSQSValidationError(
          `Duplicate message ID found: ${entry.Id}`,
          SQSErrorCode.BATCH_ID_DUPLICATED,
          'ValidateBatch',
          { duplicateId: entry.Id },
        );
      }
      messageIds.add(entry.Id);
    }
  }

  // Validate total batch size
  if (options?.maxTotalSize) {
    let totalSize = 0;
    for (const entry of entries) {
      totalSize += new TextEncoder().encode(entry.MessageBody).length;
      if (totalSize > options.maxTotalSize) {
        throw createSQSValidationError(
          `Total batch size exceeds maximum of ${options.maxTotalSize} bytes`,
          SQSErrorCode.BATCH_SIZE_EXCEEDED,
          'ValidateBatch',
          { totalSize, maxTotalSize: options.maxTotalSize },
        );
      }
    }
  }
};

/**
 * Validates queue configuration
 */
export const validateQueue = (
  queueName: string,
  attributes: Record<string, any> = {},
  options: SQSValidationOptions['queue'] = DEFAULT_VALIDATION_OPTIONS.queue,
): void => {
  // Validate queue name pattern
  if (options?.namePattern && !options.namePattern.test(queueName)) {
    throw createSQSValidationError(
      `Invalid queue name format: ${queueName}`,
      SQSErrorCode.QUEUE_INVALID_NAME,
      'ValidateQueue',
      { queueName },
    );
  }

  // Validate queue name length
  if (options?.maxNameLength && queueName.length > options.maxNameLength) {
    throw createSQSValidationError(
      `Queue name exceeds maximum length of ${options.maxNameLength}`,
      SQSErrorCode.QUEUE_INVALID_NAME,
      'ValidateQueue',
      { queueName, length: queueName.length, maxLength: options.maxNameLength },
    );
  }

  // Validate queue attributes
  if (Object.keys(attributes).length > 0) {
    validateQueueAttributes(attributes, options);
  }
};

/**
 * Validates IAM policy attached to the SQS queue
 */
export const validateIAMPolicy = (policy: string): void => {
  try {
    const parsedPolicy = JSON.parse(policy);
    // Example validation: Ensure policy has Statements
    if (!parsedPolicy.Statement || !Array.isArray(parsedPolicy.Statement)) {
      throw new Error('Policy must contain a Statement array');
    }
    // Add more specific IAM policy validations as needed
  } catch (error) {
    throw createSQSValidationError(
      `Invalid IAM policy format: ${(error as Error).message}`,
      SQSErrorCode.POLICY_INVALID_FORMAT,
      'ValidateIAMPolicy',
      { policy },
    );
  }
};

/**
 * Validates cross-account access in the IAM policy
 */
export const validateCrossAccountAccess = (policy: string): void => {
  try {
    const parsedPolicy = JSON.parse(policy);
    // Implement cross-account access validations
    // Example: Ensure only specific AWS accounts are granted access
    const allowedAccounts = process.env.AWS_ACCOUNT_ID ? [process.env.AWS_ACCOUNT_ID] : []; // Use environment variable
    parsedPolicy.Statement.forEach((statement: any) => {
      const principals = statement.Principal?.AWS;
      if (principals) {
        const principalsArray = Array.isArray(principals)
          ? principals
          : [principals];
        principalsArray.forEach((principal: string) => {
          if (!allowedAccounts.includes(principal)) {
            throw new Error(`Unauthorized account in policy: ${principal}`);
          }
        });
      }
    });
  } catch (error) {
    throw createSQSValidationError(
      `Invalid cross-account access in policy: ${(error as Error).message}`,
      SQSErrorCode.POLICY_INVALID_ACCESS,
      'ValidateCrossAccountAccess',
      { policy },
    );
  }
};

/**
 * Validates the structure of IAM Policy Statements
 */
export const validatePolicyStatements = (policy: string): void => {
  try {
    const parsedPolicy = JSON.parse(policy);
    parsedPolicy.Statement.forEach((statement: any) => {
      if (statement.Effect !== 'Allow') return;

      // Restrict to specific actions
      const allowedActions = ['sqs:SendMessage', 'sqs:ReceiveMessage'];
      const actions = Array.isArray(statement.Action)
        ? statement.Action
        : [statement.Action];
      actions.forEach((action: string) => {
        if (!allowedActions.includes(action)) {
          throw new Error(`Disallowed action in policy: ${action}`);
        }
      });

      // Restrict principals to specific services or accounts
      const allowedPrincipals = process.env.AWS_ACCOUNT_ID ? [`arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:root`] : []; // Use environment variable
      const principals = Array.isArray(statement.Principal?.AWS)
        ? statement.Principal.AWS
        : statement.Principal?.AWS
          ? [statement.Principal.AWS]
          : [];

      principals.forEach((principal: string) => {
        if (!allowedPrincipals.includes(principal)) {
          throw new Error(`Disallowed principal in policy: ${principal}`);
        }
      });
    });
  } catch (error) {
    throw createSQSValidationError(
      `Invalid policy statements: ${(error as Error).message}`,
      SQSErrorCode.POLICY_STATEMENTS_INVALID,
      'ValidatePolicyStatements',
      { policy },
    );
  }
};

// ----------------------------------------
// Validation Types and Defaults
// ----------------------------------------

/**
 * Validation options for SQS operations with detailed constraints
 */
export interface SQSValidationOptions {
  // Message Constraints
  message?: {
    maxSize?: number;
    format?: RegExp;
    requiredAttributes?: string[];
    allowedAttributes?: string[];
    validateMessageStructure?: boolean;
    validateMessageAttributes?: boolean;
  };

  // Batch Operation Constraints
  batch?: {
    maxSize?: number;
    minSize?: number;
    enforceUniqueIds?: boolean;
    validateAllEntries?: boolean;
    maxTotalSize?: number;
  };

  // Queue Configuration
  queue?: {
    namePattern?: RegExp;
    maxNameLength?: number;
    validateAttributes?: boolean;
    requiredAttributes?: string[];
    allowedAttributes?: string[];
    validateTags?: boolean;
    fifo?: boolean; // Indicates if the queue is FIFO
  };

  // Timing Constraints
  timing?: {
    minVisibilityTimeout?: number;
    maxVisibilityTimeout?: number;
    validateVisibilityTimeout?: boolean; // Added
    validateDelaySeconds?: boolean;
    maxDelaySeconds?: number;
    minDelaySeconds?: number;
  };

  // Security Constraints
  security?: {
    validateKmsKey?: boolean;
    validatePolicy?: boolean;
    validatePermissions?: boolean;
    validateEncryptionAtRest?: boolean;
    validatePolicyStatements?: boolean;
  };

  // Custom Validation
  custom?: {
    validators?: Array<(input: any) => void>;
    transformers?: Array<(input: any) => any>;
  };
}

/**
 * Default validation configuration with AWS SQS limits
 */
export const DEFAULT_VALIDATION_OPTIONS: Readonly<SQSValidationOptions> = {
  message: {
    maxSize: 256 * 1024, // 256 KB
    format: /^[\s\S]*$/, // Any content
    requiredAttributes: [],
    allowedAttributes: [
      'MessageGroupId',
      'MessageDeduplicationId',
      'ContentType',
      'ContentEncoding',
    ],
    validateMessageStructure: true,
    validateMessageAttributes: true,
  },

  batch: {
    maxSize: 10, // AWS SQS batch limit
    minSize: 1,
    enforceUniqueIds: true,
    validateAllEntries: true,
    maxTotalSize: 256 * 1024 * 10, // 256 KB * 10 messages
  },

  queue: {
    namePattern: /^[a-zA-Z0-9_-]{1,80}$/,
    maxNameLength: 80,
    validateAttributes: true,
    requiredAttributes: [],
    allowedAttributes: [
      'DelaySeconds',
      'MaxMessageSize',
      'MessageRetentionPeriod',
      'ReceiveMessageWaitTimeSeconds',
      'VisibilityTimeout',
      'RedrivePolicy',
      'KmsMasterKeyId',
    ],
    validateTags: true,
    fifo: false, // Default to standard queue
  },

  timing: {
    minVisibilityTimeout: 0,
    maxVisibilityTimeout: 43200, // 12 hours
    validateVisibilityTimeout: true, // Added
    validateDelaySeconds: true,
    maxDelaySeconds: 900, // 15 minutes
    minDelaySeconds: 0,
  },

  security: {
    validateKmsKey: true,
    validatePolicy: true,
    validatePermissions: true,
    validateEncryptionAtRest: true,
    validatePolicyStatements: true,
  },
} as const;

/**
 * Interface describing the validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: SQSErrorMetadata[];
  warnings: SQSErrorMetadata[];
  metadata: Record<string, unknown>;
}
