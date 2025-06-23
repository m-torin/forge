'use server';

import { auth } from '@repo/auth/server/next';
import { db } from '@repo/database/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// PdpJoin CRUD Schema
const pdpJoinSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  brandId: z.string().min(1, 'Brand is required'),
  canonicalUrl: z.string().url('Valid URL is required'),
  iframeUrl: z.string().url('Valid URL is required').optional(),
  tempMediaUrls: z.string().optional(),
  lastScanned: z.date().optional(),
  copy: z.record(z.any()).default({}),
});

const pdpJoinRelationshipSchema = z.object({
  taxonomyIds: z.array(z.string()).default([]),
  locationIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
  manufacturerBrandIds: z.array(z.string()).default([]),
});

const fullPdpJoinSchema = pdpJoinSchema.merge(pdpJoinRelationshipSchema);

// Get all PdpJoins with relationships
export async function getPdpJoins(params?: {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  brandId?: string;
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
      productId,
      brandId,
      search,
    } = params || {};
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { canonicalUrl: { contains: search, mode: 'insensitive' as const } },
          { iframeUrl: { contains: search, mode: 'insensitive' as const } },
          { product: { name: { contains: search, mode: 'insensitive' as const } } },
          { brand: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(productId && { productId }),
      ...(brandId && { brandId }),
    };

    const [pdpJoins, total] = await Promise.all([
      db.pdpJoin.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true, status: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          taxonomies: {
            select: { id: true, name: true, type: true },
            take: 5,
          },
          locations: {
            select: { id: true, name: true },
            take: 5,
          },
          collections: {
            select: { id: true, name: true, slug: true },
            take: 5,
          },
          manufacturerBrands: {
            select: { id: true, name: true, slug: true },
            take: 5,
          },
          media: {
            select: { id: true, url: true, alt: true, type: true },
            take: 3,
          },
          identifiers: {
            select: { id: true, upcA: true, ean13: true, asin: true },
            take: 3,
          },
          urls: {
            select: { id: true, url: true, urlType: true, isActive: true },
          },
          _count: {
            select: {
              taxonomies: true,
              locations: true,
              collections: true,
              manufacturerBrands: true,
              media: true,
              identifiers: true,
              urls: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.pdpJoin.count({ where }),
    ]);

    return {
      success: true,
      data: {
        pdpJoins,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Failed to fetch PDP joins:', error);
    return { success: false, error: 'Failed to fetch PDP joins' };
  }
}

// Get single PdpJoin with full relationships
export async function getPdpJoin(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const pdpJoin = await db.pdpJoin.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            variants: {
              select: { id: true, name: true, sku: true },
              where: { deletedAt: null },
            },
            media: {
              select: { id: true, url: true, alt: true, type: true },
              where: { deletedAt: null },
              take: 5,
            },
          },
        },
        brand: {
          include: {
            media: {
              select: { id: true, url: true, alt: true, type: true },
              where: { deletedAt: null },
              take: 3,
            },
          },
        },
        taxonomies: true,
        locations: true,
        collections: {
          where: { deletedAt: null },
        },
        manufacturerBrands: {
          where: { deletedAt: null },
        },
        media: {
          where: { deletedAt: null },
        },
        identifiers: true,
        urls: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            taxonomies: true,
            locations: true,
            collections: true,
            manufacturerBrands: true,
            media: true,
            identifiers: true,
            urls: true,
          },
        },
      },
    });

    if (!pdpJoin) {
      return { success: false, error: 'PDP join not found' };
    }

    return { success: true, data: pdpJoin };
  } catch (error) {
    console.error('Failed to fetch PDP join:', error);
    return { success: false, error: 'Failed to fetch PDP join' };
  }
}

