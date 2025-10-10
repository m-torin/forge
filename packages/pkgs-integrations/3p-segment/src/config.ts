/**
 * Segment configuration utilities
 */

import type { SegmentConfig, SegmentIntegrationConfig } from './types';

export function createSegmentConfig(
  writeKey: string,
  overrides: Partial<SegmentConfig> = {},
): SegmentConfig {
  return {
    provider: 'segment',
    writeKey,
    endpoint: 'https://api.segment.io',
    flushInterval: 10000,
    batchSize: 100,
    debug: false,
    disabled: false,

    // Segment defaults
    anonymizeIP: false,
    httpKeepalive: true,
    httpKeepaliveMaxSockets: Infinity,
    httpKeepaliveMaxFreeSockets: 10,
    httpKeepaliveTimeout: 60000,
    httpKeepaliveFreeSocketTimeout: 30000,
    maxEventsInBatch: 500,
    flushAt: 20,
    timeout: 15000,

    // Privacy defaults
    gdpr: {
      enabled: false,
      defaultConsent: true,
    },

    // Regional defaults
    region: 'us',

    ...overrides,
  };
}

export function getSegmentEnvironmentConfig(): {
  writeKey?: string;
  dataplane?: string;
  region?: 'us' | 'eu';
  isSegmentWorkspace: boolean;
} {
  if (typeof process === 'undefined') {
    return {
      isSegmentWorkspace: false,
    };
  }

  const env = process.env;
  const dataplane = env.SEGMENT_DATAPLANE || env.NEXT_PUBLIC_SEGMENT_DATAPLANE;

  return {
    writeKey: env.SEGMENT_WRITE_KEY || env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
    dataplane,
    region: dataplane?.includes('.eu.') ? 'eu' : 'us',
    isSegmentWorkspace: !!(env.SEGMENT_WRITE_KEY || env.NEXT_PUBLIC_SEGMENT_WRITE_KEY),
  };
}

