import {
  type FormValues,
  type SharedSettings,
  type SourceSettings,
  type DestinationSettings,
  type EnrichmentSettings,
  type EventBridgeConfig,
  type WebhookNodeType,
  type NodeMode,
  formSchema,
} from './formSchema';
import { FbNodeData } from '#/flows/types';
import { logWarn, logError } from '@repo/observability';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Converts webhook name to valid event source identifier
 */
export const generateEventSourceName = (webhookName: string): string => {
  return `webhook.${webhookName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`;
};

/**
 * Maps node type to mode
 */
const getNodeMode = (type: WebhookNodeType): NodeMode => {
  switch (type) {
    case 'webhookSource':
      return 'source';
    case 'webhookDestination':
      return 'destination';
    case 'webhookEnrichment':
      return 'enrichment';
  }
};

// =============================================================================
// Default Values
// =============================================================================

/**
 * Shared settings defaults
 */
const defaultSharedSettings = (): SharedSettings => ({
  method: 'POST',
  responseFormat: 'json',
  enableCustomContentType: false,
  contentType: 'application/json',
  errorResponseFields: ['timestamp', 'path', 'method', 'requestId'],
  commonHeaders: ['x-request-id', 'x-response-time'],
  compression: 'none',
  generateRequestId: true,
  requestIdHeader: 'x-request-id',
});

/**
 * EventBridge configuration defaults
 */
const defaultEventBridgeConfig = (
  eventSourceName: string,
): EventBridgeConfig => ({
  enabled: false,
  eventBusName: 'default',
  eventSource: eventSourceName,
  detailType: 'webhook.trigger',
  registerAsDestination: false,
  transformTemplate: JSON.stringify(
    {
      detail: '{{ body }}',
      source: '{{ metadata.eventBridge.eventSource }}',
      'detail-type': '{{ metadata.eventBridge.detailType }}',
      time: '{{ timestamp }}',
    },
    null,
    2,
  ),
  destinationConfig: {
    targetBusName: 'default',
    ruleName: '',
    pattern: {
      source: [],
      detailType: [],
      customPattern: undefined,
    },
    inputTransform: {
      useFullEvent: true,
      selectedFields: [],
    },
  },
});

/**
 * Source settings defaults
 */
const defaultSourceSettings = (eventSourceName: string): SourceSettings => ({
  requiredHeaders: [],
  enableRateLimit: false,
  enableValidation: false,
  enableCache: false,
  maxRequestSize: '1mb',
  timeout: 30,
  enableCors: false,
  forceHttps: false,
  enableLogging: true,
  eventBridge: defaultEventBridgeConfig(eventSourceName),
});

/**
 * Destination settings defaults
 */
const defaultDestinationSettings = (): DestinationSettings => ({
  targetUrl: '',
  queryParams: undefined,
  bodyTemplate: undefined,
  authType: 'none',
  customHeaders: [],
  timeout: 30,
  corsOrigins: [],
  maxRetries: 3,
  retryDelay: 1,
  maxRequestSize: '1mb',
});

/**
 * Enrichment settings defaults
 */
const defaultEnrichmentSettings = (): EnrichmentSettings => ({
  webhookUrl: undefined,
  enrichmentType: 'transform',
  transformationRules: [],
  validatePayload: false,
  validationRules: [],
  enableCache: false,
  maxRequestSize: '1mb',
  timeout: 30,
});

// =============================================================================
// Metadata Generation
// =============================================================================

/**
 * Generates metadata based on node mode
 */
const generateMetadata = (
  nodeMode: NodeMode,
  eventSourceName: string,
  existingMetadata?: Partial<FormValues['metadata']>,
): FormValues['metadata'] => {
  const shared = {
    ...defaultSharedSettings(),
    ...(existingMetadata?.shared ?? {}),
  };

  switch (nodeMode) {
    case 'source':
      return {
        nodeMode: 'source',
        shared,
        source: {
          ...defaultSourceSettings(eventSourceName),
          ...(existingMetadata?.source ?? {}),
          eventBridge: {
            ...defaultEventBridgeConfig(eventSourceName),
            ...(existingMetadata?.source?.eventBridge ?? {}),
          },
        },
        destination: undefined,
        enrichment: undefined,
      };

    case 'destination':
      return {
        nodeMode: 'destination',
        shared,
        source: undefined,
        destination: {
          ...defaultDestinationSettings(),
          ...(existingMetadata?.destination ?? {}),
        },
        enrichment: undefined,
      };

    case 'enrichment':
      return {
        nodeMode: 'enrichment',
        shared,
        source: undefined,
        destination: undefined,
        enrichment: {
          ...defaultEnrichmentSettings(),
          ...(existingMetadata?.enrichment ?? {}),
        },
      };
    default:
      throw new Error(`Invalid node mode: ${nodeMode}`);
  }
};

// =============================================================================
// UX Metadata Generation
// =============================================================================

/**
 * Generates UX metadata
 */
const generateUxMeta = (
  nodeMode: NodeMode,
  existingUxMeta?: FormValues['uxMeta'],
): FormValues['uxMeta'] => ({
  heading:
    existingUxMeta?.heading ??
    `Webhook ${nodeMode.charAt(0).toUpperCase() + nodeMode.slice(1)}`,
  isExpanded: existingUxMeta?.isExpanded ?? false,
  layer: existingUxMeta?.layer ?? 0,
  isLocked: existingUxMeta?.isLocked ?? false,
  rotation: existingUxMeta?.rotation ?? 0,
});

