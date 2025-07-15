/**
 * Server-side links exports for Next.js
 * Complete Next.js 15 integration for server components, API routes, and middleware
 *
 * This file provides server-side link functionality specifically for Next.js applications.
 * Use this in server components, API routes, middleware, and Next.js instrumentation.
 *
 * For non-Next.js applications, use '@repo/links/server' instead.
 *
 * @example
 * ```typescript
 * import {
 *   createServerLinkManager,
 *   createRedirectHandler,
 *   withLinkAnalytics
 * } from '@repo/links/server/next';
 *
 * // In your API route
 * const linkManager = await createServerLinkManager({
 *   providers: {
 *     dub: {
 *       enabled: true,
 *       apiKey: process.env.DUB_API_KEY,
 *       workspace: process.env.DUB_WORKSPACE
 *     }
 *   }
 * };
 *
 * // Create a short link
 * const link = await linkManager.createLink({
 *   url: 'https://example.com',
 *   title: 'Example'
 * });
 * ```
 */

import { logError } from '@repo/observability/server/next';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as React from 'react';

import {
  ClickEvent,
  CreateLinkRequest,
  Link,
  LinkAnalytics,
  LinkConfig,
  LinkManager,
  UpdateLinkRequest,
} from './shared/types/index';

// Re-export core server functionality
export {
  bulkCreateShortLinks,
  createLinkManager,
  createRedirectHandler,
  createServerLinkManager,
  createServerLinkManagerWithAnalytics,
  createServerLinkManagerWithValidation,
  getLinkMetricsWithCache,
  trackServerClick,
} from './server';

// ============================================================================
// NEXT.JS SERVER UTILITIES
// ============================================================================

/**
 * Create a Next.js-optimized link manager with environment variables
 */
export async function createNextLinkManager(
  overrides: Partial<LinkConfig> = {},
): Promise<LinkManager> {
  const config: LinkConfig = {
    providers: {
      dub: {
        enabled: process.env.DUB_ENABLED === 'true',
        apiKey: process.env.DUB_API_KEY,
        workspace: process.env.DUB_WORKSPACE,
        defaultDomain: process.env.DUB_DEFAULT_DOMAIN || 'dub.sh',
        baseUrl: process.env.DUB_BASE_URL || 'https://api.dub.co',
      },
      ...overrides.providers,
    },
    ...overrides,
  };

  const { createServerLinkManager } = await import('./server');
  return createServerLinkManager(config);
}

/**
 * Create a Next.js link manager with automatic analytics integration
 * Detects and integrates with @repo/analytics if available
 */
export async function createNextLinkManagerWithAnalytics(
  linkConfig: Partial<LinkConfig> = {},
  analyticsConfig?: any, // ObservabilityConfig from @repo/analytics
): Promise<LinkManager> {
  const config: LinkConfig = {
    providers: {
      dub: {
        enabled: process.env.DUB_ENABLED === 'true',
        apiKey: process.env.DUB_API_KEY,
        workspace: process.env.DUB_WORKSPACE,
        defaultDomain: process.env.DUB_DEFAULT_DOMAIN || 'dub.sh',
        baseUrl: process.env.DUB_BASE_URL || 'https://api.dub.co',
      },
      ...linkConfig.providers,
    },
    analytics: {
      enabled: process.env.LINKS_ANALYTICS_ENABLED === 'true' || false,
      events: ['link_created', 'link_clicked', 'link_deleted', 'bulk_created'],
      sampling: parseFloat(process.env.LINKS_ANALYTICS_SAMPLING || '1.0'),
      debugMode: process.env.NODE_ENV === 'development',
      ...linkConfig.analytics,
    },
    ...linkConfig,
  };

  // Try to integrate with analytics if config provided
  if (analyticsConfig) {
    const { createServerLinkManagerWithAnalytics } = await import('./server');
    return createServerLinkManagerWithAnalytics(config, analyticsConfig);
  }

  const { createServerLinkManager } = await import('./server');
  return createServerLinkManager(config);
}

/**
 * Handle link redirects in Next.js middleware or API routes
 */
export async function handleLinkRedirect(
  linkManager: LinkManager,
  domain: string,
  key: string,
  request: NextRequest,
): Promise<NextResponse | null> {
  try {
    const link = await linkManager.getLinkByKey(key, domain);
    if (!link) {
      return null;
    }

    // Check if link is expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      if (link.expiredUrl) {
        return NextResponse.redirect(link.expiredUrl, 302);
      }
      return null;
    }

    // Extract request information
    const ip =
      // request.ip || // Removed: ip property doesn't exist on NextRequest
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || undefined;

    // Track the click
    const { trackServerClick } = await import('./server');
    await trackServerClick(linkManager, link.id, {
      ip,
      userAgent,
      referrer,
      headers: {},
    });

    // Perform redirect
    return NextResponse.redirect(link.url, 302);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(`Error handling link redirect: ${String(error)}`),
    );
    return null;
  }
}

/**
 * Track link click from server component or API route
 */
