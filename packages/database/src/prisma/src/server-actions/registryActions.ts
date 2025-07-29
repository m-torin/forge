'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import { RegistryType } from '../../../../prisma-generated/client';
import {
  aggregateRegistriesOrm,
  aggregateRegistryItemsOrm,
  aggregateRegistryPurchaseJoinsOrm,
  aggregateRegistryUserJoinsOrm,
  countRegistriesOrm,
  countRegistryItemsOrm,
  countRegistryPurchaseJoinsOrm,
  countRegistryUserJoinsOrm,
  // RegistryItem CRUD functions
  createRegistryItemOrm,
  // Registry CRUD functions
  createRegistryOrm,
  // RegistryPurchaseJoin CRUD functions
  createRegistryPurchaseJoinOrm,
  // RegistryUserJoin CRUD functions
  createRegistryUserJoinOrm,
  deleteManyRegistriesOrm,
  deleteManyRegistryItemsOrm,
  deleteManyRegistryPurchaseJoinsOrm,
  deleteManyRegistryUserJoinsOrm,
  deleteRegistryItemOrm,
  deleteRegistryOrm,
  deleteRegistryPurchaseJoinOrm,
  deleteRegistryUserJoinOrm,
  findFirstRegistryItemOrm,
  findFirstRegistryOrm,
  findFirstRegistryPurchaseJoinOrm,
  findFirstRegistryUserJoinOrm,
  findManyRegistriesOrm,
  findManyRegistryItemsOrm,
  findManyRegistryPurchaseJoinsOrm,
  findManyRegistryUserJoinsOrm,
  findUniqueRegistryItemOrm,
  findUniqueRegistryOrm,
  findUniqueRegistryPurchaseJoinOrm,
  findUniqueRegistryUserJoinOrm,
  groupByRegistriesOrm,
  groupByRegistryItemsOrm,
  groupByRegistryPurchaseJoinsOrm,
  groupByRegistryUserJoinsOrm,
  updateManyRegistriesOrm,
  updateManyRegistryItemsOrm,
  updateManyRegistryPurchaseJoinsOrm,
  updateManyRegistryUserJoinsOrm,
  updateRegistryItemOrm,
  updateRegistryOrm,
  updateRegistryPurchaseJoinOrm,
  updateRegistryUserJoinOrm,
  upsertRegistryItemOrm,
  upsertRegistryOrm,
  upsertRegistryPurchaseJoinOrm,
  upsertRegistryUserJoinOrm,
} from '../orm/registry/registryOrm';

//==============================================================================
// REGISTRY SERVER ACTIONS
//==============================================================================

export async function createRegistryAction(args: Prisma.RegistryCreateArgs) {
  'use server';
  return createRegistryOrm(args);
}

export async function findFirstRegistryAction(args?: Prisma.RegistryFindFirstArgs) {
  'use server';
  return findFirstRegistryOrm(args);
}

export async function findUniqueRegistryAction(args: Prisma.RegistryFindUniqueArgs) {
  'use server';
  return findUniqueRegistryOrm(args);
}

export async function findManyRegistriesAction(args?: Prisma.RegistryFindManyArgs) {
  'use server';
  return findManyRegistriesOrm(args);
}

export async function updateRegistryAction(args: Prisma.RegistryUpdateArgs) {
  'use server';
  return updateRegistryOrm(args);
}

export async function updateManyRegistriesAction(args: Prisma.RegistryUpdateManyArgs) {
  'use server';
  return updateManyRegistriesOrm(args);
}

export async function upsertRegistryAction(args: Prisma.RegistryUpsertArgs) {
  'use server';
  return upsertRegistryOrm(args);
}

export async function deleteRegistryAction(args: Prisma.RegistryDeleteArgs) {
  'use server';
  return deleteRegistryOrm(args);
}

export async function deleteManyRegistriesAction(args?: Prisma.RegistryDeleteManyArgs) {
  'use server';
  return deleteManyRegistriesOrm(args);
}

export async function aggregateRegistriesAction(args?: Prisma.RegistryAggregateArgs) {
  'use server';
  return aggregateRegistriesOrm(args);
}

export async function countRegistriesAction(args?: Prisma.RegistryCountArgs) {
  'use server';
  return countRegistriesOrm(args);
}

export async function groupByRegistriesAction(args: Prisma.RegistryGroupByArgs) {
  'use server';
  return groupByRegistriesOrm(args);
}

//==============================================================================
// REGISTRYITEM SERVER ACTIONS
//==============================================================================

export async function createRegistryItemAction(args: Prisma.RegistryItemCreateArgs) {
  'use server';
  return createRegistryItemOrm(args);
}

export async function findFirstRegistryItemAction(args?: Prisma.RegistryItemFindFirstArgs) {
  'use server';
  return findFirstRegistryItemOrm(args);
}

