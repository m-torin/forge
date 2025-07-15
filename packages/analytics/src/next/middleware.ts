/**
 * Next.js middleware integration for analytics
 * Provides automatic tracking and context extraction at the edge
 */

import { type NextRequest, NextResponse } from 'next/server';

import { generateDistinctId, getDistinctIdFromCookies } from '../shared/utils/posthog-bootstrap';

import type { AnalyticsConfig } from '../shared/types/types';

export interface AnalyticsMiddlewareConfig {
  /**
   * Analytics configuration
   */
  analytics: AnalyticsConfig;

  /**
   * PostHog API key for distinct ID management
   */
  posthogApiKey?: string;

  /**
   * Routes to exclude from tracking
   */
  excludeRoutes?: string[] | RegExp[];

  /**
   * Custom route matcher function
   */
  shouldTrack?: (pathname: string) => boolean;

  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Custom event name generator
   */
  getEventName?: (pathname: string, method: string) => string;

  /**
   * Custom properties extractor
   */
  getProperties?: (request: NextRequest) => Record<string, any>;

  /**
   * Track page views automatically
   */
  trackPageViews?: boolean;

  /**
   * Track API routes automatically
   */
  trackApiRoutes?: boolean;
}

/**
 * Create analytics middleware for Next.js
 */
export function createAnalyticsMiddleware(config: AnalyticsMiddlewareConfig) {
  return async function analyticsMiddleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const method = request.method;

    // Check if we should track this route
    if (!shouldTrackRoute(pathname, config)) {
      return NextResponse.next();
    }

    // Create response object to modify headers/cookies
    const response = NextResponse.next();

    try {
      // Handle distinct ID for PostHog
      if (config.posthogApiKey) {
        const distinctId = await ensureDistinctId(request, response, config.posthogApiKey);

        // Add distinct ID to response headers for downstream use
        response.headers.set('x-analytics-distinct-id', distinctId);
      }

      // Extract analytics context
      const context = extractAnalyticsContext(request);

      // Add context to response headers for server components
      response.headers.set('x-analytics-context', JSON.stringify(context));

      // Track the request if edge runtime analytics is available
      if (globalThis.analytics && typeof globalThis.analytics.track === 'function') {
        const eventName = config.getEventName
          ? config.getEventName(pathname, method)
          : getDefaultEventName(pathname, method, config);

        const properties = {
          ...context,
          ...(config.getProperties ? config.getProperties(request) : {}),
          pathname,
          method,
          search_params: Object.fromEntries(searchParams.entries()),
          timestamp: new Date().toISOString(),
        };

        // Track asynchronously without blocking response
        // Use async IIFE to properly handle the promise
        (async () => {
          try {
            // Re-check analytics exists inside async context for TypeScript
            if (globalThis.analytics && typeof globalThis.analytics.track === 'function') {
              await globalThis.analytics.track(eventName, properties);
            }
          } catch {
            // Silently fail to avoid disrupting request
          }
        })();
      }
    } catch (_error) {
      // Don't let analytics errors break the app
      if (config.debug) {
        // Log error in debug mode only
      }
    }

    return response;
  };
}

/**
 * Ensure distinct ID exists for PostHog tracking
 */
