/**
 * SNS Command Implementations
 * Provides wrapped AWS SNS commands with integrated validation, error handling,
 * and middleware support through the Flowbuilder integration factory.
 */

import {
  PublishCommand as AWSSNSPublishCommand,
  type PublishCommandInput,
  type PublishCommandOutput,
  PublishBatchCommand as AWSSNSPublishBatchCommand,
  type PublishBatchCommandInput,
  type PublishBatchCommandOutput,
  CreateTopicCommand as AWSCreateTopicCommand,
  type CreateTopicCommandInput,
  type CreateTopicCommandOutput,
  DeleteTopicCommand as AWSDeleteTopicCommand,
  type DeleteTopicCommandInput,
  type DeleteTopicCommandOutput,
  ListTopicsCommand as AWSListTopicsCommand,
  type ListTopicsCommandInput,
  type ListTopicsCommandOutput,
  GetTopicAttributesCommand as AWSGetTopicAttributesCommand,
  type GetTopicAttributesCommandInput,
  type GetTopicAttributesCommandOutput,
  SetTopicAttributesCommand as AWSSetTopicAttributesCommand,
  type SetTopicAttributesCommandInput,
  type SetTopicAttributesCommandOutput,
  ListTagsForResourceCommand as AWSListTagsForResourceCommand,
  type ListTagsForResourceCommandInput,
  type ListTagsForResourceCommandOutput,
  TagResourceCommand as AWSTagResourceCommand,
  type TagResourceCommandInput,
  type TagResourceCommandOutput,
  UntagResourceCommand as AWSUntagResourceCommand,
  type UntagResourceCommandInput,
  type UntagResourceCommandOutput,
  SubscribeCommand as AWSSubscribeCommand,
  type SubscribeCommandInput,
  type SubscribeCommandOutput,
  ConfirmSubscriptionCommand as AWSConfirmSubscriptionCommand,
  type ConfirmSubscriptionCommandInput,
  type ConfirmSubscriptionCommandOutput,
  UnsubscribeCommand as AWSUnsubscribeCommand,
  type UnsubscribeCommandInput,
  type UnsubscribeCommandOutput,
  ListSubscriptionsCommand as AWSListSubscriptionsCommand,
  type ListSubscriptionsCommandInput,
  type ListSubscriptionsCommandOutput,
  ListSubscriptionsByTopicCommand as AWSListSubscriptionsByTopicCommand,
  type ListSubscriptionsByTopicCommandInput,
  type ListSubscriptionsByTopicCommandOutput,
  GetSubscriptionAttributesCommand as AWSGetSubscriptionAttributesCommand,
  type GetSubscriptionAttributesCommandInput,
  type GetSubscriptionAttributesCommandOutput,
  SetSubscriptionAttributesCommand as AWSSetSubscriptionAttributesCommand,
  type SetSubscriptionAttributesCommandInput,
  type SetSubscriptionAttributesCommandOutput,
  AddPermissionCommand as AWSAddPermissionCommand,
  type AddPermissionCommandInput,
  type AddPermissionCommandOutput,
  RemovePermissionCommand as AWSRemovePermissionCommand,
  type RemovePermissionCommandInput,
  type RemovePermissionCommandOutput,
  // Platform Application Operations
  CreatePlatformApplicationCommand as AWSCreatePlatformApplicationCommand,
  type CreatePlatformApplicationCommandInput,
  type CreatePlatformApplicationCommandOutput,
  DeletePlatformApplicationCommand as AWSDeletePlatformApplicationCommand,
  type DeletePlatformApplicationCommandInput,
  type DeletePlatformApplicationCommandOutput,
  GetPlatformApplicationAttributesCommand as AWSGetPlatformApplicationAttributesCommand,
  type GetPlatformApplicationAttributesCommandInput,
  type GetPlatformApplicationAttributesCommandOutput,
  SetPlatformApplicationAttributesCommand as AWSSetPlatformApplicationAttributesCommand,
  type SetPlatformApplicationAttributesCommandInput,
  type SetPlatformApplicationAttributesCommandOutput,
  ListPlatformApplicationsCommand as AWSListPlatformApplicationsCommand,
  type ListPlatformApplicationsCommandInput,
  type ListPlatformApplicationsCommandOutput,
  // Platform Endpoint Operations
  CreatePlatformEndpointCommand as AWSCreatePlatformEndpointCommand,
  type CreatePlatformEndpointCommandInput,
  type CreatePlatformEndpointCommandOutput,
  DeleteEndpointCommand as AWSDeleteEndpointCommand,
  type DeleteEndpointCommandInput,
  type DeleteEndpointCommandOutput,
  GetEndpointAttributesCommand as AWSGetEndpointAttributesCommand,
  type GetEndpointAttributesCommandInput,
  type GetEndpointAttributesCommandOutput,
  SetEndpointAttributesCommand as AWSSetEndpointAttributesCommand,
  type SetEndpointAttributesCommandInput,
  type SetEndpointAttributesCommandOutput,
  ListEndpointsByPlatformApplicationCommand as AWSListEndpointsByPlatformApplicationCommand,
  type ListEndpointsByPlatformApplicationCommandInput,
  type ListEndpointsByPlatformApplicationCommandOutput,
  // Phone Number Operations
  OptInPhoneNumberCommand as AWSOptInPhoneNumberCommand,
  type OptInPhoneNumberCommandInput,
  type OptInPhoneNumberCommandOutput,
  CheckIfPhoneNumberIsOptedOutCommand as AWSCheckIfPhoneNumberIsOptedOutCommand,
  type CheckIfPhoneNumberIsOptedOutCommandInput,
  type CheckIfPhoneNumberIsOptedOutCommandOutput,
  ListPhoneNumbersOptedOutCommand as AWSListPhoneNumbersOptedOutCommand,
  type ListPhoneNumbersOptedOutCommandInput,
  type ListPhoneNumbersOptedOutCommandOutput,
  // SMS Operations
  GetSMSAttributesCommand as AWSGetSMSAttributesCommand,
  type GetSMSAttributesCommandInput,
  type GetSMSAttributesCommandOutput,
  SetSMSAttributesCommand as AWSSetSMSAttributesCommand,
  type SetSMSAttributesCommandInput,
  type SetSMSAttributesCommandOutput,
  // Mobile Push Operations
  GetDataProtectionPolicyCommand as AWSGetDataProtectionPolicyCommand,
  type GetDataProtectionPolicyCommandInput,
  type GetDataProtectionPolicyCommandOutput,
  PutDataProtectionPolicyCommand as AWSPutDataProtectionPolicyCommand,
  type PutDataProtectionPolicyCommandInput,
  type PutDataProtectionPolicyCommandOutput,
  VerifySMSSandboxPhoneNumberCommand as AWSVerifySMSSandboxPhoneNumberCommand,
  type VerifySMSSandboxPhoneNumberCommandInput,
  type VerifySMSSandboxPhoneNumberCommandOutput,
  CreateSMSSandboxPhoneNumberCommand as AWSCreateSMSSandboxPhoneNumberCommand,
  type CreateSMSSandboxPhoneNumberCommandInput,
  type CreateSMSSandboxPhoneNumberCommandOutput,
  DeleteSMSSandboxPhoneNumberCommand as AWSDeleteSMSSandboxPhoneNumberCommand,
  type DeleteSMSSandboxPhoneNumberCommandInput,
  type DeleteSMSSandboxPhoneNumberCommandOutput,
  ListSMSSandboxPhoneNumbersCommand as AWSListSMSSandboxPhoneNumbersCommand,
  type ListSMSSandboxPhoneNumbersCommandInput,
  type ListSMSSandboxPhoneNumbersCommandOutput,
} from '@aws-sdk/client-sns';

