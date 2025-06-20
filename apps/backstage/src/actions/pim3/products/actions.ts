'use server';

import { auth } from '@repo/auth/server/next';
import { db } from '@repo/database/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Product CRUD Schema
const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().optional(),
  slug: z.string().optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  weightUnit: z.string().optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'HIDDEN']).default('PUBLIC'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.array(z.string()).default([]),
  vendor: z.string().optional(),
  barcode: z.string().optional(),
  trackQuantity: z.boolean().default(false),
  continueSellingWhenOutOfStock: z.boolean().default(false),
  requiresShipping: z.boolean().default(true),
  taxable: z.boolean().default(true),
  publishedAt: z.date().optional(),
  parentId: z.string().optional(), // For product variants
});

const productRelationshipSchema = z.object({
  collectionIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  taxonomyIds: z.array(z.string()).default([]),
  fandomIds: z.array(z.string()).default([]),
  seriesIds: z.array(z.string()).default([]),
  storyIds: z.array(z.string()).default([]),
  castIds: z.array(z.string()).default([]),
  locationIds: z.array(z.string()).default([]),
});

const fullProductSchema = productSchema.merge(productRelationshipSchema);

// Get all products with relationships
export async function getProducts() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const products = await db.product.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        parent: {
          select: { id: true, name: true },
        },
        variants: {
          select: { id: true, name: true, sku: true },
          where: { deletedAt: null },
        },
        collections: {
          include: {
            collection: {
              select: { id: true, name: true },
            },
          },
        },
        categories: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
        taxonomies: {
          include: {
            taxonomy: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        fandoms: {
          include: {
            fandom: {
              select: { id: true, name: true },
            },
          },
        },
        series: {
          include: {
            series: {
              select: { id: true, name: true },
            },
          },
        },
        stories: {
          include: {
            story: {
              select: { id: true, name: true },
            },
          },
        },
        casts: {
          include: {
            cast: {
              select: { id: true, name: true },
            },
          },
        },
        locations: {
          include: {
            location: {
              select: { id: true, name: true },
            },
          },
        },
        media: {
          select: { id: true, url: true, alt: true, type: true },
          where: { deletedAt: null },
        },
        _count: {
          select: {
            variants: true,
            pdpJoins: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

// Get single product with full relationships
export async function getProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const product = await db.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        parent: true,
        variants: {
          where: { deletedAt: null },
          include: {
            media: { where: { deletedAt: null } },
          },
        },
        collections: {
          include: { collection: true },
        },
        categories: {
          include: { category: true },
        },
        taxonomies: {
          include: { taxonomy: true },
        },
        fandoms: {
          include: { fandom: true },
        },
        series: {
          include: { series: true },
        },
        stories: {
          include: { story: true },
        },
        casts: {
          include: { cast: true },
        },
        locations: {
          include: { location: true },
        },
        media: { where: { deletedAt: null } },
        pdpJoins: {
          where: { deletedAt: null },
          include: {
            brand: { select: { id: true, name: true } },
          },
        },
        reviews: {
          where: { deletedAt: null },
          select: { id: true, rating: true, comment: true, createdAt: true },
        },
      },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return { success: false, error: 'Failed to fetch product' };
  }
}

// Create product with relationships
export async function createProduct(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const data = Object.fromEntries(formData);

    // Parse and validate the data
    const productData = fullProductSchema.parse({
      ...data,
      price: data.price ? Number(data.price) : undefined,
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
      costPrice: data.costPrice ? Number(data.costPrice) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      trackQuantity: data.trackQuantity === 'true',
      continueSellingWhenOutOfStock: data.continueSellingWhenOutOfStock === 'true',
      requiresShipping: data.requiresShipping === 'true',
      taxable: data.taxable === 'true',
      publishedAt: data.publishedAt ? new Date(data.publishedAt as string) : undefined,
      collectionIds: data.collectionIds ? JSON.parse(data.collectionIds as string) : [],
      categoryIds: data.categoryIds ? JSON.parse(data.categoryIds as string) : [],
      taxonomyIds: data.taxonomyIds ? JSON.parse(data.taxonomyIds as string) : [],
      fandomIds: data.fandomIds ? JSON.parse(data.fandomIds as string) : [],
      seriesIds: data.seriesIds ? JSON.parse(data.seriesIds as string) : [],
      storyIds: data.storyIds ? JSON.parse(data.storyIds as string) : [],
      castIds: data.castIds ? JSON.parse(data.castIds as string) : [],
      locationIds: data.locationIds ? JSON.parse(data.locationIds as string) : [],
    });

    const {
      collectionIds,
      categoryIds,
      taxonomyIds,
      fandomIds,
      seriesIds,
      storyIds,
      castIds,
      locationIds,
      ...productFields
    } = productData;

    // Create product with relationships in a transaction
    const product = await db.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          ...productFields,
          createdById: session.user.id,
          updatedById: session.user.id,
        },
      });

      // Create relationship connections
      const relationshipPromises = [];

      if (collectionIds.length > 0) {
        relationshipPromises.push(
          tx.productCollection.createMany({
            data: collectionIds.map((collectionId) => ({
              productId: newProduct.id,
              collectionId,
            })),
          }),
        );
      }

      if (categoryIds.length > 0) {
        relationshipPromises.push(
          tx.productProductCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              productId: newProduct.id,
              categoryId,
            })),
          }),
        );
      }

      if (taxonomyIds.length > 0) {
        relationshipPromises.push(
          tx.productTaxonomy.createMany({
            data: taxonomyIds.map((taxonomyId) => ({
              productId: newProduct.id,
              taxonomyId,
            })),
          }),
        );
      }

      if (fandomIds.length > 0) {
        relationshipPromises.push(
          tx.productFandom.createMany({
            data: fandomIds.map((fandomId) => ({
              productId: newProduct.id,
              fandomId,
            })),
          }),
        );
      }

      if (seriesIds.length > 0) {
        relationshipPromises.push(
          tx.productSeries.createMany({
            data: seriesIds.map((seriesId) => ({
              productId: newProduct.id,
              seriesId,
            })),
          }),
        );
      }

      if (storyIds.length > 0) {
        relationshipPromises.push(
          tx.productStory.createMany({
            data: storyIds.map((storyId) => ({
              productId: newProduct.id,
              storyId,
            })),
          }),
        );
      }

      if (castIds.length > 0) {
        relationshipPromises.push(
          tx.productCast.createMany({
            data: castIds.map((castId) => ({
              productId: newProduct.id,
              castId,
            })),
          }),
        );
      }

      if (locationIds.length > 0) {
        relationshipPromises.push(
          tx.productLocation.createMany({
            data: locationIds.map((locationId) => ({
              productId: newProduct.id,
              locationId,
            })),
          }),
        );
      }

      await Promise.all(relationshipPromises);

      return newProduct;
    });

    revalidatePath('/pim3/products');
    return { success: true, data: product };
  } catch (error) {
    console.error('Failed to create product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create product' };
  }
}

