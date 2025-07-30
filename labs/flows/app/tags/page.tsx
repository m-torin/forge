// page.tsx
import {
  getTagsWithTagGroupsAction,
  getUserInstanceId,
} from '#/lib/prisma';
import { Prisma } from '@prisma/client';
import { TagsUI } from './UI';

import { buildTagGroups } from './logic';

async function TagsPage() {
  // Get the instance ID for the current user
  const instanceId = await getUserInstanceId();
  
  // For now, we'll get all tags without filtering by instance
  // Get tags filtered by instance ID for proper data isolation
  const tags = await getTagsWithTagGroupsAction(instanceId);
  if (!Array.isArray(tags)) {
    throw new Error('Fetched tags is not an array');
  }

  const transformedTags = tags.map((tag) => ({
    ...tag,
    tagGroup: tag.tagGroup
      ? {
          id: tag.tagGroup.id,
          name: tag.tagGroup.name,
          color: tag.tagGroup.color,
          deleted: tag.tagGroup.deleted,
          createdAt: tag.tagGroup.createdAt,
          updatedAt: tag.tagGroup.updatedAt,
          instanceId: tag.tagGroup.instanceId,
          metadata: (tag.tagGroup.metadata as Prisma.JsonValue) || null,
        }
      : null,
  }));

  const initialTagGroups = buildTagGroups(transformedTags);

  return (
    <TagsUI
      initialTagGroups={initialTagGroups}
      instanceId={instanceId}
    />
  );
}

export default TagsPage;
