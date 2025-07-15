import { Prisma, Tag } from '@prisma/client';
import { logEntityChange } from './helpers';

/**
 * Generic helper function to upsert related Tags.
 * @param tx - The Prisma transaction client.
 * @param tags - An array of tags to upsert.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 */
export const upsertTags = async (
  tx: Prisma.TransactionClient,
  tags: Tag[] = [],
  flowId: string,
  changedBy: string,
  existingTags: Tag[] = [],
): Promise<void> => {
  const existingTagIds = existingTags.map((t) => t.id);
  const incomingTagIds = tags.map((t) => t.id);

  const tagsToAssign = tags.filter((tag) => !existingTagIds.includes(tag.id));
  const tagsToUnassign = existingTags.filter(
    (tag) => !incomingTagIds.includes(tag.id),
  );

  // Assign flowId to tags to assign
  await Promise.all(
    tagsToAssign.map((tag) =>
      tx.tag.upsert({
        where: { id: tag.id },
        update: {
          flowId,
          deleted: false,
          metadata: tag.metadata ?? Prisma.DbNull, // Handle metadata appropriately
        },
        create: {
          ...tag,
          flowId,
          deleted: false,
          metadata: tag.metadata ?? Prisma.DbNull, // Handle metadata appropriately
        },
      }),
    ),
  );

  // Remove flowId from tags to unassign
  await Promise.all(
    tagsToUnassign.map((tag) =>
      tx.tag.update({
        where: { id: tag.id },
        data: {
          flowId: null,
          metadata: tag.metadata ?? Prisma.DbNull, // Handle metadata appropriately
        },
      }),
    ),
  );

  // Log tag assignments and unassignments
  await Promise.all([
    ...tagsToAssign.map((tag) =>
      logEntityChange('Tag', tag.id, flowId, 'ASSIGN', null, tag, changedBy),
    ),
    ...tagsToUnassign.map((tag) =>
      logEntityChange('Tag', tag.id, flowId, 'UNASSIGN', tag, null, changedBy),
    ),
  ]);
};
