'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@repo/auth/server/next';
import {
  findManyCollectionsActionAction,
  findFirstCollectionActionAction,
  createCollectionAction,
  updateCollectionAction,
  type CollectionType,
  type ContentStatus,
} from '@repo/database/prisma';

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

// Enhanced getCollections with PIM3-specific features (hierarchy, user tracking, etc.)
export async function getCollections() {
  try {
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const collections = await findManyCollectionsAction({
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
      },
    });

    return collections;
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    throw new Error('Failed to fetch collections');
  }
}

// Create a new collection
export async function createCollection(data: CollectionData) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    // Check if slug already exists
    const existing = await findFirstCollectionAction({
      where: {
        slug: data.slug,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new Error('A collection with this slug already exists');
    }

    const collection = await createCollectionAction({
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
    });

    return collection;
  } catch (error) {
    console.error('Failed to create collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create collection');
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
    const existingCollection = await findFirstCollectionAction({
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

    const collections = await findManyCollectionsAction({
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

    const collections = await findManyCollectionsAction({
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

    const collections = await findManyCollectionsAction({
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

    const original = await findFirstCollectionAction({
      where: { id },
    });

    if (!original) {
      throw new Error('Collection not found');
    }

    // Generate unique slug
    let newSlug = `${original.slug}-copy`;
    let counter = 1;
    while (await findFirstCollectionAction({ where: { slug: newSlug } })) {
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

    const collections = await findManyCollectionsAction({
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

    const collections = await findManyCollectionsAction({
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

    const collections = await findManyCollectionsAction({
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

    const collections = await findManyCollectionsAction({
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
