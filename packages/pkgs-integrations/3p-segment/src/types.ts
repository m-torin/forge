/**
 * Segment-specific types
 */

import type { BaseProviderConfig } from '@repo/3p-core/types';

export interface SegmentConfig extends BaseProviderConfig {
  provider: 'segment';
  writeKey: string;

  // Segment-specific options
  dataplane?: string; // Custom dataplane URL
  integrations?: Record<string, boolean | SegmentIntegrationConfig>;

  // Client-side specific
  anonymizeIP?: boolean;
  plugins?: SegmentPlugin[];

  // Server-side specific
  httpKeepalive?: boolean;
  httpKeepaliveMaxSockets?: number;
  httpKeepaliveMaxFreeSockets?: number;
  httpKeepaliveTimeout?: number;
  httpKeepaliveFreeSocketTimeout?: number;
  maxEventsInBatch?: number;
  flushAt?: number;
  flushInterval?: number;

  // Advanced options
  errorHandler?: (error: SegmentError) => void;
  disable?: boolean;
  timeout?: number;

  // Warehouse settings
  warehouse?: {
    enabled: boolean;
    destinations?: string[];
    schema?: string;
    table?: string;
  };

  // Privacy settings
  gdpr?: {
    enabled: boolean;
    consentTypes?: string[];
    defaultConsent?: boolean;
  };

  // Regional settings
  region?: 'us' | 'eu';
}

export interface SegmentIntegrationConfig {
  enabled: boolean;
  options?: Record<string, any>;
  // Specific integration settings
  mapping?: Record<string, string>;
  filters?: Array<{
    if: Record<string, any>;
    drop?: boolean;
    allow?: boolean;
  }>;
}

export interface SegmentPlugin {
  name: string;
  version?: string;
  type: 'before' | 'after' | 'enrichment' | 'destination';
  isLoaded: () => boolean;
  load: () => Promise<void>;
  track?: (payload: SegmentTrackPayload) => SegmentTrackPayload;
  identify?: (payload: SegmentIdentifyPayload) => SegmentIdentifyPayload;
  page?: (payload: SegmentPagePayload) => SegmentPagePayload;
  group?: (payload: SegmentGroupPayload) => SegmentGroupPayload;
  alias?: (payload: SegmentAliasPayload) => SegmentAliasPayload;
}

export interface SegmentEvent {
  messageId?: string;
  timestamp?: Date | string;
  context?: SegmentContext;
  integrations?: Record<string, boolean | SegmentIntegrationConfig>;
  anonymousId?: string;
  userId?: string;
}

export interface SegmentTrackPayload extends SegmentEvent {
  event: string;
  properties?: Record<string, any>;
}

export interface SegmentIdentifyPayload extends SegmentEvent {
  traits?: Record<string, any>;
}

export interface SegmentPagePayload extends SegmentEvent {
  name?: string;
  category?: string;
  properties?: Record<string, any>;
}

export interface SegmentGroupPayload extends SegmentEvent {
  groupId: string;
  traits?: Record<string, any>;
}

export interface SegmentAliasPayload extends SegmentEvent {
  previousId: string;
}

export interface SegmentContext {
  active?: boolean;
  app?: {
    name?: string;
    version?: string;
    build?: string;
    namespace?: string;
  };
  campaign?: {
    name?: string;
    source?: string;
    medium?: string;
    term?: string;
    content?: string;
  };
  device?: {
    id?: string;
    manufacturer?: string;
    model?: string;
    name?: string;
    type?: string;
    version?: string;
    advertisingId?: string;
    adTrackingEnabled?: boolean;
  };
  ip?: string;
  library?: {
    name?: string;
    version?: string;
  };
  locale?: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    region?: string;
    speed?: number;
  };
  network?: {
    bluetooth?: boolean;
    carrier?: string;
    cellular?: boolean;
    wifi?: boolean;
  };
  os?: {
    name?: string;
    version?: string;
  };
  page?: {
    path?: string;
    referrer?: string;
    search?: string;
    title?: string;
    url?: string;
    keywords?: string[];
  };
  referrer?: {
    id?: string;
    type?: string;
    name?: string;
    url?: string;
    link?: string;
  };
  screen?: {
    width?: number;
    height?: number;
    density?: number;
  };
  groupId?: string;
  timezone?: string;
  userAgent?: string;
  userAgentData?: {
    brands?: Array<{ brand: string; version: string }>;
    mobile?: boolean;
    platform?: string;
  };

  // Custom context fields
  [key: string]: any;
}

