'use server';

import { headers } from 'next/headers';
import { auth } from './auth';

export interface BetterAuthResponse<T = any> {
  data: T | null;
  error?: string;
  success: boolean;
}

// Session Management
export async function getSession(): Promise<BetterAuthResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return { data: session, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function deleteSession(): Promise<BetterAuthResponse> {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { data: { message: 'Session deleted' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// User Management
export async function getCurrentUser(): Promise<BetterAuthResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { data: null, error: 'No user session', success: false };
    }
    return { data: session.user, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function updateUser(data: {
  name?: string;
  email?: string;
}): Promise<BetterAuthResponse> {
  try {
    const user = await auth.api.updateUser({
      body: data,
      headers: await headers(),
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

export async function deleteUser(): Promise<BetterAuthResponse> {
  try {
    await auth.api.deleteUser({ headers: await headers() });
    return { data: { message: 'User deleted' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Admin User Operations
export async function listUsers(): Promise<BetterAuthResponse> {
  try {
    const users = await auth.api.admin.listUsers({
      headers: await headers(),
      query: { limit: 100 },
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

export async function listSessions(): Promise<BetterAuthResponse> {
  try {
    const sessions = await auth.api.admin.listSessions({
      headers: await headers(),
      query: { limit: 100 },
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

export async function impersonateUser(userId: string): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.admin.impersonateUser({
      body: { userId },
      headers: await headers(),
    });
    return { data: result, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function stopImpersonating(): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.admin.stopImpersonating({
      headers: await headers(),
    });
    return { data: result, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function banUser(userId: string): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.admin.banUser({
      body: { userId },
      headers: await headers(),
    });
    return { data: result, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function unbanUser(userId: string): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.admin.unbanUser({
      body: { userId },
      headers: await headers(),
    });
    return { data: result, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Organization Management
export async function getActiveOrganization(): Promise<BetterAuthResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.session?.activeOrganizationId) {
      return { data: null, error: 'No active organization', success: false };
    }

    const org = await auth.api.getOrganization({
      headers: await headers(),
      query: { organizationId: session.session.activeOrganizationId },
    });
    return { data: org, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function createOrganization(data: {
  name: string;
  slug?: string;
  logo?: string;
  metadata?: Record<string, unknown>;
}): Promise<BetterAuthResponse> {
  try {
    const org = await auth.api.createOrganization({
      body: data,
      headers: await headers(),
    });
    return { data: org, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function checkOrganizationSlug(slug: string): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.checkSlug({
      body: { slug },
      headers: await headers(),
    });
    return { data: result, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function updateOrganization(data: {
  name?: string;
  slug?: string;
}): Promise<BetterAuthResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.session?.activeOrganizationId) {
      return { data: null, error: 'No active organization', success: false };
    }

    const org = await auth.api.updateOrganization({
      body: {
        data,
        organizationId: session.session.activeOrganizationId,
      },
      headers: await headers(),
    });
    return { data: org, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function deleteOrganization(): Promise<BetterAuthResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.session?.activeOrganizationId) {
      return { data: null, error: 'No active organization', success: false };
    }

    await auth.api.deleteOrganization({
      body: { organizationId: session.session.activeOrganizationId },
      headers: await headers(),
    });
    return { data: { message: 'Organization deleted' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function listUserOrganizations(): Promise<BetterAuthResponse> {
  try {
    const orgs = await auth.api.listOrganizations({ headers: await headers() });
    return { data: orgs, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function listAllOrganizations(): Promise<BetterAuthResponse> {
  try {
    // Use the organization helper to get all organizations via database
    const { prisma: database } = await import('@repo/database/prisma');
    const organizations = await (database as any).organization.findMany({
      include: {
        members: {
          include: {
            user: true,
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

export async function getOrganizationById(organizationId: string): Promise<BetterAuthResponse> {
  try {
    const org = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId },
    });
    return { data: org, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function listOrganizationInvitations(
  organizationId: string,
): Promise<BetterAuthResponse> {
  try {
    const invitations = await auth.api.listInvitations({
      headers: await headers(),
      query: { organizationId },
    });
    return { data: invitations, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// API Key Management
export async function listApiKeys(): Promise<BetterAuthResponse> {
  try {
    const keys = await auth.api.listApiKeys({ headers: await headers() });
    return { data: keys, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function createApiKey(name: string): Promise<BetterAuthResponse> {
  try {
    const key = await auth.api.createApiKey({
      body: { name },
      headers: await headers(),
    });
    return { data: key, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function updateApiKey(id: string, name: string): Promise<BetterAuthResponse> {
  try {
    const key = await auth.api.updateApiKey({
      body: { id, name },
      headers: await headers(),
    });
    return { data: key, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function deleteApiKey(id: string): Promise<BetterAuthResponse> {
  try {
    await auth.api.deleteApiKey({
      body: { id },
      headers: await headers(),
    });
    return { data: { message: 'API key deleted' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Two-Factor Authentication
export async function getTwoFactorStatus(): Promise<BetterAuthResponse> {
  try {
    const status = await auth.api.twoFactor.getTwoFactorStatus({ headers: await headers() });
    return { data: status, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function enableTwoFactor(): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.twoFactor.enable({ headers: await headers() });
    return { data: result, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function disableTwoFactor(password: string): Promise<BetterAuthResponse> {
  try {
    await auth.api.twoFactor.disable({
      body: { password },
      headers: await headers(),
    });
    return { data: { message: 'Two-factor disabled' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getTwoFactorBackupCodes(): Promise<BetterAuthResponse> {
  try {
    const codes = await auth.api.twoFactor.getBackupCodes({ headers: await headers() });
    return { data: codes, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

// Passkeys
export async function listPasskeys(): Promise<BetterAuthResponse> {
  try {
    const passkeys = await auth.api.passkey.listUserPasskeys({ headers: await headers() });
    return { data: passkeys, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function generatePasskeyRegistrationOptions(): Promise<BetterAuthResponse> {
  try {
    const options = await auth.api.passkey.generateRegistrationOptions({
      headers: await headers(),
    });
    return { data: options, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function deletePasskey(id: string): Promise<BetterAuthResponse> {
  try {
    await auth.api.passkey.deleteUserPasskey({
      body: { id },
      headers: await headers(),
    });
    return { data: { message: 'Passkey deleted' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}