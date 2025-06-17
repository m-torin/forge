'use server';

import {
  findManyProductCategoriesOrm,
  countProductCategoriesOrm,
  createProductCategoryOrm,
  updateProductCategoryOrm,
  deleteProductCategoryOrm,
  findUniqueProductCategoryOrm,
} from '../orm/productCategoryOrm';

interface CategoryFilters {
  includeDeleted?: boolean;
  parentId?: string | null;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get categories with advanced filtering, sorting and pagination
 */
export async function getCategoriesAdvancedAction(filters: CategoryFilters = {}): Promise<{
  success: boolean;
  data?: any[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}> {
  try {
    const {
      includeDeleted = false,
      parentId,
      search,
      status,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {};

    // Handle soft delete filter
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    // Parent filter
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const total = await countProductCategoriesOrm({ where });

    // Get categories with pagination and sorting
    const categories = await findManyProductCategoriesOrm({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Calculate pagination data
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: categories,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error('Error getting categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get categories',
    };
  }
}

/**
 * Create category with advanced validation
 */
export async function createCategoryAdvancedAction(data: {
  name: string;
  slug?: string;
  status?: string;
  parentId?: string;
  copy?: any;
  createdBy?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Generate slug if not provided
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    // Validate parent if provided
    if (data.parentId) {
      const parent = await findUniqueProductCategoryOrm({
        where: { id: data.parentId },
      });
      if (!parent) {
        return { success: false, error: 'Parent category not found' };
      }
    }

    const category = await createProductCategoryOrm({
      data: {
        name: data.name,
        slug,
        status: (data.status as any) || 'PUBLISHED',
        parentId: data.parentId,
        copy: data.copy || {},
      },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return { success: true, data: category };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category',
    };
  }
}

/**
 * Update category with validation
 */
export async function updateCategoryAdvancedAction(
  categoryId: string,
  data: {
    name?: string;
    slug?: string;
    status?: string;
    parentId?: string;
    copy?: any;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Validate parent if provided
    if (data.parentId) {
      const parent = await findUniqueProductCategoryOrm({
        where: { id: data.parentId },
      });
      if (!parent) {
        return { success: false, error: 'Parent category not found' };
      }

      // Check for circular reference
      if (data.parentId === categoryId) {
        return { success: false, error: 'Category cannot be its own parent' };
      }
    }

    const category = await updateProductCategoryOrm({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.status && { status: data.status as any }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.copy !== undefined && { copy: data.copy }),
      },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return { success: true, data: category };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
    };
  }
}

/**
 * Delete category with validation
 */
export async function deleteCategoryAdvancedAction(
  categoryId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if category has children
    const childrenCount = await countProductCategoriesOrm({
      where: { parentId: categoryId },
    });

    if (childrenCount > 0) {
      return { success: false, error: 'Cannot delete category with child categories' };
    }

    await deleteProductCategoryOrm({
      where: { id: categoryId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category',
    };
  }
}

/**
 * Get category tree with advanced options
 */
export async function getCategoryTreeAdvancedAction(
  options: {
    includeDeleted?: boolean;
    includeProductCounts?: boolean;
    maxDepth?: number;
    rootParentId?: string | null;
  } = {},
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const {
      includeDeleted = false,
      includeProductCounts = true,
      maxDepth = 5,
      rootParentId = null,
    } = options;

    const where: any = { parentId: rootParentId };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const categories = await findManyProductCategoriesOrm({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: includeProductCounts
          ? {
              select: {
                children: true,
                products: true,
              },
            }
          : undefined,
      },
    });

    // Recursively build tree
    const buildTree = async (items: any[], depth = 0): Promise<any[]> => {
      if (depth >= maxDepth) return items;

      const tree = [];
      for (const item of items) {
        const children = await findManyProductCategoriesOrm({
          where: {
            parentId: item.id,
            ...(includeDeleted ? {} : { deletedAt: null }),
          },
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: includeProductCounts
              ? {
                  select: {
                    children: true,
                    products: true,
                  },
                }
              : undefined,
          },
        });

        tree.push({
          ...item,
          children: children.length > 0 ? await buildTree(children, depth + 1) : [],
        });
      }
      return tree;
    };

    const tree = await buildTree(categories);

    return { success: true, data: tree };
  } catch (error) {
    console.error('Error getting category tree:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get category tree',
    };
  }
}

/**
 * Duplicate category with children
 */
export async function duplicateCategoryAdvancedAction(
  categoryId: string,
  options: {
    includeChildren?: boolean;
    newName?: string;
    newParentId?: string;
  } = {},
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { includeChildren = false, newName, newParentId } = options;

    // Get original category
    const original = await findUniqueProductCategoryOrm({
      where: { id: categoryId },
    });

    if (!original) {
      return { success: false, error: 'Category not found' };
    }

    // Create duplicate
    const duplicate = await createProductCategoryOrm({
      data: {
        name: newName || `${original.name} (Copy)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        status: original.status,
        parentId: newParentId || original.parentId,
        copy: original.copy as any,
      },
    });

    // Recursively duplicate children if requested
    if (includeChildren) {
      const children = await findManyProductCategoriesOrm({
        where: { parentId: categoryId },
      });

      for (const child of children) {
        await duplicateCategoryAdvancedAction(child.id, {
          includeChildren: true,
          newParentId: duplicate.id,
        });
      }
    }

    return { success: true, data: duplicate };
  } catch (error) {
    console.error('Error duplicating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate category',
    };
  }
}
