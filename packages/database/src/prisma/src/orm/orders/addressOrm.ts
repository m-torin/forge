'use server';

import type { AddressType, Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new address
 */
export async function createAddressOrm(args: Prisma.AddressCreateArgs) {
  try {
    return await prisma.address.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first address matching criteria
 */
export async function findFirstAddressOrm(args?: Prisma.AddressFindFirstArgs) {
  return await prisma.address.findFirst(args);
}

/**
 * Find unique address by ID
 */
export async function findUniqueAddressOrm(args: Prisma.AddressFindUniqueArgs) {
  return await prisma.address.findUnique(args);
}

/**
 * Find unique address or throw error if not found
 */
export async function findUniqueAddressOrmOrThrow(args: Prisma.AddressFindUniqueOrThrowArgs) {
  try {
    return await prisma.address.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Address not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many addresses with optional filtering
 */
export async function findManyAddressesOrm(args?: Prisma.AddressFindManyArgs) {
  return await prisma.address.findMany(args);
}

/**
 * Update an existing address
 */
export async function updateAddressOrm(args: Prisma.AddressUpdateArgs) {
  try {
    return await prisma.address.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Address not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many addresses matching criteria
 */
export async function updateManyAddressesOrm(args: Prisma.AddressUpdateManyArgs) {
  return await prisma.address.updateMany(args);
}

/**
 * Create or update address (upsert)
 */
export async function upsertAddressOrm(args: Prisma.AddressUpsertArgs) {
  try {
    return await prisma.address.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete an address
 */
export async function deleteAddressOrm(args: Prisma.AddressDeleteArgs) {
  try {
    return await prisma.address.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Address not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many addresses matching criteria
 */
export async function deleteManyAddressesOrm(args?: Prisma.AddressDeleteManyArgs) {
  return await prisma.address.deleteMany(args);
}

/**
 * Aggregate address data
 */
export async function aggregateAddressesOrm(args?: Prisma.AddressAggregateArgs) {
  return await prisma.address.aggregate(args ?? {});
}

/**
 * Count addresses matching criteria
 */
export async function countAddressesOrm(args?: Prisma.AddressCountArgs) {
  return await prisma.address.count(args);
}

/**
 * Group addresses by specified fields
 */
export async function groupByAddressesOrm(args: Prisma.AddressGroupByArgs) {
  return await prisma.address.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find addresses by type using AddressType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findAddressesByTypeOrm(
  type: AddressType,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: type,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find shipping addresses
 */
export async function findShippingAddressesOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'SHIPPING',
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find billing addresses
 */
export async function findBillingAddressesOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'BILLING',
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses that can be used for both shipping and billing
 */
export async function findBothTypeAddressesOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'BOTH',
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find default addresses
 */
export async function findDefaultAddressesOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isDefault: true,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find validated addresses
 */
export async function findValidatedAddressesOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isValidated: true,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find unvalidated addresses
 */
export async function findUnvalidatedAddressesOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isValidated: false,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses by country
 */
export async function findAddressesByCountryOrm(
  country: string,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      country: country,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses by state
 */
export async function findAddressesByStateOrm(
  state: string,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      state: state,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses by city
 */
export async function findAddressesByCityOrm(
  city: string,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      city: city,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses by postal code
 */
export async function findAddressesByPostalCodeOrm(
  postalCode: string,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      postalCode: postalCode,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses that have a company set (not null)
 */
export async function findAddressesWithCompanyOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      company: {
        not: null,
      },
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses that don't have a company (null)
 */
export async function findAddressesWithoutCompanyOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      company: null,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses that have a phone number set (not null)
 */
export async function findAddressesWithPhoneOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      phone: {
        not: null,
      },
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses that don't have a phone number (null)
 */
export async function findAddressesWithoutPhoneOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      phone: null,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses by user ID (leverages userId index)
 */
export async function findAddressesByUserOrm(
  userId: string,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses that have a user (not null)
 */
export async function findAddressesWithUserOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: {
        not: null,
      },
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses that don't have a user (guest addresses)
 */
export async function findAddressesWithoutUserOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: null,
    },
  };
  return await prisma.address.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// Address model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find addresses that have been used for shipping orders
 */
export async function findAddressesWithShippingOrdersOrm(
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderShippingAddresses: {
        some: {},
      },
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find addresses that have been used for billing orders
 */
export async function findAddressesWithBillingOrdersOrm(
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderBillingAddresses: {
        some: {},
      },
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find address with all relations included
 */
export async function findAddressWithAllRelationsOrm(id: string) {
  return await prisma.address.findUnique({
    where: { id },
    include: {
      user: true,
      orderShippingAddresses: true,
      orderBillingAddresses: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find active (non-deleted) addresses
 */
export async function findActiveAddressesOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: null,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find soft-deleted addresses
 */
export async function findDeletedAddressesOrm(additionalArgs?: Prisma.AddressFindManyArgs) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      deletedAt: {
        not: null,
      },
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Soft delete an address (set deletedAt)
 */
export async function softDeleteAddressOrm(id: string) {
  try {
    return await prisma.address.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Address not found for soft deletion: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Restore a soft-deleted address (clear deletedAt)
 */
export async function restoreAddressOrm(id: string) {
  try {
    return await prisma.address.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Address not found for restoration: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find addresses created after a specific date
 */
export async function findAddressesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
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
  return await prisma.address.findMany(args);
}

/**
 * Find addresses updated after a specific date
 */
export async function findAddressesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
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
  return await prisma.address.findMany(args);
}

/**
 * Find recently created or updated addresses within specified days
 */
export async function findRecentAddressesOrm(
  days: number = 7,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.AddressFindManyArgs = {
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
  return await prisma.address.findMany(args);
}

/**
 * Find addresses validated after a specific date
 */
export async function findAddressesValidatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      validatedAt: {
        gte: date,
      },
    },
    orderBy: {
      validatedAt: 'desc',
    },
  };
  return await prisma.address.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Search addresses by street address (case-insensitive contains)
 */
export async function searchAddressesByStreetOrm(
  searchTerm: string,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          street1: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          street2: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Search addresses by name (firstName or lastName)
 */
export async function searchAddressesByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          firstName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find user addresses by type and validation status (leverages userId index)
 */
export async function findUserAddressesByTypeAndValidationOrm(
  userId: string,
  type: AddressType,
  isValidated: boolean,
  additionalArgs?: Prisma.AddressFindManyArgs,
) {
  const args: Prisma.AddressFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
      type: type,
      isValidated: isValidated,
    },
  };
  return await prisma.address.findMany(args);
}

/**
 * Find user's default address by type (leverages userId index)
 */
export async function findUserDefaultAddressByTypeOrm(userId: string, type: AddressType) {
  return await prisma.address.findFirst({
    where: {
      userId: userId,
      type: type,
      isDefault: true,
      deletedAt: null,
    },
  });
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Address with user relation
 */
export type AddressWithUser = Prisma.AddressGetPayload<{
  include: { user: true };
}>;

/**
 * Address with shipping orders relation
 */
export type AddressWithShippingOrders = Prisma.AddressGetPayload<{
  include: { orderShippingAddresses: true };
}>;

/**
 * Address with billing orders relation
 */
export type AddressWithBillingOrders = Prisma.AddressGetPayload<{
  include: { orderBillingAddresses: true };
}>;

/**
 * Address with all relations for complete data access
 */
export type AddressWithAllRelations = Prisma.AddressGetPayload<{
  include: {
    user: true;
    orderShippingAddresses: true;
    orderBillingAddresses: true;
  };
}>;

/**
 * Address search result type for optimized queries
 */
export type AddressSearchResult = Prisma.AddressGetPayload<{
  select: {
    id: true;
    type: true;
    isDefault: true;
    firstName: true;
    lastName: true;
    company: true;
    street1: true;
    street2: true;
    city: true;
    state: true;
    postalCode: true;
    country: true;
    isValidated: true;
    userId: true;
    _count: {
      select: {
        orderShippingAddresses: true;
        orderBillingAddresses: true;
      };
    };
  };
}>;
