// src/integrations/aws/eventbridge/commands.ts

import {
  // Event Operations
  PutEventsCommand as AWSEventBridgePutEventsCommand,

  // Rule Management Operations
  PutRuleCommand as AWSEventBridgePutRuleCommand,
  DeleteRuleCommand as AWSEventBridgeDeleteRuleCommand,
  DescribeRuleCommand as AWSEventBridgeDescribeRuleCommand,
  EnableRuleCommand as AWSEventBridgeEnableRuleCommand,
  DisableRuleCommand as AWSEventBridgeDisableRuleCommand,
  ListRulesCommand as AWSEventBridgeListRulesCommand,

  // Target Management Operations
  PutTargetsCommand as AWSEventBridgePutTargetsCommand,
  RemoveTargetsCommand as AWSEventBridgeRemoveTargetsCommand,
  ListTargetsByRuleCommand as AWSEventBridgeListTargetsByRuleCommand,

  // Event Bus Management Operations
  CreateEventBusCommand as AWSEventBridgeCreateEventBusCommand,
  DeleteEventBusCommand as AWSEventBridgeDeleteEventBusCommand,
  DescribeEventBusCommand as AWSEventBridgeDescribeEventBusCommand,
  ListEventBusesCommand as AWSEventBridgeListEventBusesCommand,
  UpdateEventBusCommand as AWSEventBridgeUpdateEventBusCommand,

  // Partner Event Source Operations
  CreatePartnerEventSourceCommand as AWSEventBridgeCreatePartnerEventSourceCommand,
  DeletePartnerEventSourceCommand as AWSEventBridgeDeletePartnerEventSourceCommand,
  DescribePartnerEventSourceCommand as AWSEventBridgeDescribePartnerEventSourceCommand,
  ListPartnerEventSourceAccountsCommand as AWSEventBridgeListPartnerEventSourceAccountsCommand,
  ListPartnerEventSourcesCommand as AWSEventBridgeListPartnerEventSourcesCommand,

  // API Destinations and Connections
  CreateApiDestinationCommand as AWSEventBridgeCreateApiDestinationCommand,
  DeleteApiDestinationCommand as AWSEventBridgeDeleteApiDestinationCommand,
  DescribeApiDestinationCommand as AWSEventBridgeDescribeApiDestinationCommand,
  ListApiDestinationsCommand as AWSEventBridgeListApiDestinationsCommand,
  UpdateApiDestinationCommand as AWSEventBridgeUpdateApiDestinationCommand,
  CreateConnectionCommand as AWSEventBridgeCreateConnectionCommand,
  DeleteConnectionCommand as AWSEventBridgeDeleteConnectionCommand,
  DescribeConnectionCommand as AWSEventBridgeDescribeConnectionCommand,
  ListConnectionsCommand as AWSEventBridgeListConnectionsCommand,
  UpdateConnectionCommand as AWSEventBridgeUpdateConnectionCommand,

  // Archives and Replays
  CreateArchiveCommand as AWSEventBridgeCreateArchiveCommand,
  DeleteArchiveCommand as AWSEventBridgeDeleteArchiveCommand,
  DescribeArchiveCommand as AWSEventBridgeDescribeArchiveCommand,
  ListArchivesCommand as AWSEventBridgeListArchivesCommand,
  UpdateArchiveCommand as AWSEventBridgeUpdateArchiveCommand,
  StartReplayCommand as AWSEventBridgeStartReplayCommand,
  ListReplaysCommand as AWSEventBridgeListReplaysCommand,

  // Tags Management
  TagResourceCommand as AWSEventBridgeTagResourceCommand,
  UntagResourceCommand as AWSEventBridgeUntagResourceCommand,
  ListTagsForResourceCommand as AWSEventBridgeListTagsForResourceCommand,

  // Testing and Validation
  TestEventPatternCommand as AWSEventBridgeTestEventPatternCommand,

  // Replays and Event Source Activations
  ActivateEventSourceCommand as AWSEventBridgeActivateEventSourceCommand,
  DeactivateEventSourceCommand as AWSEventBridgeDeactivateEventSourceCommand,

  // Additional Utility Commands
  PutPartnerEventsCommand as AWSEventBridgePutPartnerEventsCommand,

  // Type imports
  type PutEventsCommandInput,
  type PutEventsCommandOutput,
  type PutRuleCommandInput,
  type PutRuleCommandOutput,
  type DeleteRuleCommandInput,
  type DeleteRuleCommandOutput,
  type DescribeRuleCommandInput,
  type DescribeRuleCommandOutput,
  type EnableRuleCommandInput,
  type EnableRuleCommandOutput,
  type DisableRuleCommandInput,
  type DisableRuleCommandOutput,
  type ListRulesCommandInput,
  type ListRulesCommandOutput,
  type PutTargetsCommandInput,
  type PutTargetsCommandOutput,
  type RemoveTargetsCommandInput,
  type RemoveTargetsCommandOutput,
  type ListTargetsByRuleCommandInput,
  type ListTargetsByRuleCommandOutput,
  type CreateEventBusCommandInput,
  type CreateEventBusCommandOutput,
  type DeleteEventBusCommandInput,
  type DeleteEventBusCommandOutput,
  type DescribeEventBusCommandInput,
  type DescribeEventBusCommandOutput,
  type ListEventBusesCommandInput,
  type ListEventBusesCommandOutput,
  type UpdateEventBusCommandInput,
  type UpdateEventBusCommandOutput,
  type CreatePartnerEventSourceCommandInput,
  type CreatePartnerEventSourceCommandOutput,
  type DeletePartnerEventSourceCommandInput,
  type DeletePartnerEventSourceCommandOutput,
  type DescribePartnerEventSourceCommandInput,
  type DescribePartnerEventSourceCommandOutput,
  type ListPartnerEventSourceAccountsCommandInput,
  type ListPartnerEventSourceAccountsCommandOutput,
  type ListPartnerEventSourcesCommandInput,
  type ListPartnerEventSourcesCommandOutput,
  type CreateApiDestinationCommandInput,
  type CreateApiDestinationCommandOutput,
  type DeleteApiDestinationCommandInput,
  type DeleteApiDestinationCommandOutput,
  type DescribeApiDestinationCommandInput,
  type DescribeApiDestinationCommandOutput,
  type ListApiDestinationsCommandInput,
  type ListApiDestinationsCommandOutput,
  type UpdateApiDestinationCommandInput,
  type UpdateApiDestinationCommandOutput,
  type CreateConnectionCommandInput,
  type CreateConnectionCommandOutput,
  type DeleteConnectionCommandInput,
  type DeleteConnectionCommandOutput,
  type DescribeConnectionCommandInput,
  type DescribeConnectionCommandOutput,
  type ListConnectionsCommandInput,
  type ListConnectionsCommandOutput,
  type UpdateConnectionCommandInput,
  type UpdateConnectionCommandOutput,
  type CreateArchiveCommandInput,
  type CreateArchiveCommandOutput,
  type DeleteArchiveCommandInput,
  type DeleteArchiveCommandOutput,
  type DescribeArchiveCommandInput,
  type DescribeArchiveCommandOutput,
  type ListArchivesCommandInput,
  type ListArchivesCommandOutput,
  type UpdateArchiveCommandInput,
  type UpdateArchiveCommandOutput,
  type StartReplayCommandInput,
  type StartReplayCommandOutput,
  type ListReplaysCommandInput,
  type ListReplaysCommandOutput,
  type TagResourceCommandInput,
  type TagResourceCommandOutput,
  type UntagResourceCommandInput,
  type UntagResourceCommandOutput,
  type ListTagsForResourceCommandInput,
  type ListTagsForResourceCommandOutput,
  type TestEventPatternCommandInput,
  type TestEventPatternCommandOutput,
  type ActivateEventSourceCommandInput,
  type ActivateEventSourceCommandOutput,
  type DeactivateEventSourceCommandInput,
  type DeactivateEventSourceCommandOutput,
  type PutPartnerEventsCommandInput,
  type PutPartnerEventsCommandOutput,
} from '@aws-sdk/client-eventbridge';

