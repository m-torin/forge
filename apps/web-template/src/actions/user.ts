'use server';

import { findUniqueUserAction, updateUserAction } from '@repo/database/prisma';

export async function updateUser(args: any, data?: any) {
  'use server';
  try {
    let updateArgs;
    if (typeof args === 'string') {
      // Called with (id, data)
      updateArgs = { where: { id: args }, data: data };
    } else {
      // Called with data object only - need to get current user ID
      const { auth } = await import('@repo/auth/server/next');
      const session = await auth();
      if (!session?.user?.id) {
        return { data: null, success: false, error: 'Not authenticated' };
      }
      updateArgs = { where: { id: session.user.id }, data: args };
    }

    const result = await updateUserAction(updateArgs);
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function getUser(id: string) {
  'use server';
  const user = await findUniqueUserAction({ where: { id } });
  return { data: user };
}

export async function getCurrentUser() {
  'use server';
  const { auth } = await import('@repo/auth/server/next');
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userResult = await getUser(session.user.id);
  return userResult.data;
}
