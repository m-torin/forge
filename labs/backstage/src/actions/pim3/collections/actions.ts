'use server';

import { auth } from '@repo/auth/server/next';
import {
  executeTransaction,
  createCollectionAction,
  updateCollectionAction,
  findManyCollectionsOrm,
  findFirstCollectionOrm,
  findUniqueCollectionOrm,
  countCollectionsOrm,
  CollectionType,
  ContentStatus,
} from '@repo/database/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Enhanced Collection CRUD Schema
const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  type: z.nativeEnum(CollectionType).default('OTHER'),
  status: z.nativeEnum(ContentStatus).default('DRAFT'),
  userId: z.string().optional(),
  parentId: z.string().optional(),
  copy: z.record(z.any()).default({}),
});

const collectionRelationshipSchema = z.object({
  productIds: z.array(z.string()).default([]),
  brandIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  taxonomyIds: z.array(z.string()).default([]),
});

const fullCollectionSchema = collectionSchema.merge(collectionRelationshipSchema);

/**
 * PIM3-specific collection actions
 *
 * These actions provide enhanced functionality specific to PIM3:
 * - Hierarchical collection relationships (parent/child)
 * - Soft delete/restore capabilities
 * - Collection tree visualization
 * - Bulk operations
 * - User associations
 * - Detailed filtering and metadata
 */

export interface CollectionData {
  copy?: any;
  name: string;
  parentId?: string | null;
  slug: string;
  status: ContentStatus;
  type: CollectionType;
  userId?: string;
}

// Get all collections with relationships
export async function getCollections(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  type?: CollectionType;
  parentId?: string | null;
  includeDeleted?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const {
      includeDeleted = false,
      limit = 50,
      page = 1,
      parentId,
      search,
      status,
      type,
    } = params || {};
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
      ...(type && { type }),
      ...(parentId !== undefined && { parentId }),
    };

    const [collections, total] = await Promise.all([
      findManyCollectionsOrm({
        where,
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: {
            select: { id: true, name: true, slug: true, type: true },
            where: includeDeleted ? {} : { deletedAt: null },
            orderBy: { name: 'asc' },
          },
          user: { select: { id: true, name: true, email: true } },
          products: {
            select: { id: true, name: true, sku: true },
            where: { deletedAt: null },
            take: 5,
          },
          brands: {
            select: { id: true, name: true, slug: true },
            where: { deletedAt: null },
            take: 5,
          },
          categories: {
            select: { id: true, name: true, slug: true },
            where: { deletedAt: null },
            take: 5,
          },
          taxonomies: {
            select: { id: true, name: true, type: true },
            where: { deletedAt: null },
            take: 5,
          },
          media: {
            select: { id: true, url: true, type: true },
            where: { deletedAt: null },
            take: 3,
          },
          _count: {
            select: {
              children: true,
              products: true,
              brands: true,
              categories: true,
              taxonomies: true,
              media: true,
              favorites: true,
              registries: true,
            },
          },
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      countCollectionsOrm({ where }),
    ]);

    return {
      success: true,
      data: {
        collections,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return { success: false, error: 'Failed to fetch collections' };
  }
}

// Get single collection with full relationships
export async function getCollection(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const collection = await findUniqueCollectionOrm({
      where: { id, deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          include: { _count: { select: { products: true, children: true } } },
          orderBy: { name: 'asc' },
        },
        user: true,
        products: {
          where: { deletedAt: null },
          include: { media: { where: { deletedAt: null }, take: 1 } },
        },
        brands: {
          where: { deletedAt: null },
          include: { media: { where: { deletedAt: null }, take: 1 } },
        },
        categories: {
          where: { deletedAt: null },
          include: { media: { where: { deletedAt: null }, take: 1 } },
        },
        taxonomies: {
          where: { deletedAt: null },
        },
        media: { where: { deletedAt: null } },
        _count: {
          select: {
            children: true,
            products: true,
            brands: true,
            categories: true,
            taxonomies: true,
            media: true,
            favorites: true,
            registries: true,
          },
        },
      },
    });

    if (!collection) {
      return { success: false, error: 'Collection not found' };
    }

    return { success: true, data: collection };
  } catch (error) {
    console.error('Failed to fetch collection:', error);
    return { success: false, error: 'Failed to fetch collection' };
  }
}