import { createEventBridgeCommand } from './client';
import type { WrapperConfig } from '#/lib/integrationFactory';

// Default configurations for different operation types
const EVENT_OPERATION_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 15_000,
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
    redactKeys: ['Entries', 'EventBusName', 'Source', 'Detail'],
  },
};

const _BATCH_OPERATION_DEFAULTS: Partial<WrapperConfig> = {
  ...EVENT_OPERATION_DEFAULTS,
  timeout: 30_000, // 30 seconds for batch operations
  retries: 5,
};

const RULE_MANAGEMENT_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 45_000, // 45 seconds for management operations
  retries: 2,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 25, // More sensitive circuit breaking for management ops
    resetTimeout: 60_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Name', 'EventBusName', 'State', 'ScheduleExpression'],
  },
};

const EVENT_BUS_MANAGEMENT_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 45_000,
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
    redactKeys: ['Name', 'Arn', 'Policy'],
  },
};

const PARTNER_EVENT_SOURCE_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 30_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 40,
    resetTimeout: 30_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Name', 'Arn', 'State'],
  },
};

const API_DESTINATION_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 30_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 40,
    resetTimeout: 30_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Name', 'ApiDestinationArn', 'InvocationEndpoint'],
  },
};

const CONNECTION_MANAGEMENT_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 30_000,
  retries: 3,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 40,
    resetTimeout: 30_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['Name', 'ConnectionArn'],
  },
};

