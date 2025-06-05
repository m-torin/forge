/**
 * React provider component for observability
 */

import React, { useEffect, useState, type ReactNode } from 'react';
import { ObservabilityContext } from './use-observability';
import { createClientObservability } from '../client';
import type { ObservabilityConfig, ObservabilityManager } from '../shared/types/types';

export interface ObservabilityProviderProps {
  config: ObservabilityConfig;
  children: ReactNode;
  fallback?: ReactNode;
  onInitialized?: (manager: ObservabilityManager) => void;
  onError?: (error: Error) => void;
}

/**
 * Provider component that initializes and provides observability to the app
 */
export function ObservabilityProvider({
  config,
  children,
  fallback = null,
  onInitialized,
  onError
}: ObservabilityProviderProps) {
  const [manager, setManager] = useState<ObservabilityManager | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeObservability = async () => {
      try {
        const observabilityManager = await createClientObservability(config);
        
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

  return (
    <ObservabilityContext.Provider value={manager}>
      {children}
    </ObservabilityContext.Provider>
  );
}

/**
 * Higher-order component to wrap a component with observability
 */
export function withObservability<P extends object>(
  Component: React.ComponentType<P>,
  config: ObservabilityConfig
): React.ComponentType<P> {
  return function ObservabilityWrappedComponent(props: P) {
    return (
      <ObservabilityProvider config={config}>
        <Component {...props} />
      </ObservabilityProvider>
    );
  };
}