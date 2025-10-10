import { getDefaultClientSync } from '../../node/index';
import type {
  User,
  UserCreateInput,
  UserInclude,
  UserOrderByWithRelationInput,
  UserUpdateInput,
  UserWhereInput,
  UserWhereUniqueInput,
} from '../types/auth';
import type { AnyPrismaClient, PaginatedResult, PaginationOptions } from '../types/shared';
import { pagination } from '../utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Universal operation executor for User operations
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
    | 'deleteMany',
  params: {
    where?: UserWhereInput | UserWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: UserOrderByWithRelationInput;
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

  return await (prisma.user as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

/**
 * Create a new user
 */
export async function createUserOrm(
  data: UserCreateInput,
  prisma?: AnyPrismaClient,
): Promise<User> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

/**
 * Find first user matching criteria
 */
export async function findFirstUserOrm(
  where?: UserWhereInput,
  include?: UserInclude,
  prisma?: AnyPrismaClient,
): Promise<User | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

/**
 * Find unique user by ID or unique field
 */
export async function findUniqueUserOrm(
  where: UserWhereUniqueInput,
  include?: UserInclude,
  prisma?: AnyPrismaClient,
): Promise<User | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

/**
 * Find many users with filtering, sorting, and pagination
 */
export async function findManyUsersOrm(
  where?: UserWhereInput,
  orderBy?: UserOrderByWithRelationInput,
  include?: UserInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<User>> {
  const client = prisma || getDefaultClientSync();

  const { skip, take, page, pageSize } = pagination.getOffsetLimit(paginationOptions || {});

  const [data, total] = await Promise.all([
    executeOperation<User[]>(client, 'findMany', {
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
 * Update a user
 */
export async function updateUserOrm(
  where: UserWhereUniqueInput,
  data: UserUpdateInput,
  include?: UserInclude,
  prisma?: AnyPrismaClient,
): Promise<User> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

/**
 * Delete a user
 */
export async function deleteUserOrm(
  where: UserWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<User> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

/**
 * Count users
 */
export async function countUsersOrm(
  where?: UserWhereInput,
  prisma?: AnyPrismaClient,
): Promise<number> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

/**
 * Find user with authentication context (accounts, sessions, etc.)
 */
export async function findUserWithAuthOrm(
  where: UserWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<User | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', {
    where,
    include: {
      accounts: true,
      sessions: true,
      apiKeys: true,
      twoFactor: {
        include: {
          backupCodes: true,
        },
      },
      passkeys: true,
    },
  });
}

/**
 * Find user with organization memberships
 */
export async function findUserWithMembershipsOrm(
  where: UserWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<User | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', {
    where,
    include: {
      members: {
        include: {
          organization: true,
        },
      },
      teamMembers: {
        include: {
          team: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Find users by email domain
 */
export async function findUsersByEmailDomainOrm(
  domain: string,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<User>> {
  return findManyUsersOrm(
    {
      email: {
        endsWith: `@${domain}`,
      },
    },
    { createdAt: 'desc' },
    undefined,
    paginationOptions,
    prisma,
  );
}
