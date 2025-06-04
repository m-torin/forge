'use client';

import React, { useEffect, useState } from 'react';

import {
  analyticsDebugMode,
  analyticsDevelopmentMode,
  analyticsEnabled,
  analyticsProductionOnly,
  googleAnalyticsEnabled,
  posthogAnalyticsEnabled,
  segmentAnalyticsEnabled,
} from '../../flags-server';

import { AnalyticsProvider } from './nextjs';

interface FeatureFlagAnalyticsProviderProps {
  children: React.ReactNode;
  googleAnalytics?: {
    measurementId: string;
  };
  // Override flags for testing
  overrideFlags?: {
    analyticsEnabled?: boolean;
    segmentEnabled?: boolean;
    posthogEnabled?: boolean;
    googleEnabled?: boolean;
    debugMode?: boolean;
  };
  posthog?: {
    apiKey: string;
    apiHost?: string;
  };
  // Default config values (can be overridden by feature flags)
  segment?: {
    writeKey: string;
  };
}

interface AnalyticsFlagState {
  debug: boolean;
  developmentMode: boolean;
  google: boolean;
  isEnabled: boolean;
  posthog: boolean;
  productionOnly: boolean;
  segment: boolean;
}

/**
 * Feature Flag Aware Analytics Provider
 * Dynamically enables/disables analytics services based on feature flags
 */
export function FeatureFlagAnalyticsProvider({
  overrideFlags,
  children,
  googleAnalytics,
  posthog,
  segment,
}: FeatureFlagAnalyticsProviderProps) {
  const [flags, setFlags] = useState<AnalyticsFlagState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFlags() {
      try {
        // Use overrides if provided (for testing)
        if (overrideFlags) {
          setFlags({
            debug: overrideFlags.debugMode ?? false,
            developmentMode: false,
            google: overrideFlags.googleEnabled ?? false,
            isEnabled: overrideFlags.analyticsEnabled ?? true,
            posthog: overrideFlags.posthogEnabled ?? false,
            productionOnly: false,
            segment: overrideFlags.segmentEnabled ?? false,
          });
          setIsLoading(false);
          return;
        }

        // Load actual feature flags
        const [
          enabled,
          segmentEnabled,
          posthogEnabled,
          googleEnabled,
          debugMode,
          prodOnly,
          devMode,
        ] = await Promise.all([
          analyticsEnabled(),
          segmentAnalyticsEnabled(),
          posthogAnalyticsEnabled(),
          googleAnalyticsEnabled(),
          analyticsDebugMode(),
          analyticsProductionOnly(),
          analyticsDevelopmentMode(),
        ]);

        setFlags({
          debug: debugMode,
          developmentMode: devMode,
          google: googleEnabled,
          isEnabled: enabled,
          posthog: posthogEnabled,
          productionOnly: prodOnly,
          segment: segmentEnabled,
        });
      } catch (error) {
        console.error('[Analytics] Failed to load feature flags:', error);
        // Default to disabled on error
        setFlags({
          debug: false,
          developmentMode: false,
          google: false,
          isEnabled: false,
          posthog: false,
          productionOnly: false,
          segment: false,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadFlags();
  }, [overrideFlags]);

  // Don't render analytics until flags are loaded
  if (isLoading || !flags) {
    return <>{children}</>;
  }

  // Check environment restrictions
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (flags.productionOnly && !isProduction) {
    return <>{children}</>;
  }

  if (flags.developmentMode && !isDevelopment) {
    return <>{children}</>;
  }

  // Analytics completely disabled
  if (!flags.isEnabled) {
    return <>{children}</>;
  }

  // Build provider config based on flags
  const providerConfig = {
    debug: flags.debug,
    disabled: !flags.isEnabled,
    googleAnalytics: flags.google && googleAnalytics ? googleAnalytics : undefined,
    posthog: flags.posthog && posthog ? posthog : undefined,
    segment: flags.segment && segment ? segment : undefined,
  };

  return <AnalyticsProvider {...providerConfig}>{children}</AnalyticsProvider>;
}

/**
 * Hook to check analytics feature flags
 */
export function useAnalyticsFlags() {
  const [flags, setFlags] = useState<AnalyticsFlagState | null>(null);

  useEffect(() => {
    async function loadFlags() {
      const [enabled, segmentEnabled, posthogEnabled, googleEnabled, debugMode] = await Promise.all(
        [
          analyticsEnabled(),
          segmentAnalyticsEnabled(),
          posthogAnalyticsEnabled(),
          googleAnalyticsEnabled(),
          analyticsDebugMode(),
        ],
      );

      setFlags({
        debug: debugMode,
        developmentMode: false,
        google: googleEnabled,
        isEnabled: enabled,
        posthog: posthogEnabled,
        productionOnly: false,
        segment: segmentEnabled,
      });
    }

    loadFlags();
  }, []);

  return flags;
}
