'use server';

import {
  findFirstProductOrm,
  findFirstBrandOrm,
  findFirstCollectionOrm,
  findFirstTaxonomyOrm,
  findFirstArticleOrm,
  findUniqueProductOrm,
  findUniqueBrandOrm,
  findUniqueCollectionOrm,
  findUniqueTaxonomyOrm,
  findUniqueArticleOrm,
  findManyProductsOrm,
  findManyBrandsOrm,
  findManyCollectionsOrm,
  findManyTaxonomiesOrm,
  findManyArticlesOrm,
} from '../orm';
import {
  findUniqueProductCategoryOrm,
  findFirstProductCategoryOrm,
  findManyProductCategoriesOrm,
} from '../orm/productCategoryOrm';

// Temporary console logging until orchestration package is stable
const logger = {
  error: (message: string, ...args: any[]) =>
    console.error(`[database:validation] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[database:validation] ${message}`, ...args),
  info: (message: string, ...args: any[]) =>
    console.info(`[database:validation] ${message}`, ...args),
  log: (message: string, ...args: any[]) =>
    console.log(`[database:validation] ${message}`, ...args),
};

type ValidatedModel = 'product' | 'category' | 'brand' | 'collection' | 'article' | 'taxonomy';

/**
 * Check if a slug is available for a given model
 */
export async function checkSlugAvailabilityAction(
  slug: string,
  excludeId?: string,
  model: ValidatedModel = 'product',
): Promise<{ success: boolean; available?: boolean; error?: string }> {
  try {
    // For models that use 'handle' instead of 'slug'
    const slugField = model === 'product' || model === 'collection' ? 'slug' : 'slug';
    const whereClause: any = { [slugField]: slug };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    let existing: any = null;

    switch (model) {
      case 'product':
        existing = await findFirstProductOrm({ where: whereClause });
        break;
      case 'brand':
        existing = await findFirstBrandOrm({ where: whereClause });
        break;
      case 'collection':
        existing = await findFirstCollectionOrm({ where: whereClause });
        break;
      case 'taxonomy':
        existing = await findFirstTaxonomyOrm({ where: whereClause });
        break;
      case 'article':
        existing = await findFirstArticleOrm({ where: whereClause });
        break;
      case 'category':
        existing = await findFirstProductCategoryOrm({ where: whereClause });
        break;
    }

    return { success: true, available: !existing };
  } catch (error) {
    logger.error(`Error checking slug availability for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check slug availability',
    };
  }
}

/**
 * Generate a unique slug by appending numbers if needed
 */
export async function generateUniqueSlugAction(
  baseSlug: string,
  model: ValidatedModel = 'product',
  excludeId?: string,
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const result = await checkSlugAvailabilityAction(slug, excludeId, model);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (result.available) {
        return { success: true, slug };
      }

      slug = `${baseSlug}-${counter}`;
      counter++;

      // Prevent infinite loops
      if (counter > 100) {
        return { success: false, error: 'Could not generate unique slug' };
      }
    }
  } catch (error) {
    logger.error(`Error generating unique slug for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate unique slug',
    };
  }
}

/**
 * Validate entity exists before operations
 */
export async function validateEntityExistsAction(
  model: ValidatedModel,
  id: string,
): Promise<{ success: boolean; exists?: boolean; data?: any; error?: string }> {
  try {
    let entity: any = null;

    switch (model) {
      case 'product':
        entity = await findUniqueProductOrm({ where: { id } });
        break;
      case 'brand':
        entity = await findUniqueBrandOrm({ where: { id } });
        break;
      case 'collection':
        entity = await findUniqueCollectionOrm({ where: { id } });
        break;
      case 'taxonomy':
        entity = await findUniqueTaxonomyOrm({ where: { id } });
        break;
      case 'article':
        entity = await findUniqueArticleOrm({ where: { id } });
        break;
      case 'category':
        entity = await findUniqueProductCategoryOrm({ where: { id } });
        break;
    }

    return {
      success: true,
      exists: !!entity,
      data: entity,
    };
  } catch (error) {
    logger.error(`Error validating entity existence for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate entity',
    };
  }
}

/**
 * Validate multiple entities exist
 */
export async function validateEntitiesExistAction(
  model: ValidatedModel,
  ids: string[],
): Promise<{
  success: boolean;
  allExist?: boolean;
  existingIds?: string[];
  missingIds?: string[];
  error?: string;
}> {
  try {
    let entities: any[] = [];

    switch (model) {
      case 'product':
        entities = await findManyProductsOrm({
          where: { id: { in: ids } },
          select: { id: true },
        });
        break;
      case 'brand':
        entities = await findManyBrandsOrm({
          where: { id: { in: ids } },
          select: { id: true },
        });
        break;
      case 'collection':
        entities = await findManyCollectionsOrm({
          where: { id: { in: ids } },
          select: { id: true },
        });
        break;
      case 'taxonomy':
        entities = await findManyTaxonomiesOrm({
          where: { id: { in: ids } },
          select: { id: true },
        });
        break;
      case 'article':
        entities = await findManyArticlesOrm({
          where: { id: { in: ids } },
          select: { id: true },
        });
        break;
      case 'category':
        entities = await findManyProductCategoriesOrm({
          where: { id: { in: ids } },
          select: { id: true },
        });
        break;
    }

    const existingIds = entities.map((e: any) => e.id);
    const missingIds = ids.filter((id) => !existingIds.includes(id));

    return {
      success: true,
      allExist: missingIds.length === 0,
      existingIds,
      missingIds,
    };
  } catch (error) {
    logger.error(`Error validating entities existence for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate entities',
    };
  }
}

/**
 * Validate status transition is allowed
 */
export async function validateStatusTransitionAction(
  currentStatus: string,
  newStatus: string,
  allowedTransitions: Record<string, string[]>,
): Promise<{ success: boolean; allowed?: boolean; error?: string }> {
  try {
    const allowed = allowedTransitions[currentStatus]?.includes(newStatus) || false;

    return {
      success: true,
      allowed,
    };
  } catch (error) {
    logger.error('Error validating status transition:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate status transition',
    };
  }
}

/**
 * Validate required fields are present
 */
export async function validateRequiredFieldsAction(
  data: Record<string, any>,
  requiredFields: string[],
): Promise<{ success: boolean; valid?: boolean; missingFields?: string[]; error?: string }> {
  try {
    const missingFields = requiredFields.filter((field) => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    return {
      success: true,
      valid: missingFields.length === 0,
      missingFields,
    };
  } catch (error) {
    logger.error('Error validating required fields:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate required fields',
    };
  }
}