async function ensureDistinctId(
  request: NextRequest,
  response: NextResponse,
  apiKey: string,
): Promise<string> {
  // Try to get existing distinct ID from cookies
  const existingId = getDistinctIdFromCookies(request.cookies as any, apiKey);

  if (existingId) {
    return existingId;
  }

  // Generate new distinct ID
  const newId = generateDistinctId();

  // Set cookie with appropriate options
  const cookieName = `ph_${apiKey}_posthog`;
  response.cookies.set(cookieName, JSON.stringify({ distinct_id: newId }), {
    httpOnly: false, // PostHog JS needs to read this
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return newId;
}

/**
 * Check if route should be tracked
 */
function shouldTrackRoute(pathname: string, config: AnalyticsMiddlewareConfig): boolean {
  // Use custom matcher if provided
  if (config.shouldTrack) {
    return config.shouldTrack(pathname);
  }

  // Check exclude routes
  if (config.excludeRoutes) {
    for (const exclude of config.excludeRoutes) {
      if (typeof exclude === 'string') {
        if (pathname.startsWith(exclude)) {
          return false;
        }
      } else if (exclude instanceof RegExp) {
        if (exclude.test(pathname)) {
          return false;
        }
      }
    }
  }

  // Default exclusions
  const defaultExcludes = [
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known/',
  ];

  for (const exclude of defaultExcludes) {
    if (pathname.startsWith(exclude)) {
      return false;
    }
  }

  // Check if we should track this type of route
  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute && config.trackApiRoutes === false) {
    return false;
  }

  if (!isApiRoute && config.trackPageViews === false) {
    return false;
  }

  return true;
}

/**
 * Extract analytics context from request
 */
function extractAnalyticsContext(request: NextRequest): Record<string, any> {
  const headers = request.headers;

  return {
    // User agent info
    user_agent: headers.get('user-agent') || undefined,

    // Referrer info
    referer: headers.get('referer') || undefined,
    referrer: headers.get('referrer') || undefined,

    // IP and location info (if available)
    ip:
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      undefined,

    city: headers.get('x-vercel-ip-city') || undefined,
    country: headers.get('x-vercel-ip-country') || undefined,
    region: headers.get('x-vercel-ip-country-region') || undefined,

    // Request info
    host: headers.get('host') || undefined,
    protocol: headers.get('x-forwarded-proto') || 'https',

    accept_encoding: headers.get('accept-encoding') || undefined,
    // Accept headers
    accept_language: headers.get('accept-language') || undefined,

    deployment_id: headers.get('x-vercel-deployment-id') || undefined,
    // Edge runtime info
    edge_region: headers.get('x-vercel-edge-region') || undefined,
  };
}

/**
 * Get default event name based on route type
 */
function getDefaultEventName(
  pathname: string,
  method: string,
  _config: AnalyticsMiddlewareConfig,
): string {
  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute) {
    return `API ${method} Request`;
  }

  return 'Page View';
}

/**
 * Middleware configuration helper for common patterns
 */
export function createAnalyticsMiddlewareConfig(options: {
  posthogApiKey?: string;
  segmentWriteKey?: string;
  excludeRoutes?: string[] | RegExp[];
  debug?: boolean;
}): AnalyticsMiddlewareConfig {
  const config: AnalyticsMiddlewareConfig = {
    analytics: {
      providers: {},
    },
    debug: options.debug,
    excludeRoutes: options.excludeRoutes,
    posthogApiKey: options.posthogApiKey,
    trackApiRoutes: true,
    trackPageViews: true,
  };

  // Add providers based on configuration
  if (options.posthogApiKey) {
    config.analytics.providers.posthog = {
      apiKey: options.posthogApiKey,
    };
  }

  if (options.segmentWriteKey) {
    config.analytics.providers.segment = {
      writeKey: options.segmentWriteKey,
    };
  }

  return config;
}

/**
 * Extract analytics context from headers (for server components)
 */
export function getAnalyticsContextFromHeaders(headers: Headers): Record<string, any> {
  const contextHeader = headers.get('x-analytics-context');

  if (!contextHeader) {
    return {};
  }

  try {
    return JSON.parse(contextHeader);
  } catch {
    return {};
  }
}

/**
 * Get distinct ID from headers (for server components)
 */
export function getDistinctIdFromHeaders(headers: Headers): string | null {
  return headers.get('x-analytics-distinct-id');
}

/**
 * Conditional middleware helper
 */
export function conditionalAnalyticsMiddleware(
  config: AnalyticsMiddlewareConfig,
  condition: (request: NextRequest) => boolean,
) {
  const middleware = createAnalyticsMiddleware(config);

  return async function (request: NextRequest) {
    if (condition(request)) {
      return middleware(request);
    }
    return NextResponse.next();
  };
}

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(
  ...middlewares: ((request: NextRequest) => Promise<NextResponse>)[]
) {
  return async function composedMiddleware(request: NextRequest) {
    let response = NextResponse.next();

    for (const middleware of middlewares) {
      response = await middleware(request);

      // If middleware returns a redirect or error, stop processing
      if (response.status !== 200 || response.headers.get('location')) {
        return response;
      }
    }

    return response;
  };
}

// Type declaration for edge runtime global analytics
declare global {
  var analytics:
    | {
        track: (event: string, properties?: any) => Promise<void>;
        identify: (userId: string, traits?: any) => Promise<void>;
        page: (name?: string, properties?: any) => Promise<void>;
      }
    | undefined;
}