const ARCHIVE_REPLAY_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 60_000,
  retries: 2,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 30,
    resetTimeout: 60_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['ArchiveName', 'EventSourceArn'],
  },
};

const TAGS_MANAGEMENT_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 15_000,
  retries: 2,
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
    redactKeys: ['ResourceARN', 'TagKey'],
  },
};

const TESTING_VALIDATION_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 10_000,
  retries: 1,
  logging: {
    enabled: true,
    redactKeys: ['EventPattern'],
  },
  // Removed 'circuit' property as it's disabled
};

const EVENT_SOURCE_ACTIVATION_DEFAULTS: Partial<WrapperConfig> = {
  timeout: 20_000,
  retries: 2,
  circuit: {
    enabled: true,
    errorThresholdPercentage: 35,
    resetTimeout: 30_000,
    bucketSize: 1000,
    bucketCount: 60,
    halfOpenLimit: 5,
    degradationThreshold: 10_000,
  },
  logging: {
    enabled: true,
    redactKeys: ['EventSourceArn', 'State'],
  },
};

// Wrapper Commands

/**
 * Event Operations
 */
export const PutEventsCommand = createEventBridgeCommand<
  PutEventsCommandInput,
  PutEventsCommandOutput
>('PutEvents', AWSEventBridgePutEventsCommand, EVENT_OPERATION_DEFAULTS);

/**
 * Rule Management Operations
 */
export const PutRuleCommand = createEventBridgeCommand<
  PutRuleCommandInput,
  PutRuleCommandOutput
>('PutRule', AWSEventBridgePutRuleCommand, RULE_MANAGEMENT_DEFAULTS);

export const DeleteRuleCommand = createEventBridgeCommand<
  DeleteRuleCommandInput,
  DeleteRuleCommandOutput
>('DeleteRule', AWSEventBridgeDeleteRuleCommand, RULE_MANAGEMENT_DEFAULTS);

export const DescribeRuleCommand = createEventBridgeCommand<
  DescribeRuleCommandInput,
  DescribeRuleCommandOutput
>('DescribeRule', AWSEventBridgeDescribeRuleCommand, {
  ...RULE_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 3600, // Cache rule descriptions for 1 hour
    key: 'eventbridge:rule-description:{ruleName}',
  },
});

export const EnableRuleCommand = createEventBridgeCommand<
  EnableRuleCommandInput,
  EnableRuleCommandOutput
>('EnableRule', AWSEventBridgeEnableRuleCommand, RULE_MANAGEMENT_DEFAULTS);

export const DisableRuleCommand = createEventBridgeCommand<
  DisableRuleCommandInput,
  DisableRuleCommandOutput
>('DisableRule', AWSEventBridgeDisableRuleCommand, RULE_MANAGEMENT_DEFAULTS);

export const ListRulesCommand = createEventBridgeCommand<
  ListRulesCommandInput,
  ListRulesCommandOutput
>('ListRules', AWSEventBridgeListRulesCommand, {
  ...RULE_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache rule list for 5 minutes
    key: 'eventbridge:rule-list:{eventBusName}',
  },
});

/**
 * Target Management Operations
 */
export const PutTargetsCommand = createEventBridgeCommand<
  PutTargetsCommandInput,
  PutTargetsCommandOutput
>('PutTargets', AWSEventBridgePutTargetsCommand, RULE_MANAGEMENT_DEFAULTS);

export const RemoveTargetsCommand = createEventBridgeCommand<
  RemoveTargetsCommandInput,
  RemoveTargetsCommandOutput
>(
  'RemoveTargets',
  AWSEventBridgeRemoveTargetsCommand,
  RULE_MANAGEMENT_DEFAULTS,
);

export const ListTargetsByRuleCommand = createEventBridgeCommand<
  ListTargetsByRuleCommandInput,
  ListTargetsByRuleCommandOutput