export async function trackLinkClickServer(
  linkManager: LinkManager,
  linkId: string,
  additionalData: Partial<ClickEvent> = {},
): Promise<void> {
  const headersList = await headers();

  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'unknown';

  const userAgent = headersList.get('user-agent') || 'unknown';
  const referrer = headersList.get('referer') || undefined;

  const { trackServerClick } = await import('./server');
  await trackServerClick(linkManager, linkId, {
    ip,
    userAgent,
    referrer,
    headers: {},
    ...additionalData,
  });
}

/**
 * Create a short link from a server component
 */
export async function createLinkFromServer(
  linkManager: LinkManager,
  request: CreateLinkRequest,
): Promise<Link> {
  return linkManager.createLink(request);
}

/**
 * Get link analytics from server component with automatic caching
 */
export async function getLinkAnalyticsServer(
  linkManager: LinkManager,
  linkId: string,
  _interval = '7d',
): Promise<LinkAnalytics> {
  // Use server-side caching for better performance
  const { getLinkMetricsWithCache } = await import('./server');
  const metrics = await getLinkMetricsWithCache(linkManager, linkId, {
    ttl: 300, // 5 minutes
    useRedis: false, // Would be true in production with Redis
  });

  return metrics.analytics;
}

// ============================================================================
// NEXT.JS API ROUTE HELPERS
// ============================================================================

/**
 * Create API route handler for link operations
 */
export function createLinkAPIHandler(linkManager: LinkManager) {
  return {
    // POST /api/links - Create a new link
    async createLink(request: NextRequest): Promise<NextResponse> {
      try {
        const body = (await request.json()) as CreateLinkRequest;
        const link = await linkManager.createLink(body);

        return NextResponse.json({ success: true, data: link }, { status: 201 });
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
          },
          { status: 400 },
        );
      }
    },

    // GET /api/links/[id] - Get link by ID
    async getLink(linkId: string): Promise<NextResponse> {
      try {
        const link = await linkManager.getLink(linkId);

        if (!link) {
          return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: link });
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
          },
          { status: 500 },
        );
      }
    },

    // PUT /api/links/[id] - Update link
    async updateLink(linkId: string, request: NextRequest): Promise<NextResponse> {
      try {
        const body = (await request.json()) as UpdateLinkRequest;
        const link = await linkManager.updateLink(linkId, body);

        return NextResponse.json({ success: true, data: link });
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
          },
          { status: 400 },
        );
      }
    },

    // DELETE /api/links/[id] - Delete link
    async deleteLink(linkId: string): Promise<NextResponse> {
      try {
        await linkManager.deleteLink(linkId);

        return NextResponse.json({ success: true });
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
          },
          { status: 500 },
        );
      }
    },

    // GET /api/links/[id]/analytics - Get link analytics
    async getLinkAnalytics(linkId: string, interval = '7d'): Promise<NextResponse> {
      try {
        const analytics = await getLinkAnalyticsServer(linkManager, linkId, interval);

        return NextResponse.json({ success: true, data: analytics });
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
          },
          { status: 500 },
        );
      }
    },

    // POST /api/links/bulk - Bulk create links
    async bulkCreateLinks(request: NextRequest): Promise<NextResponse> {
      try {
        const body = await request.json();
        const { bulkCreateShortLinks } = await import('./server');
        const result = await bulkCreateShortLinks(linkManager, body.links, body.options);

        return NextResponse.json({ success: true, data: result });
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
          },
          { status: 400 },
        );
      }
    },
  };
}

/**
 * Middleware helper for link redirects
 */
export function createLinkMiddleware(linkManager: LinkManager) {
  return async (request: NextRequest): Promise<NextResponse | undefined> => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Check if this looks like a short link (single path segment)
    if (pathParts.length === 1) {
      const key = pathParts[0];
      const domain = url.hostname;

      const response = await handleLinkRedirect(linkManager, domain, key, request);
      if (response) {
        return response;
      }
    }

    // Not a short link, continue to next middleware
    return undefined;
  };
}

// ============================================================================
// NEXT.JS SERVER COMPONENT HELPERS
// ============================================================================

/**
 * Server action for creating links (for use in forms)
 */
export function createLinkAction(linkManager: LinkManager) {
  return async (formData: FormData): Promise<{ success: boolean; data?: Link; error?: string }> => {
    try {
      const url = formData.get('url') as string;
      const title = formData.get('title') as string;
      const tags = formData.get('tags') as string;

      if (!url) {
        return { success: false, error: 'URL is required' };
      }

      const link = await linkManager.createLink({
        url,
        title: title || undefined,
        tags: tags ? tags.split(',').map((tag: any) => tag.trim()) : undefined,
      });

      return { success: true, data: link };
    } catch (error: any) {
      return {
        success: false,
        error:
          error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error',
      };
    }
  };
}

/**
 * Higher-order function to add link analytics tracking to pages
 */
export function withLinkAnalytics<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  _linkManager: LinkManager,
) {
  return async function WrappedComponent(props: T) {
    // This would track page views if the page contains links
    // Implementation would depend on specific requirements

    // @ts-ignore - React Server Component
    return <Component {...props} />;
  };
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
} from './shared/types/index';
