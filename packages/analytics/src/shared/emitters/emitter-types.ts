/**
 * Type definitions for analytics emitters
 * Based on Segment.io specification
 * https://segment.com/docs/connections/spec/common/
 */

// Common context object that provides additional information about the environment
export interface EmitterContext {
  // Whether a user is active (usually used to flag an identify call to just update traits)
  active?: boolean;

  // Dictionary of information about the current application
  app?: {
    name?: string;
    version?: string;
    build?: string;
    namespace?: string;
  };

  // Dictionary of information about the campaign that resulted in the API call
  campaign?: {
    name?: string;
    source?: string;
    medium?: string;
    term?: string;
    content?: string;
    // Any other custom UTM parameters
    [key: string]: string | undefined;
  };

  // Dictionary of information about the device
  device?: {
    id?: string;
    advertisingId?: string;
    adTrackingEnabled?: boolean;
    manufacturer?: string;
    model?: string;
    name?: string;
    type?: string;
    version?: string;
    token?: string;
  };

  // Current user's IP address
  ip?: string;

  // Dictionary of information about the library making the requests
  library?: {
    name: string;
    version: string;
  };

  // Locale string for the current user (e.g., 'en-US')
  locale?: string;

  // Dictionary of information about the current network connection
  network?: {
    bluetooth?: boolean;
    carrier?: string;
    cellular?: boolean;
    wifi?: boolean;
  };

  // Dictionary of information about the operating system
  os?: {
    name?: string;
    version?: string;
  };

  // Dictionary of information about the current page in the browser
  page?: {
    path?: string;
    referrer?: string;
    search?: string;
    title?: string;
    url?: string;
  };

  // Dictionary of information about the way the user was referred
  referrer?: {
    id?: string;
    type?: string;
    name?: string;
    url?: string;
    link?: string;
  };

  // Dictionary of information about the device's screen
  screen?: {
    density?: number;
    height?: number;
    width?: number;
  };

  // Timezone as tzdata string (e.g., 'America/New_York')
  timezone?: string;

  // Group/Account ID (useful in B2B use cases)
  groupId?: string;

  // Dictionary of traits of the current user
  traits?: Record<string, any>;

  // User agent of the device making the request
  userAgent?: string;

  // User agent data from Client Hints API
  userAgentData?: {
    brands?: {
      brand: string;
      version: string;
    }[];
    mobile?: boolean;
    platform?: string;
    bitness?: string;
    model?: string;
    platformVersion?: string;
    uaFullVersion?: string;
    fullVersionList?: {
      brand: string;
      version: string;
    }[];
    wow64?: boolean;
  };

  // Where the request originated from: 'server', 'browser', or 'mobile'
  channel?: string;

  // Location context (less commonly used)
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    region?: string;
    speed?: number;
  };
}

// Options that can be passed to any analytics method
export interface EmitterOptions {
  // Anonymous ID if user is not identified
  anonymousId?: string;
  // Callback function (client-side only)
  callback?: Function;
  // Context information
  context?: EmitterContext;
  // Integration specific options
  integrations?: Record<string, boolean | Record<string, any>>;
  // Timestamp when the event occurred
  timestamp?: Date | string;
}

// Integrations configuration (destination control)
export interface EmitterIntegrations {
  // Individual destination settings
  [destination: string]: boolean | Record<string, any> | undefined;
  // Special key that applies when no specific destination key is found
  All?: boolean;
}

// Base payload that all events extend from (Common Fields)
export interface EmitterBasePayload {
  // Type of message, corresponding to the API method
  type: 'identify' | 'track' | 'page' | 'screen' | 'group' | 'alias';

  anonymousId?: string;
  // Identity fields (at least one required)
  userId?: string;

  originalTimestamp?: Date | string;
  receivedAt?: Date | string;
  sentAt?: Date | string;
  // Timestamp fields
  timestamp?: Date | string;

  // Context and control fields
  context?: EmitterContext;
  integrations?: EmitterIntegrations;

  // System fields (set by Segment)
  messageId?: string;
  version?: number;
}

// Specific payload types for each method
export interface EmitterIdentifyPayload extends EmitterBasePayload {
  traits?: Record<string, any>;
  type: 'identify';
  userId: string;
}