import { createSNSCommand } from './client';
import type { SNSCommandOptions } from './client';

// ----------------------------------------
// Default Configurations
// ----------------------------------------

/**
 * Default configuration for message publishing operations
 * Includes retry logic and circuit breaking for publish reliability
 */
const MESSAGE_OPERATION_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 15_000, // 15 second timeout
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 50,
    resetTimeout: 30_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Message', 'MessageAttributes'],
  },
  telemetry: {
    enabled: true,
    attributes: ['TopicArn', 'MessageId'],
  },
};

/**
 * Default configuration for batch operations
 * Extended timeouts and retries for handling multiple messages
 */
const BATCH_OPERATION_DEFAULTS: Partial<SNSCommandOptions> = {
  ...MESSAGE_OPERATION_DEFAULTS,
  timeout: 30_000, // 30 second timeout for batch operations
  retries: 5,
  // Removed 'batch' property as it's not defined in SNSCommandOptions
};

/**
 * Default configuration for topic management operations
 * Conservative timeouts and circuit breaking for administrative tasks
 */
const TOPIC_MANAGEMENT_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 30_000,
  retries: 2,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 25,
    resetTimeout: 60_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Attributes', 'Tags'],
  },
  telemetry: {
    enabled: true,
    attributes: ['TopicArn'],
  },
};

/**
 * Default configuration for platform application operations
 */
const PLATFORM_APPLICATION_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 25_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 40,
    resetTimeout: 45_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Attributes'],
  },
  telemetry: {
    enabled: true,
    attributes: ['PlatformApplicationArn'],
  },
};

/**
 * Default configuration for platform endpoint operations
 */
const PLATFORM_ENDPOINT_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 20_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 35,
    resetTimeout: 40_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Attributes'],
  },
  telemetry: {
    enabled: true,
    attributes: ['EndpointArn'],
  },
};

/**
 * Default configuration for phone number operations
 */
const PHONE_NUMBER_OPERATION_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 10_000,
  retries: 2,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 30,
    resetTimeout: 20_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['phoneNumber'],
  },
  telemetry: {
    enabled: true,
    attributes: ['PhoneNumber'],
  },
};

/**
 * Default configuration for SMS operations
 */
const SMS_OPERATION_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 20_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 40,
    resetTimeout: 25_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Message', 'MessageAttributes', 'PhoneNumber'],
  },
  telemetry: {
    enabled: true,
    attributes: ['MessageId', 'PhoneNumber'],
  },
};

/**
 * Default configuration for mobile push operations
 */
const MOBILE_PUSH_OPERATION_DEFAULTS: Partial<SNSCommandOptions> = {
  timeout: 25_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 35,
    resetTimeout: 35_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['DataProtectionPolicy', 'phoneNumber'],
  },
  telemetry: {
    enabled: true,
    attributes: ['PolicyName', 'PhoneNumber'],
  },
};

// ----------------------------------------
// Message Publishing Operations
// ----------------------------------------

/**
 * PublishCommand - Sends a message to an SNS topic
 * @example
 * ```typescript
 * const result = await PublishCommand({
 *   TopicArn: 'arn:aws:sns:region:account:topic',
 *   Message: 'Hello World',
 *   MessageAttributes: {
 *     'attr1': { DataType: 'String', StringValue: 'value1' }
 *   }
 * });
 * ```
 */
