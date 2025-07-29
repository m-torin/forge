'use server';

import type { Prisma, ProductStatus, ProductType } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS - PRODUCT
//==============================================================================

// CREATE
export async function createProductOrm(args: Prisma.ProductCreateArgs) {
  try {
    return await prisma.product.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstProductOrm(args?: Prisma.ProductFindFirstArgs) {
  return await prisma.product.findFirst(args);
}

export async function findUniqueProductOrm(args: Prisma.ProductFindUniqueArgs) {
  return await prisma.product.findUnique(args);
}

export async function findUniqueProductOrmOrThrow(args: Prisma.ProductFindUniqueOrThrowArgs) {
  try {
    return await prisma.product.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Product not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyProductsOrm(args?: Prisma.ProductFindManyArgs) {
  return await prisma.product.findMany(args);
}

// UPDATE
export async function updateProductOrm(args: Prisma.ProductUpdateArgs) {
  try {
    return await prisma.product.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Product not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyProductsOrm(args: Prisma.ProductUpdateManyArgs) {
  return await prisma.product.updateMany(args);
}

// UPSERT
export async function upsertProductOrm(args: Prisma.ProductUpsertArgs) {
  try {
    return await prisma.product.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteProductOrm(args: Prisma.ProductDeleteArgs) {
  try {
    return await prisma.product.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Product not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyProductsOrm(args?: Prisma.ProductDeleteManyArgs) {
  return await prisma.product.deleteMany(args);
}

// AGGREGATE
export async function aggregateProductsOrm(args?: Prisma.ProductAggregateArgs) {
  return await prisma.product.aggregate(args ?? {});
}

export async function countProductsOrm(args?: Prisma.ProductCountArgs) {
  return await prisma.product.count(args);
}

export async function groupByProductsOrm(args: Prisma.ProductGroupByArgs) {
  return await prisma.product.groupBy(args);
}

//==============================================================================
// BASIC CRUD OPERATIONS - PDP JOIN
//==============================================================================

// CREATE
export async function createPdpJoinOrm(args: Prisma.PdpJoinCreateArgs) {
  try {
    return await prisma.pdpJoin.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstPdpJoinOrm(args?: Prisma.PdpJoinFindFirstArgs) {
  return await prisma.pdpJoin.findFirst(args);
}

export async function findUniquePdpJoinOrm(args: Prisma.PdpJoinFindUniqueArgs) {
  return await prisma.pdpJoin.findUnique(args);
}

export async function findUniquePdpJoinOrmOrThrow(args: Prisma.PdpJoinFindUniqueOrThrowArgs) {
  try {
    return await prisma.pdpJoin.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`PdpJoin not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyPdpJoinsOrm(args?: Prisma.PdpJoinFindManyArgs) {
  return await prisma.pdpJoin.findMany(args);
}

// UPDATE
export async function updatePdpJoinOrm(args: Prisma.PdpJoinUpdateArgs) {
  try {
    return await prisma.pdpJoin.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`PdpJoin not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyPdpJoinsOrm(args: Prisma.PdpJoinUpdateManyArgs) {
  return await prisma.pdpJoin.updateMany(args);
}

// UPSERT
export async function upsertPdpJoinOrm(args: Prisma.PdpJoinUpsertArgs) {
  try {
    return await prisma.pdpJoin.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deletePdpJoinOrm(args: Prisma.PdpJoinDeleteArgs) {
  try {
    return await prisma.pdpJoin.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`PdpJoin not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyPdpJoinsOrm(args?: Prisma.PdpJoinDeleteManyArgs) {
  return await prisma.pdpJoin.deleteMany(args);
}

// AGGREGATE
export async function aggregatePdpJoinsOrm(args?: Prisma.PdpJoinAggregateArgs) {
  return await prisma.pdpJoin.aggregate(args ?? {});
}

export async function countPdpJoinsOrm(args?: Prisma.PdpJoinCountArgs) {
  return await prisma.pdpJoin.count(args);
}

export async function groupByPdpJoinsOrm(args: Prisma.PdpJoinGroupByArgs) {
  return await prisma.pdpJoin.groupBy(args);
}

//==============================================================================
// BASIC CRUD OPERATIONS - PDP URL
//==============================================================================

// CREATE
export async function createPdpUrlOrm(args: Prisma.PdpUrlCreateArgs) {
  try {
    return await prisma.pdpUrl.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstPdpUrlOrm(args?: Prisma.PdpUrlFindFirstArgs) {
  return await prisma.pdpUrl.findFirst(args);
}

export async function findUniquePdpUrlOrm(args: Prisma.PdpUrlFindUniqueArgs) {
  return await prisma.pdpUrl.findUnique(args);
}

export async function findUniquePdpUrlOrmOrThrow(args: Prisma.PdpUrlFindUniqueOrThrowArgs) {
  try {
    return await prisma.pdpUrl.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`PdpUrl not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyPdpUrlsOrm(args?: Prisma.PdpUrlFindManyArgs) {
  return await prisma.pdpUrl.findMany(args);
}

// UPDATE
export async function updatePdpUrlOrm(args: Prisma.PdpUrlUpdateArgs) {
  try {
    return await prisma.pdpUrl.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`PdpUrl not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyPdpUrlsOrm(args: Prisma.PdpUrlUpdateManyArgs) {
  return await prisma.pdpUrl.updateMany(args);
}

// UPSERT
export async function upsertPdpUrlOrm(args: Prisma.PdpUrlUpsertArgs) {
  try {
    return await prisma.pdpUrl.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deletePdpUrlOrm(args: Prisma.PdpUrlDeleteArgs) {
  try {
    return await prisma.pdpUrl.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`PdpUrl not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyPdpUrlsOrm(args?: Prisma.PdpUrlDeleteManyArgs) {
  return await prisma.pdpUrl.deleteMany(args);
}

// AGGREGATE
export async function aggregatePdpUrlsOrm(args?: Prisma.PdpUrlAggregateArgs) {
  return await prisma.pdpUrl.aggregate(args ?? {});
}

export async function countPdpUrlsOrm(args?: Prisma.PdpUrlCountArgs) {
  return await prisma.pdpUrl.count(args);
}

export async function groupByPdpUrlsOrm(args: Prisma.PdpUrlGroupByArgs) {
  return await prisma.pdpUrl.groupBy(args);
}

//==============================================================================
// BASIC CRUD OPERATIONS - PRODUCT IDENTIFIERS
//==============================================================================

// CREATE
export async function createProductIdentifiersOrm(args: Prisma.ProductIdentifiersCreateArgs) {
  try {
    return await prisma.productIdentifiers.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstProductIdentifiersOrm(
  args?: Prisma.ProductIdentifiersFindFirstArgs,
) {
  return await prisma.productIdentifiers.findFirst(args);
}

export async function findUniqueProductIdentifiersOrm(
  args: Prisma.ProductIdentifiersFindUniqueArgs,
) {
  return await prisma.productIdentifiers.findUnique(args);
}

export async function findUniqueProductIdentifiersOrmOrThrow(
  args: Prisma.ProductIdentifiersFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.productIdentifiers.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductIdentifiers not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyProductIdentifiersOrm(args?: Prisma.ProductIdentifiersFindManyArgs) {
  return await prisma.productIdentifiers.findMany(args);
}

// UPDATE
export async function updateProductIdentifiersOrm(args: Prisma.ProductIdentifiersUpdateArgs) {
  try {
    return await prisma.productIdentifiers.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductIdentifiers not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyProductIdentifiersOrm(
  args: Prisma.ProductIdentifiersUpdateManyArgs,
) {
  return await prisma.productIdentifiers.updateMany(args);
}

// UPSERT
export async function upsertProductIdentifiersOrm(args: Prisma.ProductIdentifiersUpsertArgs) {
  try {
    return await prisma.productIdentifiers.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteProductIdentifiersOrm(args: Prisma.ProductIdentifiersDeleteArgs) {
  try {
    return await prisma.productIdentifiers.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`ProductIdentifiers not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyProductIdentifiersOrm(
  args?: Prisma.ProductIdentifiersDeleteManyArgs,
) {
  return await prisma.productIdentifiers.deleteMany(args);
}

// AGGREGATE
export async function aggregateProductIdentifiersOrm(
  args?: Prisma.ProductIdentifiersAggregateArgs,
) {
  return await prisma.productIdentifiers.aggregate(args ?? {});
}

export async function countProductIdentifiersOrm(args?: Prisma.ProductIdentifiersCountArgs) {
  return await prisma.productIdentifiers.count(args);
}

export async function groupByProductIdentifiersOrm(args: Prisma.ProductIdentifiersGroupByArgs) {
  return await prisma.productIdentifiers.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES - PRODUCT
//==============================================================================

/**
 * Find products by status using ProductStatus enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findProductsByStatusOrm(
  status: ProductStatus,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products by type using ProductType enum
 */
export async function findProductsByTypeOrm(
  type: ProductType,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: type,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products by both status and type
 */
export async function findProductsByStatusAndTypeOrm(
  status: ProductStatus,
  type: ProductType,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
      type: type,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products by category (leverages index)
 */
export async function findProductsByCategoryOrm(
  category: string,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      category: category,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products by category and status (leverages composite index)
 */
export async function findProductsByCategoryAndStatusOrm(
  category: string,
  status: ProductStatus,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      category: category,
      status: status,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products by brand (leverages index)
 */
export async function findProductsByBrandOrm(
  brand: string,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      brand: brand,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have brand set (not null)
 */
export async function findProductsWithBrandOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      brand: {
        not: null,
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that don't have brand (null)
 */
export async function findProductsWithoutBrandOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      brand: null,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have price set (not null)
 */
export async function findProductsWithPriceOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      price: {
        not: null,
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products by price range
 */
export async function findProductsByPriceRangeOrm(
  minPrice: number,
  maxPrice: number,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products with variant pricing (variantPrice not null)
 */
export async function findProductsWithVariantPriceOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      variantPrice: {
        not: null,
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find default products (isDefault = true)
 */
export async function findDefaultProductsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isDefault: true,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find AI-generated products
 */
export async function findAiGeneratedProductsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      aiGenerated: true,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find manually created products (not AI-generated)
 */
export async function findManualProductsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      aiGenerated: false,
    },
  };
  return await prisma.product.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS - PRODUCT
//==============================================================================

/**
 * Find child products of a specific parent
 */
export async function findProductsByParentOrm(
  parentId: string,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: parentId,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find root products (no parent)
 */
export async function findRootProductsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentId: null,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find product with all its children
 */
export async function findProductWithChildrenOrm(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      children: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

/**
 * Update product display order for hierarchy management
 */
export async function updateProductDisplayOrderOrm(id: string, displayOrder: number) {
  try {
    return await prisma.product.update({
      where: { id },
      data: { displayOrder },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Product not found for display order update: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find variant products (type = VARIANT)
 */
export async function findVariantProductsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'VARIANT',
    },
    orderBy: {
      displayOrder: 'asc',
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find parent products that have variants
 */
export async function findParentProductsWithVariantsOrm(
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      children: {
        some: {
          type: 'VARIANT',
        },
      },
    },
  };
  return await prisma.product.findMany(args);
}

//==============================================================================
// 4. RELATIONSHIP QUERIES - PRODUCT
//==============================================================================

/**
 * Find products that have associated collections
 */
export async function findProductsWithCollectionsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      collections: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated taxonomies
 */
export async function findProductsWithTaxonomiesOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      taxonomies: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated categories
 */
export async function findProductsWithCategoriesOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      categories: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated media
 */
export async function findProductsWithMediaOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      media: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated identifiers
 */
export async function findProductsWithIdentifiersOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      identifiers: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have been favorited
 */
export async function findProductsWithFavoritesOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      favorites: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that are in registries
 */
export async function findProductsWithRegistriesOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      registries: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated fandoms
 */
export async function findProductsWithFandomsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      fandoms: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated series
 */
export async function findProductsWithSeriesOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      series: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated stories
 */
export async function findProductsWithStoriesOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stories: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated locations
 */
export async function findProductsWithLocationsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      locations: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have associated casts
 */
export async function findProductsWithCastsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      casts: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that are currently in carts
 */
export async function findProductsInCartsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      cartItems: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have been ordered
 */
export async function findProductsWithOrdersOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderItems: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have inventory tracked
 */
export async function findProductsWithInventoryOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      inventory: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that have reviews
 */
export async function findProductsWithReviewsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      reviews: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products that are sold by retailers (have PdpJoins)
 */
export async function findProductsWithSoldByOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      soldBy: {
        some: {},
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find product with all relations included
 */
export async function findProductWithAllRelationsOrm(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      parent: true,
      children: { orderBy: { displayOrder: 'asc' } },
      soldBy: true,
      collections: true,
      taxonomies: true,
      categories: true,
      media: true,
      favorites: true,
      registries: true,
      fandoms: true,
      series: true,
      stories: true,
      locations: true,
      casts: true,
      cartItems: true,
      cartItemVariants: true,
      orderItems: true,
      orderItemVariants: true,
      inventory: true,
      inventoryVariants: true,
      identifiers: true,
      reviews: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS - PRODUCT
//==============================================================================

/**
 * Find active (non-deleted) products
 */
export async function findActiveProductsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find soft-deleted products
 */
export async function findDeletedProductsOrm(additionalArgs?: Prisma.ProductFindManyArgs) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Soft delete a product (set deletedAt and deletedById)
 */
export async function softDeleteProductOrm(id: string, deletedById: string) {
  try {
    return await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Product not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted product (clear deletedAt and deletedById)
 */
export async function restoreProductOrm(id: string) {
  try {
    return await prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Product not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find products created after a specific date
 */
export async function findProductsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: date,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products updated after a specific date
 */
export async function findProductsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      updatedAt: {
        gte: date,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find recently created or updated products within specified days
 */
export async function findRecentProductsOrm(
  days: number = 7,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          createdAt: {
            gte: cutoffDate,
          },
        },
        {
          updatedAt: {
            gte: cutoffDate,
          },
        },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.product.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find product by slug (leverages unique index)
 */
export async function findProductBySlugOrm(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
  });
}

/**
 * Search products by name (case-insensitive contains)
 */
export async function searchProductsByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Search products by name or copy content (case-insensitive)
 */
export async function searchProductsOrm(
  searchTerm: string,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          copy: {
            string_contains: searchTerm,
          },
        },
        {
          attributes: {
            string_contains: searchTerm,
          },
        },
      ],
    },
    orderBy: {
      name: 'asc',
    },
  };
  return await prisma.product.findMany(args);
}

/**
 * Find products with optimized filtering by status and creation date (leverages composite index)
 */
export async function findProductsByStatusAndDateOrm(
  status: ProductStatus,
  fromDate?: Date,
  additionalArgs?: Prisma.ProductFindManyArgs,
) {
  const args: Prisma.ProductFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
      ...(fromDate && {
        createdAt: {
          gte: fromDate,
        },
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.product.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Product with collections relation
 */
export type ProductWithCollections = Prisma.ProductGetPayload<{
  include: { collections: true };
}>;

/**
 * Product with taxonomies relation
 */
export type ProductWithTaxonomies = Prisma.ProductGetPayload<{
  include: { taxonomies: true };
}>;

/**
 * Product with categories relation
 */
export type ProductWithCategories = Prisma.ProductGetPayload<{
  include: { categories: true };
}>;

/**
 * Product with media relation
 */
export type ProductWithMedia = Prisma.ProductGetPayload<{
  include: { media: true };
}>;

/**
 * Product with identifiers relation
 */
export type ProductWithIdentifiers = Prisma.ProductGetPayload<{
  include: { identifiers: true };
}>;

/**
 * Product with reviews relation
 */
export type ProductWithReviews = Prisma.ProductGetPayload<{
  include: { reviews: true };
}>;

/**
 * Product with fandoms relation
 */
export type ProductWithFandoms = Prisma.ProductGetPayload<{
  include: { fandoms: true };
}>;

/**
 * Product with series relation
 */
export type ProductWithSeries = Prisma.ProductGetPayload<{
  include: { series: true };
}>;

/**
 * Product with stories relation
 */
export type ProductWithStories = Prisma.ProductGetPayload<{
  include: { stories: true };
}>;

/**
 * Product with locations relation
 */
export type ProductWithLocations = Prisma.ProductGetPayload<{
  include: { locations: true };
}>;

/**
 * Product with casts relation
 */
export type ProductWithCasts = Prisma.ProductGetPayload<{
  include: { casts: true };
}>;

/**
 * Product with cart items relation
 */
export type ProductWithCartItems = Prisma.ProductGetPayload<{
  include: { cartItems: true; cartItemVariants: true };
}>;

/**
 * Product with order items relation
 */
export type ProductWithOrderItems = Prisma.ProductGetPayload<{
  include: { orderItems: true; orderItemVariants: true };
}>;

/**
 * Product with inventory relation
 */
export type ProductWithInventory = Prisma.ProductGetPayload<{
  include: { inventory: true; inventoryVariants: true };
}>;

/**
 * Product with favorites relation
 */
export type ProductWithFavorites = Prisma.ProductGetPayload<{
  include: { favorites: true };
}>;

/**
 * Product with registries relation
 */
export type ProductWithRegistries = Prisma.ProductGetPayload<{
  include: { registries: true };
}>;

/**
 * Product with soldBy relation
 */
export type ProductWithSoldBy = Prisma.ProductGetPayload<{
  include: { soldBy: true };
}>;

/**
 * Product with children relation (hierarchical)
 */
export type ProductWithChildren = Prisma.ProductGetPayload<{
  include: { children: true };
}>;

/**
 * Product with parent relation (hierarchical)
 */
export type ProductWithParent = Prisma.ProductGetPayload<{
  include: { parent: true };
}>;

/**
 * Product with basic relations for listings
 */
export type ProductWithBasicRelations = Prisma.ProductGetPayload<{
  include: {
    identifiers: true;
    media: { take: 1; orderBy: { sortOrder: 'asc' } };
  };
}>;

/**
 * Product with all relations for complete data access
 */
export type ProductWithAllRelations = Prisma.ProductGetPayload<{
  include: {
    parent: true;
    children: true;
    soldBy: true;
    collections: true;
    taxonomies: true;
    categories: true;
    media: true;
    favorites: true;
    registries: true;
    fandoms: true;
    series: true;
    stories: true;
    locations: true;
    casts: true;
    cartItems: true;
    cartItemVariants: true;
    orderItems: true;
    orderItemVariants: true;
    inventory: true;
    inventoryVariants: true;
    identifiers: true;
    reviews: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted product type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedProduct = Prisma.ProductGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Product search result type for optimized queries
 */
export type ProductSearchResult = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    category: true;
    status: true;
    brand: true;
    price: true;
    type: true;
    isDefault: true;
    aiGenerated: true;
    _count: {
      select: {
        collections: true;
        taxonomies: true;
        categories: true;
        media: true;
        identifiers: true;
        reviews: true;
        children: true;
      };
    };
  };
}>;

/**
 * Product hierarchy result for parent-child operations
 */
export type ProductHierarchyResult = Prisma.ProductGetPayload<{
  include: {
    parent: { select: { id: true; name: true; slug: true } };
    children: {
      select: { id: true; name: true; slug: true; displayOrder: true; isDefault: true };
    };
  };
}>;

/**
 * Product variant result for variant-specific operations
 */
export type ProductVariantResult = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    type: true;
    variantPrice: true;
    compareAtPrice: true;
    displayOrder: true;
    isDefault: true;
    parentId: true;
    identifiers: true;
  };
}>;

/**
 * PdpJoin with relations
 */
export type PdpJoinWithRelations = Prisma.PdpJoinGetPayload<{
  include: {
    product: true;
    brand: true;
    taxonomies: true;
    locations: true;
    collections: true;
    urls: true;
    media: true;
  };
}>;

/**
 * PdpUrl with relations
 */
export type PdpUrlWithRelations = Prisma.PdpUrlGetPayload<{
  include: {
    pdpJoin: { include: { product: true; brand: true } };
  };
}>;

/**
 * ProductIdentifiers with product relation
 */
export type ProductIdentifiersWithProduct = Prisma.ProductIdentifiersGetPayload<{
  include: { product: true };
}>;
