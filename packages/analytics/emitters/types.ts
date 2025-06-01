/**
 * Universal Analytics Types based on Segment's Specification
 * These types work across frontend and backend environments
 */

export interface AnalyticsUser {
  anonymousId?: string;
  traits?: Record<string, any>;
  userId?: string;
}

export interface AnalyticsContext {
  [key: string]: any;
  app?: {
    name?: string;
    version?: string;
    build?: string;
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
  };
  groupId?: string;
  ip?: string;
  library?: {
    name: string;
    version: string;
  };
  locale?: string;
  network?: {
    bluetooth?: boolean;
    cellular?: boolean;
    carrier?: string;
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
  };
  referrer?: {
    id?: string;
    type?: string;
  };
  screen?: {
    width?: number;
    height?: number;
    density?: number;
  };
  timezone?: string;
  userAgent?: string;
}

export interface AnalyticsOptions {
  context?: AnalyticsContext;
  integrations?: Record<string, boolean | Record<string, any>>;
  messageId?: string;
  timestamp?: Date | string;
}

// Core Analytics Methods (based on Segment's 6 core methods)

export interface IdentifyMessage extends AnalyticsOptions {
  anonymousId?: string;
  traits?: Record<string, any>;
  userId?: string;
}

export interface TrackMessage extends AnalyticsOptions {
  anonymousId?: string;
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

export interface PageMessage extends AnalyticsOptions {
  anonymousId?: string;
  category?: string;
  name?: string;
  properties?: Record<string, any>;
  userId?: string;
}

export interface ScreenMessage extends AnalyticsOptions {
  anonymousId?: string;
  category?: string;
  name?: string;
  properties?: Record<string, any>;
  userId?: string;
}

export interface GroupMessage extends AnalyticsOptions {
  anonymousId?: string;
  groupId: string;
  traits?: Record<string, any>;
  userId?: string;
}

export interface AliasMessage extends AnalyticsOptions {
  previousId: string;
  userId: string;
}

// Universal Analytics Emitter Interface
export interface AnalyticsEmitter {
  /**
   * Identify a user with traits
   */
  identify(message: IdentifyMessage): Promise<void>;

  /**
   * Track an event
   */
  track(message: TrackMessage): Promise<void>;

  /**
   * Track a page view
   */
  page(message: PageMessage): Promise<void>;

  /**
   * Track a screen view (mobile/app)
   */
  screen(message: ScreenMessage): Promise<void>;

  /**
   * Associate a user with a group
   */
  group(message: GroupMessage): Promise<void>;

  /**
   * Create an alias for a user
   */
  alias(message: AliasMessage): Promise<void>;

  /**
   * Flush any queued events (if applicable)
   */
  flush?(): Promise<void>;

  /**
   * Reset the current user
   */
  reset?(): Promise<void>;
}

// Configuration for different analytics providers
export interface AnalyticsConfig {
  apiHost?: string;
  apiKey?: string;
  debug?: boolean;
  disabled?: boolean;
  flushAt?: number;
  flushInterval?: number;
  writeKey?: string;
}

// Common event properties
export interface CommonEventProperties {
  currency?: string;
  // E-commerce
  revenue?: number;
  value?: number;
  
  content_id?: string;
  content_type?: string;
  // Content
  title?: string;
  
  // Search
  search_term?: string;
  
  // Errors
  error_code?: string;
  error_message?: string;
  
  // Custom properties
  [key: string]: any;
}