export const PublishCommand = createSNSCommand<
  PublishCommandInput,
  PublishCommandOutput
>('Publish', AWSSNSPublishCommand, MESSAGE_OPERATION_DEFAULTS);

/**
 * PublishBatchCommand - Sends up to 10 messages to an SNS topic in a single request
 * @example
 * ```typescript
 * const result = await PublishBatchCommand({
 *   TopicArn: 'arn:aws:sns:region:account:topic',
 *   PublishBatchRequestEntries: [
 *     { Id: '1', Message: 'Message 1' },
 *     { Id: '2', Message: 'Message 2' }
 *   ]
 * });
 * ```
 */
export const PublishBatchCommand = createSNSCommand<
  PublishBatchCommandInput,
  PublishBatchCommandOutput
>('PublishBatch', AWSSNSPublishBatchCommand, BATCH_OPERATION_DEFAULTS);

// ----------------------------------------
// Topic Management Operations
// ----------------------------------------

/**
 * CreateTopicCommand - Creates a new SNS topic
 * Supports both standard and FIFO topics
 * @example
 * ```typescript
 * // Standard topic
 * const topic = await CreateTopicCommand({
 *   Name: 'MyTopic'
 * });
 *
 * // FIFO topic
 * const fifoTopic = await CreateTopicCommand({
 *   Name: 'MyTopic.fifo',
 *   Attributes: {
 *     FifoTopic: 'true',
 *     ContentBasedDeduplication: 'true'
 *   }
 * });
 * ```
 */
export const CreateTopicCommand = createSNSCommand<
  CreateTopicCommandInput,
  CreateTopicCommandOutput
>('CreateTopic', AWSCreateTopicCommand, TOPIC_MANAGEMENT_DEFAULTS);

/**
 * DeleteTopicCommand - Deletes an SNS topic and all its subscriptions
 */
export const DeleteTopicCommand = createSNSCommand<
  DeleteTopicCommandInput,
  DeleteTopicCommandOutput
>('DeleteTopic', AWSDeleteTopicCommand, TOPIC_MANAGEMENT_DEFAULTS);

// ----------------------------------------
// Topic Listing and Attribute Operations
// ----------------------------------------

/**
 * ListTopicsCommand - Lists topics in your AWS account
 * Supports pagination through NextToken
 * @example
 * ```typescript
 * const result = await ListTopicsCommand({});
 * while (result.NextToken) {
 *   const nextPage = await ListTopicsCommand({ NextToken: result.NextToken });
 *   // Process nextPage.Topics
 * }
 * ```
 */
export const ListTopicsCommand = createSNSCommand<
  ListTopicsCommandInput,
  ListTopicsCommandOutput
>('ListTopics', AWSListTopicsCommand, {
  ...TOPIC_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache topic list for 5 minutes
    key: 'sns:topic-list:{nextToken}',
  },
});

/**
 * GetTopicAttributesCommand - Retrieves properties of a topic
 * @example
 * ```typescript
 * const attributes = await GetTopicAttributesCommand({
 *   TopicArn: 'arn:aws:sns:region:account:topic'
 * });
 * ```
 */
export const GetTopicAttributesCommand = createSNSCommand<
  GetTopicAttributesCommandInput,
  GetTopicAttributesCommandOutput
>('GetTopicAttributes', AWSGetTopicAttributesCommand, {
  ...TOPIC_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 60, // Cache attributes for 1 minute
    key: 'sns:topic-attrs:{topicArn}',
  },
});

/**
 * SetTopicAttributesCommand - Updates properties of a topic
 * @example
 * ```typescript
 * await SetTopicAttributesCommand({
 *   TopicArn: 'arn:aws:sns:region:account:topic',
 *   AttributeName: 'DisplayName',
 *   AttributeValue: 'My Updated Topic'
 * });
 * ```
 */
export const SetTopicAttributesCommand = createSNSCommand<
  SetTopicAttributesCommandInput,
  SetTopicAttributesCommandOutput
>(
  'SetTopicAttributes',
  AWSSetTopicAttributesCommand,
  TOPIC_MANAGEMENT_DEFAULTS,
);

// ----------------------------------------
// Tag Management Operations
// ----------------------------------------

/**
 * ListTagsForResourceCommand - Lists tags associated with a topic
 */
export const ListTagsForResourceCommand = createSNSCommand<
  ListTagsForResourceCommandInput,
  ListTagsForResourceCommandOutput
>('ListTagsForResource', AWSListTagsForResourceCommand, {
  ...TOPIC_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache tags for 5 minutes
    key: 'sns:resource-tags:{resourceArn}',
  },
});

/**
 * TagResourceCommand - Adds or updates tags for a topic
 * @example
 * ```typescript
 * await TagResourceCommand({
 *   ResourceArn: 'arn:aws:sns:region:account:topic',
 *   Tags: [
 *     { Key: 'Environment', Value: 'Production' },
 *     { Key: 'Team', Value: 'Platform' }
 *   ]
 * });
 * ```
 */
export const TagResourceCommand = createSNSCommand<
  TagResourceCommandInput,
  TagResourceCommandOutput
>('TagResource', AWSTagResourceCommand, TOPIC_MANAGEMENT_DEFAULTS);

/**
 * UntagResourceCommand - Removes tags from a topic
 */
export const UntagResourceCommand = createSNSCommand<
  UntagResourceCommandInput,
  UntagResourceCommandOutput
