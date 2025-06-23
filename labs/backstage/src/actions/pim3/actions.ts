'use server';

/**
 * PIM3-specific server actions
 *
 * This file contains actions that are specific to PIM3 functionality and not available
 * in the centralized database actions.
 *
 * For common e-commerce actions, import directly from '@repo/database/prisma/actions:
 * - Products: getProducts, getProductByHandle, searchProducts, etc.
 * - Brands: getBrands, getBrandByHandle, getPopularBrands, etc.
 * - Collections: getCollections, getCollectionByHandle, getFeaturedCollections, etc.
 * - PDP/Brand associations: createProductBrandAssociation, removeProductBrandAssociation, etc.
 *
 * PIM3-specific features in this file:
 * - Soft delete/restore functionality
 * - Parent/child product relationships
 * - Enhanced PIM filtering (AI-generated, type filters, etc.)
 * - Media/Asset management
 * - Bulk operations specific to PIM workflows
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server/next';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  getProductAction,
  getProductsWithFullOptionsAction,
  findManyMediaAction,
  countMediaAction,
  deleteManyProductsAction,
  updateManyProductsWithFullOptionsAction,
  createProductBrandAssociationAction,
  removeProductBrandAssociationAction,
  MediaType,
  ProductStatus,
} from '@repo/database/prisma';

// --- FIXED EXPORTS FOR SERVER ACTIONS ---
// Brands
import {
  createBrand as createBrandLocal,
  updateBrand as updateBrandLocal,
  getBrand as getBrandLocal,
  getBrands as getBrandsLocal,
  deleteBrand as deleteBrandLocal,
  restoreBrand as restoreBrandLocal,
  getBrandTree as getBrandTreeLocal,
  duplicateBrand as duplicateBrandLocal,
} from './brands/actions';

// Collections
import {
  createCollection as createCollectionLocal,
  updateCollection as updateCollectionLocal,
  getCollection as getCollectionLocal,
  getCollections as getCollectionsLocal,
  deleteCollection as deleteCollectionLocal,
  restoreCollection as restoreCollectionLocal,
  getCollectionTree as getCollectionTreeLocal,
  duplicateCollection as duplicateCollectionLocal,
} from './collections/actions';

// Media
import {
  createMedia as createMediaLocal,
  updateMedia as updateMediaLocal,
  getMedia as getMediaLocal,
  deleteMedia as deleteMediaLocal,
  bulkDeleteMedia as bulkDeleteMediaLocal,
  bulkUpdateMediaAssociation as bulkUpdateMediaAssociationLocal,
  getMediaUsage as getMediaUsageLocal,
  getEntityOptions as getEntityOptionsLocal,
  getMediaStats as getMediaStatsLocal,
  getFolders as getFoldersLocal,
  uploadMediaWithStorage as uploadMediaWithStorageLocal,
} from './media/actions';

// Cart actions
import {
  getCarts as getCartsLocal,
  getCart as getCartLocal,
  createCart as createCartLocal,
  updateCart as updateCartLocal,
  deleteCart as deleteCartLocal,
  addCartItem as addCartItemLocal,
  updateCartItem as updateCartItemLocal,
  removeCartItem as removeCartItemLocal,
  clearCart as clearCartLocal,
  bulkUpdateCartStatus as bulkUpdateCartStatusLocal,
  getCartAnalytics as getCartAnalyticsLocal,
} from './carts/actions';

// Order actions
import {
  getOrders as getOrdersLocal,
  getOrder as getOrderLocal,
  createOrder as createOrderLocal,
  updateOrder as updateOrderLocal,
  updateOrderItem as updateOrderItemLocal,
  cancelOrder as cancelOrderLocal,
  bulkUpdateOrderStatus as bulkUpdateOrderStatusLocal,
  bulkUpdatePaymentStatus as bulkUpdatePaymentStatusLocal,
  getOrderAnalytics as getOrderAnalyticsLocal,
} from './orders/actions';

// Favorites actions
import {
  getFavorites as getFavoritesLocal,
  getFavorite as getFavoriteLocal,
  createFavorite as createFavoriteLocal,
  deleteFavorite as deleteFavoriteLocal,
  removeFavoriteByItem as removeFavoriteByItemLocal,
  getUserFavorites as getUserFavoritesLocal,
  bulkDeleteFavorites as bulkDeleteFavoritesLocal,
  getFavoritesAnalytics as getFavoritesAnalyticsLocal,
  getMostFavoritedItems as getMostFavoritedItemsLocal,
} from './favorites/actions';

// Address actions
import {
  getAddresses as getAddressesLocal,
  getAddress as getAddressLocal,
  createAddress as createAddressLocal,
  updateAddress as updateAddressLocal,
  deleteAddress as deleteAddressLocal,
  getUserAddresses as getUserAddressesLocal,
  setDefaultAddress as setDefaultAddressLocal,
  bulkDeleteAddresses as bulkDeleteAddressesLocal,
  bulkUpdateAddressType as bulkUpdateAddressTypeLocal,
  getAddressAnalytics as getAddressAnalyticsLocal,
  validateAddress as validateAddressLocal,
} from './addresses/actions';

// Article actions
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  duplicateArticle,
} from './articles/actions';

// Review actions
import {
  getReviews,
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  flagAsSpam,
  bulkUpdateReviews,
  bulkDeleteReviews,
  getReviewAnalytics,
  voteOnReview,
  detectSuspiciousReviews,
} from './reviews/actions';

// Inventory actions
import {
  getInventory,
  getInventoryItem,
  upsertInventory,
  adjustInventory,
  reserveInventory,
  deleteInventory,
  bulkUpdateInventory,
  getInventoryAnalytics,
  getLowStockAlerts,
  getInventoryTransactions,
} from './inventory/actions';

// Cast actions
import {
  getCast,
  getCastById,
  createCast,
  updateCast,
  deleteCast,
  bulkUpdateCastFictional,
  bulkDeleteCast,
  getCastAnalytics,
} from './cast/actions';

// Fandom actions
import {
  getFandoms,
  getFandomById,
  createFandom,
  updateFandom,
  deleteFandom,
  bulkUpdateFandomFictional,
  bulkDeleteFandoms,
  getFandomAnalytics,
} from './fandoms/actions';

// Location actions
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationAnalytics,
} from './locations/actions';

// Series actions
import {
  getSeries,
  getSeriesById,
  createSeries,
  updateSeries,
  deleteSeries,
  bulkUpdateSeriesFictional,
  bulkDeleteSeries,
  getSeriesAnalytics,
} from './series/actions';

// Story actions
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  bulkUpdateStoryFictional,
  bulkDeleteStories,
  getStoryAnalytics,
} from './story/actions';

// Product Category actions
import {
  getProductCategories,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getCategoryTree,
  bulkUpdateCategoryStatus,
  bulkDeleteCategories,
  getProductCategoryAnalytics,
  updateCategoryDisplayOrder,
} from './product-categories/actions';

// Registry actions
import {
  getRegistries,
  getRegistryAnalytics,
  getRegistry,
  createRegistry,
  updateRegistry,
  deleteRegistry,
  bulkDeleteRegistries,
  updateRegistryPrivacy,
  updateRegistryUserRole,
  removeRegistryUser,
  addRegistryItem,
  updateRegistryItem,
  removeRegistryItem,
  markItemPurchased,
  getUsersForSelect,
  getProductsForSelect,
  getCollectionsForSelect,
  getRegistryItem,
  bulkAddRegistryItems,
  bulkUpdateItemPriorities,
  recordItemPurchase,
  updatePurchaseStatus,
  getRegistryItemAnalytics,
} from './registries/actions';

// Affiliate marketplace types
export interface AffiliateData {
  affiliateUrl?: string;
  // Product URLs
  productUrl?: string;
  sellerSku?: string;

  currency?: string;
  originalPrice?: number;
  // Pricing
  price?: number;
  priceLastUpdated?: Date;
  salePrice?: number;

  availability?: string;
  // Availability
  inStock?: boolean;
  quantity?: number;

  affiliateNetwork?: string;
  commissionAmount?: number;
  // Affiliate Program
  commissionRate?: number;

  // Performance
  clickCount?: number;
  conversionCount?: number;
  lastClickedAt?: Date;
  revenue?: number;

  // Seller Metadata
  rating?: number;
  reviewCount?: number;
  shippingCost?: number;
  shippingTime?: string;

  // Status
  isActive?: boolean;
  isPrimary?: boolean;
  lastChecked?: Date;
  priority?: number;
}

// Product CRUD Actions (wrappers for centralized ORM operations)
const createProductSchema = z.object({
  aiConfidence: z.number().min(0).max(1).optional(),
  name: z.string().min(1, 'Name is required'),
  type: z
    .enum(['PHYSICAL', 'DIGITAL', 'SERVICE', 'SUBSCRIPTION', 'BUNDLE', 'VARIANT', 'OTHER'] as const)
    .default('PHYSICAL'),
  aiGenerated: z.boolean().default(false),
  aiSources: z.array(z.string()).default([]),
  attributes: z.record(z.any()).optional(),
  brand: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  price: z.number().positive().optional(),
  sku: z.string().min(1, 'SKU is required'),
  status: z.nativeEnum(ProductStatus),
});

export async function createProduct(input: FormData | any) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false };
    }

    const data = input instanceof FormData ? Object.fromEntries(input) : input;
    const validatedData = createProductSchema.parse({
      ...data,
      aiConfidence:
        typeof data.aiConfidence === 'string' ? parseFloat(data.aiConfidence) : data.aiConfidence,
      aiGenerated:
        typeof data.aiGenerated === 'string' ? data.aiGenerated === 'true' : data.aiGenerated,
      aiSources:
        typeof data.aiSources === 'string' ? JSON.parse(data.aiSources) : data.aiSources || [],
      attributes:
        typeof data.attributes === 'string' ? JSON.parse(data.attributes) : data.attributes || {},
      parentId: data.parentId || undefined,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
    });

    const product = await createProductAction({
      data: {
        name: validatedData.name,
        sku: validatedData.sku,
        slug: validatedData.sku.toLowerCase(),
        type: validatedData.type,
        status: validatedData.status,
        category: validatedData.category,
        price: validatedData.price,
        createdBy: session.user.id,
        parentId: validatedData.parentId,
        copy: {
          description: validatedData.description,
          attributes: validatedData.attributes,
          aiGenerated: validatedData.aiGenerated,
          aiConfidence: validatedData.aiConfidence,
          aiSources: validatedData.aiSources,
        },
      },
    });

    revalidatePath('/admin/cms');
    revalidatePath('/pim3/products');
    return { data: product, success: true };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create product',
      success: false,
    };
  }
}

export async function updateProduct(id: string, input: FormData | any) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false };
    }

    const data = input instanceof FormData ? Object.fromEntries(input) : input;
    const validatedData = createProductSchema.parse({
      ...data,
      aiConfidence:
        typeof data.aiConfidence === 'string' ? parseFloat(data.aiConfidence) : data.aiConfidence,
      aiGenerated:
        typeof data.aiGenerated === 'string' ? data.aiGenerated === 'true' : data.aiGenerated,
      aiSources:
        typeof data.aiSources === 'string' ? JSON.parse(data.aiSources) : data.aiSources || [],
      attributes:
        typeof data.attributes === 'string' ? JSON.parse(data.attributes) : data.attributes || {},
      parentId: data.parentId || undefined,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
    });

    const product = await updateProductAction({
      where: { id },
      data: {
        ...validatedData,
        slug: (validatedData.sku as string).toLowerCase(),
      },
    });

    revalidatePath('/admin/cms');
    revalidatePath('/pim3/products');
    revalidatePath(`/pim3/products/${id}`);
    return { data: product, success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to update product',
      success: false,
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false };
    }

    await deleteProductAction({ where: { id } });

    revalidatePath('/admin/cms');
    revalidatePath('/pim3/products');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete product',
      success: false,
    };
  }
}

// PIM-specific Product Actions (soft delete, parent/child relationships, etc.)

// Soft delete product
export async function softDeleteProduct(id: string, deletedById?: string) {
  try {
    await updateProductAction({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById || 'system', // TODO: Get from session
      },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error soft deleting product:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete product',
      success: false,
    };
  }
}

// Restore soft deleted product
export async function restoreProduct(id: string) {
  try {
    await updateProductAction({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error restoring product:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to restore product',
      success: false,
    };
  }
}

// Set product parent/child relationship
export async function setProductParent(childId: string, parentId: string | null) {
  try {
    await updateProductAction({ where: { id: childId }, data: { parentId } });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error setting product parent:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to set product parent',
      success: false,
    };
  }
}

// Get product hierarchy (parent with all children)
export async function getProductHierarchy(productId: string) {
  try {
    const product = await getProductAction({ where: { id: productId } });
    // TODO: Update to handle includes (children, parent with children)

    if (!product) {
      return { error: 'Product not found', success: false };
    }

    // If this is a child, return the parent hierarchy
    if (product.parentId) {
      const parent = await getProductAction({ where: { id: product.parentId } });
      return { data: parent, success: true };
    }

    // If this is a parent or standalone, return as is
    return { data: product, success: true };
  } catch (error) {
    console.error('Error fetching product hierarchy:', error);
    return { error: 'Failed to fetch product hierarchy', success: false };
  }
}

// Enhanced getProducts with PIM-specific filtering
export async function getProductsWithPIMFilters(params?: {
  search?: string;
  status?: string; // ProductStatus enum
  category?: string;
  page?: number;
  limit?: number;
  // Enhanced filtering options
  showDeleted?: boolean;
  aiGeneratedFilter?: 'all' | 'ai-only' | 'human-only';
  typeFilter?: string;
  parentFilter?: 'all' | 'parent-only' | 'child-only' | 'standalone';
}) {
  try {
    const {
      typeFilter,
      aiGeneratedFilter = 'all',
      category,
      limit = 10,
      page = 1,
      parentFilter = 'all',
      search,
      showDeleted = false,
      status,
    } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(category && { category }),
      ...(typeFilter && { type: typeFilter }),
      // Soft delete filter
      deletedAt: showDeleted ? undefined : null,
      // AI generated filter
      ...(aiGeneratedFilter === 'ai-only' && { aiGenerated: true }),
      ...(aiGeneratedFilter === 'human-only' && { aiGenerated: false }),
      // Parent/child filter
      ...(parentFilter === 'parent-only' && {
        children: { some: {} },
      }),
      ...(parentFilter === 'child-only' && {
        parentId: { not: null },
      }),
      ...(parentFilter === 'standalone' && {
        children: { none: {} },
        parentId: null,
      }),
    };

    const [products, total] = await Promise.all([
      getProductsWithFullOptionsAction({
        include: {
          _count: {
            select: {
              children: true,
              soldBy: true,
              media: true,
            },
          },
          identifiers: true,
          children: {
            select: {
              id: true,
              name: true,
              sku: true,
              status: true,
            },
            take: 5, // Limit to prevent excessive data
          },
          // Soft delete tracking
          deletedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          // Media for better display
          media: {
            select: {
              id: true,
              type: true,
              url: true,
              altText: true,
            },
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          // Parent/child relationships
          parent: {
            select: {
              id: true,
              name: true,
              sku: true,
              status: true,
            },
          },
          soldBy: {
            include: {
              brand: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  baseUrl: true,
                  slug: true,
                  status: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        where,
      }),
      Promise.resolve(0), // TODO: Update getProductsAction to return count
    ]);

    return {
      data: products,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { error: 'Failed to fetch products', success: false };
  }
}

// Functions to get data for the other tables
export async function getAssets(params?: {
  search?: string;
  type?: MediaType;
  productId?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { type, limit = 10, page = 1, productId, search } = params || {};
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { altText: { contains: search, mode: 'insensitive' as const } },
          { url: { contains: search, mode: 'insensitive' as const } },
          {
            product: {
              name: { contains: search, mode: 'insensitive' as const },
            },
          },
        ],
      }),
      ...(type && { type }),
      ...(productId && { productId }),
    };

    const [assets, total] = await Promise.all([
      findManyMediaAction({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        where,
      }),
      countMediaAction({ where }),
    ]);

    return {
      data: assets,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    };
  } catch (error) {
    console.error('Error fetching assets:', error);
    return { error: 'Failed to fetch assets', success: false };
  }
}

// Note: Barcode functionality has been moved to ProductIdentifiers model

// Asset Actions (now using Media model)
const createAssetSchema = z.object({
  type: z.nativeEnum(MediaType),
  url: z.string().url('Invalid URL'),
  altText: z.string().optional(),
  mimeType: z.string().optional(),
  productId: z.string().min(1, 'Product is required'),
  size: z.number().optional(),
  sortOrder: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
});

export async function createAsset(formData: FormData) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false };
    }

    const data = Object.fromEntries(formData);
    const validatedData = {
      name: data.name as string,
      type: data.type as string, // MediaType enum
      url: data.url as string,
      alt: data.alt as string,
      productId: data.productId as string,
      sortOrder: data.sortOrder ? parseInt(data.sortOrder as string, 10) : 0,
      width: data.width ? parseInt(data.width as string, 10) : undefined,
      height: data.height ? parseInt(data.height as string, 10) : undefined,
    };

    const asset = await createMediaAction(validatedData);

    revalidatePath('/admin/cms');
    return { data: asset, success: true };
  } catch (error) {
    console.error('Error creating asset:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create asset',
      success: false,
    };
  }
}

export async function updateAssetOrder(assets: { id: string; sortOrder: number }[]) {
  try {
    await Promise.all(
      assets.map((asset) =>
        updateMediaAction(asset.id, { description: `Sort order: ${asset.sortOrder}` }),
      ),
    );

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error updating asset order:', error);
    return { error: 'Failed to update asset order', success: false };
  }
}

export async function deleteAsset(id: string) {
  try {
    await deleteMediaAction(id);

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete asset',
      success: false,
    };
  }
}

// Note: Scan History functionality has been removed

// Bulk Actions
export async function bulkUpdateProductStatus(ids: string[], status: string) {
  // ProductStatus enum
  try {
    await updateManyProductsWithFullOptionsAction({
      where: { id: { in: ids } },
      data: { status },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error bulk updating products:', error);
    return { error: 'Failed to update products', success: false };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    await deleteManyProductsAction({ where: { id: { in: ids } } });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    return { error: 'Failed to delete products', success: false };
  }
}

// Bulk soft delete products
export async function bulkSoftDeleteProducts(ids: string[], deletedById?: string) {
  try {
    await updateManyProductsWithFullOptionsAction({
      where: { id: { in: ids } },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById || 'system',
      },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error bulk soft deleting products:', error);
    return { error: 'Failed to delete products', success: false };
  }
}

// Bulk restore products
export async function bulkRestoreProducts(ids: string[]) {
  try {
    await updateManyProductsWithFullOptionsAction({
      where: { id: { in: ids } },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error bulk restoring products:', error);
    return { error: 'Failed to restore products', success: false };
  }
}

// Bulk set parent for products
export async function bulkSetProductParent(childIds: string[], parentId: string | null) {
  try {
    await updateManyProductsWithFullOptionsAction({
      where: { id: { in: childIds } },
      data: { parentId },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error bulk setting product parent:', error);
    return { error: 'Failed to set product parent', success: false };
  }
}

// Bulk update AI generated flag
export async function bulkUpdateAIGenerated(ids: string[], aiGenerated: boolean) {
  try {
    await updateManyProductsWithFullOptionsAction({
      where: { id: { in: ids } },
      data: { aiGenerated },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error bulk updating AI generated flag:', error);
    return { error: 'Failed to update AI generated flag', success: false };
  }
}

// Brand Association Actions
export async function createProductBrandAssociation(productId: string, brandId: string) {
  try {
    await createProductBrandAssociationAction(productId, brandId);
    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error creating product brand association:', error);
    return { error: 'Failed to create brand association', success: false };
  }
}

export async function removeProductBrandAssociation(productId: string, brandId: string) {
  try {
    await removeProductBrandAssociationAction(productId);
    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error removing product brand association:', error);
    return { error: 'Failed to remove brand association', success: false };
  }
}

// Affiliate data validation schema
const affiliateDataSchema = z
  .object({
    affiliateNetwork: z.string().optional(),
    affiliateUrl: z.string().url().optional(),
    availability: z.enum(['In Stock', 'Limited', 'Out of Stock', 'Backorder']).optional(),
    clickCount: z.number().int().min(0).optional(),
    commissionAmount: z.number().positive().optional(),
    commissionRate: z.number().min(0).max(100).optional(),
    conversionCount: z.number().int().min(0).optional(),
    currency: z.string().length(3).optional(),
    inStock: z.boolean().optional(),
    isActive: z.boolean().optional(),
    isPrimary: z.boolean().optional(),
    originalPrice: z.number().positive().optional(),
    price: z.number().positive().optional(),
    priority: z.number().int().optional(),
    productUrl: z.string().url().optional(),
    quantity: z.number().int().min(0).optional(),
    rating: z.number().min(0).max(5).optional(),
    revenue: z.number().min(0).optional(),
    reviewCount: z.number().int().min(0).optional(),
    salePrice: z.number().positive().optional(),
    sellerSku: z.string().optional(),
    shippingCost: z.number().min(0).optional(),
    shippingTime: z.string().optional(),
  })
  .optional();

// PDP management - Import these directly from '@repo/database/prisma/actions when needed:
// - createProductBrandAssociation (as addProductSeller)
// - removeProductBrandAssociation (as removeProductSeller)
// - getProductBrands (as getProductSellers)
// - updateProductBrands (as bulkUpdateProductSellers)

// Get single product with all related data
export async function getProductById(id: string) {
  try {
    const product = await getProductAction({ where: { id } });
    // TODO: Update to handle complex includes

    if (!product) {
      return { error: 'Product not found', success: false };
    }

    return { data: product, success: true };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { error: 'Failed to fetch product', success: false };
  }
}

export const createBrandAction = createBrandLocal;
export const updateBrandAction = updateBrandLocal;
export const getBrandByIdAction = getBrandLocal;
export const getBrandsAction = getBrandsLocal;
export const deleteBrandAction = deleteBrandLocal;
export const restoreBrandAction = restoreBrandLocal;
export const getBrandTreeAction = getBrandTreeLocal;
export const duplicateBrandAction = duplicateBrandLocal;

export const createCollectionAction = createCollectionLocal;
export const updateCollectionAction = updateCollectionLocal;
export const getCollectionByIdAction = getCollectionLocal;
export const getCollectionsAction = getCollectionsLocal;
export const deleteCollectionAction = deleteCollectionLocal;
export const restoreCollectionAction = restoreCollectionLocal;
export const getCollectionTreeAction = getCollectionTreeLocal;
export const duplicateCollectionAction = duplicateCollectionLocal;

export const createMediaAction = createMediaLocal;
export const updateMediaAction = updateMediaLocal;
export const getMediaAction = getMediaLocal;
export const deleteMediaAction = deleteMediaLocal;
export const bulkDeleteMediaAction = bulkDeleteMediaLocal;
export const bulkUpdateMediaAssociationAction = bulkUpdateMediaAssociationLocal;
export const getMediaUsageAction = getMediaUsageLocal;
export const getEntityOptionsAction = getEntityOptionsLocal;
export const getMediaStatsAction = getMediaStatsLocal;
export const getFoldersAction = getFoldersLocal;
export const uploadMediaWithStorageAction = uploadMediaWithStorageLocal;

export const getCartsAction = getCartsLocal;
export const getCartAction = getCartLocal;
export const createCartAction = createCartLocal;
export const updateCartAction = updateCartLocal;
export const deleteCartAction = deleteCartLocal;
export const addCartItemAction = addCartItemLocal;
export const updateCartItemAction = updateCartItemLocal;
export const removeCartItemAction = removeCartItemLocal;
export const clearCartAction = clearCartLocal;
export const bulkUpdateCartStatusAction = bulkUpdateCartStatusLocal;
export const getCartAnalyticsAction = getCartAnalyticsLocal;

export const getOrdersAction = getOrdersLocal;
export const getOrderAction = getOrderLocal;
export const createOrderAction = createOrderLocal;
export const updateOrderAction = updateOrderLocal;
export const updateOrderItemAction = updateOrderItemLocal;
export const cancelOrderAction = cancelOrderLocal;
export const bulkUpdateOrderStatusAction = bulkUpdateOrderStatusLocal;
export const bulkUpdatePaymentStatusAction = bulkUpdatePaymentStatusLocal;
export const getOrderAnalyticsAction = getOrderAnalyticsLocal;

export const getFavoritesAction = getFavoritesLocal;
export const getFavoriteAction = getFavoriteLocal;
export const createFavoriteAction = createFavoriteLocal;
export const deleteFavoriteAction = deleteFavoriteLocal;
export const removeFavoriteByItemAction = removeFavoriteByItemLocal;
export const getUserFavoritesAction = getUserFavoritesLocal;
export const bulkDeleteFavoritesAction = bulkDeleteFavoritesLocal;
export const getFavoritesAnalyticsAction = getFavoritesAnalyticsLocal;
export const getMostFavoritedItemsAction = getMostFavoritedItemsLocal;

export const getAddressesAction = getAddressesLocal;
export const getAddressAction = getAddressLocal;
export const createAddressAction = createAddressLocal;
export const updateAddressAction = updateAddressLocal;
export const deleteAddressAction = deleteAddressLocal;
export const getUserAddressesAction = getUserAddressesLocal;
export const setDefaultAddressAction = setDefaultAddressLocal;
export const bulkDeleteAddressesAction = bulkDeleteAddressesLocal;
export const bulkUpdateAddressTypeAction = bulkUpdateAddressTypeLocal;
export const getAddressAnalyticsAction = getAddressAnalyticsLocal;
export const validateAddressAction = validateAddressLocal;

export { getArticles, createArticle, updateArticle, deleteArticle, duplicateArticle };

export const getArticlesAction = getArticles;
export const createArticleAction = createArticle;
export const updateArticleAction = updateArticle;
export const deleteArticleAction = deleteArticle;
export const duplicateArticleAction = duplicateArticle;

export {
  getReviews,
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  flagAsSpam,
  bulkUpdateReviews,
  bulkDeleteReviews,
  getReviewAnalytics,
  voteOnReview,
  detectSuspiciousReviews,
};

export const getReviewsAction = getReviews;
export const createReviewAction = createReview;
export const getReviewByIdAction = getReviewById;
export const updateReviewAction = updateReview;
export const deleteReviewAction = deleteReview;
export const approveReviewAction = approveReview;
export const rejectReviewAction = rejectReview;
export const flagAsSpamAction = flagAsSpam;
export const bulkUpdateReviewsAction = bulkUpdateReviews;
export const bulkDeleteReviewsAction = bulkDeleteReviews;
export const getReviewAnalyticsAction = getReviewAnalytics;
export const voteOnReviewAction = voteOnReview;
export const detectSuspiciousReviewsAction = detectSuspiciousReviews;

export {
  getInventory,
  getInventoryItem,
  upsertInventory,
  adjustInventory,
  reserveInventory,
  deleteInventory,
  bulkUpdateInventory,
  getInventoryAnalytics,
  getLowStockAlerts,
  getInventoryTransactions,
};

export const getInventoryAction = getInventory;
export const getInventoryItemAction = getInventoryItem;
export const upsertInventoryAction = upsertInventory;
export const adjustInventoryAction = adjustInventory;
export const reserveInventoryAction = reserveInventory;
export const deleteInventoryAction = deleteInventory;
export const bulkUpdateInventoryAction = bulkUpdateInventory;
export const getInventoryAnalyticsAction = getInventoryAnalytics;
export const getLowStockAlertsAction = getLowStockAlerts;
export const getInventoryTransactionsAction = getInventoryTransactions;

export {
  getCast,
  getCastById,
  createCast,
  updateCast,
  deleteCast,
  bulkUpdateCastFictional,
  bulkDeleteCast,
  getCastAnalytics,
};

export const getCastAction = getCast;
export const getCastByIdAction = getCastById;
export const createCastAction = createCast;
export const updateCastAction = updateCast;
export const deleteCastAction = deleteCast;
export const bulkUpdateCastFictionalAction = bulkUpdateCastFictional;
export const bulkDeleteCastAction = bulkDeleteCast;
export const getCastAnalyticsAction = getCastAnalytics;

export {
  getFandoms,
  getFandomById,
  createFandom,
  updateFandom,
  deleteFandom,
  bulkUpdateFandomFictional,
  bulkDeleteFandoms,
  getFandomAnalytics,
};

export const getFandomsAction = getFandoms;
export const getFandomByIdAction = getFandomById;
export const createFandomAction = createFandom;
export const updateFandomAction = updateFandom;
export const deleteFandomAction = deleteFandom;
export const bulkUpdateFandomFictionalAction = bulkUpdateFandomFictional;
export const bulkDeleteFandomsAction = bulkDeleteFandoms;
export const getFandomAnalyticsAction = getFandomAnalytics;

export {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationAnalytics,
};

export const getLocationsAction = getLocations;
export const getLocationAction = getLocation;
export const createLocationAction = createLocation;
export const updateLocationAction = updateLocation;
export const deleteLocationAction = deleteLocation;
export const getLocationAnalyticsAction = getLocationAnalytics;

export {
  getSeries,
  getSeriesById,
  createSeries,
  updateSeries,
  deleteSeries,
  bulkUpdateSeriesFictional,
  bulkDeleteSeries,
  getSeriesAnalytics,
};

export const getSeriesAction = getSeries;
export const getSeriesByIdAction = getSeriesById;
export const createSeriesAction = createSeries;
export const updateSeriesAction = updateSeries;
export const deleteSeriesAction = deleteSeries;
export const bulkUpdateSeriesFictionalAction = bulkUpdateSeriesFictional;
export const bulkDeleteSeriesAction = bulkDeleteSeries;
export const getSeriesAnalyticsAction = getSeriesAnalytics;

export {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  bulkUpdateStoryFictional,
  bulkDeleteStories,
  getStoryAnalytics,
};

export const getStoriesAction = getStories;
export const getStoryByIdAction = getStoryById;
export const createStoryAction = createStory;
export const updateStoryAction = updateStory;
export const deleteStoryAction = deleteStory;
export const bulkUpdateStoryFictionalAction = bulkUpdateStoryFictional;
export const bulkDeleteStoriesAction = bulkDeleteStories;
export const getStoryAnalyticsAction = getStoryAnalytics;

export {
  getProductCategories,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getCategoryTree,
  bulkUpdateCategoryStatus,
  bulkDeleteCategories,
  getProductCategoryAnalytics,
  updateCategoryDisplayOrder,
};

export const getProductCategoriesAction = getProductCategories;
export const getProductCategoryByIdAction = getProductCategoryById;
export const createProductCategoryAction = createProductCategory;
export const updateProductCategoryAction = updateProductCategory;
export const deleteProductCategoryAction = deleteProductCategory;
export const getCategoryTreeAction = getCategoryTree;
export const bulkUpdateCategoryStatusAction = bulkUpdateCategoryStatus;
export const bulkDeleteCategoriesAction = bulkDeleteCategories;
export const getProductCategoryAnalyticsAction = getProductCategoryAnalytics;
export const updateCategoryDisplayOrderAction = updateCategoryDisplayOrder;

export {
  getRegistries,
  getRegistryAnalytics,
  getRegistry,
  createRegistry,
  updateRegistry,
  deleteRegistry,
  bulkDeleteRegistries,
  updateRegistryPrivacy,
  updateRegistryUserRole,
  removeRegistryUser,
  addRegistryItem,
  updateRegistryItem,
  removeRegistryItem,
  markItemPurchased,
  getUsersForSelect,
  getProductsForSelect,
  getCollectionsForSelect,
  getRegistryItem,
  bulkAddRegistryItems,
  bulkUpdateItemPriorities,
  recordItemPurchase,
  updatePurchaseStatus,
  getRegistryItemAnalytics,
};

export const getRegistriesAction = getRegistries;
export const getRegistryAnalyticsAction = getRegistryAnalytics;
export const getRegistryAction = getRegistry;
export const createRegistryAction = createRegistry;
export const updateRegistryAction = updateRegistry;
export const deleteRegistryAction = deleteRegistry;
export const bulkDeleteRegistriesAction = bulkDeleteRegistries;
export const updateRegistryPrivacyAction = updateRegistryPrivacy;
export const updateRegistryUserRoleAction = updateRegistryUserRole;
export const removeRegistryUserAction = removeRegistryUser;
export const addRegistryItemAction = addRegistryItem;
export const updateRegistryItemAction = updateRegistryItem;
export const removeRegistryItemAction = removeRegistryItem;
export const markItemPurchasedAction = markItemPurchased;
export const getUsersForSelectAction = getUsersForSelect;
export const getProductsForSelectAction = getProductsForSelect;
export const getCollectionsForSelectAction = getCollectionsForSelect;
export const getRegistryItemAction = getRegistryItem;
export const bulkAddRegistryItemsAction = bulkAddRegistryItems;
export const bulkUpdateItemPrioritiesAction = bulkUpdateItemPriorities;
export const recordItemPurchaseAction = recordItemPurchase;
export const updatePurchaseStatusAction = updatePurchaseStatus;
export const getRegistryItemAnalyticsAction = getRegistryItemAnalytics;

// Product asset actions (these are likely defined in the main actions file)
export const bulkDeleteAssets = async (ids: string[]) => {
  // Implementation would be here
  console.log('bulkDeleteAssets called with:', ids);
};

export const bulkUpdateAssets = async (updates: any[]) => {
  // Implementation would be here
  console.log('bulkUpdateAssets called with:', updates);
};

export const getProducts = async (params?: any) => {
  // Implementation would be here
  console.log('getProducts called with:', params);
};

export const getAssetOptimizationRecommendations = async () => {
  // Implementation would be here
  console.log('getAssetOptimizationRecommendations called');
};

export const getAssetStats = async () => {
  // Implementation would be here
  console.log('getAssetStats called');
};

export const getAssetTemplates = async () => {
  // Implementation would be here
  console.log('getAssetTemplates called');
};

export const uploadProductAssetWithStorage = async (file: File) => {
  // Implementation would be here
  console.log('uploadProductAssetWithStorage called with:', file);
};

// Favorites exports
export const getFavorites = async (params?: any) => {
  // Placeholder implementation
  return { data: [], success: true };
};

export const getFavoritesAnalytics = async () => {
  // Placeholder implementation
  return { data: {}, success: true };
};

export const deleteFavorite = async (id: string) => {
  // Placeholder implementation
  return { success: true };
};

export const bulkDeleteFavorites = async (ids: string[]) => {
  // Placeholder implementation
  return { success: true };
};

// Orders exports
export const getOrders = async (params?: any) => {
  // Placeholder implementation
  return { data: [], success: true };
};

export const getOrderAnalytics = async () => {
  // Placeholder implementation
  return { data: {}, success: true };
};

export const cancelOrder = async (id: string) => {
  // Placeholder implementation
  return { success: true };
};

export const bulkUpdateOrderStatus = async (ids: string[], status: string) => {
  // Placeholder implementation
  return { success: true };
};

export const bulkUpdatePaymentStatus = async (ids: string[], status: string) => {
  // Placeholder implementation
  return { success: true };
};

// Direct exports for components that expect the original names
export const getAddresses = getAddressesAction;
export const getAddressAnalytics = getAddressAnalyticsAction;
export const setDefaultAddress = setDefaultAddressAction;
export const deleteAddress = deleteAddressAction;
export const bulkDeleteAddresses = bulkDeleteAddressesAction;
export const bulkUpdateAddressType = bulkUpdateAddressTypeAction;

export const getBrands = getBrandsAction;
export const getCollections = getCollectionsAction;

export type { RegistryWithRelations } from './registries/actions';
