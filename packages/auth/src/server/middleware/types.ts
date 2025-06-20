/**
 * Middleware types to break circular dependency
 */

import { NextRequest } from 'next/server';

export interface AdvancedMiddlewareOptions extends MiddlewareOptions {
  // Route-specific configurations
  apiRoutes?: {
    options: MiddlewareOptions & { allowedHeaders?: string[] };
    paths: string[];
  };

  // Conditional middleware based on features
  conditionalFeatures?: {
    enableApiKeys?: boolean;
    enableImpersonation?: boolean;
    enableTeams?: boolean;
  };
  customHeaders?: Record<string, string>;

  enableAuditLog?: boolean;
  // Advanced features
  enableMetrics?: boolean;
  // Runtime selection
  runtime?: 'auto' | 'edge' | 'nodejs';

  webRoutes?: {
    options: MiddlewareOptions;
    protectedPaths?: string[];
  };
}

export interface MiddlewareFactory {
  createAdvancedMiddleware: (
    config: any,
    options?: AdvancedMiddlewareOptions,
  ) => MiddlewareFunction;
  createApiMiddleware: (options?: MiddlewareOptions) => MiddlewareFunction;
  createNodeMiddleware: (options?: MiddlewareOptions) => MiddlewareFunction;
  createWebMiddleware: (options?: MiddlewareOptions) => MiddlewareFunction;
}

export type MiddlewareFunction = (request: NextRequest) => Promise<Response>;

export interface MiddlewareOptions {
  enableRateLimit?: boolean;
  enableSessionCache?: boolean;
  publicPaths?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}