>('ListTargetsByRule', AWSEventBridgeListTargetsByRuleCommand, {
  ...RULE_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache targets list for 5 minutes
    key: 'eventbridge:targets-list:{ruleName}',
  },
});

/**
 * Event Bus Management Operations
 */
export const CreateEventBusCommand = createEventBridgeCommand<
  CreateEventBusCommandInput,
  CreateEventBusCommandOutput
>(
  'CreateEventBus',
  AWSEventBridgeCreateEventBusCommand,
  EVENT_BUS_MANAGEMENT_DEFAULTS,
);

export const DeleteEventBusCommand = createEventBridgeCommand<
  DeleteEventBusCommandInput,
  DeleteEventBusCommandOutput
>(
  'DeleteEventBus',
  AWSEventBridgeDeleteEventBusCommand,
  EVENT_BUS_MANAGEMENT_DEFAULTS,
);

export const DescribeEventBusCommand = createEventBridgeCommand<
  DescribeEventBusCommandInput,
  DescribeEventBusCommandOutput
>('DescribeEventBus', AWSEventBridgeDescribeEventBusCommand, {
  ...EVENT_BUS_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 3600, // Cache event bus descriptions for 1 hour
    key: 'eventbridge:event-bus-description:{eventBusName}',
  },
});

export const ListEventBusesCommand = createEventBridgeCommand<
  ListEventBusesCommandInput,
  ListEventBusesCommandOutput
>('ListEventBuses', AWSEventBridgeListEventBusesCommand, {
  ...EVENT_BUS_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache event bus list for 5 minutes
    key: 'eventbridge:event-bus-list:{prefix}',
  },
});

export const UpdateEventBusCommand = createEventBridgeCommand<
  UpdateEventBusCommandInput,
  UpdateEventBusCommandOutput
>(
  'UpdateEventBus',
  AWSEventBridgeUpdateEventBusCommand,
  EVENT_BUS_MANAGEMENT_DEFAULTS,
);

/**
 * Partner Event Source Operations
 */
export const CreatePartnerEventSourceCommand = createEventBridgeCommand<
  CreatePartnerEventSourceCommandInput,
  CreatePartnerEventSourceCommandOutput
>(
  'CreatePartnerEventSource',
  AWSEventBridgeCreatePartnerEventSourceCommand,
  PARTNER_EVENT_SOURCE_DEFAULTS,
);

export const DeletePartnerEventSourceCommand = createEventBridgeCommand<
  DeletePartnerEventSourceCommandInput,
  DeletePartnerEventSourceCommandOutput
>(
  'DeletePartnerEventSource',
  AWSEventBridgeDeletePartnerEventSourceCommand,
  PARTNER_EVENT_SOURCE_DEFAULTS,
);

export const DescribePartnerEventSourceCommand = createEventBridgeCommand<
  DescribePartnerEventSourceCommandInput,
  DescribePartnerEventSourceCommandOutput
>(
  'DescribePartnerEventSource',
  AWSEventBridgeDescribePartnerEventSourceCommand,
  {
    ...PARTNER_EVENT_SOURCE_DEFAULTS,
    cache: {
      enabled: true,
      ttl: 3600, // Cache partner event source descriptions for 1 hour
      key: 'eventbridge:partner-event-source-description:{eventSourceName}',
    },
  },
);

export const ListPartnerEventSourceAccountsCommand = createEventBridgeCommand<
  ListPartnerEventSourceAccountsCommandInput,
  ListPartnerEventSourceAccountsCommandOutput
>(
  'ListPartnerEventSourceAccounts',
  AWSEventBridgeListPartnerEventSourceAccountsCommand,
  {
    ...PARTNER_EVENT_SOURCE_DEFAULTS,
    cache: {
      enabled: true,
      ttl: 300, // Cache partner event source accounts for 5 minutes
      key: 'eventbridge:partner-event-source-accounts:{eventSourceName}',
    },
  },
);

export const ListPartnerEventSourcesCommand = createEventBridgeCommand<
  ListPartnerEventSourcesCommandInput,
  ListPartnerEventSourcesCommandOutput
>('ListPartnerEventSources', AWSEventBridgeListPartnerEventSourcesCommand, {
  ...PARTNER_EVENT_SOURCE_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache partner event sources for 5 minutes
    key: 'eventbridge:partner-event-sources:{prefix}',
  },
});

export const UpdatePartnerEventSourceCommand = createEventBridgeCommand<
  CreatePartnerEventSourceCommandInput,
  CreatePartnerEventSourceCommandOutput
