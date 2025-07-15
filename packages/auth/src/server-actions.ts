/**
 * Server actions for Better Auth
 * This file exports all server actions that can be used in Next.js server components
 */

'use server';

import { headers } from 'next/headers';
import { auth } from './shared/auth';

// User Management Actions
export async function getCurrentUserAction() {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

export async function updateUserAction(data: any) {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error('Not authenticated');

  return auth.api.updateUser({
    body: {
      ...data,
      userId: session.user.id,
    },
    headers: await headers(),
  });
}

export async function deleteUserAction() {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error('Not authenticated');

  return auth.api.deleteUser({
    headers: await headers(),
  });
}

// Password Management
export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) {
  'use server';
  return auth.api.changePassword({
    body: data,
    headers: await headers(),
  });
}

export async function setPasswordAction(newPassword: string) {
  'use server';
  return auth.api.setPassword({
    body: { newPassword },
    headers: await headers(),
  });
}

// Session Management
export async function getSessionAction() {
  'use server';
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function deleteSessionAction(sessionId: string) {
  'use server';
  return auth.api.revokeSession({
    body: { sessionId },
    headers: await headers(),
  });
}

export async function listSessionsAction() {
  'use server';
  return auth.api.listSessions({
    headers: await headers(),
  });
}

// Account Management
export async function listAccountsAction() {
  'use server';
  return auth.api.listAccounts({
    headers: await headers(),
  });
}

export async function unlinkAccountAction(data: { providerId: string }) {
  'use server';
  return auth.api.unlinkAccount({
    body: data,
    headers: await headers(),
  });
}

// Organization Management
export async function createOrganizationAction(data: {
  name: string;
  slug?: string;
  logo?: string;
}) {
  'use server';
  return auth.api.createOrganization({
    body: data,
    headers: await headers(),
  });
}

export async function updateOrganizationAction(data: {
  organizationId?: string;
  name?: string;
  slug?: string;
  logo?: string;
  metadata?: any;
}) {
  'use server';
  return auth.api.updateOrganization({
    body: data,
    headers: await headers(),
  });
}

export async function deleteOrganizationAction(organizationId: string) {
  'use server';
  return auth.api.deleteOrganization({
    body: { organizationId },
    headers: await headers(),
  });
}

export async function listUserOrganizationsAction() {
  'use server';
  return auth.api.listOrganizations({
    headers: await headers(),
  });
}

export async function getActiveOrganizationAction() {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (session as any)?.session?.activeOrganizationId || null;
}

export async function getOrganizationByIdAction(organizationId: string) {
  'use server';
  return auth.api.getOrganization({
    query: { organizationId },
    headers: await headers(),
  });
}

export async function setActiveOrganizationAction(organizationId: string) {
  'use server';
  return auth.api.setActiveOrganization({
    body: { organizationId },
    headers: await headers(),
  });
}

export async function listOrganizationInvitationsAction(organizationId?: string) {
  'use server';
  return auth.api.listInvitations({
    query: organizationId ? { organizationId } : {},
    headers: await headers(),
  });
}

// API Key Management
export async function listApiKeysAction() {
  'use server';
  return auth.api.listApiKeys({
    headers: await headers(),
  });
}

export async function createApiKeyAction(data: {
  name: string;
  expiresAt?: Date;
  scopes?: string[];
}) {
  'use server';
  return auth.api.createApiKey({
    body: data,
    headers: await headers(),
  });
}

export async function updateApiKeyAction(data: {
  id: string;
  name?: string;
  expiresAt?: Date;
  scopes?: string[];
}) {
  'use server';
  return auth.api.updateApiKey({
    body: data,
    headers: await headers(),
  });
}

export async function deleteApiKeyAction(id: string) {
  'use server';
  return auth.api.deleteApiKey({
    body: { id },
    headers: await headers(),
  });
}

export async function getApiKeyAction(id: string) {
  'use server';
  return auth.api.getApiKey({
    query: { id },
    headers: await headers(),
  });
}

export async function bulkCreateApiKeysAction(data: {
  count: number;
  prefix?: string;
  expiresAt?: Date;
  scopes?: string[];
}) {
  'use server';
  const results = [];
  for (let i = 0; i < data.count; i++) {
    const result = await createApiKeyAction({
      name: `${data.prefix || 'API Key'} ${i + 1}`,
      expiresAt: data.expiresAt,
      scopes: data.scopes,
    });
    results.push(result);
  }
  return results;
}

export async function getApiKeyStatisticsAction() {
  'use server';
  // This would need custom implementation to gather statistics
  const keys = await listApiKeysAction();
  return {
    total: keys.length || 0,
    active: keys.filter((k: any) => !k.expiresAt || new Date(k.expiresAt) > new Date()).length || 0,
    expired:
      keys.filter((k: any) => k.expiresAt && new Date(k.expiresAt) <= new Date()).length || 0,
  };
}

// Two-Factor Authentication
export async function getTwoFactorStatusAction() {
  'use server';
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return { enabled: session?.user?.twoFactorEnabled || false };
}

export async function enableTwoFactorAction() {
  'use server';
  return auth.api.enableTwoFactor({
    headers: await headers(),
  });
}

export async function disableTwoFactorAction(data: { password: string }) {
  'use server';
  return auth.api.disableTwoFactor({
    body: data,
    headers: await headers(),
  });
}

export async function getTwoFactorBackupCodesAction() {
  'use server';
  return auth.api.getTwoFactorBackupCodes({
    headers: await headers(),
  });
}

// Passkey Management
export async function listPasskeysAction() {
  'use server';
  return auth.api.listPasskeys({
    headers: await headers(),
  });
}

export async function generatePasskeyRegistrationOptionsAction() {
  'use server';
  return auth.api.generatePasskeyRegistrationOptions({
    headers: await headers(),
  });
}

export async function deletePasskeyAction(passkeyId: string) {
  'use server';
  return auth.api.deletePasskey({
    body: { passkeyId },
    headers: await headers(),
  });
}

// Admin Actions
export async function banUserAction(userId: string) {
  'use server';
  return auth.api.admin.banUser({
    body: { userId },
    headers: await headers(),
  });
}

export async function unbanUserAction(userId: string) {
  'use server';
  return auth.api.admin.unbanUser({
    body: { userId },
    headers: await headers(),
  });
}

export async function listUsersAction(query?: {
  limit?: number;
  offset?: number;
  search?: string;
}) {
  'use server';
  // Better Auth doesn't have a built-in listUsers method
  // We need to query the database directly
  try {
    const { prisma } = await import('@repo/database/prisma');

    const where = query?.search
      ? {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' as const } },
            { name: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      skip: query?.offset || 0,
      take: query?.limit || 100,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        banned: true,
      },
    });

    return { success: true, data: users };
  } catch (error: any) {
    throw new Error(`Failed to list users: ${error.message || error}`);
  }
}

