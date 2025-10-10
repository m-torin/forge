/**
 * Vercel Analytics-specific types
 */

export interface VercelConfig {
  // Vercel Analytics doesn't require API keys for basic usage
  // But can be configured with options
  options?: {
    mode?: 'auto' | 'production' | 'development';
    debug?: boolean;
    beforeSend?: (event: any) => any | null;
  };
}

type _VercelTrackProperties = Record<string, any>;

// Vercel Analytics has limited server-side support
// Mainly focused on web vitals and page views on client

export type VercelOptions = Record<string, any>;
