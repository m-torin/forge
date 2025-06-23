'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server/next';
import { type ContentStatus, type Prisma, type TaxonomyType } from '@repo/database/prisma';
import {
  findManyTaxonomiesOrm,
  countTaxonomiesOrm,
  createTaxonomyOrm,
  updateTaxonomyOrm,
  deleteTaxonomyOrm,
  findUniqueTaxonomyOrm,
  findFirstTaxonomyOrm,
  updateManyTaxonomiesOrm,
  deleteManyTaxonomiesOrm,
  aggregateTaxonomiesOrm,
  groupByTaxonomiesOrm,
  updateManyProductsOrm,
  updateManyCollectionsOrm,
} from '@repo/database/prisma';

import { generateSlug as generateSlugUtil } from '@/utils/pim3/pim-helpers';

// Server action wrapper for generateSlug
export async function generateSlug(text: string): Promise<string> {
  return generateSlugUtil(text);
}

// Get all taxonomies with pagination and filtering

// Get a single taxonomy by ID
export async function getTaxonomy(id: string) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const taxonomy = await findUniqueTaxonomyOrm({
    include: {
      _count: {
        select: {
          collections: true,
          products: true,
          children: true,
        },
      },
      media: true,
      parent: true,
      children: {
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      },
    },
    where: { id },
  });

  if (!taxonomy) {
    throw new Error('Taxonomy not found');
  }

  return taxonomy;
}

// Create a new taxonomy
export async function createTaxonomy(data: {
  name: string;
  slug: string;
  type: TaxonomyType;
  status: ContentStatus;
  copy?: Record<string, any>;
  parentId?: string | null;
  displayOrder?: number;
  level?: number;
  path?: string;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if slug already exists
    const existingTaxonomy = await findUniqueTaxonomyOrm({
      where: { slug: data.slug },
    });

    if (existingTaxonomy) {
      return { error: 'A taxonomy with this slug already exists', success: false as const };
    }

    // Validate parent if provided
    let parentTaxonomy = null;
    if (data.parentId) {
      parentTaxonomy = await findUniqueTaxonomyOrm({
        where: { id: data.parentId },
        select: { id: true, level: true, path: true, slug: true },
      });

      if (!parentTaxonomy) {
        return { error: 'Parent taxonomy not found', success: false as const };
      }

      // Check level constraints for categories (using ATTRACTION as the category equivalent)
      if (data.type === 'ATTRACTION' && parentTaxonomy.level >= 2) {
        return { error: 'Categories cannot exceed 3 levels deep', success: false as const };
      }

      // Tags cannot have parents
      if (data.type === 'TAG') {
        return { error: 'Tags cannot have parent taxonomies', success: false as const };
      }
    }

    // Calculate hierarchy data
    const level = parentTaxonomy ? parentTaxonomy.level + 1 : 0;
    const path = parentTaxonomy
      ? `${parentTaxonomy.path || parentTaxonomy.slug}/${data.slug}`
      : data.slug;

    const taxonomy = await createTaxonomyOrm({
      data: {
        name: data.name,
        type: data.type,
        copy: data.copy || {},
        slug: data.slug,
        status: data.status,
        parentId: data.parentId,
        displayOrder: data.displayOrder || 0,
        level,
        path,
      },
      include: {
        _count: {
          select: {
            collections: true,
            products: true,
            children: true,
          },
        },
        parent: true,
        children: true,
      },
    });

    revalidatePath('/pim3/taxonomies');
    return { data: taxonomy, success: true as const };
  } catch (error) {
    return { error: 'Failed to create taxonomy', success: false as const };
  }
}

