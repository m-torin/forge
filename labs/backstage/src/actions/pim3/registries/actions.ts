'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@repo/auth/server/next';
import {
  type Prisma,
  RegistryType,
  RegistryUserRole,
  PurchaseStatus,
  type Registry,
  findManyRegistriesOrm,
  countRegistriesOrm,
  findUniqueRegistryOrm,
  createRegistryOrm,
  updateRegistryOrm,
  deleteRegistryOrm,
  updateManyRegistriesOrm,
  findManyRegistryItemsOrm,
  countRegistryItemsOrm,
  createRegistryItemOrm,
  updateRegistryItemOrm,
  deleteRegistryItemOrm,
  findUniqueRegistryItemOrm,
  groupByRegistryItemsOrm,
  findManyRegistryUserJoinsOrm,
  createRegistryUserJoinOrm,
  updateRegistryUserJoinOrm,
  deleteRegistryUserJoinOrm,
  upsertRegistryUserJoinOrm,
  findManyRegistryPurchaseJoinsOrm,
  createRegistryPurchaseJoinOrm,
  updateRegistryPurchaseJoinOrm,
  findManyUsersOrm,
  findManyProductsOrm,
  findManyCollectionsOrm,
  groupByRegistriesOrm,
  getMonthlyRegistryActivity,
  getTopRegistryProducts,
  getRegistryUserEngagement,
  getRegistryPurchaseActivity,
  aggregateRegistryPurchaseJoinsOrm,
} from '@repo/database/prisma';
export type { RegistryType } from '@repo/database/prisma';

// Registry creation/update schemas
export const registryFormSchema = z.object({
  type: z.nativeEnum(RegistryType),
  description: z.string().optional(),
  eventDate: z.date().optional(),
  isPublic: z.boolean().default(false),
  title: z.string().min(1, 'Title is required'),
});

export const registryItemFormSchema = z.object({
  collectionId: z.string().optional(),
  notes: z.string().optional(),
  priority: z.number().min(0).max(10).default(0),
  productId: z.string().optional(),
  quantity: z.number().min(1).default(1),
  registryId: z.string(),
});

export const registryUserRoleSchema = z.object({
  registryId: z.string(),
  role: z.nativeEnum(RegistryUserRole),
  userId: z.string(),
});

// Interface for registry with relations
export interface RegistryWithRelations extends Registry {
  count: {
    items: number;
    users: number;
  };
  createdByUser?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  items: {
    id: string;
    quantity: number;
    priority: number;
    notes?: string | null;
    purchased: boolean;
    createdAt: Date;
    product?: {
      id: string;
      name: string;
      price?: number | null;
      sku: string;
      status: string;
    } | null;
    collection?: {
      id: string;
      name: string;
      copy?: any;
      type: string;
    } | null;
    purchases: {
      id: string;
      quantity: number;
      status: PurchaseStatus;
      purchaseDate: Date;
      price?: number | null;
      purchaser: {
        id: string;
        name: string;
        email: string;
      };
    }[];
  }[];
  users: {
    id: string;
    role: RegistryUserRole;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }[];
}

// Interface for registry analytics
export interface RegistryAnalytics {
  activeRegistries: number;
  conversionRate: number;
  monthlyActivity: {
    month: string;
    registriesCreated: number;
    itemsAdded: number;
    itemsPurchased: number;
  }[];
  purchasedItems: number;
  registriesByType: Record<RegistryType, number>;
  topProducts: {
    productId: string;
    productName: string;
    timesAdded: number;
    timesPurchased: number;
    conversionRate: number;
  }[];
  totalItems: number;
  totalRegistries: number;
  userEngagement: {
    averageItemsPerRegistry: number;
    averageRegistriesPerUser: number;
    publicRegistriesPercentage: number;
  };
}