export function validateSegmentConfig(config: SegmentConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.provider !== 'segment') {
    errors.push('Provider must be "segment"');
  }

  if (!config.writeKey) {
    errors.push('Write key is required');
  } else {
    // Validate write key format
    if (!/^[a-zA-Z0-9]{32,}$/.test(config.writeKey)) {
      warnings.push('Write key format appears invalid (should be 32+ alphanumeric characters)');
    }
  }

  if (config.dataplane && !config.dataplane.startsWith('http')) {
    errors.push('Dataplane must be a valid URL starting with http:// or https://');
  }

  if (config.batchSize && (config.batchSize < 1 || config.batchSize > 1000)) {
    errors.push('Batch size must be between 1 and 1000');
  }

  if (config.flushInterval && config.flushInterval < 1000) {
    errors.push('Flush interval must be at least 1000ms');
  }

  if (config.maxEventsInBatch && (config.maxEventsInBatch < 1 || config.maxEventsInBatch > 1000)) {
    errors.push('Max events in batch must be between 1 and 1000');
  }

  if (config.timeout && config.timeout < 1000) {
    warnings.push('Timeout less than 1000ms may cause request failures');
  }

  // Validate integrations
  if (config.integrations) {
    Object.entries(config.integrations).forEach(([name, integration]) => {
      if (typeof integration === 'object' && integration !== null) {
        const integrationConfig = integration as SegmentIntegrationConfig;
        if (integrationConfig.enabled === undefined) {
          warnings.push(`Integration "${name}" should explicitly set enabled: true/false`);
        }
      }
    });
  }

  // Validate warehouse config
  if (config.warehouse?.enabled && !config.warehouse.destinations?.length) {
    warnings.push('Warehouse is enabled but no destinations are configured');
  }

  // Validate GDPR config
  if (config.gdpr?.enabled && !config.gdpr.consentTypes?.length) {
    warnings.push('GDPR is enabled but no consent types are configured');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function createClientConfig(
  writeKey: string,
  overrides: Partial<SegmentConfig> = {},
): SegmentConfig {
  return createSegmentConfig(writeKey, {
    ...overrides,
    // Client-side optimized defaults
    flushAt: 10,
    flushInterval: 10000,
    anonymizeIP: true,
  });
}

export function createServerConfig(
  writeKey: string,
  overrides: Partial<SegmentConfig> = {},
): SegmentConfig {
  return createSegmentConfig(writeKey, {
    ...overrides,
    // Server-side optimized defaults
    flushAt: 20,
    flushInterval: 10000,
    httpKeepalive: true,
    maxEventsInBatch: 500,
  });
}

export function createWarehouseConfig(
  writeKey: string,
  warehouseDestinations: string[],
  overrides: Partial<SegmentConfig> = {},
): SegmentConfig {
  return createSegmentConfig(writeKey, {
    ...overrides,
    warehouse: {
      enabled: true,
      destinations: warehouseDestinations,
      schema: 'segment',
      table: 'tracks',
    },
    // Warehouse optimized defaults
    batchSize: 1000,
    flushInterval: 30000,
  });
}

export function createIntegrationConfig(
  enabled: boolean,
  options?: Record<string, any>,
): SegmentIntegrationConfig {
  return {
    enabled,
    options: options || {},
  };
}

export function createDestinationFilter(
  condition: Record<string, any>,
  action: 'drop' | 'allow' = 'allow',
): { if: Record<string, any>; drop?: boolean; allow?: boolean } {
  return {
    if: condition,
    [action === 'drop' ? 'drop' : 'allow']: true,
  };
}

export function buildIntegrationsConfig(
  integrations: Array<{
    name: string;
    enabled: boolean;
    options?: Record<string, any>;
    mapping?: Record<string, string>;
    filters?: Array<{ if: Record<string, any>; drop?: boolean; allow?: boolean }>;
  }>,
): Record<string, SegmentIntegrationConfig> {
  const config: Record<string, SegmentIntegrationConfig> = {};

  integrations.forEach(integration => {
    config[integration.name] = {
      enabled: integration.enabled,
      options: integration.options,
      mapping: integration.mapping,
      filters: integration.filters,
    };
  });

  return config;
}

// Common integration configurations
export const commonIntegrations = {
  googleAnalytics: (measurementId: string, enabled = true) =>
    createIntegrationConfig(enabled, {
      measurementId,
      sendUserId: true,
      sendPageTitle: true,
    }),

  facebookPixel: (pixelId: string, enabled = true) =>
    createIntegrationConfig(enabled, {
      pixelId,
      agent: 'segment',
      initWithExistingTraits: false,
    }),

  mixpanel: (token: string, enabled = true) =>
    createIntegrationConfig(enabled, {
      token,
      trackAllPages: true,
      trackNamedPages: true,
      trackCategorizedPages: true,
    }),

  amplitude: (apiKey: string, enabled = true) =>
    createIntegrationConfig(enabled, {
      apiKey,
      trackAllPages: true,
      trackNamedPages: true,
      trackUtmProperties: true,
    }),

  hubspot: (portalId: string, enabled = true) =>
    createIntegrationConfig(enabled, {
      portalId,
      enableEuropeanDataCenter: false,
    }),

  salesforce: (enabled = true) =>
    createIntegrationConfig(enabled, {
      leadSource: 'Website',
    }),

  intercom: (appId: string, enabled = true) =>
    createIntegrationConfig(enabled, {
      appId,
      activator: '#IntercomDefaultWidget',
    }),

  zendesk: (enabled = true) => createIntegrationConfig(enabled, {}),

  slack: (webhookUrl: string, enabled = true) =>
    createIntegrationConfig(enabled, {
      webhookUrl,
    }),
};

// Regional configuration helpers
export function createEUConfig(
  writeKey: string,
  overrides: Partial<SegmentConfig> = {},
): SegmentConfig {
  return createSegmentConfig(writeKey, {
    ...overrides,
    region: 'eu',
    endpoint: 'https://api.eu1.segment.io',
    dataplane: overrides.dataplane || 'https://events.eu1.segment.io',
  });
}

export function createUSConfig(
  writeKey: string,
  overrides: Partial<SegmentConfig> = {},
): SegmentConfig {
  return createSegmentConfig(writeKey, {
    ...overrides,
    region: 'us',
    endpoint: 'https://api.segment.io',
    dataplane: overrides.dataplane || 'https://events.segment.io',
  });
}
