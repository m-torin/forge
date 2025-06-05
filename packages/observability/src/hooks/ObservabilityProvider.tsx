/**
 * React provider component for observability
 */

import React, { type ReactNode, useEffect, useState } from 'react';

import { SentryClientProvider } from '../client/providers/sentry-client';
import { ConsoleProvider } from '../shared/providers/console-provider';
import { LogtailProvider } from '../shared/providers/logtail-provider';
import { createObservabilityManager } from '../shared/utils/manager';

import { ObservabilityContext } from './use-observability';

import type {
  ObservabilityConfig,
  ObservabilityManager,
  ProviderRegistry,
} from '../shared/types/types';

export interface ObservabilityProviderProps {
  children: ReactNode;
  config: ObservabilityConfig;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  onInitialized?: (manager: ObservabilityManager) => void;
}

/**
 * Provider component that initializes and provides observability to the app
 */
// Client-specific provider registry
const CLIENT_PROVIDERS: ProviderRegistry = {
  console: () => new ConsoleProvider(),
  logtail: () => new LogtailProvider(),
  sentry: () => new SentryClientProvider(),
};

export function ObservabilityProvider({
  children,
  config,
  fallback = null,
  onError,
  onInitialized,
}: ObservabilityProviderProps) {
  const [manager, setManager] = useState<ObservabilityManager | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeObservability = async () => {
      try {
        const observabilityManager = createObservabilityManager(config, CLIENT_PROVIDERS);
        await observabilityManager.initialize();

        if (mounted) {
          setManager(observabilityManager);
          setIsInitializing(false);
          onInitialized?.(observabilityManager);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (mounted) {
          setError(error);
          setIsInitializing(false);
          onError?.(error);

          // Log to console as fallback
          console.error('Failed to initialize observability:', error);
        }
      }
    };

    initializeObservability();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // During initialization, show fallback or nothing
  if (isInitializing) {
    return <>{fallback}</>;
  }

  // If initialization failed, still render children but without observability
  if (error) {
    console.warn('Observability initialization failed, rendering without observability context');
  }

  return <ObservabilityContext.Provider value={manager}>{children}</ObservabilityContext.Provider>;
}

/**
 * Higher-order component to wrap a component with observability
 */
export function withObservability<P extends object>(
  Component: React.ComponentType<P>,
  config: ObservabilityConfig,
): React.ComponentType<P> {
  return function ObservabilityWrappedComponent(props: P) {
    return (
      <ObservabilityProvider config={config}>
        <Component {...props} />
      </ObservabilityProvider>
    );
  };
}
