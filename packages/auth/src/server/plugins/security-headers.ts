/**
 * Better Auth Security Integration Plugin
 * Integrates @repo/security package (Nosecone + Arcjet) with Better Auth
 *
 * Based on Arcjet's official documentation patterns:
 * - Uses @nosecone/next for security headers via middleware
 * - Integrates with Arcjet for advanced protection
 * - Follows Next.js middleware patterns for authentication flows
 */

import { noseconeOptions } from '@repo/security/server/next';
import type { BetterAuthPlugin } from 'better-auth';
import 'server-only';

/**
 * Nosecone-compatible security configuration for Better Auth
 * Follows the NoseconeOptions interface from @nosecone/next
 */
export interface SecurityHeadersConfig {
  /** Content Security Policy configuration - compatible with Nosecone directives format */
  contentSecurityPolicy?:
    | {
        directives?: Record<string, string[]>;
      }
    | false;
  /** Cross Origin Embedder Policy - follows Nosecone format */
  crossOriginEmbedderPolicy?:
    | {
        policy?: 'require-corp' | 'unsafe-none';
      }
    | false;
  /** Cross Origin Opener Policy - follows Nosecone format */
  crossOriginOpenerPolicy?:
    | {
        policy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
      }
    | false;
  /** Cross Origin Resource Policy - follows Nosecone format */
  crossOriginResourcePolicy?:
    | {
        policy?: 'same-origin' | 'same-site' | 'cross-origin';
      }
    | false;
  /** Referrer Policy - follows Nosecone format */
  referrerPolicy?:
    | {
        policy?: string;
      }
    | false;
  /** Strict Transport Security - follows Nosecone format */
  strictTransportSecurity?:
    | {
        maxAge?: number;
        includeSubDomains?: boolean;
        preload?: boolean;
      }
    | false;
  /** Enable Arcjet protection integration */
  arcjet?: {
    enabled?: boolean;
    allowedBots?: string[];
  };
  /** Additional authentication-specific security options */
  auth?: {
    /** Apply strict cache control to auth endpoints */
    strictCacheControl?: boolean;
    /** Additional trusted domains for auth flows */
    trustedDomains?: string[];
  };
}

/**
 * Default security configuration for authentication
 * Based on Nosecone defaults with authentication-specific enhancements
 */
const DEFAULT_AUTH_CONFIG: SecurityHeadersConfig = {
  // Authentication-specific CSP configuration following Nosecone patterns
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        // Development mode allows unsafe-inline for hot reloading
        ...(process.env.NODE_ENV === 'development' ? ["'unsafe-inline'"] : []),
        // OAuth provider scripts (following Arcjet Clerk example pattern)
        'https://accounts.google.com',
        'https://apis.google.com',
        'https://github.com',
        'https://discord.com',
        'https://connect.facebook.net',
        'https://login.microsoftonline.com',
      ],
      'connect-src': [
        "'self'",
        // OAuth API endpoints for authentication flows
        'https://accounts.google.com',
        'https://api.github.com',
        'https://discord.com/api',
        'https://graph.facebook.com',
        'https://graph.microsoft.com',
        'https://login.microsoftonline.com',
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        // Avatar sources from OAuth providers
        'https://*.googleusercontent.com',
        'https://avatars.githubusercontent.com',
        'https://cdn.discordapp.com',
        'https://*.fbcdn.net',
        'https://graph.microsoft.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for dynamic auth form styling
      ],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'object-src': ["'none'"],
      // Upgrade insecure requests only in production (following Nosecone pattern)
      ...(process.env.NODE_ENV === 'production' && {
        'upgrade-insecure-requests': [],
      }),
    },
  },

  // Cross-origin policies following Nosecone format
  crossOriginEmbedderPolicy: {
    policy: process.env.NODE_ENV === 'production' ? 'require-corp' : 'unsafe-none',
  },

  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },

  crossOriginResourcePolicy: {
    policy: 'same-origin',
  },

  // Referrer policy following Nosecone format
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // HSTS configuration following Nosecone format
  strictTransportSecurity:
    process.env.NODE_ENV === 'production'
      ? {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        }
      : false, // Disable in development

  // Arcjet configuration for advanced protection
  arcjet: {
    enabled: true,
    allowedBots: [], // No bots allowed on auth endpoints by default
  },

  // Auth-specific settings
  auth: {
    strictCacheControl: true,
    trustedDomains: [],
  },
};

