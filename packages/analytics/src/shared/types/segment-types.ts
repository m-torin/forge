/**
 * Segment-specific types
 */

export interface SegmentConfig {
  writeKey: string;
  options?: {
    integrations?: Record<string, any>;
    context?: Record<string, any>;
    anonymousId?: string;
  };
}

export interface SegmentTrackProperties {
  [key: string]: any;
}

export interface SegmentUserTraits {
  [key: string]: any;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date | string;
}

export interface SegmentGroupTraits {
  [key: string]: any;
  name?: string;
  employees?: number;
  plan?: string;
  industry?: string;
}

export interface SegmentPageProperties {
  [key: string]: any;
  title?: string;
  url?: string;
  path?: string;
  referrer?: string;
  search?: string;
}

export interface SegmentOptions {
  [key: string]: any;
}