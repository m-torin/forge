'use client';

import React from 'react';

import { AnalyticsProvider } from './nextjs';

import type { AnalyticsFlags } from '../../types/flags';

interface FlagAwareAnalyticsProviderProps {
  children: React.ReactNode;
  flags: AnalyticsFlags;
  googleAnalytics?: {
    measurementId: string;
  };
  posthog?: {
    apiKey: string;
    apiHost?: string;
  };
  // Analytics config
  segment?: {
    writeKey: string;
  };
}

/**
 * Analytics Provider that respects feature flags
 * This is meant to be used at the application level where flags are resolved
 */
export function FlagAwareAnalyticsProvider({
  children,
  flags,
  googleAnalytics,
  posthog,
  segment,
}: FlagAwareAnalyticsProviderProps) {
  // Check environment restrictions
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (flags.productionOnly && !isProduction) {
    return <>{children}</>;
  }

  // Analytics completely disabled
  if (!flags.enabled) {
    return <>{children}</>;
  }

  // Build provider config based on flags
  const providerConfig = {
    debug: flags.debug,
    disabled: !flags.enabled,
    googleAnalytics: flags.googleEnabled && googleAnalytics ? googleAnalytics : undefined,
    posthog: flags.posthogEnabled && posthog ? posthog : undefined,
    segment: flags.segmentEnabled && segment ? segment : undefined,
  };

  return (
    <AnalyticsProvider {...providerConfig}>
      {children}
    </AnalyticsProvider>
  );
}