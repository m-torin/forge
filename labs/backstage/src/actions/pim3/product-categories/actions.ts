'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server/next';
import { type Prisma, ContentStatus } from '@repo/database/prisma';
import {
  findManyProductCategoriesOrm,
  countProductCategoriesOrm,
  createProductCategoryOrm,
  updateProductCategoryOrm,
  deleteProductCategoryOrm,
  findUniqueProductCategoryOrm,
  updateManyProductCategoriesOrm,
  findFirstProductCategoryOrm,
  aggregateProductCategoriesOrm,
  groupByProductCategoriesOrm,
  executeTransaction,
} from '@repo/database/prisma';

/**
 * Product Category management actions for PIM3
 *
 * These actions provide product category management functionality:
 * - Category CRUD operations
 * - Hierarchical category management
 * - Product associations
 * - Display order management
 */

// Product category validation schema
const productCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.PUBLISHED),
  parentId: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
  copy: z.record(z.any()).optional(),
});

// Get product categories with pagination and filtering
export async function getProductCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
  status?: string;
  includeDeleted?: boolean;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { page = 1, limit = 50, search, parentId, status, includeDeleted = false } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.ProductCategoryWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(parentId !== undefined && { parentId }),
      ...(status && { status: status as any }),
      ...(!includeDeleted && { deletedAt: null }),
    };

    const [categories, total] = await Promise.all([
      findManyProductCategoriesOrm({
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
            where: { deletedAt: null },
            take: 5,
          },
          _count: {
            select: {
              children: true,
              products: true,
              collections: true,
              media: true,
            },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
        where,
      }),
      countProductCategoriesOrm({ where }),
    ]);

    return {
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load product categories', success: false as const };
  }
}

// Get a single product category by ID
export async function getProductCategoryById(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const category = await findUniqueProductCategoryOrm({
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
        },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
          },
          take: 10,
        },
        collections: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          take: 10,
        },
        _count: {
          select: {
            children: true,
            products: true,
            collections: true,
            media: true,
          },
        },
      },
      where: { id },
    });

    if (!category) {
      return { error: 'Product category not found', success: false as const };
    }

    return { data: category, success: true as const };
  } catch (error) {
    return { error: 'Failed to load product category', success: false as const };
  }
}

// Create a new product category
export async function createProductCategory(data: z.infer<typeof productCategorySchema>) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = productCategorySchema.parse(data);

    // Check if slug already exists
    const existing = await findUniqueProductCategoryOrm({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { error: 'A product category with this slug already exists', success: false as const };
    }

    const category = await createProductCategoryOrm({
      data: {
        ...validatedData,
        copy: validatedData.copy || {},
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
            collections: true,
            media: true,
          },
        },
      },
    });

    revalidatePath('/pim3/product-categories');
    return { data: category, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to create product category', success: false as const };
  }
}

// Update an existing product category
export async function updateProductCategory(
  id: string,
  data: Partial<z.infer<typeof productCategorySchema>>,
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const validatedData = productCategorySchema.partial().parse(data);

    // Check if slug already exists (if being updated)
    if (validatedData.slug) {
      const existing = await findUniqueProductCategoryOrm({
        where: { slug: validatedData.slug },
      });

      if (existing && existing.id !== id) {
        return {
          error: 'A product category with this slug already exists',
          success: false as const,
        };
      }
    }

    // Prevent circular references in hierarchy
    if (validatedData.parentId) {
      const isCircular = await checkCircularReference(id, validatedData.parentId);
      if (isCircular) {
        return {
          error: 'Cannot set parent: would create circular reference',
          success: false as const,
        };
      }
    }

    const category = await updateProductCategoryOrm({
      where: { id },
      data: validatedData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
            collections: true,
            media: true,
          },
        },
      },
    });

    revalidatePath('/pim3/product-categories');
    return { data: category, success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, success: false as const };
    }
    return { error: 'Failed to update product category', success: false as const };
  }
}

// Delete a product category
export async function deleteProductCategory(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if category has children
    const childrenCount = await countProductCategoriesOrm({
      where: { parentId: id, deletedAt: null },
    });

    if (childrenCount > 0) {
      return {
        error: 'Cannot delete category with children. Move or delete child categories first.',
        success: false as const,
      };
    }

    const category = await updateProductCategoryOrm({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/product-categories');
    return { data: category, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete product category', success: false as const };
  }
}

// Get category tree (hierarchical structure)
export async function getCategoryTree() {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const categories = await findManyProductCategoriesOrm({
      where: { deletedAt: null },
      include: {
        children: {
          where: { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
          include: {
            children: {
              where: { deletedAt: null },
              orderBy: { displayOrder: 'asc' },
            },
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    // Filter to only root categories (no parent)
    const rootCategories = categories.filter((cat) => !cat.parentId);

    return { data: rootCategories, success: true as const };
  } catch (error) {
    return { error: 'Failed to load category tree', success: false as const };
  }
}

// Bulk operations
export async function bulkUpdateCategoryStatus(ids: string[], status: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const result = await updateManyProductCategoriesOrm({
      where: { id: { in: ids } },
      data: { status: status as any },
    });

    revalidatePath('/pim3/product-categories');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to update categories', success: false as const };
  }
}

export async function bulkDeleteCategories(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if any categories have children
    const childrenCount = await countProductCategoriesOrm({
      where: { parentId: { in: ids }, deletedAt: null },
    });

    if (childrenCount > 0) {
      return {
        error: 'Cannot delete categories with children. Move or delete child categories first.',
        success: false as const,
      };
    }

    const result = await updateManyProductCategoriesOrm({
      where: { id: { in: ids } },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/product-categories');
    return { data: result, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete categories', success: false as const };
  }
}

// Analytics
export async function getProductCategoryAnalytics() {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const [
      totalCategories,
      rootCategories,
      categoriesWithProducts,
      categoriesWithCollections,
      recentCategories,
      topCategories,
    ] = await Promise.all([
      countProductCategoriesOrm({ where: { deletedAt: null } }),
      countProductCategoriesOrm({ where: { parentId: null, deletedAt: null } }),
      countProductCategoriesOrm({ where: { products: { some: {} }, deletedAt: null } }),
      countProductCategoriesOrm({ where: { collections: { some: {} }, deletedAt: null } }),
      findManyProductCategoriesOrm({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      }),
      findManyProductCategoriesOrm({
        where: { deletedAt: null },
        include: {
          _count: {
            select: {
              products: true,
              collections: true,
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
        totalCategories,
        rootCategories,
        childCategories: totalCategories - rootCategories,
        categoriesWithProducts,
        categoriesWithCollections,
        emptyCategoriesCount: totalCategories - categoriesWithProducts,
        recentCategories,
        topCategories,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load category analytics', success: false as const };
  }
}

// Helper function to check for circular references
async function checkCircularReference(categoryId: string, parentId: string): Promise<boolean> {
  if (categoryId === parentId) return true;

  const parent = await findUniqueProductCategoryOrm({
    where: { id: parentId },
    select: { parentId: true },
  });

  if (!parent || !parent.parentId) return false;

  return checkCircularReference(categoryId, parent.parentId);
}

// Update display order
export async function updateCategoryDisplayOrder(updates: { id: string; displayOrder: number }[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await executeTransaction(async (tx) => {
      for (const { id, displayOrder } of updates) {
        await updateProductCategoryOrm({
          where: { id },
          data: { displayOrder },
        });
      }
    });

    revalidatePath('/pim3/product-categories');
    return { data: { updated: updates.length }, success: true as const };
  } catch (error) {
    return { error: 'Failed to update display order', success: false as const };
  }
}