// Update a taxonomy
export async function updateTaxonomy(
  id: string,
  data: {
    name?: string;
    slug?: string;
    type?: TaxonomyType;
    status?: ContentStatus;
    copy?: Record<string, any>;
    parentId?: string | null;
    displayOrder?: number;
    level?: number;
    path?: string;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // If updating slug, check if it already exists
    if (data.slug) {
      const existingTaxonomy = await findFirstTaxonomyOrm({
        where: {
          NOT: { id },
          slug: data.slug,
        },
      });

      if (existingTaxonomy) {
        return { error: 'A taxonomy with this slug already exists', success: false as const };
      }
    }

    // Get the current taxonomy
    const currentTaxonomy = await findUniqueTaxonomyOrm({
      where: { id },
      select: { slug: true, parentId: true },
    });

    if (!currentTaxonomy) {
      return { error: 'Taxonomy not found', success: false as const };
    }

    // Validate parent if provided
    let parentTaxonomy = null;
    if (data.parentId !== undefined && data.parentId !== null) {
      // Prevent setting self as parent
      if (data.parentId === id) {
        return { error: 'Taxonomy cannot be its own parent', success: false as const };
      }

      parentTaxonomy = await findUniqueTaxonomyOrm({
        where: { id: data.parentId },
        select: { id: true, level: true, path: true, slug: true },
      });

      if (!parentTaxonomy) {
        return { error: 'Parent taxonomy not found', success: false as const };
      }

      // Check level constraints for categories (using ATTRACTION as the category equivalent)
      if ((data.type || 'ATTRACTION') === 'ATTRACTION' && parentTaxonomy.level >= 2) {
        return { error: 'Categories cannot exceed 3 levels deep', success: false as const };
      }

      // Tags cannot have parents
      if ((data.type || 'TAG') === 'TAG') {
        return { error: 'Tags cannot have parent taxonomies', success: false as const };
      }

      // Prevent circular references by checking if new parent is a descendant
      const isDescendant = await checkIfDescendant(data.parentId, id);
      if (isDescendant) {
        return { error: 'Cannot set a descendant taxonomy as parent', success: false as const };
      }
    }

    // Calculate hierarchy data if parent is changing
    let updateData: any = { ...data };
    if (data.parentId !== undefined || data.slug) {
      const slug = data.slug || currentTaxonomy.slug;
      if (data.parentId !== undefined) {
        const level = parentTaxonomy ? parentTaxonomy.level + 1 : 0;
        const path = parentTaxonomy
          ? `${parentTaxonomy.path || parentTaxonomy.slug}/${slug}`
          : slug;

        updateData.level = level;
        updateData.path = path;
      }
    }

    const taxonomy = await updateTaxonomyOrm({
      data: updateData,
      include: {
        _count: {
          select: {
            collections: true,
            products: true,
            children: true,
          },
        },
        parent: true,
        children: true,
      },
      where: { id },
    });

    revalidatePath('/pim3/taxonomies');
    return { data: taxonomy, success: true as const };
  } catch (error) {
    return { error: 'Failed to update taxonomy', success: false as const };
  }
}

// Delete a taxonomy (soft delete)
export async function deleteTaxonomy(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const taxonomy = await updateTaxonomyOrm({
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
      where: { id },
    });

    revalidatePath('/pim3/taxonomies');
    return { data: taxonomy, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete taxonomy', success: false as const };
  }
}

// Helper function to check if a taxonomy is a descendant of another
async function checkIfDescendant(
  taxonomyId: string,
  potentialAncestorId: string,
): Promise<boolean> {
  const taxonomy = await findUniqueTaxonomyOrm({
    select: { parentId: true },
    where: { id: taxonomyId },
  });

  if (!taxonomy || !taxonomy.parentId) {
    return false;
  }

  if (taxonomy.parentId === potentialAncestorId) {
    return true;
  }

  return checkIfDescendant(taxonomy.parentId, potentialAncestorId);
}

// Get taxonomy hierarchy (tree structure)
export async function getTaxonomyTree(params?: { type?: TaxonomyType; includeDeleted?: boolean }) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { type, includeDeleted = false } = params || {};

    const where: Prisma.TaxonomyWhereInput = {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(type && { type }),
    };

    const taxonomies = await findManyTaxonomiesOrm({
      include: {
        _count: {
          select: {
            children: true,
            collections: true,
            products: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      where,
    });

    // Build tree structure
    const taxonomyMap = new Map<string, any>();
    const tree: any[] = [];

    // First pass: create map
    taxonomies.forEach((taxonomy: any) => {
      taxonomyMap.set(taxonomy.id, {
        ...taxonomy,
        children: [],
      });
    });

    // Second pass: build tree
    taxonomies.forEach((taxonomy: any) => {
      const taxonomyNode = taxonomyMap.get(taxonomy.id);
      if (taxonomy.parentId) {
        const parent = taxonomyMap.get(taxonomy.parentId);
        if (parent) {
          parent.children.push(taxonomyNode);
        }
      } else {
        tree.push(taxonomyNode);
      }
    });

    return { data: tree, success: true as const };
  } catch (error) {
    return { error: 'Failed to load taxonomy tree', success: false as const };
  }
}

// Bulk update taxonomy status
export async function bulkUpdateTaxonomyStatus(ids: string[], status: ContentStatus) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await updateManyTaxonomiesOrm({
      data: { status },
      where: {
        id: { in: ids },
        deletedAt: null,
      },
    });

    revalidatePath('/pim3/taxonomies');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to update taxonomies', success: false as const };
  }
}

// Bulk delete taxonomies (soft delete)
export async function bulkDeleteTaxonomies(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await updateManyTaxonomiesOrm({
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
      where: {
        id: { in: ids },
        deletedAt: null,
      },
    });

    revalidatePath('/pim3/taxonomies');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to delete taxonomies', success: false as const };
  }
}

