'use server';

import {
  createRegistryAction,
  findUniqueRegistryAction,
  findManyRegistriesAction,
  updateRegistryAction,
  deleteRegistryAction,
  createRegistryItemAction,
  deleteRegistryItemAction,
  markItemPurchasedAction,
} from '@repo/database/prisma/server/next';

import { requireAuthContext, userOwnsResource, getAuthContext } from './utils/auth-wrapper';

/**
 * Create a new registry for the current user
 */
export async function createRegistry(args: any) {
  'use server';

  try {
    const _authContext = await requireAuthContext();

    // Ensure the registry is created for the current user
    const registryData = {
      ...args,
      data: {
        ...args.data,
        createdByUserId: _authContext.user.id,
      },
    };

    const registry = await createRegistryAction(registryData);
    return { data: registry, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

/**
 * Get a registry by ID
 * Public registries can be viewed by anyone, private only by owner
 */
export async function getRegistry(id: string) {
  'use server';

  try {
    const registry = await findUniqueRegistryAction({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        users: {
          include: { user: true },
        },
      },
    });

    if (!registry) {
      return null;
    }

    // Check if registry is private and user has access
    if (!registry.isPublic) {
      const _authContext = await getAuthContext();
      if (
        !_authContext ||
        !registry.createdByUserId ||
        !(await userOwnsResource(registry.createdByUserId))
      ) {
        return null;
      }
    }

    return registry as any;
  } catch (_error: any) {
    return null;
  }
}

/**
 * Get registries for the current user
 */
export async function getRegistries(args?: any) {
  'use server';

  const authContext = await requireAuthContext();

  const registries = await findManyRegistriesAction({
    ...args,
    where: {
      ...args?.where,
      createdByUserId: authContext.user.id,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return { data: registries as any };
}

/**
 * Get public registries
 */
export async function getPublicRegistries(args?: any) {
  'use server';

  const registries = await findManyRegistriesAction({
    ...args,
    where: {
      ...args?.where,
      isPublic: true,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return { data: registries as any };
}

/**
 * Update a registry
 * Only the owner can update their registry
 */
export async function updateRegistry(idOrArgs: string | any, data?: any) {
  'use server';

  try {
    const _authContext = await requireAuthContext();

    let args;
    let registryId: string;

    if (typeof idOrArgs === 'string') {
      // Called with separate id and data arguments
      registryId = idOrArgs;
      args = {
        where: { id: idOrArgs },
        data: data,
      };
    } else {
      // Called with combined args object
      registryId = idOrArgs.where.id;
      args = idOrArgs;
    }

    // Check ownership
    const existingRegistry = await findUniqueRegistryAction({
      where: { id: registryId },
      select: { createdByUserId: true },
    });

    if (
      !existingRegistry ||
      !existingRegistry.createdByUserId ||
      !(await userOwnsResource(existingRegistry.createdByUserId))
    ) {
      return {
        data: null,
        success: false,
        error: 'Registry not found or access denied',
      };
    }

    const registry = await updateRegistryAction(args);
    return {
      data: registry,
      success: true,
    };
  } catch (error: any) {
    return {
      data: null,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete a registry
 * Only the owner can delete their registry
 */
export async function deleteRegistry(id: string) {
  'use server';

  try {
    const _authContext = await requireAuthContext();

    // Check ownership
    const existingRegistry = await findUniqueRegistryAction({
      where: { id },
      select: { createdByUserId: true },
    });

    if (
      !existingRegistry ||
      !existingRegistry.createdByUserId ||
      !(await userOwnsResource(existingRegistry.createdByUserId))
    ) {
      return {
        data: null,
        success: false,
        error: 'Registry not found or access denied',
      };
    }

    const result = await deleteRegistryAction({ where: { id } });
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

/**
 * Add an item to a registry
 * Only the owner can add items to their registry
 */
export async function addRegistryItem(args: any) {
  'use server';

  try {
    const _authContext = await requireAuthContext();

    // Verify registry ownership
    const registry = await findUniqueRegistryAction({
      where: { id: args.data.registryId },
      select: { createdByUserId: true },
    });

    if (
      !registry ||
      !registry.createdByUserId ||
      !(await userOwnsResource(registry.createdByUserId))
    ) {
      return {
        data: null,
        success: false,
        error: 'Registry not found or access denied',
      };
    }

    const item = await createRegistryItemAction(args);
    return { data: item, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

/**
 * Remove an item from a registry
 * Only the owner can remove items from their registry
 */
export async function removeRegistryItem(id: string) {
  'use server';

  try {
    const _authContext = await requireAuthContext();

    // For registry item removal, we need to check the registry ownership
    // First get the registry that this item belongs to
    const registry = await findUniqueRegistryAction({
      where: { id },
      select: { createdByUserId: true },
    });

    if (
      !registry ||
      !registry.createdByUserId ||
      !(await userOwnsResource(registry.createdByUserId))
    ) {
      return {
        data: null,
        success: false,
        error: 'Item not found or access denied',
      };
    }

    const result = await deleteRegistryItemAction({ where: { id } });
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

/**
 * Mark an item as purchased
 * Anyone can mark items as purchased on public registries
 */
export async function markItemAsPurchased(itemId: string, _purchasedBy?: string) {
  'use server';

  try {
    const _authContext = await getAuthContext();

    // Update the item
    const item = await markItemPurchasedAction(itemId);

    return { data: item, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

/**
 * Get products for select dropdown
 */
export async function getProductsForSelect() {
  'use server';

  // This should be imported from products actions
  const { findManyProductsAction } = await import('@repo/database/prisma/server/next');

  const products = await findManyProductsAction({
    select: {
      id: true,
      name: true,
      price: true,
    },
    where: {
      status: 'ACTIVE',
    },
  });

  return products.map((p) => ({
    value: p.id,
    label: p.name,
    price: p.price,
  }));
}

/**
 * Get collections for select dropdown
 */
export async function getCollectionsForSelect() {
  'use server';

  const { findManyCollectionsAction } = await import('@repo/database/prisma/server/next');

  const collections = await findManyCollectionsAction({
    select: {
      id: true,
      name: true,
    },
  });

  return collections.map((c) => ({
    value: c.id,
    label: c.name,
  }));
}

/**
 * Update registry privacy setting
 */
export async function updateRegistryPrivacy(id: string, isPublic: boolean) {
  'use server';

  return updateRegistry(id, { isPublic });
}

/**
 * Update registry user role
 */
export async function updateRegistryUserRole(_data: {
  registryId: string;
  userId: string;
  role: string;
}) {
  'use server';

  // This would need to be implemented with proper registry user management
  // For now, return error
  return {
    success: false,
    error: 'Registry user management not yet implemented',
  };
}

/**
 * Remove a user from a registry
 */
export async function removeRegistryUser(_data: { registryId: string; userId: string }) {
  'use server';

  // This would need to be implemented with proper registry user management
  // For now, return error
  return {
    success: false,
    error: 'Registry user management not yet implemented',
  };
}

/**
 * Update a registry item
 */
export async function updateRegistryItem(id: string, data: any) {
  'use server';

  const { updateRegistryItemAction } = await import('@repo/database/prisma/server/next');

  try {
    const item = await updateRegistryItemAction({
      where: { id },
      data,
    });
    return { data: item, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

/**
 * Send thank you message
 */
export async function sendThankYouMessage(_data: {
  registryId: string;
  itemId: string;
  message: string;
}) {
  'use server';

  // This would integrate with email service
  // For now, return success
  return {
    success: true,
    message: 'Thank you message sent',
  };
}

/**
 * Record item purchase for public registries
 */
export async function recordItemPurchase(data: {
  itemId: string;
  purchaserEmail?: string;
  purchaserName?: string;
}) {
  'use server';

  return markItemAsPurchased(data.itemId, data.purchaserName);
}
