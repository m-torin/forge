import {
  SendMessageCommand as AWSSQSSendMessageCommand,
  SendMessageBatchCommand as AWSSQSSendMessageBatchCommand,
  ReceiveMessageCommand as AWSSQSReceiveMessageCommand,
  DeleteMessageCommand as AWSSQSDeleteMessageCommand,
  DeleteMessageBatchCommand as AWSSQSDeleteMessageBatchCommand,
  ChangeMessageVisibilityCommand as AWSSQSChangeMessageVisibilityCommand,
  ChangeMessageVisibilityBatchCommand as AWSSQSChangeMessageVisibilityBatchCommand,
  CreateQueueCommand as AWSSQSCreateQueueCommand,
  DeleteQueueCommand as AWSSQSDeleteQueueCommand,
  GetQueueUrlCommand as AWSSQSGetQueueUrlCommand,
  ListQueuesCommand as AWSSQSListQueuesCommand,
  PurgeQueueCommand as AWSSQSPurgeQueueCommand,
  GetQueueAttributesCommand as AWSSQSGetQueueAttributesCommand,
  SetQueueAttributesCommand as AWSSQSSetQueueAttributesCommand,
  type SendMessageCommandInput,
  type SendMessageCommandOutput,
  type SendMessageBatchCommandInput,
  type SendMessageBatchCommandOutput,
  type ReceiveMessageCommandInput,
  type ReceiveMessageCommandOutput,
  type DeleteMessageCommandInput,
  type DeleteMessageCommandOutput,
  type DeleteMessageBatchCommandInput,
  type DeleteMessageBatchCommandOutput,
  type ChangeMessageVisibilityCommandInput,
  type ChangeMessageVisibilityCommandOutput,
  type ChangeMessageVisibilityBatchCommandInput,
  type ChangeMessageVisibilityBatchCommandOutput,
  type CreateQueueCommandInput,
  type CreateQueueCommandOutput,
  type DeleteQueueCommandInput,
  type DeleteQueueCommandOutput,
  type GetQueueUrlCommandInput,
  type GetQueueUrlCommandOutput,
  type ListQueuesCommandInput,
  type ListQueuesCommandOutput,
  type PurgeQueueCommandInput,
  type PurgeQueueCommandOutput,
  type GetQueueAttributesCommandInput,
  type GetQueueAttributesCommandOutput,
  type SetQueueAttributesCommandInput,
  type SetQueueAttributesCommandOutput,
} from '@aws-sdk/client-sqs';

import { createSQSCommand } from './client';
import type { WrapperConfig } from '#/lib/integrationFactory';

// Default configurations for different operation types
const MESSAGE_OPERATION_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 15_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10000,
  },
  logging: {
    enabled: true,
    redactKeys: ['MessageBody', 'MessageAttributes'],
  },
};

const BATCH_OPERATION_DEFAULTS: Partial<WrapperConfig> = {
  ...MESSAGE_OPERATION_DEFAULTS,
  timeout: 30_000, // 30 seconds for batch operations
  retries: 5,
};

const QUEUE_MANAGEMENT_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 45_000, // 45 seconds for management operations
  retries: 2,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 25, // More sensitive circuit breaking for management ops
    resetTimeout: 60000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Attributes', 'Tags'],
  },
};

/**
 * Message Operations
 * These commands handle individual message operations with standard timeout and retry settings
 */
export const SendMessageCommand = createSQSCommand<
  SendMessageCommandInput,
  SendMessageCommandOutput
>('SendMessage', AWSSQSSendMessageCommand, MESSAGE_OPERATION_DEFAULTS);

export const ReceiveMessageCommand = createSQSCommand<
  ReceiveMessageCommandInput,
  ReceiveMessageCommandOutput
>('ReceiveMessage', AWSSQSReceiveMessageCommand, {
  ...MESSAGE_OPERATION_DEFAULTS,
  timeout: 25_000, // Extended timeout for long-polling
});

export const DeleteMessageCommand = createSQSCommand<
  DeleteMessageCommandInput,
  DeleteMessageCommandOutput
>('DeleteMessage', AWSSQSDeleteMessageCommand, MESSAGE_OPERATION_DEFAULTS);

