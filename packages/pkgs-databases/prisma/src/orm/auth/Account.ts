import { getDefaultClientSync } from '../../node/index';
import type {
  Account,
  AccountCreateInput,
  AccountInclude,
  AccountOrderByWithRelationInput,
  AccountUpdateInput,
  AccountWhereInput,
  AccountWhereUniqueInput,
} from '../types/auth';
import type { AnyPrismaClient, PaginatedResult, PaginationOptions } from '../types/shared';
import { pagination } from '../utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Universal operation executor for Account operations
 */
async function executeOperation<T = any>(
  prisma: AnyPrismaClient,
  operation:
    | 'findUnique'
    | 'findFirst'
    | 'findMany'
    | 'create'
    | 'update'
    | 'delete'
    | 'count'
    | 'upsert'
    | 'createMany'
    | 'updateMany'
    | 'deleteMany'
    | 'aggregate'
    | 'groupBy',
  params: {
    where?: AccountWhereInput | AccountWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: AccountOrderByWithRelationInput;
    skip?: number;
    take?: number;
    create?: any;
    update?: any;
    validate?: boolean;
  } = {},
): Promise<T> {
  const args: any = {};

  if (params.where) args.where = params.where;
  if (params.data) args.data = params.data;
  if (params.select) args.select = params.select;
  if (params.include) args.include = params.include;
  if (params.orderBy) args.orderBy = params.orderBy;
  if (params.skip !== undefined) args.skip = params.skip;
  if (params.take !== undefined) args.take = params.take;
  if (params.create) args.create = params.create;
  if (params.update) args.update = params.update;

  if (params.validate !== false) {
    // Note: Validation is handled at the application layer
  }

  return await (prisma.account as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

/**
 * Create a new account
 */
export async function createAccountOrm(
  data: AccountCreateInput,
  prisma?: AnyPrismaClient,
): Promise<Account> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

/**
 * Find first account matching criteria
 */
export async function findFirstAccountOrm(
  where?: AccountWhereInput,
  include?: AccountInclude,
  prisma?: AnyPrismaClient,
): Promise<Account | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

/**
 * Find unique account by ID or unique field
 */
export async function findUniqueAccountOrm(
  where: AccountWhereUniqueInput,
  include?: AccountInclude,
  prisma?: AnyPrismaClient,
): Promise<Account | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

/**
 * Find many accounts with filtering, sorting, and pagination
 */
export async function findManyAccountsOrm(
  where?: AccountWhereInput,
  orderBy?: AccountOrderByWithRelationInput,
  include?: AccountInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Account>> {
  const client = prisma || getDefaultClientSync();

  const { skip, take, page, pageSize } = pagination.getOffsetLimit(paginationOptions || {});

  const [data, total] = await Promise.all([
    executeOperation<Account[]>(client, 'findMany', {
      where,
      orderBy,
      include,
      skip,
      take,
    }),
    executeOperation<number>(client, 'count', { where }),
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrevious: page > 1,
    },
  };
}

/**
 * Update an account
 */
export async function updateAccountOrm(
  where: AccountWhereUniqueInput,
  data: AccountUpdateInput,
  include?: AccountInclude,
  prisma?: AnyPrismaClient,
): Promise<Account> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

/**
 * Update many accounts
 */
export async function updateManyAccountsOrm(
  where: AccountWhereInput,
  data: AccountUpdateInput,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'updateMany', { where, data });
}

/**
 * Upsert an account
 */
export async function upsertAccountOrm(
  where: AccountWhereUniqueInput,
  create: AccountCreateInput,
  update: AccountUpdateInput,
  include?: AccountInclude,
  prisma?: AnyPrismaClient,
): Promise<Account> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'upsert', { where, create, update, include });
}

/**
 * Delete an account
 */
export async function deleteAccountOrm(
  where: AccountWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Account> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

/**
 * Delete many accounts
 */
export async function deleteManyAccountsOrm(
  where: AccountWhereInput,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'deleteMany', { where });
}

/**
 * Count accounts
 */
export async function countAccountsOrm(
  where?: AccountWhereInput,
  prisma?: AnyPrismaClient,
): Promise<number> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', { where });
}

/**
 * Aggregate account data
 */
export async function aggregateAccountsOrm(
  where?: AccountWhereInput,
  prisma?: AnyPrismaClient,
): Promise<any> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'aggregate', { where });
}

/**
 * Group by accounts
 */
export async function groupByAccountsOrm(
  where?: AccountWhereInput,
  prisma?: AnyPrismaClient,
): Promise<any> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'groupBy', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

/**
 * Find accounts by user ID
 */
export async function findAccountsByUserIdOrm(
  userId: string,
  include?: AccountInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Account>> {
  return findManyAccountsOrm({ userId }, { createdAt: 'desc' }, include, paginationOptions, prisma);
}

/**
 * Find account by provider and provider account ID
 */
export async function findAccountByProviderOrm(
  provider: string,
  providerAccountId: string,
  include?: AccountInclude,
  prisma?: AnyPrismaClient,
): Promise<Account | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: {
      providerId: provider,
      accountId: providerAccountId,
    },
    include,
  });
}

/**
 * Find accounts by provider type
 */
export async function findAccountsByProviderOrm(
  provider: string,
  include?: AccountInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Account>> {
  return findManyAccountsOrm(
    { providerId: provider },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find accounts by account type
 * Note: Account model doesn't have a type field, this function is deprecated
 */
export async function findAccountsByTypeOrm(
  _type: string,
  include?: AccountInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Account>> {
  // Return all accounts since type field doesn't exist
  return findManyAccountsOrm({}, { createdAt: 'desc' }, include, paginationOptions, prisma);
}

/**
 * Find OAuth accounts (accounts with access tokens)
 */
export async function findOAuthAccountsOrm(
  include?: AccountInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Account>> {
  return findManyAccountsOrm(
    {
      accessToken: { not: null },
    },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find email accounts
 */
export async function findEmailAccountsOrm(
  include?: AccountInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Account>> {
  return findManyAccountsOrm(
    {
      password: { not: null },
    },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find accounts with expired tokens that need refresh
 */
export async function findAccountsWithExpiredTokensOrm(
  include?: AccountInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Account>> {
  return findManyAccountsOrm(
    {
      accessTokenExpiresAt: {
        lt: new Date(),
      },
      refreshToken: {
        not: null,
      },
    },
    { accessTokenExpiresAt: 'asc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Update account tokens after refresh
 */
export async function updateAccountTokensOrm(
  where: AccountWhereUniqueInput,
  tokens: {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: Date;
  },
  prisma?: AnyPrismaClient,
): Promise<Account> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: tokens,
  });
}

/**
 * Delete accounts for a specific provider
 */
export async function deleteAccountsByProviderOrm(
  provider: string,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'deleteMany', {
    where: { providerId: provider },
  });
}

/**
 * Find user's account for a specific provider
 */
export async function findUserAccountByProviderOrm(
  userId: string,
  provider: string,
  include?: AccountInclude,
  prisma?: AnyPrismaClient,
): Promise<Account | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: {
      userId,
      providerId: provider,
    },
    include,
  });
}
