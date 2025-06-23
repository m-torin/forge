'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server/next';
import { type Prisma, AddressType } from '@repo/database/prisma';
import {
  findManyAddressesOrm,
  countAddressesOrm,
  createAddressOrm,
  updateAddressOrm,
  deleteAddressOrm,
  deleteManyAddressesOrm,
  updateManyAddressesOrm,
  findUniqueAddressOrm,
  groupByAddressesOrm,
} from '@repo/database/prisma';

/**
 * Address management actions for PIM3
 *
 * These actions provide address management functionality:
 * - Address CRUD operations
 * - User address management
 * - Billing and shipping address handling
 * - Address validation and formatting
 * - Analytics and reporting
 */

// Get addresses with pagination and filtering
export async function getAddresses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  type?: AddressType;
  country?: string;
  isDefault?: boolean;
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
      userId,
      type,
      country,
      isDefault,
      search,
      startDate,
      endDate,
    } = params || {};

    const skip = (page - 1) * limit;

    const where: Prisma.AddressWhereInput = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { street1: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
          { postalCode: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(userId && { userId }),
      ...(type && { type }),
      ...(country && { country }),
      ...(isDefault !== undefined && { isDefault }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [addresses, total] = await Promise.all([
      findManyAddressesOrm({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        where,
      }),
      countAddressesOrm({ where }),
    ]);

    return {
      data: addresses,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load addresses', success: false as const };
  }
}

// Get a single address by ID
export async function getAddress(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const address = await findUniqueAddressOrm({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      where: { id },
    });

    if (!address) {
      return { error: 'Address not found', success: false as const };
    }

    return { data: address, success: true as const };
  } catch (error) {
    return { error: 'Failed to load address', success: false as const };
  }
}

// Create a new address
export async function createAddress(data: {
  userId: string;
  type: AddressType;
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // If this is being set as default, unset any existing default addresses of the same type for this user
    if (data.isDefault) {
      await updateManyAddressesOrm({
        where: {
          userId: data.userId,
          OR: [
            { type: data.type },
            { type: AddressType.BOTH },
            ...(data.type === AddressType.BOTH
              ? [{ type: AddressType.BILLING }, { type: AddressType.SHIPPING }]
              : []),
          ],
        },
        data: { isDefault: false },
      });
    }

    const address = await createAddressOrm({
      data: {
        userId: data.userId,
        type: data.type,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        street1: data.street1,
        street2: data.street2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault || false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath('/pim3/addresses');
    return { data: address, success: true as const };
  } catch (error) {
    return { error: 'Failed to create address', success: false as const };
  }
}

// Update an address
export async function updateAddress(
  id: string,
  data: {
    type?: AddressType;
    firstName?: string;
    lastName?: string;
    company?: string;
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    isDefault?: boolean;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Get the current address to check user
    const currentAddress = await findUniqueAddressOrm({
      where: { id },
      select: { userId: true, type: true },
    });

    if (!currentAddress) {
      return { error: 'Address not found', success: false as const };
    }

    // If this is being set as default, unset any existing default addresses of the same type for this user
    if (data.isDefault) {
      const targetType = data.type || currentAddress.type;
      await updateManyAddressesOrm({
        where: {
          userId: currentAddress.userId,
          id: { not: id }, // Exclude the current address
          OR: [
            { type: targetType },
            { type: AddressType.BOTH },
            ...(targetType === AddressType.BOTH
              ? [{ type: AddressType.BILLING }, { type: AddressType.SHIPPING }]
              : []),
          ],
        },
        data: { isDefault: false },
      });
    }

    const address = await updateAddressOrm({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.street1 && { street1: data.street1 }),
        ...(data.street2 !== undefined && { street2: data.street2 }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.postalCode && { postalCode: data.postalCode }),
        ...(data.country && { country: data.country }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath('/pim3/addresses');
    return { data: address, success: true as const };
  } catch (error) {
    return { error: 'Failed to update address', success: false as const };
  }
}

// Delete an address
export async function deleteAddress(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const address = await deleteAddressOrm({
      where: { id },
    });

    revalidatePath('/pim3/addresses');
    return { data: address, success: true as const };
  } catch (error) {
    return { error: 'Failed to delete address', success: false as const };
  }
}

// Get user's addresses
export async function getUserAddresses(
  userId: string,
  params?: {
    type?: AddressType;
    includeDefaults?: boolean;
  },
) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { type, includeDefaults = true } = params || {};

    const where: Prisma.AddressWhereInput = {
      userId,
      ...(type && { type }),
      ...(includeDefaults === false && { isDefault: false }),
    };

    const addresses = await findManyAddressesOrm({
      where,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return { data: addresses, success: true as const };
  } catch (error) {
    return { error: 'Failed to load user addresses', success: false as const };
  }
}

// Set default address
export async function setDefaultAddress(id: string) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    // Get the address to set as default
    const address = await findUniqueAddressOrm({
      where: { id },
      select: { userId: true, type: true },
    });

    if (!address) {
      return { error: 'Address not found', success: false as const };
    }

    // Unset existing default addresses of the same type for this user
    await updateManyAddressesOrm({
      where: {
        userId: address.userId,
        id: { not: id },
        OR: [
          { type: address.type },
          { type: AddressType.BOTH },
          ...(address.type === AddressType.BOTH
            ? [{ type: AddressType.BILLING }, { type: AddressType.SHIPPING }]
            : []),
        ],
      },
      data: { isDefault: false },
    });

    // Set the target address as default
    const updatedAddress = await updateAddressOrm({
      where: { id },
      data: { isDefault: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath('/pim3/addresses');
    return { data: updatedAddress, success: true as const };
  } catch (error) {
    return { error: 'Failed to set default address', success: false as const };
  }
}

// Bulk delete addresses
export async function bulkDeleteAddresses(ids: string[]) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await deleteManyAddressesOrm({
      where: { id: { in: ids } },
    });

    revalidatePath('/pim3/addresses');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to delete addresses', success: false as const };
  }
}

// Bulk update address type
export async function bulkUpdateAddressType(ids: string[], type: AddressType) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    await updateManyAddressesOrm({
      where: { id: { in: ids } },
      data: { type },
    });

    revalidatePath('/pim3/addresses');
    return { success: true as const };
  } catch (error) {
    return { error: 'Failed to update address types', success: false as const };
  }
}

// Get address analytics
export async function getAddressAnalytics(params?: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}) {
  try {
    const session = await auth.api.getSession();
    if (!session) {
      return { error: 'Unauthorized', success: false as const };
    }

    const { startDate, endDate, userId } = params || {};

    const where: Prisma.AddressWhereInput = {
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      ...(userId && { userId }),
    };

    const [
      totalAddresses,
      billingAddresses,
      shippingAddresses,
      bothTypeAddresses,
      defaultAddresses,
      uniqueUsers,
      topCountries,
      recentAddresses,
    ] = await Promise.all([
      countAddressesOrm({ where }),
      countAddressesOrm({ where: { ...where, type: AddressType.BILLING } }),
      countAddressesOrm({ where: { ...where, type: AddressType.SHIPPING } }),
      countAddressesOrm({ where: { ...where, type: AddressType.BOTH } }),
      countAddressesOrm({ where: { ...where, isDefault: true } }),
      findManyAddressesOrm({
        select: { userId: true },
        where,
        distinct: ['userId'],
      }).then((users) => users.length),
      groupByAddressesOrm({
        by: ['country'],
        where,
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10,
      }),
      findManyAddressesOrm({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 10,
        where,
      }),
    ]);

    const averageAddressesPerUser = uniqueUsers > 0 ? totalAddresses / uniqueUsers : 0;

    return {
      data: {
        totalAddresses,
        billingAddresses,
        shippingAddresses,
        bothTypeAddresses,
        defaultAddresses,
        uniqueUsers,
        averageAddressesPerUser: Number(averageAddressesPerUser.toFixed(2)),
        topCountries,
        recentAddresses,
      },
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to load address analytics', success: false as const };
  }
}

// Validate address format
export async function validateAddress(address: {
  street1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}) {
  try {
    // Basic validation - in a real app, you might integrate with a service like SmartyStreets or Google Address Validation
    const errors: string[] = [];

    if (!address.street1.trim()) {
      errors.push('Street address is required');
    }

    if (!address.city.trim()) {
      errors.push('City is required');
    }

    if (!address.state.trim()) {
      errors.push('State/Province is required');
    }

    if (!address.postalCode.trim()) {
      errors.push('Postal code is required');
    }

    if (!address.country.trim()) {
      errors.push('Country is required');
    }

    // Country-specific validation
    if (address.country === 'US') {
      const usZipRegex = /^\d{5}(-\d{4})?$/;
      if (!usZipRegex.test(address.postalCode)) {
        errors.push('Invalid US ZIP code format');
      }
    }

    if (address.country === 'CA') {
      const caPostalRegex = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;
      if (!caPostalRegex.test(address.postalCode)) {
        errors.push('Invalid Canadian postal code format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      success: true as const,
    };
  } catch (error) {
    return { error: 'Failed to validate address', success: false as const };
  }
}
