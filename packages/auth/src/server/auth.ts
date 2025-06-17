/**
 * Better Auth server configuration
 */

import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, apiKey, organization } from 'better-auth/plugins';
import { haveIBeenPwned } from 'better-auth/plugins/haveibeenpwned';
import { magicLink } from 'better-auth/plugins/magic-link';
import { passkey } from 'better-auth/plugins/passkey';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { headers } from 'next/headers';

import { prisma as database } from '@repo/database/prisma';

import { adminAccessController, adminRoles } from '../shared/admin-permissions';
import { createAuthConfig } from '../shared/config';
import {
  sendMagicLinkEmailAuth,
  sendOrganizationInvitation,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../shared/email';
import { ac, roles } from '../shared/permissions';

import { accountSecurityPlugin } from './plugins/account-security';
import { auditLoggerPlugin } from './plugins/audit-logger';
// Security plugins
import { passwordPolicyPlugin } from './plugins/password-policy';
import { rateLimiterPlugin } from './plugins/rate-limiter';

import type { AuthSession, Session } from '../shared/types';

const config = createAuthConfig();

let analytics: any = null;
async function getAnalytics() {
  if (!analytics) {
    const { createServerAnalytics } = await import('@repo/analytics/server');
    const instance = await createServerAnalytics({
      providers: {
        ...(process.env.POSTHOG_API_KEY
          ? {
              posthog: {
                apiKey: process.env.POSTHOG_API_KEY,
                config: {
                  apiHost: process.env.POSTHOG_HOST || 'https://app.posthog.com',
                },
              } as any,
            }
          : {}),
        ...(process.env.NODE_ENV === 'development'
          ? {
              console: {
                enabled: true,
              } as any,
            }
          : {}),
      },
      debug: process.env.NODE_ENV === 'development',
    });
    await instance.initialize();
    analytics = instance;
  }
  return analytics;
}

/**
 * Better Auth instance with full configuration
 */
export const auth: any = betterAuth({
  // Social providers configuration
  socialProviders: {
    github: config.providers.github
      ? {
          clientId: config.providers.github.clientId,
          clientSecret: config.providers.github.clientSecret,
          enabled: true,
        }
      : undefined,
    google: config.providers.google
      ? {
          clientId: config.providers.google.clientId,
          clientSecret: config.providers.google.clientSecret,
          enabled: true,
        }
      : undefined,
  },

  // Database adapter
  database: prismaAdapter(database, {
    provider: 'postgresql',
  }),

  // Database hooks for session management
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Set initial active organization when session is created
          const firstMember = await database.member.findFirst({
            orderBy: { createdAt: 'asc' },
            where: { userId: session.userId },
          });

          if (firstMember) {
            return {
              data: {
                ...session,
                activeOrganizationId: firstMember.organizationId,
              },
            };
          }

          return { data: session };
        },
      },
    },
  },

  // Email and password configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Changed to true for security
    minPasswordLength: 12, // Use better-auth's built-in password validation
    maxPasswordLength: 128,
    sendResetPassword: async ({ url, token, user }) => {
      await sendPasswordResetEmail({ name: user.name, url, email: user.email, token });
    },
  },

  // Email verification configuration
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true, // Changed to true to send verification email on signup
    sendVerificationEmail: async ({ url, token, user }) => {
      await sendVerificationEmail({ name: user.name, url, email: user.email, token });
    },
  },

  // Analytics tracking hooks
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Handle sign-up analytics
      if (ctx.path?.startsWith('/sign-up')) {
        const newSession = ctx.context?.newSession;
        if (newSession?.user) {
          const user = newSession.user;

          const analytics = await getAnalytics();
          await analytics.identify(user.id, {
            avatar: user.image,
            createdAt: new Date(user.createdAt),
            email: user.email,
            firstName: user.name,
          });

          await analytics.track('User Created', {
            userId: user.id,
          });
        }
      }

      // Handle user updates
      if (ctx.path?.startsWith('/update-user')) {
        const user = ctx.context?.user;
        if (user) {
          const analytics = await getAnalytics();
          await analytics.identify(user.id, {
            avatar: user.image,
            createdAt: new Date(user.createdAt),
            email: user.email,
            firstName: user.name,
          });

          await analytics.track('User Updated', {
            userId: user.id,
          });
        }
      }
    }),
  },

  // Plugins configuration
  plugins: [
    nextCookies(),

    // Security plugins
    passwordPolicyPlugin({
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      preventCommonPasswords: true,
      preventEmailInPassword: true,
    }),

    haveIBeenPwned({
      customPasswordCompromisedMessage:
        'This password has been found in data breaches. Please choose a different password for your security.',
    }),

    accountSecurityPlugin({
      maxFailedAttempts: 5,
      lockoutDuration: 30, // 30 minutes
      detectSuspiciousLogin: true,
      notifySuspiciousLogin: true,
    }),

    auditLoggerPlugin({
      enabled: true,
      logSuccessfulAuth: true,
      logFailedAuth: true,
      logPasswordChanges: true,
      logProfileUpdates: true,
      logApiKeyEvents: true,
      logOrganizationEvents: true,
      logAdminActions: true,
      retentionDays: 90,
    }),

    rateLimiterPlugin({
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5, // 5 attempts per 15 minutes
      skipSuccessfulRequests: true,
      message: 'Too many authentication attempts. Please try again later.',
    }),

    // Organization plugin
    ...(config.features.organizations
      ? [
          organization({
            ac,
            allowUserToCreateOrganization: async () => true,
            cancelPendingInvitationsOnReInvite: true,
            creatorRole: 'owner' as const,
            invitationExpiresIn: 48 * 60 * 60, // 48 hours
            invitationLimit: 100,
            membershipLimit: 100,
            organizationLimit: 5,
            roles,
            sendInvitationEmail: sendOrganizationInvitation,

            // Organization lifecycle hooks
            organizationCreation: {
              afterCreate: async ({ organization, user }) => {
                await sendWelcomeEmail({
                  name: user.name || user.email,
                  email: user.email,
                  organizationName: organization.name,
                });

                const analytics = await getAnalytics();
                await analytics.track('Organization Created', {
                  organizationId: organization.id,
                  organizationName: organization.name,
                  organizationSlug: organization.slug,
                  userId: user.id,
                });
              },

              beforeCreate: async ({ organization, user }) => {
                return {
                  data: {
                    ...organization,
                    metadata: {
                      ...organization.metadata,
                      createdAt: new Date().toISOString(),
                      ownerId: user.id,
                    },
                  },
                };
              },
            },

            organizationDeletion: {
              afterDelete: async (data) => {
                const analytics = await getAnalytics();
                analytics.capture({
                  distinctId: data.user.id,
                  event: 'Organization Deleted',
                  properties: {
                    organizationId: data.organization.id,
                  },
                });
              },
            },

            teams: {
              allowRemovingAllTeams: false,
              enabled: config.features.teams,
              maximumTeams: config.teams?.maxTeamsPerOrganization || 10,
            },
          }),
        ]
      : []),

    // API Key plugin
    ...(config.features.apiKeys
      ? [
          apiKey({
            apiKeyHeaders: ['x-api-key'],
            defaultKeyLength: 64,
            defaultPrefix: 'forge_',
            disableKeyHashing: false,
            disableSessionForAPIKeys: false,
            enableMetadata: true,

            keyExpiration: {
              defaultExpiresIn: null,
              disableCustomExpiresTime: false,
              maxExpiresIn: 365 * 24 * 60 * 60, // 1 year
              minExpiresIn: 60 * 60, // 1 hour
            },

            maximumNameLength: 100,
            minimumNameLength: 3,

            permissions: {
              defaultPermissions: async () => {
                const defaultPerms = config.apiKeys?.defaultPermissions || ['read'];
                return defaultPerms.reduce(
                  (acc, perm) => {
                    acc[perm] = ['user', 'organization'];
                    return acc;
                  },
                  {} as Record<string, string[]>,
                );
              },
            },

            rateLimit: {
              enabled: config.apiKeys?.rateLimiting?.enabled || true,
              maxRequests: config.apiKeys?.rateLimiting?.requestsPerMinute || 100,
              timeWindow: 1000 * 60, // 1 minute (converted from requestsPerMinute)
            },

            startingCharactersConfig: {
              charactersLength: 4,
              shouldStore: true,
            },

            customKeyGenerator: async (options) => {
              const { length, prefix } = options;
              const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              let apiKey = prefix ? `${prefix}_` : '';
              for (let i = 0; i < length; i++) {
                apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
              }
              return apiKey;
            },
          }),
        ]
      : []),

    // Admin plugin
    ...(config.features.admin
      ? [
          admin({
            ac: adminAccessController,
            adminRoles: ['admin', 'super-admin', 'moderator', 'support'],
            adminUserIds: [],
            bannedUserMessage:
              'Your account has been suspended. Please contact support for more information.',
            defaultBanExpiresIn: 60 * 60 * 24 * 7, // 7 days
            defaultBanReason: 'Violated terms of service',
            defaultRole: 'user',
            enableImpersonation: config.features.impersonation,
            impersonationSessionDuration: 60 * 60, // 1 hour
            roles: adminRoles,
          }),
        ]
      : []),

    // Two-factor authentication
    ...(config.features.twoFactor
      ? [
          twoFactor({
            issuer: 'Forge Ahead',
          }),
        ]
      : []),

    // Passkey authentication
    ...(config.features.passkeys
      ? [
          passkey({
            authenticatorSelection: {
              residentKey: 'preferred',
              userVerification: 'preferred',
            },
            origin: config.appUrl,
            rpID: new URL(config.appUrl).hostname,
            rpName: 'Forge Ahead',
          }),
        ]
      : []),

    // Magic link authentication
    ...(config.features.magicLink
      ? [
          magicLink({
            expiresIn: 60 * 20, // 20 minutes
            sendMagicLink: async ({ url, email, token }) => {
              await sendMagicLinkEmailAuth({ name: email, url, email, token });
            },
          }),
        ]
      : []),
  ],

  secret: config.secret,

  // Session configuration
  session: {
    cookieCache: {
      enabled: config.features.sessionCaching,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

/**
 * Get current session with user data
 */
export async function getSession(): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  // Better Auth returns { session, user } where session is the database record
  // We need to cast it to our extended Session type that includes activeOrganizationId
  const sessionWithOrg = session.session as Session;

  return {
    activeOrganizationId: sessionWithOrg.activeOrganizationId || undefined,
    session: sessionWithOrg,
    user: session.user,
  };
}
