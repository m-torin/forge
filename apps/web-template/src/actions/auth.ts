'use server';

import {
  auth,
  changePassword as changePasswordAuth,
  listAccounts,
  unlinkAccount as unlinkAccountAuth,
} from '@repo/auth/server/next';

// Re-export common auth utilities
export async function getSession() {
  'use server';
  const { auth } = await import('@repo/auth/server/next');
  return auth();
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
  try {
    const result = await changePasswordAuth({
      currentPassword,
      newPassword,
    });
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function changePassword(
  args: { currentPassword: string; newPassword: string } | string,
  newPassword?: string,
) {
  'use server';
  if (typeof args === 'object') {
    return updatePassword(args.currentPassword, args.newPassword);
  } else {
    return updatePassword(args, newPassword!);
  }
}

export async function getLinkedAccounts() {
  'use server';
  try {
    const accounts = await listAccounts();
    return { data: accounts, success: true };
  } catch (error: any) {
    return { data: [], success: false, error: error.message };
  }
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

export async function unlinkAccount(accountId: string, _provider: string) {
  'use server';
  try {
    const result = await unlinkAccountAuth(accountId);
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}
