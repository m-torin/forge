'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server/next';
import { type Prisma } from '@repo/database/prisma';
import {
  findManySeriesOrm,
  countSeriesOrm,
  createSeriesOrm,
  updateSeriesOrm,
  findUniqueSeriesOrm,
  updateManySeriesOrm,
  countStoryOrm,
} from '@repo/database/prisma';

/**
 * Series management actions for PIM3
 *
 * These actions provide series management functionality:
 * - Series CRUD operations
 * - Fandom associations
 * - Episode/content management
 */

// Series validation schema
const seriesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  isFictional: z.boolean().default(true),
  fandomId: z.string().optional(),
  copy: z.record(z.any()).optional(),
});

// Get series with pagination and filtering
export async function getSeries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  fandomId?: string;
  isFictional?: boolean;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { page = 1, limit = 50, search, fandomId, isFictional } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.SeriesWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(fandomId && { fandomId }),
      ...(isFictional !== undefined && { isFictional }),
    };

    const [series, total] = await Promise.all([
      findManySeriesOrm({
        include: {
          fandom: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          stories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
            take: 5,
          },
          _count: {
            select: {
              stories: true,
              products: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        where,
      }),
      countSeriesOrm({ where }),
    ]);

    return {
      data: series,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load series', success: false as const };
  }
}

// Get a single series by ID
export async function getSeriesById(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const series = await findUniqueSeriesOrm({
      include: {
        fandom: true,
        stories: {
          orderBy: { name: 'asc' },
        },
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
            stories: true,
            products: true,
          },
        },
      },
      where: { id },
    });

    if (!series) {
      return { error: 'Series not found', success: false as const };
    }

    return { data: series, success: true as const };
  } catch (error) {
    return { error: 'Failed to load series', success: false as const };
  }
}

// Create a new series
export async function createSeries(data: z.infer<typeof seriesSchema>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = seriesSchema.parse(data);

    // Check if slug already exists
    const existing = await findUniqueSeriesOrm({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { error: 'A series with this slug already exists', success: false as const };
    }

    const series = await createSeriesOrm({
      data: {
        ...validatedData,
        copy: validatedData.copy || {},
      },
      include: {
        fandom: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            stories: true,
            products: true,
          },
        },
      },
    });

    revalidatePath('/pim3/series');
    return { data: series, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to create series', success: false as const };
  }
}

// Update an existing series
export async function updateSeries(id: string, data: Partial<z.infer<typeof seriesSchema>>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = seriesSchema.partial().parse(data);

    // Check if slug already exists (if being updated)
    if (validatedData.slug) {
      const existing = await findUniqueSeriesOrm({
        where: { slug: validatedData.slug },
      });

      if (existing && existing.id !== id) {
        return { error: 'A series with this slug already exists', success: false as const };
      }
    }

    const series = await updateSeriesOrm({
      where: { id },
      data: validatedData,
      include: {
        fandom: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            stories: true,
            products: true,
          },
        },
      },
    });

    revalidatePath('/pim3/series');
    return { data: series, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to update series', success: false as const };
  }
}

// Delete a series
export async function deleteSeries(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if series has stories
    const storiesCount = await countStoryOrm({
      where: { seriesId: id },
    });

    if (storiesCount > 0) {
      return {
        error: 'Cannot delete series with associated stories. Remove stories first.',
        success: false as const,
      };
    }

    const series = await updateSeriesOrm({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/series');
    return { data: series, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete series', success: false as const };
  }
}

// Bulk operations
export async function bulkUpdateSeriesFictional(ids: string[], isFictional: boolean) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const result = await updateManySeriesOrm({
      where: { id: { in: ids } },
      data: { isFictional },
    });

    revalidatePath('/pim3/series');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to update series', success: false as const };
  }
}

export async function bulkDeleteSeries(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if any series have stories
    const storiesCount = await countStoryOrm({
      where: { seriesId: { in: ids } },
    });

    if (storiesCount > 0) {
      return {
        error: 'Cannot delete series with associated stories. Remove stories first.',
        success: false as const,
      };
    }

    const result = await updateManySeriesOrm({
      where: { id: { in: ids } },
      data: {
        deletedAt: new Date(),
        deletedById: 'system', // TODO: Get from session
      },
    });

    revalidatePath('/pim3/series');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete series', success: false as const };
  }
}

// Analytics
export async function getSeriesAnalytics() {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const [
      totalSeries,
      fictionalSeries,
      seriesWithStories,
      seriesWithProducts,
      recentSeries,
      topSeries,
    ] = await Promise.all([
      countSeriesOrm(),
      countSeriesOrm({ where: { isFictional: true } }),
      countSeriesOrm({ where: { stories: { some: {} } } }),
      countSeriesOrm({ where: { products: { some: {} } } }),
      findManySeriesOrm({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      }),
      findManySeriesOrm({
        include: {
          _count: {
            select: {
              stories: true,
              products: true,
            },
          },
        },
        orderBy: {
          stories: { _count: 'desc' },
        },
        take: 10,
      }),
    ]);

    return {
      data: {
        totalSeries,
        fictionalSeries,
        realSeries: totalSeries - fictionalSeries,
        seriesWithStories,
        seriesWithProducts,
        seriesWithoutStories: totalSeries - seriesWithStories,
        recentSeries,
        topSeries,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load series analytics', success: false as const };
  }
}
