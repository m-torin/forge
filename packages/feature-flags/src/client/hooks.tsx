'use client';

import { logError } from '@repo/observability';
import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * React hook for using feature flags in client components
 * Note: For server components, use the flag directly
 *
 * @param flagFunction - The flag function that returns a promise
 * @param initialValue - Optional initial value while loading
 */
export function useFlag<T>(flagFunction: () => Promise<T>, initialValue?: T): T | undefined {
  const [value, setValue] = useState<T | undefined>(initialValue);

  useEffect(() => {
    // Evaluate flag on client side
    const evaluateFlag = async () => {
      try {
        const result = await flagFunction();
        setValue(result);
      } catch (error) {
        // In development/test, log the error instead of throwing
        logError('Feature flag evaluation error', { error: String(error), hook: 'useFlag' });
        // Set a fallback value instead of throwing
        setValue(false as T);
      }
    };
    evaluateFlag().catch(error => {
      // Catch any remaining unhandled promise rejections
      logError('Unhandled flag evaluation error', { error: String(error), hook: 'useFlag' });
    });
  }, [flagFunction]);

  return value;
}

// Adapter interface for feature flag providers
export interface FeatureFlagAdapter {
  getAllFlags(): Promise<Record<string, any>>;
  getFlag<T = any>(key: string, defaultValue?: T): Promise<T>;
  identify?(userId: string, properties?: Record<string, any>): Promise<void>;
  isEnabled(key: string): Promise<boolean>;
  reload?(): Promise<void>;
  track?(event: string, properties?: Record<string, any>): Promise<void>;
}

// Context for feature flag provider
const FeatureFlagContext = createContext<FeatureFlagAdapter | null>(null);

// Hook to get the feature flag adapter from context
function useFeatureFlagAdapter(): FeatureFlagAdapter {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }
  return context;
}

/**
 * Provider component for feature flags
 */
export function FeatureFlagProvider({
  adapter,
  children,
}: {
  adapter: FeatureFlagAdapter;
  children: React.ReactNode;
}) {
  return <FeatureFlagContext.Provider value={adapter}>{children}</FeatureFlagContext.Provider>;
}

/**
 * Hook to check if a feature flag is enabled
 */
export function useFeatureFlag(key: string): boolean {
  const adapter = useFeatureFlagAdapter();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkEnabled = async () => {
      try {
        const result = await adapter.isEnabled(key);
        setEnabled(result);
      } catch (error) {
        // In development/test, log the error instead of throwing
        logError('Feature flag check error', { error: String(error), hook: 'useFlagCheck' });
        // Set fallback value instead of throwing
        setEnabled(false);
      }
    };
    checkEnabled().catch(error => {
      // Catch any remaining unhandled promise rejections
      logError('Unhandled feature flag check error', {
        error: String(error),
        hook: 'useFlagCheck',
      });
    });
  }, [adapter, key]);

  return enabled;
}

/**
 * Hook to get feature flag payload/value
 */
export function useFeatureFlagPayload<T = any>(key: string, defaultValue?: T): T | undefined {
  const adapter = useFeatureFlagAdapter();
  const [value, setValue] = useState<T | undefined>(defaultValue);

  useEffect(() => {
    const getFlagValue = async () => {
      try {
        const result = await adapter.getFlag(key, defaultValue);
        setValue(result);
      } catch (error) {
        // In development/test, log the error instead of throwing
        logError('Feature flag payload error', { error: String(error), hook: 'useFlagPayload' });
        // Set fallback value instead of throwing
        setValue(defaultValue);
      }
    };
    getFlagValue().catch(error => {
      // Catch any remaining unhandled promise rejections
      logError('Unhandled feature flag payload error', {
        error: String(error),
        hook: 'useFlagPayload',
      });
    });
  }, [adapter, key, defaultValue]);

  return value;
}

/**
 * Hook to get all feature flags
 */
export function useFeatureFlags(): Record<string, any> {
  const adapter = useFeatureFlagAdapter();
  const [flags, setFlags] = useState<Record<string, any>>({});

  useEffect(() => {
    const getAllFlags = async () => {
      try {
        const result = await adapter.getAllFlags();
        setFlags(result);
      } catch (error) {
        // In development/test, log the error instead of throwing
        logError('Feature flags fetch error', { error: String(error), hook: 'useFlags' });
        // Set fallback value instead of throwing
        setFlags({});
      }
    };
    getAllFlags().catch(error => {
      // Catch any remaining unhandled promise rejections
      logError('Unhandled feature flags fetch error', { error: String(error), hook: 'useFlags' });
    });
  }, [adapter]);

  return flags;
}
