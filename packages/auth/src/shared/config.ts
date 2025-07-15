/**
 * Environment configuration for authentication
 */

import { safeClientEnv, safeServerEnv } from '../../env';
import type { AuthConfig } from './types';

/**
 * Creates auth configuration from environment variables
 */
export function createAuthConfig(): AuthConfig {
  // During build time, return a minimal config to avoid validation errors
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      middleware: {
        enabled: true,
        enableApiMiddleware: true,
        enableNodeMiddleware: true,
        enableWebMiddleware: true,
        publicPaths: ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'],
        skipPaths: [],
        redirectTo: '/sign-in',
        requireAuth: false,
        enableRateLimit: false,
        enableSessionCache: false,
      },
      providers: {},
      apiKeys: {
        defaultPermissions: ['read'],
        enableServiceAuth: true,
        expirationDays: 90,
        rateLimiting: {
          enabled: true,
          requestsPerMinute: 100,
        },
      },
      appUrl: 'http://localhost:3000',
      databaseUrl: 'postgresql://localhost:5432/dev',
      features: {
        advancedMiddleware: true,
        admin: true,
        apiKeys: true,
        impersonation: true,
        magicLink: true,
        organizationInvitations: true,
        organizations: true,
        passkeys: true,
        serviceToService: true,
        sessionCaching: true,
        teams: true,
        twoFactor: true,
      },
      secret: 'build-time-secret',
      teams: {
        defaultPermissions: ['read'],
        enableInvitations: true,
        maxTeamsPerOrganization: 10,
      },
    };
  }

  const serverConfig = safeServerEnv();
  const clientConfig = safeClientEnv();

  return {
    middleware: {
      enabled: true,
      enableApiMiddleware: true,
      enableNodeMiddleware: true,
      enableWebMiddleware: true,
      publicPaths: ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'],
      skipPaths: [],
      redirectTo: '/sign-in',
      requireAuth: false,
      enableRateLimit: false,
      enableSessionCache: false,
    },
    providers: {
      ...(serverConfig.GITHUB_CLIENT_ID &&
        serverConfig.GITHUB_CLIENT_SECRET && {
          github: {
            clientId: serverConfig.GITHUB_CLIENT_ID,
            clientSecret: serverConfig.GITHUB_CLIENT_SECRET,
          },
        }),
      ...(serverConfig.GOOGLE_CLIENT_ID &&
        serverConfig.GOOGLE_CLIENT_SECRET && {
          google: {
            clientId: serverConfig.GOOGLE_CLIENT_ID,
            clientSecret: serverConfig.GOOGLE_CLIENT_SECRET,
          },
        }),
    },
    apiKeys: {
      defaultPermissions: ['read'],
      enableServiceAuth: true,
      expirationDays: 90,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
      },
    },
    appUrl: clientConfig.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    databaseUrl:
      serverConfig.DATABASE_URL ||
      (process.env.NODE_ENV === 'production'
        ? (() => {
            throw new Error('DATABASE_URL is required in production');
          })()
        : 'postgresql://localhost:5432/dev'),
    features: {
      advancedMiddleware: true,
      admin: true,
      apiKeys: true,
      impersonation: true,
      magicLink: true,
      organizationInvitations: true,
      organizations: true,
      passkeys: true,
      serviceToService: true,
      sessionCaching: true,
      teams: true,
      twoFactor: true,
    },
    secret:
      serverConfig.BETTER_AUTH_SECRET ||
      serverConfig.AUTH_SECRET ||
      (process.env.NODE_ENV === 'production'
        ? (() => {
            throw new Error(
              'BETTER_AUTH_SECRET is required. Please set it in your environment variables.',
            );
          })()
        : 'development-secret-change-in-production'),
    teams: {
      defaultPermissions: ['read'],
      enableInvitations: true,
      maxTeamsPerOrganization: 10,
    },
  };
}
