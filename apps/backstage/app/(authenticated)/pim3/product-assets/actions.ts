'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@repo/database/prisma';
import { uploadMediaAction, getMediaUrlAction } from '@repo/storage/server/next';

import type { AssetType, ProductAsset } from '@repo/database/prisma';

// Product Asset Management Actions

// Get asset statistics
export async function getAssetStats() {
  try {
    const [totalAssets, assetsByType, totalSizeResult, recentUploads] = await Promise.all([
      prisma.productAsset.count(),
      prisma.productAsset.groupBy({
        _count: {
          type: true,
        },
        by: ['type'],
      }),
      prisma.productAsset.aggregate({
        _sum: {
          size: true,
        },
      }),
      prisma.productAsset.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const assetTypeCount = assetsByType.reduce(
      (acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalSize = totalSizeResult._sum.size || 0;

    // Calculate optimization score based on:
    // - Assets with alt text (images)
    // - Assets with descriptions
    // - Appropriate file sizes
    const [assetsWithAlt, assetsWithDescription, totalImageAssets] = await Promise.all([
      prisma.productAsset.count({
        where: {
          type: 'IMAGE',
          alt: {
            not: null,
          },
        },
      }),
      prisma.productAsset.count({
        where: {
          description: {
            not: null,
          },
        },
      }),
      prisma.productAsset.count({
        where: {
          type: 'IMAGE',
        },
      }),
    ]);

    const altTextScore = totalImageAssets > 0 ? (assetsWithAlt / totalImageAssets) * 40 : 40;
    const descriptionScore = totalAssets > 0 ? (assetsWithDescription / totalAssets) * 30 : 30;
    const fileSizeScore = 30; // Placeholder - would need to analyze actual file sizes

    const optimizationScore = Math.round(altTextScore + descriptionScore + fileSizeScore);

    // Mock storage data - in real implementation, this would come from your storage provider
    const storageUsed = totalSize;
    const storageTotal = 1024 * 1024 * 1024 * 100; // 100GB mock limit
    const storagePercentage = (storageUsed / storageTotal) * 100;

    return {
      data: {
        assetsByType: assetTypeCount,
        optimizationScore,
        recentUploads,
        storageUsage: {
          percentage: storagePercentage,
          total: storageTotal,
          used: storageUsed,
        },
        totalAssets,
        totalSize,
      },
      success: true,
    };
  } catch (error) {
    console.error('Error getting asset stats:', error);
    return {
      error: 'Failed to load asset statistics',
      success: false,
    };
  }
}

// Get products for filters
export async function getProducts(options: { limit?: number } = {}) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        sku: true,
      },
      take: options.limit || 50,
    });

    return {
      data: products,
      success: true,
    };
  } catch (error) {
    console.error('Error getting products:', error);
    return {
      error: 'Failed to load products',
      success: false,
    };
  }
}

// Get assets by product with filtering
interface GetAssetsByProductOptions {
  limit?: number;
  page?: number;
  productIds?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: AssetType;
}

