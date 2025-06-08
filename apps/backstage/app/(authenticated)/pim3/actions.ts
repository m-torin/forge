"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { database } from "@repo/database/prisma";

import type { AssetType, BarcodeType, ProductStatus } from "@repo/database/prisma";

// Affiliate marketplace types
export interface AffiliateData {
  // Product URLs
  productUrl?: string;
  affiliateUrl?: string;
  sellerSku?: string;
  
  // Pricing
  price?: number;
  currency?: string;
  originalPrice?: number;
  salePrice?: number;
  priceLastUpdated?: Date;
  
  // Availability
  inStock?: boolean;
  quantity?: number;
  availability?: string;
  
  // Affiliate Program
  commissionRate?: number;
  commissionAmount?: number;
  affiliateNetwork?: string;
  
  // Performance
  clickCount?: number;
  conversionCount?: number;
  revenue?: number;
  lastClickedAt?: Date;
  
  // Seller Metadata
  rating?: number;
  reviewCount?: number;
  shippingCost?: number;
  shippingTime?: string;
  
  // Status
  isActive?: boolean;
  isPrimary?: boolean;
  priority?: number;
  lastChecked?: Date;
}

// Product Actions
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  attributes: z.record(z.any()).optional(),
  brand: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  currency: z.string().default("USD"),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  sku: z.string().min(1, "SKU is required"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED", "DISCONTINUED"] as const),
});

export async function createProduct(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = createProductSchema.parse({
      ...data,
      attributes: data.attributes ? JSON.parse(data.attributes as string) : {},
      price: data.price ? parseFloat(data.price as string) : undefined,
    });

    const product = await database.product.create({
      data: {
        ...validatedData,
        createdBy: "system", // TODO: Get from session
        organizationId: "default", // TODO: Get from session
      },
    });

    revalidatePath("/admin/cms");
    return { data: product, success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create product",
      success: false,
    };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = createProductSchema.parse({
      ...data,
      attributes: data.attributes ? JSON.parse(data.attributes as string) : {},
      price: data.price ? parseFloat(data.price as string) : undefined,
    });

    const product = await database.product.update({
      data: validatedData,
      where: { id },
    });

    revalidatePath("/admin/cms");
    return { data: product, success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to update product",
      success: false,
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    await database.product.delete({
      where: { id },
    });

    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete product",
      success: false,
    };
  }
}

export async function getProducts(params?: {
  search?: string;
  status?: ProductStatus;
  category?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { category, limit = 10, page = 1, search, status } = params || {};
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(status && { status }),
      ...(category && { category }),
    };

    const [products, total] = await Promise.all([
      database.product.findMany({
        include: {
          _count: {
            select: {
              scanHistory: true,
              soldBy: true,
            },
          },
          barcodes: true,
          digitalAssets: {
            orderBy: { sortOrder: "asc" },
            take: 1,
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
              createdAt: "asc",
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        where,
      }),
      database.product.count({ where }),
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
    console.error("Error fetching products:", error);
    return { error: "Failed to fetch products", success: false };
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
          { filename: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          {
            product: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }),
      ...(type && { type }),
      ...(productId && { productId }),
    };

    const [assets, total] = await Promise.all([
      database.productAsset.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        where,
      }),
      database.productAsset.count({ where }),
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
    console.error("Error fetching assets:", error);
    return { error: "Failed to fetch assets", success: false };
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
    const {
      type,
      isPrimary,
      limit = 10,
      page = 1,
      productId,
      search,
    } = params || {};
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { barcode: { contains: search, mode: "insensitive" as const } },
          {
            product: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
          {
            product: {
              sku: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }),
      ...(type && { type }),
      ...(isPrimary !== undefined && { isPrimary }),
      ...(productId && { productId }),
    };

    const [barcodes, total] = await Promise.all([
      database.productBarcode.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        where,
      }),
      database.productBarcode.count({ where }),
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
    console.error("Error fetching barcodes:", error);
    return { error: "Failed to fetch barcodes", success: false };
  }
}

// Barcode Actions
const createBarcodeSchema = z.object({
  type: z.enum([
    "UPC_A",
    "UPC_E",
    "EAN_13",
    "EAN_8",
    "CODE_128",
    "CODE_39",
    "QR_CODE",
    "PDF417",
    "AZTEC",
    "DATA_MATRIX",
    "ITF14",
    "CODABAR",
    "OTHER",
  ] as const),
  barcode: z.string().min(1, "Barcode is required"),
  isPrimary: z.boolean().default(false),
  productId: z.string().min(1, "Product is required"),
});

export async function createBarcode(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = createBarcodeSchema.parse({
      ...data,
      isPrimary: data.isPrimary === "true",
    });

    // If setting as primary, unset other primary barcodes
    if (validatedData.isPrimary) {
      await database.productBarcode.updateMany({
        data: { isPrimary: false },
        where: { productId: validatedData.productId },
      });
    }

    const barcode = await database.productBarcode.create({
      data: validatedData,
      include: { product: true },
    });

    revalidatePath("/admin/cms");
    return { data: barcode, success: true };
  } catch (error) {
    console.error("Error creating barcode:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create barcode",
      success: false,
    };
  }
}

export async function deleteBarcode(id: string) {
  try {
    await database.productBarcode.delete({
      where: { id },
    });

    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error) {
    console.error("Error deleting barcode:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete barcode",
      success: false,
    };
  }
}

// Asset Actions
const createAssetSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  type: z.enum([
    "IMAGE",
    "VIDEO",
    "DOCUMENT",
    "MANUAL",
    "SPECIFICATION",
    "CERTIFICATE",
    "OTHER",
  ] as const),
  url: z.string().url("Invalid URL"),
  alt: z.string().optional(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  productId: z.string().min(1, "Product is required"),
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

    const asset = await database.productAsset.create({
      data: validatedData,
      include: { product: true },
    });

    revalidatePath("/admin/cms");
    return { data: asset, success: true };
  } catch (error) {
    console.error("Error creating asset:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create asset",
      success: false,
    };
  }
}