/**
 * Apply authentication-specific cache control headers
 */
function applyAuthCacheControl(headers: Headers, url?: string): void {
  // Apply strict cache control to auth endpoints
  if (
    url &&
    (url.includes('/auth/') ||
      url.includes('/api/auth/') ||
      url.includes('/login') ||
      url.includes('/signup') ||
      url.includes('/reset-password'))
  ) {
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  }
}

/**
 * Merge authentication-specific CSP directives with base configuration
 * Following Nosecone patterns for CSP directive merging
 */
function mergeAuthCSP(
  baseDirectives: Record<string, string[]> | undefined,
  authConfig: SecurityHeadersConfig['auth'],
): Record<string, string[]> {
  const trustedDomains = authConfig?.trustedDomains || [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const envTrustedOrigins = process.env.TRUSTED_ORIGINS?.split(',') || [];
  const allTrustedDomains = [baseUrl, ...envTrustedOrigins, ...trustedDomains];

  // Get auth-specific directives from default config
  const authDirectives =
    typeof DEFAULT_AUTH_CONFIG.contentSecurityPolicy !== 'boolean'
      ? DEFAULT_AUTH_CONFIG.contentSecurityPolicy?.directives || {}
      : {};

  // Add trusted domains to appropriate directives
  const enhancedDirectives = {
    ...authDirectives,
    'script-src': [...(authDirectives['script-src'] || []), ...allTrustedDomains],
    'connect-src': [...(authDirectives['connect-src'] || []), ...allTrustedDomains],
    'img-src': [...(authDirectives['img-src'] || []), ...allTrustedDomains],
    'style-src': [...(authDirectives['style-src'] || []), ...allTrustedDomains],
    'form-action': [...(authDirectives['form-action'] || []), ...allTrustedDomains],
  };

  // Merge with base directives if provided (following Nosecone merge pattern)
  if (baseDirectives) {
    Object.entries(enhancedDirectives).forEach(([directive, sources]) => {
      const existingSources = baseDirectives[directive] || [];
      const sourcesArray = Array.isArray(sources) ? sources : [];
      (enhancedDirectives as any)[directive] = [...new Set([...existingSources, ...sourcesArray])];
    });

    // Include any additional base directives not in auth config
    Object.entries(baseDirectives).forEach(([directive, sources]) => {
      if (!(directive in enhancedDirectives)) {
        (enhancedDirectives as any)[directive] = sources;
      }
    });
  }

  return enhancedDirectives;
}

/**
 * Better Auth Security Headers Plugin
 * Integrates @repo/security package with Better Auth's native security features
 */
export interface SecurityHeadersPluginConfig {
  /** Enable security headers */
  enabled?: boolean;
  /** Security headers configuration */
  config?: SecurityHeadersConfig;
}

export function securityHeaders(options: SecurityHeadersPluginConfig = {}): BetterAuthPlugin {
  const { enabled = true, config = {} } = options;

  if (!enabled) {
    return { id: 'security-headers' };
  }

  // Merge with default auth configuration
  const mergedConfig = { ...DEFAULT_AUTH_CONFIG, ...config };

  return {
    id: 'security-headers',

    // Better Auth middleware support for security headers
    middlewares: [
      {
        path: '*', // Apply to all auth endpoints
        middleware: async (ctx: any) => {
          try {
            // Apply auth-specific cache control headers
            if (mergedConfig.auth?.strictCacheControl) {
              const url = ctx.request.url;
              if (
                url &&
                (url.includes('/api/auth/') ||
                  url.includes('/sign-in') ||
                  url.includes('/sign-up') ||
                  url.includes('/reset-password') ||
                  url.includes('/two-factor'))
              ) {
                ctx.context.responseHeaders = {
                  ...ctx.context.responseHeaders,
                  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                  Pragma: 'no-cache',
                  Expires: '0',
                };
              }
            }

            // Store security config for external middleware access
            (ctx.context as any).__securityConfig = mergedConfig;
          } catch (error) {
            // Log error but don't break the auth flow
            const { logError } = await import('@repo/observability');
            logError('Security headers middleware error', {
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        },
      },
    ],

    hooks: {
      after: [
        {
          matcher: _context => {
            // Apply to all authentication endpoints
            return true;
          },
          handler: async _context => {
            try {
              // Log security configuration in development (using observability)
              if (process.env.NODE_ENV === 'development') {
                const { logInfo } = await import('@repo/observability');
                logInfo('Better Auth security features active', {
                  rateLimitingEnabled: true, // Better Auth handles this natively
                  csrfProtectionEnabled: true, // Better Auth handles this natively
                  secureCookiesEnabled: false, // In development mode
                  noseconeIntegrationReady: true,
                  authCSPConfigured: !!mergedConfig.contentSecurityPolicy,
                  arcjetReady: mergedConfig.arcjet?.enabled,
                });
              }
            } catch (error) {
              // Log error but don't break the auth flow
              const { logError } = await import('@repo/observability');
              logError('Security headers plugin error', {
                error: error instanceof Error ? error : new Error(String(error)),
              });
            }
          },
        },
      ],
    },
  };
}

/**
 * Pre-configured security settings for different environments
 */
export const SecurityPresets = {
  development: {
    ...DEFAULT_AUTH_CONFIG,
    contentSecurityPolicy: {
      ...DEFAULT_AUTH_CONFIG.contentSecurityPolicy,
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Allow unsafe-inline in development
        'http://localhost:3000',
        'http://localhost:3200',
        'http://localhost:3300',
        // OAuth providers
        'https://accounts.google.com',
        'https://apis.google.com',
        'https://github.com',
        'https://discord.com',
        'https://connect.facebook.net',
        'https://login.microsoftonline.com',
      ],
    },
    crossOriginEmbedderPolicy: false, // Disable COEP in development
  },

  production: {
    ...DEFAULT_AUTH_CONFIG,
    // Production uses stricter defaults from DEFAULT_AUTH_CONFIG
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
  },

  strict: {
    ...DEFAULT_AUTH_CONFIG,
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'strict-dynamic'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    },
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
    referrerPolicy: 'no-referrer',
  },
} as const;

/**
 * Create Nosecone middleware configuration for authentication
 * Following Arcjet's documentation patterns for Next.js middleware integration
 */
export function createAuthNoseconeConfig(config: SecurityHeadersConfig = {}): Record<string, any> {
  const mergedConfig = { ...DEFAULT_AUTH_CONFIG, ...config };

  // Merge authentication-specific CSP directives with any base directives
  const authDirectives = mergeAuthCSP(
    typeof mergedConfig.contentSecurityPolicy !== 'boolean'
      ? mergedConfig.contentSecurityPolicy?.directives
      : undefined,
    mergedConfig.auth,
  );

  // Build Nosecone-compatible configuration
  const noseconeConfig = {
    // Spread base nosecone options
    ...noseconeOptions,

    // Override with auth-specific CSP
    contentSecurityPolicy:
      mergedConfig.contentSecurityPolicy !== false
        ? {
            ...(typeof noseconeOptions.contentSecurityPolicy === 'object'
              ? noseconeOptions.contentSecurityPolicy
              : {}),
            directives: {
              // Start with base Nosecone CSP directives
              ...(noseconeOptions.contentSecurityPolicy as any)?.directives,
              // Override with auth-specific directives
              ...authDirectives,
            },
          }
        : false,

    // Apply other security headers following Nosecone format
    crossOriginEmbedderPolicy: mergedConfig.crossOriginEmbedderPolicy,
    crossOriginOpenerPolicy: mergedConfig.crossOriginOpenerPolicy,
    crossOriginResourcePolicy: mergedConfig.crossOriginResourcePolicy,
    referrerPolicy: mergedConfig.referrerPolicy,
    strictTransportSecurity: mergedConfig.strictTransportSecurity,
  };

  return noseconeConfig;
}

/**
 * Export utilities for Next.js middleware integration
 * These utilities follow Arcjet/Nosecone patterns for middleware integration
 */
export { applyAuthCacheControl, DEFAULT_AUTH_CONFIG, mergeAuthCSP };

/**
 * Example middleware usage for Next.js applications
 *
 * ```typescript
 * // middleware.ts
 * import { createMiddleware } from '@nosecone/next';
 * import { createAuthNoseconeConfig } from '@repo/auth/server/plugins/security-headers';
 *
 * const authSecurityConfig = createAuthNoseconeConfig({
 *   auth: {
 *     trustedDomains: ['https://your-auth-domain.com'],
 *   },
 * });
 *
 * export default createMiddleware(authSecurityConfig);
 * ```
 */
