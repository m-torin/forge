'use server';

import {
  findFirstProductOrm,
  findFirstBrandOrm,
  findFirstCategoryOrm,
  findFirstTaxonomyOrm,
  findFirstUserOrm,
  findFirstCollectionOrm,
} from '@repo/database/prisma';

/**
 * Server actions for async form validation
 * These check uniqueness and other constraints in the database
 */

export async function checkSkuUnique(sku: string, excludeId?: string): Promise<boolean> {
  try {
    const existing = await findFirstProductOrm({
      where: {
        sku: {
          equals: sku,
          mode: 'insensitive',
        },
        ...(excludeId && { id: { not: excludeId } }),
        deletedAt: null,
      },
      select: { id: true },
    });

    return !existing;
  } catch (error) {
    console.error('Error checking SKU uniqueness:', error);
    throw new Error('Failed to validate SKU uniqueness');
  }
}

export async function checkSlugUnique(
  type: 'brand' | 'category' | 'taxonomy',
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  try {
    let existing;

    switch (type) {
      case 'brand':
        existing = await findFirstBrandOrm({
          where: {
            slug: {
              equals: slug,
              mode: 'insensitive',
            },
            ...(excludeId && { id: { not: excludeId } }),
            deletedAt: null,
          },
          select: { id: true },
        });
        break;

      case 'category':
        existing = await findFirstCategoryOrm({
          where: {
            slug: {
              equals: slug,
              mode: 'insensitive',
            },
            ...(excludeId && { id: { not: excludeId } }),
            deletedAt: null,
          },
          select: { id: true },
        });
        break;

      case 'taxonomy':
        existing = await findFirstTaxonomyOrm({
          where: {
            slug: {
              equals: slug,
              mode: 'insensitive',
            },
            ...(excludeId && { id: { not: excludeId } }),
            deletedAt: null,
          },
          select: { id: true },
        });
        break;

      default:
        throw new Error(`Unknown type: ${type}`);
    }

    return !existing;
  } catch (error) {
    console.error(`Error checking ${type} slug uniqueness:`, error);
    throw new Error(`Failed to validate ${type} slug uniqueness`);
  }
}

export async function checkEmailUnique(email: string, excludeId?: string): Promise<boolean> {
  try {
    const existing = await findFirstUserOrm({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        ...(excludeId && { id: { not: excludeId } }),
        deletedAt: null,
      },
      select: { id: true },
    });

    return !existing;
  } catch (error) {
    console.error('Error checking email uniqueness:', error);
    throw new Error('Failed to validate email uniqueness');
  }
}

export async function checkNameUnique(
  type: 'brand' | 'category' | 'collection',
  name: string,
  excludeId?: string,
): Promise<boolean> {
  try {
    let existing;

    switch (type) {
      case 'brand':
        existing = await findFirstBrandOrm({
          where: {
            name: {
              equals: name,
              mode: 'insensitive',
            },
            ...(excludeId && { id: { not: excludeId } }),
            deletedAt: null,
          },
          select: { id: true },
        });
        break;

      case 'category':
        existing = await findFirstCategoryOrm({
          where: {
            name: {
              equals: name,
              mode: 'insensitive',
            },
            ...(excludeId && { id: { not: excludeId } }),
            deletedAt: null,
          },
          select: { id: true },
        });
        break;

      case 'collection':
        existing = await findFirstCollectionOrm({
          where: {
            name: {
              equals: name,
              mode: 'insensitive',
            },
            ...(excludeId && { id: { not: excludeId } }),
            deletedAt: null,
          },
          select: { id: true },
        });
        break;

      default:
        throw new Error(`Unknown type: ${type}`);
    }

    return !existing;
  } catch (error) {
    console.error(`Error checking ${type} name uniqueness:`, error);
    throw new Error(`Failed to validate ${type} name uniqueness`);
  }
}
