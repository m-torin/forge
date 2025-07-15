'use client';

/**
 * React provider component for observability
 * Updated for React 19 and Next.js 15 compatibility
 */

import React, { type ErrorInfo, type ReactNode, use, useMemo } from 'react';

import { safeEnv } from '../../env';
import { createClientObservabilityManager } from '../client/utils/manager';
import { ObservabilityConfig, ObservabilityManager, ProviderRegistry } from '../shared/types/types';

import { ObservabilityContext } from './use-observability';

export interface ObservabilityProviderProps extends Record<string, any> {
  children: ReactNode;
  config: ObservabilityConfig;
  /** React 19: Enable concurrent initialization */
  enableConcurrent?: boolean;
  /** React 19: Error boundary integration */
  errorBoundary?: boolean;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo?: ErrorInfo) => void;
  onInitialized?: (manager: ObservabilityManager) => void;
  /** React 19: Priority for startTransition */
  priority?: 'background' | 'normal' | 'user-blocking';
  /** React 19: Suspense integration for async initialization */
  suspense?: boolean;
}

/**
 * Provider component that initializes and provides observability to the app
 * React 19 optimized with concurrent features
 */

// Client-specific provider registry with lazy loading
const CLIENT_PROVIDERS: ProviderRegistry = {
  console: async () => {
    const { ConsoleProvider } = await import('../shared/providers/console-provider');
    return new ConsoleProvider();
  },
  sentry: async () => {
    const { SentryClientProvider } = await import('../client/providers/sentry-client');
    return new SentryClientProvider();
  },
};

export function ObservabilityProvider({
  children,
  config,
  enableConcurrent = true,
  errorBoundary = false,
  _fallback = null,
  onError,
  onInitialized,
  priority = 'normal',
  suspense = false,
}: ObservabilityProviderProps) {
  // React 19: Log unused props for development feedback
  React.useEffect(() => {
    const env = safeEnv();
    if (env.NEXT_PUBLIC_NODE_ENV === 'development') {
      if (errorBoundary) {
        console.warn('ObservabilityProvider: errorBoundary prop is not yet implemented');
      }
      if (suspense) {
        console.warn('ObservabilityProvider: suspense prop is not yet implemented');
      }
      if (priority !== 'normal') {
        console.warn('ObservabilityProvider: priority prop is not yet implemented');
      }
    }
  }, [errorBoundary, suspense, priority]);

  // React 19: Use useMemo to create stable promise
  const managerPromise = useMemo(() => {
    if (enableConcurrent) {
      return createObservabilityManagerPromise(config, onError);
    }
    return null;
  }, [config, enableConcurrent, onError]);

  // Fallback: State for non-concurrent mode
  const [syncManager, setSyncManager] = React.useState<null | ObservabilityManager>(null);

  // React 19: Use the new `use` hook for concurrent data fetching
  // IMPORTANT: `use` must not be wrapped in try-catch blocks
  let manager: null | ObservabilityManager = null;

  if (enableConcurrent && managerPromise) {
    // React 19: use() hook must be called outside try-catch
    manager = use(managerPromise);
  } else {
    // Use sync manager for non-concurrent mode
    manager = syncManager;
  }

  // React 19: Use useEffect for side effects after successful initialization
  React.useEffect(() => {
    if (manager && onInitialized) {
      onInitialized(manager);
    }
  }, [manager, onInitialized]);

  // Initialize manager asynchronously for non-concurrent mode
  React.useEffect(() => {
    if (!enableConcurrent) {
      createObservabilityManagerPromise(config, onError)
        .then((initializedManager: any) => {
          setSyncManager(initializedManager);
          if (onInitialized) {
            onInitialized(initializedManager);
          }
        })
        .catch((error: any) => {
          console.error('Failed to initialize observability in sync mode:', error);
          if (onError) {
            onError(error);
          }
        });
    }
  }, [config, enableConcurrent, onError, onInitialized]);

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

/**
 * React 19: Create observability manager promise for concurrent initialization
 * Handles errors internally to prevent Suspense exceptions
 */
function createObservabilityManagerPromise(
  config: ObservabilityConfig,
  onError?: (error: Error) => void,
): Promise<ObservabilityManager> {
  return Promise.resolve().then(async () => {
    try {
      const manager = createClientObservabilityManager(config, CLIENT_PROVIDERS);
      await manager.initialize();
      return manager;
    } catch (error: any) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (onError) {
        onError(err);
      }
      console.error('Failed to initialize observability:', err);
      // Return a mock manager to prevent Suspense exceptions
      return createClientObservabilityManager({ providers: {} }, {});
    }
  });
}
