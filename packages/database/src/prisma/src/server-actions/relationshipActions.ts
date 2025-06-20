'use server';

import {
  updateProductOrm,
  updateCollectionOrm,
  findUniqueProductOrm,
  createProductOrm,
} from '../orm';
import { deleteManyPdpJoinsAction } from './pdpActions';

// Temporary console logging until orchestration package is stable
const logger = {
  error: (message: string, ...args: any[]) =>
    console.error(`[database:relationship] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[database:relationship] ${message}`, ...args),
  info: (message: string, ...args: any[]) =>
    console.info(`[database:relationship] ${message}`, ...args),
  log: (message: string, ...args: any[]) =>
    console.log(`[database:relationship] ${message}`, ...args),
};

/**
 * Relationship management actions for many-to-many associations
 * These functions handle connect/disconnect operations for Prisma relationships
 */

// Product-Collection Relationships
export async function connectProductToCollectionsAction(
  productId: string,
  collectionIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateProductOrm({
      where: { id: productId },
      data: {
        collections: {
          connect: collectionIds.map((id) => ({ id })),
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    logger.error('Error connecting product to collections:', error);
    return { success: false, error: error.message || 'Failed to connect collections' };
  }
}

export async function disconnectProductFromCollectionsAction(
  productId: string,
  collectionIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateProductOrm({
      where: { id: productId },
      data: {
        collections: {
          disconnect: collectionIds.map((id) => ({ id })),
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    logger.error('Error disconnecting product from collections:', error);
    return { success: false, error: error.message || 'Failed to disconnect collections' };
  }
}

// Product-Taxonomy Relationships
export async function connectProductToTaxonomiesAction(
  productId: string,
  taxonomyIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateProductOrm({
      where: { id: productId },
      data: {
        taxonomies: {
          connect: taxonomyIds.map((id) => ({ id })),
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    logger.error('Error connecting product to taxonomies:', error);
    return { success: false, error: error.message || 'Failed to connect taxonomies' };
  }
}

export async function disconnectProductFromTaxonomiesAction(
  productId: string,
  taxonomyIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateProductOrm({
      where: { id: productId },
      data: {
        taxonomies: {
          disconnect: taxonomyIds.map((id) => ({ id })),
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    logger.error('Error disconnecting product from taxonomies:', error);
    return { success: false, error: error.message || 'Failed to disconnect taxonomies' };
  }
}

// Collection-Taxonomy Relationships
export async function connectCollectionToTaxonomiesAction(
  collectionId: string,
  taxonomyIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateCollectionOrm({
      where: { id: collectionId },
      data: {
        taxonomies: {
          connect: taxonomyIds.map((id) => ({ id })),
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    logger.error('Error connecting collection to taxonomies:', error);
    return { success: false, error: error.message || 'Failed to connect taxonomies' };
  }
}

export async function disconnectCollectionFromTaxonomiesAction(
  collectionId: string,
  taxonomyIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateCollectionOrm({
      where: { id: collectionId },
      data: {
        taxonomies: {
          disconnect: taxonomyIds.map((id) => ({ id })),
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    logger.error('Error disconnecting collection from taxonomies:', error);
    return { success: false, error: error.message || 'Failed to disconnect taxonomies' };
  }
}

// Bulk relationship operations
export async function setProductCollectionsAction(
  productId: string,
  collectionIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get current collections to verify product exists
    const product = await findUniqueProductOrm({
      where: { id: productId },
      select: { collections: { select: { id: true } } },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Update to exact set of collections (set operation replaces all)
    await updateProductOrm({
      where: { id: productId },
      data: {
        collections: {
          set: collectionIds.map((id) => ({ id })),
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    logger.error('Error setting product collections:', error);
    return { success: false, error: error.message || 'Failed to set collections' };
  }
}

export async function setProductTaxonomiesAction(
  productId: string,
  taxonomyIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateProductOrm({
      where: { id: productId },
      data: {
        taxonomies: {
          set: taxonomyIds.map((id) => ({ id })),
        },
      },
    });
    return { success: true };
  } catch (error: any) {
    logger.error('Error setting product taxonomies:', error);
    return { success: false, error: error.message || 'Failed to set taxonomies' };
  }
}

// Get relationships
export async function getProductRelationshipsAction(productId: string) {
  try {
    const product = await findUniqueProductOrm({
      where: { id: productId },
      include: {
        collections: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
          },
        },
        taxonomies: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
          },
        },
        soldBy: {
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                status: true,
              },
            },
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    return {
      success: true,
      data: {
        collections: (product as any).collections,
        taxonomies: (product as any).taxonomies,
        brands: (product as any).soldBy.map((pb: any) => pb.brand),
        categories: (product as any).categories,
      },
    };
  } catch (error: any) {
    logger.error('Error getting product relationships:', error);
    return { success: false, error: error.message || 'Failed to get relationships' };
  }
}

// Advanced product creation with relationships
export async function createProductWithRelationshipsAction(data: {
  // Basic product data
  name: string;
  sku: string;
  category: string;
  status?: string;
  brand?: string;
  price?: number;
  currency?: string;
  type?: string;
  parentId?: string;
  copy?: any;

  // Relationships
  collectionIds?: string[];
  taxonomyIds?: string[];
  categoryIds?: string[];

  // Metadata
  createdBy?: string;
}) {
  try {
    const product = await createProductOrm({
      data: {
        name: data.name,
        sku: data.sku,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        category: data.category,
        status: (data.status as any) || 'DRAFT',
        brand: data.brand,
        price: data.price,
        currency: data.currency || 'USD',
        type: (data.type as any) || 'PHYSICAL',
        parentId: data.parentId,
        createdBy: data.createdBy || 'system',
        copy: data.copy || {},

        // Many-to-many relationships
        collections: data.collectionIds
          ? {
              connect: data.collectionIds.map((id) => ({ id })),
            }
          : undefined,

        taxonomies: data.taxonomyIds
          ? {
              connect: data.taxonomyIds.map((id) => ({ id })),
            }
          : undefined,

        categories: data.categoryIds
          ? {
              connect: data.categoryIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        collections: true,
        taxonomies: true,
        categories: true,
        soldBy: {
          include: {
            brand: true,
          },
        },
      },
    });

    return { success: true, data: product };
  } catch (error: any) {
    logger.error('Error creating product with relationships:', error);
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

// Update product with relationship management
export async function updateProductWithRelationshipsAction(
  productId: string,
  data: {
    // Basic updates
    name?: string;
    status?: string;
    price?: number;
    copy?: any;

    // Relationship updates (will replace existing)
    collectionIds?: string[];
    taxonomyIds?: string[];
    categoryIds?: string[];
    brandIds?: string[];
  },
) {
  try {
    // If brandIds are provided, we need to handle PdpJoin updates separately
    if (data.brandIds !== undefined) {
      // Delete existing PdpJoin entries
      await deleteManyPdpJoinsAction({
        where: { productId },
      });

      // Create new ones using the PDP actions
      if (data.brandIds.length > 0) {
        // Note: This would need the createManyPdpJoins function from pdpActions
        // For now, we'll skip this complex operation
        logger.warn('Brand relationship updates not fully implemented - requires PDP actions');
      }
    }

    // Update product with other data
    const product = await updateProductOrm({
      where: { id: productId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status as any }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.copy !== undefined && { copy: data.copy }),

        // Update many-to-many relationships using set
        ...(data.collectionIds !== undefined && {
          collections: {
            set: data.collectionIds.map((id) => ({ id })),
          },
        }),

        ...(data.taxonomyIds !== undefined && {
          taxonomies: {
            set: data.taxonomyIds.map((id) => ({ id })),
          },
        }),

        ...(data.categoryIds !== undefined && {
          categories: {
            set: data.categoryIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        collections: true,
        taxonomies: true,
        categories: true,
        soldBy: {
          include: {
            brand: true,
          },
        },
      },
    });

    return { success: true, data: product };
  } catch (error: any) {
    logger.error('Error updating product with relationships:', error);
    return { success: false, error: error.message || 'Failed to update product' };
  }
}

//==============================================================================
// PRODUCT BRAND ASSOCIATION ACTIONS
//==============================================================================

export async function createProductBrandAssociationAction(
  productId: string,
  brandId: string,
): Promise<{ success: boolean; error?: string }> {
  'use server';
  try {
    await updateProductOrm({
      where: { id: productId },
      data: { brand: brandId },
    });
    return { success: true };
  } catch (error) {
    logger.error('Error creating product-brand association:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create association',
    };
  }
}

export async function removeProductBrandAssociationAction(
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  'use server';
  try {
    await updateProductOrm({
      where: { id: productId },
      data: { brand: null },
    });
    return { success: true };
  } catch (error) {
    logger.error('Error removing product-brand association:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove association',
    };
  }
}