// Check if a slug is available
export async function checkSlugAvailability(slug: string, excludeId?: string) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const existingTaxonomy = await findFirstTaxonomyOrm({
    where: {
      slug,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  });

  return !existingTaxonomy;
}

// Get potential parent taxonomies for dropdown
export async function getParentTaxonomyOptions(type: TaxonomyType, excludeId?: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const taxonomies = await findManyTaxonomiesOrm({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      where: {
        type,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });

    // Format for select dropdown
    const options = taxonomies.map((taxonomy) => ({
      group: 'Available Taxonomies',
      label: taxonomy.name,
      value: taxonomy.id,
    }));

    return { data: options, success: true as const };
  } catch (error) {
    return { error: 'Failed to load parent options', success: false as const };
  }
}

// Bulk assign taxonomies to products
export async function bulkAssignTaxonomiesToProducts(taxonomyIds: string[], productIds: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Create many-to-many relationships
    const assignments = [];
    for (const taxonomyId of taxonomyIds) {
      for (const productId of productIds) {
        assignments.push({ productId, taxonomyId });
      }
    }

    await updateManyProductsOrm({
      data: {
        // Note: This would use connectOrCreate when the schema supports many-to-many
        // taxonomies: { connectOrCreate: assignments }
      },
      where: { id: { in: productIds } },
    });

    revalidatePath('/pim3/taxonomies');
    revalidatePath('/pim3/products');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to assign taxonomies to products', success: false as const };
  }
}

// Bulk assign taxonomies to collections
export async function bulkAssignTaxonomiesToCollections(
  taxonomyIds: string[],
  collectionIds: string[],
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Create many-to-many relationships
    const assignments = [];
    for (const taxonomyId of taxonomyIds) {
      for (const collectionId of collectionIds) {
        assignments.push({ collectionId, taxonomyId });
      }
    }

    await updateManyCollectionsOrm({
      data: {
        // Note: This would use connectOrCreate when the schema supports many-to-many
        // taxonomies: { connectOrCreate: assignments }
      },
      where: { id: { in: collectionIds } },
    });

    revalidatePath('/pim3/taxonomies');
    revalidatePath('/pim3/collections');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to assign taxonomies to collections', success: false as const };
  }
}

// Duplicate a taxonomy
export async function duplicateTaxonomy(id: string, newName?: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const originalTaxonomy = await findUniqueTaxonomyOrm({
      include: {
        media: true,
      },
      where: { id },
    });

    if (!originalTaxonomy) {
      return { error: 'Taxonomy not found', success: false as const };
    }

    const name = newName || `${originalTaxonomy.name} (Copy)`;
    const slug = await generateSlug(name);

    // Check if slug already exists
    const existingTaxonomy = await findUniqueTaxonomyOrm({
      where: { slug },
    });

    if (existingTaxonomy) {
      return { error: 'A taxonomy with this slug already exists', success: false as const };
    }

    const duplicatedTaxonomy = await createTaxonomyOrm({
      data: {
        name,
        type: originalTaxonomy.type,
        copy: originalTaxonomy.copy || {},
        slug,
        status: 'DRAFT', // Always create duplicates as draft
        // Note: parentId would be included when schema supports hierarchical relationships
      },
      include: {
        _count: {
          select: {
            collections: true,
            products: true,
          },
        },
      },
    });

    revalidatePath('/pim3/taxonomies');
    return { data: duplicatedTaxonomy, success: true as const };
  } catch (error) {
    return { error: 'Failed to duplicate taxonomy', success: false as const };
  }
}

// Get taxonomy statistics
export async function getTaxonomyStats() {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const [totalCount, publishedCount, draftCount, archivedCount, typeStats, recentCount] =
      await Promise.all([
        countTaxonomiesOrm({ where: { deletedAt: null } }),
        countTaxonomiesOrm({ where: { deletedAt: null, status: 'PUBLISHED' } }),
        countTaxonomiesOrm({ where: { deletedAt: null, status: 'DRAFT' } }),
        countTaxonomiesOrm({ where: { deletedAt: null, status: 'ARCHIVED' } }),
        groupByTaxonomiesOrm({
          _count: { type: true },
          by: ['type'],
          where: { deletedAt: null },
        }),
        countTaxonomiesOrm({
          where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
            deletedAt: null,
          },
        }),
      ]);

    const stats = {
      archived: archivedCount,
      byType: typeStats.reduce(
        (acc, stat) => {
          acc[stat.type] = (stat._count as any)?.type || 0;
          return acc;
        },
        {} as Record<TaxonomyType, number>,
      ),
      draft: draftCount,
      published: publishedCount,
      recent: recentCount,
      total: totalCount,
    };

    return { data: stats, success: true as const };
  } catch (error) {
    return { error: 'Failed to load taxonomy statistics', success: false as const };
  }
}

