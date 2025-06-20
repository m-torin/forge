'use server';

import { getCurrentUserAction, updateUserAction, getSessionAction } from '@repo/auth/server/next';

export async function updateUser(args: any, data?: any) {
  'use server';

  // If called with two arguments (id, data), we need to check if the user is updating themselves
  if (typeof args === 'string' && data) {
    // This is an admin updating another user - not supported in this user-facing app
    return {
      data: null,
      success: false,
      error: 'Cannot update other users from this interface',
    };
  }

  // Single argument - user updating their own data
  const updateData = typeof args === 'string' ? data : args;

  // Validate the update data
  if (!updateData || typeof updateData !== 'object') {
    return {
      data: null,
      success: false,
      error: 'Invalid update data',
    };
  }

  // Only allow updating specific fields for security
  const allowedFields = ['name', 'email'];
  const filteredData: { name?: string; email?: string } = {};

  for (const field of allowedFields) {
    if (field in updateData) {
      filteredData[field as keyof typeof filteredData] = updateData[field];
    }
  }

  if (Object.keys(filteredData).length === 0) {
    return {
      data: null,
      success: false,
      error: 'No valid fields to update',
    };
  }

  // Use Better Auth's updateUserAction
  return updateUserAction(filteredData);
}

export async function getUser(id: string) {
  'use server';

  // For security, only allow users to get their own data
  const sessionResult = await getSessionAction();
  if (!sessionResult.success || !sessionResult.data?.user) {
    return {
      data: null,
      success: false,
      error: 'Not authenticated',
    };
  }

  if (sessionResult.data.user.id !== id) {
    return {
      data: null,
      success: false,
      error: 'Cannot access other user data',
    };
  }

  // Return the current user's data from session
  return {
    data: sessionResult.data.user,
    success: true,
  };
}

export async function getCurrentUser() {
  'use server';

  const result = await getCurrentUserAction();
  return result.success ? result.data : null;
}
