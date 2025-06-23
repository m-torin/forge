'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server/next';
import { type Prisma } from '@repo/database/prisma';
import {
  findManyCastOrm,
  countCastOrm,
  createCastOrm,
  updateCastOrm,
  deleteCastOrm,
  findUniqueCastOrm,
  updateManyCastOrm,
} from '@repo/database/prisma';

/**
 * Cast management actions for PIM3
 *
 * These actions provide basic cast management functionality:
 * - Cast CRUD operations
 * - Product associations
 */

// Cast validation schema
const castSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  isFictional: z.boolean().default(true),
  copy: z.record(z.any()).optional(),
});

// Get cast with pagination and filtering
export async function getCast(params?: {
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

    const where: Prisma.CastWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isFictional !== undefined && { isFictional }),
    };

    const [cast, total] = await Promise.all([
      findManyCastOrm({
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
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        where,
      }),
      countCastOrm({ where }),
    ]);

    return {
      data: cast,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load cast', success: false as const };
  }
}

// Get a single cast member by ID
export async function getCastById(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const cast = await findUniqueCastOrm({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
          },
        },
      },
      where: { id },
    });

    if (!cast) {
      return { error: 'Cast member not found', success: false as const };
    }

    return { data: cast, success: true as const };
  } catch (error) {
    return { error: 'Failed to load cast member', success: false as const };
  }
}

// Create a new cast member
export async function createCast(data: z.infer<typeof castSchema>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = castSchema.parse(data);

    // Check if slug already exists
    const existing = await findUniqueCastOrm({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { error: 'A cast member with this slug already exists', success: false as const };
    }

    const cast = await createCastOrm({
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
          },
        },
      },
    });

    revalidatePath('/pim3/cast');
    return { data: cast, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to create cast member', success: false as const };
  }
}

// Update a cast member
export async function updateCast(id: string, data: Partial<z.infer<typeof castSchema>>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = castSchema.partial().parse(data);

    // Check if slug already exists (if being updated)
    if (validatedData.slug) {
      const existing = await findUniqueCastOrm({
        where: { slug: validatedData.slug },
      });

      if (existing && existing.id !== id) {
        return { error: 'A cast member with this slug already exists', success: false as const };
      }
    }

    const cast = await updateCastOrm({
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
          },
        },
      },
    });

    revalidatePath('/pim3/cast');
    return { data: cast, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to update cast member', success: false as const };
  }
}

// Delete a cast member
export async function deleteCast(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const cast = await updateCastOrm({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/cast');
    return { data: cast, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete cast member', success: false as const };
  }
}

// Bulk update cast status
export async function bulkUpdateCastFictional(ids: string[], isFictional: boolean) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const result = await updateManyCastOrm({
      where: { id: { in: ids } },
      data: { isFictional },
    });

    revalidatePath('/pim3/cast');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to update cast members', success: false as const };
  }
}

// Bulk delete cast members
export async function bulkDeleteCast(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const result = await updateManyCastOrm({
      where: { id: { in: ids } },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/cast');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete cast members', success: false as const };
  }
}

// Get cast analytics
export async function getCastAnalytics() {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const [totalCast, fictionalCast, realCast, castWithProducts, recentCast, mostProductiveCast] =
      await Promise.all([
        countCastOrm(),
        countCastOrm({ where: { isFictional: true } }),
        countCastOrm({ where: { isFictional: false } }),
        countCastOrm({ where: { products: { some: {} } } }),
        findManyCastOrm({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
          },
        }),
        findManyCastOrm({
          include: {
            _count: {
              select: {
                products: true,
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
        totalCast,
        fictionalCast,
        realCast,
        castWithProducts,
        recentCast,
        mostProductiveCast,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load cast analytics', success: false as const };
  }
}