// Search taxonomies with advanced filters
export async function searchTaxonomies(params: {
  query?: string;
  types?: TaxonomyType[];
  statuses?: ContentStatus[];
  hasMedia?: boolean;
  hasProducts?: boolean;
  hasCollections?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  page?: number;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const {
      types,
      createdAfter,
      createdBefore,
      hasCollections,
      hasMedia,
      hasProducts,
      limit = 50,
      page = 1,
      query,
      statuses,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.TaxonomyWhereInput = {
      deletedAt: null,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(types && types.length > 0 && { type: { in: types } }),
      ...(statuses && statuses.length > 0 && { status: { in: statuses } }),
      ...(hasMedia !== undefined && {
        media: hasMedia ? { some: {} } : { none: {} },
      }),
      ...(hasProducts !== undefined && {
        products: hasProducts ? { some: {} } : { none: {} },
      }),
      ...(hasCollections !== undefined && {
        collections: hasCollections ? { some: {} } : { none: {} },
      }),
      ...(createdAfter && { createdAt: { gte: createdAfter } }),
      ...(createdBefore && { createdAt: { lte: createdBefore } }),
    };

    const [taxonomies, total] = await Promise.all([
      findManyTaxonomiesOrm({
        include: {
          _count: {
            select: {
              collections: true,
              products: true,
            },
          },
          media: {
            select: {
              id: true,
              type: true,
              url: true,
              altText: true,
            },
            take: 1,
          },
        },
        orderBy: [
          { status: 'desc' }, // Published first
          { name: 'asc' },
        ],
        skip,
        take: limit,
        where,
      }),
      countTaxonomiesOrm({ where }),
    ]);

    return {
      data: taxonomies,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to search taxonomies', success: false as const };
  }
}

// Hard delete a taxonomy (permanent deletion)
export async function hardDeleteTaxonomy(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if taxonomy exists and is already soft deleted
    const taxonomy = await findUniqueTaxonomyOrm({
      select: { name: true, deletedAt: true },
      where: { id },
    });

    if (!taxonomy) {
      return { error: 'Taxonomy not found', success: false as const };
    }

    if (!taxonomy.deletedAt) {
      return { error: 'Taxonomy must be soft deleted first', success: false as const };
    }

    await deleteTaxonomyOrm({
      where: { id },
    });

    revalidatePath('/pim3/taxonomies');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to permanently delete taxonomy', success: false as const };
  }
}

// Restore a soft-deleted taxonomy
export async function restoreTaxonomy(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const taxonomy = await updateTaxonomyOrm({
      data: {
        deletedAt: null,
        deletedById: null,
      },
      where: { id },
    });

    revalidatePath('/pim3/taxonomies');
    return { data: taxonomy, success: true as const };
  } catch (error) {
    return { error: 'Failed to restore taxonomy', success: false as const };
  }
}

// Bulk restore taxonomies
export async function bulkRestoreTaxonomies(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await updateManyTaxonomiesOrm({
      data: {
        deletedAt: null,
        deletedById: null,
      },
      where: {
        id: { in: ids },
        deletedAt: { not: null },
      },
    });

    revalidatePath('/pim3/taxonomies');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to restore taxonomies', success: false as const };
  }
}

// Export taxonomies to CSV/JSON
export async function exportTaxonomies(
  format: 'csv' | 'json',
  filters?: {
    type?: TaxonomyType;
    status?: ContentStatus;
    includeDeleted?: boolean;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const where: Prisma.TaxonomyWhereInput = {
      ...(filters?.includeDeleted ? {} : { deletedAt: null }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.status && { status: filters.status }),
    };

    const taxonomies = await findManyTaxonomiesOrm({
      include: {
        _count: {
          select: {
            collections: true,
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      where,
    });

    if (format === 'json') {
      return {
        data: {
          exportedAt: new Date(),
          taxonomies,
          totalCount: taxonomies.length,
        },
        success: true as const,
      };
    }

    // For CSV format, flatten the data
    const csvData = taxonomies.map((taxonomy) => ({
      id: taxonomy.id,
      name: taxonomy.name,
      type: taxonomy.type,
      collectionCount: (taxonomy as any)._count?.collections || 0,
      createdAt: taxonomy.createdAt.toISOString(),
      deletedAt: taxonomy.deletedAt?.toISOString() || null,
      productCount: (taxonomy as any)._count?.products || 0,
      slug: taxonomy.slug,
      status: taxonomy.status,
      updatedAt: taxonomy.updatedAt.toISOString(),
    }));

    return {
      data: {
        csvData,
        exportedAt: new Date(),
        headers: Object.keys(csvData[0] || {}),
        totalCount: csvData.length,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to export taxonomies', success: false as const };
  }
}

// Export getTaxonomies as an alias for getTaxonomyTree for compatibility
export const getTaxonomies = getTaxonomyTree;
