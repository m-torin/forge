/**
 * Segment destinations management operations
 */

import type {
  SegmentCloudDestination,
  SegmentDestination,
  SegmentIntegrationConfig,
  SegmentWarehouseDestination,
} from '../types';

export function createCloudDestination(
  id: string,
  name: string,
  category: SegmentCloudDestination['cloudConfig']['category'],
  config: Record<string, any>,
  options?: {
    enabled?: boolean;
    methods?: Array<'track' | 'identify' | 'page' | 'group' | 'alias'>;
    browserSupported?: boolean;
    serverSupported?: boolean;
    mobileSupported?: boolean;
    settings?: SegmentDestination['settings'];
  },
): SegmentCloudDestination {
  return {
    id,
    name,
    enabled: options?.enabled ?? true,
    type: 'cloud',
    config,
    settings: options?.settings,
    cloudConfig: {
      category,
      methods: options?.methods ?? ['track', 'identify', 'page'],
      browserSupported: options?.browserSupported ?? true,
      serverSupported: options?.serverSupported ?? true,
      mobileSupported: options?.mobileSupported ?? true,
    },
  };
}

export function createWarehouseDestination(
  id: string,
  name: string,
  warehouseType: SegmentWarehouseDestination['warehouseConfig']['type'],
  connection: SegmentWarehouseDestination['warehouseConfig']['connection'],
  options?: {
    enabled?: boolean;
    syncFrequency?: 'hourly' | 'daily' | 'weekly';
    syncTime?: string;
    timezone?: string;
    settings?: SegmentDestination['settings'];
  },
): SegmentWarehouseDestination {
  return {
    id,
    name,
    enabled: options?.enabled ?? true,
    type: 'warehouse',
    config: {
      type: warehouseType,
      connection,
    },
    settings: options?.settings,
    warehouseConfig: {
      type: warehouseType,
      connection,
      sync: {
        frequency: options?.syncFrequency ?? 'daily',
        time: options?.syncTime ?? '02:00',
        timezone: options?.timezone ?? 'UTC',
      },
    },
  };
}

// Common cloud destinations
export const commonDestinations = {
  googleAnalytics4: (measurementId: string, apiSecret?: string): SegmentCloudDestination =>
    createCloudDestination(
      'google-analytics-4',
      'Google Analytics 4',
      'Analytics',
      { measurementId, apiSecret },
      {
        methods: ['track', 'identify', 'page'],
        serverSupported: true,
        browserSupported: true,
      },
    ),

  facebookConversions: (pixelId: string, accessToken?: string): SegmentCloudDestination =>
    createCloudDestination(
      'facebook-conversions-api',
      'Facebook Conversions API',
      'Advertising',
      { pixelId, accessToken },
      {
        methods: ['track', 'identify'],
        serverSupported: true,
        browserSupported: false,
      },
    ),

  mixpanel: (projectToken: string, apiSecret?: string): SegmentCloudDestination =>
    createCloudDestination(
      'mixpanel',
      'Mixpanel',
      'Analytics',
      { projectToken, apiSecret },
      {
        methods: ['track', 'identify', 'page', 'group', 'alias'],
        browserSupported: true,
        serverSupported: true,
      },
    ),

  amplitude: (apiKey: string, secretKey?: string): SegmentCloudDestination =>
    createCloudDestination(
      'amplitude',
      'Amplitude',
      'Analytics',
      { apiKey, secretKey },
      {
        methods: ['track', 'identify', 'page', 'group'],
        browserSupported: true,
        serverSupported: true,
      },
    ),

  hubspot: (portalId: string, accessToken?: string): SegmentCloudDestination =>
    createCloudDestination(
      'hubspot',
      'HubSpot',
      'Customer Success',
      { portalId, accessToken },
      {
        methods: ['track', 'identify', 'page'],
        browserSupported: true,
        serverSupported: true,
      },
    ),

  salesforce: (
    username: string,
    password: string,
    securityToken: string,
  ): SegmentCloudDestination =>
    createCloudDestination(
      'salesforce',
      'Salesforce',
      'Customer Success',
      { username, password, securityToken },
      {
        methods: ['identify', 'track'],
        browserSupported: false,
        serverSupported: true,
      },
    ),

  intercom: (appId: string, apiKey?: string): SegmentCloudDestination =>
    createCloudDestination(
      'intercom',
      'Intercom',
      'Live Chat',
      { appId, apiKey },
      {
        methods: ['identify', 'track', 'page', 'group'],
        browserSupported: true,
        serverSupported: true,
      },
    ),

  mailchimp: (apiKey: string, dataCenter: string): SegmentCloudDestination =>
    createCloudDestination(
      'mailchimp',
      'Mailchimp',
      'Email',
      { apiKey, dataCenter },
      {
        methods: ['identify', 'track'],
        browserSupported: false,
        serverSupported: true,
      },
    ),

  sendgrid: (apiKey: string): SegmentCloudDestination =>
    createCloudDestination(
      'sendgrid',
      'SendGrid',
      'Email',
      { apiKey },
      {
        methods: ['identify', 'track'],
        browserSupported: false,
        serverSupported: true,
      },
    ),

  zendesk: (subdomain: string, email: string, apiToken: string): SegmentCloudDestination =>
    createCloudDestination(
      'zendesk',
      'Zendesk',
      'Customer Success',
      { subdomain, email, apiToken },
      {
        methods: ['identify', 'track'],
        browserSupported: false,
        serverSupported: true,
      },
    ),

  slack: (webhookUrl: string): SegmentCloudDestination =>
    createCloudDestination(
      'slack',
      'Slack',
      'Customer Success',
      { webhookUrl },
      {
        methods: ['track'],
        browserSupported: false,
        serverSupported: true,
      },
    ),

  googleAds: (customerId: string, conversionId?: string): SegmentCloudDestination =>
    createCloudDestination(
      'google-ads',
      'Google Ads',
      'Advertising',
      { customerId, conversionId },
      {
        methods: ['track'],
        browserSupported: false,
        serverSupported: true,
      },
    ),
};

