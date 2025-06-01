'use client';

import { VercelToolbar } from '@vercel/toolbar/next';

import { keys } from '../keys';

/**
 * Vercel Toolbar component for managing feature flags in development
 * Only renders when FLAGS_SECRET is configured
 */
export function Toolbar() {
  const { FLAGS_SECRET } = keys();

  // Only show toolbar when FLAGS_SECRET is configured
  if (!FLAGS_SECRET) {
    return null;
  }

  return <VercelToolbar />;
}