export interface SegmentError {
  message: string;
  code?: string;
  status?: number;
  response?: any;
  request?: any;
}

// Destination-specific types
export interface SegmentDestination {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  settings?: {
    apiKey?: string;
    apiSecret?: string;
    endpoint?: string;
    mapping?: Record<string, string>;
    filters?: Array<{
      if: Record<string, any>;
      drop?: boolean;
      allow?: boolean;
    }>;
  };
}

export interface SegmentWarehouseDestination extends SegmentDestination {
  type: 'warehouse';
  warehouseConfig: {
    type: 'snowflake' | 'bigquery' | 'redshift' | 'databricks' | 'postgres';
    connection: {
      host?: string;
      port?: number;
      database?: string;
      schema?: string;
      username?: string;
      password?: string;
      warehouse?: string; // Snowflake
      account?: string; // Snowflake
      role?: string; // Snowflake
      project?: string; // BigQuery
      dataset?: string; // BigQuery
      keyFile?: string; // BigQuery
    };
    sync: {
      frequency: 'hourly' | 'daily' | 'weekly';
      time?: string;
      timezone?: string;
    };
  };
}

export interface SegmentCloudDestination extends SegmentDestination {
  type: 'cloud';
  cloudConfig: {
    category:
      | 'Analytics'
      | 'Advertising'
      | 'Email'
      | 'Raw Data'
      | 'A/B Testing'
      | 'Attribution'
      | 'Customer Success'
      | 'Deep Linking'
      | 'Heat Maps'
      | 'Live Chat'
      | 'Personalization'
      | 'Surveys'
      | 'Tag Managers'
      | 'Video';
    methods: Array<'track' | 'identify' | 'page' | 'group' | 'alias'>;
    browserSupported?: boolean;
    serverSupported?: boolean;
    mobileSupported?: boolean;
  };
}

// Workspace and source types
export interface SegmentWorkspace {
  id: string;
  name: string;
  slug: string;
  sources: SegmentSource[];
  destinations: SegmentDestination[];
}

export interface SegmentSource {
  id: string;
  name: string;
  slug: string;
  writeKey: string;
  type: 'javascript' | 'server' | 'mobile' | 'cloud';
  settings?: Record<string, any>;
  destinations?: string[]; // Destination IDs
}

// Tracking plan types
export interface SegmentTrackingPlan {
  id: string;
  name: string;
  version: string;
  events: SegmentEventSchema[];
  traits: SegmentTraitSchema[];
}

export interface SegmentEventSchema {
  name: string;
  description?: string;
  properties: Record<string, SegmentPropertySchema>;
  required?: string[];
}

export interface SegmentTraitSchema {
  name: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
}

export interface SegmentPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  enum?: any[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  required?: boolean;
}

// Personas and audiences
export interface SegmentAudience {
  id: string;
  name: string;
  description?: string;
  definition: SegmentAudienceDefinition;
  size?: number;
  lastComputed?: string;
}

export interface SegmentAudienceDefinition {
  type: 'event_based' | 'trait_based' | 'sql';
  conditions: Array<{
    event?: string;
    property?: string;
    operator:
      | 'equals'
      | 'not_equals'
      | 'contains'
      | 'not_contains'
      | 'greater_than'
      | 'less_than'
      | 'exists'
      | 'not_exists';
    value?: any;
    timeframe?: {
      period: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
      value: number;
    };
  }>;
  sql?: string; // For SQL-based audiences
}

export type SegmentEventType = 'track' | 'identify' | 'page' | 'group' | 'alias' | 'screen'; // Mobile specific
