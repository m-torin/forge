/**
 * Environment configuration for authentication
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import type { AuthConfig } from './types';

const isProduction = process.env.NODE_ENV === 'production';
const hasRequiredEnvVars = Boolean(
  process.env.BETTER_AUTH_SECRET && process.env.DATABASE_URL && process.env.NEXT_PUBLIC_APP_URL,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: requireInProduction
      ? z.string().min(1).url()
      : z.string().min(1).url().optional(),
  },
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  server: {
    BETTER_AUTH_SECRET: requireInProduction ? z.string().min(1) : z.string().min(1).optional(),
    DATABASE_URL: requireInProduction
      ? z.string().min(1).url()
      : z.string().min(1).url().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  },
});

/**
 * Creates auth configuration from environment variables
 */
export function createAuthConfig(): AuthConfig {
  const config = env;

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
      ...(config.GITHUB_CLIENT_ID &&
        config.GITHUB_CLIENT_SECRET && {
          github: {
            clientId: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
          },
        }),
      ...(config.GOOGLE_CLIENT_ID &&
        config.GOOGLE_CLIENT_SECRET && {
          google: {
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
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
    appUrl: config.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    databaseUrl: config.DATABASE_URL || 'postgresql://localhost:5432/dev',
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
    secret: config.BETTER_AUTH_SECRET || 'development-secret',
    teams: {
      defaultPermissions: ['read'],
      enableInvitations: true,
      maxTeamsPerOrganization: 10,
    },
  };
}
