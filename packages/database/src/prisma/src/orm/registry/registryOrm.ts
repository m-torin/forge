'use server';

import type {
  Prisma,
  PurchaseStatus,
  RegistryType,
  RegistryUserRole,
} from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS - REGISTRY
//==============================================================================

// CREATE
export async function createRegistryOrm(args: Prisma.RegistryCreateArgs) {
  try {
    return await prisma.registry.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstRegistryOrm(args?: Prisma.RegistryFindFirstArgs) {
  return await prisma.registry.findFirst(args);
}

export async function findUniqueRegistryOrm(args: Prisma.RegistryFindUniqueArgs) {
  return await prisma.registry.findUnique(args);
}

export async function findUniqueRegistryOrmOrThrow(args: Prisma.RegistryFindUniqueOrThrowArgs) {
  try {
    return await prisma.registry.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Registry not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyRegistriesOrm(args?: Prisma.RegistryFindManyArgs) {
  return await prisma.registry.findMany(args);
}

// UPDATE
export async function updateRegistryOrm(args: Prisma.RegistryUpdateArgs) {
  try {
    return await prisma.registry.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Registry not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyRegistriesOrm(args: Prisma.RegistryUpdateManyArgs) {
  return await prisma.registry.updateMany(args);
}

// UPSERT
export async function upsertRegistryOrm(args: Prisma.RegistryUpsertArgs) {
  try {
    return await prisma.registry.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteRegistryOrm(args: Prisma.RegistryDeleteArgs) {
  try {
    return await prisma.registry.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Registry not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyRegistriesOrm(args?: Prisma.RegistryDeleteManyArgs) {
  return await prisma.registry.deleteMany(args);
}

// AGGREGATE
export async function aggregateRegistriesOrm(args?: Prisma.RegistryAggregateArgs) {
  return await prisma.registry.aggregate(args ?? {});
}

export async function countRegistriesOrm(args?: Prisma.RegistryCountArgs) {
  return await prisma.registry.count(args);
}

export async function groupByRegistriesOrm(args: Prisma.RegistryGroupByArgs) {
  return await prisma.registry.groupBy(args);
}

//==============================================================================
// BASIC CRUD OPERATIONS - REGISTRY ITEM
//==============================================================================

// CREATE
export async function createRegistryItemOrm(args: Prisma.RegistryItemCreateArgs) {
  try {
    return await prisma.registryItem.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstRegistryItemOrm(args?: Prisma.RegistryItemFindFirstArgs) {
  return await prisma.registryItem.findFirst(args);
}

export async function findUniqueRegistryItemOrm(args: Prisma.RegistryItemFindUniqueArgs) {
  return await prisma.registryItem.findUnique(args);
}

export async function findUniqueRegistryItemOrmOrThrow(
  args: Prisma.RegistryItemFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.registryItem.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryItem not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyRegistryItemsOrm(args?: Prisma.RegistryItemFindManyArgs) {
  return await prisma.registryItem.findMany(args);
}

// UPDATE
export async function updateRegistryItemOrm(args: Prisma.RegistryItemUpdateArgs) {
  try {
    return await prisma.registryItem.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryItem not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyRegistryItemsOrm(args: Prisma.RegistryItemUpdateManyArgs) {
  return await prisma.registryItem.updateMany(args);
}

// UPSERT
export async function upsertRegistryItemOrm(args: Prisma.RegistryItemUpsertArgs) {
  try {
    return await prisma.registryItem.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteRegistryItemOrm(args: Prisma.RegistryItemDeleteArgs) {
  try {
    return await prisma.registryItem.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryItem not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyRegistryItemsOrm(args?: Prisma.RegistryItemDeleteManyArgs) {
  return await prisma.registryItem.deleteMany(args);
}

// AGGREGATE
export async function aggregateRegistryItemsOrm(args?: Prisma.RegistryItemAggregateArgs) {
  return await prisma.registryItem.aggregate(args ?? {});
}

export async function countRegistryItemsOrm(args?: Prisma.RegistryItemCountArgs) {
  return await prisma.registryItem.count(args);
}

export async function groupByRegistryItemsOrm(args: Prisma.RegistryItemGroupByArgs) {
  return await prisma.registryItem.groupBy(args);
}

//==============================================================================
// BASIC CRUD OPERATIONS - REGISTRY PURCHASE JOIN
//==============================================================================

// CREATE
export async function createRegistryPurchaseJoinOrm(args: Prisma.RegistryPurchaseJoinCreateArgs) {
  try {
    return await prisma.registryPurchaseJoin.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstRegistryPurchaseJoinOrm(
  args?: Prisma.RegistryPurchaseJoinFindFirstArgs,
) {
  return await prisma.registryPurchaseJoin.findFirst(args);
}

export async function findUniqueRegistryPurchaseJoinOrm(
  args: Prisma.RegistryPurchaseJoinFindUniqueArgs,
) {
  return await prisma.registryPurchaseJoin.findUnique(args);
}

export async function findUniqueRegistryPurchaseJoinOrmOrThrow(
  args: Prisma.RegistryPurchaseJoinFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.registryPurchaseJoin.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(
        `RegistryPurchaseJoin not found with criteria: ${JSON.stringify(args.where)}`,
      );
    }
    handlePrismaError(error);
  }
}

export async function findManyRegistryPurchaseJoinsOrm(
  args?: Prisma.RegistryPurchaseJoinFindManyArgs,
) {
  return await prisma.registryPurchaseJoin.findMany(args);
}

// UPDATE
export async function updateRegistryPurchaseJoinOrm(args: Prisma.RegistryPurchaseJoinUpdateArgs) {
  try {
    return await prisma.registryPurchaseJoin.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryPurchaseJoin not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyRegistryPurchaseJoinsOrm(
  args: Prisma.RegistryPurchaseJoinUpdateManyArgs,
) {
  return await prisma.registryPurchaseJoin.updateMany(args);
}

// UPSERT
export async function upsertRegistryPurchaseJoinOrm(args: Prisma.RegistryPurchaseJoinUpsertArgs) {
  try {
    return await prisma.registryPurchaseJoin.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteRegistryPurchaseJoinOrm(args: Prisma.RegistryPurchaseJoinDeleteArgs) {
  try {
    return await prisma.registryPurchaseJoin.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryPurchaseJoin not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyRegistryPurchaseJoinsOrm(
  args?: Prisma.RegistryPurchaseJoinDeleteManyArgs,
) {
  return await prisma.registryPurchaseJoin.deleteMany(args);
}

// AGGREGATE
export async function aggregateRegistryPurchaseJoinsOrm(
  args?: Prisma.RegistryPurchaseJoinAggregateArgs,
) {
  return await prisma.registryPurchaseJoin.aggregate(args ?? {});
}

export async function countRegistryPurchaseJoinsOrm(args?: Prisma.RegistryPurchaseJoinCountArgs) {
  return await prisma.registryPurchaseJoin.count(args);
}

export async function groupByRegistryPurchaseJoinsOrm(
  args: Prisma.RegistryPurchaseJoinGroupByArgs,
) {
  return await prisma.registryPurchaseJoin.groupBy(args);
}

//==============================================================================
// BASIC CRUD OPERATIONS - REGISTRY USER JOIN
//==============================================================================

// CREATE
export async function createRegistryUserJoinOrm(args: Prisma.RegistryUserJoinCreateArgs) {
  try {
    return await prisma.registryUserJoin.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstRegistryUserJoinOrm(args?: Prisma.RegistryUserJoinFindFirstArgs) {
  return await prisma.registryUserJoin.findFirst(args);
}

export async function findUniqueRegistryUserJoinOrm(args: Prisma.RegistryUserJoinFindUniqueArgs) {
  return await prisma.registryUserJoin.findUnique(args);
}

export async function findUniqueRegistryUserJoinOrmOrThrow(
  args: Prisma.RegistryUserJoinFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.registryUserJoin.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryUserJoin not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function findManyRegistryUserJoinsOrm(args?: Prisma.RegistryUserJoinFindManyArgs) {
  return await prisma.registryUserJoin.findMany(args);
}

// UPDATE
export async function updateRegistryUserJoinOrm(args: Prisma.RegistryUserJoinUpdateArgs) {
  try {
    return await prisma.registryUserJoin.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryUserJoin not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function updateManyRegistryUserJoinsOrm(args: Prisma.RegistryUserJoinUpdateManyArgs) {
  return await prisma.registryUserJoin.updateMany(args);
}

// UPSERT
export async function upsertRegistryUserJoinOrm(args: Prisma.RegistryUserJoinUpsertArgs) {
  try {
    return await prisma.registryUserJoin.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteRegistryUserJoinOrm(args: Prisma.RegistryUserJoinDeleteArgs) {
  try {
    return await prisma.registryUserJoin.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryUserJoin not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

export async function deleteManyRegistryUserJoinsOrm(args?: Prisma.RegistryUserJoinDeleteManyArgs) {
  return await prisma.registryUserJoin.deleteMany(args);
}

// AGGREGATE
export async function aggregateRegistryUserJoinsOrm(args?: Prisma.RegistryUserJoinAggregateArgs) {
  return await prisma.registryUserJoin.aggregate(args ?? {});
}

export async function countRegistryUserJoinsOrm(args?: Prisma.RegistryUserJoinCountArgs) {
  return await prisma.registryUserJoin.count(args);
}

export async function groupByRegistryUserJoinsOrm(args: Prisma.RegistryUserJoinGroupByArgs) {
  return await prisma.registryUserJoin.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES - REGISTRY
//==============================================================================

/**
 * Find registries by type using RegistryType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findRegistriesByTypeOrm(
  type: RegistryType,
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: type,
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find public registries
 */
export async function findPublicRegistriesOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isPublic: true,
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find private registries
 */
export async function findPrivateRegistriesOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isPublic: false,
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries that have description set (not null)
 */
export async function findRegistriesWithDescriptionOrm(
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      description: {
        not: null,
      },
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries that don't have description (null)
 */
export async function findRegistriesWithoutDescriptionOrm(
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      description: null,
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries that have event date set (not null)
 */
export async function findRegistriesWithEventDateOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      eventDate: {
        not: null,
      },
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries by creator user ID (leverages index)
 */
export async function findRegistriesByCreatorOrm(
  createdByUserId: string,
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdByUserId: createdByUserId,
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries with upcoming events (eventDate in future)
 */
export async function findUpcomingEventRegistriesOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const now = new Date();
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      eventDate: {
        gte: now,
      },
    },
    orderBy: {
      eventDate: 'asc',
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries with past events
 */
export async function findPastEventRegistriesOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const now = new Date();
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      eventDate: {
        lt: now,
      },
    },
    orderBy: {
      eventDate: 'desc',
    },
  };
  return await prisma.registry.findMany(args);
}

//==============================================================================
// FIELD-BASED QUERIES - REGISTRY ITEM
//==============================================================================

/**
 * Find purchased registry items
 */
export async function findPurchasedRegistryItemsOrm(
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      purchased: true,
    },
  };
  return await prisma.registryItem.findMany(args);
}

/**
 * Find unpurchased registry items
 */
export async function findUnpurchasedRegistryItemsOrm(
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      purchased: false,
    },
  };
  return await prisma.registryItem.findMany(args);
}

/**
 * Find registry items by priority level
 */
export async function findRegistryItemsByPriorityOrm(
  priority: number,
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      priority: priority,
    },
  };
  return await prisma.registryItem.findMany(args);
}

/**
 * Find registry items with high priority (priority > 0)
 */
export async function findHighPriorityRegistryItemsOrm(
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      priority: {
        gt: 0,
      },
    },
    orderBy: {
      priority: 'desc',
    },
  };
  return await prisma.registryItem.findMany(args);
}

/**
 * Find registry items that have notes
 */
export async function findRegistryItemsWithNotesOrm(
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notes: {
        not: null,
      },
    },
  };
  return await prisma.registryItem.findMany(args);
}

//==============================================================================
// FIELD-BASED QUERIES - REGISTRY PURCHASE JOIN
//==============================================================================

/**
 * Find purchases by status using PurchaseStatus enum
 */
export async function findPurchasesByStatusOrm(
  status: PurchaseStatus,
  additionalArgs?: Prisma.RegistryPurchaseJoinFindManyArgs,
) {
  const args: Prisma.RegistryPurchaseJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.registryPurchaseJoin.findMany(args);
}

/**
 * Find gift purchases
 */
export async function findGiftPurchasesOrm(
  additionalArgs?: Prisma.RegistryPurchaseJoinFindManyArgs,
) {
  const args: Prisma.RegistryPurchaseJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isGift: true,
    },
  };
  return await prisma.registryPurchaseJoin.findMany(args);
}

/**
 * Find gift-wrapped purchases
 */
export async function findGiftWrappedPurchasesOrm(
  additionalArgs?: Prisma.RegistryPurchaseJoinFindManyArgs,
) {
  const args: Prisma.RegistryPurchaseJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      giftWrapped: true,
    },
  };
  return await prisma.registryPurchaseJoin.findMany(args);
}

/**
 * Find purchases where thank you has been sent
 */
export async function findPurchasesWithThankYouSentOrm(
  additionalArgs?: Prisma.RegistryPurchaseJoinFindManyArgs,
) {
  const args: Prisma.RegistryPurchaseJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      thankYouSent: true,
    },
  };
  return await prisma.registryPurchaseJoin.findMany(args);
}

/**
 * Find purchases pending thank you
 */
export async function findPurchasesPendingThankYouOrm(
  additionalArgs?: Prisma.RegistryPurchaseJoinFindManyArgs,
) {
  const args: Prisma.RegistryPurchaseJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      thankYouSent: false,
    },
  };
  return await prisma.registryPurchaseJoin.findMany(args);
}

//==============================================================================
// FIELD-BASED QUERIES - REGISTRY USER JOIN
//==============================================================================

/**
 * Find user joins by role using RegistryUserRole enum
 */
export async function findRegistryUsersByRoleOrm(
  role: RegistryUserRole,
  additionalArgs?: Prisma.RegistryUserJoinFindManyArgs,
) {
  const args: Prisma.RegistryUserJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      role: role,
    },
  };
  return await prisma.registryUserJoin.findMany(args);
}

/**
 * Find registry owners
 */
export async function findRegistryOwnersOrm(additionalArgs?: Prisma.RegistryUserJoinFindManyArgs) {
  const args: Prisma.RegistryUserJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      role: 'OWNER',
    },
  };
  return await prisma.registryUserJoin.findMany(args);
}

/**
 * Find registry editors
 */
export async function findRegistryEditorsOrm(additionalArgs?: Prisma.RegistryUserJoinFindManyArgs) {
  const args: Prisma.RegistryUserJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      role: 'EDITOR',
    },
  };
  return await prisma.registryUserJoin.findMany(args);
}

/**
 * Find registry viewers
 */
export async function findRegistryViewersOrm(additionalArgs?: Prisma.RegistryUserJoinFindManyArgs) {
  const args: Prisma.RegistryUserJoinFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      role: 'VIEWER',
    },
  };
  return await prisma.registryUserJoin.findMany(args);
}

//==============================================================================
// 3. RELATIONSHIP QUERIES - REGISTRY
//==============================================================================

/**
 * Find registries that have items
 */
export async function findRegistriesWithItemsOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      items: {
        some: {},
      },
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries that have users (shared registries)
 */
export async function findRegistriesWithUsersOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      users: {
        some: {},
      },
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries that have cart items
 */
export async function findRegistriesWithCartItemsOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      cartItems: {
        some: {},
      },
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries that have order items
 */
export async function findRegistriesWithOrderItemsOrm(
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderItems: {
        some: {},
      },
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registry with all relations included
 */
export async function findRegistryWithAllRelationsOrm(id: string) {
  return await prisma.registry.findUnique({
    where: { id },
    include: {
      items: { orderBy: { priority: 'desc' } },
      users: true,
      cartItems: true,
      orderItems: true,
      createdByUser: true,
      deletedBy: true,
    },
  });
}

//==============================================================================
// RELATIONSHIP QUERIES - REGISTRY ITEM
//==============================================================================

/**
 * Find registry items that have purchases
 */
export async function findRegistryItemsWithPurchasesOrm(
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      purchases: {
        some: {},
      },
    },
  };
  return await prisma.registryItem.findMany(args);
}

/**
 * Find registry items that have products
 */
export async function findRegistryItemsWithProductsOrm(
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      product: {
        isNot: null,
      },
    },
  };
  return await prisma.registryItem.findMany(args);
}

/**
 * Find registry items that have collections
 */
export async function findRegistryItemsWithCollectionsOrm(
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      collection: {
        isNot: null,
      },
    },
  };
  return await prisma.registryItem.findMany(args);
}

//==============================================================================
// 4. LIFECYCLE OPERATIONS - REGISTRY
//==============================================================================

/**
 * Find active (non-deleted) registries
 */
export async function findActiveRegistriesOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find soft-deleted registries
 */
export async function findDeletedRegistriesOrm(additionalArgs?: Prisma.RegistryFindManyArgs) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Soft delete a registry (set deletedAt and deletedById)
 */
export async function softDeleteRegistryOrm(id: string, deletedById: string) {
  try {
    return await prisma.registry.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Registry not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted registry (clear deletedAt and deletedById)
 */
export async function restoreRegistryOrm(id: string) {
  try {
    return await prisma.registry.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Registry not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find active (non-deleted) registry items
 */
export async function findActiveRegistryItemsOrm(additionalArgs?: Prisma.RegistryItemFindManyArgs) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.registryItem.findMany(args);
}

/**
 * Find soft-deleted registry items
 */
export async function findDeletedRegistryItemsOrm(
  additionalArgs?: Prisma.RegistryItemFindManyArgs,
) {
  const args: Prisma.RegistryItemFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.registryItem.findMany(args);
}

/**
 * Soft delete a registry item (set deletedAt and deletedById)
 */
export async function softDeleteRegistryItemOrm(id: string, deletedById: string) {
  try {
    return await prisma.registryItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: deletedById,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryItem not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted registry item (clear deletedAt and deletedById)
 */
export async function restoreRegistryItemOrm(id: string) {
  try {
    return await prisma.registryItem.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`RegistryItem not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find registries created after a specific date
 */
export async function findRegistriesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
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
  return await prisma.registry.findMany(args);
}

/**
 * Find registries updated after a specific date
 */
export async function findRegistriesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
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
  return await prisma.registry.findMany(args);
}

/**
 * Find recently created or updated registries within specified days
 */
export async function findRecentRegistriesOrm(
  days: number = 7,
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.RegistryFindManyArgs = {
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
  return await prisma.registry.findMany(args);
}

//==============================================================================
// 5. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Search registries by title (case-insensitive contains)
 */
export async function searchRegistriesByTitleOrm(
  searchTerm: string,
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      title: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Search registries by title or description
 */
export async function searchRegistriesOrm(
  searchTerm: string,
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    },
    orderBy: {
      title: 'asc',
    },
  };
  return await prisma.registry.findMany(args);
}

/**
 * Find registries by user (leverages index on createdByUserId)
 */
export async function findRegistriesByUserOrm(
  userId: string,
  additionalArgs?: Prisma.RegistryFindManyArgs,
) {
  const args: Prisma.RegistryFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdByUserId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.registry.findMany(args);
}

//==============================================================================
// 6. TYPE EXPORTS
//==============================================================================

/**
 * Registry with items relation
 */
export type RegistryWithItems = Prisma.RegistryGetPayload<{
  include: { items: true };
}>;

/**
 * Registry with users relation
 */
export type RegistryWithUsers = Prisma.RegistryGetPayload<{
  include: { users: true };
}>;

/**
 * Registry with cart items relation
 */
export type RegistryWithCartItems = Prisma.RegistryGetPayload<{
  include: { cartItems: true };
}>;

/**
 * Registry with order items relation
 */
export type RegistryWithOrderItems = Prisma.RegistryGetPayload<{
  include: { orderItems: true };
}>;

/**
 * Registry with creator relation
 */
export type RegistryWithCreator = Prisma.RegistryGetPayload<{
  include: { createdByUser: true };
}>;

/**
 * Registry with all relations for complete data access
 */
export type RegistryWithAllRelations = Prisma.RegistryGetPayload<{
  include: {
    items: true;
    users: true;
    cartItems: true;
    orderItems: true;
    createdByUser: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted registry type (soft-deleted)
 * Includes the user who deleted it
 */
export type DeletedRegistry = Prisma.RegistryGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Registry search result type for optimized queries
 */
export type RegistrySearchResult = Prisma.RegistryGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    type: true;
    isPublic: true;
    eventDate: true;
    createdAt: true;
    _count: {
      select: {
        items: true;
        users: true;
      };
    };
  };
}>;

/**
 * Registry item with registry relation
 */
export type RegistryItemWithRegistry = Prisma.RegistryItemGetPayload<{
  include: { registry: true };
}>;

/**
 * Registry item with product relation
 */
export type RegistryItemWithProduct = Prisma.RegistryItemGetPayload<{
  include: { product: true };
}>;

/**
 * Registry item with collection relation
 */
export type RegistryItemWithCollection = Prisma.RegistryItemGetPayload<{
  include: { collection: true };
}>;

/**
 * Registry item with purchases relation
 */
export type RegistryItemWithPurchases = Prisma.RegistryItemGetPayload<{
  include: { purchases: true };
}>;

/**
 * Registry item with all relations
 */
export type RegistryItemWithAllRelations = Prisma.RegistryItemGetPayload<{
  include: {
    registry: true;
    product: true;
    collection: true;
    purchases: true;
    deletedBy: true;
  };
}>;

/**
 * Deleted registry item type (soft-deleted)
 */
export type DeletedRegistryItem = Prisma.RegistryItemGetPayload<{
  include: { deletedBy: true };
}>;

/**
 * Registry purchase join with relations
 */
export type RegistryPurchaseJoinWithRelations = Prisma.RegistryPurchaseJoinGetPayload<{
  include: {
    purchaser: true;
    registryItem: { include: { registry: true; product: true; collection: true } };
  };
}>;

/**
 * Registry user join with relations
 */
export type RegistryUserJoinWithRelations = Prisma.RegistryUserJoinGetPayload<{
  include: {
    user: true;
    registry: true;
  };
}>;

/**
 * Registry event summary type for event-focused queries
 */
export type RegistryEventSummary = Prisma.RegistryGetPayload<{
  select: {
    id: true;
    title: true;
    type: true;
    eventDate: true;
    isPublic: true;
    createdByUser: { select: { id: true; displayName: true } };
    _count: {
      select: {
        items: true;
        users: true;
      };
    };
  };
}>;
