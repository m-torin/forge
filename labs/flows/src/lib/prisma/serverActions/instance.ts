'use server';

// Domain imports removed - no longer needed
import {
  createInstance,
  getInstanceById,
  getInstancesByUser,
} from '#/lib/prisma/ormApi';
import { Instance } from '@prisma/client';
import { logInfo } from '@repo/observability';


/**
 * Fetches an instance by its ID.
 * @param {string} instanceId - The ID of the instance.
 * @returns {Promise<ReturnType<typeof getInstanceById>>} - A promise that resolves to the instance with its nodes and edges.
 */
export const getInstanceByIdAction = async (
  instanceId: string,
): Promise<ReturnType<typeof getInstanceById>> => {
  logInfo('getInstanceByIdAction', { instanceId });
  return await getInstanceById(instanceId);
};

/**
 * Fetches all instances associated with a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Instance[]>} - A promise that resolves to the user's instances.
 */
export const getInstancesByUserAction = async (
  userId: string,
): Promise<Instance[]> => {
  logInfo('getInstancesByUserAction', { userId });
  return await getInstancesByUser(userId);
};

/**
 * Creates a new instance with the provided details.
 * @param {string} instanceName - The name of the instance.
 * @param {string} userId - The ID of the user creating the instance.
 * @returns {Promise<ReturnType<typeof createInstance>>} - A promise that resolves to the newly created instance.
 */
export const createInstanceAction = async (
  instanceName: string,
  userId: string,
): Promise<ReturnType<typeof createInstance>> => {
  logInfo('createInstanceAction', { instanceName, userId });

  const newInstance = await createInstance(
    instanceName,
    userId,
  );

  if (!newInstance) {
    throw new Error('Failed to create instance');
  }

  // Domain setup removed - no longer needed
  logInfo('Instance created successfully', { instanceId: newInstance.id });

  return newInstance;
};

