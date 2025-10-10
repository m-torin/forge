/**
 * Core types for 3rd party analytics integrations
 * Universal types that work across all providers
 */

export type ProviderType =
  | 'posthog'
  | 'segment'
  | 'vercel'
  | 'ga4'
  | 'mixpanel'
  | 'amplitude'
  | 'plausible';

export interface BaseProviderConfig {
  provider: ProviderType;
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  debug?: boolean;
  disabled?: boolean;
  flushInterval?: number;
  batchSize?: number;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  anonymousId?: string;
  timestamp?: Date | string;
  context?: EventContext;
}

export interface EventContext {
  page?: {
    url?: string;
    path?: string;
    referrer?: string;
    title?: string;
  };
  user?: {
    id?: string;
    email?: string;
    name?: string;
    traits?: Record<string, any>;
  };
  device?: {
    type?: 'mobile' | 'tablet' | 'desktop';
    userAgent?: string;
    ip?: string;
    locale?: string;
  };
  campaign?: {
    name?: string;
    source?: string;
    medium?: string;
    term?: string;
    content?: string;
  };
  session?: {
    id?: string;
    startTime?: Date | string;
    pageViews?: number;
  };
}

export interface IdentifyPayload {
  userId: string;
  traits?: Record<string, any>;
  context?: EventContext;
}

export interface GroupPayload {
  groupId: string;
  userId?: string;
  traits?: Record<string, any>;
  context?: EventContext;
}

export interface PagePayload {
  name?: string;
  category?: string;
  properties?: Record<string, any>;
  userId?: string;
  context?: EventContext;
}

export interface EcommerceEvent {
  action:
    | 'product_viewed'
    | 'product_added'
    | 'cart_viewed'
    | 'checkout_started'
    | 'order_completed';
  product?: {
    id: string;
    name: string;
    category?: string;
    brand?: string;
    variant?: string;
    price: number;
    currency?: string;
    quantity?: number;
    sku?: string;
  };
  cart?: {
    id: string;
    items: Array<EcommerceEvent['product'] & { quantity: number }>;
    total: number;
    currency: string;
  };
  order?: {
    id: string;
    total: number;
    currency: string;
    items: Array<EcommerceEvent['product'] & { quantity: number }>;
    shipping?: number;
    tax?: number;
    discount?: number;
    coupon?: string;
  };
}

export interface BatchingConfig {
  enabled: boolean;
  flushInterval: number;
  batchSize: number;
  maxQueueSize: number;
}

export interface PrivacyConfig {
  anonymizeIp?: boolean;
  respectDoNotTrack?: boolean;
  gdprCompliant?: boolean;
  ccpaCompliant?: boolean;
  cookieConsent?: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  maxRetryDelay: number;
}

export interface ProviderAdapter {
  readonly provider: ProviderType;
  readonly config: BaseProviderConfig;

  initialize(): Promise<void>;
  track(event: AnalyticsEvent): Promise<boolean>;
  identify(payload: IdentifyPayload): Promise<boolean>;
  group(payload: GroupPayload): Promise<boolean>;
  page(payload: PagePayload): Promise<boolean>;
  flush(): Promise<boolean>;
  destroy(): Promise<void>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

export interface BatchItem {
  type: 'track' | 'identify' | 'group' | 'page';
  payload: any;
  timestamp: Date;
  retryCount?: number;
}

export interface QueueMetrics {
  queueSize: number;
  processedCount: number;
  errorCount: number;
  lastFlushTime: Date;
}

export interface ConsentStatus {
  granted: boolean;
  categories: {
    analytics?: boolean;
    marketing?: boolean;
    personalization?: boolean;
    essential?: boolean;
  };
  timestamp: Date;
}
