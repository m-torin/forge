'use server';

/**
 * PIM3-specific server actions
 * 
 * This file contains actions that are specific to PIM3 functionality and not available 
 * in the centralized database actions.
 * 
 * For common e-commerce actions, import directly from @repo/database/prisma/actions:
 * - Products: getProducts, getProductByHandle, searchProducts, etc.
 * - Brands: getBrands, getBrandByHandle, getPopularBrands, etc.
 * - Collections: getCollections, getCollectionByHandle, getFeaturedCollections, etc.
 * - PDP/Brand associations: createProductBrandAssociation, removeProductBrandAssociation, etc.
 * 
 * PIM3-specific features in this file:
 * - Soft delete/restore functionality
 * - Parent/child product relationships
 * - Enhanced PIM filtering (AI-generated, type filters, etc.)
 * - Barcode management
 * - Asset management
 * - Scan history tracking
 * - Bulk operations specific to PIM workflows
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server';
import { orm } from '@repo/database/prisma';

import type { AssetType, BarcodeType, ProductStatus } from '@repo/database/prisma';

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
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED'] as const),
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
      aiConfidence: typeof data.aiConfidence === 'string' ? parseFloat(data.aiConfidence) : data.aiConfidence,
      aiGenerated: typeof data.aiGenerated === 'string' ? data.aiGenerated === 'true' : data.aiGenerated,
      aiSources: typeof data.aiSources === 'string' ? JSON.parse(data.aiSources) : (data.aiSources || []),
      attributes: typeof data.attributes === 'string' ? JSON.parse(data.attributes) : (data.attributes || {}),
      parentId: data.parentId || undefined,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
    });

    const product = await orm.createProduct({
      data: {
        ...validatedData,
        slug: validatedData.sku.toLowerCase(),
        createdById: session.user.id,
        organizationId: session.session.activeOrganizationId || 'default',
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
      aiConfidence: typeof data.aiConfidence === 'string' ? parseFloat(data.aiConfidence) : data.aiConfidence,
      aiGenerated: typeof data.aiGenerated === 'string' ? data.aiGenerated === 'true' : data.aiGenerated,
      aiSources: typeof data.aiSources === 'string' ? JSON.parse(data.aiSources) : (data.aiSources || []),
      attributes: typeof data.attributes === 'string' ? JSON.parse(data.attributes) : (data.attributes || {}),
      parentId: data.parentId || undefined,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
    });

    const product = await orm.updateProduct({
      where: { id },
      data: {
        ...validatedData,
        slug: validatedData.sku.toLowerCase(),
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

    await orm.deleteProduct({
      where: { id },
    });

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
    await orm.updateProduct({
      data: {
        deletedAt: new Date(),
        deletedById: deletedById || 'system', // TODO: Get from session
      },
      where: { id },
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
    await orm.updateProduct({
      data: {
        deletedAt: null,
        deletedById: null,
      },
      where: { id },
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
    await orm.updateProduct({
      data: { parentId },
      where: { id: childId },
    });

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
    const product = await orm.findUniqueProduct({
      include: {
        children: true,
        parent: {
          include: {
            children: true,
          },
        },
      },
      where: { id: productId },
    });

    if (!product) {
      return { error: 'Product not found', success: false };
    }

    // If this is a child, return the parent hierarchy
    if (product.parentId) {
      const parent = await orm.findUniqueProduct({ where: { id: product.parentId } });
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
  status?: ProductStatus;
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
      orm.findManyProducts({
        include: {
          _count: {
            select: {
              children: true,
              scanHistory: true,
              soldBy: true,
            },
          },
          barcodes: true,
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
          digitalAssets: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          // Media for better display
          media: {
            select: {
              id: true,
              type: true,
              url: true,
              altText: true,
            },
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
      orm.countProducts({ where }),
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
  type?: AssetType;
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
          { filename: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
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
      orm.findManyProductAssets({
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
      orm.countProductAssets({ where }),
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

export async function getBarcodes(params?: {
  search?: string;
  type?: BarcodeType;
  isPrimary?: boolean;
  productId?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { type, isPrimary, limit = 10, page = 1, productId, search } = params || {};
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { barcode: { contains: search, mode: 'insensitive' as const } },
          {
            product: {
              name: { contains: search, mode: 'insensitive' as const },
            },
          },
          {
            product: {
              sku: { contains: search, mode: 'insensitive' as const },
            },
          },
        ],
      }),
      ...(type && { type }),
      ...(isPrimary !== undefined && { isPrimary }),
      ...(productId && { productId }),
    };

    const [barcodes, total] = await Promise.all([
      orm.findManyProductBarcodes({
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
      orm.countProductBarcodes({ where }),
    ]);

    return {
      data: barcodes,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    };
  } catch (error) {
    console.error('Error fetching barcodes:', error);
    return { error: 'Failed to fetch barcodes', success: false };
  }
}

// Barcode Actions
const createBarcodeSchema = z.object({
  type: z.enum([
    'UPC_A',
    'UPC_E',
    'EAN_13',
    'EAN_8',
    'CODE_128',
    'CODE_39',
    'QR_CODE',
    'PDF417',
    'AZTEC',
    'DATA_MATRIX',
    'ITF14',
    'CODABAR',
    'OTHER',
  ] as const),
  barcode: z.string().min(1, 'Barcode is required'),
  isPrimary: z.boolean().default(false),
  productId: z.string().min(1, 'Product is required'),
});

export async function createBarcode(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = createBarcodeSchema.parse({
      ...data,
      isPrimary: data.isPrimary === 'true',
    });

    // If setting as primary, unset other primary barcodes
    if (validatedData.isPrimary) {
      await orm.updateManyProductBarcodes({
        data: { isPrimary: false },
        where: { productId: validatedData.productId },
      });
    }

    const barcode = await orm.createProductBarcode({
      data: validatedData,
      include: { product: true },
    });

    revalidatePath('/admin/cms');
    return { data: barcode, success: true };
  } catch (error) {
    console.error('Error creating barcode:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create barcode',
      success: false,
    };
  }
}

export async function deleteBarcode(id: string) {
  try {
    await orm.deleteProductBarcode({
      where: { id },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error deleting barcode:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete barcode',
      success: false,
    };
  }
}

// Asset Actions
const createAssetSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  type: z.enum([
    'IMAGE',
    'VIDEO',
    'DOCUMENT',
    'MANUAL',
    'SPECIFICATION',
    'CERTIFICATE',
    'OTHER',
  ] as const),
  url: z.string().url('Invalid URL'),
  alt: z.string().optional(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  productId: z.string().min(1, 'Product is required'),
  size: z.number().optional(),
  sortOrder: z.number().default(0),
});

export async function createAsset(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = createAssetSchema.parse({
      ...data,
      size: data.size ? parseInt(data.size as string, 10) : undefined,
      sortOrder: data.sortOrder ? parseInt(data.sortOrder as string, 10) : 0,
    });

    const asset = await orm.createProductAsset({
      data: validatedData,
      include: { product: true },
    });

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
        orm.updateProductAsset({
          data: { sortOrder: asset.sortOrder },
          where: { id: asset.id },
        }),
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
    await orm.deleteProductAsset({
      where: { id },
    });

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

// Scan History Actions
export async function getScanHistory(params?: {
  productId?: string;
  userId?: string;
  sessionId?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  try {
    const {
      endDate,
      limit = 20,
      page = 1,
      productId,
      sessionId,
      startDate,
      success,
      userId,
    } = params || {};
    const skip = (page - 1) * limit;

    const where = {
      ...(productId && { productId }),
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),
      ...(success !== undefined && { success }),
      ...(startDate || endDate
        ? {
            scannedAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [scans, total] = await Promise.all([
      orm.findManyScanHistories({
        include: {
          product: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { scannedAt: 'desc' },
        skip,
        take: limit,
        where,
      }),
      orm.countScanHistories({ where }),
    ]);

    return {
      data: scans,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    };
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return { error: 'Failed to fetch scan history', success: false };
  }
}

// Bulk Actions
export async function bulkUpdateProductStatus(ids: string[], status: ProductStatus) {
  try {
    await orm.updateManyProducts({
      data: { status },
      where: { id: { in: ids } },
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
    await orm.deleteManyProducts({
      where: { id: { in: ids } },
    });

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
    await orm.updateManyProducts({
      data: {
        deletedAt: new Date(),
        deletedById: deletedById || 'system',
      },
      where: { id: { in: ids } },
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
    await orm.updateManyProducts({
      data: {
        deletedAt: null,
        deletedById: null,
      },
      where: { id: { in: ids } },
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
    await orm.updateManyProducts({
      data: { parentId },
      where: { id: { in: childIds } },
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
    await orm.updateManyProducts({
      data: { aiGenerated },
      where: { id: { in: ids } },
    });

    revalidatePath('/admin/cms');
    return { success: true };
  } catch (error) {
    console.error('Error bulk updating AI generated flag:', error);
    return { error: 'Failed to update AI generated flag', success: false };
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

// PDP management - Import these directly from @repo/database/prisma/actions when needed:
// - createProductBrandAssociation (as addProductSeller)
// - removeProductBrandAssociation (as removeProductSeller)  
// - getProductBrands (as getProductSellers)
// - updateProductBrands (as bulkUpdateProductSellers)

// Get single product with all related data
export async function getProductById(id: string) {
  try {
    const product = await orm.findUniqueProduct({
      include: {
        // Counts
        _count: {
          select: {
            scanHistory: true,
            soldBy: true,
          },
        },
        // Core product data
        barcodes: {
          orderBy: { createdAt: 'asc' },
        },
        digitalAssets: {
          orderBy: { sortOrder: 'asc' },
        },
        scanHistory: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { scannedAt: 'desc' },
          take: 10,
        },
        // PDPs/Sellers
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
      where: { id },
    });

    if (!product) {
      return { error: 'Product not found', success: false };
    }

    return { data: product, success: true };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { error: 'Failed to fetch product', success: false };
  }
}