// Create PdpJoin with relationships
export async function createPdpJoin(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const data = Object.fromEntries(formData);

    // Parse and validate the data
    const pdpJoinData = fullPdpJoinSchema.parse({
      ...data,
      lastScanned: data.lastScanned ? new Date(data.lastScanned as string) : undefined,
      copy: data.copy ? JSON.parse(data.copy as string) : {},
      taxonomyIds: data.taxonomyIds ? JSON.parse(data.taxonomyIds as string) : [],
      locationIds: data.locationIds ? JSON.parse(data.locationIds as string) : [],
      collectionIds: data.collectionIds ? JSON.parse(data.collectionIds as string) : [],
      manufacturerBrandIds: data.manufacturerBrandIds
        ? JSON.parse(data.manufacturerBrandIds as string)
        : [],
    });

    const { taxonomyIds, locationIds, collectionIds, manufacturerBrandIds, ...pdpJoinFields } =
      pdpJoinData;

    // Validate required relationships exist
    const [product, brand] = await Promise.all([
      db.product.findUnique({
        where: { id: pdpJoinFields.productId, deletedAt: null },
      }),
      db.brand.findUnique({
        where: { id: pdpJoinFields.brandId, deletedAt: null },
      }),
    ]);

    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    if (!brand) {
      return { success: false, error: 'Brand not found' };
    }

    // Check if PdpJoin with same product+brand already exists
    const existingPdpJoin = await db.pdpJoin.findFirst({
      where: {
        productId: pdpJoinFields.productId,
        brandId: pdpJoinFields.brandId,
      },
    });
    if (existingPdpJoin) {
      return {
        success: false,
        error: 'PDP join already exists for this product and brand combination',
      };
    }

    // Check if canonical URL already exists
    const existingUrl = await db.pdpJoin.findUnique({
      where: { canonicalUrl: pdpJoinFields.canonicalUrl },
    });
    if (existingUrl) {
      return { success: false, error: 'A PDP join with this canonical URL already exists' };
    }

    // Create PdpJoin with relationships in a transaction
    const pdpJoin = await db.$transaction(async (tx) => {
      // Create the PdpJoin
      const newPdpJoin = await tx.pdpJoin.create({
        data: pdpJoinFields,
      });

      // Connect many-to-many relationships
      const relationshipPromises = [];

      if (taxonomyIds.length > 0) {
        relationshipPromises.push(
          tx.pdpJoin.update({
            where: { id: newPdpJoin.id },
            data: {
              taxonomies: {
                connect: taxonomyIds.map((id) => ({ id })),
              },
            },
          }),
        );
      }

      if (locationIds.length > 0) {
        relationshipPromises.push(
          tx.pdpJoin.update({
            where: { id: newPdpJoin.id },
            data: {
              locations: {
                connect: locationIds.map((id) => ({ id })),
              },
            },
          }),
        );
      }

      if (collectionIds.length > 0) {
        relationshipPromises.push(
          tx.pdpJoin.update({
            where: { id: newPdpJoin.id },
            data: {
              collections: {
                connect: collectionIds.map((id) => ({ id })),
              },
            },
          }),
        );
      }

      if (manufacturerBrandIds.length > 0) {
        relationshipPromises.push(
          tx.pdpJoin.update({
            where: { id: newPdpJoin.id },
            data: {
              manufacturerBrands: {
                connect: manufacturerBrandIds.map((id) => ({ id })),
              },
            },
          }),
        );
      }

      await Promise.all(relationshipPromises);

      return newPdpJoin;
    });

    revalidatePath('/pim3/pdp-joins');
    return { success: true, data: pdpJoin };
  } catch (error) {
    console.error('Failed to create PDP join:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create PDP join' };
  }
}

