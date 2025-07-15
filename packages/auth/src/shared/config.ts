/**
 * Environment configuration for authentication
 */

import { safeClientEnv, safeServerEnv } from '../../env';
import type { AuthConfig } from './types';

/**
 * Creates auth configuration from environment variables
 */
export function createAuthConfig(): AuthConfig {
  const serverConfig = safeServerEnv();
  const clientConfig = safeClientEnv();

  return {
    middleware: {
      enableApiMiddleware: true,
      enableNodeMiddleware: true,
      enableWebMiddleware: true,
      publicPaths: ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'],
      redirectTo: '/sign-in',
      requireAuthentication: false,
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
    databaseUrl: serverConfig.DATABASE_URL || 'postgresql://localhost:5432/dev',
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
      (() => {
        throw new Error(
          'BETTER_AUTH_SECRET is required. Please set it in your environment variables.',
        );
      })(),
    teams: {
      defaultPermissions: ['read'],
      enableInvitations: true,
      maxTeamsPerOrganization: 10,
    },
  };
}
