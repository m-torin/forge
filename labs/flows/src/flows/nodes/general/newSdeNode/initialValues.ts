import {
  FormValues,
  SharedSettings,
  SourceSettings,
  DestinationSettings,
  EnrichmentSettings,
  EventBridgeConfig,
} from './formSchema';
import { FbNodeData } from '#/flows/types';
import { isRecordObject } from '#/flows/nodes/internal';

/**
 * Helper function to generate a safe event source name
 */
export const generateEventSourceName = (name: string): string => {
  return `aws.eventbridge.${name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`;
};

/**
 * Default EventBridge configuration
 */
const defaultEventBridgeConfig: EventBridgeConfig = {
  enabled: true,
  region: 'us-east-1',
  eventBusName: 'default',
  eventPattern: {
    source: [],
    detailType: [],
    customPattern: undefined,
  },
  targetConfig: {
    targetBusName: 'default',
    ruleName: '',
    inputTransform: {
      template: JSON.stringify(
        {
          detail: '$.detail',
          source: '$.source',
          'detail-type': '$.detail-type',
          time: '$.time',
        },
        null,
        2,
      ),
      paths: {
        '$.detail': '$.body',
        '$.source': '$.metadata.source',
        '$.detail-type': '$.type',
      },
    },
  },
};

/**
 * Default values for shared settings used across all node types
 */
const defaultSharedSettings: SharedSettings = {
  format: 'json',
  validation: {
    enabled: false,
    schema: 'json',
  },
  timeout: 30,
  retries: {
    enabled: true,
    maxAttempts: 3,
    delay: 1,
  },
  logging: {
    level: 'info',
    enabled: true,
  },
};

/**
 * Default values for source mode
 */
const defaultSourceSettings: SourceSettings = {
  inputValidation: {
    required: true,
    schema: undefined,
  },
  transformation: {
    enabled: false,
    rules: [],
  },
  rateLimit: {
    enabled: true,
    requestsPerMinute: 100,
    burstLimit: 150,
  },
  cache: {
    enabled: false,
    ttl: 300,
    strategy: 'memory',
  },
  eventBridge: {
    ...defaultEventBridgeConfig,
    eventPattern: {
      source: ['aws.custom'],
      detailType: ['event'],
      customPattern: undefined,
    },
  },
};

/**
 * Default values for destination mode
 */
const defaultDestinationSettings: DestinationSettings = {
  targetSystem: {
    type: 'eventbridge',
    config: {},
  },
  outputFormat: {
    type: 'json',
    template: undefined,
  },
  errorHandling: {
    strategy: 'retry',
    maxRetries: 3,
  },
  batching: {
    enabled: false,
    size: 100,
    window: 60,
  },
  eventBridge: {
    ...defaultEventBridgeConfig,
    targetConfig: {
      targetBusName: 'default',
      ruleName: '',
      inputTransform: {
        template: JSON.stringify(
          {
            data: '{{input}}',
            timestamp: '{{timestamp}}',
            requestId: '{{requestId}}',
          },
          null,
          2,
        ),
        paths: {},
      },
    },
  },
};

/**
 * Default values for enrichment mode
 */
const defaultEnrichmentSettings: EnrichmentSettings = {
  enrichmentType: 'transform',
  rules: [],
  validation: {
    enabled: false,
    schema: undefined,
  },
  cache: {
    enabled: false,
    duration: 300,
  },
  eventBridge: {
    ...defaultEventBridgeConfig,
    eventPattern: {
      source: ['aws.custom'],
      detailType: ['enrichment'],
      customPattern: undefined,
    },
  },
};

/**
 * Helper function to generate node name based on mode
 */
const generateNodeName = (mode: string, customName?: string | null): string => {
  if (customName) return customName;
  const prefix = mode.charAt(0).toUpperCase() + mode.slice(1);
  return `EventBridge ${prefix}`;
};

/**
 * Get initial form values with proper defaults based on node mode
 * Handles source, destination, and enrichment node types
 */
export const getInitialValues = (data: FbNodeData): FormValues => {
  // Determine node mode based on type
  const nodeMode = data.type?.includes('Source')
    ? 'source'
    : data.type?.includes('Destination')
      ? 'destination'
      : 'enrichment';

  const eventSourceName = data.name
    ? generateEventSourceName(data.name)
    : 'unnamed-event';

  // Initialize metadata with proper discriminated union type
  const baseMetadata: FormValues['metadata'] =
    nodeMode === 'source'
      ? {
          nodeMode: 'source',
          shared: defaultSharedSettings,
          source: {
            ...defaultSourceSettings,
            eventBridge: {
              ...defaultSourceSettings.eventBridge,
              eventBusName: eventSourceName,
            },
          },
          destination: undefined,
          enrichment: undefined,
        }
      : nodeMode === 'destination'
        ? {
            nodeMode: 'destination',
            shared: defaultSharedSettings,
            source: undefined,
            destination: defaultDestinationSettings,
            enrichment: undefined,
          }
        : {
            nodeMode: 'enrichment',
            shared: defaultSharedSettings,
            source: undefined,
            destination: undefined,
            enrichment: defaultEnrichmentSettings,
          };

  // Type-safe merging of existing metadata
  if (isRecordObject(data.metadata)) {
    const existingMetadata = data.metadata as Partial<FormValues['metadata']>;

    // Merge shared settings
    if (existingMetadata.shared) {
      baseMetadata.shared = {
        ...baseMetadata.shared,
        ...existingMetadata.shared,
      };
    }

    // Merge mode-specific settings
    if (nodeMode === 'source' && baseMetadata.nodeMode === 'source') {
      if (existingMetadata.source) {
        baseMetadata.source = {
          ...baseMetadata.source,
          ...existingMetadata.source,
          eventBridge: {
            ...baseMetadata.source.eventBridge,
            ...(existingMetadata.source.eventBridge || {}),
          },
        };
      }
    } else if (
      nodeMode === 'destination' &&
      baseMetadata.nodeMode === 'destination'
    ) {
      if (existingMetadata.destination) {
        baseMetadata.destination = {
          ...baseMetadata.destination,
          ...existingMetadata.destination,
          eventBridge: {
            ...baseMetadata.destination.eventBridge,
            ...(existingMetadata.destination.eventBridge || {}),
          },
        };
      }
    } else if (
      nodeMode === 'enrichment' &&
      baseMetadata.nodeMode === 'enrichment'
    ) {
      if (existingMetadata.enrichment) {
        baseMetadata.enrichment = {
          ...baseMetadata.enrichment,
          ...existingMetadata.enrichment,
          eventBridge: {
            ...baseMetadata.enrichment.eventBridge,
            ...(existingMetadata.enrichment.eventBridge || {}),
          },
        };
      }
    }
  }

  // Return type-safe form values
  return {
    name: data.name ?? generateNodeName(nodeMode),
    isEnabled: data.isEnabled ?? true,
    metadata: baseMetadata,
    uxMeta: {
      heading: data.uxMeta?.heading ?? generateNodeName(nodeMode, data.name),
      isExpanded: data.uxMeta?.isExpanded ?? false,
      layer: data.uxMeta?.layer ?? 0,
      isLocked: data.uxMeta?.isLocked ?? false,
      rotation: data.uxMeta?.rotation ?? 0,
    },
  };
};
