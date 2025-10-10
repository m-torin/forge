import { z } from 'zod/v4';

// Safe validation functions to replace unsafe regex
const isValidMimeType = (value: string): boolean => {
  const parts = value.split('/');
  if (parts.length !== 2) return false;
  const [type, subtype] = parts;
  if (!type || !subtype || type.length > 50 || subtype.length > 50) return false;
  
  // Simple character validation without complex regex
  const isValidChar = (char: string) => /^[a-zA-Z0-9\-_]$/.test(char);
  const isValidTypeString = (str: string) => str.split('').every(isValidChar);
  
  // Check if subtype has optional +suffix
  const subtypeParts = subtype.split('+');
  if (subtypeParts.length > 2) return false;
  
  return isValidTypeString(type) && subtypeParts.every(part => part && isValidTypeString(part));
};

const isValidSchemaPath = (value: string): boolean => {
  if (!value.startsWith('/') || value.length > 500) return false;
  if (!value.endsWith('.json') && !value.endsWith('.yaml') && !value.endsWith('.yml')) return false;
  const pathParts = value.substring(1).split('/');
  if (pathParts.length > 10) return false;
  
  const isValidChar = (char: string) => /^[a-zA-Z0-9\-_.]$/.test(char);
  return pathParts.every(part => {
    if (!part || part.length > 50) return false;
    return part.split('').every(isValidChar);
  });
};

// =============================================================================
// Base Types and Constants
// =============================================================================

const CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'custom',
] as const;

const HTTP_METHODS = [
  'POST',
  'GET',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
] as const;

const REQUEST_ID_HEADERS = [
  'x-request-id',
  'x-correlation-id',
  'request-id',
] as const;

const COMMON_HEADERS = [
  'x-request-id',
  'x-response-time',
  'x-api-version',
  'x-correlation-id',
  'cache-control',
] as const;

const MAX_REQUEST_SIZES = ['1mb', '5mb', '10mb', '50mb', 'unlimited'] as const;

const RESPONSE_FORMATS = ['json', 'xml', 'text', 'html', 'binary'] as const;
const COMPRESSION_TYPES = ['none', 'gzip', 'deflate', 'br'] as const;
const AUTH_TYPES = ['none', 'bearer', 'api_key', 'basic'] as const;
const ENRICHMENT_TYPES = ['transform', 'validate', 'filter', 'enrich'] as const;

export type WebhookNodeType =
  | 'webhookSource'
  | 'webhookDestination'
  | 'webhookEnrichment';
export type NodeMode = 'source' | 'destination' | 'enrichment';

// =============================================================================
// Event Bridge Schema
// =============================================================================

const eventBridgeConfigSchema = z
  .object({
    enabled: z.boolean(),
    eventBusName: z.string().optional(),
    eventSource: z.string().optional(),
    detailType: z.string().optional(),
    transformTemplate: z.string().optional(),
    registerAsDestination: z.boolean(),
    destinationConfig: z
      .object({
        targetBusName: z.string().optional(),
        ruleName: z.string().optional(),
        pattern: z
          .object({
            source: z.array(z.string()).optional(),
            detailType: z.array(z.string()).optional(),
            customPattern: z.string().optional(),
          })
          .optional(),
        inputTransform: z
          .object({
            useFullEvent: z.boolean(),
            selectedFields: z.array(z.string()),
          })
          .optional(),
      })
      .optional(),
  })
  .strict();

// =============================================================================
// Shared Settings Schema
// =============================================================================

const sharedSettingsSchema = z
  .object({
    method: z.enum(HTTP_METHODS),
    responseFormat: z.enum(RESPONSE_FORMATS),
    enableCustomContentType: z.boolean(),
    contentType: z.enum(CONTENT_TYPES).optional(),
    // Regex explanation: [\w-]+\/[\w-]+ matches the type/subtype format,
    // (?:\+[\w-]+)? optionally matches a suffix like +json
    customContentType: z
      .string()
      .refine((val) => {
        return isValidMimeType(val);
      }, {
        message: 'Invalid MIME type format',
      })
      .optional(),
    errorResponseFields: z.array(
      z.enum(['timestamp', 'path', 'method', 'requestId', 'stack']),
    ),
    commonHeaders: z.array(z.enum(COMMON_HEADERS)),
    compression: z.enum(COMPRESSION_TYPES),
    generateRequestId: z.boolean(),
    requestIdHeader: z.enum(REQUEST_ID_HEADERS).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.enableCustomContentType && data.contentType === 'custom') {
        return !!data.customContentType;
      }
      return true;
    },
    {
      message:
        'Custom content type is required when enableCustomContentType is true and contentType is custom',
      path: ['customContentType'],
    },
  );

