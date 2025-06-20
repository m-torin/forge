'use server';

import { auth } from '@repo/auth/server/next';
import { db } from '@repo/database/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  getCategoriesAdvancedAction,
  createCategoryAdvancedAction,
  updateCategoryAdvancedAction,
  deleteCategoryAdvancedAction,
  getCategoryTreeAdvancedAction,
  duplicateCategoryAdvancedAction,
  type ContentStatus,
} from '@repo/database/prisma';

// Enhanced ProductCategory CRUD Schema
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  status: z.nativeEnum(ContentStatus).default('PUBLISHED'),
  parentId: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
  copy: z.record(z.any()).default({}),
});

const categoryRelationshipSchema = z.object({
  productIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
});

const fullCategorySchema = categorySchema.merge(categoryRelationshipSchema);

// Get all categories with relationships
export async function getCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  parentId?: string | null;
  includeDeleted?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const { includeDeleted = false, limit = 50, page = 1, parentId, search, status } = params || {};
    const skip = (page - 1) * limit;

    const where = {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
      ...(parentId !== undefined && { parentId }),
    };

    const [categories, total] = await Promise.all([
      db.productCategory.findMany({
        where,
        include: {
          parent: { select: { id: true, name: true } },
          children: {
            select: { id: true, name: true, slug: true },
            where: includeDeleted ? {} : { deletedAt: null },
            orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          },
          products: {
            select: { id: true, name: true, sku: true },
            where: { deletedAt: null },
          },
          collections: {
            select: { id: true, name: true, slug: true },
            where: { deletedAt: null },
          },
          media: {
            select: { id: true, url: true, alt: true, type: true },
            where: { deletedAt: null },
          },
          _count: {
            select: {
              children: true,
              products: true,
              collections: true,
            },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      db.productCategory.count({ where }),
    ]);

    return {
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

// Get single category with full relationships
export async function getCategory(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const category = await db.productCategory.findUnique({
      where: { id, deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          include: { _count: { select: { products: true, children: true } } },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        },
        products: {
          where: { deletedAt: null },
          include: { media: { where: { deletedAt: null }, take: 1 } },
        },
        collections: {
          where: { deletedAt: null },
          include: { media: { where: { deletedAt: null }, take: 1 } },
        },
        media: { where: { deletedAt: null } },
        _count: {
          select: {
            children: true,
            products: true,
            collections: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}

// Create category with relationships
export async function createCategory(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const data = Object.fromEntries(formData);

    // Parse and validate the data
    const categoryData = fullCategorySchema.parse({
      ...data,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : 0,
      copy: data.copy ? JSON.parse(data.copy as string) : {},
      productIds: data.productIds ? JSON.parse(data.productIds as string) : [],
      collectionIds: data.collectionIds ? JSON.parse(data.collectionIds as string) : [],
    });

    const { productIds, collectionIds, ...categoryFields } = categoryData;

    // Validate parent exists if provided
    if (categoryFields.parentId) {
      const parent = await db.productCategory.findUnique({
        where: { id: categoryFields.parentId, deletedAt: null },
      });
      if (!parent) {
        return { success: false, error: 'Parent category not found' };
      }
    }

    // Check if slug already exists
    const existingCategory = await db.productCategory.findUnique({
      where: { slug: categoryFields.slug },
    });
    if (existingCategory) {
      return { success: false, error: 'A category with this slug already exists' };
    }

    // Create category with relationships in a transaction
    const category = await db.$transaction(async (tx) => {
      // Create the category
      const newCategory = await tx.productCategory.create({
        data: {
          ...categoryFields,
          deletedById: session.user.id,
        },
      });

      // Connect products if provided
      if (productIds.length > 0) {
        await tx.productCategory.update({
          where: { id: newCategory.id },
          data: {
            products: {
              connect: productIds.map((id) => ({ id })),
            },
          },
        });
      }

      // Connect collections if provided
      if (collectionIds.length > 0) {
        await tx.productCategory.update({
          where: { id: newCategory.id },
          data: {
            collections: {
              connect: collectionIds.map((id) => ({ id })),
            },
          },
        });
      }

      return newCategory;
    });

    revalidatePath('/pim3/categories');
    return { success: true, data: category };
  } catch (error) {
    console.error('Failed to create category:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create category' };
  }
}

// Update category with relationships
export async function updateCategory(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const data = Object.fromEntries(formData);

    // Parse and validate the data
    const categoryData = fullCategorySchema.partial().parse({
      ...data,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
      copy: data.copy ? JSON.parse(data.copy as string) : undefined,
      productIds: data.productIds ? JSON.parse(data.productIds as string) : undefined,
      collectionIds: data.collectionIds ? JSON.parse(data.collectionIds as string) : undefined,
    });

    const { productIds, collectionIds, ...categoryFields } = categoryData;

    // Check if category exists
    const existingCategory = await db.productCategory.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existingCategory) {
      return { success: false, error: 'Category not found' };
    }

    // Validate parent if provided
    if (categoryFields.parentId !== undefined && categoryFields.parentId !== null) {
      // Prevent setting self as parent
      if (categoryFields.parentId === id) {
        return { success: false, error: 'Category cannot be its own parent' };
      }

      // Check if parent exists
      const parent = await db.productCategory.findUnique({
        where: { id: categoryFields.parentId, deletedAt: null },
      });
      if (!parent) {
        return { success: false, error: 'Parent category not found' };
      }

      // Prevent circular references
      const isDescendant = await checkIfDescendant(id, categoryFields.parentId);
      if (isDescendant) {
        return { success: false, error: 'Cannot set a descendant category as parent' };
      }
    }

    // Check if new slug already exists (if slug is being changed)
    if (categoryFields.slug && categoryFields.slug !== existingCategory.slug) {
      const slugExists = await db.productCategory.findUnique({
        where: { slug: categoryFields.slug },
      });
      if (slugExists) {
        return { success: false, error: 'A category with this slug already exists' };
      }
    }

    // Update category with relationships in a transaction
    const category = await db.$transaction(async (tx) => {
      // Update the category
      const updatedCategory = await tx.productCategory.update({
        where: { id },
        data: {
          ...categoryFields,
          deletedById: session.user.id,
        },
      });

      // Update product relationships if provided
      if (productIds !== undefined) {
        await tx.productCategory.update({
          where: { id },
          data: {
            products: {
              set: productIds.map((productId) => ({ id: productId })),
            },
          },
        });
      }

      // Update collection relationships if provided
      if (collectionIds !== undefined) {
        await tx.productCategory.update({
          where: { id },
          data: {
            collections: {
              set: collectionIds.map((collectionId) => ({ id: collectionId })),
            },
          },
        });
      }

      return updatedCategory;
    });

    revalidatePath('/pim3/categories');
    return { success: true, data: category };
  } catch (error) {
    console.error('Failed to update category:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update category' };
  }
}

// Delete category (soft delete)
export async function deleteCategory(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await db.productCategory.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

// Restore deleted category
export async function restoreCategory(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await db.productCategory.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });

    revalidatePath('/pim3/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to restore category:', error);
    return { success: false, error: 'Failed to restore category' };
  }
}

// Helper function to check if a category is a descendant of another
async function checkIfDescendant(
  categoryId: string,
  potentialAncestorId: string,
): Promise<boolean> {
  const category = await db.productCategory.findUnique({
    select: { parentId: true },
    where: { id: categoryId },
  });

  if (!category || !category.parentId) {
    return false;
  }

  if (category.parentId === potentialAncestorId) {
    return true;
  }

  return checkIfDescendant(category.parentId, potentialAncestorId);
}

// Get category hierarchy (tree structure)
export async function getCategoryTree(includeDeleted = false) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const categories = await db.productCategory.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
            collections: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });

    // Build tree structure
    const categoryMap = new Map<string, any>();
    const tree: any[] = [];

    // First pass: create map
    categories.forEach((category: any) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // Second pass: build tree
    categories.forEach((category: any) => {
      const categoryNode = categoryMap.get(category.id);
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        tree.push(categoryNode);
      }
    });

    return { success: true, data: tree };
  } catch (error) {
    console.error('Failed to get category tree:', error);
    return { success: false, error: 'Failed to get category tree' };
  }
}

