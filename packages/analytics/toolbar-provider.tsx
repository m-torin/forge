'use client';

import { VercelToolbar } from '@vercel/toolbar/next';
import { useEffect } from 'react';

import { keys } from './keys';

/**
 * Multi-Toolbar Provider
 * Supports both Vercel Toolbar and PostHog Toolbar based on environment variables
 *
 * Environment Variables:
 * - FLAGS_SECRET: Required for Vercel Toolbar
 * - NEXT_PUBLIC_ENABLE_VERCEL_TOOLBAR: 'true' | 'false' (default: 'true' if FLAGS_SECRET exists)
 * - NEXT_PUBLIC_ENABLE_POSTHOG_TOOLBAR: 'true' | 'false' (default: 'false')
 */
export function ToolbarProvider() {
  const { FLAGS_SECRET, NEXT_PUBLIC_ENABLE_POSTHOG_TOOLBAR, NEXT_PUBLIC_ENABLE_VERCEL_TOOLBAR } =
    keys();

  useEffect(() => {
    // Enable PostHog Toolbar if explicitly enabled
    if (NEXT_PUBLIC_ENABLE_POSTHOG_TOOLBAR === 'true') {
      if (typeof window !== 'undefined' && window.posthog) {
        console.log('[Toolbar] Loading PostHog Toolbar');
        window.posthog.loadToolbar();
      } else {
        console.warn('[Toolbar] PostHog not available for toolbar');
      }
    }
  }, [NEXT_PUBLIC_ENABLE_POSTHOG_TOOLBAR]);

  // Show Vercel Toolbar if:
  // 1. FLAGS_SECRET is configured AND
  // 2. Not explicitly disabled
  const showVercelToolbar = FLAGS_SECRET && NEXT_PUBLIC_ENABLE_VERCEL_TOOLBAR !== 'false';

  if (showVercelToolbar) {
    console.log('[Toolbar] Loading Vercel Toolbar');
  }

  return <>{showVercelToolbar && <VercelToolbar />}</>;
}