// Common warehouse destinations
export const warehouseDestinations = {
  snowflake: (
    account: string,
    warehouse: string,
    database: string,
    schema: string,
    username: string,
    password: string,
    role?: string,
  ): SegmentWarehouseDestination =>
    createWarehouseDestination('snowflake', 'Snowflake', 'snowflake', {
      account,
      warehouse,
      database,
      schema,
      username,
      password,
      role,
    }),

  bigquery: (project: string, dataset: string, keyFile: string): SegmentWarehouseDestination =>
    createWarehouseDestination('bigquery', 'BigQuery', 'bigquery', {
      project,
      dataset,
      keyFile,
    }),

  redshift: (
    host: string,
    port: number,
    database: string,
    schema: string,
    username: string,
    password: string,
  ): SegmentWarehouseDestination =>
    createWarehouseDestination('redshift', 'Redshift', 'redshift', {
      host,
      port,
      database,
      schema,
      username,
      password,
    }),

  databricks: (
    host: string,
    database: string,
    schema: string,
    username: string,
    password: string,
  ): SegmentWarehouseDestination =>
    createWarehouseDestination('databricks', 'Databricks', 'databricks', {
      host,
      database,
      schema,
      username,
      password,
    }),

  postgres: (
    host: string,
    port: number,
    database: string,
    schema: string,
    username: string,
    password: string,
  ): SegmentWarehouseDestination =>
    createWarehouseDestination('postgres', 'PostgreSQL', 'postgres', {
      host,
      port,
      database,
      schema,
      username,
      password,
    }),
};

// Destination filtering utilities
export function createEventFilter(
  eventName: string,
  action: 'allow' | 'drop' = 'allow',
): { if: Record<string, any>; drop?: boolean; allow?: boolean } {
  return {
    if: { event: eventName },
    [action === 'drop' ? 'drop' : 'allow']: true,
  };
}

export function createPropertyFilter(
  property: string,
  value: any,
  operator: 'equals' | 'not_equals' | 'exists' | 'not_exists' = 'equals',
  action: 'allow' | 'drop' = 'allow',
): { if: Record<string, any>; drop?: boolean; allow?: boolean } {
  const condition: Record<string, any> = {};

  switch (operator) {
    case 'equals':
      condition[`properties.${property}`] = value;
      break;
    case 'not_equals':
      condition[`properties.${property}`] = { $ne: value };
      break;
    case 'exists':
      condition[`properties.${property}`] = { $exists: true };
      break;
    case 'not_exists':
      condition[`properties.${property}`] = { $exists: false };
      break;
  }

  return {
    if: condition,
    [action === 'drop' ? 'drop' : 'allow']: true,
  };
}

export function createUserFilter(
  userId?: string,
  anonymousId?: string,
  action: 'allow' | 'drop' = 'allow',
): { if: Record<string, any>; drop?: boolean; allow?: boolean } {
  const condition: Record<string, any> = {};

  if (userId) condition.userId = userId;
  if (anonymousId) condition.anonymousId = anonymousId;

  return {
    if: condition,
    [action === 'drop' ? 'drop' : 'allow']: true,
  };
}

// Property mapping utilities
export function createPropertyMapping(
  sourceProperty: string,
  destinationProperty: string,
): { [key: string]: string } {
  return {
    [sourceProperty]: destinationProperty,
  };
}

export function createEventMapping(
  sourceEvent: string,
  destinationEvent: string,
): { [key: string]: string } {
  return {
    [sourceEvent]: destinationEvent,
  };
}

// Destination configuration builders
export function buildDestinationConfig(
  destination: SegmentDestination,
  options?: {
    filters?: Array<{ if: Record<string, any>; drop?: boolean; allow?: boolean }>;
    mapping?: Record<string, string>;
    customSettings?: Record<string, any>;
  },
): SegmentIntegrationConfig {
  return {
    enabled: destination.enabled,
    options: {
      ...destination.config,
      ...options?.customSettings,
    },
    filters: options?.filters,
    mapping: options?.mapping,
  };
}

export function enableDestination(destination: SegmentDestination): SegmentDestination {
  return {
    ...destination,
    enabled: true,
  };
}

export function disableDestination(destination: SegmentDestination): SegmentDestination {
  return {
    ...destination,
    enabled: false,
  };
}

export function updateDestinationConfig(
  destination: SegmentDestination,
  newConfig: Record<string, any>,
): SegmentDestination {
  return {
    ...destination,
    config: {
      ...destination.config,
      ...newConfig,
    },
  };
}

// Batch destination operations
export function createDestinationBatch(
  destinations: SegmentDestination[],
): Record<string, SegmentIntegrationConfig> {
  const batch: Record<string, SegmentIntegrationConfig> = {};

  destinations.forEach(destination => {
    batch[destination.name] = buildDestinationConfig(destination);
  });

  return batch;
}

export function filterDestinationsByCategory(
  destinations: SegmentCloudDestination[],
  category: SegmentCloudDestination['cloudConfig']['category'],
): SegmentCloudDestination[] {
  return destinations.filter(dest => dest.cloudConfig.category === category);
}

export function filterDestinationsByMethod(
  destinations: SegmentCloudDestination[],
  method: 'track' | 'identify' | 'page' | 'group' | 'alias',
): SegmentCloudDestination[] {
  return destinations.filter(dest => dest.cloudConfig.methods.includes(method));
}
