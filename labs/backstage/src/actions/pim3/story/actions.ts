'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server/next';
import { type Prisma } from '@repo/database/prisma';
import {
  findManyStoryOrm,
  countStoryOrm,
  createStoryOrm,
  updateStoryOrm,
  deleteStoryOrm,
  findUniqueStoryOrm,
  updateManyStoryOrm,
  findFirstStoryOrm,
  groupByStoryOrm,
  findManySeriesOrm,
} from '@repo/database/prisma';

/**
 * Story management actions for PIM3
 *
 * These actions provide story management functionality:
 * - Story CRUD operations
 * - Series associations
 * - Chapter/content management
 */

// Story validation schema
const storySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  isFictional: z.boolean().default(true),
  seriesId: z.string().optional(),
  copy: z.record(z.any()).optional(),
});

// Get stories with pagination and filtering
export async function getStories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  seriesId?: string;
  isFictional?: boolean;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { page = 1, limit = 50, search, seriesId, isFictional } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.StoryWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(seriesId && { seriesId }),
      ...(isFictional !== undefined && { isFictional }),
    };

    const [stories, total] = await Promise.all([
      findManyStoryOrm({
        include: {
          series: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        where,
      }),
      countStoryOrm({ where }),
    ]);

    return {
      data: stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load stories', success: false as const };
  }
}

// Get a single story by ID
export async function getStoryById(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const story = await findUniqueStoryOrm({
      include: {
        series: true,
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      where: { id },
    });

    if (!story) {
      return { error: 'Story not found', success: false as const };
    }

    return { data: story, success: true as const };
  } catch (error) {
    return { error: 'Failed to load story', success: false as const };
  }
}

// Create a new story
export async function createStory(data: z.infer<typeof storySchema>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = storySchema.parse(data);

    // Check if slug already exists
    const existing = await findUniqueStoryOrm({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { error: 'A story with this slug already exists', success: false as const };
    }

    const story = await createStoryOrm({
      data: {
        ...validatedData,
        copy: validatedData.copy || {},
      },
      include: {
        series: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    revalidatePath('/pim3/stories');
    return { data: story, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to create story', success: false as const };
  }
}

// Update an existing story
export async function updateStory(id: string, data: Partial<z.infer<typeof storySchema>>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = storySchema.partial().parse(data);

    // Check if slug already exists (if being updated)
    if (validatedData.slug) {
      const existing = await findUniqueStoryOrm({
        where: { slug: validatedData.slug },
      });

      if (existing && existing.id !== id) {
        return { error: 'A story with this slug already exists', success: false as const };
      }
    }

    const story = await updateStoryOrm({
      where: { id },
      data: validatedData,
      include: {
        series: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    revalidatePath('/pim3/stories');
    return { data: story, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to update story', success: false as const };
  }
}

// Delete a story
export async function deleteStory(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const story = await updateStoryOrm({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/stories');
    return { data: story, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete story', success: false as const };
  }
}

// Bulk operations
export async function bulkUpdateStoryFictional(ids: string[], isFictional: boolean) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const result = await updateManyStoryOrm({
      where: { id: { in: ids } },
      data: { isFictional },
    });

    revalidatePath('/pim3/stories');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to update stories', success: false as const };
  }
}

export async function bulkDeleteStories(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const result = await updateManyStoryOrm({
      where: { id: { in: ids } },
      data: {
        deletedAt: new Date(),
        deletedById: 'system', // TODO: Get from session
      },
    });

    revalidatePath('/pim3/stories');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete stories', success: false as const };
  }
}

// Analytics
export async function getStoryAnalytics() {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const [
      totalStories,
      fictionalStories,
      storiesWithProducts,
      storiesWithSeries,
      recentStories,
      topStories,
    ] = await Promise.all([
      countStoryOrm(),
      countStoryOrm({ where: { isFictional: true } }),
      countStoryOrm({ where: { products: { some: {} } } }),
      countStoryOrm({ where: { seriesId: { not: null } } }),
      findManyStoryOrm({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      }),
      findManyStoryOrm({
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          products: { _count: 'desc' },
        },
        take: 10,
      }),
    ]);

    return {
      data: {
        totalStories,
        fictionalStories,
        realStories: totalStories - fictionalStories,
        storiesWithProducts,
        storiesWithSeries,
        storiesWithoutSeries: totalStories - storiesWithSeries,
        recentStories,
        topStories,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load story analytics', success: false as const };
  }
}
