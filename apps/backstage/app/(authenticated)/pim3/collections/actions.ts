'use server';

import { revalidatePath } from 'next/cache';
import { prisma, orm } from '@repo/database/prisma';
import { auth } from '@repo/auth/server';

import type { CollectionType, ContentStatus } from '@repo/database/prisma';


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
    const session = await auth.api.getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const collections = await orm.findManyCollections({
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
    const existingCollection = await orm.findFirstCollection({
      where: {
        deletedAt: null,
        slug: data.slug,
      },
    });

    if (existingCollection) {
      throw new Error('A collection with this slug already exists');
    }

    const collection = await orm.createCollection({
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
    const existingCollection = await orm.findFirstCollection({
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

    const collection = await orm.updateCollection({
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

    await orm.updateCollection({
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

    const collections = await orm.findManyCollections({
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

    const collections = await orm.findManyCollections({
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

// Duplicate a collection
export async function duplicateCollection(id: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const originalCollection = await orm.findUniqueCollection({
      where: { id },
    });

    if (!originalCollection) {
      throw new Error('Collection not found');
    }

    // Generate unique slug
    const baseSlug = `${originalCollection.slug}-copy`;
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await orm.findFirstCollection({
        where: {
          deletedAt: null,
          slug: slug,
        },
      });

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const duplicatedCollection = await orm.createCollection({
      data: {
        name: `${originalCollection.name} (Copy)`,
        type: originalCollection.type,
        copy: originalCollection.copy,
        slug: slug,
        status: 'DRAFT' as ContentStatus,
        userId: 'system', // session.user.id,
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

    return duplicatedCollection;
  } catch (error) {
    console.error('Failed to duplicate collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to duplicate collection');
  }
}

// Get products assigned to a collection
export async function getCollectionProducts(collectionId: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const products = await orm.findManyProducts({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        currency: true,
        price: true,
        sku: true,
        status: true,
      },
      where: {
        collections: {
          some: {
            id: collectionId,
          },
        },
        deletedAt: null,
      },
    });

    return products;
  } catch (error) {
    console.error('Failed to fetch collection products:', error);
    throw new Error('Failed to fetch collection products');
  }
}

// Add products to collection
export async function addProductsToCollection(collectionId: string, productIds: string[]) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    await orm.updateCollection({
      data: {
        products: {
          connect: productIds.map((id) => ({ id })),
        },
      },
      where: { id: collectionId },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to add products to collection:', error);
    throw new Error('Failed to add products to collection');
  }
}

// Remove products from collection
export async function removeProductsFromCollection(collectionId: string, productIds: string[]) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    await orm.updateCollection({
      data: {
        products: {
          disconnect: productIds.map((id) => ({ id })),
        },
      },
      where: { id: collectionId },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to remove products from collection:', error);
    throw new Error('Failed to remove products from collection');
  }
}

// Get all products for collection assignment
export async function getAllProducts() {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const products = await orm.findManyProducts({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        currency: true,
        price: true,
        sku: true,
        status: true,
      },
      where: {
        deletedAt: null,
      },
    });

    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error('Failed to fetch products');
  }
}

// Get collections for parent selection (excluding self and children)
export async function getAvailableParentCollections(excludeId?: string) {
  try {
    // Remove auth check for testing
    // const session = await auth.api.getSession();
    // if (!session) {
    //   throw new Error('Unauthorized');
    // }

    const whereClause: any = {
      deletedAt: null,
    };

    if (excludeId) {
      whereClause.id = {
        not: excludeId,
      };
    }

    const collections = await orm.findManyCollections({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        parentId: true,
        slug: true,
      },
      where: whereClause,
    });

    // Filter out collections that would create circular references
    if (excludeId) {
      const getDescendants = (id: string, collections: any[]): string[] => {
        const descendants: string[] = [];
        const children = collections.filter((c) => c.parentId === id);
        for (const child of children) {
          descendants.push(child.id);
          descendants.push(...getDescendants(child.id, collections));
        }
        return descendants;
      };

      const descendantIds = getDescendants(excludeId, collections);
      return collections.filter((c) => !descendantIds.includes(c.id));
    }

    return collections;
  } catch (error) {
    console.error('Failed to fetch available parent collections:', error);
    throw new Error('Failed to fetch available parent collections');
  }
}