export async function getAssetsByProduct(options: GetAssetsByProductOptions = {}) {
  try {
    const {
      type,
      limit = 20,
      page = 1,
      productIds,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (productIds && productIds.length > 0) {
      where.productId = {
        in: productIds,
      };
    }

    if (search) {
      // Handle special search queries
      if (search.startsWith('missing:')) {
        const field = search.replace('missing:', '');
        if (field === 'alt') {
          where.alt = null;
          where.type = 'IMAGE';
        }
      } else if (search.startsWith('unoptimized:')) {
        // Find large images or missing metadata
        where.OR = [
          {
            type: 'IMAGE',
            size: {
              gt: 5 * 1024 * 1024, // > 5MB
            },
          },
          {
            type: 'IMAGE',
            alt: null,
          },
          {
            description: null,
          },
        ];
      } else {
        // Regular search
        where.OR = [
          {
            filename: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            alt: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            product: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ];
      }
    }

    const [assets, totalCount] = await Promise.all([
      prisma.productAsset.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
      prisma.productAsset.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: assets,
      pagination: {
        limit,
        page,
        totalCount,
        totalPages,
      },
      success: true,
    };
  } catch (error) {
    console.error('Error getting assets by product:', error);
    return {
      error: 'Failed to load product assets',
      success: false,
    };
  }
}

// Update asset metadata
const updateAssetSchema = z.object({
  filename: z.string().optional(),
  alt: z.string().optional(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  sortOrder: z.number().optional(),
});

export async function updateAssetMetadata(assetId: string, updates: Partial<ProductAsset>) {
  try {
    const validatedUpdates = updateAssetSchema.parse(updates);

    const asset = await prisma.productAsset.update({
      data: validatedUpdates,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      where: { id: assetId },
    });

    revalidatePath('/pim3/product-assets');

    return {
      data: asset,
      success: true,
    };
  } catch (error) {
    console.error('Error updating asset metadata:', error);
    return {
      error: 'Failed to update asset metadata',
      success: false,
    };
  }
}

// Delete asset
export async function deleteAsset(assetId: string) {
  try {
    await prisma.productAsset.delete({
      where: { id: assetId },
    });

    revalidatePath('/pim3/product-assets');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return {
      error: 'Failed to delete asset',
      success: false,
    };
  }
}

// Bulk delete assets
export async function bulkDeleteAssets(assetIds: string[]) {
  try {
    await prisma.productAsset.deleteMany({
      where: {
        id: {
          in: assetIds,
        },
      },
    });

    revalidatePath('/pim3/product-assets');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error bulk deleting assets:', error);
    return {
      error: 'Failed to delete assets',
      success: false,
    };
  }
}

// Bulk update assets
interface BulkUpdateOptions {
  assetIds: string[];
  updates: {
    type?: AssetType;
    sortOrder?: number;
    description?: string;
  };
}

export async function bulkUpdateAssets({ assetIds, updates }: BulkUpdateOptions) {
  try {
    await prisma.productAsset.updateMany({
      data: updates,
      where: {
        id: {
          in: assetIds,
        },
      },
    });

    revalidatePath('/pim3/product-assets');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error bulk updating assets:', error);
    return {
      error: 'Failed to update assets',
      success: false,
    };
  }
}

// Link asset to product
const linkAssetSchema = z.object({
  filename: z.string().min(1),
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'MANUAL', 'SPECIFICATION', 'CERTIFICATE', 'OTHER']),
  url: z.string().url(),
  alt: z.string().optional(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  productId: z.string().min(1),
  size: z.number().optional(),
  sortOrder: z.number().default(0),
});

export async function linkAssetToProduct(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = linkAssetSchema.parse({
      ...data,
      size: data.size ? parseInt(data.size as string) : undefined,
      sortOrder: data.sortOrder ? parseInt(data.sortOrder as string) : 0,
    });

    const asset = await prisma.productAsset.create({
      data: validatedData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    revalidatePath('/pim3/product-assets');

    return {
      data: asset,
      success: true,
    };
  } catch (error) {
    console.error('Error linking asset to product:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to link asset to product',
      success: false,
    };
  }
}

// Get asset usage analytics
export async function getAssetUsageAnalytics(assetId: string) {
  try {
    // In a real implementation, this would track:
    // - How many times the asset has been viewed
    // - Which product pages use this asset
    // - Download statistics
    // - Performance metrics (load times, etc.)

    const asset = await prisma.productAsset.findUnique({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      where: { id: assetId },
    });

    if (!asset) {
      return {
        error: 'Asset not found',
        success: false,
      };
    }

    // Mock analytics data
    const analytics = {
      avgLoadTime: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
      conversionRate: Math.round(Math.random() * 10 * 100) / 100,
      downloads: Math.floor(Math.random() * 100),
      lastViewed: new Date(),
      performance: {
        score: Math.floor(Math.random() * 40 + 60), // 60-100
        suggestions: [
          'Consider optimizing file size',
          'Add more descriptive alt text',
          'Improve image quality',
        ].slice(0, Math.floor(Math.random() * 3) + 1),
      },
      popularOn: ['product-detail', 'search-results', 'category-page'],
      views: Math.floor(Math.random() * 1000),
    };

    return {
      data: {
        analytics,
        asset,
      },
      success: true,
    };
  } catch (error) {
    console.error('Error getting asset usage analytics:', error);
    return {
      error: 'Failed to load asset analytics',
      success: false,
    };
  }
}

// Get asset optimization recommendations
export async function getAssetOptimizationRecommendations() {
  try {
    // Find assets that need optimization
    const [largeImages, imagesWithoutAlt, assetsWithoutDescription, duplicateFilenames] =
      await Promise.all([
        prisma.productAsset.findMany({
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
          take: 10,
          where: {
            type: 'IMAGE',
            size: {
              gt: 5 * 1024 * 1024, // > 5MB
            },
          },
        }),
        prisma.productAsset.findMany({
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
          take: 10,
          where: {
            type: 'IMAGE',
            alt: null,
          },
        }),
        prisma.productAsset.findMany({
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
          take: 10,
          where: {
            description: null,
          },
        }),
        prisma.productAsset.groupBy({
          _count: {
            filename: true,
          },
          by: ['filename'],
          having: {
            filename: {
              _count: {
                gt: 1,
              },
            },
          },
          orderBy: {
            _count: {
              filename: 'desc',
            },
          },
          take: 10,
        }),
      ]);

    const recommendations = [
      {
        type: 'file-size',
        action: 'Compress images to reduce file size',
        assets: largeImages,
        count: largeImages.length,
        description: 'These images are larger than 5MB and should be optimized',
        priority: 'high' as const,
        title: 'Large Image Files',
      },
      {
        type: 'missing-alt',
        action: 'Add descriptive alt text for better SEO and accessibility',
        assets: imagesWithoutAlt,
        count: imagesWithoutAlt.length,
        description: 'These images are missing alt text for accessibility',
        priority: 'medium' as const,
        title: 'Missing Alt Text',
      },
      {
        type: 'missing-description',
        action: 'Add descriptions to improve searchability',
        assets: assetsWithoutDescription,
        count: assetsWithoutDescription.length,
        description: 'These assets lack descriptions',
        priority: 'low' as const,
        title: 'Missing Descriptions',
      },
      {
        type: 'duplicate-names',
        action: 'Rename files to avoid confusion',
        assets: [],
        count: duplicateFilenames.length,
        description: 'Multiple assets share the same filename',
        priority: 'medium' as const,
        title: 'Duplicate Filenames',
      },
    ].filter((rec) => rec.count > 0);

    return {
      data: recommendations,
      success: true,
    };
  } catch (error) {
    console.error('Error getting optimization recommendations:', error);
    return {
      error: 'Failed to load optimization recommendations',
      success: false,
    };
  }
}

// Asset template operations
export async function getAssetTemplates() {
  try {
    // Mock asset templates - in real implementation, these would be stored in the database
    const templates = [
      {
        id: 'product-hero',
        name: 'Product Hero Image',
        type: 'IMAGE' as AssetType,
        description: 'Main product image for product detail pages',
        dimensions: { width: 1200, height: 1200 },
        formats: ['jpg', 'webp'],
        maxSize: 2 * 1024 * 1024, // 2MB
        requirements: [
          'Square aspect ratio (1:1)',
          'White or transparent background',
          'Product centered in frame',
          'High resolution (min 1200x1200)',
        ],
      },
      {
        id: 'product-gallery',
        name: 'Product Gallery Images',
        type: 'IMAGE' as AssetType,
        description: 'Additional product images showing different angles',
        dimensions: { width: 800, height: 800 },
        formats: ['jpg', 'webp'],
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        requirements: [
          'Square aspect ratio (1:1)',
          'Consistent lighting and background',
          'Show product details clearly',
        ],
      },
      {
        id: 'product-manual',
        name: 'Product Manual',
        type: 'MANUAL' as AssetType,
        description: 'User manual or instruction guide',
        formats: ['pdf'],
        maxSize: 10 * 1024 * 1024, // 10MB
        requirements: [
          'PDF format only',
          'Searchable text (not scanned images)',
          'Clear, readable fonts',
          'Logical page structure',
        ],
      },
      {
        id: 'product-certificate',
        name: 'Quality Certificate',
        type: 'CERTIFICATE' as AssetType,
        description: 'Quality assurance or compliance certificates',
        formats: ['pdf', 'jpg'],
        maxSize: 5 * 1024 * 1024, // 5MB
        requirements: [
          'Official letterhead visible',
          'Clear signature and seal',
          'Valid date range',
          'High resolution for verification',
        ],
      },
    ];

    return {
      data: templates,
      success: true,
    };
  } catch (error) {
    console.error('Error getting asset templates:', error);
    return {
      error: 'Failed to load asset templates',
      success: false,
    };
  }
}

interface UploadProductAssetParams {
  file: File;
  productId: string;
  type: AssetType;
  alt?: string;
  description?: string;
  sortOrder: number;
  onProgress?: (progress: number) => void;
}

export async function uploadProductAssetWithStorage(params: UploadProductAssetParams) {
  const { file, productId, type, alt, description, sortOrder, onProgress } = params;

  try {
    // Generate storage key for product assets
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const key = `products/${productId}/assets/${timestamp}-${sanitizedFilename}`;

    // Track progress manually since we're in server action
    let lastProgress = 0;
    
    // Upload file to storage
    const uploadResult = await uploadMediaAction(key, file, {
      contentType: file.type,
      metadata: {
        productId,
        assetType: type,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update progress
    if (onProgress) {
      onProgress(50);
    }

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Get signed URL for product assets
    const urlResult = await getMediaUrlAction(key, {
      context: 'product', // Ensures signed URL for product photos
      expiresIn: 7200, // 2 hours for admin operations
    });

    if (!urlResult.success) {
      throw new Error(urlResult.error || 'Failed to get URL');
    }

    // Update progress
    if (onProgress) {
      onProgress(75);
    }

    // Create ProductAsset record in database
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('type', type);
    formData.append('url', urlResult.data);
    formData.append('filename', file.name);
    formData.append('mimeType', file.type);
    formData.append('size', file.size.toString());
    if (alt) formData.append('alt', alt);
    if (description) formData.append('description', description);
    formData.append('sortOrder', sortOrder.toString());

    const result = await linkAssetToProduct(formData);

    // Update progress
    if (onProgress) {
      onProgress(100);
    }

    return result;
  } catch (error) {
    console.error('Product asset upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload product asset',
    };
  }
}
