'use server';

import {
  updateProductOrm,
  updateManyProductsOrm,
  updateBrandOrm,
  updateManyBrandsOrm,
  updateCollectionOrm,
  updateManyCollectionsOrm,
  updateTaxonomyOrm,
  updateManyTaxonomiesOrm,
  updateArticleOrm,
  updateManyArticlesOrm,
  updateMediaOrm,
  updateManyMediaOrm,
  updateCastOrm,
  updateManyCastsOrm,
  updateFandomOrm,
  updateManyFandomsOrm,
  updateLocationOrm,
  updateManyLocationsOrm,
  updateStoryOrm,
  updateManyStoriesOrm,
} from '../orm';
import {
  updateProductCategoryOrm,
  updateManyProductCategoriesOrm,
} from '../orm/productCategoryOrm';
import {
  updateRegistryOrm,
  updateManyRegistriesOrm,
  updateRegistryItemOrm,
  updateManyRegistryItemsOrm,
} from '../orm/registryOrm';
import { updateReviewOrm, updateManyReviewsOrm } from '../orm/guestActionsOrm';

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
  } catch (error) {
    console.error(`Error soft deleting ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to delete ${model}`,
    };
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
  } catch (error) {
    console.error(`Error restoring ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to restore ${model}`,
    };
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
  } catch (error) {
    console.error(`Error bulk soft deleting ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to bulk delete ${model}`,
    };
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
  } catch (error) {
    console.error(`Error bulk restoring ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to bulk restore ${model}`,
    };
  }
}
