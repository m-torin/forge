'use server';

import { headers } from 'next/headers';

import { auth } from './auth';
import { bulkInviteUsers as bulkInviteUsersOrg } from './organizations/management';
import {
  bulkCreateApiKeys as bulkCreateApiKeysService,
  getApiKeyStatistics as getApiKeyStatisticsService,
} from './api-keys/service-auth';

import type { Session } from '../shared/types';

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

export async function deleteUser(userId?: string): Promise<BetterAuthResponse> {
  try {
    if (userId) {
      // Admin deleting a specific user
      await auth.api.deleteUser({
        body: { userId },
        headers: await headers(),
      });
    } else {
      // User deleting their own account
      await auth.api.deleteUser({
        body: {},
        headers: await headers(),
      });
    }
    return { data: { message: 'User deleted' }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.revokeOtherSessions ?? true,
      },
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

export async function setPassword(data: { newPassword: string }): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.setPassword({
      body: data,
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

export async function listAccounts(): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.listUserAccounts({
      headers: await headers(),
    });
    return { data: result || [], success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function unlinkAccount(provider: string): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.unlinkAccount({
      body: { providerId: provider },
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

// Admin User Operations
export async function listUsers(): Promise<BetterAuthResponse> {
  try {
    const users = await auth.api.listUsers({
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
    const sessions = await auth.api.listSessions({
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
    const result = await auth.api.impersonateUser({
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
    const result = await auth.api.stopImpersonating({
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
    const result = await auth.api.banUser({
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
    const result = await auth.api.unbanUser({
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
    const sessionWithOrg = session?.session as Session;
    if (!sessionWithOrg?.activeOrganizationId) {
      return { data: null, error: 'No active organization', success: false };
    }

    const org = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId: sessionWithOrg.activeOrganizationId },
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
    const orgData = {
      ...data,
      slug:
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
    };

    const org = await auth.api.createOrganization({
      body: orgData,
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
    const result = await auth.api.checkOrganizationSlug({
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
    const sessionWithOrg = session?.session as Session;
    if (!sessionWithOrg?.activeOrganizationId) {
      return { data: null, error: 'No active organization', success: false };
    }

    const org = await auth.api.updateOrganization({
      body: {
        data,
        organizationId: sessionWithOrg.activeOrganizationId,
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

export async function deleteOrganization(organizationId?: string): Promise<BetterAuthResponse> {
  try {
    let orgIdToDelete = organizationId;

    // If no organizationId provided, use the active organization
    if (!orgIdToDelete) {
      const session = await auth.api.getSession({ headers: await headers() });
      const sessionWithOrg = session?.session as Session;
      if (!sessionWithOrg?.activeOrganizationId) {
        return {
          data: null,
          error: 'No organization ID provided and no active organization',
          success: false,
        };
      }
      orgIdToDelete = sessionWithOrg.activeOrganizationId;
    }

    await auth.api.deleteOrganization({
      body: { organizationId: orgIdToDelete },
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
    // Use better-auth admin API to list all organizations
    const organizations = await auth.api.listAllOrganizations({
      headers: await headers(),
      query: { limit: 1000 }, // Admin query to get all organizations
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

export async function createApiKey(data: {
  name: string;
  organizationId?: string;
  permissions?: string[];
  expiresAt?: string;
  metadata?: any;
}): Promise<BetterAuthResponse> {
  try {
    const body: any = { name: data.name };

    if (data.organizationId) body.organizationId = data.organizationId;
    if (data.permissions && data.permissions.length > 0) body.permissions = data.permissions;
    if (data.expiresAt) body.expiresAt = data.expiresAt;
    if (data.metadata) body.metadata = data.metadata;

    const key = await auth.api.createApiKey({
      body,
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

export async function updateApiKey(
  id: string,
  data: { name?: string; enabled?: boolean },
): Promise<BetterAuthResponse> {
  try {
    const updateData: any = { keyId: id };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;

    const key = await auth.api.updateApiKey({
      body: updateData,
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
      body: { keyId: id },
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
    // Check if user has 2FA enabled by getting session and checking user properties
    const session = await auth.api.getSession({ headers: await headers() });
    const twoFactorEnabled = session?.user?.twoFactorEnabled || false;
    return { data: { enabled: twoFactorEnabled }, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function enableTwoFactor(password: string): Promise<BetterAuthResponse> {
  try {
    const result = await auth.api.enableTwoFactor({
      body: { password },
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

export async function disableTwoFactor(password: string): Promise<BetterAuthResponse> {
  try {
    await auth.api.disableTwoFactor({
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
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { data: null, error: 'User not authenticated', success: false };
    }

    const codes = await auth.api.viewBackupCodes({
      body: { userId: session.user.id },
      headers: await headers(),
    });
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
    const passkeys = await auth.api.listPasskeys({ headers: await headers() });
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
    const options = await auth.api.generatePasskeyRegistrationOptions({
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
    await auth.api.deletePasskey({
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

// Bulk Operations
export async function bulkInviteUsers(data: {
  emails: string[];
  organizationId: string;
  role?: 'owner' | 'admin' | 'member';
  message?: string;
}): Promise<BetterAuthResponse> {
  try {
    const result = await bulkInviteUsersOrg({
      ...data,
      role: data.role || 'member', // Provide default role
    });
    return { data: result, success: result.success };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function bulkCreateApiKeys(data: {
  keys: Array<{
    name: string;
    permissions?: string[];
    expiresAt?: string;
    metadata?: any;
  }>;
  organizationId?: string;
}): Promise<BetterAuthResponse> {
  try {
    const result = await bulkCreateApiKeysService(data);
    return { data: result, success: result.success };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}

export async function getApiKeyStatistics(): Promise<BetterAuthResponse> {
  try {
    const result = await getApiKeyStatisticsService();
    return { data: result.data, success: result.success };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    };
  }
}