// Update product with relationships
export async function updateProduct(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const data = Object.fromEntries(formData);

    // Parse and validate the data
    const productData = fullProductSchema.partial().parse({
      ...data,
      price: data.price ? Number(data.price) : undefined,
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
      costPrice: data.costPrice ? Number(data.costPrice) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      trackQuantity: data.trackQuantity === 'true',
      continueSellingWhenOutOfStock: data.continueSellingWhenOutOfStock === 'true',
      requiresShipping: data.requiresShipping === 'true',
      taxable: data.taxable === 'true',
      publishedAt: data.publishedAt ? new Date(data.publishedAt as string) : undefined,
      collectionIds: data.collectionIds ? JSON.parse(data.collectionIds as string) : undefined,
      categoryIds: data.categoryIds ? JSON.parse(data.categoryIds as string) : undefined,
      taxonomyIds: data.taxonomyIds ? JSON.parse(data.taxonomyIds as string) : undefined,
      fandomIds: data.fandomIds ? JSON.parse(data.fandomIds as string) : undefined,
      seriesIds: data.seriesIds ? JSON.parse(data.seriesIds as string) : undefined,
      storyIds: data.storyIds ? JSON.parse(data.storyIds as string) : undefined,
      castIds: data.castIds ? JSON.parse(data.castIds as string) : undefined,
      locationIds: data.locationIds ? JSON.parse(data.locationIds as string) : undefined,
    });

    const {
      collectionIds,
      categoryIds,
      taxonomyIds,
      fandomIds,
      seriesIds,
      storyIds,
      castIds,
      locationIds,
      ...productFields
    } = productData;

    // Update product with relationships in a transaction
    const product = await db.$transaction(async (tx) => {
      // Update the product
      const updatedProduct = await tx.product.update({
        where: { id, deletedAt: null },
        data: {
          ...productFields,
          updatedById: session.user.id,
        },
      });

      // Update relationships if provided
      if (collectionIds !== undefined) {
        await tx.productCollection.deleteMany({ where: { productId: id } });
        if (collectionIds.length > 0) {
          await tx.productCollection.createMany({
            data: collectionIds.map((collectionId) => ({
              productId: id,
              collectionId,
            })),
          });
        }
      }

      if (categoryIds !== undefined) {
        await tx.productProductCategory.deleteMany({ where: { productId: id } });
        if (categoryIds.length > 0) {
          await tx.productProductCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            })),
          });
        }
      }

      if (taxonomyIds !== undefined) {
        await tx.productTaxonomy.deleteMany({ where: { productId: id } });
        if (taxonomyIds.length > 0) {
          await tx.productTaxonomy.createMany({
            data: taxonomyIds.map((taxonomyId) => ({
              productId: id,
              taxonomyId,
            })),
          });
        }
      }

      if (fandomIds !== undefined) {
        await tx.productFandom.deleteMany({ where: { productId: id } });
        if (fandomIds.length > 0) {
          await tx.productFandom.createMany({
            data: fandomIds.map((fandomId) => ({
              productId: id,
              fandomId,
            })),
          });
        }
      }

      if (seriesIds !== undefined) {
        await tx.productSeries.deleteMany({ where: { productId: id } });
        if (seriesIds.length > 0) {
          await tx.productSeries.createMany({
            data: seriesIds.map((seriesId) => ({
              productId: id,
              seriesId,
            })),
          });
        }
      }

      if (storyIds !== undefined) {
        await tx.productStory.deleteMany({ where: { productId: id } });
        if (storyIds.length > 0) {
          await tx.productStory.createMany({
            data: storyIds.map((storyId) => ({
              productId: id,
              storyId,
            })),
          });
        }
      }

      if (castIds !== undefined) {
        await tx.productCast.deleteMany({ where: { productId: id } });
        if (castIds.length > 0) {
          await tx.productCast.createMany({
            data: castIds.map((castId) => ({
              productId: id,
              castId,
            })),
          });
        }
      }

      if (locationIds !== undefined) {
        await tx.productLocation.deleteMany({ where: { productId: id } });
        if (locationIds.length > 0) {
          await tx.productLocation.createMany({
            data: locationIds.map((locationId) => ({
              productId: id,
              locationId,
            })),
          });
        }
      }

      return updatedProduct;
    });

    revalidatePath('/pim3/products');
    return { success: true, data: product };
  } catch (error) {
    console.error('Failed to update product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update product' };
  }
}

