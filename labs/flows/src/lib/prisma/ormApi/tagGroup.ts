import { Prisma, Tag, TagGroup } from '@prisma/client';
import { prisma } from '#/lib/prisma';
import { logError } from '@repo/observability';

/**
 * Creates a new TagGroup associated with a specific instance.
 *
 * @param data - The data required to create a TagGroup, excluding the instance.
 * @param instanceId - The identifier of the instance to associate with the TagGroup.
 * @returns The created TagGroup.
 */
export const createTagGroup = async (
  data: Omit<Prisma.TagGroupCreateInput, 'instance'>,
  instanceId: string,
): Promise<TagGroup> => {
  return prisma.tagGroup.create({
    data: {
      ...data,
      instance: { connect: { id: instanceId } },
    },
    include: { tags: true },
  });
};

/**
 * Retrieves a TagGroup by its unique identifier and Instance ID.
 *
 * @param tagGroupId - The unique identifier of the TagGroup.
 * @param instanceId - The identifier of the instance to which the TagGroup belongs.
 * @returns The TagGroup with its associated tags or null if not found or deleted.
 */
export const getTagGroupById = async (
  tagGroupId: string,
  instanceId: string,
): Promise<(TagGroup & { tags: Tag[] }) | null> => {
  return prisma.tagGroup.findFirst({
    where: {
      id: tagGroupId,
      instanceId,
      deleted: false,
    },
    include: { tags: true },
  });
};

/**
 * Retrieves all non-deleted TagGroups for a specific instance.
 *
 * @param instanceId - The identifier of the instance to filter TagGroups.
 * @returns An array of TagGroups with their associated tags.
 */
export const getAllTagGroups = async (
  instanceId: string,
): Promise<TagGroup[]> => {
  try {
    const tagGroups = await prisma.tagGroup.findMany({
      where: { instanceId, deleted: false },
      include: { tags: true },
    });
    return tagGroups;
  } catch (error) {
    logError('Error in getAllTagGroups', { error });
    throw error;
  }
};

/**
 * Updates an existing TagGroup.
 *
 * @param tagGroupId - The unique identifier of the TagGroup to update.
 * @param instanceId - The identifier of the instance to which the TagGroup belongs.
 * @param data - The data to update the TagGroup with.
 * @returns The updated TagGroup or null if not found or deleted.
 */
export const updateTagGroup = async (
  tagGroupId: string,
  instanceId: string,
  data: Prisma.TagGroupUpdateInput,
): Promise<TagGroup | null> => {
  try {
    const updatedCount = await prisma.tagGroup.updateMany({
      where: {
        id: tagGroupId,
        instanceId,
        deleted: false,
      },
      data,
    });

    if (updatedCount.count === 0) return null;

    return getTagGroupById(tagGroupId, instanceId);
  } catch (error) {
    logError('Prisma error in updateTagGroup', { error });
    return null;
  }
};

/**
 * Soft deletes a TagGroup by setting its `deleted` flag to true.
 *
 * @param tagGroupId - The unique identifier of the TagGroup to delete.
 * @param instanceId - The identifier of the instance to which the TagGroup belongs.
 * @returns The soft-deleted TagGroup or null if not found or already deleted.
 */
export const deleteTagGroup = async (
  tagGroupId: string,
  instanceId: string,
): Promise<TagGroup | null> => {
  try {
    const updatedCount = await prisma.tagGroup.updateMany({
      where: {
        id: tagGroupId,
        instanceId,
        deleted: false,
      },
      data: { deleted: true },
    });

    if (updatedCount.count === 0) return null;

    return getTagGroupById(tagGroupId, instanceId);
  } catch (error) {
    logError('Prisma error in deleteTagGroup', { error });
    return null;
  }
};
