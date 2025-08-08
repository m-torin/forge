/**
 * Better Auth Configuration
 * This is the single source of truth for auth configuration and types
 */

import { logError, logInfo } from '@repo/observability';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import {
  admin,
  anonymous,
  apiKey,
  bearer,
  customSession,
  emailOTP,
  magicLink,
  multiSession,
  oneTap,
  openAPI,
  organization,
  phoneNumber,
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
import { securityHeaders } from '../server/plugins/security-headers';
import { createBetterAuthErrorHandler } from '../server/secure-error-handler';

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
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'BETTER_AUTH_SECRET is required in production. Please set it in your environment variables.',
        );
      }
      // Safe development secret - clearly marked as dev-only
      return 'dev-secret-32-chars-long-not-for-prod!!';
    })(),
  appName: env.NEXT_PUBLIC_APP_NAME || 'Forge',
  trustedOrigins: env.TRUSTED_ORIGINS?.split(',') || [
    'http://localhost:3200', // webapp
    'http://localhost:3100', // ai-chatbot
    'http://localhost:3500', // email
    'http://localhost:3700', // storybook
    'http://localhost:3800', // docs
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
        logError('Failed to send password reset email', {
          error: error instanceof Error ? error : new Error(String(error)),
          email: user.email,
        });
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
        logError('Failed to send verification email', {
          error: error instanceof Error ? error : new Error(String(error)),
          email: user.email,
        });
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
      phoneNumber: {
        type: 'string',
        required: false,
      },
      phoneNumberVerified: {
        type: 'boolean',
        required: false,
        defaultValue: false,
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
          logError('Failed to send change email verification', {
            error: error instanceof Error ? error : new Error(String(error)),
            oldEmail: user.email,
            newEmail,
          });
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
          logError('Failed to send delete account verification', {
            error: error instanceof Error ? error : new Error(String(error)),
            email: user.email,
          });
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

  // Rate Limiting - Better Auth Native
  rateLimit: {
    enabled: env.AUTH_FEATURES_RATE_LIMITING !== 'false',
    window: 60, // 60 seconds (Better Auth default)
    max: 100, // 100 requests per window
    storage:
      process.env.NODE_ENV === 'production' && env.UPSTASH_REDIS_REST_URL ? 'database' : 'memory',
    customRules: {
      // Authentication endpoints with stricter limits
      '/sign-in/email': {
        window: 60, // 1 minute
        max: 10, // 10 attempts per minute
      },
      '/sign-in/phone': {
        window: 60,
        max: 10,
      },
      '/sign-up/email': {
        window: 300, // 5 minutes
        max: 5, // 5 signups per 5 minutes
      },
      '/forget-password': {
        window: 300, // 5 minutes
        max: 3, // 3 password reset attempts per 5 minutes
      },
      '/two-factor/*': {
        window: 60, // 1 minute
        max: 5, // 5 2FA attempts per minute
      },
      '/send-verification-email': {
        window: 300, // 5 minutes
        max: 3, // 3 verification emails per 5 minutes
      },
      '/api-key/*': {
        window: 60,
        max: 30, // API key operations
      },
    },
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
      enabled: true,
      domain:
        process.env.NODE_ENV === 'production'
          ? undefined // Let Better Auth handle domain detection in production
          : '.localhost', // Enable sharing across localhost ports in development
    },
    // Better Auth IP address detection for rate limiting
    ipAddress: {
      ipAddressHeaders: [
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip', // Cloudflare
        'x-client-ip',
        'x-forwarded',
        'forwarded-for',
        'forwarded',
      ],
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
          logError('Failed to send magic link email', {
            error: error instanceof Error ? error : new Error(String(error)),
            email,
          });
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
            logError('Failed to send OTP email', {
              error: error instanceof Error ? error : new Error(String(error)),
              email: user.email,
            });
            throw error;
          }
        },
      },
    }),

    // Passkey Support
    passkey(),

    // Anonymous Sessions - For guest users
    anonymous(),

    // Phone Number Authentication
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, _request) => {
        try {
          logInfo(`Sending SMS OTP to ${phoneNumber}`);

          // Dynamic import to avoid bundling SMS service in client
          const { sendSMS } = await import('../server/sms-service');

          const result = await sendSMS({
            phoneNumber,
            message: `Your ${config.appName} verification code: ${code}. This code expires in 10 minutes.`,
          });

          if (!result.success) {
            throw new Error(result.error || 'Failed to send SMS');
          }

          logInfo(`SMS OTP sent successfully to ${phoneNumber}`);
        } catch (error) {
          logError('Failed to send SMS OTP', {
            error: error instanceof Error ? error : new Error(String(error)),
            phoneNumber,
          });
          throw error;
        }
      },
    }),

    // Email OTP - Alternative to magic links
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        try {
          logInfo(`Sending email OTP to ${email} for ${type}`);

          await sendOTPEmail({
            email,
            name: email.split('@')[0],
            otp,
            purpose: type || 'verification',
          });

          logInfo(`Email OTP sent successfully to ${email}`);
        } catch (error) {
          logError('Failed to send email OTP', {
            error: error instanceof Error ? error : new Error(String(error)),
            email,
          });
          throw error;
        }
      },
    }),

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

    // Note: Rate limiting is now handled by Better Auth's built-in rateLimit configuration above

    // Security Headers
    securityHeaders({
      enabled: true,
    }),

    // Next.js cookies (must be last)
    nextCookies(),
  ],

  // Error Handling
  onAPIError: {
    throw: false,
    ...createBetterAuthErrorHandler(),
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
