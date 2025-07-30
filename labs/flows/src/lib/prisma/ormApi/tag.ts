// src/lib/prisma/ormApi/tag.ts

import { Prisma, Tag } from '@prisma/client';
import { prisma } from '#/lib/prisma';
import { logError } from '@repo/observability';

/**
 * Creates a new tag associated with a specific instance and optionally a tag group.
 *
 * @param data - The data required to create a Tag, excluding the instance.
 * @param instanceId - The identifier of the instance to associate with the Tag.
 * @returns The created Tag with related TagGroup and Instance.
 */
export const createTag = async (
  data: Prisma.TagCreateWithoutInstanceInput,
  instanceId: string,
): Promise<Tag> => {
  try {
    // Initialize the data object with the instance connection
    const tagCreateData: Prisma.TagCreateInput = {
      ...data,
      instance: { connect: { id: instanceId } },
    };

    // Check if tagGroup is defined and handle it correctly
    if (
      data.tagGroup &&
      typeof data.tagGroup === 'object' &&
      'connect' in data.tagGroup
    ) {
      const connect = data.tagGroup.connect as Prisma.TagGroupWhereUniqueInput;
      if ('id' in connect && typeof connect.id === 'string') {
        tagCreateData.tagGroup = {
          connect: {
            id_instanceId: {
              id: connect.id,
              instanceId: instanceId,
            },
          },
        };
      }
    }

    // Create the tag with the assembled data
    return await prisma.tag.create({
      data: tagCreateData,
      include: { tagGroup: true, instance: true },
    });
  } catch (error) {
    logError('Prisma error in createTag', { error });
    throw new Error(
      `Error during tag creation: ${
        error instanceof Error ? error.message : 'Unknown error.'
      }`,
    );
  }
};

/**
 * Retrieves a tag by its unique identifier and Instance ID.
 *
 * @param tagId - The unique identifier of the Tag.
 * @param instanceId - The identifier of the instance to which the Tag belongs.
 * @returns The Tag with its associated TagGroup and Instance or null if not found.
 */
export const getTagById = async (
  tagId: number,
  instanceId: string,
): Promise<Tag | null> => {
  return prisma.tag.findUnique({
    where: {
      id_instanceId: {
        id: tagId,
        instanceId,
      },
    },
    include: { tagGroup: true, instance: true },
  });
};

/**
 * Fetches all non-deleted tags for a specific instance.
 *
 * @param instanceId - The identifier of the instance to filter Tags.
 * @returns An array of Tags associated with the instance.
 */
export const getAllTags = async (instanceId: string): Promise<Tag[]> => {
  return prisma.tag.findMany({
    where: { deleted: false, instanceId },
    include: { tagGroup: true },
  });
};

/**
 * Updates an existing tag.
 *
 * @param tagId - The unique identifier of the Tag to update.
 * @param instanceId - The identifier of the instance to which the Tag belongs.
 * @param data - The data to update the Tag with.
 * @returns The updated Tag with its associated TagGroup or null if not found.
 */
export const updateTag = async (
  tagId: number,
  instanceId: string,
  data: Prisma.TagUpdateWithoutInstanceInput,
): Promise<Tag | null> => {
  try {
    const updateData: Prisma.TagUpdateInput = {
      ...data,
    };

    if (
      data.tagGroup &&
      typeof data.tagGroup === 'object' &&
      'connect' in data.tagGroup
    ) {
      const connect = data.tagGroup.connect as Prisma.TagGroupWhereUniqueInput;
      if ('id' in connect && typeof connect.id === 'string') {
        updateData.tagGroup = {
          connect: {
            id_instanceId: {
              id: connect.id,
              instanceId: instanceId,
            },
          },
        };
      }
    }

    return await prisma.tag.update({
      where: {
        id_instanceId: {
          id: tagId,
          instanceId,
        },
      },
      data: updateData,
      include: { tagGroup: true },
    });
  } catch (error) {
    logError('Prisma error in updateTag', { error });
    return null;
  }
};

/**
 * Soft deletes a tag by setting its `deleted` flag to true.
 *
 * @param tagId - The unique identifier of the Tag to delete.
 * @param instanceId - The identifier of the instance to which the Tag belongs.
 * @returns The soft-deleted Tag or null if not found.
 */
export const deleteTag = async (
  tagId: number,
  instanceId: string,
): Promise<Tag | null> => {
  try {
    return await prisma.tag.update({
      where: {
        id_instanceId: {
          id: tagId,
          instanceId,
        },
      },
      data: { deleted: true },
    });
  } catch (error) {
    logError('Prisma error in deleteTag', { error });
    return null;
  }
};
