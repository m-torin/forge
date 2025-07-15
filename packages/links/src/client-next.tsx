/**
 * Client-side links exports for Next.js
 * Complete Next.js 15 integration for client components and browser environments
 *
 * This file provides client-side link functionality specifically for Next.js applications.
 * Use this in client components, React hooks, and Next.js browser environments.
 *
 * For non-Next.js applications, use '@repo/links/client' instead.
 *
 * @example
 * ```typescript
 * import {
 *   createClientLinkManager,
 *   useLinkManager,
 *   LinkProvider
 * } from '@repo/links/client/next';
 *
 * // In your layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <LinkProvider config={{
 *       providers: {
 *         dub: {
 *           enabled: true,
 *           apiKey: process.env.NEXT_PUBLIC_DUB_API_KEY,
 *           defaultDomain: 'yourdomain.com'
 *         }
 *       }
 *     }}>
 *       {children}
 *     </LinkProvider>
 *   );
 * }
 *
 * // In a component
 * function MyComponent() {
 *   const linkManager = useLinkManager();
 *   // Use linkManager...
 * }
 * ```
 */

'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { logError } from '@repo/observability/client/next';
import {
  ClickEvent,
  CreateLinkRequest,
  Link,
  LinkAnalytics,
  LinkConfig,
  LinkManager,
} from './shared/types/index.js';

// Re-export core client functionality
export {
  createClientLinkManager,
  createClientLinkManagerUniversal,
  createLinkManager,
  createShortLink,
  getLinkAnalyticsWithCache,
  openAndTrackLink,
  trackLinkClick,
} from './client.js';

// ============================================================================
// NEXT.JS CLIENT CONTEXT & HOOKS
// ============================================================================

interface LinkContextType {
  linkManager: LinkManager | null;
  isInitialized: boolean;
  error: string | null;
}

const LinkContext = createContext<LinkContextType>({
  linkManager: null,
  isInitialized: false,
  error: null,
});

interface LinkProviderProps extends Record<string, any> {
  config: LinkConfig;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Link Provider for Next.js applications
 * Provides link management context to all child components
 */
export function LinkProvider({ config, children, fallback }: LinkProviderProps) {
  const [linkManager, setLinkManager] = useState<LinkManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeLinkManager() {
      try {
        const { createClientLinkManager } = await import('./client.js');
        const manager = await createClientLinkManager(config);

        if (mounted) {
          setLinkManager(manager);
          setIsInitialized(true);
          setError(null);
        }
      } catch (error: any) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize link manager');
          setIsInitialized(true);
        }
      }
    }

    initializeLinkManager();

    return () => {
      mounted = false;
    };
  }, [config]);

  if (!isInitialized) {
    return fallback || <div>Initializing link manager...</div>;
  }

  if (error) {
    logError('Link manager initialization error', { error: String(error) });
    return fallback || <div>Error initializing link manager: {error}</div>;
  }

  return (
    <LinkContext.Provider value={{ linkManager, isInitialized, error }}>
      {children}
    </LinkContext.Provider>
  );
}

/**
 * Hook to access the link manager in Next.js components
 */
export function useLinkManager(): LinkManager {
  const context = useContext(LinkContext);

  if (!context.isInitialized) {
    throw new Error('useLinkManager must be used within a LinkProvider and after initialization');
  }

  if (context.error) {
    throw new Error(`Link manager error: ${context.error}`);
  }

  if (!context.linkManager) {
    throw new Error('Link manager not available');
  }

  return context.linkManager;
}

/**
 * Hook to check if link manager is ready
 */
export function useLinkManagerStatus(): {
  isReady: boolean;
  isInitialized: boolean;
  error: string | null;
} {
  const context = useContext(LinkContext);

  return {
    isReady: context.isInitialized && !context.error && !!context.linkManager,
    isInitialized: context.isInitialized,
    error: context.error,
  };
}

// ============================================================================
// NEXT.JS SPECIFIC HOOKS
// ============================================================================

/**
 * Hook to create and track short links with Next.js router integration
 */
export function useCreateLink() {
  const linkManager = useLinkManager();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLink = async (request: CreateLinkRequest): Promise<Link | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const link = await linkManager.createLink(request);
      return link;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create link';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createLink, isLoading, error };
}

/**
 * Hook to track link analytics with automatic refresh
 */
export function useLinkAnalytics(
  linkId: string | null,
  interval: '1h' | '24h' | '7d' | '30d' | '90d' | 'all' = '7d',
  refreshInterval = 60000, // 1 minute
) {
  const linkManager = useLinkManager();
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkId) return;

    let mounted = true;
    let intervalId: NodeJS.Timeout;

    async function fetchAnalytics() {
      if (!mounted || !linkId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await linkManager.getAnalytics(linkId, interval);
        if (mounted) {
          setAnalytics(data);
        }
      } catch (error: any) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    // Initial fetch
    fetchAnalytics();

    // Set up periodic refresh
    intervalId = setInterval(fetchAnalytics, refreshInterval);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [linkId, interval, refreshInterval, linkManager]);

  const refresh = async () => {
    if (!linkId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await linkManager.getAnalytics(linkId, interval);
      setAnalytics(data);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  return { analytics, isLoading, error, refresh };
}

/**
 * Hook to handle link clicks with Next.js router
 */
export function useLinkClick() {
  const linkManager = useLinkManager();
  const router = useRouter();

  const handleLinkClick = async (
    linkId: string,
    options: {
      openInNewTab?: boolean;
      trackOnly?: boolean;
      additionalData?: Partial<ClickEvent>;
    } = {},
  ) => {
    const { openInNewTab = false, trackOnly = false, additionalData = {} } = options;

    try {
      const link = await linkManager.getLink(linkId);
      if (!link) {
        throw new Error('Link not found');
      }

      // Track the click
      const { trackLinkClick } = await import('./client.js');
      await trackLinkClick(linkManager, linkId, additionalData);

      if (!trackOnly) {
        if (openInNewTab) {
          window.open(link.shortLink, '_blank');
        } else {
          router.push(link.shortLink);
        }
      }
    } catch (error: any) {
      logError('Error handling link click', error);
      throw error;
    }
  };

  return { handleLinkClick };
}

/**
 * Hook to get link information with caching
 */
export function useLink(linkId: string | null) {
  const linkManager = useLinkManager();
  const [link, setLink] = useState<Link | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkId) {
      setLink(null);
      return;
    }

    let mounted = true;

    async function fetchLink() {
      if (!mounted || !linkId) return;

      setIsLoading(true);
      setError(null);

      try {
        const linkData = await linkManager.getLink(linkId);
        if (mounted) {
          setLink(linkData);
        }
      } catch (error: any) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to fetch link');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLink();

    return () => {
      mounted = false;
    };
  }, [linkId, linkManager]);

  return { link, isLoading, error };
}

// ============================================================================
// RE-EXPORT TYPES
// ============================================================================

export type {
  BulkCreateRequest,
  BulkCreateResponse,
  ClickEvent,
  CreateLinkRequest,
  DubProviderConfig,
  Link,
  LinkAnalytics,
  LinkConfig,
  LinkManager,
  LinkMetrics,
  LinkProvider as LinkProviderInterface,
  LinkTag,
  UpdateLinkRequest,
} from './shared/types/index.js';
