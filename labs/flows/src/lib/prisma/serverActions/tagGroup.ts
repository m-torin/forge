'use server';

import {
  createTagGroup,
  getTagGroupById,
  getAllTagGroups,
  updateTagGroup,
  deleteTagGroup,
} from '#/lib/prisma/ormApi/tagGroup';
import { TagGroup } from '@prisma/client';
import { logError } from '@repo/observability';

/**
 * Fetches a TagGroup by its unique identifier and instance ID.
 *
 * @param tagGroupId - The unique identifier of the TagGroup.
 * @param instanceId - The identifier of the instance to which the TagGroup belongs.
 * @returns The TagGroup or throws an error if not found.
 */
export const readTagGroupAction = async (
  tagGroupId: string,
  instanceId: string,
): Promise<TagGroup> => {
  try {
    const tagGroup = await getTagGroupById(tagGroupId, instanceId);
    if (!tagGroup) throw new Error('TagGroup not found.');
    return tagGroup;
  } catch (error) {
    logError('Error in readTagGroupAction', { error });
    throw new Error('Failed to fetch TagGroup.');
  }
};

/**
 * Creates a new TagGroup associated with a specific instance.
 *
 * @param data - The data required to create a TagGroup.
 * @param instanceId - The identifier of the instance to associate with the TagGroup.
 * @returns The created TagGroup.
 */
export const createTagGroupAction = async (
  data: { name: string; color: string },
  instanceId: string,
): Promise<TagGroup> => {
  try {
    return await createTagGroup(
      {
        name: data.name,
        color: data.color,
      },
      instanceId,
    );
  } catch (error) {
    logError('Error in createTagGroupAction', { error });
    throw new Error('Failed to create TagGroup.');
  }
};

/**
 * Fetches all TagGroups for a specific instance.
 *
 * @param instanceId - The identifier of the instance to filter TagGroups.
 * @returns An array of TagGroups.
 */
export const getTagGroupsAction = async (
  instanceId: string,
): Promise<TagGroup[]> => {
  try {
    return await getAllTagGroups(instanceId);
  } catch (error) {
    logError('Error in getTagGroupsAction', { error });
    throw new Error('Failed to fetch TagGroups.');
  }
};

/**
 * Updates an existing TagGroup.
 *
 * @param tagGroupId - The unique identifier of the TagGroup to update.
 * @param instanceId - The identifier of the instance to which the TagGroup belongs.
 * @param data - The data to update the TagGroup with.
 * @returns The updated TagGroup or throws an error if not found.
 */
export const updateTagGroupAction = async (
  tagGroupId: string,
  instanceId: string,
  data: { name?: string; color?: string },
): Promise<TagGroup> => {
  try {
    const updatedTagGroup = await updateTagGroup(tagGroupId, instanceId, data);
    if (!updatedTagGroup)
      throw new Error('TagGroup not found or update failed.');
    return updatedTagGroup;
  } catch (error) {
    logError('Error in updateTagGroupAction', { error });
    throw new Error('Failed to update TagGroup.');
  }
};

/**
 * Soft deletes a TagGroup by setting its `deleted` flag to true.
 *
 * @param tagGroupId - The unique identifier of the TagGroup to delete.
 * @param instanceId - The identifier of the instance to which the TagGroup belongs.
 * @returns The soft-deleted TagGroup or throws an error if not found.
 */
export const deleteTagGroupAction = async (
  tagGroupId: string,
  instanceId: string,
): Promise<TagGroup> => {
  try {
    const deletedTagGroup = await deleteTagGroup(tagGroupId, instanceId);
    if (!deletedTagGroup)
      throw new Error('TagGroup not found or already deleted.');
    return deletedTagGroup;
  } catch (error) {
    logError('Error in deleteTagGroupAction', { error });
    throw new Error('Failed to delete TagGroup.');
  }
};
