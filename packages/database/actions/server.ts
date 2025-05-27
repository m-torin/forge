'use server';

import { headers } from 'next/headers';

import { auth } from '@repo/auth/server';

import { database } from '../index';

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

// Session Queries
export async function getSessionsFromDatabase(): Promise<PrismaResponse> {
  try {
    await checkAuth();

    const sessions = await database.session.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
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

export async function getCurrentSessionFromDatabase(): Promise<PrismaResponse> {
  try {
    const authSession = await checkAuth();

    const session = await database.session.findUnique({
      include: {
        user: true,
      },
      where: { id: authSession.session.id },
    });

    return { data: session, success: true };
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

    const organizations = await database.organization.findMany({
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

    const organization = await database.organization.findUnique({
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

// API Key Queries
export async function getApiKeysFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();

    const apiKeys = await database.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
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

    const twoFactor = await database.twoFactor.findUnique({
      include: {
        backupCodes: true,
      },
      where: {
        userId: session.user.id,
      },
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

    const passkeys = await database.passkey.findMany({
      where: {
        userId: session.user.id,
      },
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

// Account Queries
export async function getAccountsFromDatabase(): Promise<PrismaResponse> {
  try {
    const session = await checkAuth();

    const accounts = await database.account.findMany({
      include: {
        user: true,
      },
      where: {
        userId: session.user.id,
      },
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

// Stats Query
export async function getDatabaseStats(): Promise<PrismaResponse> {
  try {
    await checkAuth();

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
      database.user.count(),
      database.session.count(),
      database.organization.count(),
      database.apiKey.count(),
      database.account.count(),
      database.invitation.count(),
      database.team.count(),
      database.member.count(),
      database.twoFactor.count(),
      database.passkey.count(),
      database.backupCode.count(),
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
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}
