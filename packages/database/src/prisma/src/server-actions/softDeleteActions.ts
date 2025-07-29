'use server';

import { logError } from '@repo/observability/server/next';
import {
  updateArticleOrm,
  updateBrandOrm,
  updateCastOrm,
  updateCollectionOrm,
  updateFandomOrm,
  updateLocationOrm,
  updateManyArticlesOrm,
  updateManyBrandsOrm,
  updateManyCastsOrm,
  updateManyCollectionsOrm,
  updateManyFandomsOrm,
  updateManyLocationsOrm,
  updateManyMediaOrm,
  updateManyProductsOrm,
  updateManyStoriesOrm,
  updateManyTaxonomiesOrm,
  updateMediaOrm,
  updateProductOrm,
  updateStoryOrm,
  updateTaxonomyOrm,
} from '../orm';
import {
  updateManyProductCategoriesOrm,
  updateProductCategoryOrm,
} from '../orm/ecommerce/productCategoryOrm';
import { updateManyReviewsOrm, updateReviewOrm } from '../orm/guestActions/guestActionsOrm';
import {
  updateManyRegistriesOrm,
  updateManyRegistryItemsOrm,
  updateRegistryItemOrm,
  updateRegistryOrm,
} from '../orm/registry/registryOrm';

type SoftDeletableModel =
  | 'product'
  | 'brand'
  | 'collection'
  | 'taxonomy'
  | 'article'
  | 'media'
  | 'category'
  | 'cast'
  | 'fandom'
  | 'location'
  | 'story'
  | 'registry'
  | 'registryItem'
  | 'review';

/**
 * Generic soft delete function for any model with deletedAt/deletedById fields
 */
export async function softDeleteAction(
  model: SoftDeletableModel,
  id: string,
  deletedById: string = 'system',
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const updateData = {
      deletedAt: new Date(),
      deletedById,
    };

    let result: any = null;

    switch (model) {
      case 'product':
        result = await updateProductOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'brand':
        result = await updateBrandOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'collection':
        result = await updateCollectionOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'taxonomy':
        result = await updateTaxonomyOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'article':
        result = await updateArticleOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'media':
        result = await updateMediaOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'category':
        result = await updateProductCategoryOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'cast':
        result = await updateCastOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'fandom':
        result = await updateFandomOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'location':
        result = await updateLocationOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'story':
        result = await updateStoryOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'registry':
        result = await updateRegistryOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'registryItem':
        result = await updateRegistryItemOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'review':
        result = await updateReviewOrm({
          where: { id },
          data: updateData,
        });
        break;
    }

    return { success: true, data: result };
  } catch (error: any) {
    logError('Error performing soft delete', {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'soft_delete',
      metadata: { model },
    });
    return { success: false, error: error.message || 'Failed to soft delete' };
  }
}

/**
 * Generic restore function for any soft-deleted model
 */
export async function restoreAction(
  model: SoftDeletableModel,
  id: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const updateData = {
      deletedAt: null,
      deletedById: null,
    };

    let result: any = null;

    switch (model) {
      case 'product':
        result = await updateProductOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'brand':
        result = await updateBrandOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'collection':
        result = await updateCollectionOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'taxonomy':
        result = await updateTaxonomyOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'article':
        result = await updateArticleOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'media':
        result = await updateMediaOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'category':
        result = await updateProductCategoryOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'cast':
        result = await updateCastOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'fandom':
        result = await updateFandomOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'location':
        result = await updateLocationOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'story':
        result = await updateStoryOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'registry':
        result = await updateRegistryOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'registryItem':
        result = await updateRegistryItemOrm({
          where: { id },
          data: updateData,
        });
        break;
      case 'review':
        result = await updateReviewOrm({
          where: { id },
          data: updateData,
        });
        break;
    }

    return { success: true, data: result };
  } catch (error: any) {
    logError('Error restoring entity', {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'restore',
      metadata: { model },
    });
    return { success: false, error: error.message || 'Failed to restore' };
  }
}

/**
 * Bulk soft delete function
 */
export async function bulkSoftDeleteAction(
  model: SoftDeletableModel,
  ids: string[],
  deletedById: string = 'system',
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const updateData = {
      deletedAt: new Date(),
      deletedById,
    };

    let result: any = null;

    switch (model) {
      case 'product':
        result = await updateManyProductsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'brand':
        result = await updateManyBrandsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'collection':
        result = await updateManyCollectionsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'taxonomy':
        result = await updateManyTaxonomiesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'article':
        result = await updateManyArticlesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'media':
        result = await updateManyMediaOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'category':
        result = await updateManyProductCategoriesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'cast':
        result = await updateManyCastsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'fandom':
        result = await updateManyFandomsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'location':
        result = await updateManyLocationsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'story':
        result = await updateManyStoriesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'registry':
        result = await updateManyRegistriesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'registryItem':
        result = await updateManyRegistryItemsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'review':
        result = await updateManyReviewsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
    }

    return { success: true, count: result.count };
  } catch (error: any) {
    logError('Error performing bulk soft delete', {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'bulk_soft_delete',
      metadata: { model },
    });
    return { success: false, error: error.message || 'Failed to bulk soft delete' };
  }
}

/**
 * Bulk restore function
 */
export async function bulkRestoreAction(
  model: SoftDeletableModel,
  ids: string[],
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const updateData = {
      deletedAt: null,
      deletedById: null,
    };

    let result: any = null;

    switch (model) {
      case 'product':
        result = await updateManyProductsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'brand':
        result = await updateManyBrandsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'collection':
        result = await updateManyCollectionsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'taxonomy':
        result = await updateManyTaxonomiesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'article':
        result = await updateManyArticlesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'media':
        result = await updateManyMediaOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'category':
        result = await updateManyProductCategoriesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'cast':
        result = await updateManyCastsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'fandom':
        result = await updateManyFandomsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'location':
        result = await updateManyLocationsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'story':
        result = await updateManyStoriesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'registry':
        result = await updateManyRegistriesOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'registryItem':
        result = await updateManyRegistryItemsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
      case 'review':
        result = await updateManyReviewsOrm({
          where: { id: { in: ids } },
          data: updateData,
        });
        break;
    }

    return { success: true, count: result.count };
  } catch (error: any) {
    logError('Error performing bulk restore', {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'bulk_restore',
      metadata: { model },
    });
    return { success: false, error: error.message || 'Failed to bulk restore' };
  }
}