export async function findUniqueRegistryItemAction(args: Prisma.RegistryItemFindUniqueArgs) {
  'use server';
  return findUniqueRegistryItemOrm(args);
}

export async function findManyRegistryItemsAction(args?: Prisma.RegistryItemFindManyArgs) {
  'use server';
  return findManyRegistryItemsOrm(args);
}

export async function updateRegistryItemAction(args: Prisma.RegistryItemUpdateArgs) {
  'use server';
  return updateRegistryItemOrm(args);
}

export async function updateManyRegistryItemsAction(args: Prisma.RegistryItemUpdateManyArgs) {
  'use server';
  return updateManyRegistryItemsOrm(args);
}

export async function upsertRegistryItemAction(args: Prisma.RegistryItemUpsertArgs) {
  'use server';
  return upsertRegistryItemOrm(args);
}

export async function deleteRegistryItemAction(args: Prisma.RegistryItemDeleteArgs) {
  'use server';
  return deleteRegistryItemOrm(args);
}

export async function deleteManyRegistryItemsAction(args?: Prisma.RegistryItemDeleteManyArgs) {
  'use server';
  return deleteManyRegistryItemsOrm(args);
}

export async function aggregateRegistryItemsAction(args?: Prisma.RegistryItemAggregateArgs) {
  'use server';
  return aggregateRegistryItemsOrm(args);
}

export async function countRegistryItemsAction(args?: Prisma.RegistryItemCountArgs) {
  'use server';
  return countRegistryItemsOrm(args);
}

export async function groupByRegistryItemsAction(args: Prisma.RegistryItemGroupByArgs) {
  'use server';
  return groupByRegistryItemsOrm(args);
}

//==============================================================================
// REGISTRYPURCHASEJOIN SERVER ACTIONS
//==============================================================================

export async function createRegistryPurchaseJoinAction(
  args: Prisma.RegistryPurchaseJoinCreateArgs,
) {
  'use server';
  return createRegistryPurchaseJoinOrm(args);
}

export async function findFirstRegistryPurchaseJoinAction(
  args?: Prisma.RegistryPurchaseJoinFindFirstArgs,
) {
  'use server';
  return findFirstRegistryPurchaseJoinOrm(args);
}

export async function findUniqueRegistryPurchaseJoinAction(
  args: Prisma.RegistryPurchaseJoinFindUniqueArgs,
) {
  'use server';
  return findUniqueRegistryPurchaseJoinOrm(args);
}

export async function findManyRegistryPurchaseJoinsAction(
  args?: Prisma.RegistryPurchaseJoinFindManyArgs,
) {
  'use server';
  return findManyRegistryPurchaseJoinsOrm(args);
}

export async function updateRegistryPurchaseJoinAction(
  args: Prisma.RegistryPurchaseJoinUpdateArgs,
) {
  'use server';
  return updateRegistryPurchaseJoinOrm(args);
}

export async function updateManyRegistryPurchaseJoinsAction(
  args: Prisma.RegistryPurchaseJoinUpdateManyArgs,
) {
  'use server';
  return updateManyRegistryPurchaseJoinsOrm(args);
}

export async function upsertRegistryPurchaseJoinAction(
  args: Prisma.RegistryPurchaseJoinUpsertArgs,
) {
  'use server';
  return upsertRegistryPurchaseJoinOrm(args);
}

export async function deleteRegistryPurchaseJoinAction(
  args: Prisma.RegistryPurchaseJoinDeleteArgs,
) {
  'use server';
  return deleteRegistryPurchaseJoinOrm(args);
}

export async function deleteManyRegistryPurchaseJoinsAction(
  args?: Prisma.RegistryPurchaseJoinDeleteManyArgs,
) {
  'use server';
  return deleteManyRegistryPurchaseJoinsOrm(args);
}

export async function aggregateRegistryPurchaseJoinsAction(
  args?: Prisma.RegistryPurchaseJoinAggregateArgs,
) {
  'use server';
  return aggregateRegistryPurchaseJoinsOrm(args);
}

export async function countRegistryPurchaseJoinsAction(
  args?: Prisma.RegistryPurchaseJoinCountArgs,
) {
  'use server';
  return countRegistryPurchaseJoinsOrm(args);
}

export async function groupByRegistryPurchaseJoinsAction(
  args: Prisma.RegistryPurchaseJoinGroupByArgs,
) {
  'use server';
  return groupByRegistryPurchaseJoinsOrm(args);
}

//==============================================================================
// REGISTRYUSERJOIN SERVER ACTIONS
//==============================================================================

export async function createRegistryUserJoinAction(args: Prisma.RegistryUserJoinCreateArgs) {
  'use server';
  return createRegistryUserJoinOrm(args);
}