// Duplicate category
export async function duplicateCategory(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const originalCategory = await db.productCategory.findUnique({
      where: { id, deletedAt: null },
      include: {
        products: true,
        collections: true,
      },
    });

    if (!originalCategory) {
      return { success: false, error: 'Category not found' };
    }

    // Duplicate category with relationships in a transaction
    const duplicatedCategory = await db.$transaction(async (tx) => {
      const {
        id: _id,
        createdAt,
        updatedAt,
        deletedAt,
        deletedById,
        products,
        collections,
        ...categoryData
      } = originalCategory;

      // Generate unique slug
      let newSlug = `${categoryData.slug}-copy`;
      let counter = 1;
      while (await tx.productCategory.findUnique({ where: { slug: newSlug } })) {
        newSlug = `${categoryData.slug}-copy-${counter}`;
        counter++;
      }

      // Create duplicate with modified name and slug
      const duplicate = await tx.productCategory.create({
        data: {
          ...categoryData,
          name: `${categoryData.name} (Copy)`,
          slug: newSlug,
          deletedById: session.user.id,
        },
      });

      // Duplicate product relationships
      if (products.length > 0) {
        await tx.productCategory.update({
          where: { id: duplicate.id },
          data: {
            products: {
              connect: products.map((product) => ({ id: product.id })),
            },
          },
        });
      }

      // Duplicate collection relationships
      if (collections.length > 0) {
        await tx.productCategory.update({
          where: { id: duplicate.id },
          data: {
            collections: {
              connect: collections.map((collection) => ({ id: collection.id })),
            },
          },
        });
      }

      return duplicate;
    });

    revalidatePath('/pim3/categories');
    return { success: true, data: duplicatedCategory };
  } catch (error) {
    console.error('Failed to duplicate category:', error);
    return { success: false, error: 'Failed to duplicate category' };
  }
}

// Get available options for relationships
export async function getCategoryRelationshipOptions() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const [products, collections, parentCategories] = await Promise.all([
      db.product.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, sku: true },
        orderBy: { name: 'asc' },
      }),
      db.collection.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      db.productCategory.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      success: true,
      data: {
        products,
        collections,
        parentCategories,
      },
    };
  } catch (error) {
    console.error('Failed to fetch relationship options:', error);
    return { success: false, error: 'Failed to fetch relationship options' };
  }
}
