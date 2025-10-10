import { z } from 'zod/v4';

/**
 * AWS EventBridge integration schema
 * Common configuration for AWS EventBridge settings
 */
const eventBridgeConfigSchema = z.object({
  enabled: z.boolean(),
  region: z.string(),
  eventBusName: z.string(),
  // Source config
  eventPattern: z
    .object({
      source: z.array(z.string()).optional(),
      detailType: z.array(z.string()).optional(),
      customPattern: z.string().optional(),
    })
    .optional(),
  // Destination config
  targetConfig: z
    .object({
      targetBusName: z.string().optional(),
      ruleName: z.string().optional(),
      inputTransform: z
        .object({
          template: z.string(),
          paths: z.record(z.string(), z.string()),
        })
        .optional(),
    })
    .optional(),
});

/**
 * Shared settings schema
 */
const sharedSettingsSchema = z.object({
  format: z.enum(['json', 'xml', 'text', 'csv']),
  validation: z.object({
    enabled: z.boolean(),
    schema: z.enum(['json', 'yup', 'zod']).optional(),
    rules: z.string().optional(),
  }),
  timeout: z.number().int().min(1).max(300),
  retries: z.object({
    enabled: z.boolean(),
    maxAttempts: z.number().int().min(0).max(5).optional(),
    delay: z.number().int().min(1).max(30).optional(),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']),
    enabled: z.boolean(),
  }),
});

/**
 * Source-specific settings schema
 */
const sourceSettingsSchema = z.object({
  inputValidation: z.object({
    required: z.boolean(),
    schema: z.string().optional(),
  }),
  transformation: z.object({
    enabled: z.boolean(),
    rules: z
      .array(
        z.object({
          field: z.string(),
          operation: z.enum(['map', 'filter', 'transform']),
          value: z.union([z.string(), z.number(), z.boolean()]),
        }),
      )
      .optional(),
  }),
  rateLimit: z.object({
    enabled: z.boolean(),
    requestsPerMinute: z.number().int().min(1).optional(),
    burstLimit: z.number().int().min(1).optional(),
  }),
  cache: z.object({
    enabled: z.boolean(),
    ttl: z.number().int().min(60).max(86400).optional(),
    strategy: z.enum(['memory', 'redis']).optional(),
  }),
  eventBridge: eventBridgeConfigSchema,
});

/**
 * Destination-specific settings schema
 */
const destinationSettingsSchema = z.object({
  targetSystem: z.object({
    type: z.enum(['eventbridge', 'sqs', 'sns', 'lambda']),
    config: z.record(z.string(), z.unknown()),
  }),
  outputFormat: z.object({
    type: z.enum(['json', 'xml', 'csv', 'custom']),
    template: z.string().optional(),
  }),
  errorHandling: z.object({
    strategy: z.enum(['retry', 'dlq', 'ignore']),
    maxRetries: z.number().int().min(0).max(5).optional(),
    dlqConfig: z.record(z.string(), z.unknown()).optional(),
  }),
  batching: z.object({
    enabled: z.boolean(),
    size: z.number().int().min(1).max(1000).optional(),
    window: z.number().int().min(1).max(300).optional(),
  }),
  eventBridge: eventBridgeConfigSchema,
});

/**
 * Enrichment-specific settings schema
 */
const enrichmentSettingsSchema = z.object({
  enrichmentType: z.enum(['transform', 'validate', 'filter', 'enrich']),
  rules: z.array(
    z.object({
      field: z.string(),
      operation: z.enum(['map', 'merge', 'filter', 'validate']),
      config: z.record(z.string(), z.unknown()),
    }),
  ),
  validation: z.object({
    enabled: z.boolean(),
    schema: z.string().optional(),
  }),
  cache: z.object({
    enabled: z.boolean(),
    duration: z.number().int().min(60).max(86400).optional(),
  }),
  eventBridge: eventBridgeConfigSchema,
});

/**
 * Main form schema with discriminated union based on node mode
 */
export const formSchema = z.object({
  name: z.string().nullable(),
  isEnabled: z.boolean(),
  metadata: z.discriminatedUnion('nodeMode', [
    // Source node schema
    z.object({
      nodeMode: z.literal('source'),
      shared: sharedSettingsSchema,
      source: sourceSettingsSchema,
      destination: z.undefined(),
      enrichment: z.undefined(),
    }),
    // Destination node schema
    z.object({
      nodeMode: z.literal('destination'),
      shared: sharedSettingsSchema,
      source: z.undefined(),
      destination: destinationSettingsSchema,
      enrichment: z.undefined(),
    }),
    // Enrichment node schema
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
});

/**
 * Type exports
 */
export type FormValues = z.infer<typeof formSchema>;
export type EventBridgeConfig = z.infer<typeof eventBridgeConfigSchema>;
export type SharedSettings = z.infer<typeof sharedSettingsSchema>;
export type SourceSettings = z.infer<typeof sourceSettingsSchema>;
export type DestinationSettings = z.infer<typeof destinationSettingsSchema>;
export type EnrichmentSettings = z.infer<typeof enrichmentSettingsSchema>;
