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

type _SegmentTrackProperties = Record<string, any>;

interface _SegmentUserTraits {
  [key: string]: any;
  createdAt?: Date | string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface _SegmentGroupTraits {
  [key: string]: any;
  employees?: number;
  industry?: string;
  name?: string;
  plan?: string;
}

interface _SegmentPageProperties {
  [key: string]: any;
  path?: string;
  referrer?: string;
  search?: string;
  title?: string;
  url?: string;
}

export type SegmentOptions = Record<string, any>;