>('UntagResource', AWSUntagResourceCommand, TOPIC_MANAGEMENT_DEFAULTS);

// ----------------------------------------
// Subscription Management Operations
// ----------------------------------------

/**
 * SubscribeCommand - Creates a subscription to a topic
 * @example
 * ```typescript
 * const subscription = await SubscribeCommand({
 *   TopicArn: 'arn:aws:sns:region:account:topic',
 *   Protocol: 'sqs',
 *   Endpoint: 'arn:aws:sqs:region:account:queue'
 * });
 * ```
 */
export const SubscribeCommand = createSNSCommand<
  SubscribeCommandInput,
  SubscribeCommandOutput
>('Subscribe', AWSSubscribeCommand, {
  ...TOPIC_MANAGEMENT_DEFAULTS,
  timeout: 20_000, // Extended timeout for subscription creation
});

/**
 * ConfirmSubscriptionCommand - Confirms a subscription to a topic
 * Used primarily with HTTP/HTTPS endpoints requiring manual confirmation
 */
export const ConfirmSubscriptionCommand = createSNSCommand<
  ConfirmSubscriptionCommandInput,
  ConfirmSubscriptionCommandOutput
>(
  'ConfirmSubscription',
  AWSConfirmSubscriptionCommand,
  TOPIC_MANAGEMENT_DEFAULTS,
);

/**
 * UnsubscribeCommand - Deletes a subscription
 */
export const UnsubscribeCommand = createSNSCommand<
  UnsubscribeCommandInput,
  UnsubscribeCommandOutput
>('Unsubscribe', AWSUnsubscribeCommand, TOPIC_MANAGEMENT_DEFAULTS);

/**
 * ListSubscriptionsCommand - Lists all subscriptions in your AWS account
 */
export const ListSubscriptionsCommand = createSNSCommand<
  ListSubscriptionsCommandInput,
  ListSubscriptionsCommandOutput
>('ListSubscriptions', AWSListSubscriptionsCommand, {
  ...TOPIC_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache subscription list for 5 minutes
    key: 'sns:subscription-list:{nextToken}',
  },
});

/**
 * ListSubscriptionsByTopicCommand - Lists subscriptions for a specific topic
 */
export const ListSubscriptionsByTopicCommand = createSNSCommand<
  ListSubscriptionsByTopicCommandInput,
  ListSubscriptionsByTopicCommandOutput
>('ListSubscriptionsByTopic', AWSListSubscriptionsByTopicCommand, {
  ...TOPIC_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300,
    key: 'sns:topic-subscriptions:{topicArn}:{nextToken}',
  },
});

/**
 * GetSubscriptionAttributesCommand - Retrieves properties of a subscription
 */
export const GetSubscriptionAttributesCommand = createSNSCommand<
  GetSubscriptionAttributesCommandInput,
  GetSubscriptionAttributesCommandOutput
>('GetSubscriptionAttributes', AWSGetSubscriptionAttributesCommand, {
  ...TOPIC_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 60, // Cache attributes for 1 minute
    key: 'sns:subscription-attrs:{subscriptionArn}',
  },
});

/**
 * SetSubscriptionAttributesCommand - Updates properties of a subscription
 * @example
 * ```typescript
 * await SetSubscriptionAttributesCommand({
 *   SubscriptionArn: 'arn:aws:sns:region:account:topic:subscription-id',
 *   AttributeName: 'FilterPolicy',
 *   AttributeValue: JSON.stringify({
 *     eventType: ['order_created', 'order_updated']
 *   })
 * });
 * ```
 */
export const SetSubscriptionAttributesCommand = createSNSCommand<
  SetSubscriptionAttributesCommandInput,
  SetSubscriptionAttributesCommandOutput
>(
  'SetSubscriptionAttributes',
  AWSSetSubscriptionAttributesCommand,
  TOPIC_MANAGEMENT_DEFAULTS,
);

// ----------------------------------------
// Permission Management Operations
// ----------------------------------------

/**
 * AddPermissionCommand - Adds a statement to a topic's access policy
 * @example
 * ```typescript
 * await AddPermissionCommand({
 *   TopicArn: 'arn:aws:sns:region:account:topic',
 *   Label: 'AllowSQSSubscription',
 *   AWSAccountId: ['123456789012'],
 *   ActionName: ['Subscribe', 'Receive']
 * });
 * ```
 */
export const AddPermissionCommand = createSNSCommand<
  AddPermissionCommandInput,
  AddPermissionCommandOutput
>('AddPermission', AWSAddPermissionCommand, {
  ...TOPIC_MANAGEMENT_DEFAULTS,
  validation: {
    topic: {
      validateAttributes: true,
      // Removed validatePermissions as it's not part of the type
    },
  },
});

/**
 * RemovePermissionCommand - Removes a statement from a topic's access policy
 * @example
 * ```typescript
 * await RemovePermissionCommand({
 *   TopicArn: 'arn:aws:sns:region:account:topic',
 *   Label: 'AllowSQSSubscription'
 * });
 * ```
 */
export const RemovePermissionCommand = createSNSCommand<
  RemovePermissionCommandInput,
  RemovePermissionCommandOutput
>('RemovePermission', AWSRemovePermissionCommand, TOPIC_MANAGEMENT_DEFAULTS);

// ----------------------------------------
// Platform Application Operations
// ----------------------------------------

