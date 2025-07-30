// src/lib/prisma/serverActions/tag.ts

import { Prisma, Tag } from '@prisma/client';
import {
  getTagById,
  createTag,
  getAllTags,
  updateTag,
  deleteTag,
} from '#/lib/prisma/ormApi/tag';
import { logError } from '@repo/observability';

/**
 * Fetches a tag by its unique identifier and instance ID.
 *
 * @param tagId - The unique identifier of the Tag.
 * @param instanceId - The identifier of the instance to which the Tag belongs.
 * @returns The Tag or throws an error if not found.
 */
export const readTagAction = async (
  tagId: number,
  instanceId: string,
): Promise<Tag> => {
  try {
    const tag = await getTagById(tagId, instanceId);
    if (!tag) throw new Error('Tag not found.');
    return tag;
  } catch (error) {
    logError('Error in readTagAction', { error });
    throw new Error('Failed to fetch tag.');
  }
};

/**
 * Creates a new tag associated with a specific instance and optionally a tag group.
 *
 * @param data - The data required to create a Tag.
 * @param instanceId - The identifier of the instance to associate with the Tag.
 * @returns The created Tag.
 */
export const createTagAction = async (
  data: {
    name: string;
    tagGroupId?: string;
  },
  instanceId: string,
): Promise<Tag> => {
  try {
    const createData: Prisma.TagCreateWithoutInstanceInput = {
      name: data.name,
      ...(data.tagGroupId && {
        tagGroup: {
          connect: {
            id_instanceId: {
              id: data.tagGroupId,
              instanceId,
            },
          },
        },
      }),
    };

    return await createTag(createData, instanceId);
  } catch (error) {
    logError('Error in createTagAction', { error });
    if (error instanceof Error) {
      throw new Error(`Failed to create tag: ${error.message}`);
    } else {
      throw new Error('Failed to create tag due to an unknown error.');
    }
  }
};

/**
 * Fetches all tags for a specific instance.
 *
 * @param instanceId - The identifier of the instance to filter Tags.
 * @returns An array of Tags.
 */
export const getTagsAction = async (instanceId: string): Promise<Tag[]> => {
  try {
    const tags = await getAllTags(instanceId);
    if (!tags) throw new Error('No tags found.');
    return tags;
  } catch (error) {
    logError('Error in getTagsAction', { error });
    throw new Error('Failed to fetch tags.');
  }
};

/**
 * Updates an existing tag.
 *
 * @param tagId - The unique identifier of the Tag to update.
 * @param instanceId - The identifier of the instance to which the Tag belongs.
 * @param data - The data to update the Tag with.
 * @returns The updated Tag or throws an error if not found.
 */
export const updateTagAction = async (
  tagId: number,
  instanceId: string,
  data: {
    name?: string;
    tagGroupId?: string;
  },
): Promise<Tag> => {
  try {
    const updateData: Prisma.TagUpdateWithoutInstanceInput = {
      ...(data.name !== undefined && { name: data.name }),
      tagGroup: data.tagGroupId
        ? {
            connect: {
              id_instanceId: {
                id: data.tagGroupId,
                instanceId,
              },
            },
          }
        : {
            disconnect: true,
          },
    };

    const updatedTag = await updateTag(tagId, instanceId, updateData);
    if (!updatedTag) throw new Error('Tag not found or update failed.');
    return updatedTag;
  } catch (error) {
    logError('Error in updateTagAction', { error });
    throw new Error('Failed to update tag.');
  }
};

/**
 * Deletes a tag by soft-deleting it.
 *
 * @param tagId - The unique identifier of the Tag to delete.
 * @param instanceId - The identifier of the instance to which the Tag belongs.
 * @returns The soft-deleted Tag or throws an error if not found.
 */
export const deleteTagAction = async (
  tagId: number,
  instanceId: string,
): Promise<Tag> => {
  try {
    const deletedTag = await deleteTag(tagId, instanceId);
    if (!deletedTag) throw new Error('Tag not found or delete failed.');
    return deletedTag;
  } catch (error) {
    logError('Error in deleteTagAction', { error });
    throw new Error('Failed to delete tag.');
  }
};
