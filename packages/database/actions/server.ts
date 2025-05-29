'use server';

import { headers } from 'next/headers';

import { auth } from '@repo/auth/server';

import { database } from '../index';
import { DatabaseResponse } from '../types';
import { prisma } from '../prisma';
import { Database } from '../database';

// Helper to check if user is authenticated
async function checkAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

// Get the appropriate database client based on provider
function getDbClient() {
  // For direct Prisma operations, we use the Prisma client
  // This is a temporary solution during migration to support both providers
  if ((database as Database).getProvider() === 'prisma') {
    return prisma;
  }

  // Otherwise use the abstraction layer
  return database;
}

// User Queries
export async function getUsersFromDatabase(): Promise<DatabaseResponse> {
  try {
    await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const users = await db.user.findMany({
        include: {
          accounts: true,
          members: {
            include: {
              organization: true,
            },
          },
          sessions: true,
        },
        take: 100,
      });
      return { data: users, success: true };
    } else {
      // Using abstraction layer
      const users = await db.findMany('user', {
        include: {
          accounts: true,
          members: {
            include: {
              organization: true,
            },
          },
          sessions: true,
        },
        take: 100,
      });
      return { data: users, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getCurrentUserFromDatabase(): Promise<DatabaseResponse> {
  try {
    const session = await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const user = await db.user.findUnique({
        include: {
          accounts: true,
          members: {
            include: {
              organization: true,
            },
          },
          sessions: true,
        },
        where: { id: session.user.id },
      });
      return { data: user, success: true };
    } else {
      // Using abstraction layer
      const user = await db.findUnique('user', {
        include: {
          accounts: true,
          members: {
            include: {
              organization: true,
            },
          },
          sessions: true,
        },
        where: { id: session.user.id },
      });
      return { data: user, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Session Queries
export async function getSessionsFromDatabase(): Promise<DatabaseResponse> {
  try {
    await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const sessions = await db.session.findMany({
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });
      return { data: sessions, success: true };
    } else {
      // Using abstraction layer
      const sessions = await db.findMany('session', {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });
      return { data: sessions, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getCurrentSessionFromDatabase(): Promise<DatabaseResponse> {
  try {
    const authSession = await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const session = await db.session.findUnique({
        include: {
          user: true,
        },
        where: { id: authSession.session.id },
      });
      return { data: session, success: true };
    } else {
      // Using abstraction layer
      const session = await db.findUnique('session', {
        include: {
          user: true,
        },
        where: { id: authSession.session.id },
      });
      return { data: session, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Organization Queries
export async function getOrganizationsFromDatabase(): Promise<DatabaseResponse> {
  try {
    await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const organizations = await db.organization.findMany({
        include: {
          members: {
            include: {
              user: true,
            },
          },
          teams: true,
        },
        take: 100,
      });
      return { data: organizations, success: true };
    } else {
      // Using abstraction layer
      const organizations = await db.findMany('organization', {
        include: {
          members: {
            include: {
              user: true,
            },
          },
          teams: true,
        },
        take: 100,
      });
      return { data: organizations, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getCurrentOrganizationFromDatabase(): Promise<DatabaseResponse> {
  try {
    const session = await checkAuth();
    const db = getDbClient();

    if (!session.session.activeOrganizationId) {
      return { data: null, error: 'No active organization', success: false };
    }

    if (db === prisma) {
      // Using Prisma directly
      const organization = await db.organization.findUnique({
        include: {
          members: {
            include: {
              user: true,
            },
          },
          teams: true,
        },
        where: { id: session.session.activeOrganizationId },
      });
      return { data: organization, success: true };
    } else {
      // Using abstraction layer
      const organization = await db.findUnique('organization', {
        include: {
          members: {
            include: {
              user: true,
            },
          },
          teams: true,
        },
        where: { id: session.session.activeOrganizationId },
      });
      return { data: organization, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getUserOrganizationsFromDatabase(): Promise<DatabaseResponse> {
  try {
    const session = await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const organizations = await db.organization.findMany({
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
        where: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      });
      return { data: organizations, success: true };
    } else {
      // Using abstraction layer
      const organizations = await db.findMany('organization', {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
        where: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      });
      return { data: organizations, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// API Key Queries
export async function getApiKeysFromDatabase(): Promise<DatabaseResponse> {
  try {
    const session = await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const apiKeys = await db.apiKey.findMany({
        where: {
          userId: session.user.id,
        },
      });
      return { data: apiKeys, success: true };
    } else {
      // Using abstraction layer
      const apiKeys = await db.findMany('apiKey', {
        where: {
          userId: session.user.id,
        },
      });
      return { data: apiKeys, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Two-Factor Queries
export async function getTwoFactorFromDatabase(): Promise<DatabaseResponse> {
  try {
    const session = await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const twoFactor = await db.twoFactor.findUnique({
        include: {
          backupCodes: true,
        },
        where: {
          userId: session.user.id,
        },
      });
      return { data: twoFactor, success: true };
    } else {
      // Using abstraction layer
      const twoFactor = await db.findUnique('twoFactor', {
        include: {
          backupCodes: true,
        },
        where: {
          userId: session.user.id,
        },
      });
      return { data: twoFactor, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Passkey Queries
export async function getPasskeysFromDatabase(): Promise<DatabaseResponse> {
  try {
    const session = await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const passkeys = await db.passkey.findMany({
        where: {
          userId: session.user.id,
        },
      });
      return { data: passkeys, success: true };
    } else {
      // Using abstraction layer
      const passkeys = await db.findMany('passkey', {
        where: {
          userId: session.user.id,
        },
      });
      return { data: passkeys, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Account Queries
export async function getAccountsFromDatabase(): Promise<DatabaseResponse> {
  try {
    const session = await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const accounts = await db.account.findMany({
        include: {
          user: true,
        },
        where: {
          userId: session.user.id,
        },
      });
      return { data: accounts, success: true };
    } else {
      // Using abstraction layer
      const accounts = await db.findMany('account', {
        include: {
          user: true,
        },
        where: {
          userId: session.user.id,
        },
      });
      return { data: accounts, success: true };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Stats Query
export async function getDatabaseStats(): Promise<DatabaseResponse> {
  try {
    await checkAuth();
    const db = getDbClient();

    if (db === prisma) {
      // Using Prisma directly
      const [
        userCount,
        sessionCount,
        organizationCount,
        apiKeyCount,
        accountCount,
        invitationCount,
        teamCount,
        memberCount,
        twoFactorCount,
        passkeyCount,
        backupCodeCount,
      ] = await Promise.all([
        db.user.count(),
        db.session.count(),
        db.organization.count(),
        db.apiKey.count(),
        db.account.count(),
        db.invitation.count(),
        db.team.count(),
        db.member.count(),
        db.twoFactor.count(),
        db.passkey.count(),
        db.backupCode.count(),
      ]);

      return {
        data: {
          accountCount,
          apiKeyCount,
          backupCodeCount,
          invitationCount,
          memberCount,
          organizationCount,
          passkeyCount,
          sessionCount,
          teamCount,
          twoFactorCount,
          userCount,
        },
        success: true,
      };
    } else {
      // Using abstraction layer
      const [
        userCount,
        sessionCount,
        organizationCount,
        apiKeyCount,
        accountCount,
        invitationCount,
        teamCount,
        memberCount,
        twoFactorCount,
        passkeyCount,
        backupCodeCount,
      ] = await Promise.all([
        db.count('user'),
        db.count('session'),
        db.count('organization'),
        db.count('apiKey'),
        db.count('account'),
        db.count('invitation'),
        db.count('team'),
        db.count('member'),
        db.count('twoFactor'),
        db.count('passkey'),
        db.count('backupCode'),
      ]);

      return {
        data: {
          accountCount,
          apiKeyCount,
          backupCodeCount,
          invitationCount,
          memberCount,
          organizationCount,
          passkeyCount,
          sessionCount,
          teamCount,
          twoFactorCount,
          userCount,
        },
        success: true,
      };
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}