/**
 * CreatePlatformApplicationCommand - Creates a platform application object for one of the supported push notification services.
 * @example
 * ```typescript
 * const platformApp = await CreatePlatformApplicationCommand({
 *   Name: 'MyPlatformApp',
 *   Platform: 'GCM',
 *   Attributes: {
 *     PlatformCredential: 'YOUR_API_KEY',
 *     PlatformPrincipal: 'YOUR_SENDER_ID'
 *   }
 * });
 * ```
 */
export const CreatePlatformApplicationCommand = createSNSCommand<
  CreatePlatformApplicationCommandInput,
  CreatePlatformApplicationCommandOutput
>(
  'CreatePlatformApplication',
  AWSCreatePlatformApplicationCommand,
  PLATFORM_APPLICATION_DEFAULTS,
);

/**
 * DeletePlatformApplicationCommand - Deletes a platform application object for the supported push notification services.
 * @example
 * ```typescript
 * await DeletePlatformApplicationCommand({
 *   PlatformApplicationArn: 'arn:aws:sns:region:account:app/GCM/MyPlatformApp'
 * });
 * ```
 */
export const DeletePlatformApplicationCommand = createSNSCommand<
  DeletePlatformApplicationCommandInput,
  DeletePlatformApplicationCommandOutput
>(
  'DeletePlatformApplication',
  AWSDeletePlatformApplicationCommand,
  PLATFORM_APPLICATION_DEFAULTS,
);

/**
 * GetPlatformApplicationAttributesCommand - Gets the attributes of the platform application object for the supported push notification services.
 * @example
 * ```typescript
 * const attributes = await GetPlatformApplicationAttributesCommand({
 *   PlatformApplicationArn: 'arn:aws:sns:region:account:app/GCM/MyPlatformApp'
 * });
 * ```
 */
export const GetPlatformApplicationAttributesCommand = createSNSCommand<
  GetPlatformApplicationAttributesCommandInput,
  GetPlatformApplicationAttributesCommandOutput
>(
  'GetPlatformApplicationAttributes',
  AWSGetPlatformApplicationAttributesCommand,
  PLATFORM_APPLICATION_DEFAULTS,
);

/**
 * SetPlatformApplicationAttributesCommand - Sets the attributes of the platform application object for the supported push notification services.
 * @example
 * ```typescript
 * await SetPlatformApplicationAttributesCommand({
 *   PlatformApplicationArn: 'arn:aws:sns:region:account:app/GCM/MyPlatformApp',
 *   Attributes: {
 *     PlatformCredential: 'NEW_API_KEY',
 *     PlatformPrincipal: 'NEW_SENDER_ID'
 *   }
 * });
 * ```
 */
export const SetPlatformApplicationAttributesCommand = createSNSCommand<
  SetPlatformApplicationAttributesCommandInput,
  SetPlatformApplicationAttributesCommandOutput
>(
  'SetPlatformApplicationAttributes',
  AWSSetPlatformApplicationAttributesCommand,
  PLATFORM_APPLICATION_DEFAULTS,
);

/**
 * ListPlatformApplicationsCommand - Lists platform applications objects created for your account.
 * @example
 * ```typescript
 * const applications = await ListPlatformApplicationsCommand({});
 * ```
 */
export const ListPlatformApplicationsCommand = createSNSCommand<
  ListPlatformApplicationsCommandInput,
  ListPlatformApplicationsCommandOutput
>('ListPlatformApplications', AWSListPlatformApplicationsCommand, {
  ...PLATFORM_APPLICATION_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache platform applications for 5 minutes
    key: 'sns:platform-applications:{nextToken}',
  },
});

// ----------------------------------------
// Platform Endpoint Operations
// ----------------------------------------

/**
 * CreatePlatformEndpointCommand - Creates an endpoint for a device and mobile app on one of the supported push notification services.
 * @example
 * ```typescript
 * const endpoint = await CreatePlatformEndpointCommand({
 *   PlatformApplicationArn: 'arn:aws:sns:region:account:app/GCM/MyPlatformApp',
 *   Token: 'DEVICE_TOKEN',
 *   CustomUserData: 'User data for this endpoint'
 * });
 * ```
 */
export const CreatePlatformEndpointCommand = createSNSCommand<
  CreatePlatformEndpointCommandInput,
  CreatePlatformEndpointCommandOutput
>(
  'CreatePlatformEndpoint',
  AWSCreatePlatformEndpointCommand,
  PLATFORM_ENDPOINT_DEFAULTS,
);

/**
 * DeleteEndpointCommand - Deletes the endpoint for a device and mobile app from Amazon SNS.
 * @example
 * ```typescript
 * await DeleteEndpointCommand({
 *   EndpointArn: 'arn:aws:sns:region:account:endpoint/GCM/MyPlatformApp/endpoint-id'
 * });
 * ```
 */
export const DeleteEndpointCommand = createSNSCommand<
  DeleteEndpointCommandInput,
  DeleteEndpointCommandOutput
>('DeleteEndpoint', AWSDeleteEndpointCommand, PLATFORM_ENDPOINT_DEFAULTS);

/**
 * GetEndpointAttributesCommand - Gets the attributes of an endpoint for a device and mobile app from Amazon SNS.
 * @example
 * ```typescript
 * const attributes = await GetEndpointAttributesCommand({
 *   EndpointArn: 'arn:aws:sns:region:account:endpoint/GCM/MyPlatformApp/endpoint-id'
 * });
 * ```
 */
export const GetEndpointAttributesCommand = createSNSCommand<
  GetEndpointAttributesCommandInput,
  GetEndpointAttributesCommandOutput
>(
  'GetEndpointAttributes',
  AWSGetEndpointAttributesCommand,
  PLATFORM_ENDPOINT_DEFAULTS,
);