export async function updateAssetOrder(
  assets: { id: string; sortOrder: number }[],
) {
  try {
    await Promise.all(
      assets.map((asset) =>
        database.productAsset.update({
          data: { sortOrder: asset.sortOrder },
          where: { id: asset.id },
        }),
      ),
    );

    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error) {
    console.error("Error updating asset order:", error);
    return { error: "Failed to update asset order", success: false };
  }
}

export async function deleteAsset(id: string) {
  try {
    await database.productAsset.delete({
      where: { id },
    });

    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete asset",
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
      database.scanHistory.findMany({
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
        orderBy: { scannedAt: "desc" },
        skip,
        take: limit,
        where,
      }),
      database.scanHistory.count({ where }),
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
    console.error("Error fetching scan history:", error);
    return { error: "Failed to fetch scan history", success: false };
  }
}

// Bulk Actions
export async function bulkUpdateProductStatus(
  ids: string[],
  status: ProductStatus,
) {
  try {
    await database.product.updateMany({
      data: { status },
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating products:", error);
    return { error: "Failed to update products", success: false };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    await database.product.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return { error: "Failed to delete products", success: false };
  }
}

// Affiliate data validation schema
const affiliateDataSchema = z.object({
  productUrl: z.string().url().optional(),
  affiliateUrl: z.string().url().optional(),
  sellerSku: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  originalPrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  availability: z.enum(["In Stock", "Limited", "Out of Stock", "Backorder"]).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  commissionAmount: z.number().positive().optional(),
  affiliateNetwork: z.string().optional(),
  clickCount: z.number().int().min(0).optional(),
  conversionCount: z.number().int().min(0).optional(),
  revenue: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  shippingCost: z.number().min(0).optional(),
  shippingTime: z.string().optional(),
  isActive: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  priority: z.number().int().optional(),
}).optional();

// PDP Management Actions
export async function addProductSeller(
  productId: string, 
  brandId: string, 
  affiliateData?: AffiliateData
) {
  try {
    const pdp = await database.pdpJoin.create({
      data: {
        brandId,
        productId,
      },
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
    });

    revalidatePath("/admin/cms");
    return { data: pdp, success: true };
  } catch (error) {
    console.error("Error adding product seller:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to add seller",
      success: false,
    };
  }
}

export async function removeProductSeller(productId: string, brandId: string) {
  try {
    await database.pdpJoin.delete({
      where: {
        productId_brandId: {
          brandId,
          productId,
        },
      },
    });

    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error) {
    console.error("Error removing product seller:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to remove seller",
      success: false,
    };
  }
}

export async function getProductSellers(productId: string) {
  try {
    const sellers = await database.pdpJoin.findMany({
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
      orderBy: { createdAt: "asc" },
      where: { productId },
    });

    return { data: sellers, success: true };
  } catch (error) {
    console.error("Error fetching product sellers:", error);
    return { error: "Failed to fetch sellers", success: false };
  }
}

export async function bulkUpdateProductSellers(
  productId: string,
  brandIds: string[],
) {
  try {
    // Remove all existing PDPs for this product
    await database.pdpJoin.deleteMany({
      where: { productId },
    });

    // Add new PDPs
    if (brandIds.length > 0) {
      await database.pdpJoin.createMany({
        data: brandIds.map((brandId) => ({
          brandId,
          productId,
        })),
      });
    }

    revalidatePath("/admin/cms");
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating product sellers:", error);
    return {
      error: "Failed to update sellers",
      success: false,
    };
  }
}

// Brand/Seller Management Actions
export async function getBrands(params?: {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { type, limit = 50, page = 1, search, status } = params || {};
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(type && { type }),
      ...(status && { status }),
      deletedAt: null, // Only active brands
    };

    const [brands, total] = await Promise.all([
      database.brand.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          _count: {
            select: {
              products: true, // Count of products this brand sells
            },
          },
          baseUrl: true,
          createdAt: true,
          slug: true,
          status: true,
        },
        skip,
        take: limit,
        where,
      }),
      database.brand.count({ where }),
    ]);

    return {
      data: brands,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { error: "Failed to fetch brands", success: false };
  }
}