// Create collection with relationships
export async function createCollection(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const data = Object.fromEntries(formData);

    // Parse and validate the data
    const collectionData = fullCollectionSchema.parse({
      ...data,
      copy: data.copy ? JSON.parse(data.copy as string) : {},
      productIds: data.productIds ? JSON.parse(data.productIds as string) : [],
      brandIds: data.brandIds ? JSON.parse(data.brandIds as string) : [],
      categoryIds: data.categoryIds ? JSON.parse(data.categoryIds as string) : [],
      taxonomyIds: data.taxonomyIds ? JSON.parse(data.taxonomyIds as string) : [],
    });

    const { productIds, brandIds, categoryIds, taxonomyIds, ...collectionFields } = collectionData;

    // Validate parent exists if provided
    if (collectionFields.parentId) {
      const parent = await findUniqueCollectionOrm({
        where: { id: collectionFields.parentId, deletedAt: null },
      });
      if (!parent) {
        return { success: false, error: 'Parent collection not found' };
      }
    }

    // Check if slug already exists
    const existingCollection = await findUniqueCollectionOrm({
      where: { slug: collectionFields.slug },
    });
    if (existingCollection) {
      return { success: false, error: 'A collection with this slug already exists' };
    }

    // Create collection with relationships in a transaction
    const collection = await executeTransaction(async (tx) => {
      // Create the collection
      const newCollection = await tx.collection.create({
        data: {
          ...collectionFields,
          userId: collectionFields.userId || session.user.id,
        },
      });

      // Create relationship connections
      const relationshipPromises = [];

      if (productIds.length > 0) {
        relationshipPromises.push(
          tx.collection.update({
            where: { id: newCollection.id },
            data: {
              products: {
                connect: productIds.map((id) => ({ id })),
              },
            },
          }),
        );
      }

      if (brandIds.length > 0) {
        relationshipPromises.push(
          tx.collection.update({
            where: { id: newCollection.id },
            data: {
              brands: {
                connect: brandIds.map((id) => ({ id })),
              },
            },
          }),
        );
      }

      if (categoryIds.length > 0) {
        relationshipPromises.push(
          tx.collection.update({
            where: { id: newCollection.id },
            data: {
              categories: {
                connect: categoryIds.map((id) => ({ id })),
              },
            },
          }),
        );
      }

      if (taxonomyIds.length > 0) {
        relationshipPromises.push(
          tx.collection.update({
            where: { id: newCollection.id },
            data: {
              taxonomies: {
                connect: taxonomyIds.map((id) => ({ id })),
              },
            },
          }),
        );
      }

      await Promise.all(relationshipPromises);

      return newCollection;
    });

    revalidatePath('/pim3/collections');
    return { success: true, data: collection };
  } catch (error) {
    console.error('Failed to create collection:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create collection' };
  }
}