/**
 * SetEndpointAttributesCommand - Sets the attributes of an endpoint for a device and mobile app from Amazon SNS.
 * @example
 * ```typescript
 * await SetEndpointAttributesCommand({
 *   EndpointArn: 'arn:aws:sns:region:account:endpoint/GCM/MyPlatformApp/endpoint-id',
 *   Attributes: {
 *     Enabled: 'false'
 *   }
 * });
 * ```
 */
export const SetEndpointAttributesCommand = createSNSCommand<
  SetEndpointAttributesCommandInput,
  SetEndpointAttributesCommandOutput
>(
  'SetEndpointAttributes',
  AWSSetEndpointAttributesCommand,
  PLATFORM_ENDPOINT_DEFAULTS,
);

/**
 * ListEndpointsByPlatformApplicationCommand - Lists the endpoints for a platform application object.
 * @example
 * ```typescript
 * const endpoints = await ListEndpointsByPlatformApplicationCommand({
 *   PlatformApplicationArn: 'arn:aws:sns:region:account:app/GCM/MyPlatformApp'
 * });
 * ```
 */
export const ListEndpointsByPlatformApplicationCommand = createSNSCommand<
  ListEndpointsByPlatformApplicationCommandInput,
  ListEndpointsByPlatformApplicationCommandOutput
>(
  'ListEndpointsByPlatformApplication',
  AWSListEndpointsByPlatformApplicationCommand,
  {
    ...PLATFORM_ENDPOINT_DEFAULTS,
    cache: {
      enabled: true,
      ttl: 300, // Cache endpoints for 5 minutes
      key: 'sns:endpoints-by-platform-app:{platformApplicationArn}:{nextToken}',
    },
  },
);

// ----------------------------------------
// Phone Number Operations
// ----------------------------------------

/**
 * OptInPhoneNumberCommand - Allows a phone number to receive SMS messages from your account in the current region.
 * @example
 * ```typescript
 * await OptInPhoneNumberCommand({
 *   phoneNumber: '+1234567890'
 * });
 * ```
 */
export const OptInPhoneNumberCommand = createSNSCommand<
  OptInPhoneNumberCommandInput,
  OptInPhoneNumberCommandOutput
>(
  'OptInPhoneNumber',
  AWSOptInPhoneNumberCommand,
  PHONE_NUMBER_OPERATION_DEFAULTS,
);

/**
 * CheckIfPhoneNumberIsOptedOutCommand - Checks if a phone number is opted out, meaning it will not receive SMS messages from your account in the current region.
 * @example
 * ```typescript
 * const result = await CheckIfPhoneNumberIsOptedOutCommand({
 *   phoneNumber: '+1234567890'
 * });
 * console.log(result.isOptedOut);
 * ```
 */
export const CheckIfPhoneNumberIsOptedOutCommand = createSNSCommand<
  CheckIfPhoneNumberIsOptedOutCommandInput,
  CheckIfPhoneNumberIsOptedOutCommandOutput
>(
  'CheckIfPhoneNumberIsOptedOut',
  AWSCheckIfPhoneNumberIsOptedOutCommand,
  PHONE_NUMBER_OPERATION_DEFAULTS,
);

/**
 * ListPhoneNumbersOptedOutCommand - Lists the phone numbers that are opted out.
 * @example
 * ```typescript
 * const result = await ListPhoneNumbersOptedOutCommand({});
 * console.log(result.PhoneNumbers);
 * ```
 */
export const ListPhoneNumbersOptedOutCommand = createSNSCommand<
  ListPhoneNumbersOptedOutCommandInput,
  ListPhoneNumbersOptedOutCommandOutput
>(
  'ListPhoneNumbersOptedOut',
  AWSListPhoneNumbersOptedOutCommand,
  PHONE_NUMBER_OPERATION_DEFAULTS,
);

// ----------------------------------------
// SMS Operations
// ----------------------------------------

/**
 * GetSMSAttributesCommand - Retrieves the settings for sending SMS messages from your account.
 * @example
 * ```typescript
 * const attributes = await GetSMSAttributesCommand({});
 * console.log(attributes.Attributes);
 * ```
 */
export const GetSMSAttributesCommand = createSNSCommand<
  GetSMSAttributesCommandInput,
  GetSMSAttributesCommandOutput
>('GetSMSAttributes', AWSGetSMSAttributesCommand, SMS_OPERATION_DEFAULTS);

/**
 * SetSMSAttributesCommand - Sets the default settings for sending SMS messages.
 * @example
 * ```typescript
 * await SetSMSAttributesCommand({
 *   attributes: {
 *     DefaultSenderID: 'MyApp',
 *     DeliveryStatusSuccessSamplingRate: '100'
 *   }
 * });
 * ```
 */
export const SetSMSAttributesCommand = createSNSCommand<
  SetSMSAttributesCommandInput,
  SetSMSAttributesCommandOutput
>('SetSMSAttributes', AWSSetSMSAttributesCommand, SMS_OPERATION_DEFAULTS);

/**
 * ValidatePhoneNumberCommand - [Removed]
 *
 * The ValidatePhoneNumberCommand has been removed as it does not exist in the AWS SDK.
 * If phone number validation is required, consider implementing a custom validation function
 * or using existing SNS commands to infer validity.
 */

// ----------------------------------------
// Mobile Push Operations
// ----------------------------------------

