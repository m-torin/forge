/**
 * Segment-specific types
 */

export interface SegmentConfig {
  options?: {
    integrations?: Record<string, any>;
    context?: Record<string, any>;
    anonymousId?: string;
  };
  writeKey: string;
}

export type SegmentTrackProperties = Record<string, any>;

export interface SegmentUserTraits {
  [key: string]: any;
  createdAt?: Date | string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface SegmentGroupTraits {
  [key: string]: any;
  employees?: number;
  industry?: string;
  name?: string;
  plan?: string;
}

export interface SegmentPageProperties {
  [key: string]: any;
  path?: string;
  referrer?: string;
  search?: string;
  title?: string;
  url?: string;
}

export type SegmentOptions = Record<string, any>;