// Update an existing collection
export async function updateCollection(id: string, data: CollectionData) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    // Check if slug already exists (excluding current collection)
    const existingCollection = await findFirstCollectionOrm({
      where: {
        deletedAt: null,
        NOT: {
          id: id,
        },
        slug: data.slug,
      },
    });

    if (existingCollection) {
      throw new Error('A collection with this slug already exists');
    }

    const collection = await updateCollectionAction({
      data: {
        name: data.name,
        type: data.type,
        copy: data.copy || {},
        parentId: data.parentId,
        slug: data.slug,
        status: data.status,
        userId: data.userId || 'system', // session.user.id,
      },
      include: {
        _count: {
          select: {
            brands: true,
            categories: true,
            children: true,
            favorites: true,
            media: true,
            products: true,
            registries: true,
            taxonomies: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      where: { id },
    });

    return collection;
  } catch (error) {
    console.error('Failed to update collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update collection');
  }
}

// Soft delete a collection
export async function deleteCollection(id: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    await updateCollectionAction({
      data: {
        deletedAt: new Date(),
        deletedById: 'system', // session.user.id,
      },
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete collection:', error);
    throw new Error('Failed to delete collection');
  }
}

// Get root collections (collections without parent)
export async function getRootCollections() {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const collections = await findManyCollectionsOrm({
      include: {
        _count: {
          select: {
            brands: true,
            categories: true,
            children: true,
            favorites: true,
            media: true,
            products: true,
            registries: true,
            taxonomies: true,
          },
        },
        children: {
          include: {
            _count: {
              select: {
                brands: true,
                categories: true,
                children: true,
                favorites: true,
                media: true,
                products: true,
                registries: true,
                taxonomies: true,
              },
            },
          },
          where: {
            deletedAt: null,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      where: {
        deletedAt: null,
        parentId: null,
      },
    });

    return collections;
  } catch (error) {
    console.error('Failed to fetch root collections:', error);
    throw new Error('Failed to fetch root collections');
  }
}

// Get child collections of a parent
export async function getChildCollections(parentId: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const collections = await findManyCollectionsOrm({
      include: {
        _count: {
          select: {
            brands: true,
            categories: true,
            children: true,
            favorites: true,
            media: true,
            products: true,
            registries: true,
            taxonomies: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      where: {
        deletedAt: null,
        parentId: parentId,
      },
    });

    return collections;
  } catch (error) {
    console.error('Failed to fetch child collections:', error);
    throw new Error('Failed to fetch child collections');
  }
}

// Get collection hierarchy (tree structure)
export async function getCollectionTree() {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const collections = await findManyCollectionsOrm({
      include: {
        _count: {
          select: {
            brands: true,
            categories: true,
            children: true,
            favorites: true,
            media: true,
            products: true,
            registries: true,
            taxonomies: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      where: {
        deletedAt: null,
      },
    });

    // Build tree structure
    const collectionMap = new Map<string, any>();
    const tree: any[] = [];

    // First pass: create map
    collections.forEach((collection: any) => {
      collectionMap.set(collection.id, {
        ...collection,
        children: [],
      });
    });

    // Second pass: build tree
    collections.forEach((collection: any) => {
      const collectionNode = collectionMap.get(collection.id);
      if (collection.parentId) {
        const parent = collectionMap.get(collection.parentId);
        if (parent) {
          parent.children.push(collectionNode);
        }
      } else {
        tree.push(collectionNode);
      }
    });

    return tree;
  } catch (error) {
    console.error('Failed to get collection tree:', error);
    throw new Error('Failed to get collection tree');
  }
}

// Duplicate a collection
export async function duplicateCollection(id: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const original = await findFirstCollectionOrm({
      where: { id },
    });

    if (!original) {
      throw new Error('Collection not found');
    }

    // Generate unique slug
    let newSlug = `${original.slug}-copy`;
    let counter = 1;
    while (await findFirstCollectionOrm({ where: { slug: newSlug } })) {
      newSlug = `${original.slug}-copy-${counter}`;
      counter++;
    }

    const duplicate = await createCollectionAction({
      data: {
        name: `${original.name} (Copy)`,
        type: original.type,
        copy: original.copy ?? {},
        parentId: original.parentId,
        slug: newSlug,
        status: 'DRAFT' as ContentStatus,
        userId: original.userId,
      },
    });

    revalidatePath('/pim3/collections');
    return duplicate;
  } catch (error) {
    console.error('Failed to duplicate collection:', error);
    throw new Error('Failed to duplicate collection');
  }
}

// Restore a soft-deleted collection
export async function restoreCollection(id: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    await updateCollectionAction({
      data: {
        deletedAt: null,
        deletedById: null,
      },
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to restore collection:', error);
    throw new Error('Failed to restore collection');
  }
}

// Update collection relationships (brands, products, categories, taxonomies)
export async function updateCollectionRelationships(
  id: string,
  relationships: {
    brandIds?: string[];
    productIds?: string[];
    categoryIds?: string[];
    taxonomyIds?: string[];
  },
) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const data: any = {};

    if (relationships.brandIds) {
      data.brands = {
        set: relationships.brandIds.map((id) => ({ id })),
      };
    }

    if (relationships.productIds) {
      data.products = {
        set: relationships.productIds.map((id) => ({ id })),
      };
    }

    if (relationships.categoryIds) {
      data.categories = {
        set: relationships.categoryIds.map((id) => ({ id })),
      };
    }

    if (relationships.taxonomyIds) {
      data.taxonomies = {
        set: relationships.taxonomyIds.map((id) => ({ id })),
      };
    }

    await updateCollectionAction({
      data,
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update collection relationships:', error);
    throw new Error('Failed to update collection relationships');
  }
}

// Get collections by type
export async function getCollectionsByType(type: CollectionType) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const collections = await findManyCollectionsOrm({
      include: {
        _count: {
          select: {
            brands: true,
            categories: true,
            children: true,
            favorites: true,
            media: true,
            products: true,
            registries: true,
            taxonomies: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      where: {
        deletedAt: null,
        type: type,
      },
    });

    return collections;
  } catch (error) {
    console.error('Failed to fetch collections by type:', error);
    throw new Error('Failed to fetch collections by type');
  }
}

// Search collections
export async function searchCollections(query: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const collections = await findManyCollectionsOrm({
      include: {
        _count: {
          select: {
            brands: true,
            categories: true,
            children: true,
            favorites: true,
            media: true,
            products: true,
            registries: true,
            taxonomies: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    return collections;
  } catch (error) {
    console.error('Failed to search collections:', error);
    throw new Error('Failed to search collections');
  }
}

// Get available parent collections (excludes self and its descendants)
export async function getAvailableParentCollections(excludeId?: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const collections = await findManyCollectionsOrm({
      orderBy: { name: 'asc' },
      where: {
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
      },
    });

    return collections;
  } catch (error) {
    console.error('Failed to fetch available parent collections:', error);
    throw new Error('Failed to fetch available parent collections');
  }
}

// Get collections with products
export async function getCollectionsWithProducts() {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const collections = await findManyCollectionsOrm({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        products: {
          include: {
            media: {
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          where: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        },
      },
      orderBy: { name: 'asc' },
      where: {
        deletedAt: null,
        products: {
          some: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        },
      },
    });

    return collections.map((c: any) => ({
      ...c,
      featuredProducts: c.products,
    }));
  } catch (error) {
    console.error('Failed to fetch collections with products:', error);
    throw new Error('Failed to fetch collections with products');
  }
}
