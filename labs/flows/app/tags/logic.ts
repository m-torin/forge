// logic.ts
import type { LocalTagGroup } from './types';
import { getTagsWithTagGroupsAction } from '#/lib/prisma';
import type { MantineColor } from '@mantine/core';
import { TagWithGroup } from '#/lib/prisma/ormApi';
import { logError } from '@repo/observability';

/** Builds tag groups from an array of tags */
export const buildTagGroups = (tags: TagWithGroup[]): LocalTagGroup[] => {
  const groupMap: Record<string, LocalTagGroup> = {};

  tags.forEach((tag) => {
    const groupId = tag.tagGroup?.id ?? 'ungrouped';
    const groupName = tag.tagGroup?.name ?? 'Ungrouped';
    const groupColor = (tag.tagGroup?.color as MantineColor) ?? 'gray';

    if (!groupMap[groupId]) {
      groupMap[groupId] = {
        id: groupId,
        name: groupName,
        color: groupColor,
        tags: [],
      };
    }
    groupMap[groupId].tags.push(tag);
  });

  return Object.values(groupMap);
};

/** Refreshes tags and tag groups */
export const refreshTags = async (
  setTagGroups: React.Dispatch<React.SetStateAction<LocalTagGroup[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  buildTagGroupsFunc: (tags: TagWithGroup[]) => LocalTagGroup[],
  instanceId: string, // Add instanceId parameter for proper data isolation
): Promise<void> => {
  try {
    const tags = await getTagsWithTagGroupsAction(instanceId);
    const groups = buildTagGroupsFunc(tags);
    setTagGroups(groups);
  } catch (err) {
    logError('Failed to refresh tags', { err });
    setError((err as Error).message);
  }
};
