'use client';

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
        throw new Error(`Feature flag evaluation error: ${error}`);
      }
    };
    evaluateFlag();
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
        throw new Error(`Feature flag check error: ${error}`);
      }
    };
    checkEnabled();
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
        throw new Error(`Feature flag payload error: ${error}`);
      }
    };
    getFlagValue();
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
        throw new Error(`Feature flags fetch error: ${error}`);
      }
    };
    getAllFlags();
  }, [adapter]);

  return flags;
}
