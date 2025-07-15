/**
 * Better Auth Configuration
 * This is the single source of truth for auth configuration and types
 */

import { logError, logInfo } from '@repo/observability/shared-env';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import {
  admin,
  apiKey,
  bearer,
  customSession,
  magicLink,
  multiSession,
  oneTap,
  openAPI,
  organization,
  twoFactor,
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import 'server-only';

import { prisma } from '@repo/database/prisma/server/next';
import {
  sendMagicLinkEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '@repo/email/server/next';
import { safeEnv } from '../../env';

/**
 * Environment configuration
 */
const env = safeEnv();
const config = {
  baseURL: env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  secret:
    env.BETTER_AUTH_SECRET ||
    env.AUTH_SECRET ||
    (() => {
      throw new Error(
        'BETTER_AUTH_SECRET is required. Please set it in your environment variables.',
      );
    })(),
  appName: env.NEXT_PUBLIC_APP_NAME || 'Forge',
  trustedOrigins: env.TRUSTED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3302',
    'http://localhost:3400',
  ],
  providers: {
    github:
      env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          }
        : null,
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }
        : null,
    facebook:
      env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
        ? {
            clientId: env.FACEBOOK_CLIENT_ID,
            clientSecret: env.FACEBOOK_CLIENT_SECRET,
          }
        : null,
    discord:
      env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET
        ? {
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
          }
        : null,
    microsoft:
      env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
        ? {
            clientId: env.MICROSOFT_CLIENT_ID,
            clientSecret: env.MICROSOFT_CLIENT_SECRET,
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
    sendResetPassword: async ({ user, url }) => {
      try {
        logInfo(`Sending password reset email to ${user.email}`);

        await sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          resetLink: url,
        });

        logInfo(`Password reset email sent successfully to ${user.email}`);
      } catch (error) {
        logError(
          'Failed to send password reset email',
          error instanceof Error ? error : new Error(String(error)),
          { email: user.email },
        );
        throw error;
      }
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
  },

  // Email Verification
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        logInfo(`Sending verification email to ${user.email}`);

        await sendVerificationEmail({
          email: user.email,
          name: user.name,
          verificationLink: url,
        });

        logInfo(`Verification email sent successfully to ${user.email}`);
      } catch (error) {
        logError(
          'Failed to send verification email',
          error instanceof Error ? error : new Error(String(error)),
          { email: user.email },
        );
        throw error;
      }
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
    ...(config.providers.facebook && {
      facebook: {
        ...config.providers.facebook,
        enabled: true,
      },
    }),
    ...(config.providers.discord && {
      discord: {
        ...config.providers.discord,
        enabled: true,
      },
    }),
    ...(config.providers.microsoft && {
      microsoft: {
        ...config.providers.microsoft,
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
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        try {
          logInfo(`Sending change email verification to ${newEmail}`);

          await sendVerificationEmail({
            email: newEmail,
            name: user.name,
            verificationLink: url,
          });

          logInfo(`Change email verification sent successfully to ${newEmail}`);
        } catch (error) {
          logError(
            'Failed to send change email verification',
            error instanceof Error ? error : new Error(String(error)),
            { oldEmail: user.email, newEmail },
          );
          throw error;
        }
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        try {
          logInfo(`Sending delete account verification to ${user.email}`);

          // Use a custom email for delete account warning
          await sendVerificationEmail({
            email: user.email,
            name: user.name,
            verificationLink: url,
          });

          logInfo(`Delete account verification sent successfully to ${user.email}`);
        } catch (error) {
          logError(
            'Failed to send delete account verification',
            error instanceof Error ? error : new Error(String(error)),
            { email: user.email },
          );
          throw error;
        }
      },
      beforeDelete: async user => {
        // Perform cleanup before deletion
        logInfo(`Preparing to delete user: ${user.email}`);
      },
      afterDelete: async user => {
        // Perform cleanup after deletion
        logInfo(`User deleted: ${user.email}`);
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
      sendMagicLink: async ({ email, token, url }, _request) => {
        try {
          // Use the url provided by BetterAuth which includes the token
          // If url is not provided, construct it manually
          const magicLinkUrl = url || `${config.baseURL}/auth/magic-link/verify?token=${token}`;

          logInfo(`Sending magic link to ${email}`);

          // Send the email
          await sendMagicLinkEmail({
            email,
            magicLink: magicLinkUrl,
            name: email.split('@')[0], // Use email prefix as name if not available
            expiresIn: '5 minutes', // Default from BetterAuth is 300 seconds
          });

          logInfo(`Magic link sent successfully to ${email}`);
        } catch (error) {
          logError(
            'Failed to send magic link email',
            error instanceof Error ? error : new Error(String(error)),
            { email },
          );
          throw error; // Re-throw to let BetterAuth handle the error
        }
      },
      expiresIn: 300, // 5 minutes in seconds
      disableSignUp: false, // Allow automatic sign up
    }),

    // Two Factor Auth with OTP Email support
    twoFactor({
      issuer: config.appName,
      otpOptions: {
        async sendOTP({ user, otp }, _request) {
          try {
            logInfo(`Sending OTP to ${user.email}`);

            // Send OTP email using our email service
            await sendOTPEmail({
              email: user.email,
              name: user.name || user.email.split('@')[0],
              otp,
              purpose: 'two-factor authentication',
            });

            logInfo(`OTP sent successfully to ${user.email}`);
          } catch (error) {
            logError(
              'Failed to send OTP email',
              error instanceof Error ? error : new Error(String(error)),
              { email: user.email },
            );
            throw error;
          }
        },
      },
    }),

    // Passkey Support
    passkey(),

    // Multi-Session Support - Allow users to switch between accounts
    multiSession({
      maximumSessions: 5, // Maximum number of concurrent sessions per user
    }),

    // Bearer Token Authentication for APIs
    bearer(),

    // Google One Tap Sign-In
    oneTap(),

    // Custom Session Fields
    customSession(async session => {
      // Add custom fields to session object
      return {
        ...session,
        user: {
          ...session.user,
          // Add any custom user fields here
        },
      };
    }),

    // OpenAPI Documentation
    openAPI(),

    // Next.js cookies (must be last)
    nextCookies(),
  ],

  // Error Handling
  onAPIError: {
    throw: false,
    onError: async (error: any, ctx: any) => {
      logError('Better Auth API Error', error instanceof Error ? error : new Error(String(error)), {
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
        logInfo(`Auth Request: ${ctx?.method} ${ctx?.path}`);
      }
    },
  },
}) as any;

// Export the auth type for inference
export type AuthInstance = typeof auth;