// =============================================================================
// Main Export
// =============================================================================

/**
 * Validates and merges metadata with defaults
 */
const validateAndMergeMetadata = (
  nodeMode: NodeMode,
  existing: unknown,
  eventSourceName: string,
): FormValues['metadata'] => {
  // Type guard for existing metadata
  const isValidMetadata = (
    meta: unknown,
  ): meta is Partial<FormValues['metadata']> => {
    return (
      meta !== null &&
      typeof meta === 'object' &&
      'nodeMode' in meta &&
      (meta.nodeMode === 'source' ||
        meta.nodeMode === 'destination' ||
        meta.nodeMode === 'enrichment')
    );
  };

  // Validate existing metadata
  if (existing && !isValidMetadata(existing)) {
    logWarn('Invalid existing metadata, using defaults');
    return generateMetadata(nodeMode, eventSourceName);
  }

  // If existing is valid, we can safely cast it
  const validExisting = existing as Partial<FormValues['metadata']>;

  return generateMetadata(nodeMode, eventSourceName, validExisting);
};

/**
 * Validates and processes node data
 */
const validateNodeData = (data: FbNodeData) => {
  // Validate node type
  if (!guards.isWebhookNodeType(data.type)) {
    throw new Error(
      `Invalid webhook node type: ${data.type}. Expected one of: webhookSource, webhookDestination, webhookEnrichment`,
    );
  }

  // Validate name
  if (data.name && typeof data.name !== 'string') {
    throw new Error(`Invalid name type: ${typeof data.name}. Expected string`);
  }

  // Validate isEnabled
  if (data.isEnabled !== undefined && typeof data.isEnabled !== 'boolean') {
    throw new Error(
      `Invalid isEnabled type: ${typeof data.isEnabled}. Expected boolean`,
    );
  }

  return {
    type: data.type as WebhookNodeType,
    name: data.name,
    isEnabled: data.isEnabled,
    metadata: data.metadata,
    uxMeta: data.uxMeta,
  };
};

/**
 * Generates initial form values based on node data with validation
 * @throws {Error} If node data is invalid
 */
export const getInitialValues = (data: FbNodeData): FormValues => {
  try {
    // Validate incoming data
    const validatedData = validateNodeData(data);
    const nodeMode = getNodeMode(validatedData.type);
    const eventSourceName = validatedData.name
      ? generateEventSourceName(validatedData.name)
      : 'unnamed-webhook';

    // Generate values with proper type safety
    const formValues: FormValues = {
      name: validatedData.name ?? null,
      isEnabled: validatedData.isEnabled ?? true,
      metadata: validateAndMergeMetadata(
        nodeMode,
        validatedData.metadata,
        eventSourceName,
      ),
      uxMeta: generateUxMeta(nodeMode, validatedData.uxMeta),
    };

    // Validate against schema
    const validation = formSchema.safeParse(formValues);

    if (!validation.success) {
      logError('Form validation failed', { error: validation.error });
      throw new Error(
        `Invalid form values: ${validation.error.issues
          .map((e) => e.message)
          .join(', ')}`,
      );
    }

    return formValues;
  } catch (error) {
    logError('Error generating initial values', { error });
    // Provide safe defaults if validation fails
    return getDefaultValues(data.type as WebhookNodeType);
  }
};

/**
 * Generates safe default values when validation fails
 */
const getDefaultValues = (type: WebhookNodeType): FormValues => {
  const nodeMode = getNodeMode(type);
  return {
    name: null,
    isEnabled: true,
    metadata: generateMetadata(nodeMode, 'fallback-webhook'),
    uxMeta: generateUxMeta(nodeMode),
  };
};

// =============================================================================
// Utility Exports
// =============================================================================

export const utils = {
  validateNodeData,
  validateAndMergeMetadata,
  generateEventSourceName,
  getNodeMode,
} as const;

// =============================================================================
// Type Guard Exports
// =============================================================================

export const guards = {
  isWebhookNodeType: (type: string): type is WebhookNodeType =>
    ['webhookSource', 'webhookDestination', 'webhookEnrichment'].includes(type),
  isSourceMetadata: (
    metadata: unknown,
  ): metadata is Extract<FormValues['metadata'], { nodeMode: 'source' }> => {
    return (
      !!metadata &&
      typeof metadata === 'object' &&
      'nodeMode' in metadata &&
      metadata.nodeMode === 'source'
    );
  },
  isDestinationMetadata: (
    metadata: unknown,
  ): metadata is Extract<
    FormValues['metadata'],
    { nodeMode: 'destination' }
  > => {
    return (
      !!metadata &&
      typeof metadata === 'object' &&
      'nodeMode' in metadata &&
      metadata.nodeMode === 'destination'
    );
  },
  isEnrichmentMetadata: (
    metadata: unknown,
  ): metadata is Extract<
    FormValues['metadata'],
    { nodeMode: 'enrichment' }
  > => {
    return (
      !!metadata &&
      typeof metadata === 'object' &&
      'nodeMode' in metadata &&
      metadata.nodeMode === 'enrichment'
    );
  },
} as const;

// =============================================================================
// Default Exports
// =============================================================================

export const defaults = {
  shared: defaultSharedSettings,
  source: defaultSourceSettings,
  destination: defaultDestinationSettings,
  enrichment: defaultEnrichmentSettings,
  eventBridge: defaultEventBridgeConfig,
} as const;
