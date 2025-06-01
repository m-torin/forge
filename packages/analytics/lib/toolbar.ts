import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

import { keys } from '../keys';

import type { NextConfig } from 'next';

/**
 * Wrap Next.js config with Vercel Toolbar support
 * Only applies when FLAGS_SECRET is configured
 */
export function withToolbar(nextConfig: NextConfig): NextConfig {
  try {
    const { FLAGS_SECRET } = keys();
    
    // Only apply toolbar in development when FLAGS_SECRET is set
    if (process.env.NODE_ENV === 'development' && FLAGS_SECRET) {
      return withVercelToolbar()(nextConfig);
    }
  } catch (error) {
    // Re-throw the error from keys function for testing
    throw error;
  }

  // Return config unchanged if toolbar not needed
  return nextConfig;
}