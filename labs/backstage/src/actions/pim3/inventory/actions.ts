'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server/next';
import { type Prisma } from '@repo/database/prisma';
import {
  findManyInventoryOrm,
  countInventoryOrm,
  createInventoryOrm,
  updateInventoryOrm,
  deleteInventoryOrm,
  findUniqueInventoryOrm,
  findFirstInventoryOrm,
  updateManyInventoryOrm,
  upsertInventoryOrm,
  findManyInventoryTransactionsOrm,
  countInventoryTransactionsOrm,
  createInventoryTransactionOrm,
  deleteManyInventoryTransactionsOrm,
  aggregateInventoryOrm,
  aggregateInventoryTransactionsOrm,
  groupByInventoryOrm,
  findManyProductsOrm,
  findManyLocationsOrm,
} from '@repo/database/prisma';

/**
 * Inventory management actions for PIM3
 *
 * These actions provide inventory management functionality:
 * - Inventory CRUD operations
 * - Stock level management
 * - Inventory transactions
 * - Multi-location inventory
 * - Low stock alerts and analytics
 * - Inventory adjustments and restocking
 */

// Get inventory with pagination and filtering
export async function getInventory(params?: {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  locationId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const {
      limit = 50,
      page = 1,
      productId,
      locationId,
      lowStock,
      outOfStock,
      search,
      startDate,
      endDate,
    } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {
      ...(search && {
        OR: [
          { product: { name: { contains: search, mode: 'insensitive' } } },
          { product: { sku: { contains: search, mode: 'insensitive' } } },
          { variant: { name: { contains: search, mode: 'insensitive' } } },
          { locationName: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(productId && { productId }),
      ...(locationId && { locationId }),
      ...(lowStock && {
        lowStockThreshold: { not: null },
        available: { lte: 10 },
      }),
      ...(outOfStock && { available: { lte: 0 } }),
      ...(startDate &&
        endDate && {
          updatedAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [inventory, total] = await Promise.all([
      findManyInventoryOrm({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
              status: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
            },
          },
          transactions: {
            select: {
              id: true,
              type: true,
              quantity: true,
              createdAt: true,
              notes: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: [
          { available: 'asc' }, // Show low stock first
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
        where,
      }),
      countInventoryOrm({ where }),
    ]);

    return {
      data: inventory,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load inventory', success: false as const };
  }
}

// Get a single inventory item by ID
export async function getInventoryItem(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const inventory = await findUniqueInventoryOrm({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
            status: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
      where: { id },
    });

    if (!inventory) {
      return { error: 'Inventory item not found', success: false as const };
    }

    return { data: inventory, success: true as const };
  } catch (error) {
    return { error: 'Failed to load inventory item', success: false as const };
  }
}

// Create or update inventory for a product
export async function upsertInventory(data: {
  productId?: string;
  variantId?: string;
  quantity: number;
  reserved?: number;
  lowStockThreshold?: number;
  locationId?: string;
  locationName?: string;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    if (!data.productId && !data.variantId) {
      return { error: 'Either productId or variantId is required', success: false as const };
    }

    const available = data.quantity - (data.reserved || 0);

    // Check if inventory already exists
    const existingInventory = await findFirstInventoryOrm({
      where: {
        productId: data.productId || null,
        variantId: data.variantId || null,
        locationId: data.locationId || null,
      },
    });

    let inventory;
    if (existingInventory) {
      // Update existing inventory
      inventory = await updateInventoryOrm({
        where: { id: existingInventory.id },
        data: {
          quantity: data.quantity,
          reserved: data.reserved || 0,
          available,
          lowStockThreshold: data.lowStockThreshold,
          locationName: data.locationName,
          lastRestockedAt: new Date(),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

      // Create transaction record
      await createInventoryTransactionOrm({
        data: {
          inventoryId: inventory.id,
          type: 'RESTOCK',
          quantity: data.quantity - existingInventory.quantity,
          notes: 'Inventory updated via admin panel',
          createdBy: session.user.id,
        },
      });
    } else {
      // Create new inventory
      inventory = await createInventoryOrm({
        data: {
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
          reserved: data.reserved || 0,
          available,
          lowStockThreshold: data.lowStockThreshold,
          locationId: data.locationId,
          locationName: data.locationName,
          lastRestockedAt: new Date(),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

      // Create initial transaction record
      await createInventoryTransactionOrm({
        data: {
          inventoryId: inventory.id,
          type: 'RESTOCK',
          quantity: data.quantity,
          notes: 'Initial stock',
        },
      });
    }

    revalidatePath('/pim3/inventory');
    return { data: inventory, success: true as const };
  } catch (error) {
    return { error: 'Failed to save inventory', success: false as const };
  }
}

// Adjust inventory levels (add/remove stock)
export async function adjustInventory(
  id: string,
  data: {
    adjustment: number; // positive for add, negative for remove
    type: 'RESTOCK' | 'SALE' | 'DAMAGED' | 'LOST' | 'RETURNED' | 'ADJUSTMENT';
    notes?: string;
    referenceId?: string;
    referenceType?: string;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const inventory = await findUniqueInventoryOrm({
      where: { id },
    });

    if (!inventory) {
      return { error: 'Inventory item not found', success: false as const };
    }

    const newQuantity = inventory.quantity + data.adjustment;
    const newAvailable = newQuantity - inventory.reserved;

    if (newQuantity < 0) {
      return { error: 'Insufficient stock for this adjustment', success: false as const };
    }

    // Update inventory
    const updatedInventory = await updateInventoryOrm({
      where: { id },
      data: {
        quantity: newQuantity,
        available: newAvailable,
        ...(data.type === 'RESTOCK' && { lastRestockedAt: new Date() }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    // Create transaction record
    await createInventoryTransactionOrm({
      data: {
        inventoryId: id,
        type: data.type as any,
        quantity: Math.abs(data.adjustment),
        notes: data.notes,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        createdBy: session.user.id,
      },
    });

    revalidatePath('/pim3/inventory');
    return { data: updatedInventory, success: true as const };
  } catch (error) {
    return { error: 'Failed to adjust inventory', success: false as const };
  }
}

// Reserve/unreserve inventory for orders
export async function reserveInventory(id: string, quantity: number, reserve: boolean = true) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const inventory = await findUniqueInventoryOrm({
      where: { id },
    });

    if (!inventory) {
      return { error: 'Inventory item not found', success: false as const };
    }

    const adjustment = reserve ? quantity : -quantity;
    const newReserved = Math.max(0, inventory.reserved + adjustment);
    const newAvailable = inventory.quantity - newReserved;

    if (reserve && newAvailable < 0) {
      return { error: 'Insufficient available stock to reserve', success: false as const };
    }

    const updatedInventory = await updateInventoryOrm({
      where: { id },
      data: {
        reserved: newReserved,
        available: newAvailable,
      },
    });

    // Create transaction record
    await createInventoryTransactionOrm({
      data: {
        inventoryId: id,
        type: reserve ? 'RESERVATION' : 'RELEASE',
        quantity: quantity,
        notes: reserve ? 'Inventory reserved' : 'Inventory released',
        createdBy: session.user.id,
      },
    });

    revalidatePath('/pim3/inventory');
    return { data: updatedInventory, success: true as const };
  } catch (error) {
    return { error: 'Failed to reserve inventory', success: false as const };
  }
}

// Delete inventory item
export async function deleteInventory(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Delete all transactions first
    await deleteManyInventoryTransactionsOrm({
      where: { inventoryId: id },
    });

    // Delete inventory
    const inventory = await deleteInventoryOrm({
      where: { id },
    });

    revalidatePath('/pim3/inventory');
    return { data: inventory, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete inventory', success: false as const };
  }
}

// Bulk inventory operations
export async function bulkUpdateInventory(
  updates: {
    id: string;
    quantity?: number;
    reserved?: number;
    lowStockThreshold?: number;
  }[],
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const results = await Promise.all(
      updates.map(async (update) => {
        const { id, ...data } = update;
        const available =
          data.quantity !== undefined && data.reserved !== undefined
            ? data.quantity - data.reserved
            : undefined;

        return updateInventoryOrm({
          where: { id },
          data: {
            ...data,
            ...(available !== undefined && { available }),
          },
        });
      }),
    );

    revalidatePath('/pim3/inventory');
    return { data: results, success: true as const };
  } catch (error) {
    return { error: 'Failed to bulk update inventory', success: false as const };
  }
}

// Get inventory analytics
export async function getInventoryAnalytics(params?: {
  startDate?: Date;
  endDate?: Date;
  locationId?: string;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { startDate, endDate, locationId } = params || {};

    const where: Prisma.InventoryWhereInput = {
      ...(locationId && { locationId }),
    };

    const transactionWhere: Prisma.InventoryTransactionWhereInput = {
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      ...(locationId && {
        inventory: { locationId },
      }),
    };

    const [
      totalItems,
      totalStock,
      totalReserved,
      totalAvailable,
      lowStockItems,
      outOfStockItems,
      locations,
      recentTransactions,
      topProducts,
    ] = await Promise.all([
      countInventoryOrm({ where }),
      aggregateInventoryOrm({
        where,
        _sum: { quantity: true },
      }).then((result) => result._sum.quantity || 0),
      aggregateInventoryOrm({
        where,
        _sum: { reserved: true },
      }).then((result) => result._sum.reserved || 0),
      aggregateInventoryOrm({
        where,
        _sum: { available: true },
      }).then((result) => result._sum.available || 0),
      countInventoryOrm({
        where: {
          ...where,
          AND: [{ lowStockThreshold: { not: null } }, { available: { lte: 10 } }],
        },
      }),
      countInventoryOrm({
        where: { ...where, available: { lte: 0 } },
      }),
      groupByInventoryOrm({
        by: ['locationId', 'locationName'],
        where,
        _count: { id: true },
        _sum: { quantity: true, available: true, reserved: true },
      }),
      findManyInventoryTransactionsOrm({
        where: transactionWhere,
        include: {
          inventory: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
              variant: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      findManyInventoryOrm({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: { quantity: 'desc' },
        take: 10,
      }),
    ]);

    const stockTurnoverRate = totalItems > 0 ? (totalStock - totalAvailable) / totalItems : 0;

    return {
      data: {
        totalItems,
        totalStock,
        totalReserved,
        totalAvailable,
        lowStockItems,
        outOfStockItems,
        stockTurnoverRate: Number(stockTurnoverRate.toFixed(2)),
        locations,
        recentTransactions,
        topProducts,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load inventory analytics', success: false as const };
  }
}

// Get low stock alerts
export async function getLowStockAlerts(locationId?: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const where: Prisma.InventoryWhereInput = {
      AND: [{ lowStockThreshold: { not: null } }, { available: { lte: 10 } }],
      ...(locationId && { locationId }),
    };

    const alerts = await findManyInventoryOrm({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { available: 'asc' },
    });

    return { data: alerts, success: true as const };
  } catch (error) {
    return { error: 'Failed to load low stock alerts', success: false as const };
  }
}

// Get inventory history/transactions
export async function getInventoryTransactions(
  inventoryId: string,
  params?: {
    page?: number;
    limit?: number;
    type?: string;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { page = 1, limit = 50, type } = params || {};
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryTransactionWhereInput = {
      inventoryId,
      ...(type && { type: type as any }),
    };

    const [transactions, total] = await Promise.all([
      findManyInventoryTransactionsOrm({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      countInventoryTransactionsOrm({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load inventory transactions', success: false as const };
  }
}
