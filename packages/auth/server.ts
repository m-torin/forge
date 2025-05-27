import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, apiKey, organization } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { headers } from 'next/headers';

import { analytics } from '@repo/analytics/posthog/server';
import { database } from '@repo/database';

import { adminAccessController, adminRoles } from './admin-permissions';
import {
  sendOrganizationInvitation,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from './email';
import { keys } from './keys';
import { ac, roles } from './permissions';

// Add explicit type annotation to fix TypeScript error
export const auth: any = betterAuth({
  database: prismaAdapter(database, {
    provider: 'postgresql',
  }),
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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want to require email verification
    sendResetPassword: async ({ url, token, user }, request) => {
      await sendPasswordResetEmail({ url, token, user });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: false, // Set to true to automatically send verification email on signup
    sendVerificationEmail: async ({ url, token, user }, request) => {
      await sendVerificationEmail({ url, token, user });
    },
  },
  // Analytics tracking using Better Auth hooks
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Handle sign-up analytics
      if (ctx.path?.startsWith('/sign-up')) {
        const newSession = ctx.context?.newSession;
        if (newSession?.user) {
          const user = newSession.user;
          // Track user creation
          analytics.identify({
            distinctId: user.id,
            properties: {
              avatar: user.image,
              createdAt: new Date(user.createdAt),
              email: user.email,
              firstName: user.name,
            },
          });

          analytics.capture({
            distinctId: user.id,
            event: 'User Created',
          });
        }
      }

      // Handle user updates
      if (ctx.path?.startsWith('/update-user')) {
        const user = ctx.context?.user;
        if (user) {
          // Track user updates
          analytics.identify({
            distinctId: user.id,
            properties: {
              avatar: user.image,
              createdAt: new Date(user.createdAt),
              email: user.email,
              firstName: user.name,
            },
          });

          analytics.capture({
            distinctId: user.id,
            event: 'User Updated',
          });
        }
      }
    }),
  },
  plugins: [
    nextCookies(),
    organization({
      // Permissions and access control
      ac,
      roles,

      allowUserToCreateOrganization: async (user) => {
        // You can implement custom logic here
        // For example, check if user has a pro subscription
        return true;
      },
      creatorRole: 'owner', // Default role for organization creators
      // Organization creation limits
      organizationLimit: 5,

      cancelPendingInvitationsOnReInvite: true,
      invitationExpiresIn: 48 * 60 * 60, // 48 hours in seconds
      invitationLimit: 100,
      // Member and invitation settings
      membershipLimit: 100,

      // Email configuration
      sendInvitationEmail: async (data) => {
        await sendOrganizationInvitation(data);
      },

      // Organization lifecycle hooks
      organizationCreation: {
        afterCreate: async ({ member, organization, user }, request) => {
          // Send welcome email to the organization creator
          await sendWelcomeEmail({
            name: user.name || user.email,
            email: user.email,
            organizationName: organization.name,
          });

          // Track organization creation
          analytics.capture({
            distinctId: user.id,
            event: 'Organization Created',
            properties: {
              organizationId: organization.id,
              organizationName: organization.name,
              organizationSlug: organization.slug,
            },
          });
        },
        beforeCreate: async ({ organization, user }, request) => {
          // Add custom metadata before creation
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

      // Organization deletion hooks
      organizationDeletion: {
        afterDelete: async (data, request) => {
          // Track organization deletion
          analytics.capture({
            distinctId: data.user.id,
            event: 'Organization Deleted',
            properties: {
              organizationId: data.organization.id,
            },
          });
        },
        beforeDelete: async (data, request) => {
          // Log deletion attempt
          console.log(`Attempting to delete organization ${data.organization.id}`);
        },
      },

      // Teams configuration
      teams: {
        allowRemovingAllTeams: false,
        enabled: true,
        maximumTeams: 10,
      },
    }),
    apiKey({
      // Custom API key validation
      customAPIKeyValidator: ({ ctx, key }) => {
        // Add any custom validation logic here
        // For example, check if key has a specific format
        return true; // Accept all keys by default
      },
      apiKeyHeaders: ['x-api-key'],
      // Custom API key generation (optional)
      customKeyGenerator: async (options) => {
        const { length, prefix } = options;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let apiKey = prefix ? `${prefix}_` : '';
        for (let i = 0; i < length; i++) {
          apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return apiKey;
      },
      defaultKeyLength: 64,
      defaultPrefix: 'forge_',
      disableKeyHashing: false, // Keep keys hashed for security
      // Disable session creation for API keys
      disableSessionForAPIKeys: false,
      enableMetadata: true,
      keyExpiration: {
        defaultExpiresIn: null, // No expiration by default
        disableCustomExpiresTime: false,
        maxExpiresIn: 365 * 24 * 60 * 60, // 1 year maximum
        minExpiresIn: 60 * 60, // 1 hour minimum
      },
      maximumNameLength: 100,
      maximumPrefixLength: 12,
      minimumNameLength: 3,
      minimumPrefixLength: 3,
      permissions: {
        defaultPermissions: async (userId, ctx) => {
          // Default permissions for new API keys
          return {
            read: ['user', 'organization'],
            write: ['user'],
          };
        },
      },
      rateLimit: {
        enabled: true,
        maxRequests: 100, // 100 requests per day by default
        timeWindow: 1000 * 60 * 60 * 24, // 1 day
      },
      startingCharactersConfig: {
        charactersLength: 4,
        shouldStore: true,
      },
    }),
    admin({
      ac: adminAccessController,
      adminRoles: ['admin', 'super-admin', 'moderator', 'support'],
      adminUserIds: [], // Can be populated with specific user IDs
      bannedUserMessage:
        'Your account has been suspended. Please contact support for more information.',
      defaultBanExpiresIn: 60 * 60 * 24 * 7, // 7 days
      defaultBanReason: 'Violated terms of service',
      defaultRole: 'user',
      impersonationSessionDuration: 60 * 60, // 1 hour
      roles: adminRoles,
    }),
    twoFactor({
      issuer: 'Forge Ahead', // Your app name
    }),
    passkey({
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      rpID: process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : 'localhost',
      rpName: 'Forge Ahead',
    }),
  ],
  secret: keys().BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
  },
});

// Convenience functions for server-side auth
export const currentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
};

export const getSession = async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
};
