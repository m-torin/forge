'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server/next';
import {
  getCategoriesAdvancedAction,
  createCategoryAdvancedAction,
  updateCategoryAdvancedAction,
  deleteCategoryAdvancedAction,
  getCategoryTreeAdvancedAction,
  duplicateCategoryAdvancedAction,
  type ContentStatus,
} from '@repo/database/prisma';

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

  const result = await getCategoriesAdvancedAction({
    includeDeleted,
    limit,
    offset: (page - 1) * limit,
    parentId,
    search,
    status,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch categories');
  }

  return {
    categories: result.data || [],
    limit,
    page,
    total: result.pagination?.total || 0,
    totalPages: result.pagination?.totalPages || 0,
  };
}

// Get a single category by ID
export async function getCategory(id: string) {
  // Since there's no single category action, we'll use getCategories with search
  const result = await getCategoriesAdvancedAction({
    limit: 1,
    offset: 0,
  });

  const category = result.data?.find((cat) => cat.id === id);

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
  const result = await createCategoryAdvancedAction(data);

  if (!result.success) {
    throw new Error(result.error || 'Failed to create category');
  }

  revalidatePath('/pim3/categories');
  return result.data;
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
  const result = await updateCategoryAdvancedAction(id, data);

  if (!result.success) {
    throw new Error(result.error || 'Failed to update category');
  }

  revalidatePath('/pim3/categories');
  return result.data;
}

// Delete a category (soft delete)
export async function deleteCategory(id: string) {
  const result = await deleteCategoryAdvancedAction(id, 'test-user');

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete category');
  }

  revalidatePath('/pim3/categories');
  return result.data;
}

// Restore a deleted category
export async function restoreCategory(id: string) {
  const result = await updateCategoryAdvancedAction(id, {
    deletedAt: null,
    deletedById: null,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to restore category');
  }

  revalidatePath('/pim3/categories');
  return result.data;
}

// Get category hierarchy (tree structure)
export async function getCategoryTree(includeDeleted = false) {
  const result = await getCategoryTreeAdvancedAction(includeDeleted);

  if (!result.success) {
    throw new Error(result.error || 'Failed to get category tree');
  }

  return result.data || [];
}

// Duplicate a category
export async function duplicateCategory(id: string) {
  const result = await duplicateCategoryAdvancedAction(id);

  if (!result.success) {
    throw new Error(result.error || 'Failed to duplicate category');
  }

  revalidatePath('/pim3/categories');
  return result.data;
}