// Delete product (soft delete)
export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    await db.product.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    revalidatePath('/pim3/products');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

// Duplicate product
export async function duplicateProduct(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const originalProduct = await db.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        collections: true,
        categories: true,
        taxonomies: true,
        fandoms: true,
        series: true,
        stories: true,
        casts: true,
        locations: true,
      },
    });

    if (!originalProduct) {
      return { success: false, error: 'Product not found' };
    }

    // Duplicate product with relationships in a transaction
    const duplicatedProduct = await db.$transaction(async (tx) => {
      const {
        id: _id,
        createdAt,
        updatedAt,
        createdById,
        updatedById,
        collections,
        categories,
        taxonomies,
        fandoms,
        series,
        stories,
        casts,
        locations,
        ...productData
      } = originalProduct;

      // Create duplicate with modified name and SKU
      const duplicate = await tx.product.create({
        data: {
          ...productData,
          name: `${productData.name} (Copy)`,
          sku: productData.sku ? `${productData.sku}-copy` : undefined,
          slug: productData.slug ? `${productData.slug}-copy` : undefined,
          createdById: session.user.id,
          updatedById: session.user.id,
        },
      });

      // Duplicate relationships
      const relationshipPromises = [];

      if (collections.length > 0) {
        relationshipPromises.push(
          tx.productCollection.createMany({
            data: collections.map((rel) => ({
              productId: duplicate.id,
              collectionId: rel.collectionId,
            })),
          }),
        );
      }

      if (categories.length > 0) {
        relationshipPromises.push(
          tx.productProductCategory.createMany({
            data: categories.map((rel) => ({
              productId: duplicate.id,
              categoryId: rel.categoryId,
            })),
          }),
        );
      }

      if (taxonomies.length > 0) {
        relationshipPromises.push(
          tx.productTaxonomy.createMany({
            data: taxonomies.map((rel) => ({
              productId: duplicate.id,
              taxonomyId: rel.taxonomyId,
            })),
          }),
        );
      }

      if (fandoms.length > 0) {
        relationshipPromises.push(
          tx.productFandom.createMany({
            data: fandoms.map((rel) => ({
              productId: duplicate.id,
              fandomId: rel.fandomId,
            })),
          }),
        );
      }

      if (series.length > 0) {
        relationshipPromises.push(
          tx.productSeries.createMany({
            data: series.map((rel) => ({
              productId: duplicate.id,
              seriesId: rel.seriesId,
            })),
          }),
        );
      }

      if (stories.length > 0) {
        relationshipPromises.push(
          tx.productStory.createMany({
            data: stories.map((rel) => ({
              productId: duplicate.id,
              storyId: rel.storyId,
            })),
          }),
        );
      }

      if (casts.length > 0) {
        relationshipPromises.push(
          tx.productCast.createMany({
            data: casts.map((rel) => ({
              productId: duplicate.id,
              castId: rel.castId,
            })),
          }),
        );
      }

      if (locations.length > 0) {
        relationshipPromises.push(
          tx.productLocation.createMany({
            data: locations.map((rel) => ({
              productId: duplicate.id,
              locationId: rel.locationId,
            })),
          }),
        );
      }

      await Promise.all(relationshipPromises);

      return duplicate;
    });

    revalidatePath('/pim3/products');
    return { success: true, data: duplicatedProduct };
  } catch (error) {
    console.error('Failed to duplicate product:', error);
    return { success: false, error: 'Failed to duplicate product' };
  }
}

// Get available options for relationships
export async function getProductRelationshipOptions() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const [
      collections,
      categories,
      taxonomies,
      fandoms,
      series,
      stories,
      casts,
      locations,
      parentProducts,
    ] = await Promise.all([
      db.collection.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      db.productCategory.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      db.taxonomy.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, type: true },
        orderBy: { name: 'asc' },
      }),
      db.fandom.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      db.series.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      db.story.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      db.cast.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      db.location.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      db.product.findMany({
        where: {
          deletedAt: null,
          parentId: null, // Only root products can be parents
        },
        select: { id: true, name: true, sku: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      success: true,
      data: {
        collections,
        categories,
        taxonomies,
        fandoms,
        series,
        stories,
        casts,
        locations,
        parentProducts,
      },
    };
  } catch (error) {
    console.error('Failed to fetch relationship options:', error);
    return { success: false, error: 'Failed to fetch relationship options' };
  }
}