// Update PdpJoin with relationships
export async function updatePdpJoin(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const data = Object.fromEntries(formData);

    // Parse and validate the data
    const pdpJoinData = fullPdpJoinSchema.partial().parse({
      ...data,
      lastScanned: data.lastScanned ? new Date(data.lastScanned as string) : undefined,
      copy: data.copy ? JSON.parse(data.copy as string) : undefined,
      taxonomyIds: data.taxonomyIds ? JSON.parse(data.taxonomyIds as string) : undefined,
      locationIds: data.locationIds ? JSON.parse(data.locationIds as string) : undefined,
      collectionIds: data.collectionIds ? JSON.parse(data.collectionIds as string) : undefined,
      manufacturerBrandIds: data.manufacturerBrandIds
        ? JSON.parse(data.manufacturerBrandIds as string)
        : undefined,
    });

    const { taxonomyIds, locationIds, collectionIds, manufacturerBrandIds, ...pdpJoinFields } =
      pdpJoinData;

    // Check if PdpJoin exists
    const existingPdpJoin = await db.pdpJoin.findUnique({
      where: { id },
    });
    if (!existingPdpJoin) {
      return { success: false, error: 'PDP join not found' };
    }

    // Validate required relationships if being changed
    if (pdpJoinFields.productId) {
      const product = await db.product.findUnique({
        where: { id: pdpJoinFields.productId, deletedAt: null },
      });
      if (!product) {
        return { success: false, error: 'Product not found' };
      }
    }

    if (pdpJoinFields.brandId) {
      const brand = await db.brand.findUnique({
        where: { id: pdpJoinFields.brandId, deletedAt: null },
      });
      if (!brand) {
        return { success: false, error: 'Brand not found' };
      }
    }

    // Check if new canonical URL already exists (if being changed)
    if (pdpJoinFields.canonicalUrl && pdpJoinFields.canonicalUrl !== existingPdpJoin.canonicalUrl) {
      const existingUrl = await db.pdpJoin.findUnique({
        where: { canonicalUrl: pdpJoinFields.canonicalUrl },
      });
      if (existingUrl) {
        return { success: false, error: 'A PDP join with this canonical URL already exists' };
      }
    }

    // Update PdpJoin with relationships in a transaction
    const pdpJoin = await db.$transaction(async (tx) => {
      // Update the PdpJoin
      const updatedPdpJoin = await tx.pdpJoin.update({
        where: { id },
        data: pdpJoinFields,
      });

      // Update many-to-many relationships if provided
      if (taxonomyIds !== undefined) {
        await tx.pdpJoin.update({
          where: { id },
          data: {
            taxonomies: {
              set: taxonomyIds.map((taxonomyId) => ({ id: taxonomyId })),
            },
          },
        });
      }

      if (locationIds !== undefined) {
        await tx.pdpJoin.update({
          where: { id },
          data: {
            locations: {
              set: locationIds.map((locationId) => ({ id: locationId })),
            },
          },
        });
      }

      if (collectionIds !== undefined) {
        await tx.pdpJoin.update({
          where: { id },
          data: {
            collections: {
              set: collectionIds.map((collectionId) => ({ id: collectionId })),
            },
          },
        });
      }

      if (manufacturerBrandIds !== undefined) {
        await tx.pdpJoin.update({
          where: { id },
          data: {
            manufacturerBrands: {
              set: manufacturerBrandIds.map((brandId) => ({ id: brandId })),
            },
          },
        });
      }

      return updatedPdpJoin;
    });

    revalidatePath('/pim3/pdp-joins');
    return { success: true, data: pdpJoin };
  } catch (error) {
    console.error('Failed to update PDP join:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update PDP join' };
  }
}

// Delete PdpJoin (hard delete since no soft delete fields)
export async function deletePdpJoin(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await db.pdpJoin.delete({
      where: { id },
    });

    revalidatePath('/pim3/pdp-joins');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete PDP join:', error);
    return { success: false, error: 'Failed to delete PDP join' };
  }
}

