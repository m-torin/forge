'use server';

import { prisma } from '@repo/database/prisma/server/next';
import {
  ProductCreateInputSchema,
  ProductUpdateInputSchema,
  BrandCreateInputSchema,
  BrandUpdateInputSchema,
  MediaCreateInputSchema,
  CollectionCreateInputSchema,
  TaxonomyCreateInputSchema,
} from '@repo/database/zod';
import { validateFormData } from '@repo/database/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Example of server action with Prisma-generated Zod validation
 * This ensures data is valid before it reaches the database
 */
export async function createProductWithValidation(data: unknown) {
  // Validate input data against Prisma schema
  const validation = validateFormData(ProductCreateInputSchema, data);

  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      errors: validation.formattedErrors,
    };
  }

  try {
    const product = await prisma.product.create({
      data: validation.data,
    });

    revalidatePath('/pim3/products');

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Create product error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

/**
 * Update product with validation
 */
export async function updateProductWithValidation(id: string, data: unknown) {
  // Validate update data
  const validation = validateFormData(ProductUpdateInputSchema, data);

  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      errors: validation.formattedErrors,
    };
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: validation.data,
    });

    revalidatePath('/pim3/products');

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Update product error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

/**
 * Create brand with validation
 */
export async function createBrandWithValidation(data: unknown) {
  const validation = validateFormData(BrandCreateInputSchema, data);

  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      errors: validation.formattedErrors,
    };
  }

  try {
    const brand = await prisma.brand.create({
      data: validation.data,
    });

    revalidatePath('/pim3/brands');

    return {
      success: true,
      data: brand,
    };
  } catch (error) {
    console.error('Create brand error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create brand',
    };
  }
}

/**
 * Bulk create products with validation
 */
export async function bulkCreateProductsWithValidation(products: unknown[]) {
  // Validate each product
  const validationResults = products.map((product, index) => ({
    index,
    validation: validateFormData(ProductCreateInputSchema, product),
  }));

  // Check for validation errors
  const errors = validationResults.filter((result) => !result.validation.success);
  if (errors.length > 0) {
    return {
      success: false,
      error: 'Validation failed for some products',
      errors: errors.map((e) => ({
        index: e.index,
        errors: e.validation.formattedErrors,
      })),
    };
  }

  // Extract validated data
  const validatedData = validationResults.map((result) => result.validation.data!);

  try {
    // Use transaction for bulk operations
    const createdProducts = await prisma.$transaction(
      validatedData.map((data) => prisma.product.create({ data })),
    );

    revalidatePath('/pim3/products');

    return {
      success: true,
      data: createdProducts,
      count: createdProducts.length,
    };
  } catch (error) {
    console.error('Bulk create error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create products',
    };
  }
}

/**
 * Create product with relationships
 * Demonstrates handling complex nested data with validation
 */
export async function createProductWithRelationships(data: {
  product: unknown;
  categoryIds?: string[];
  collectionIds?: string[];
  mediaIds?: string[];
}) {
  // Validate product data
  const productValidation = validateFormData(ProductCreateInputSchema, data.product);

  if (!productValidation.success) {
    return {
      success: false,
      error: 'Product validation failed',
      errors: productValidation.formattedErrors,
    };
  }

  try {
    const product = await prisma.product.create({
      data: {
        ...productValidation.data,
        // Connect relationships
        categories: data.categoryIds
          ? { connect: data.categoryIds.map((id) => ({ id })) }
          : undefined,
        collections: data.collectionIds
          ? { connect: data.collectionIds.map((id) => ({ id })) }
          : undefined,
        media: data.mediaIds ? { connect: data.mediaIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        categories: true,
        collections: true,
        media: true,
      },
    });

    revalidatePath('/pim3/products');

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Create product with relationships error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}