// =============================================================================
// Source Settings Schema
// =============================================================================

const sourceSettingsSchema = z
  .object({
    requiredHeaders: z.array(
      z.enum([
        'content-type',
        'x-api-key',
        'authorization',
        'x-request-id',
        'x-correlation-id',
      ]),
    ),
    enableRateLimit: z.boolean(),
    rateLimit: z.number().int().min(1).optional(),
    rateLimitStrategy: z.enum(['sliding', 'fixed', 'token']).optional(),
    enableValidation: z.boolean(),
    validationSchema: z.enum(['json', 'yup', 'zod']).optional(),
    schemaPath: z
      .string()
      .refine((val) => {
        return isValidSchemaPath(val);
      }, {
        message: 'Invalid schema file path. Must be a .json or .yaml/.yml file',
      })
      .optional(),
    enableCache: z.boolean(),
    cacheDuration: z.number().int().min(60).max(86400).optional(),
    cacheStrategy: z.enum(['path', 'query', 'body']).optional(),
    maxRequestSize: z.enum(MAX_REQUEST_SIZES),
    timeout: z.number().int().min(1).max(300),
    enableCors: z.boolean(),
    forceHttps: z.boolean(),
    enableLogging: z.boolean(),
    eventBridge: eventBridgeConfigSchema,
  })
  .strict()
  .refine(
    (data) => {
      if (data.enableRateLimit) {
        return !!data.rateLimit && !!data.rateLimitStrategy;
      }
      return true;
    },
    {
      message:
        'Rate limit and strategy are required when rate limiting is enabled',
      path: ['rateLimit'],
    },
  )
  .refine(
    (data) => {
      if (data.enableValidation) {
        return !!data.validationSchema && !!data.schemaPath;
      }
      return true;
    },
    {
      message:
        'Validation schema and path are required when validation is enabled',
      path: ['validationSchema'],
    },
  )
  .refine(
    (data) => {
      if (data.enableCache) {
        return !!data.cacheDuration && !!data.cacheStrategy;
      }
      return true;
    },
    {
      message:
        'Cache duration and strategy are required when caching is enabled',
      path: ['cacheDuration'],
    },
  );

// =============================================================================
// Destination Settings Schema
// =============================================================================

const destinationSettingsSchema = z
  .object({
    targetUrl: z.string().url(),
    queryParams: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
    bodyTemplate: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    authType: z.enum(AUTH_TYPES),
    customHeaders: z.array(
      z.object({
        key: z.string().min(1),
        value: z.string(),
      }),
    ),
    timeout: z.number().int().min(1).max(300),
    corsOrigins: z.array(z.enum(['*', 'localhost', 'custom'])),
    maxRetries: z.number().int().min(0).max(5),
    retryDelay: z.number().int().min(1).max(30),
    maxRequestSize: z.enum(MAX_REQUEST_SIZES),
  })
  .strict();

// =============================================================================
// Enrichment Settings Schema
// =============================================================================

