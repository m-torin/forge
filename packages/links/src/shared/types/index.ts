/**
 * Core link management types
 * Provides interfaces for URL shortening, link tracking, and analytics
 */

import type { AnalyticsConfig } from './analytics-integration';

export interface LinkConfig {
  providers: {
    dub?: DubProviderConfig;
  };
  analytics?: AnalyticsConfig;
}

export interface DubProviderConfig {
  enabled: boolean;
  apiKey?: string;
  workspace?: string;
  baseUrl?: string;
  defaultDomain?: string;
  defaultExpiration?: Date | string;
  defaultTags?: string[];
}

export interface CreateLinkRequest {
  url: string;
  domain?: string;
  key?: string;
  prefix?: string;
  trackConversion?: boolean;
  publicStats?: boolean;
  tagIds?: string[];
  tags?: string[];
  comments?: string;
  expiresAt?: Date | string;
  expiredUrl?: string;
  password?: string;
  proxy?: boolean;
  title?: string;
  description?: string;
  image?: string;
  video?: string;
  ios?: string;
  android?: string;
  geo?: Record<string, string>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface Link {
  id: string;
  domain: string;
  key: string;
  url: string;
  shortLink: string;
  qrCode: string;
  archived: boolean;
  expiresAt?: Date;
  expiredUrl?: string;
  password?: string;
  proxy: boolean;
  title?: string;
  description?: string;
  image?: string;
  video?: string;
  ios?: string;
  android?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  tagIds: string[];
  tags: LinkTag[];
  comments?: string;
  clicks: number;
  lastClicked?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  workspaceId: string;
}

export interface LinkTag {
  id: string;
  name: string;
  color: string;
}

export interface LinkAnalytics {
  clicks: number;
  uniqueClicks: number;
  topCountries: Array<{
    country: string;
    clicks: number;
  }>;
  topCities: Array<{
    city: string;
    country: string;
    clicks: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    clicks: number;
  }>;
  topBrowsers: Array<{
    browser: string;
    clicks: number;
  }>;
  topOs: Array<{
    os: string;
    clicks: number;
  }>;
  topDevices: Array<{
    device: string;
    clicks: number;
  }>;
}

export interface ClickEvent {
  timestamp: Date;
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  os?: string;
  device?: string;
  browser?: string;
  referrer?: string;
  referrerUrl?: string;
  ip?: string;
  ua?: string;
}

export interface LinkMetrics {
  link: Link;
  analytics: LinkAnalytics;
  timeSeries: Array<{
    start: Date;
    clicks: number;
  }>;
}

export interface BulkCreateRequest {
  links: CreateLinkRequest[];
}

export interface BulkCreateResponse {
  created: Link[];
  errors: Array<{
    url: string;
    error: string;
  }>;
}

export interface UpdateLinkRequest {
  url?: string;
  trackConversion?: boolean;
  archived?: boolean;
  publicStats?: boolean;
  tagIds?: string[];
  comments?: string;
  expiresAt?: Date | string;
  expiredUrl?: string;
  password?: string;
  proxy?: boolean;
  title?: string;
  description?: string;
  image?: string;
  video?: string;
  ios?: string;
  android?: string;
  geo?: Record<string, string>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface LinkProvider {
  name: string;
  createLink(request: CreateLinkRequest): Promise<Link>;
  getLink(id: string): Promise<Link | null>;
  updateLink(id: string, request: UpdateLinkRequest): Promise<Link>;
  deleteLink(id: string): Promise<void>;
  getAnalytics(
    id: string,
    interval?: '1h' | '24h' | '7d' | '30d' | '90d' | 'all',
  ): Promise<LinkAnalytics>;
  getClicks(id: string, page?: number, pageSize?: number): Promise<ClickEvent[]>;
  bulkCreate?(request: BulkCreateRequest): Promise<BulkCreateResponse>;
}

export interface LinkManager {
  createLink(request: CreateLinkRequest): Promise<Link>;
  getLink(id: string): Promise<Link | null>;
  getLinkByKey(key: string, domain?: string): Promise<Link | null>;
  updateLink(id: string, request: UpdateLinkRequest): Promise<Link>;
  deleteLink(id: string): Promise<void>;
  getAnalytics(
    id: string,
    interval?: '1h' | '24h' | '7d' | '30d' | '90d' | 'all',
  ): Promise<LinkAnalytics>;
  getClicks(id: string, page?: number, pageSize?: number): Promise<ClickEvent[]>;
  getMetrics(id: string): Promise<LinkMetrics>;
  bulkCreate(request: BulkCreateRequest): Promise<BulkCreateResponse>;
  trackClick(linkId: string, event: Partial<ClickEvent>, providerName?: string): Promise<void>;
}

export type {
  LinkAnalytics as Analytics,
  ClickEvent as Click,
  CreateLinkRequest as CreateLink,
  DubProviderConfig as DubConfig,
  LinkMetrics as Metrics,
  UpdateLinkRequest as UpdateLink,
};

// Re-export analytics integration types
export type {
  AnalyticsConfig,
  AnalyticsIntegration,
  AnalyticsManager,
  BulkCreatedEvent,
  LinkAnalyticsEvent,
  LinkAnalyticsEventData,
  LinkClickedEvent,
  LinkCreatedEvent,
  LinkDeletedEvent,
  LinkExpiredEvent,
  LinkUpdatedEvent,
  LinkWithAnalytics,
  RedirectProcessedEvent,
} from './analytics-integration';
