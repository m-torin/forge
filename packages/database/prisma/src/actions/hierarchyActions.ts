'use server';

import {
  findUniqueBrandOrm,
  findUniqueCollectionOrm,
  findUniqueTaxonomyOrm,
  findManyBrandsOrm,
  findManyCollectionsOrm,
  findManyTaxonomiesOrm,
} from '../orm';
import {
  findUniqueProductCategoryOrm,
  findManyProductCategoriesOrm,
} from '../orm/productCategoryOrm';

type HierarchicalModel = 'category' | 'brand' | 'taxonomy' | 'collection';

/**
 * Check if setting a parent would create a circular reference
 */
export async function checkCircularReferenceAction(
  model: HierarchicalModel,
  childId: string,
  potentialParentId: string,
): Promise<{ success: boolean; isCircular?: boolean; error?: string }> {
  try {
    if (childId === potentialParentId) {
      return { success: true, isCircular: true };
    }

    // Recursive function to check ancestry
    const checkAncestry = async (currentId: string): Promise<boolean> => {
      let entity: any = null;

      switch (model) {
        case 'brand':
          entity = await findUniqueBrandOrm({
            where: { id: currentId },
            select: { parentId: true },
          });
          break;
        case 'collection':
          entity = await findUniqueCollectionOrm({
            where: { id: currentId },
            select: { parentId: true },
          });
          break;
        case 'taxonomy':
          entity = await findUniqueTaxonomyOrm({
            where: { id: currentId },
            select: { id: true } as any,
          });
          break;
        case 'category':
          entity = await findUniqueProductCategoryOrm({
            where: { id: currentId },
            select: { parentId: true },
          });
          break;
      }

      if (!entity || !entity.parentId) {
        return false;
      }

      if (entity.parentId === childId) {
        return true;
      }

      return checkAncestry(entity.parentId);
    };

    const isCircular = await checkAncestry(potentialParentId);
    return { success: true, isCircular };
  } catch (error) {
    console.error(`Error checking circular reference for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check circular reference',
    };
  }
}

/**
 * Get all descendants of an entity
 */
export async function getDescendantsAction(
  model: HierarchicalModel,
  parentId: string,
  includeDeleted: boolean = false,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const where: any = { parentId };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    let children: any[] = [];

    switch (model) {
      case 'brand':
        children = await findManyBrandsOrm({ where });
        break;
      case 'collection':
        children = await findManyCollectionsOrm({ where });
        break;
      case 'taxonomy':
        children = await findManyTaxonomiesOrm({ where });
        break;
      case 'category':
        children = await findManyProductCategoriesOrm({ where });
        break;
    }

    // Recursively get all descendants
    const descendants = [...children];
    for (const child of children) {
      const childDescendants = await getDescendantsAction(model, child.id, includeDeleted);
      if (childDescendants.success && childDescendants.data) {
        descendants.push(...childDescendants.data);
      }
    }

    return { success: true, data: descendants };
  } catch (error) {
    console.error(`Error getting descendants for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get descendants',
    };
  }
}

/**
 * Build a hierarchical tree structure from flat data
 */
export async function buildHierarchyTreeAction(
  model: HierarchicalModel,
  options: {
    includeDeleted?: boolean;
    orderBy?: string;
    where?: any;
  } = {},
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const where: any = { ...options.where };
    if (!options.includeDeleted) {
      where.deletedAt = null;
    }

    const orderBy = options.orderBy ? { [options.orderBy]: 'asc' } : { displayOrder: 'asc' };
    const include = {
      _count: {
        select: {
          children: true,
          products: model === 'brand' ? true : undefined,
        },
      },
    };

    let items: any[] = [];

    switch (model) {
      case 'brand':
        items = await findManyBrandsOrm({
          where,
          orderBy: orderBy as any,
          include,
        });
        break;
      case 'collection':
        items = await findManyCollectionsOrm({
          where,
          orderBy: orderBy as any,
          include,
        });
        break;
      case 'taxonomy':
        items = await findManyTaxonomiesOrm({
          where,
          orderBy: orderBy as any,
          include,
        });
        break;
      case 'category':
        items = await findManyProductCategoriesOrm({
          where,
          orderBy: orderBy as any,
          include,
        });
        break;
    }

    // Build tree structure
    const itemMap = new Map<string, any>();
    const tree: any[] = [];

    // First pass: create map
    items.forEach((item: any) => {
      itemMap.set(item.id, {
        ...item,
        children: [],
      });
    });

    // Second pass: build tree
    items.forEach((item: any) => {
      const itemNode = itemMap.get(item.id);
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(itemNode);
        } else {
          // Parent not found, add to root
          tree.push(itemNode);
        }
      } else {
        tree.push(itemNode);
      }
    });

    return { success: true, data: tree };
  } catch (error) {
    console.error(`Error building hierarchy tree for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to build hierarchy tree',
    };
  }
}

/**
 * Get valid parent options for an entity (excluding itself and its descendants)
 */
export async function getValidParentOptionsAction(
  model: HierarchicalModel,
  excludeId?: string,
  includeDeleted: boolean = false,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const where: any = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const select = {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    };

    const orderBy = { name: 'asc' };

    let allItems: any[] = [];

    switch (model) {
      case 'brand':
        allItems = await findManyBrandsOrm({
          where,
          select,
          orderBy: orderBy as any,
        });
        break;
      case 'collection':
        allItems = await findManyCollectionsOrm({
          where,
          select,
          orderBy: orderBy as any,
        });
        break;
      case 'taxonomy':
        allItems = await findManyTaxonomiesOrm({
          where,
          select,
          orderBy: orderBy as any,
        });
        break;
      case 'category':
        allItems = await findManyProductCategoriesOrm({
          where,
          select,
          orderBy: orderBy as any,
        });
        break;
    }

    if (!excludeId) {
      return { success: true, data: allItems };
    }

    // Get all descendants to exclude
    const descendantsResult = await getDescendantsAction(model, excludeId, includeDeleted);
    const descendantIds = descendantsResult.data?.map((d) => d.id) || [];
    descendantIds.push(excludeId); // Also exclude self

    // Filter out excluded items
    const validParents = allItems.filter((item: any) => !descendantIds.includes(item.id));

    return { success: true, data: validParents };
  } catch (error) {
    console.error(`Error getting valid parent options for ${model}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get parent options',
    };
  }
}
