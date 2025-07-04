'use server';

import { revalidatePath } from 'next/cache';

import {
  type BrandType,
  ContentStatus,
  type Prisma,
  findManyBrandsOrm,
  countBrandsOrm,
  findUniqueBrandOrm,
  createBrandOrm,
  updateBrandOrm,
  executeTransaction,
} from '@repo/database/prisma';

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
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

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
    findManyBrandsOrm({
      include: {
        _count: {
          select: {
            children: true,
            products: true,
            collections: true,
            media: true,
          },
        },
        children: {
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          where: includeDeleted ? {} : { deletedAt: null },
        },
        parent: true,
        collections: true,
        media: true,
        products: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit,
      where,
    }),
    countBrandsOrm({ where }),
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

  const brand = await findUniqueBrandOrm({
    include: {
      _count: {
        select: {
          children: true,
          products: true,
          collections: true,
          media: true,
        },
      },
      children: {
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      },
      parent: true,
      collections: true,
      media: true,
      products: true,
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
  // Relationships
  productIds?: string[];
  collectionIds?: string[];
  mediaIds?: string[];
}) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  // Check if slug already exists
  const existing = await findUniqueBrandOrm({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error('A brand with this slug already exists');
  }

  // Validate parent exists if provided
  if (data.parentId) {
    const parent = await findUniqueBrandOrm({
      where: { id: data.parentId },
    });
    if (!parent) {
      throw new Error('Parent brand not found');
    }
  }

  // Use transaction to create brand with relationships
  const brand = await executeTransaction(async (tx) => {
    // Create the brand first
    const newBrand = await tx.brand.create({
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
    });

    // Create relationships in parallel
    const relationshipPromises = [];

    // Brand-Product relationships via PdpJoin
    if (data.productIds && data.productIds.length > 0) {
      const pdpJoinPromises = data.productIds.map(async (productId) => {
        // Check if PdpJoin already exists
        const existing = await tx.pdpJoin.findFirst({
          where: { productId, brandId: newBrand.id },
        });

        if (!existing) {
          // Create a canonical URL for the PdpJoin
          const canonicalUrl = `https://brand-${newBrand.slug}/product-${productId}`;
          return tx.pdpJoin.create({
            data: {
              productId,
              brandId: newBrand.id,
              canonicalUrl,
              copy: {},
            },
          });
        }
      });
      relationshipPromises.push(...pdpJoinPromises);
    }

    // Brand-Collection relationships (direct many-to-many)
    if (data.collectionIds && data.collectionIds.length > 0) {
      relationshipPromises.push(
        tx.brand.update({
          where: { id: newBrand.id },
          data: {
            collections: {
              connect: data.collectionIds.map((id) => ({ id })),
            },
          },
        }),
      );
    }

    // Brand-Media relationships (direct many-to-many)
    if (data.mediaIds && data.mediaIds.length > 0) {
      relationshipPromises.push(
        tx.brand.update({
          where: { id: newBrand.id },
          data: {
            media: {
              connect: data.mediaIds.map((id) => ({ id })),
            },
          },
        }),
      );
    }

    // Execute all relationship promises
    await Promise.all(relationshipPromises);

    // Return the brand with full relationships
    return tx.brand.findUnique({
      where: { id: newBrand.id },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
            collections: true,
            media: true,
          },
        },
        parent: true,
        collections: true,
        media: true,
        products: true,
      },
    });
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
    // Relationships
    productIds?: string[];
    collectionIds?: string[];
    mediaIds?: string[];
  },
) {
  // Remove auth check for testing
  // const session = await auth.api.getSession();
  // if (!session) {
  //   throw new Error('Unauthorized');
  // }

  // Check if brand exists
  const existing = await findUniqueBrandOrm({
    where: { id },
  });

  if (!existing) {
    throw new Error('Brand not found');
  }

  // Check if new slug already exists (if slug is being changed)
  if (data.slug && data.slug !== existing.slug) {
    const slugExists = await findUniqueBrandOrm({
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
    const parent = await findUniqueBrandOrm({
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

  // Use transaction to update brand with relationships
  const brand = await executeTransaction(async (tx) => {
    // Update the brand first
    const updatedBrand = await tx.brand.update({
      where: { id },
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
    });

    // Handle relationship updates
    const relationshipPromises = [];

    // Update Brand-Product relationships via PdpJoin
    if (data.productIds !== undefined) {
      // Delete existing PdpJoins for this brand
      relationshipPromises.push(
        tx.pdpJoin.deleteMany({
          where: { brandId: id },
        }),
      );

      // Create new PdpJoins
      if (data.productIds.length > 0) {
        const pdpJoinPromises = data.productIds.map(async (productId) => {
          const canonicalUrl = `https://brand-${updatedBrand.slug}/product-${productId}`;
          return tx.pdpJoin.create({
            data: {
              productId,
              brandId: id,
              canonicalUrl,
              copy: {},
            },
          });
        });
        relationshipPromises.push(...pdpJoinPromises);
      }
    }

    // Update Brand-Collection relationships
    if (data.collectionIds !== undefined) {
      relationshipPromises.push(
        tx.brand.update({
          where: { id },
          data: {
            collections: {
              set: data.collectionIds.map((collectionId) => ({ id: collectionId })),
            },
          },
        }),
      );
    }

    // Update Brand-Media relationships
    if (data.mediaIds !== undefined) {
      relationshipPromises.push(
        tx.brand.update({
          where: { id },
          data: {
            media: {
              set: data.mediaIds.map((mediaId) => ({ id: mediaId })),
            },
          },
        }),
      );
    }

    // Execute all relationship promises
    await Promise.all(relationshipPromises);

    // Return the brand with full relationships
    return tx.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
            collections: true,
            media: true,
          },
        },
        children: true,
        parent: true,
        collections: true,
        media: true,
        products: true,
      },
    });
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

  const brand = await updateBrandOrm({
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

  const brand = await updateBrandOrm({
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
  const brand = await findUniqueBrandOrm({
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

  const brands = await findManyBrandsOrm({
    include: {
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
    where: includeDeleted ? {} : { deletedAt: null },
  });

  // Build tree structure
  const brandMap = new Map<string, any>();
  const tree: any[] = [];

  // First pass: create map
  brands.forEach((brand: any) => {
    brandMap.set(brand.id, {
      ...brand,
      children: [],
    });
  });

  // Second pass: build tree
  brands.forEach((brand: any) => {
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

  const original = await findUniqueBrandOrm({
    where: { id },
  });

  if (!original) {
    throw new Error('Brand not found');
  }

  // Generate unique slug
  let newSlug = `${original.slug}-copy`;
  let counter = 1;
  while (await findUniqueBrandOrm({ where: { slug: newSlug } })) {
    newSlug = `${original.slug}-copy-${counter}`;
    counter++;
  }

  const duplicate = await createBrandOrm({
    data: {
      name: `${original.name} (Copy)`,
      type: original.type,
      baseUrl: original.baseUrl,
      copy: original.copy ?? {},
      displayOrder: original.displayOrder + 1,
      parentId: original.parentId,
      slug: newSlug,
      status: ContentStatus.DRAFT,
    },
  });

  revalidatePath('/pim3/brands');
  return duplicate;
}
