'use server';

import { prisma } from '#/lib/prisma/client';
import { logInfo, logError } from '@repo/observability';
import { isDemoMode } from '#/lib/demoMode';
import { env } from '#/root/env';

/**
 * Gets or creates a default instance for the application.
 * In demo mode, returns the demo instance ID.
 * @returns {Promise<string>} - The default instance ID.
 */
export const getDefaultInstanceId = async (): Promise<string> => {
  // In demo mode, always use the demo instance
  if (isDemoMode()) {
    return env.DEMO_INSTANCE_ID;
  }

  const defaultId = env.DEFAULT_INSTANCE_ID;

  try {
    // Try to find existing default instance
    const existingInstance = await prisma.instance.findFirst({
      where: {
        id: defaultId,
      },
    });

    if (existingInstance) {
      return existingInstance.id;
    }

    // Create default instance if it doesn't exist
    const newInstance = await prisma.instance.create({
      data: {
        id: defaultId,
        name: 'Default Instance',
        description: 'Default instance for single-domain deployment',
      },
    });

    logInfo('Created default instance', { instanceId: newInstance.id });
    return newInstance.id;
  } catch (error) {
    logError('Failed to get or create default instance', { error });
    throw new Error('Failed to initialize default instance');
  }
};

/**
 * Gets the instance ID for the current user.
 * TODO: Implement proper user/instance association once auth is set up.
 * @param userId - The user ID (optional for now)
 * @returns {Promise<string>} - The instance ID.
 */
export const getUserInstanceId = async (_userId?: string): Promise<string> => {
  // For now, return the default instance
  // TODO: Implement user-specific instance lookup when auth is ready
  return getDefaultInstanceId();
};