/**
 * GetDataProtectionPolicyCommand - Retrieves the data protection policy for the specified account.
 * @example
 * ```typescript
 * const policy = await GetDataProtectionPolicyCommand({});
 * console.log(policy.DataProtectionPolicy);
 * ```
 */
export const GetDataProtectionPolicyCommand = createSNSCommand<
  GetDataProtectionPolicyCommandInput,
  GetDataProtectionPolicyCommandOutput
>(
  'GetDataProtectionPolicy',
  AWSGetDataProtectionPolicyCommand,
  MOBILE_PUSH_OPERATION_DEFAULTS,
);

/**
 * PutDataProtectionPolicyCommand - Sets the data protection policy for the specified account.
 * @example
 * ```typescript
 * await PutDataProtectionPolicyCommand({
 *   DataProtectionPolicy: JSON.stringify({
 *     Version: '2012-10-17',
 *     Statement: [
 *       {
 *         Effect: 'Allow',
 *         Principal: '*',
 *         Action: 'SNS:Publish',
 *         Resource: '*'
 *       }
 *     ]
 *   })
 * });
 * ```
 */
export const PutDataProtectionPolicyCommand = createSNSCommand<
  PutDataProtectionPolicyCommandInput,
  PutDataProtectionPolicyCommandOutput
>(
  'PutDataProtectionPolicy',
  AWSPutDataProtectionPolicyCommand,
  MOBILE_PUSH_OPERATION_DEFAULTS,
);

/**
 * VerifySMSSandboxPhoneNumberCommand - Verifies an SMS sandbox phone number.
 * @example
 * ```typescript
 * await VerifySMSSandboxPhoneNumberCommand({
 *   PhoneNumber: '+1234567890'
 * });
 * ```
 */
export const VerifySMSSandboxPhoneNumberCommand = createSNSCommand<
  VerifySMSSandboxPhoneNumberCommandInput,
  VerifySMSSandboxPhoneNumberCommandOutput
>(
  'VerifySMSSandboxPhoneNumber',
  AWSVerifySMSSandboxPhoneNumberCommand,
  MOBILE_PUSH_OPERATION_DEFAULTS,
);

/**
 * CreateSMSSandboxPhoneNumberCommand - Creates an SMS sandbox phone number.
 * @example
 * ```typescript
 * const phoneNumber = await CreateSMSSandboxPhoneNumberCommand({
 *   PhoneNumber: '+1234567890'
 * });
 * ```
 */
export const CreateSMSSandboxPhoneNumberCommand = createSNSCommand<
  CreateSMSSandboxPhoneNumberCommandInput,
  CreateSMSSandboxPhoneNumberCommandOutput
>(
  'CreateSMSSandboxPhoneNumber',
  AWSCreateSMSSandboxPhoneNumberCommand,
  MOBILE_PUSH_OPERATION_DEFAULTS,
);

/**
 * DeleteSMSSandboxPhoneNumberCommand - Deletes an SMS sandbox phone number.
 * @example
 * ```typescript
 * await DeleteSMSSandboxPhoneNumberCommand({
 *   PhoneNumber: '+1234567890'
 * });
 * ```
 */
export const DeleteSMSSandboxPhoneNumberCommand = createSNSCommand<
  DeleteSMSSandboxPhoneNumberCommandInput,
  DeleteSMSSandboxPhoneNumberCommandOutput
>(
  'DeleteSMSSandboxPhoneNumber',
  AWSDeleteSMSSandboxPhoneNumberCommand,
  MOBILE_PUSH_OPERATION_DEFAULTS,
);

/**
 * ListSMSSandboxPhoneNumbersCommand - Lists the SMS sandbox phone numbers.
 * @example
 * ```typescript
 * const phoneNumbers = await ListSMSSandboxPhoneNumbersCommand({});
 * console.log(phoneNumbers.PhoneNumbers);
 * ```
 */
export const ListSMSSandboxPhoneNumbersCommand = createSNSCommand<
  ListSMSSandboxPhoneNumbersCommandInput,
  ListSMSSandboxPhoneNumbersCommandOutput
>('ListSMSSandboxPhoneNumbers', AWSListSMSSandboxPhoneNumbersCommand, {
  ...MOBILE_PUSH_OPERATION_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache sandbox phone numbers for 5 minutes
    key: 'sns:sms-sandbox-phone-numbers:{nextToken}',
  },
});

// ----------------------------------------
// Usage Examples and Common Patterns
// ----------------------------------------

/**
 * FIFO Topic Configuration Example:
 * ```typescript
 * // Create FIFO Topic
 * const fifoTopic = await CreateTopicCommand({
 *   Name: "MyTopic.fifo",
 *   Attributes: {
 *     FifoTopic: "true",
 *     ContentBasedDeduplication: "true"
 *   }
 * });
 *
 * // Publish to FIFO Topic
 * await PublishCommand({
 *   TopicArn: fifoTopic.TopicArn,
 *   Message: "Hello FIFO",
 *   MessageGroupId: "group123", // Required for FIFO
 *   MessageDeduplicationId: "unique123" // Required if ContentBasedDeduplication is false
 * });
 * ```
 */

/**
 * Subscription with Filter Policy Example:
 * ```typescript
 * // Create subscription with filter
 * const subscription = await SubscribeCommand({
 *   TopicArn: 'arn:aws:sns:region:account:topic',
 *   Protocol: 'sqs',
 *   Endpoint: 'arn:aws:sqs:region:account:queue',
 *   Attributes: {
 *     FilterPolicy: JSON.stringify({
 *       eventType: ['order_created'],
 *       amount: [{ numeric: ['>', 100] }]
 *     })
 *   }
 * });
 * ```
 */

