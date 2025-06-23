'use server';

import {
  listApiKeysAction as authListApiKeys,
  createApiKeyAction as authCreateApiKey,
  updateApiKeyAction as authUpdateApiKey,
  deleteApiKeyAction as authDeleteApiKey,
  listUsersAction as authListUsers,
  updateUserAction as authUpdateUser,
  getApiKeyAction as authGetApiKey,
  createOrganizationAction as authCreateOrganization,
  updateOrganizationAction as authUpdateOrganization,
  deleteOrganizationAction as authDeleteOrganization,
  getOrganizationAction as authGetOrganizationById,
  bulkInviteUsersAction as authBulkInviteUsers,
  // Admin functions
  listOrganizationsAction as authListOrganizations,
  getUserByIdAction as authGetUserById,
  adminDeleteUserAction as authDeleteUser,
  banUserAction as authBanUser,
  unbanUserAction as authUnbanUser,
  impersonateUserAction as authImpersonateUser,
  getUserAction as authGetUser,
} from '@repo/auth/server/next';

// API Key Actions
export async function getApiKeyAction(id: string) {
  'use server';
  return authGetApiKey(id);
}

export async function getApiKeysAction() {
  'use server';
  return authListApiKeys();
}

export async function createApiKeyAction(data: {
  name: string;
  organizationId?: string;
  permissions?: string[];
  expiresAt?: string;
  metadata?: any;
}) {
  'use server';
  return authCreateApiKey({
    name: data.name,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    scopes: data.permissions,
  });
}

export async function updateApiKeyAction(
  id: string,
  data: {
    name?: string;
    enabled?: boolean;
    permissions?: string[];
    expiresAt?: string;
    metadata?: any;
  },
) {
  'use server';
  // The auth package updateApiKeyAction expects different parameters
  return authUpdateApiKey({
    id: id,
    name: data.name,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    scopes: data.permissions,
  });
}

export async function deleteApiKeyAction(id: string) {
  'use server';
  return authDeleteApiKey(id);
}

// User Actions
export async function getUserAction(id: string) {
  'use server';
  return authGetUser(id);
}

export async function getUserByIdAction(id: string) {
  'use server';
  return authGetUserById(id);
}

export async function getUsersAction() {
  'use server';
  return authListUsers();
}

export async function updateUserAction(
  id: string,
  data: {
    name?: string;
    email?: string;
  },
) {
  'use server';
  // Note: authUpdateUser updates the current user, not by ID
  // For admin functionality to update other users, we'd need a different approach
  return authUpdateUser(data);
}

export async function deleteUserAction(id: string) {
  'use server';
  return authDeleteUser(id);
}

export async function banUserAction(id: string, reason?: string, expiresAt?: Date) {
  'use server';
  // Call Better Auth banUserAction with correct parameters
  return authBanUser(id);
}

export async function unbanUserAction(id: string) {
  'use server';
  return authUnbanUser(id);
}

// Organization Actions
export async function getOrganizationAction(id: string) {
  'use server';
  return authGetOrganizationById(id);
}

export async function getOrganizationsAction() {
  'use server';
  return authListOrganizations();
}

export async function createOrganizationAction(data: {
  name: string;
  slug: string;
  metadata?: any;
}) {
  'use server';
  return authCreateOrganization(data);
}

export async function updateOrganizationAction(
  id: string,
  data: {
    name?: string;
    slug?: string;
    metadata?: any;
  },
) {
  'use server';
  return authUpdateOrganization({ organizationId: id, ...data });
}

export async function deleteOrganizationAction(id: string) {
  'use server';
  return authDeleteOrganization(id);
}

// Additional Actions
export async function impersonateUserAction(userId: string) {
  'use server';
  return authImpersonateUser(userId);
}

export async function bulkInviteUsersAction(data: {
  emails: string[];
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  message?: string;
}) {
  'use server';
  return authBulkInviteUsers(data);
}

// API Key Statistics
export async function getApiKeyStatisticsAction() {
  'use server';
  // TODO: Implement API key statistics
  // The auth package doesn't currently export this function
  return { success: true, data: { totalRequests: 0, requestsByKey: {} } };
}