>(
  'UpdatePartnerEventSource',
  AWSEventBridgeCreatePartnerEventSourceCommand,
  PARTNER_EVENT_SOURCE_DEFAULTS,
);

/**
 * API Destinations and Connections
 */
export const CreateApiDestinationCommand = createEventBridgeCommand<
  CreateApiDestinationCommandInput,
  CreateApiDestinationCommandOutput
>(
  'CreateApiDestination',
  AWSEventBridgeCreateApiDestinationCommand,
  API_DESTINATION_DEFAULTS,
);

export const DeleteApiDestinationCommand = createEventBridgeCommand<
  DeleteApiDestinationCommandInput,
  DeleteApiDestinationCommandOutput
>(
  'DeleteApiDestination',
  AWSEventBridgeDeleteApiDestinationCommand,
  API_DESTINATION_DEFAULTS,
);

export const DescribeApiDestinationCommand = createEventBridgeCommand<
  DescribeApiDestinationCommandInput,
  DescribeApiDestinationCommandOutput
>('DescribeApiDestination', AWSEventBridgeDescribeApiDestinationCommand, {
  ...API_DESTINATION_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 3600, // Cache API destination descriptions for 1 hour
    key: 'eventbridge:api-destination-description:{apiDestinationName}',
  },
});

export const ListApiDestinationsCommand = createEventBridgeCommand<
  ListApiDestinationsCommandInput,
  ListApiDestinationsCommandOutput
>('ListApiDestinations', AWSEventBridgeListApiDestinationsCommand, {
  ...API_DESTINATION_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache API destinations list for 5 minutes
    key: 'eventbridge:api-destinations-list:{prefix}',
  },
});

export const UpdateApiDestinationCommand = createEventBridgeCommand<
  UpdateApiDestinationCommandInput,
  UpdateApiDestinationCommandOutput
>(
  'UpdateApiDestination',
  AWSEventBridgeUpdateApiDestinationCommand,
  API_DESTINATION_DEFAULTS,
);

/**
 * Connections Management Operations
 */
export const CreateConnectionCommand = createEventBridgeCommand<
  CreateConnectionCommandInput,
  CreateConnectionCommandOutput
>(
  'CreateConnection',
  AWSEventBridgeCreateConnectionCommand,
  CONNECTION_MANAGEMENT_DEFAULTS,
);

export const DeleteConnectionCommand = createEventBridgeCommand<
  DeleteConnectionCommandInput,
  DeleteConnectionCommandOutput
>(
  'DeleteConnection',
  AWSEventBridgeDeleteConnectionCommand,
  CONNECTION_MANAGEMENT_DEFAULTS,
);

export const DescribeConnectionCommand = createEventBridgeCommand<
  DescribeConnectionCommandInput,
  DescribeConnectionCommandOutput
>('DescribeConnection', AWSEventBridgeDescribeConnectionCommand, {
  ...CONNECTION_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 3600, // Cache connection descriptions for 1 hour
    key: 'eventbridge:connection-description:{connectionName}',
  },
});

export const ListConnectionsCommand = createEventBridgeCommand<
  ListConnectionsCommandInput,
  ListConnectionsCommandOutput
>('ListConnections', AWSEventBridgeListConnectionsCommand, {
  ...CONNECTION_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache connections list for 5 minutes
    key: 'eventbridge:connections-list:{prefix}',
  },
});

export const UpdateConnectionCommand = createEventBridgeCommand<
  UpdateConnectionCommandInput,
  UpdateConnectionCommandOutput
>(
  'UpdateConnection',
  AWSEventBridgeUpdateConnectionCommand,
  CONNECTION_MANAGEMENT_DEFAULTS,
);

/**
 * Archives and Replays
 */
export const CreateArchiveCommand = createEventBridgeCommand<
  CreateArchiveCommandInput,
  CreateArchiveCommandOutput
>('CreateArchive', AWSEventBridgeCreateArchiveCommand, ARCHIVE_REPLAY_DEFAULTS);

export const DeleteArchiveCommand = createEventBridgeCommand<
  DeleteArchiveCommandInput,
  DeleteArchiveCommandOutput
>('DeleteArchive', AWSEventBridgeDeleteArchiveCommand, ARCHIVE_REPLAY_DEFAULTS);

export const DescribeArchiveCommand = createEventBridgeCommand<
  DescribeArchiveCommandInput,
  DescribeArchiveCommandOutput
