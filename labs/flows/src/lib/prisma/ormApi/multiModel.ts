'use server';

import { prisma } from '#/lib/prisma/client';
import { Tag, TagGroup } from '#/lib/prisma';
import { logInfo, logError } from '@repo/observability';

export type TagWithGroup = Tag & { tagGroup: TagGroup | null };

/**
 * Fetches all tags for a specific instance, including their tag group details.
 * @param instanceId - The instance ID to filter tags by.
 * @returns An array of tags with their associated tag groups.
 */
export const getTagsWithTagGroups = async (instanceId: string): Promise<TagWithGroup[]> => {
  logInfo('Inside getTagsWithTagGroups', { instanceId });
  try {
    const tags = await prisma.tag.findMany({
      where: { 
        deleted: false,
        instanceId: instanceId, // Filter by instance for data isolation
      },
      include: { tagGroup: true }, // Ensure tagGroup is included
    });
    logInfo('Database retrieved tags', { tags, instanceId });
    return tags;
  } catch (error) {
    logError('Database error in getTagsWithTagGroups', { error });
    throw error; // Propagate the error to be handled by the caller
  }
};
