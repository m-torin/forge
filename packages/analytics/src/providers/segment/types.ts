/**
 * Segment provider types
 */

export interface SegmentConfig {
  writeKey: string;
  options?: SegmentOptions;
}

interface SegmentOptions {
  // Segment Analytics 2.0 options
  integrations?: Record<string, any>;
  timeout?: number;
  retryQueue?: boolean;
  plugins?: any[];

  // Browser-specific options
  anonymousId?: string;
  initialPageview?: boolean;
  cookie?: {
    name?: string;
    maxage?: number;
    domain?: string;
    path?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
  };

  // Server-specific options
  flushAt?: number;
  flushInterval?: number;
  maxEventsInBatch?: number;
  maxRetries?: number;
  requestTimeout?: number;

  // Advanced options
  debug?: boolean;
  disable?: boolean;
  disableClientPersistence?: boolean;
  useBeacon?: boolean;
  apiHost?: string;
  cdnURL?: string;
  cdnSettings?: any;
}
