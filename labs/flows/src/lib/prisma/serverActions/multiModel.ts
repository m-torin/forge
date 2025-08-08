import { TagWithGroup, getTagsWithTagGroups } from '#/lib/prisma/ormApi';
import { logInfo, logError } from '@repo/observability';

/**
 * Server action to fetch all tags with their tag groups for a specific instance.
 * @param instanceId - The instance ID to filter tags by.
 * @returns An array of tags with their associated tag groups.
 */
export const getTagsWithTagGroupsAction = async (instanceId: string): Promise<TagWithGroup[]> => {
  logInfo('Inside getTagsWithTagGroupsAction', { instanceId });
  try {
    const tags = await getTagsWithTagGroups(instanceId);
    logInfo('getTagsWithTagGroups', { tags, instanceId });
    return tags;
  } catch (error) {
    logError('Error in getTagsWithTagGroupsAction', { error });
    // Return empty array for graceful degradation during build
    return [];
  }
};