export async function impersonateUserAction(userId: string) {
  'use server';
  return auth.api.admin.impersonateUser({
    body: { userId },
    headers: await headers(),
  });
}

export async function stopImpersonatingAction() {
  'use server';
  return auth.api.admin.stopImpersonating({
    headers: await headers(),
  });
}

export async function bulkInviteUsersAction(data: {
  emails: string[];
  role?: string;
  organizationId?: string;
}) {
  'use server';
  const results = [];
  for (const email of data.emails) {
    try {
      const result = await auth.api.sendInvitation({
        body: {
          email,
          role: data.role,
          organizationId: data.organizationId,
        },
        headers: await headers(),
      });
      results.push({ email, success: true, result });
    } catch (error) {
      throw new Error(`Failed to invite user ${email}: ${error}`);
    }
  }
  return results;
}

// Admin User Management Actions
export async function adminDeleteUserAction(userId: string) {
  'use server';
  return auth.api.removeUser({
    body: { userId },
    headers: await headers(),
  });
}

export async function createUserAction(data: {
  email: string;
  name?: string;
  password?: string;
  role?: string;
}) {
  'use server';
  return auth.api.createUser({
    body: {
      email: data.email,
      name: data.name ?? data.email.split('@')[0],
      password: data.password || crypto.randomUUID().substring(0, 12),
      role: data.role as any,
    },
    headers: await headers(),
  });
}

export async function setUserRoleAction(userId: string, role: string) {
  'use server';
  return auth.api.setRole({
    body: { userId, role },
    headers: await headers(),
  });
}

export async function revokeUserSessionsAction(userId: string) {
  'use server';
  return auth.api.revokeUserSessions({
    body: { userId },
    headers: await headers(),
  });
}

// Admin Organization Management Actions
export async function listOrganizationsAction(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}) {
  'use server';
  return auth.api.listOrganizations({
    headers: await headers(),
    body: {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      ...(options?.search && { search: options.search }),
    },
  });
}

export async function getOrganizationAction(organizationId: string) {
  'use server';
  return auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationId },
  });
}

// Team Management actions are available in the teams export path
// Service Account Management actions are available in the api-keys export path
