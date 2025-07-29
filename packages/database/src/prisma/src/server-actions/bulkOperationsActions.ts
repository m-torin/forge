'use server';

import { logError } from '@repo/observability/server/next';
import { ContentStatus, Prisma, ProductStatus } from '../../../../prisma-generated/client';
import {
  deleteManyArticlesOrm,
  deleteManyBrandsOrm,
  deleteManyCastsOrm,
  deleteManyCollectionsOrm,
  deleteManyFandomsOrm,
  deleteManyLocationsOrm,
  deleteManyMediaOrm,
  deleteManyProductsOrm,
  deleteManyStoriesOrm,
  deleteManyTaxonomiesOrm,
  updateArticleOrm,
  updateBrandOrm,
  updateCollectionOrm,
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
  updateProductOrm,
  updateTaxonomyOrm,
  upsertArticleOrm,
  upsertBrandOrm,
  upsertCollectionOrm,
  upsertProductOrm,
  upsertTaxonomyOrm,
} from '../orm';
import {
  deleteManyProductCategoriesOrm,
  updateManyProductCategoriesOrm,
  upsertProductCategoryOrm,
} from '../orm/ecommerce/productCategoryOrm';
import {
  deleteManyReviewsOrm,
  updateManyReviewsOrm,
  updateReviewOrm,
  upsertReviewOrm,
} from '../orm/guestActions/guestActionsOrm';
import {
  deleteManyRegistriesOrm,
  deleteManyRegistryItemsOrm,
  updateManyRegistriesOrm,
  updateManyRegistryItemsOrm,
  updateRegistryItemOrm,
  updateRegistryOrm,
  upsertRegistryItemOrm,
  upsertRegistryOrm,
} from '../orm/registry/registryOrm';

type BulkOperationModel =
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
 * Generic bulk update for status fields
 */
export async function bulkUpdateStatusAction(
  model: BulkOperationModel,
  ids: string[],
  status: ContentStatus | ProductStatus,
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const where = { id: { in: ids } };
    let result: Prisma.BatchPayload;

    switch (model) {
      case 'product':
        result = await updateManyProductsOrm({ where, data: { status: status as ProductStatus } });
        break;
      case 'brand':
        result = await updateManyBrandsOrm({ where, data: { status: status as ContentStatus } });
        break;
      case 'collection':
        result = await updateManyCollectionsOrm({
          where,
          data: { status: status as ContentStatus },
        });
        break;
      case 'taxonomy':
        result = await updateManyTaxonomiesOrm({
          where,
          data: { status: status as ContentStatus },
        });
        break;
      case 'article':
        result = await updateManyArticlesOrm({ where, data: { status: status as ContentStatus } });
        break;
      case 'category':
        result = await updateManyProductCategoriesOrm({
          where,
          data: { status: status as ContentStatus },
        });
        break;
      case 'media':
      case 'cast':
      case 'fandom':
      case 'location':
      case 'story':
      case 'registry':
      case 'registryItem':
        throw new Error(`Model ${model} does not support status updates`);
        break;
      case 'review':
        result = await updateManyReviewsOrm({ where, data: { status: status as ContentStatus } });
        break;
    }

    return { success: true, count: result.count };
  } catch (error) {
    logError(`Error bulk updating status for ${model}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'bulk_update_status',
      metadata: { model },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to update ${model} status`,
    };
  }
}

/**
 * Generic bulk update for any fields
 */
export async function bulkUpdateFieldsAction(
  model: BulkOperationModel,
  where: any,
  data: any,
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    let result: any = null;

    switch (model) {
      case 'product':
        result = await updateManyProductsOrm({ where, data });
        break;
      case 'brand':
        result = await updateManyBrandsOrm({ where, data });
        break;
      case 'collection':
        result = await updateManyCollectionsOrm({ where, data });
        break;
      case 'taxonomy':
        result = await updateManyTaxonomiesOrm({ where, data });
        break;
      case 'article':
        result = await updateManyArticlesOrm({ where, data });
        break;
      case 'media':
        result = await updateManyMediaOrm({ where, data });
        break;
      case 'category':
        result = await updateManyProductCategoriesOrm({ where, data });
        break;
      case 'cast':
        result = await updateManyCastsOrm({ where, data });
        break;
      case 'fandom':
        result = await updateManyFandomsOrm({ where, data });
        break;
      case 'location':
        result = await updateManyLocationsOrm({ where, data });
        break;
      case 'story':
        result = await updateManyStoriesOrm({ where, data });
        break;
      case 'registry':
        result = await updateManyRegistriesOrm({ where, data });
        break;
      case 'registryItem':
        result = await updateManyRegistryItemsOrm({ where, data });
        break;
      case 'review':
        result = await updateManyReviewsOrm({ where, data });
        break;
    }

    return { success: true, count: result.count };
  } catch (error) {
    logError(`Error bulk updating ${model}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'bulk_update',
      metadata: { model },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to bulk update ${model}`,
    };
  }
}

/**
 * Bulk delete operation (hard delete)
 */
