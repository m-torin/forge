'use server';

import { revalidatePath } from 'next/cache';

import { prisma, orm } from '@repo/database/prisma';
import { type BrandType, ContentStatus, type Prisma } from '@repo/database/prisma';
import { auth } from '@repo/auth/server';


/**
 * PIM3-specific brand actions
 * 
 * These actions provide enhanced functionality specific to PIM3:
 * - Hierarchical brand relationships (parent/child)
 * - Soft delete/restore capabilities
 * - Brand tree visualization
 * - Bulk operations
 * - Copy generation
 * - Detailed filtering options
 */

// Enhanced getBrands with PIM3-specific features (hierarchy, soft delete, etc.)
export async function getBrands(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  type?: BrandType;
  parentId?: string | null;
  includeDeleted?: boolean;
}) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const {
    type,
    includeDeleted = false,
    limit = 50,
    page = 1,
    parentId,
    search,
    status,
  } = params || {};

  const skip = (page - 1) * limit;

  const where: Prisma.BrandWhereInput = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
    ...(type && { type }),
    ...(parentId !== undefined && { parentId }),
  };

  const [brands, total] = await Promise.all([
    orm.findManyBrands({
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
    orm.countBrands({ where }),
  ]);

  return {
    brands,
    limit,
    page,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// Get a single brand by ID
export async function getBrand(id: string) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  const brand = await orm.findUniqueBrand({
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

  if (!brand) {
    throw new Error('Brand not found');
  }

  return brand;
}

// Create a new brand
export async function createBrand(data: {
  name: string;
  slug: string;
  status: ContentStatus;
  type: BrandType;
  parentId?: string | null;
  displayOrder?: number;
  baseUrl?: string;
  copy?: any;
}) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  // Check if slug already exists
  const existing = await orm.findUniqueBrand({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error('A brand with this slug already exists');
  }

  // Validate parent exists if provided
  if (data.parentId) {
    const parent = await orm.findUniqueBrand({
      where: { id: data.parentId },
    });
    if (!parent) {
      throw new Error('Parent brand not found');
    }
  }

  const brand = await orm.createBrand({
    data: {
      name: data.name,
      type: data.type,
      baseUrl: data.baseUrl,
      copy: data.copy || {},
      displayOrder: data.displayOrder || 0,
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

  revalidatePath('/pim3/brands');
  return brand;
}

// Update a brand
export async function updateBrand(
  id: string,
  data: {
    name?: string;
    slug?: string;
    status?: ContentStatus;
    type?: BrandType;
    parentId?: string | null;
    displayOrder?: number;
    baseUrl?: string;
    copy?: any;
  },
) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  // Check if brand exists
  const existing = await orm.findUniqueBrand({
    where: { id },
  });

  if (!existing) {
    throw new Error('Brand not found');
  }

  // Check if new slug already exists (if slug is being changed)
  if (data.slug && data.slug !== existing.slug) {
    const slugExists = await orm.findUniqueBrand({
      where: { slug: data.slug },
    });
    if (slugExists) {
      throw new Error('A brand with this slug already exists');
    }
  }

  // Validate parent exists if provided
  if (data.parentId !== undefined && data.parentId !== null) {
    // Prevent setting self as parent
    if (data.parentId === id) {
      throw new Error('Brand cannot be its own parent');
    }

    // Check if parent exists
    const parent = await orm.findUniqueBrand({
      where: { id: data.parentId },
    });
    if (!parent) {
      throw new Error('Parent brand not found');
    }

    // Prevent circular references
    const isDescendant = await checkIfDescendant(id, data.parentId);
    if (isDescendant) {
      throw new Error('Cannot set a descendant brand as parent');
    }
  }

  const brand = await orm.updateBrand({
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.baseUrl !== undefined && { baseUrl: data.baseUrl }),
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

  revalidatePath('/pim3/brands');
  return brand;
}

// Delete a brand (soft delete)
export async function deleteBrand(id: string) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  const brand = await orm.updateBrand({
    data: {
      deletedAt: new Date(),
      deletedById: 'system', // session.user.id,
    },
    where: { id },
  });

  revalidatePath('/pim3/brands');
  return brand;
}

// Restore a deleted brand
export async function restoreBrand(id: string) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  const brand = await orm.updateBrand({
    data: {
      deletedAt: null,
      deletedById: null,
    },
    where: { id },
  });

  revalidatePath('/pim3/brands');
  return brand;
}

// Helper function to check if a brand is a descendant of another
async function checkIfDescendant(brandId: string, potentialAncestorId: string): Promise<boolean> {
  const brand = await orm.findUniqueBrand({
    select: { parentId: true },
    where: { id: brandId },
  });

  if (!brand || !brand.parentId) {
    return false;
  }

  if (brand.parentId === potentialAncestorId) {
    return true;
  }

  return checkIfDescendant(brand.parentId, potentialAncestorId);
}

// Get brand hierarchy (tree structure)
export async function getBrandTree(includeDeleted = false) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  const brands = await orm.findManyBrands({
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
  const brandMap = new Map<string, any>();
  const tree: any[] = [];

  // First pass: create map
  brands.forEach((brand) => {
    brandMap.set(brand.id, {
      ...brand,
      children: [],
    });
  });

  // Second pass: build tree
  brands.forEach((brand) => {
    const brandNode = brandMap.get(brand.id);
    if (brand.parentId) {
      const parent = brandMap.get(brand.parentId);
      if (parent) {
        parent.children.push(brandNode);
      }
    } else {
      tree.push(brandNode);
    }
  });

  return tree;
}

// Duplicate a brand
export async function duplicateBrand(id: string) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  const original = await orm.findUniqueBrand({
    where: { id },
  });

  if (!original) {
    throw new Error('Brand not found');
  }

  // Generate unique slug
  let newSlug = `${original.slug}-copy`;
  let counter = 1;
  while (await orm.findUniqueBrand({ where: { slug: newSlug } })) {
    newSlug = `${original.slug}-copy-${counter}`;
    counter++;
  }

  const duplicate = await orm.createBrand({
    data: {
      name: `${original.name} (Copy)`,
      type: original.type,
      baseUrl: original.baseUrl,
      copy: original.copy,
      displayOrder: original.displayOrder + 1,
      parentId: original.parentId,
      slug: newSlug,
      status: ContentStatus.DRAFT,
    },
  });

  revalidatePath('/pim3/brands');
  return duplicate;
}