// Get registries with filtering and pagination
export async function getRegistries(params: {
  search?: string;
  type?: RegistryType;
  isPublic?: boolean;
  hasItems?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const {
      type,
      hasItems,
      isPublic,
      limit = 25,
      page = 1,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          createdByUser: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (typeof isPublic === 'boolean') {
      where.isPublic = isPublic;
    }

    if (typeof hasItems === 'boolean') {
      if (hasItems) {
        where.items = { some: { deletedAt: null } };
      } else {
        where.items = { none: {} };
      }
    }

    const [registries, total] = await Promise.all([
      findManyRegistriesOrm({
        include: {
          _count: {
            select: {
              items: {
                where: { deletedAt: null },
              },
              users: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            include: {
              collection: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  copy: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  sku: true,
                  status: true,
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
            where: { deletedAt: null },
          },
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        where,
      }),
      countRegistriesOrm({ where }),
    ]);

    return {
      data: registries as RegistryWithRelations[],
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    };
  } catch (error) {
    console.error('Error fetching registries:', error);
    return {
      error: 'Failed to fetch registries',
      success: false,
    };
  }
}

// Get registry analytics
export async function getRegistryAnalytics(): Promise<{
  success: boolean;
  data?: RegistryAnalytics;
  error?: string;
}> {
  try {
    const [registryCounts, registriesByTypeResult, monthlyStats, topProducts, userEngagement] =
      await Promise.all([
        // Basic counts
        countRegistriesOrm({
          where: { deletedAt: null },
        }),

        // Registries by type
        groupByRegistriesOrm({
          by: ['type'],
          where: { deletedAt: null },
          _count: { type: true },
        }),

        // Monthly activity (last 12 months)
        getMonthlyRegistryActivity(),

        // Top products in registries
        getTopRegistryProducts(),

        // User engagement metrics
        getRegistryUserEngagement(),
      ]);

    // Process registries by type
    const registriesByType = (registriesByTypeResult as any[]).map((item) => ({
      type: item.type as RegistryType,
      count: (item._count as any)?.type || 0,
    }));

    const registriesByTypeMap = registriesByType.reduce(
      (acc, item) => {
        acc[item.type] = item.count;
        return acc;
      },
      {} as Record<RegistryType, number>,
    );

    // Calculate derived metrics
    const itemStats = await countRegistryItemsOrm({
      where: { deletedAt: null },
    });

    const purchasedItems = await countRegistryItemsOrm({
      where: { deletedAt: null, purchased: true },
    });

    const activeRegistries = await countRegistriesOrm({
      where: {
        deletedAt: null,
        items: { some: { deletedAt: null } },
      },
    });

    const analytics: RegistryAnalytics = {
      activeRegistries,
      conversionRate: itemStats > 0 ? (purchasedItems / itemStats) * 100 : 0,
      monthlyActivity: (monthlyStats as any[]).map((stat) => ({
        itemsAdded: 0, // Would need additional query
        itemsPurchased: 0, // Would need additional query
        month: stat.month,
        registriesCreated: Number(stat.registriesCreated),
      })),
      purchasedItems,
      registriesByType: registriesByTypeMap,
      topProducts: (topProducts as any[]).map((product) => ({
        conversionRate: Number(product.conversionRate),
        productId: product.productId,
        productName: product.productName,
        timesAdded: Number(product.timesAdded),
        timesPurchased: Number(product.timesPurchased),
      })),
      totalItems: itemStats,
      totalRegistries: registryCounts,
      userEngagement: {
        averageItemsPerRegistry: Number((userEngagement as any)[0]?.averageItemsPerRegistry || 0),
        averageRegistriesPerUser:
          registryCounts > 0
            ? registryCounts / Number((userEngagement as any)[0]?.uniqueCreators || 1)
            : 0,
        publicRegistriesPercentage: Number(
          (userEngagement as any)[0]?.publicRegistriesPercentage || 0,
        ),
      },
    };

    return {
      data: analytics,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching registry analytics:', error);
    return {
      error: 'Failed to fetch registry analytics',
      success: false,
    };
  }
}

// Get a single registry with all details
export async function getRegistry(id: string) {
  try {
    const registry = await findUniqueRegistryOrm({
      include: {
        _count: {
          select: {
            items: {
              where: { deletedAt: null },
            },
            users: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        items: {
          include: {
            collection: {
              select: {
                id: true,
                name: true,
                type: true,
                copy: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                sku: true,
                status: true,
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
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
          where: { deletedAt: null },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      where: { id, deletedAt: null },
    });

    if (!registry) {
      return {
        error: 'Registry not found',
        success: false,
      };
    }

    return {
      data: registry as RegistryWithRelations,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching registry:', error);
    return {
      error: 'Failed to fetch registry',
      success: false,
    };
  }
}

// Create a new registry
export async function createRegistry(data: z.infer<typeof registryFormSchema>) {
  try {
    const validatedData = registryFormSchema.parse(data);

    const registry = await createRegistryOrm({
      data: {
        type: validatedData.type,
        description: validatedData.description,
        eventDate: validatedData.eventDate,
        isPublic: validatedData.isPublic,
        title: validatedData.title,
      },
      include: {
        _count: {
          select: {
            items: true,
            users: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    revalidatePath('/pim3/registries');
    return {
      data: registry,
      success: true,
    };
  } catch (error) {
    console.error('Error creating registry:', error);
    return {
      error: error instanceof z.ZodError ? error.errors[0].message : 'Failed to create registry',
      success: false,
    };
  }
}

// Update registry
export async function updateRegistry(
  id: string,
  data: Partial<z.infer<typeof registryFormSchema>>,
) {
  try {
    const registry = await updateRegistryOrm({
      data,
      include: {
        _count: {
          select: {
            items: true,
            users: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      where: { id, deletedAt: null },
    });

    revalidatePath('/pim3/registries');
    return {
      data: registry,
      success: true,
    };
  } catch (error) {
    console.error('Error updating registry:', error);
    return {
      error: 'Failed to update registry',
      success: false,
    };
  }
}

// Delete registry (soft delete)
export async function deleteRegistry(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }
    await updateRegistryOrm({
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
      where: { id },
    });

    revalidatePath('/pim3/registries');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting registry:', error);
    return {
      error: 'Failed to delete registry',
      success: false,
    };
  }
}

// Bulk delete registries
export async function bulkDeleteRegistries(ids: string[]) {
  try {
    await updateManyRegistriesOrm({
      data: {
        deletedAt: new Date(),
      },
      where: { id: { in: ids } },
    });

    revalidatePath('/pim3/registries');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error bulk deleting registries:', error);
    return {
      error: 'Failed to delete registries',
      success: false,
    };
  }
}

// Update registry privacy
export async function updateRegistryPrivacy(id: string, isPublic: boolean) {
  try {
    await updateRegistryOrm({
      data: { isPublic },
      where: { id, deletedAt: null },
    });

    revalidatePath('/pim3/registries');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating registry privacy:', error);
    return {
      error: 'Failed to update registry privacy',
      success: false,
    };
  }
}

// Manage registry user access
export async function updateRegistryUserRole(data: z.infer<typeof registryUserRoleSchema>) {
  try {
    const validatedData = registryUserRoleSchema.parse(data);

    await upsertRegistryUserJoinOrm({
      create: {
        registryId: validatedData.registryId,
        role: validatedData.role,
        userId: validatedData.userId,
      },
      update: {
        role: validatedData.role,
      },
      where: {
        userId_registryId: {
          registryId: validatedData.registryId,
          userId: validatedData.userId,
        },
      },
    });

    revalidatePath('/pim3/registries');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating registry user role:', error);
    return {
      error: 'Failed to update user role',
      success: false,
    };
  }
}

// Remove user from registry
export async function removeRegistryUser(registryId: string, userId: string) {
  try {
    await deleteRegistryUserJoinOrm({
      where: {
        userId_registryId: {
          registryId,
          userId,
        },
      },
    });

    revalidatePath('/pim3/registries');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error removing registry user:', error);
    return {
      error: 'Failed to remove user from registry',
      success: false,
    };
  }
}

// Add item to registry
export async function addRegistryItem(data: z.infer<typeof registryItemFormSchema>) {
  try {
    const validatedData = registryItemFormSchema.parse(data);

    // Ensure either productId or collectionId is provided
    if (!validatedData.productId && !validatedData.collectionId) {
      return {
        error: 'Either product or collection must be specified',
        success: false,
      };
    }

    const item = await createRegistryItemOrm({
      data: {
        collectionId: validatedData.collectionId,
        notes: validatedData.notes,
        priority: validatedData.priority,
        productId: validatedData.productId,
        quantity: validatedData.quantity,
        registryId: validatedData.registryId,
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            type: true,
            copy: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            sku: true,
            status: true,
          },
        },
      },
    });

    revalidatePath('/pim3/registries');
    return {
      data: item,
      success: true,
    };
  } catch (error) {
    console.error('Error adding registry item:', error);
    return {
      error:
        error instanceof z.ZodError ? error.errors[0].message : 'Failed to add item to registry',
      success: false,
    };
  }
}

// Update registry item
export async function updateRegistryItem(
  id: string,
  data: Partial<z.infer<typeof registryItemFormSchema>>,
) {
  try {
    const item = await updateRegistryItemOrm({
      data,
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            type: true,
            copy: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            sku: true,
            status: true,
          },
        },
      },
      where: { id, deletedAt: null },
    });

    revalidatePath('/pim3/registries');
    return {
      data: item,
      success: true,
    };
  } catch (error) {
    console.error('Error updating registry item:', error);
    return {
      error: 'Failed to update registry item',
      success: false,
    };
  }
}

// Remove item from registry
export async function removeRegistryItem(id: string) {
  try {
    await updateRegistryItemOrm({
      data: {
        deletedAt: new Date(),
      },
      where: { id },
    });

    revalidatePath('/pim3/registries');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error removing registry item:', error);
    return {
      error: 'Failed to remove item from registry',
      success: false,
    };
  }
}

// Mark item as purchased
export async function markItemPurchased(id: string, purchased = true) {
  try {
    await updateRegistryItemOrm({
      data: { purchased },
      where: { id, deletedAt: null },
    });

    revalidatePath('/pim3/registries');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating item purchase status:', error);
    return {
      error: 'Failed to update purchase status',
      success: false,
    };
  }
}

// Get users for selection (used in user assignment components)
export async function getUsersForSelect(search?: string) {
  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await findManyUsersOrm({
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 50, // Limit to prevent performance issues
      where,
    });

    return {
      data: users,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching users for select:', error);
    return {
      error: 'Failed to fetch users',
      success: false,
    };
  }
}

// Get products for registry item selection
export async function getProductsForSelect(search?: string) {
  try {
    const where: any = {
      deletedAt: null,
      status: 'ACTIVE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await findManyProductsOrm({
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
        name: true,
        currency: true,
        price: true,
        sku: true,
      },
      take: 50,
      where,
    });

    return {
      data: products,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching products for select:', error);
    return {
      error: 'Failed to fetch products',
      success: false,
    };
  }
}

// Get collections for registry item selection
export async function getCollectionsForSelect(search?: string) {
  try {
    const where: any = {
      deletedAt: null,
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const collections = await findManyCollectionsOrm({
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        _count: {
          select: {
            products: true,
          },
        },
        copy: true,
        slug: true,
      },
      take: 50,
      where,
    });

    return {
      data: collections,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching collections for select:', error);
    return {
      error: 'Failed to fetch collections',
      success: false,
    };
  }
}

// Get registry item with full details
export async function getRegistryItem(id: string) {
  try {
    const item = await findUniqueRegistryItemOrm({
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            type: true,
            _count: {
              select: {
                products: true,
              },
            },
            copy: true,
            slug: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            currency: true,
            copy: true,
            media: {
              select: {
                id: true,
                type: true,
                url: true,
                altText: true,
              },
              take: 1,
            },
            price: true,
            sku: true,
            status: true,
          },
        },
        purchases: {
          include: {
            purchaser: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            purchaseDate: 'desc',
          },
        },
        registry: {
          select: {
            id: true,
            type: true,
            createdByUserId: true,
            isPublic: true,
            title: true,
          },
        },
      },
      where: { id, deletedAt: null },
    });

    if (!item) {
      return {
        error: 'Registry item not found',
        success: false,
      };
    }

    return {
      data: item,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching registry item:', error);
    return {
      error: 'Failed to fetch registry item',
      success: false,
    };
  }
}

// Bulk add items to registry
export async function bulkAddRegistryItems(
  registryId: string,
  items: {
    productId?: string;
    collectionId?: string;
    quantity: number;
    priority: number;
    notes?: string;
  }[],
) {
  try {
    const itemsToCreate = items.map((item) => ({
      collectionId: item.collectionId || null,
      notes: item.notes || null,
      priority: item.priority,
      productId: item.productId || null,
      quantity: item.quantity,
      registryId,
    }));

    const createdItems = await Promise.all(
      itemsToCreate.map((item) =>
        createRegistryItemOrm({
          data: {
            collectionId: item.collectionId,
            notes: item.notes,
            priority: item.priority,
            productId: item.productId,
            quantity: item.quantity,
            registryId,
          },
          include: {
            collection: {
              select: {
                id: true,
                name: true,
                type: true,
                copy: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                sku: true,
                status: true,
              },
            },
          },
        }),
      ),
    );

    revalidatePath('/pim3/registries');
    return {
      data: { count: createdItems.length },
      success: true,
    };
  } catch (error) {
    console.error('Error bulk adding registry items:', error);
    return {
      error: 'Failed to add items to registry',
      success: false,
    };
  }
}

// Bulk update item priorities
export async function bulkUpdateItemPriorities(updates: { id: string; priority: number }[]) {
  try {
    await Promise.all(
      updates.map((update) =>
        updateRegistryItemOrm({
          data: { priority: update.priority },
          where: { id: update.id, deletedAt: null },
        }),
      ),
    );

    revalidatePath('/pim3/registries');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error bulk updating item priorities:', error);
    return {
      error: 'Failed to update item priorities',
      success: false,
    };
  }
}

// Record a purchase for a registry item
export async function recordItemPurchase(data: {
  registryItemId: string;
  purchaserId: string;
  quantity: number;
  price?: number;
  currency?: string;
  status?: PurchaseStatus;
  transactionId?: string;
  orderNumber?: string;
  isGift?: boolean;
  giftMessage?: string;
  notes?: string;
}) {
  try {
    const purchase = await createRegistryPurchaseJoinOrm({
      data: {
        currency: data.currency || 'USD',
        giftMessage: data.giftMessage,
        isGift: data.isGift || false,
        notes: data.notes,
        orderNumber: data.orderNumber,
        price: data.price,
        purchaserId: data.purchaserId,
        quantity: data.quantity,
        registryItemId: data.registryItemId,
        status: data.status || 'PENDING',
        transactionId: data.transactionId,
      },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        registryItem: {
          select: {
            id: true,
            collection: {
              select: {
                name: true,
              },
            },
            product: {
              select: {
                name: true,
              },
            },
            quantity: true,
          },
        },
      },
    });

    // Update the registry item purchased status if needed
    const item = await findUniqueRegistryItemOrm({
      where: { id: data.registryItemId },
    });

    if (item) {
      const purchasedCountResult = await aggregateRegistryPurchaseJoinsOrm({
        _sum: {
          quantity: true,
        },
        where: {
          registryItemId: data.registryItemId,
        },
      });
      const totalPurchased = purchasedCountResult._sum?.quantity || 0;
      const shouldMarkPurchased = totalPurchased >= item.quantity;

      if (shouldMarkPurchased && !item.purchased) {
        await updateRegistryItemOrm({
          data: { purchased: true },
          where: { id: data.registryItemId },
        });
      }
    }

    revalidatePath('/pim3/registries');
    return {
      data: purchase,
      success: true,
    };
  } catch (error) {
    console.error('Error recording item purchase:', error);
    return {
      error: 'Failed to record purchase',
      success: false,
    };
  }
}

// Update purchase status
export async function updatePurchaseStatus(
  purchaseId: string,
  status: PurchaseStatus,
  trackingInfo?: {
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
  },
) {
  try {
    const purchase = await updateRegistryPurchaseJoinOrm({
      data: {
        status,
        ...trackingInfo,
      },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        registryItem: {
          select: {
            id: true,
            registry: {
              select: {
                createdByUserId: true,
                title: true,
              },
            },
          },
        },
      },
      where: { id: purchaseId },
    });

    revalidatePath('/pim3/registries');
    return {
      data: purchase,
      success: true,
    };
  } catch (error) {
    console.error('Error updating purchase status:', error);
    return {
      error: 'Failed to update purchase status',
      success: false,
    };
  }
}

// Get registry item analytics
export async function getRegistryItemAnalytics(registryId?: string) {
  try {
    const whereClause = registryId ? { deletedAt: null, registryId } : { deletedAt: null };

    const [
      totalItems,
      purchasedItems,
      itemsByPriority,
      topProducts,
      topCollections,
      purchaseActivity,
    ] = await Promise.all([
      // Total items count
      countRegistryItemsOrm({
        where: whereClause,
      }),

      // Purchased items count
      countRegistryItemsOrm({
        where: { ...whereClause, purchased: true },
      }),

      // Items by priority distribution
      groupByRegistryItemsOrm({
        _count: true,
        by: ['priority'],
        orderBy: { priority: 'desc' },
        where: whereClause,
      }),

      // Top products in registries
      groupByRegistryItemsOrm({
        _count: true,
        by: ['productId'],
        orderBy: { _count: { productId: 'desc' } },
        take: 10,
        where: {
          ...whereClause,
          productId: { not: null },
        },
      }),

      // Top collections in registries
      groupByRegistryItemsOrm({
        _count: true,
        by: ['collectionId'],
        orderBy: { _count: { collectionId: 'desc' } },
        take: 10,
        where: {
          ...whereClause,
          collectionId: { not: null },
        },
      }),

      // Purchase activity over time (last 12 months)
      getRegistryPurchaseActivity(registryId),
    ]);

    // Get product details for top products
    const productIds = topProducts.map((p) => p.productId).filter(Boolean);
    const productDetails =
      productIds.length > 0
        ? await findManyProductsOrm({
            select: { id: true, name: true, price: true, sku: true },
            where: { id: { in: productIds as string[] } },
          })
        : [];

    // Get collection details for top collections
    const collectionIds = topCollections.map((c) => c.collectionId).filter(Boolean);
    const collectionDetails =
      collectionIds.length > 0
        ? await findManyCollectionsOrm({
            select: { id: true, name: true, type: true },
            where: { id: { in: collectionIds as string[] } },
          })
        : [];

    const analytics = {
      conversionRate: totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0,
      itemsByPriority: (itemsByPriority as any[]).map((item) => ({
        count: item._count.priority || 0,
        priority: item.priority,
      })),
      purchaseActivity: (purchaseActivity as any[]).map((activity) => ({
        averagePrice: Number(activity.averagePrice || 0),
        month: activity.month,
        purchases: Number(activity.purchases),
        totalQuantity: Number(activity.totalQuantity),
      })),
      purchasedItems,
      topCollections: (topCollections as any[]).map((item) => {
        const collection = collectionDetails.find((c) => c.id === item.collectionId);
        return {
          collectionId: item.collectionId,
          collectionName: collection?.name || 'Unknown Collection',
          collectionType: collection?.type,
          timesAdded: item._count.collectionId || 0,
        };
      }),
      topProducts: (topProducts as any[]).map((item) => {
        const product = productDetails.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          productPrice: product?.price,
          productSku: product?.sku,
          timesAdded: item._count.productId || 0,
        };
      }),
      totalItems,
    };

    return {
      data: analytics,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching registry item analytics:', error);
    return {
      error: 'Failed to fetch analytics',
      success: false,
    };
  }
}