// Duplicate PdpJoin
export async function duplicatePdpJoin(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const originalPdpJoin = await db.pdpJoin.findUnique({
      where: { id },
      include: {
        taxonomies: true,
        locations: true,
        collections: true,
        manufacturerBrands: true,
      },
    });

    if (!originalPdpJoin) {
      return { success: false, error: 'PDP join not found' };
    }

    // Duplicate PdpJoin with relationships in a transaction
    const duplicatedPdpJoin = await db.$transaction(async (tx) => {
      const {
        id: id,
        createdAt,
        updatedAt,
        taxonomies,
        locations,
        collections,
        manufacturerBrands,
        ...pdpJoinData
      } = originalPdpJoin;

      // Generate unique canonical URL
      let newCanonicalUrl = `${pdpJoinData.canonicalUrl}-copy`;
      let counter = 1;
      while (await tx.pdpJoin.findUnique({ where: { canonicalUrl: newCanonicalUrl } })) {
        newCanonicalUrl = `${pdpJoinData.canonicalUrl}-copy-${counter}`;
        counter++;
      }

      // Create duplicate
      const duplicate = await tx.pdpJoin.create({
        data: {
          ...pdpJoinData,
          canonicalUrl: newCanonicalUrl,
          iframeUrl: pdpJoinData.iframeUrl ? `${pdpJoinData.iframeUrl}-copy` : undefined,
        },
      });

      // Duplicate relationships
      const relationshipPromises = [];

      if (taxonomies.length > 0) {
        relationshipPromises.push(
          tx.pdpJoin.update({
            where: { id: duplicate.id },
            data: {
              taxonomies: {
                connect: taxonomies.map((taxonomy) => ({ id: taxonomy.id })),
              },
            },
          }),
        );
      }

      if (locations.length > 0) {
        relationshipPromises.push(
          tx.pdpJoin.update({
            where: { id: duplicate.id },
            data: {
              locations: {
                connect: locations.map((location) => ({ id: location.id })),
              },
            },
          }),
        );
      }

      if (collections.length > 0) {
        relationshipPromises.push(
          tx.pdpJoin.update({
            where: { id: duplicate.id },
            data: {
              collections: {
                connect: collections.map((collection) => ({ id: collection.id })),
              },
            },
          }),
        );
      }

      if (manufacturerBrands.length > 0) {
        relationshipPromises.push(
          tx.pdpJoin.update({
            where: { id: duplicate.id },
            data: {
              manufacturerBrands: {
                connect: manufacturerBrands.map((brand) => ({ id: brand.id })),
              },
            },
          }),
        );
      }

      await Promise.all(relationshipPromises);

      return duplicate;
    });

    revalidatePath('/pim3/pdp-joins');
    return { success: true, data: duplicatedPdpJoin };
  } catch (error) {
    console.error('Failed to duplicate PDP join:', error);
    return { success: false, error: 'Failed to duplicate PDP join' };
  }
}

// Get available options for relationships
export async function getPdpJoinRelationshipOptions() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const [products, brands, taxonomies, locations, collections, manufacturerBrands] =
      await Promise.all([
        db.product.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, sku: true, status: true },
          orderBy: { name: 'asc' },
        }),
        db.brand.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        }),
        db.taxonomy.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, type: true },
          orderBy: { name: 'asc' },
        }),
        db.location.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        db.collection.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        }),
        db.brand.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        }),
      ]);

    return {
      success: true,
      data: {
        products,
        brands,
        taxonomies,
        locations,
        collections,
        manufacturerBrands,
      },
    };
  } catch (error) {
    console.error('Failed to fetch relationship options:', error);
    return { success: false, error: 'Failed to fetch relationship options' };
  }
}

// Get PdpJoins by product
export async function getPdpJoinsByProduct(productId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const pdpJoins = await db.pdpJoin.findMany({
      where: { productId },
      include: {
        brand: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            taxonomies: true,
            locations: true,
            collections: true,
            manufacturerBrands: true,
            media: true,
            identifiers: true,
            urls: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, data: pdpJoins };
  } catch (error) {
    console.error('Failed to fetch PDP joins by product:', error);
    return { success: false, error: 'Failed to fetch PDP joins by product' };
  }
}

// Get PdpJoins by brand
export async function getPdpJoinsByBrand(brandId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const pdpJoins = await db.pdpJoin.findMany({
      where: { brandId },
      include: {
        product: {
          select: { id: true, name: true, sku: true, status: true },
        },
        _count: {
          select: {
            taxonomies: true,
            locations: true,
            collections: true,
            manufacturerBrands: true,
            media: true,
            identifiers: true,
            urls: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, data: pdpJoins };
  } catch (error) {
    console.error('Failed to fetch PDP joins by brand:', error);
    return { success: false, error: 'Failed to fetch PDP joins by brand' };
  }
}
