/**
 * Advanced middleware factory for creating custom authentication middleware
 */

import { NextResponse } from 'next/server';

import { createApiMiddleware } from './api';
import { createNodeMiddleware } from './node';
import { createWebMiddleware } from './web';

import type { NextRequest } from 'next/server';
import type { AuthConfig, MiddlewareOptions } from '../shared/types';

export interface AdvancedMiddlewareOptions extends MiddlewareOptions {
  // Runtime selection
  runtime?: 'edge' | 'nodejs' | 'auto';
  
  // Route-specific configurations
  apiRoutes?: {
    paths: string[];
    options: MiddlewareOptions & { allowedHeaders?: string[] };
  };
  webRoutes?: {
    protectedPaths?: string[];
    options: MiddlewareOptions;
  };
  
  // Advanced features
  enableMetrics?: boolean;
  enableAuditLog?: boolean;
  customHeaders?: Record<string, string>;
  
  // Conditional middleware based on features
  conditionalFeatures?: {
    enableApiKeys?: boolean;
    enableTeams?: boolean;
    enableImpersonation?: boolean;
  };
}

/**
 * Creates a comprehensive middleware that combines API, web, and Node.js features
 * based on configuration and runtime detection
 */
export function createAdvancedMiddleware(
  config: AuthConfig,
  options: AdvancedMiddlewareOptions = {}
) {
  const {
    runtime = 'auto',
    apiRoutes,
    webRoutes,
    enableMetrics = false,
    enableAuditLog = false,
    customHeaders = {},
    conditionalFeatures = {},
    ...baseOptions
  } = options;

  // Create specialized middleware instances based on configuration
  const apiMiddleware = config.features.apiKeys && (conditionalFeatures.enableApiKeys !== false)
    ? createApiMiddleware({
        ...baseOptions,
        ...(apiRoutes?.options || {}),
        allowedHeaders: apiRoutes?.options?.allowedHeaders || ['x-api-key', 'authorization'],
      })
    : null;

  const webMiddleware = createWebMiddleware({
    ...baseOptions,
    ...(webRoutes?.options || {}),
    protectedPaths: webRoutes?.protectedPaths,
  });

  const nodeMiddleware = runtime === 'nodejs' 
    ? createNodeMiddleware({
        ...baseOptions,
        enableSessionCache: config.features.sessionCaching,
      })
    : null;

  return async function advancedMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const startTime = enableMetrics ? Date.now() : 0;

    let response: Response | undefined;
    let middleware_used = 'none';

    try {
      // Determine which middleware to use based on route and runtime
      if (pathname.startsWith('/api/')) {
        if (apiMiddleware && config.middleware?.enableApiMiddleware !== false) {
          response = await apiMiddleware(request);
          middleware_used = 'api';
        } else {
          response = NextResponse.next();
          middleware_used = 'passthrough';
        }
      } else if (runtime === 'nodejs' && nodeMiddleware) {
        response = await nodeMiddleware(request);
        middleware_used = 'node';
      } else {
        response = await webMiddleware(request);
        middleware_used = 'web';
      }

      // Add custom headers if specified
      if (response && Object.keys(customHeaders).length > 0) {
        for (const [key, value] of Object.entries(customHeaders)) {
          response.headers.set(key, value);
        }
      }

      // Add metrics headers if enabled
      if (enableMetrics && response) {
        const duration = Date.now() - startTime;
        response.headers.set('x-auth-duration', duration.toString());
        response.headers.set('x-auth-middleware', middleware_used);
        response.headers.set('x-auth-timestamp', new Date().toISOString());
      }

      // Add feature flags to response headers for debugging
      if (process.env.NODE_ENV === 'development' && response) {
        response.headers.set('x-auth-features', JSON.stringify({
          apiKeys: config.features.apiKeys,
          teams: config.features.teams,
          impersonation: config.features.impersonation,
          sessionCaching: config.features.sessionCaching,
        }));
      }

      // Audit logging (in production, this would go to a logging service)
      if (enableAuditLog && process.env.NODE_ENV !== 'test') {
        console.log('Auth middleware audit:', {
          path: pathname,
          middleware: middleware_used,
          timestamp: new Date().toISOString(),
          duration: enableMetrics ? Date.now() - startTime : undefined,
          userAgent: request.headers.get('user-agent'),
          ip: (request as any).ip || request.headers.get('x-forwarded-for'),
        });
      }

      return response || NextResponse.next();
    } catch (error) {
      console.error('Advanced middleware error:', error);
      
      // Return error response with debugging info
      return NextResponse.json(
        {
          error: 'Middleware Error',
          message: 'An error occurred in authentication middleware',
          ...(process.env.NODE_ENV === 'development' && {
            debug: {
              middleware: middleware_used,
              path: pathname,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          }),
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Creates a combined middleware that handles both web and API routes
 * with automatic runtime detection
 */
export function createCombinedMiddleware(options: AdvancedMiddlewareOptions & {
  publicWebRoutes?: string[];
  publicApiRoutes?: string[];
  apiKeyHeaders?: string[];
  redirectPath?: string;
} = {}) {
  const {
    publicWebRoutes = ['/sign-in', '/sign-up', '/_next', '/favicon.ico', '/.well-known'],
    publicApiRoutes = [],
    apiKeyHeaders = ['x-api-key', 'authorization'],
    redirectPath = '/sign-in',
    ...advancedOptions
  } = options;

  const apiMiddleware = createApiMiddleware({
    publicPaths: publicApiRoutes,
    allowedHeaders: apiKeyHeaders,
    ...advancedOptions,
  });

  const webMiddleware = createWebMiddleware({
    publicPaths: publicWebRoutes,
    redirectTo: redirectPath,
    apiKeyHeaders,
    ...advancedOptions,
  });

  return async function combinedMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Route to appropriate middleware based on path
    if (pathname.startsWith('/api/')) {
      return apiMiddleware(request);
    } else {
      return webMiddleware(request);
    }
  };
}

/**
 * Creates middleware with runtime detection and feature-based configuration
 */
export function createSmartMiddleware(config: AuthConfig, options: AdvancedMiddlewareOptions = {}) {
  // Detect runtime capabilities
  const hasNodeRuntime = typeof process !== 'undefined' && process.versions?.node;
  const effectiveRuntime = options.runtime === 'auto' 
    ? (hasNodeRuntime ? 'nodejs' : 'edge')
    : options.runtime;

  return createAdvancedMiddleware(config, {
    ...options,
    runtime: effectiveRuntime,
    conditionalFeatures: {
      enableApiKeys: config.features.apiKeys,
      enableTeams: config.features.teams,
      enableImpersonation: config.features.impersonation,
      ...options.conditionalFeatures,
    },
  });
}