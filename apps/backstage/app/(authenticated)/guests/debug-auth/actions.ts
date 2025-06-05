'use server';

import { headers } from 'next/headers';

import { auth } from '@repo/auth-new/server';
import { createPrismaAdapter } from '@repo/database/prisma';

const adapter = createPrismaAdapter();

// Helper to get database client
async function getDatabase() {
  await adapter.initialize();
  return await adapter.raw('client', {});
}

export interface PrismaResponse<T = any> {
  data: T | null;
  error?: string;
  success: boolean;
}

// Helper to check if user is authenticated
async function checkAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

// User Queries
export async function getUsersFromDatabase(): Promise<PrismaResponse> {
  try {
    await checkAuth();
    const database = await getDatabase();

    const users = await database.user.findMany({
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
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getCurrentUserFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();
    const database = await getDatabase();

    const user = await database.user.findUnique({
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
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getCurrentSessionFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();
    const database = await getDatabase();

    const dbSession = await database.session.findUnique({
      include: {
        user: true,
      },
      where: { id: session.session.id },
    });

    return { data: dbSession, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getSessionsFromDatabase(): Promise<PrismaResponse> {
  try {
    await checkAuth();
    const database = await getDatabase();

    const sessions = await database.session.findMany({
      include: {
        user: true,
      },
      take: 100,
    });

    return { data: sessions, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getAccountsFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();
    const database = await getDatabase();

    const accounts = await database.account.findMany({
      where: { userId: session.user.id },
    });

    return { data: accounts, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Organization Queries
export async function getOrganizationsFromDatabase(): Promise<PrismaResponse> {
  try {
    await checkAuth();
    const database = await getDatabase();

    const organizations = await database.organization.findMany({
      include: {
        invitations: true,
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
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getUserOrganizationsFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();
    const database = await getDatabase();

    const organizations = await database.organization.findMany({
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
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getCurrentOrganizationFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();

    if (!session.session.activeOrganizationId) {
      return { data: null, error: 'No active organization', success: false };
    }

    const database = await getDatabase();

    const organization = await database.organization.findUnique({
      include: {
        invitations: true,
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
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// API Key Queries
export async function getApiKeysFromDatabase(): Promise<PrismaResponse> {
  try {
    await checkAuth();

    const database = await getDatabase();

    const apiKeys = await database.apiKey.findMany({
      include: {
        user: true,
      },
      take: 100,
    });

    return { data: apiKeys, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Two-Factor Queries
export async function getTwoFactorFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();

    const database = await getDatabase();

    const twoFactor = await database.twoFactor.findUnique({
      where: { userId: session.user.id },
    });

    return { data: twoFactor, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Passkey Queries
export async function getPasskeysFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();

    const database = await getDatabase();

    const passkeys = await database.passkey.findMany({
      where: { userId: session.user.id },
    });

    return { data: passkeys, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Database Statistics
export async function getDatabaseStats(): Promise<PrismaResponse> {
  try {
    await checkAuth();

    const database = await getDatabase();

    const [userCount, sessionCount, orgCount, apiKeyCount] = await Promise.all([
      database.user.count(),
      database.session.count(),
      database.organization.count(),
      database.apiKey.count(),
    ]);

    return {
      data: {
        apiKeys: apiKeyCount,
        organizations: orgCount,
        sessions: sessionCount,
        users: userCount,
      },
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}