export async function bulkDeleteAction(
  model: BulkOperationModel,
  ids: string[],
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const where = { id: { in: ids } };
    let result: any = null;

    switch (model) {
      case 'product':
        result = await deleteManyProductsOrm({ where });
        break;
      case 'brand':
        result = await deleteManyBrandsOrm({ where });
        break;
      case 'collection':
        result = await deleteManyCollectionsOrm({ where });
        break;
      case 'taxonomy':
        result = await deleteManyTaxonomiesOrm({ where });
        break;
      case 'article':
        result = await deleteManyArticlesOrm({ where });
        break;
      case 'media':
        result = await deleteManyMediaOrm({ where });
        break;
      case 'category':
        result = await deleteManyProductCategoriesOrm({ where });
        break;
      case 'cast':
        result = await deleteManyCastsOrm({ where });
        break;
      case 'fandom':
        result = await deleteManyFandomsOrm({ where });
        break;
      case 'location':
        result = await deleteManyLocationsOrm({ where });
        break;
      case 'story':
        result = await deleteManyStoriesOrm({ where });
        break;
      case 'registry':
        result = await deleteManyRegistriesOrm({ where });
        break;
      case 'registryItem':
        result = await deleteManyRegistryItemsOrm({ where });
        break;
      case 'review':
        result = await deleteManyReviewsOrm({ where });
        break;
    }

    return { success: true, count: result.count };
  } catch (error) {
    logError(`Error bulk deleting ${model}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'bulk_delete',
      metadata: { model },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to bulk delete ${model}`,
    };
  }
}

/**
 * Bulk assign relationships (e.g., products to categories)
 */
export async function bulkAssignRelationshipAction(
  parentModel: BulkOperationModel,
  parentIds: string[],
  childIds: string[],
  relationField: string,
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    let updateCount = 0;

    for (const parentId of parentIds) {
      const relationshipData = {
        [relationField]: {
          connect: childIds.map(id => ({ id })),
        },
      };

      switch (parentModel) {
        case 'product':
          await updateProductOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'brand':
          await updateBrandOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'collection':
          await updateCollectionOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'taxonomy':
          await updateTaxonomyOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'article':
          await updateArticleOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'registry':
          await updateRegistryOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'registryItem':
          await updateRegistryItemOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'review':
          await updateReviewOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
      }
      updateCount++;
    }

    return { success: true, count: updateCount };
  } catch (error) {
    logError(`Error bulk assigning relationships to ${parentModel}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'bulk_assign_relationships',
      metadata: { parentModel },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to bulk assign relationships',
    };
  }
}

/**
 * Bulk remove relationships
 */
export async function bulkRemoveRelationshipAction(
  parentModel: BulkOperationModel,
  parentIds: string[],
  childIds: string[],
  relationField: string,
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    let updateCount = 0;

    for (const parentId of parentIds) {
      const relationshipData = {
        [relationField]: {
          disconnect: childIds.map(id => ({ id })),
        },
      };

      switch (parentModel) {
        case 'product':
          await updateProductOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'brand':
          await updateBrandOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'collection':
          await updateCollectionOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'taxonomy':
          await updateTaxonomyOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'article':
          await updateArticleOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'registry':
          await updateRegistryOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'registryItem':
          await updateRegistryItemOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
        case 'review':
          await updateReviewOrm({
            where: { id: parentId },
            data: relationshipData,
          });
          break;
      }
      updateCount++;
    }

    return { success: true, count: updateCount };
  } catch (error) {
    logError(`Error bulk removing relationships from ${parentModel}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'bulk_remove_relationships',
      metadata: { parentModel },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to bulk remove relationships',
    };
  }
}

/**
 * Bulk upsert operation
 */
export async function bulkUpsertAction<T extends Record<string, any>>(
  model: BulkOperationModel,
  data: T[],
  uniqueFields: string[],
): Promise<{ success: boolean; upserted?: number; error?: string }> {
  try {
    let upsertedCount = 0;

    for (const item of data) {
      const where: any = {};
      uniqueFields.forEach(field => {
        if (item[field]) {
          where[field] = item[field];
        }
      });

      const upsertArgs = {
        where: where.id ? { id: where.id } : where,
        update: item,
        create: item,
      } as any;

      switch (model) {
        case 'product':
          await upsertProductOrm(upsertArgs);
          break;
        case 'brand':
          await upsertBrandOrm(upsertArgs);
          break;
        case 'collection':
          await upsertCollectionOrm(upsertArgs);
          break;
        case 'taxonomy':
          await upsertTaxonomyOrm(upsertArgs);
          break;
        case 'article':
          await upsertArticleOrm(upsertArgs);
          break;
        case 'category':
          await upsertProductCategoryOrm(upsertArgs);
          break;
        case 'registry':
          await upsertRegistryOrm(upsertArgs);
          break;
        case 'registryItem':
          await upsertRegistryItemOrm(upsertArgs);
          break;
        case 'review':
          await upsertReviewOrm(upsertArgs);
          break;
      }
      upsertedCount++;
    }

    return { success: true, upserted: upsertedCount };
  } catch (error) {
    logError(`Error bulk upserting ${model}`, {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'bulk_upsert',
      metadata: { model },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to bulk upsert ${model}`,
    };
  }
}
