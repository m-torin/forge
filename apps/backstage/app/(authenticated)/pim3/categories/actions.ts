'use server';

import { revalidatePath } from 'next/cache';

// import { auth } from '@repo/auth/server';
import { orm } from '@repo/database/prisma';
import { ContentStatus, type Prisma } from '@repo/database/prisma';

// Get all categories with pagination and filtering
export async function getCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  parentId?: string | null;
  includeDeleted?: boolean;
}) {

  const { includeDeleted = false, limit = 50, page = 1, parentId, search, status } = params || {};

  const skip = (page - 1) * limit;

  const where: Prisma.ProductCategoryWhereInput = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
    ...(parentId !== undefined && { parentId }),
  };

  const [categories, total] = await Promise.all([
    orm.findManyProductCategories({
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
        children: {
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          where: includeDeleted ? {} : { deletedAt: null },
        },
        parent: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit,
      where,
    }),
    orm.countProductCategories({ where }),
  ]);

  return {
    categories,
    limit,
    page,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// Get a single category by ID
export async function getCategory(id: string) {

  const category = await orm.findUniqueProductCategory({
    include: {
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
      children: {
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      },
      parent: true,
    },
    where: { id },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
}

// Create a new category
export async function createCategory(data: {
  name: string;
  slug: string;
  status: ContentStatus;
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  copy?: any;
}) {

  // Check if slug already exists
  const existing = await orm.findUniqueProductCategory({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error('A category with this slug already exists');
  }

  // Validate parent exists if provided
  if (data.parentId) {
    const parent = await orm.findUniqueProductCategory({
      where: { id: data.parentId },
    });
    if (!parent) {
      throw new Error('Parent category not found');
    }
  }

  const category = await orm.createProductCategory({
    data: {
      name: data.name,
      copy: data.copy || {},
      description: data.description,
      displayOrder: data.displayOrder || 0,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      metaTitle: data.metaTitle,
      parentId: data.parentId,
      slug: data.slug,
      status: data.status,
    },
    include: {
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
      parent: true,
    },
  });

  revalidatePath('/pim3/categories');
  return category;
}

// Update a category
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    status?: ContentStatus;
    description?: string;
    parentId?: string | null;
    displayOrder?: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    copy?: any;
  },
) {

  // Check if category exists
  const existing = await orm.findUniqueProductCategory({
    where: { id },
  });

  if (!existing) {
    throw new Error('Category not found');
  }

  // Check if new slug already exists (if slug is being changed)
  if (data.slug && data.slug !== existing.slug) {
    const slugExists = await orm.findUniqueProductCategory({
      where: { slug: data.slug },
    });
    if (slugExists) {
      throw new Error('A category with this slug already exists');
    }
  }

  // Validate parent exists if provided
  if (data.parentId !== undefined && data.parentId !== null) {
    // Prevent setting self as parent
    if (data.parentId === id) {
      throw new Error('Category cannot be its own parent');
    }

    // Check if parent exists
    const parent = await orm.findUniqueProductCategory({
      where: { id: data.parentId },
    });
    if (!parent) {
      throw new Error('Parent category not found');
    }

    // Prevent circular references
    const isDescendant = await checkIfDescendant(id, data.parentId);
    if (isDescendant) {
      throw new Error('Cannot set a descendant category as parent');
    }
  }

  const category = await orm.updateProductCategory({
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
      ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords }),
      ...(data.copy !== undefined && { copy: data.copy }),
    },
    include: {
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
      children: true,
      parent: true,
    },
    where: { id },
  });

  revalidatePath('/pim3/categories');
  return category;
}

// Delete a category (soft delete)
export async function deleteCategory(id: string) {
  const category = await orm.updateProductCategory({
    data: {
      deletedAt: new Date(),
      deletedById: 'test-user',
    },
    where: { id },
  });

  revalidatePath('/pim3/categories');
  return category;
}

// Restore a deleted category
export async function restoreCategory(id: string) {

  const category = await orm.updateProductCategory({
    data: {
      deletedAt: null,
      deletedById: null,
    },
    where: { id },
  });

  revalidatePath('/pim3/categories');
  return category;
}

// Helper function to check if a category is a descendant of another
async function checkIfDescendant(
  categoryId: string,
  potentialAncestorId: string,
): Promise<boolean> {
  const category = await orm.findUniqueProductCategory({
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

  const categories = await orm.findManyProductCategories({
    include: {
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
    },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    where: includeDeleted ? {} : { deletedAt: null },
  });

  // Build tree structure
  const categoryMap = new Map<string, any>();
  const tree: any[] = [];

  // First pass: create map
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
    });
  });

  // Second pass: build tree
  categories.forEach((cat) => {
    const category = categoryMap.get(cat.id);
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      tree.push(category);
    }
  });

  return tree;
}

// Duplicate a category
export async function duplicateCategory(id: string) {

  const original = await orm.findUniqueProductCategory({
    where: { id },
  });

  if (!original) {
    throw new Error('Category not found');
  }

  // Generate unique slug
  let newSlug = `${original.slug}-copy`;
  let counter = 1;
  while (await orm.findUniqueProductCategory({ where: { slug: newSlug } })) {
    newSlug = `${original.slug}-copy-${counter}`;
    counter++;
  }

  const duplicate = await orm.createProductCategory({
    data: {
      name: `${original.name} (Copy)`,
      copy: original.copy,
      description: original.description,
      displayOrder: original.displayOrder + 1,
      metaDescription: original.metaDescription,
      metaKeywords: original.metaKeywords,
      metaTitle: original.metaTitle,
      parentId: original.parentId,
      slug: newSlug,
      status: ContentStatus.DRAFT,
    },
  });

  revalidatePath('/pim3/categories');
  return duplicate;
}
