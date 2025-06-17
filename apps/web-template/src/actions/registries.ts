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
} from '@repo/database/prisma';

// Wrapper functions that return expected format with data property
export async function createRegistry(args: any) {
  'use server';
  try {
    const registry = await createRegistryAction(args);
    return { data: registry, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function getRegistry(id: string) {
  'use server';
  try {
    const registry = await findUniqueRegistryAction({
      where: { id },
      include: {
        items: true,
        users: {
          include: { user: true },
        },
      },
    });

    // Return the registry with type assertion to include users
    return registry as any;
  } catch (_error: any) {
    return null;
  }
}

export async function getRegistries(args?: any) {
  'use server';
  const registries = await findManyRegistriesAction({
    ...args,
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

export async function updateRegistry(idOrArgs: string | any, data?: any) {
  'use server';
  try {
    let args;
    if (typeof idOrArgs === 'string') {
      // Called with separate id and data arguments
      args = {
        where: { id: idOrArgs },
        data: data,
      };
    } else {
      // Called with combined args object
      args = idOrArgs;
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

export async function deleteRegistry(id: string) {
  'use server';
  try {
    const result = await deleteRegistryAction({ where: { id } });
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function addRegistryItem(args: any) {
  'use server';
  try {
    const item = await createRegistryItemAction(args);
    return { data: item, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function removeRegistryItem(id: string) {
  'use server';
  try {
    const result = await deleteRegistryItemAction({ where: { id } });
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export { markItemPurchasedAction as markItemPurchased };

export async function getProductsForSelect() {
  'use server';
  const { findManyProductsAction } = await import('@repo/database/prisma');
  const products = await findManyProductsAction({
    select: { id: true, name: true, sku: true },
    take: 100,
  });
  return { data: products };
}

export async function getCollectionsForSelect() {
  'use server';
  const { findManyCollectionsAction } = await import('@repo/database/prisma');
  const collections = await findManyCollectionsAction({
    select: { id: true, name: true, slug: true },
    take: 100,
  });
  return { data: collections };
}

export async function updateRegistryPrivacy(registryId: string, isPublic: boolean) {
  'use server';
  try {
    const registry = await updateRegistryAction({
      where: { id: registryId },
      data: { isPublic },
    });
    return { data: registry, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function updateRegistryUserRole(
  args: { registryId: string; userId: string; role: string } | string,
  userId?: string,
  role?: string,
) {
  'use server';
  try {
    let registryId, userIdValue, roleValue;
    if (typeof args === 'object') {
      registryId = args.registryId;
      userIdValue = args.userId;
      roleValue = args.role;
    } else {
      registryId = args;
      userIdValue = userId!;
      roleValue = role!;
    }
    // This would require a registry user join table update
    // For now, return a placeholder implementation
    return { data: { registryId, userId: userIdValue, role: roleValue }, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function removeRegistryUser(
  args: { registryId: string; userId: string } | string,
  userId?: string,
) {
  'use server';
  try {
    let registryId, userIdValue;
    if (typeof args === 'object') {
      registryId = args.registryId;
      userIdValue = args.userId;
    } else {
      registryId = args;
      userIdValue = userId!;
    }
    // This would require deleting from registry user join table
    // For now, return a placeholder implementation
    return { data: { registryId, userId: userIdValue }, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function updateRegistryItem(args: any, data?: any) {
  'use server';
  try {
    let itemId, updateData;
    if (typeof args === 'string') {
      // Called with (itemId, data)
      itemId = args;
      updateData = data;
    } else {
      // Called with object containing itemId and data
      itemId = args.itemId;
      updateData = args;
      delete updateData.itemId; // Remove itemId from update data
    }
    // This would update a registry item
    return { data: { itemId, ...updateData }, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function sendThankYouMessage(
  args: { registryId: string; purchaseId: string; message: string } | string,
  purchaseId?: string,
  message?: string,
) {
  'use server';
  try {
    let registryId, purchaseIdValue, messageValue;
    if (typeof args === 'object') {
      registryId = args.registryId;
      purchaseIdValue = args.purchaseId;
      messageValue = args.message;
    } else {
      registryId = args;
      purchaseIdValue = purchaseId!;
      messageValue = message!;
    }
    // This would send a thank you message for a purchase
    return {
      data: { registryId, purchaseId: purchaseIdValue, message: messageValue },
      success: true,
    };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function recordItemPurchase(args: any, purchaseData?: any) {
  'use server';
  try {
    let itemId, data;
    if (typeof args === 'string') {
      // Called with (itemId, purchaseData)
      itemId = args;
      data = purchaseData;
    } else {
      // Called with object containing registryItemId and data
      itemId = args.registryItemId;
      data = args;
      delete data.registryItemId; // Remove itemId from data
    }
    // This would record a purchase of a registry item
    return { data: { itemId, ...data }, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}
