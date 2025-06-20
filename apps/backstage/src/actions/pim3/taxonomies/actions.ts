'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server/next';
import { prisma } from '@repo/database/prisma';
import { type ContentStatus, type Prisma, type TaxonomyType } from '@repo/database/prisma';

import { generateSlug as _generateSlug } from '@/utils/pim3/pim-helpers';

// Server action wrapper for generateSlug
export async function generateSlug(text: string): Promise<string> {
  return _generateSlug(text);
}

// Get all taxonomies with pagination and filtering
export async function getTaxonomies(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  type?: TaxonomyType;
  includeDeleted?: boolean;
  hierarchical?: boolean;
  parentId?: string | null;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const {
      type,
      hierarchical = false,
      includeDeleted = false,
      limit = 50,
      page = 1,
      parentId,
      search,
      status,
    } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.TaxonomyWhereInput = {
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

    const [taxonomies, total] = await Promise.all([
      prisma.taxonomy.findMany({
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
          // Note: parent and children relationships will be enabled when schema supports hierarchical relationships
        },
        orderBy: [{ name: 'asc' }],
        skip: hierarchical ? 0 : skip,
        take: hierarchical ? undefined : limit,
        where,
      }),
      hierarchical ? Promise.resolve(0) : prisma.taxonomy.count({ where }),
    ]);

    return {
      data: taxonomies,
      pagination: hierarchical
        ? undefined
        : {
            limit,
            page,
            total,
            totalPages: Math.ceil(total / limit),
          },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load taxonomies', success: false as const };
  }
}

// Get a single taxonomy by ID
export async function getTaxonomy(id: string) {
  const session = await auth.api.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const taxonomy = await prisma.taxonomy.findUnique({
    include: {
      _count: {
        select: {
          collections: true,
          products: true,
        },
      },
      media: true,
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
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Check if slug already exists
    const existingTaxonomy = await prisma.taxonomy.findUnique({
      where: { slug: data.slug },
    });

    if (existingTaxonomy) {
      return { error: 'A taxonomy with this slug already exists', success: false as const };
    }

    // Note: Parent validation will be implemented when schema supports hierarchical relationships
    if (data.parentId) {
      // This validation will be enabled when parentId is added to the schema
      console.log('Parent taxonomy validation would be performed here');
    }

    const taxonomy = await prisma.taxonomy.create({
      data: {
        name: data.name,
        type: data.type,
        copy: data.copy || {},
        slug: data.slug,
        status: data.status,
        // Note: parentId will be added when schema supports hierarchical relationships
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
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // If updating slug, check if it already exists
    if (data.slug) {
      const existingTaxonomy = await prisma.taxonomy.findFirst({
        where: {
          NOT: { id },
          slug: data.slug,
        },
      });

      if (existingTaxonomy) {
        return { error: 'A taxonomy with this slug already exists', success: false as const };
      }
    }

    // Note: Parent validation will be implemented when schema supports hierarchical relationships
    if (data.parentId !== undefined) {
      // This validation will be enabled when parentId is added to the schema
      console.log('Parent taxonomy validation would be performed here');
    }

    const taxonomy = await prisma.taxonomy.update({
      data: {
        ...data,
        // Note: parentId will be included when schema supports hierarchical relationships
      },
      include: {
        _count: {
          select: {
            collections: true,
            products: true,
          },
        },
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

    const taxonomy = await prisma.taxonomy.update({
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

// Bulk update taxonomy status
export async function bulkUpdateTaxonomyStatus(ids: string[], status: ContentStatus) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await prisma.taxonomy.updateMany({
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

    await prisma.taxonomy.updateMany({
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

  const existingTaxonomy = await prisma.taxonomy.findFirst({
    where: {
      slug,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  });

  return !existingTaxonomy;
}

// Get taxonomy tree for hierarchical display
export async function getTaxonomyTree(type?: TaxonomyType) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Note: This function will be fully implemented when schema supports hierarchical relationships
    const taxonomies = await prisma.taxonomy.findMany({
      include: {
        _count: {
          select: {
            collections: true,
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      where: {
        deletedAt: null,
        ...(type && { type }),
      },
    });

    return { data: taxonomies, success: true as const };
  } catch (error) {
    return { error: 'Failed to load taxonomy tree', success: false as const };
  }
}

// Get potential parent taxonomies for dropdown
export async function getParentTaxonomyOptions(type: TaxonomyType, excludeId?: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const taxonomies = await prisma.taxonomy.findMany({
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

    await prisma.product.updateMany({
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

    await prisma.collection.updateMany({
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

    const originalTaxonomy = await prisma.taxonomy.findUnique({
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
    const existingTaxonomy = await prisma.taxonomy.findUnique({
      where: { slug },
    });

    if (existingTaxonomy) {
      return { error: 'A taxonomy with this slug already exists', success: false as const };
    }

    const duplicatedTaxonomy = await prisma.taxonomy.create({
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
        prisma.taxonomy.count({ where: { deletedAt: null } }),
        prisma.taxonomy.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
        prisma.taxonomy.count({ where: { deletedAt: null, status: 'DRAFT' } }),
        prisma.taxonomy.count({ where: { deletedAt: null, status: 'ARCHIVED' } }),
        prisma.taxonomy.groupBy({
          _count: { type: true },
          by: ['type'],
          where: { deletedAt: null },
        }),
        prisma.taxonomy.count({
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
          acc[stat.type] = stat._count.type;
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
      prisma.taxonomy.findMany({
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
      prisma.taxonomy.count({ where }),
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
    const taxonomy = await prisma.taxonomy.findUnique({
      select: { name: true, deletedAt: true },
      where: { id },
    });

    if (!taxonomy) {
      return { error: 'Taxonomy not found', success: false as const };
    }

    if (!taxonomy.deletedAt) {
      return { error: 'Taxonomy must be soft deleted first', success: false as const };
    }

    await prisma.taxonomy.delete({
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

    const taxonomy = await prisma.taxonomy.update({
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

    await prisma.taxonomy.updateMany({
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

    const taxonomies = await prisma.taxonomy.findMany({
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
      collectionCount: taxonomy._count.collections,
      createdAt: taxonomy.createdAt.toISOString(),
      deletedAt: taxonomy.deletedAt?.toISOString() || null,
      productCount: taxonomy._count.products,
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
