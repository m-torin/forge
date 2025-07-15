'use server';

import { Prisma, User } from '@prisma/client';
import { readUser, updateUser } from '#/lib/prisma/ormApi';
import { logInfo, logError } from '@repo/observability';

/**
 * Fetches a user by their unique identifier.
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<User | null>} - A promise that resolves to the user or null if not found.
 */
export const readUserAction = async (userId: string): Promise<User | null> => {
  logInfo('readUserAction', { userId });
  try {
    const user = await readUser(userId);
    logInfo('Fetched user', { user });
    return user;
  } catch (error) {
    logError('Error in readUserAction', { error });
    return null;
  }
};

/**
 * Updates a user's details.
 * @param {string} userId - The unique identifier of the user.
 * @param {Prisma.UserUpdateInput} data - The data to update the user with.
 * @returns {Promise<User | null>} - A promise that resolves to the updated user or null if not found.
 */
export const updateUserAction = async (
  userId: string,
  data: Prisma.UserUpdateInput,
): Promise<User | null> => {
  logInfo('updateUserAction', { userId, data });
  try {
    const updatedUser = await updateUser(userId, data);
    return updatedUser;
  } catch (error) {
    logError('Error in updateUserAction', { error });
    return null;
  }
};
