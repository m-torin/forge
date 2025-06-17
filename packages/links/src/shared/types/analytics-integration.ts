/**
 * Analytics Integration Types
 * Optional integration with @repo/analytics package
 */

// Re-export minimal analytics types to avoid tight coupling
export interface AnalyticsManager {
  track(event: string, properties?: Record<string, any>): Promise<void>;
  identify?(userId: string, traits?: Record<string, any>): Promise<void>;
  group?(groupId: string, traits?: Record<string, any>): Promise<void>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  provider?: AnalyticsManager;
  events?: LinkAnalyticsEvent[];
  sampling?: number;
  attribution?: {
    cookieDuration?: number;
    crossDomainTracking?: boolean;
  };
  debugMode?: boolean;
}

export type LinkAnalyticsEvent =
  | 'link_created'
  | 'link_updated'
  | 'link_deleted'
  | 'link_clicked'
  | 'link_viewed'
  | 'link_expired'
  | 'link_error'
  | 'bulk_created'
  | 'redirect_processed';

export interface LinkCreatedEvent {
  event: 'link_created';
  linkId: string;
  shortUrl: string;
  originalUrl: string;
  domain: string;
  key: string;
  title?: string;
  tags?: string[];
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  expiresAt?: Date;
  createdBy?: string;
  workspace?: string;
  timestamp: Date;
}

export interface LinkClickedEvent {
  event: 'link_clicked';
  linkId: string;
  shortUrl: string;
  originalUrl: string;
  clickId?: string;

  // Geographic data
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;

  // Device/Browser data
  browser?: string;
  os?: string;
  device?: string;
  userAgent?: string;

  // Referral data
  referrer?: string;
  referrerUrl?: string;

  // User context (from analytics package)
  userId?: string;
  sessionId?: string;
  visitorId?: string;

  // Campaign attribution
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;

  // Technical data
  ip?: string;
  timestamp: Date;
}

export interface LinkUpdatedEvent {
  event: 'link_updated';
  linkId: string;
  shortUrl: string;
  changes: Record<string, any>;
  updatedBy?: string;
  timestamp: Date;
}

export interface LinkDeletedEvent {
  event: 'link_deleted';
  linkId: string;
  shortUrl: string;
  originalUrl: string;
  deletedBy?: string;
  finalStats?: {
    totalClicks: number;
    uniqueClicks: number;
    lifespan: number; // days
  };
  timestamp: Date;
}

export interface LinkExpiredEvent {
  event: 'link_expired';
  linkId: string;
  shortUrl: string;
  originalUrl: string;
  expiredAt: Date;
  finalStats?: {
    totalClicks: number;
    uniqueClicks: number;
  };
  timestamp: Date;
}

export interface BulkCreatedEvent {
  event: 'bulk_created';
  totalLinks: number;
  successfulLinks: number;
  failedLinks: number;
  domains: string[];
  tags?: string[];
  createdBy?: string;
  timestamp: Date;
}

export interface RedirectProcessedEvent {
  event: 'redirect_processed';
  linkId: string;
  shortUrl: string;
  originalUrl: string;
  redirectType: 'success' | 'expired' | 'password_required' | 'not_found';
  responseTime: number;
  timestamp: Date;
}

export type LinkAnalyticsEventData =
  | LinkCreatedEvent
  | LinkClickedEvent
  | LinkUpdatedEvent
  | LinkDeletedEvent
  | LinkExpiredEvent
  | BulkCreatedEvent
  | RedirectProcessedEvent;

export interface AnalyticsIntegration {
  track(eventData: LinkAnalyticsEventData): Promise<void>;
  identify?(userId: string, traits?: Record<string, any>): Promise<void>;
  getAttributionContext?(): Promise<{
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
    referrer?: string;
    sessionId?: string;
  }>;
}

export interface LinkWithAnalytics {
  link: any; // Link type from main types
  analytics?: {
    conversionValue?: number;
    experimentVariant?: string;
    userId?: string;
    sessionId?: string;
    attribution?: {
      source?: string;
      medium?: string;
      campaign?: string;
      referrer?: string;
    };
  };
}