>('DescribeArchive', AWSEventBridgeDescribeArchiveCommand, {
  ...ARCHIVE_REPLAY_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 3600, // Cache archive descriptions for 1 hour
    key: 'eventbridge:archive-description:{archiveName}',
  },
});

export const ListArchivesCommand = createEventBridgeCommand<
  ListArchivesCommandInput,
  ListArchivesCommandOutput
>('ListArchives', AWSEventBridgeListArchivesCommand, {
  ...ARCHIVE_REPLAY_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache archives list for 5 minutes
    key: 'eventbridge:archives-list:{prefix}',
  },
});

export const UpdateArchiveCommand = createEventBridgeCommand<
  UpdateArchiveCommandInput,
  UpdateArchiveCommandOutput
>('UpdateArchive', AWSEventBridgeUpdateArchiveCommand, ARCHIVE_REPLAY_DEFAULTS);

export const StartReplayCommand = createEventBridgeCommand<
  StartReplayCommandInput,
  StartReplayCommandOutput
>('StartReplay', AWSEventBridgeStartReplayCommand, ARCHIVE_REPLAY_DEFAULTS);

export const ListReplaysCommand = createEventBridgeCommand<
  ListReplaysCommandInput,
  ListReplaysCommandOutput
>('ListReplays', AWSEventBridgeListReplaysCommand, {
  ...ARCHIVE_REPLAY_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache replays list for 5 minutes
    key: 'eventbridge:replays-list:{prefix}',
  },
});

/**
 * Tags Management Operations
 */
export const TagResourceCommand = createEventBridgeCommand<
  TagResourceCommandInput,
  TagResourceCommandOutput
>('TagResource', AWSEventBridgeTagResourceCommand, TAGS_MANAGEMENT_DEFAULTS);

export const UntagResourceCommand = createEventBridgeCommand<
  UntagResourceCommandInput,
  UntagResourceCommandOutput
>(
  'UntagResource',
  AWSEventBridgeUntagResourceCommand,
  TAGS_MANAGEMENT_DEFAULTS,
);

export const ListTagsForResourceCommand = createEventBridgeCommand<
  ListTagsForResourceCommandInput,
  ListTagsForResourceCommandOutput
>('ListTagsForResource', AWSEventBridgeListTagsForResourceCommand, {
  ...TAGS_MANAGEMENT_DEFAULTS,
  cache: {
    enabled: true,
    ttl: 300, // Cache tags list for 5 minutes
    key: 'eventbridge:tags-list:{resourceArn}',
  },
});

/**
 * Testing and Validation Operations
 */
export const TestEventPatternCommand = createEventBridgeCommand<
  TestEventPatternCommandInput,
  TestEventPatternCommandOutput
>(
  'TestEventPattern',
  AWSEventBridgeTestEventPatternCommand,
  TESTING_VALIDATION_DEFAULTS,
);

/**
 * Replays and Event Source Activations
 */
export const ActivateEventSourceCommand = createEventBridgeCommand<
  ActivateEventSourceCommandInput,
  ActivateEventSourceCommandOutput
>(
  'ActivateEventSource',
  AWSEventBridgeActivateEventSourceCommand,
  EVENT_SOURCE_ACTIVATION_DEFAULTS,
);

export const DeactivateEventSourceCommand = createEventBridgeCommand<
  DeactivateEventSourceCommandInput,
  DeactivateEventSourceCommandOutput
>(
  'DeactivateEventSource',
  AWSEventBridgeDeactivateEventSourceCommand,
  EVENT_SOURCE_ACTIVATION_DEFAULTS,
);

/**
 * Additional Utility Commands
 */
export const PutPartnerEventsCommand = createEventBridgeCommand<
  PutPartnerEventsCommandInput,
  PutPartnerEventsCommandOutput
>(
  'PutPartnerEvents',
  AWSEventBridgePutPartnerEventsCommand,
  EVENT_OPERATION_DEFAULTS,
);

// Example usage with Dead Letter Queue replaced by EventBridge Rule and Targets:
/*
const configureRule = async (ruleName: string, eventBusName: string, targetIds: string[]) => {
  // Create or update a rule
  await PutRuleCommand({
    Name: ruleName,
    EventBusName: eventBusName,
    // Additional rule configuration
  });

  // Add targets to the rule
  await PutTargetsCommand({
    Rule: ruleName,
    EventBusName: eventBusName,
    Targets: targetIds.map(id => ({
      Id: id,
      // Additional target configuration
    })),
  });
};
*/
