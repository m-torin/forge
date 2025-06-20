'use server';

import {
  auth,
  changePasswordAction,
  listAccountsAction,
  unlinkAccountAction,
  getCurrentUserAction,
  updateUserAction,
  deleteUserAction,
  setPasswordAction,
  banUserAction,
  unbanUserAction,
  listUsersAction,
  listSessionsAction,
  impersonateUserAction,
  stopImpersonatingAction,
  getSessionAction,
  deleteSessionAction,
  createOrganizationAction,
  updateOrganizationAction,
  deleteOrganizationAction,
  listUserOrganizationsAction,
  getActiveOrganizationAction,
  getOrganizationByIdAction,
  listOrganizationInvitationsAction,
  listApiKeysAction,
  createApiKeyAction,
  updateApiKeyAction,
  deleteApiKeyAction,
  getTwoFactorStatusAction,
  enableTwoFactorAction,
  disableTwoFactorAction,
  getTwoFactorBackupCodesAction,
  listPasskeysAction,
  generatePasskeyRegistrationOptionsAction,
  deletePasskeyAction,
  bulkInviteUsersAction,
  bulkCreateApiKeysAction,
  getApiKeyStatisticsAction,
} from '@repo/auth/server/next';

// Re-export all Better Auth server actions
export {
  // Session Management
  getSessionAction,
  deleteSessionAction,

  // User Management
  getCurrentUserAction,
  updateUserAction,
  deleteUserAction,
  changePasswordAction,
  setPasswordAction,
  listAccountsAction,
  unlinkAccountAction,

  // Admin User Operations
  listUsersAction,
  listSessionsAction,
  impersonateUserAction,
  stopImpersonatingAction,
  banUserAction,
  unbanUserAction,

  // Organization Management
  createOrganizationAction,
  updateOrganizationAction,
  deleteOrganizationAction,
  listUserOrganizationsAction,
  getActiveOrganizationAction,
  getOrganizationByIdAction,
  listOrganizationInvitationsAction,

  // API Key Management
  listApiKeysAction,
  createApiKeyAction,
  updateApiKeyAction,
  deleteApiKeyAction,

  // Two-Factor Authentication
  getTwoFactorStatusAction,
  enableTwoFactorAction,
  disableTwoFactorAction,
  getTwoFactorBackupCodesAction,

  // Passkeys
  listPasskeysAction,
  generatePasskeyRegistrationOptionsAction,
  deletePasskeyAction,

  // Bulk Operations
  bulkInviteUsersAction,
  bulkCreateApiKeysAction,
  getApiKeyStatisticsAction,
};

// Re-export common auth utilities
export async function getSession() {
  'use server';
  const result = await getSessionAction();
  return result.success ? result.data : null;
}

// Auth session functions
export async function signIn(provider: string, credentials?: any) {
  'use server';
  try {
    // Use auth.api methods for authentication
    const result = await auth.api.signInEmail({
      email: credentials?.email,
      password: credentials?.password,
    });
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function signOut() {
  'use server';
  try {
    await auth.api.signOut();
    return { data: { message: 'Signed out' }, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function signUp(email: string, password: string, name?: string) {
  'use server';
  try {
    const result = await auth.api.signUpEmail({
      email,
      password,
      name,
    });
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  'use server';
  return changePasswordAction({ currentPassword, newPassword });
}

export async function changePassword(
  args: { currentPassword: string; newPassword: string } | string,
  newPassword?: string,
) {
  'use server';
  if (typeof args === 'object') {
    return changePasswordAction(args);
  } else {
    return changePasswordAction({ currentPassword: args, newPassword: newPassword! });
  }
}

export async function getLinkedAccounts() {
  'use server';
  return listAccountsAction();
}

export async function linkAccount(provider: string, credentials?: any) {
  'use server';
  try {
    // This would typically link an external account
    const result = await auth.api.linkAccount({
      provider,
      ...credentials,
    });
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function unlinkAccount(accountId: string, provider: string) {
  'use server';
  // Better Auth expects providerId in an object
  return unlinkAccountAction({ providerId: provider });
}