export interface EmitterTrackPayload extends EmitterBasePayload {
  event: string;
  properties?: Record<string, any>;
  type: 'track';
}

export interface EmitterPagePayload extends EmitterBasePayload {
  category?: string;
  name?: string;
  properties?: Record<string, any>;
  type: 'page';
}

export interface EmitterScreenPayload extends EmitterBasePayload {
  name?: string;
  properties?: Record<string, any>;
  type: 'screen';
}

export interface EmitterGroupPayload extends EmitterBasePayload {
  groupId: string;
  traits?: Record<string, any>;
  type: 'group';
}

export interface EmitterAliasPayload extends EmitterBasePayload {
  previousId: string;
  type: 'alias';
  userId: string;
}

// Union type for all possible payloads
export type EmitterPayload =
  | EmitterIdentifyPayload
  | EmitterTrackPayload
  | EmitterPagePayload
  | EmitterScreenPayload
  | EmitterGroupPayload
  | EmitterAliasPayload;

// Common traits that are recognized by many destinations
export interface EmitterUserTraits {
  email?: string;
  // Personal information
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  username?: string;

  // Demographics
  age?: number;
  birthday?: Date | string;
  gender?: string;

  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  // Company
  company?: {
    name?: string;
    id?: string;
    industry?: string;
    employee_count?: number;
    plan?: string;
  };

  // Other common traits
  avatar?: string;
  createdAt?: Date | string;
  description?: string;
  id?: string;
  website?: string;

  // Custom traits
  [key: string]: any;
}

// Common properties for track events
export interface EmitterEventProperties {
  currency?: string;
  // Monetary
  revenue?: number;
  value?: number;

  // E-commerce
  products?: {
    id?: string;
    name?: string;
    price?: number;
    quantity?: number;
    category?: string;
    brand?: string;
    variant?: string;
    [key: string]: any;
  }[];

  category?: string;
  description?: string;
  // Content
  title?: string;

  // Search
  query?: string;

  recipient?: string;
  // Sharing
  share_via?: string;

  // Custom properties
  [key: string]: any;
}

// Common group traits
export interface EmitterGroupTraits {
  avatar?: string;
  createdAt?: Date | string;
  description?: string;
  employees?: number;
  industry?: string;
  name?: string;
  plan?: string;
  website?: string;

  // Custom traits
  [key: string]: any;
}

// Emitter interface that all analytics providers should implement
export interface AnalyticsEmitter {
  alias(
    userId: string,
    previousId?: string,
    options?: EmitterOptions,
    callback?: Function,
  ): void | Promise<void>;
  group(
    groupId: string,
    traits?: Record<string, any>,
    options?: EmitterOptions,
    callback?: Function,
  ): void | Promise<void>;
  identify(
    userId: string,
    traits?: Record<string, any>,
    options?: EmitterOptions,
    callback?: Function,
  ): void | Promise<void>;
  page(
    category?: string,
    name?: string,
    properties?: Record<string, any>,
    options?: EmitterOptions,
    callback?: Function,
  ): void | Promise<void>;
  screen(
    name?: string,
    properties?: Record<string, any>,
    options?: EmitterOptions,
    callback?: Function,
  ): void | Promise<void>;
  track(
    event: string,
    properties?: Record<string, any>,
    options?: EmitterOptions,
    callback?: Function,
  ): void | Promise<void>;
}

// Configuration for analytics emitters
export interface EmitterConfig {
  // API key or write key
  apiKey?: string;
  // Whether to batch events
  batching?: boolean;
  // Maximum number of events to batch
  batchSize?: number;
  // Whether to enable debug logging
  debug?: boolean;
  // Default context to include with all events
  defaultContext?: Partial<EmitterContext>;
  // Custom endpoint for sending events
  endpoint?: string;
  // Time to wait before flushing batch (ms)
  flushInterval?: number;
  // Default integrations settings
  integrations?: Record<string, boolean | Record<string, any>>;
  // Whether to track clicks automatically
  trackClicks?: boolean;
  // Whether to track page views automatically
  trackPages?: boolean;
}
