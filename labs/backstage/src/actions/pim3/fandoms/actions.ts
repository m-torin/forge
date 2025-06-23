'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server/next';
import { type Prisma } from '@repo/database/prisma';
import {
  findManyFandomsOrm,
  countFandomsOrm,
  createFandomOrm,
  updateFandomOrm,
  deleteFandomOrm,
  findUniqueFandomOrm,
  updateManyFandomsOrm,
  findFirstFandomOrm,
  groupByFandomsOrm,
} from '@repo/database/prisma';

/**
 * Fandom management actions for PIM3
 *
 * These actions provide basic fandom management functionality:
 * - Fandom CRUD operations
 * - Product associations
 */

// Fandom validation schema
const fandomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  isFictional: z.boolean().default(true),
  copy: z.record(z.any()).optional(),
});

// Get fandoms with pagination and filtering
export async function getFandoms(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isFictional?: boolean;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { page = 1, limit = 50, search, isFictional } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.FandomWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isFictional !== undefined && { isFictional }),
    };

    const [fandoms, total] = await Promise.all([
      findManyFandomsOrm({
        include: {
          products: {
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
            },
            take: 5,
          },
          _count: {
            select: {
              products: true,
              series: true,
              stories: true,
              locations: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        where,
      }),
      countFandomsOrm({ where }),
    ]);

    return {
      data: fandoms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load fandoms', success: false as const };
  }
}

// Get a single fandom by ID
export async function getFandomById(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const fandom = await findUniqueFandomOrm({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
          },
        },
        series: {
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
        },
        locations: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
            series: true,
            stories: true,
            locations: true,
          },
        },
      },
      where: { id },
    });

    if (!fandom) {
      return { error: 'Fandom not found', success: false as const };
    }

    return { data: fandom, success: true as const };
  } catch (error) {
    return { error: 'Failed to load fandom', success: false as const };
  }
}

// Create a new fandom
export async function createFandom(data: z.infer<typeof fandomSchema>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = fandomSchema.parse(data);

    // Check if slug already exists
    const existing = await findUniqueFandomOrm({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { error: 'A fandom with this slug already exists', success: false as const };
    }

    const fandom = await createFandomOrm({
      data: {
        ...validatedData,
        copy: validatedData.copy || {},
      },
      include: {
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
            series: true,
            stories: true,
            locations: true,
          },
        },
      },
    });

    revalidatePath('/pim3/fandoms');
    return { data: fandom, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to create fandom', success: false as const };
  }
}

// Update an existing fandom
export async function updateFandom(id: string, data: Partial<z.infer<typeof fandomSchema>>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = fandomSchema.partial().parse(data);

    // Check if slug already exists (if being updated)
    if (validatedData.slug) {
      const existing = await findUniqueFandomOrm({
        where: { slug: validatedData.slug },
      });

      if (existing && existing.id !== id) {
        return { error: 'A fandom with this slug already exists', success: false as const };
      }
    }

    const fandom = await updateFandomOrm({
      where: { id },
      data: validatedData,
      include: {
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
            series: true,
            stories: true,
            locations: true,
          },
        },
      },
    });

    revalidatePath('/pim3/fandoms');
    return { data: fandom, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to update fandom', success: false as const };
  }
}

// Delete a fandom
export async function deleteFandom(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const fandom = await updateFandomOrm({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/fandoms');
    return { data: fandom, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete fandom', success: false as const };
  }
}

// Bulk update fandom fictional status
export async function bulkUpdateFandomFictional(ids: string[], isFictional: boolean) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const result = await updateManyFandomsOrm({
      where: { id: { in: ids } },
      data: { isFictional },
    });

    revalidatePath('/pim3/fandoms');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to update fandoms', success: false as const };
  }
}

// Bulk delete fandoms
export async function bulkDeleteFandoms(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const result = await updateManyFandomsOrm({
      where: { id: { in: ids } },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/fandoms');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete fandoms', success: false as const };
  }
}

// Get fandom analytics
export async function getFandomAnalytics() {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const [
      totalFandoms,
      fictionalFandoms,
      realFandoms,
      fandomsWithProducts,
      recentFandoms,
      mostProductiveFandoms,
    ] = await Promise.all([
      countFandomsOrm(),
      countFandomsOrm({ where: { isFictional: true } }),
      countFandomsOrm({ where: { isFictional: false } }),
      countFandomsOrm({ where: { products: { some: {} } } }),
      findManyFandomsOrm({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      }),
      findManyFandomsOrm({
        include: {
          _count: {
            select: {
              products: true,
              series: true,
              stories: true,
              locations: true,
            },
          },
        },
        orderBy: {
          products: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      data: {
        totalFandoms,
        fictionalFandoms,
        realFandoms,
        fandomsWithProducts,
        recentFandoms,
        mostProductiveFandoms,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load fandom analytics', success: false as const };
  }
}