/**
 * Batch Operations
 * These commands handle multiple messages with extended timeouts and retries
 */
export const SendMessageBatchCommand = createSQSCommand<
  SendMessageBatchCommandInput,
  SendMessageBatchCommandOutput
>('SendMessageBatch', AWSSQSSendMessageBatchCommand, BATCH_OPERATION_DEFAULTS);

export const DeleteMessageBatchCommand = createSQSCommand<
  DeleteMessageBatchCommandInput,
  DeleteMessageBatchCommandOutput
>(
  'DeleteMessageBatch',
  AWSSQSDeleteMessageBatchCommand,
  BATCH_OPERATION_DEFAULTS,
);

export const ChangeMessageVisibilityBatchCommand = createSQSCommand<
  ChangeMessageVisibilityBatchCommandInput,
  ChangeMessageVisibilityBatchCommandOutput
>(
  'ChangeMessageVisibilityBatch',
  AWSSQSChangeMessageVisibilityBatchCommand,
  BATCH_OPERATION_DEFAULTS,
);

/**
 * Queue Management Operations
 * These commands manage queue configuration with appropriate timeouts
 */
export const CreateQueueCommand = createSQSCommand<
  CreateQueueCommandInput,
  CreateQueueCommandOutput
>('CreateQueue', AWSSQSCreateQueueCommand, QUEUE_MANAGEMENT_DEFAULTS);

export const DeleteQueueCommand = createSQSCommand<
  DeleteQueueCommandInput,
  DeleteQueueCommandOutput
>('DeleteQueue', AWSSQSDeleteQueueCommand, QUEUE_MANAGEMENT_DEFAULTS);

export const GetQueueUrlCommand = createSQSCommand<
  GetQueueUrlCommandInput,
  GetQueueUrlCommandOutput
>('GetQueueUrl', AWSSQSGetQueueUrlCommand, {
  ...QUEUE_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 3600, // Cache queue URLs for 1 hour
    key: 'sqs:queue-url:{queueName}',
  },
});

export const ListQueuesCommand = createSQSCommand<
  ListQueuesCommandInput,
  ListQueuesCommandOutput
>('ListQueues', AWSSQSListQueuesCommand, {
  ...QUEUE_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache queue list for 5 minutes
    key: 'sqs:queue-list:{prefix}',
  },
});

export const GetQueueAttributesCommand = createSQSCommand<
  GetQueueAttributesCommandInput,
  GetQueueAttributesCommandOutput
>('GetQueueAttributes', AWSSQSGetQueueAttributesCommand, {
  ...QUEUE_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 60, // Cache attributes for 1 minute
    key: 'sqs:queue-attrs:{queueUrl}:{attributes}',
  },
});

export const SetQueueAttributesCommand = createSQSCommand<
  SetQueueAttributesCommandInput,
  SetQueueAttributesCommandOutput
>(
  'SetQueueAttributes',
  AWSSQSSetQueueAttributesCommand,
  QUEUE_MANAGEMENT_DEFAULTS,
);

/**
 * Queue Maintenance Operations
 * These commands handle queue maintenance tasks
 */
export const PurgeQueueCommand = createSQSCommand<
  PurgeQueueCommandInput,
  PurgeQueueCommandOutput
>('PurgeQueue', AWSSQSPurgeQueueCommand, {
  ...QUEUE_MANAGEMENT_DEFAULTS,
  timeout: 60_000, // Extended timeout for purge operation
  retries: 0, // No retries for purge operations
});

export const ChangeMessageVisibilityCommand = createSQSCommand<
  ChangeMessageVisibilityCommandInput,
  ChangeMessageVisibilityCommandOutput
>(
  'ChangeMessageVisibility',
  AWSSQSChangeMessageVisibilityCommand,
  MESSAGE_OPERATION_DEFAULTS,
);

// Example usage with Dead Letter Queue:
/*
const configureDLQ = async (queueUrl: string, dlqArn: string, maxReceiveCount = 5) => {
  return await SetQueueAttributesCommand({
    QueueUrl: queueUrl,
    Attributes: {
      RedrivePolicy: JSON.stringify({
        deadLetterTargetArn: dlqArn,
        maxReceiveCount: maxReceiveCount.toString()
      })
    }
  });
};
*/