/**
 * Batch Publishing with Error Handling Example:
 * ```typescript
 * try {
 *   const result = await PublishBatchCommand({
 *     TopicArn: 'arn:aws:sns:region:account:topic',
 *     PublishBatchRequestEntries: messages.map((msg, index) => ({
 *       Id: `msg${index}`,
 *       Message: JSON.stringify(msg),
 *       MessageAttributes: {
 *         'eventType': {
 *           DataType: 'String',
 *           StringValue: msg.type
 *         }
 *       }
 *     }))
 *   });
 *
 *   // Handle partial failures
 *   if (result.Failed && result.Failed.length > 0) {
 *     console.error('Some messages failed to publish:', result.Failed);
 *   }
 * } catch (error) {
 *   // Handle complete failures
 *   console.error('Batch publish failed:', error);
 * }
 * ```
 */

/**
 * Topic Cleanup Example:
 * ```typescript
 * async function cleanupTopic(topicArn: string) {
 *   // List and remove all subscriptions
 *   const subscriptions = await ListSubscriptionsByTopicCommand({
 *     TopicArn: topicArn
 *   });
 *
 *   await Promise.all(subscriptions.Subscriptions?.map(sub =>
 *     UnsubscribeCommand({ SubscriptionArn: sub.SubscriptionArn })
 *   ) || []);
 *
 *   // Remove tags
 *   const tags = await ListTagsForResourceCommand({
 *     ResourceArn: topicArn
 *   });
 *
 *   if (tags.Tags?.length) {
 *     await UntagResourceCommand({
 *       ResourceArn: topicArn,
 *       TagKeys: tags.Tags.map(tag => tag.Key)
 *     });
 *   }
 *
 *   // Delete the topic
 *   await DeleteTopicCommand({ TopicArn: topicArn });
 * }
 * ```
 */

/**
 * Platform Application Example:
 * ```typescript
 * // Create Platform Application
 * const platformApp = await CreatePlatformApplicationCommand({
 *   Name: 'MyPlatformApp',
 *   Platform: 'GCM',
 *   Attributes: {
 *     PlatformCredential: 'YOUR_API_KEY',
 *     PlatformPrincipal: 'YOUR_SENDER_ID'
 *   }
 * });
 *
 * // Create Platform Endpoint
 * const endpoint = await CreatePlatformEndpointCommand({
 *   PlatformApplicationArn: platformApp.PlatformApplicationArn,
 *   Token: 'DEVICE_TOKEN',
 *   CustomUserData: 'User data for this endpoint'
 * });
 *
 * // Set Endpoint Attributes
 * await SetEndpointAttributesCommand({
 *   EndpointArn: endpoint.EndpointArn,
 *   Attributes: {
 *     Enabled: 'true'
 *   }
 * });
 * ```
 */

/**
 * Phone Number Operations Example:
 * ```typescript
 * // Opt-in a phone number
 * await OptInPhoneNumberCommand({
 *   phoneNumber: '+1234567890'
 * });
 *
 * // Check if a phone number is opted out
 * const isOptedOut = await CheckIfPhoneNumberIsOptedOutCommand({
 *   phoneNumber: '+1234567890'
 * });
 * console.log(isOptedOut.isOptedOut);
 *
 * // List opted-out phone numbers
 * const optedOutNumbers = await ListPhoneNumbersOptedOutCommand({});
 * console.log(optedOutNumbers.PhoneNumbers);
 * ```
 */

/**
 * SMS Operations Example:
 * ```typescript
 * // Get SMS Attributes
 * const smsAttributes = await GetSMSAttributesCommand({});
 * console.log(smsAttributes.Attributes);
 *
 * // Set SMS Attributes
 * await SetSMSAttributesCommand({
 *   attributes: {
 *     DefaultSenderID: 'MyApp',
 *     DeliveryStatusSuccessSamplingRate: '100'
 *   }
 * });
 *
 * // Validate Phone Number
 * // Note: ValidatePhoneNumberCommand has been removed.
 * // Implement custom validation if necessary.
 * ```
 */

/**
 * Mobile Push Operations Example:
 * ```typescript
 * // Create SMS Sandbox Phone Number
 * const sandboxPhone = await CreateSMSSandboxPhoneNumberCommand({
 *   PhoneNumber: '+1234567890'
 * });
 *
 * // Verify SMS Sandbox Phone Number
 * await VerifySMSSandboxPhoneNumberCommand({
 *   PhoneNumber: '+1234567890'
 * });
 *
 * // Get Data Protection Policy
 * const policy = await GetDataProtectionPolicyCommand({});
 * console.log(policy.DataProtectionPolicy);
 *
 * // Put Data Protection Policy
 * await PutDataProtectionPolicyCommand({
 *   DataProtectionPolicy: JSON.stringify({
 *     Version: '2012-10-17',
 *     Statement: [
 *       {
 *         Effect: 'Allow',
 *         Principal: '*',
 *         Action: 'SNS:Publish',
 *         Resource: '*'
 *       }
 *     ]
 *   })
 * });
 *
 * // List SMS Sandbox Phone Numbers
 * const sandboxNumbers = await ListSMSSandboxPhoneNumbersCommand({});
 * console.log(sandboxNumbers.PhoneNumbers);
 *
 * // Delete SMS Sandbox Phone Number
 * await DeleteSMSSandboxPhoneNumberCommand({
 *   PhoneNumber: '+1234567890'
 * });
 * ```
 */