const enrichmentSettingsSchema = z
  .object({
    webhookUrl: z.string().url().optional(),
    enrichmentType: z.enum(ENRICHMENT_TYPES),
    transformationRules: z
      .array(
        z.object({
          field: z.string().min(1),
          operation: z.enum(['map', 'merge', 'filter', 'validate']),
          target: z.string().min(1),
        }),
      )
      .optional(),
    validatePayload: z.boolean(),
    validationRules: z
      .array(
        z.object({
          field: z.string().min(1),
          rule: z.string().min(1),
          message: z.string(),
        }),
      )
      .optional(),
    enableCache: z.boolean(),
    cacheDuration: z.number().int().min(60).max(86400).optional(),
    maxRequestSize: z.enum(MAX_REQUEST_SIZES),
    timeout: z.number().int().min(1).max(300),
  })
  .strict()
  .refine(
    (data) => {
      if (data.enrichmentType === 'transform') {
        return (
          Array.isArray(data.transformationRules) &&
          data.transformationRules.length > 0
        );
      }
      return true;
    },
    {
      message:
        'Transformation rules are required when enrichment type is transform',
      path: ['transformationRules'],
    },
  )
  .refine(
    (data) => {
      if (data.validatePayload) {
        return (
          Array.isArray(data.validationRules) && data.validationRules.length > 0
        );
      }
      return true;
    },
    {
      message: 'Validation rules are required when validate payload is enabled',
      path: ['validationRules'],
    },
  )
  .refine(
    (data) => {
      if (data.enableCache) {
        return typeof data.cacheDuration === 'number';
      }
      return true;
    },
    {
      message: 'Cache duration is required when caching is enabled',
      path: ['cacheDuration'],
    },
  );

// =============================================================================
// Main Form Schema
// =============================================================================

export const formSchema = z
  .object({
    name: z.string().nullable(),
    isEnabled: z.boolean(),
    metadata: z.discriminatedUnion('nodeMode', [
      z.object({
        nodeMode: z.literal('source'),
        shared: sharedSettingsSchema,
        source: sourceSettingsSchema,
        destination: z.undefined(),
        enrichment: z.undefined(),
      }),
      z.object({
        nodeMode: z.literal('destination'),
        shared: sharedSettingsSchema,
        source: z.undefined(),
        destination: destinationSettingsSchema,
        enrichment: z.undefined(),
      }),
      z.object({
        nodeMode: z.literal('enrichment'),
        shared: sharedSettingsSchema,
        source: z.undefined(),
        destination: z.undefined(),
        enrichment: enrichmentSettingsSchema,
      }),
    ]),
    uxMeta: z.object({
      heading: z.string().optional(),
      isExpanded: z.boolean().optional(),
      layer: z.number().optional(),
      isLocked: z.boolean().optional(),
      rotation: z.number().optional(),
    }),
  })
  .strict();

// =============================================================================
// Type Exports
// =============================================================================

export type FormValues = z.infer<typeof formSchema>;
export type EventBridgeConfig = z.infer<typeof eventBridgeConfigSchema>;
export type SharedSettings = z.infer<typeof sharedSettingsSchema>;
export type SourceSettings = z.infer<typeof sourceSettingsSchema>;
export type DestinationSettings = z.infer<typeof destinationSettingsSchema>;
export type EnrichmentSettings = z.infer<typeof enrichmentSettingsSchema>;

// =============================================================================
// Constant Exports
// =============================================================================

export const CONSTANTS = {
  CONTENT_TYPES,
  HTTP_METHODS,
  REQUEST_ID_HEADERS,
  COMMON_HEADERS,
  MAX_REQUEST_SIZES,
  RESPONSE_FORMATS,
  COMPRESSION_TYPES,
  AUTH_TYPES,
  ENRICHMENT_TYPES,
} as const;

// =============================================================================
// Type Guard Exports
// =============================================================================

export const isSourceMetadata = (
  metadata: FormValues['metadata'],
): metadata is Extract<FormValues['metadata'], { nodeMode: 'source' }> => {
  return metadata.nodeMode === 'source';
};

export const isDestinationMetadata = (
  metadata: FormValues['metadata'],
): metadata is Extract<FormValues['metadata'], { nodeMode: 'destination' }> => {
  return metadata.nodeMode === 'destination';
};

export const isEnrichmentMetadata = (
  metadata: FormValues['metadata'],
): metadata is Extract<FormValues['metadata'], { nodeMode: 'enrichment' }> => {
  return metadata.nodeMode === 'enrichment';
};

// =============================================================================
// Schema Exports
// =============================================================================

export const schemas = {
  eventBridgeConfigSchema,
  sharedSettingsSchema,
  sourceSettingsSchema,
  destinationSettingsSchema,
  enrichmentSettingsSchema,
} as const;

// =============================================================================
// Error Map
// =============================================================================

// Note: Using default Zod error mapping for compatibility