export async function findFirstRegistryUserJoinAction(args?: Prisma.RegistryUserJoinFindFirstArgs) {
  'use server';
  return findFirstRegistryUserJoinOrm(args);
}

export async function findUniqueRegistryUserJoinAction(
  args: Prisma.RegistryUserJoinFindUniqueArgs,
) {
  'use server';
  return findUniqueRegistryUserJoinOrm(args);
}

export async function findManyRegistryUserJoinsAction(args?: Prisma.RegistryUserJoinFindManyArgs) {
  'use server';
  return findManyRegistryUserJoinsOrm(args);
}

export async function updateRegistryUserJoinAction(args: Prisma.RegistryUserJoinUpdateArgs) {
  'use server';
  return updateRegistryUserJoinOrm(args);
}

export async function updateManyRegistryUserJoinsAction(
  args: Prisma.RegistryUserJoinUpdateManyArgs,
) {
  'use server';
  return updateManyRegistryUserJoinsOrm(args);
}

export async function upsertRegistryUserJoinAction(args: Prisma.RegistryUserJoinUpsertArgs) {
  'use server';
  return upsertRegistryUserJoinOrm(args);
}

export async function deleteRegistryUserJoinAction(args: Prisma.RegistryUserJoinDeleteArgs) {
  'use server';
  return deleteRegistryUserJoinOrm(args);
}

export async function deleteManyRegistryUserJoinsAction(
  args?: Prisma.RegistryUserJoinDeleteManyArgs,
) {
  'use server';
  return deleteManyRegistryUserJoinsOrm(args);
}

export async function aggregateRegistryUserJoinsAction(
  args?: Prisma.RegistryUserJoinAggregateArgs,
) {
  'use server';
  return aggregateRegistryUserJoinsOrm(args);
}

export async function countRegistryUserJoinsAction(args?: Prisma.RegistryUserJoinCountArgs) {
  'use server';
  return countRegistryUserJoinsOrm(args);
}

export async function groupByRegistryUserJoinsAction(args: Prisma.RegistryUserJoinGroupByArgs) {
  'use server';
  return groupByRegistryUserJoinsOrm(args);
}

//==============================================================================
// REGISTRY BUSINESS LOGIC ACTIONS
//==============================================================================

/**
 * Create registry with validation
 */
export async function createRegistryWithValidationAction(data: {
  title: string;
  description?: string;
  type: string;
  isPublic?: boolean;
  eventDate?: Date;
  createdByUserId?: string;
}) {
  'use server';

  return createRegistryOrm({
    data: {
      title: data.title,
      description: data.description,
      type: data.type as RegistryType,
      isPublic: data.isPublic ?? false,
      eventDate: data.eventDate,
      createdByUserId: data.createdByUserId,
    },
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          collection: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Add item to registry with validation
 */
export async function addRegistryItemWithValidationAction(data: {
  registryId: string;
  productId?: string;
  collectionId?: string;
  quantity?: number;
  priority?: number;
  notes?: string;
}) {
  'use server';

  // Validate that either productId or collectionId is provided
  if (!data.productId && !data.collectionId) {
    throw new Error('Either productId or collectionId must be provided');
  }

  return createRegistryItemOrm({
    data: {
      registryId: data.registryId,
      productId: data.productId,
      collectionId: data.collectionId,
      quantity: data.quantity ?? 1,
      priority: data.priority ?? 0,
      notes: data.notes,
    },
    include: {
      registry: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
      collection: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Get registry with full details
 */
export async function getRegistryWithDetailsAction(id: string) {
  'use server';

  const registry = await findUniqueRegistryOrm({
    where: { id },
    include: {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              currency: true,
            },
          },
          collection: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          purchases: {
            include: {
              purchaser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      },
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return registry;
}

/**
 * Get registries with pagination and filtering
 */
export async function getRegistriesWithFilterAction(params: {
  userId?: string;
  type?: string;
  isPublic?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  'use server';

  const {
    userId,
    type,
    isPublic,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const where: any = {};

  if (userId) {
    where.OR = [{ createdByUserId: userId }, { users: { some: { userId } } }];
  }

  if (type) {
    where.type = type;
  }

  if (isPublic !== undefined) {
    where.isPublic = isPublic;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [registries, total] = await Promise.all([
    findManyRegistriesOrm({
      where,
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            items: true,
            users: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    countRegistriesOrm({ where }),
  ]);

  return {
    data: registries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Mark registry item as purchased
 */
export async function markItemPurchasedAction(id: string, purchased = true) {
  'use server';

  return updateRegistryItemOrm({
    where: { id },
    data: { purchased },
    include: {
      registry: {
        select: {
          id: true,
          title: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
