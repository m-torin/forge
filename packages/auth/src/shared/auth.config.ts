/**
 * Better Auth Configuration
 * This is the single source of truth for auth configuration and types
 */

import 'server-only';
import { syncLogger as logger } from './utils/logger';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, apiKey, organization, magicLink, twoFactor } from 'better-auth/plugins';

import { prisma } from '@repo/database/prisma';

/**
 * Environment configuration
 */
const config = {
  baseURL:
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET!,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Forge',
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') || ['http://localhost:3000'],
  providers: {
    github:
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }
        : null,
    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }
        : null,
  },
};

/**
 * Better Auth instance configuration
 */
export const auth = betterAuth({
  // Core Configuration
  appName: config.appName,
  baseURL: config.baseURL,
  basePath: '/api/auth',
  secret: config.secret,
  trustedOrigins: config.trustedOrigins,

  // Database Configuration
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Email & Password Authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url, token }) => {
      logger.info(`Reset password for ${user.email}: ${url}`);
      // TODO: Implement email sending
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
  },

  // Email Verification
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      logger.info(`Verify email for ${user.email}: ${url}`);
      // TODO: Implement email sending
    },
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 hours
  },

  // Social Providers
  socialProviders: {
    ...(config.providers.github && {
      github: {
        ...config.providers.github,
        enabled: true,
      },
    }),
    ...(config.providers.google && {
      google: {
        ...config.providers.google,
        enabled: true,
      },
    }),
  },

  // Session Configuration
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    storeSessionInDatabase: false,
  },

  // User Configuration
  user: {
    additionalFields: {
      bio: {
        type: 'string',
        required: false,
      },
      locale: {
        type: 'string',
        required: false,
        defaultValue: 'en',
      },
      timezone: {
        type: 'string',
        required: false,
        defaultValue: 'UTC',
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
        logger.info(`Change email for ${user.email} to ${newEmail}: ${url}`);
        // TODO: Implement email sending
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        logger.info(`Delete account for ${user.email}: ${url}`);
        // TODO: Implement email sending
      },
      beforeDelete: async (user) => {
        // Perform cleanup before deletion
        logger.info(`Preparing to delete user: ${user.email}`);
      },
      afterDelete: async (user) => {
        // Perform cleanup after deletion
        logger.info(`User deleted: ${user.email}`);
      },
    },
  },

  // Account Linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['github', 'google', 'email-password'],
      allowDifferentEmails: false,
    },
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.NODE_ENV === 'production',
    window: 10, // 10 seconds
    max: 100, // 100 requests per window
    storage: 'memory',
  },

  // Advanced Configuration
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    disableCSRFCheck: false,
    cookiePrefix: 'forge-auth',
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Plugins
  plugins: [
    // Admin functionality
    admin({
      impersonationSessionDuration: 60 * 60 * 24, // 24 hours
    }),

    // API Keys
    apiKey(),

    // Organizations
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      creatorRole: 'owner',
      memberRole: 'member',
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
    }),

    // Magic Links
    magicLink({
      sendMagicLink: async ({ email, token }) => {
        logger.info(`Magic link for ${email}: ${token}`);
        // TODO: Implement email sending
      },
    }),

    // Two Factor Auth
    twoFactor({
      issuer: config.appName,
    }),

    // Next.js cookies (must be last)
    nextCookies(),
  ],

  // Error Handling
  onAPIError: {
    throw: false,
    onError: (error: any, ctx: any) => {
      logger.error('Better Auth API Error:', {
        error: error?.message || error,
        path: ctx?.path,
        method: ctx?.method,
      });
    },
  },

  // Request Hooks
  hooks: {
    before: async (ctx: any) => {
      // Log authentication requests in development
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Auth Request: ${ctx?.method} ${ctx?.path}`);
      }
    },
  },
}) as any;

// Export the auth type for inference
export type AuthInstance = typeof auth;
