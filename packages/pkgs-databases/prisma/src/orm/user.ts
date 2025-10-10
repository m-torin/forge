import type { PrismaClient, User } from '../../generated/client/client';
import type {
  UserOrderByWithRelationInput,
  UserUpdateManyMutationInput,
  UserWhereInput,
  UserWhereUniqueInput,
} from '../../generated/client/models';
import type { BatchPayload } from '../../generated/edge/internal/prismaNamespace';
import {
  userInclude,
  userOrderBy,
  userSelect,
  userValidation,
  userWhere,
  type UserBasic,
  type UserMinimal,
  type UserWithPostCount,
  type UserWithPosts,
} from './fragments';
import { deleteGeneric, existsGeneric } from './shared-operations';
import type { PaginatedResult, PaginationOptions, PrismaTransactionClient } from './types';
import { pagination, validation } from './utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Universal user operation executor with intelligent parameter handling
 */
async function executeUserOperation<T = any>(
  prisma: PrismaClient | PrismaTransactionClient,
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

  // Handle where clauses
  if (params.where) args.where = params.where;

  // Handle data with optional validation
  if (params.data) {
    if (
      params.validate &&
      (operation === 'create' || operation === 'update' || operation === 'upsert')
    ) {
      const validated = validation.validateUserInput(params.data);
      if (!validated.success) {
        throw new Error(`Validation failed: ${validated.errors.join(', ')}`);
      }
      args.data =
        operation === 'create'
          ? userValidation.createInput(validated.sanitized!)
          : userValidation.updateInput(validated.sanitized!);
    } else {
      args.data = params.data;
    }
  }

  // Handle upsert-specific create/update
  if (params.create) {
    if (params.validate) {
      const validated = validation.validateUserInput(params.create);
      if (!validated.success) {
        throw new Error(`Create validation failed: ${validated.errors.join(', ')}`);
      }
      args.create = userValidation.createInput(validated.sanitized!);
    } else {
      args.create = params.create;
    }
  }
  if (params.update) {
    args.update = params.validate ? userValidation.updateInput(params.update) : params.update;
  }

  // Handle select/include (mutually exclusive)
  if (params.include) {
    args.include = params.include;
  } else if (params.select) {
    args.select = params.select;
  }

  // Handle query modifiers for findMany
  if (operation === 'findMany') {
    if (params.orderBy) args.orderBy = params.orderBy;
    if (params.skip !== undefined) args.skip = params.skip;
    if (params.take !== undefined) args.take = Math.min(params.take, 100); // Cap at 100
  }

  return (prisma.user as any)[operation](args);
}

/**
 * Smart pagination helper that works with any find operation
 */
async function executeWithPagination<T>(
  prisma: PrismaClient | PrismaTransactionClient,
  options: PaginationOptions & {
    where?: UserWhereInput;
    orderBy?: UserOrderByWithRelationInput;
    select?: any;
    include?: any;
  } = {},
): Promise<PaginatedResult<T>> {
  const { skip, take, page, pageSize } = pagination.getOffsetLimit(options);

  const [items, total] = await Promise.all([
    executeUserOperation<T[]>(prisma, 'findMany', {
      where: options.where,
      orderBy: options.orderBy || userOrderBy.newest,
      select: options.select,
      include: options.include,
      skip,
      take,
    }),
    executeUserOperation<number>(prisma, 'count', { where: options.where }),
  ]);

  return pagination.createPaginatedResult(items, total, { page, pageSize });
}

/**
 * Intelligent where clause combination
 */
function buildSmartWhere(
  baseWhere?: UserWhereInput,
  additionalWhere?: UserWhereInput,
): UserWhereInput | undefined {
  if (!baseWhere && !additionalWhere) return undefined;
  if (!baseWhere) return additionalWhere;
  if (!additionalWhere) return baseWhere;
  return { AND: [baseWhere, additionalWhere] };
}

// ==================== USER ORM FUNCTIONS ====================

/**
 * Create a new user with validation
 */
export async function createUser(
  prisma: PrismaClient | PrismaTransactionClient,
  data: { email: string; name?: string },
): Promise<User> {
  return executeUserOperation<User>(prisma, 'create', {
    data,
    validate: true,
  });
}

/**
 * Find user by ID with optimized select
 */
export async function find(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<UserBasic | null> {
  return executeUserOperation<UserBasic | null>(prisma, 'findUnique', {
    where: { id },
    select: userSelect.basic,
  });
}

/**
 * Find minimal user by ID (for references)
 */
export async function findUserByIdMinimal(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<UserMinimal | null> {
  return executeUserOperation<UserMinimal | null>(prisma, 'findUnique', {
    where: { id },
    select: userSelect.minimal,
  });
}

/**
 * Find user by email with validation
 */
export async function findUserByEmail(
  prisma: PrismaClient | PrismaTransactionClient,
  email: string,
): Promise<UserBasic | null> {
  if (!validation.isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  return executeUserOperation<UserBasic | null>(prisma, 'findUnique', {
    where: userWhere.withEmail(email.toLowerCase()),
    select: userSelect.basic,
  });
}

/**
 * Find user with posts using optimized include
 */
export async function findUserByIdWithPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<UserWithPosts | null> {
  return executeUserOperation<UserWithPosts | null>(prisma, 'findUnique', {
    where: { id },
    include: userInclude.withPosts,
  });
}

/**
 * Find user with published posts only
 */
export async function findUserByIdWithPublishedPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<UserWithPosts | null> {
  return executeUserOperation<UserWithPosts | null>(prisma, 'findUnique', {
    where: { id },
    include: userInclude.withPublishedPosts,
  });
}

/**
 * Find user with post count
 */
export async function findUserByIdWithPostCount(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<UserWithPostCount | null> {
  return executeUserOperation<UserWithPostCount | null>(prisma, 'findUnique', {
    where: { id },
    select: userSelect.withPostCount,
  });
}

/**
 * Find many users with pagination
 */
export async function findManyUsers(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    where?: UserWhereInput;
    orderBy?: UserOrderByWithRelationInput;
    select?: typeof userSelect.basic | typeof userSelect.minimal | typeof userSelect.withPostCount;
  },
): Promise<PaginatedResult<UserBasic>> {
  return executeWithPagination<UserBasic>(prisma, {
    ...options,
    select: options?.select || userSelect.basic,
  });
}

/**
 * Find users with published posts
 */
export async function findUsersWithPublishedPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions,
): Promise<PaginatedResult<UserBasic>> {
  return executeWithPagination<UserBasic>(prisma, {
    ...options,
    where: userWhere.withPublishedPosts,
    select: userSelect.basic,
  });
}

/**
 * Count users with optional filtering
 */
export async function countUsers(prisma: PrismaClient, where?: UserWhereInput): Promise<number> {
  return executeUserOperation<number>(prisma, 'count', { where });
}

/**
 * Update user by ID with validation
 */
export async function update(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  data: { email?: string; name?: string },
): Promise<UserBasic> {
  return executeUserOperation<UserBasic>(prisma, 'update', {
    where: { id },
    data: userValidation.updateInput(data),
    select: userSelect.basic,
  });
}

/**
 * Update user by email with validation
 */
export async function updateUserByEmail(
  prisma: PrismaClient | PrismaTransactionClient,
  email: string,
  data: { email?: string; name?: string },
): Promise<UserBasic> {
  if (!validation.isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  return executeUserOperation<UserBasic>(prisma, 'update', {
    where: { email: email.toLowerCase() },
    data: userValidation.updateInput(data),
    select: userSelect.basic,
  });
}

/**
 * Update many users
 */
export async function updateManyUsers(
  prisma: PrismaClient | PrismaTransactionClient,
  where: UserWhereInput,
  data: UserUpdateManyMutationInput,
): Promise<BatchPayload> {
  return executeUserOperation<BatchPayload>(prisma, 'updateMany', { where, data });
}

/**
 * Upsert user (create or update) with validation
 */
export async function upsertUser(
  prisma: PrismaClient | PrismaTransactionClient,
  where: UserWhereUniqueInput,
  create: { email: string; name?: string },
  update: { email?: string; name?: string },
): Promise<UserBasic> {
  return executeUserOperation<UserBasic>(prisma, 'upsert', {
    where,
    create,
    update,
    validate: true,
    select: userSelect.basic,
  });
}

/**
 * Upsert user by email with validation
 */
export async function upsertUserByEmail(
  prisma: PrismaClient | PrismaTransactionClient,
  email: string,
  create: { name?: string },
  update: { email?: string; name?: string },
): Promise<UserBasic> {
  if (!validation.isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  return executeUserOperation<UserBasic>(prisma, 'upsert', {
    where: { email: email.toLowerCase() },
    create: { email, ...create },
    update,
    validate: true,
    select: userSelect.basic,
  });
}

/**
 * Delete user by ID
 */
export async function deleteById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<UserBasic> {
  return deleteGeneric(prisma.user as any, { where: { id }, select: userSelect.basic });
}

/**
 * Delete user by email with validation
 */
export async function deleteUserByEmail(
  prisma: PrismaClient | PrismaTransactionClient,
  email: string,
): Promise<UserBasic> {
  if (!validation.isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  return deleteGeneric(prisma.user as any, {
    where: { email: email.toLowerCase() },
    select: userSelect.basic,
  });
}

/**
 * Delete many users
 */
export async function deleteManyUsers(
  prisma: PrismaClient | PrismaTransactionClient,
  where: UserWhereInput,
): Promise<BatchPayload> {
  return executeUserOperation<BatchPayload>(prisma, 'deleteMany', { where });
}

/**
 * Check if user exists by ID
 */
export async function userExistsById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<boolean> {
  return existsGeneric(prisma.user as any, { where: { id }, select: { id: true } });
}

/**
 * Check if user exists by email with validation
 */
export async function userExistsByEmail(
  prisma: PrismaClient | PrismaTransactionClient,
  email: string,
): Promise<boolean> {
  if (!validation.isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const user = await executeUserOperation<{ id: string } | null>(prisma, 'findUnique', {
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return !!user;
}

/**
 * Get users with post count (optimized)
 */
export async function findManyUsersWithPostCount(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: {
    where?: UserWhereInput;
    orderBy?: UserOrderByWithRelationInput;
    skip?: number;
    take?: number;
  },
): Promise<UserWithPostCount[]> {
  return executeUserOperation<UserWithPostCount[]>(prisma, 'findMany', {
    where: options?.where,
    orderBy: options?.orderBy || userOrderBy.newest,
    skip: options?.skip,
    take: options?.take || 20,
    select: userSelect.withPostCount,
  });
}

/**
 * Find users with published posts only (optimized)
 */
export async function findManyUsersWithPublishedPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: {
    where?: UserWhereInput;
    orderBy?: UserOrderByWithRelationInput;
    skip?: number;
    take?: number;
  },
): Promise<UserWithPosts[]> {
  return executeUserOperation<UserWithPosts[]>(prisma, 'findMany', {
    where: options?.where,
    orderBy: options?.orderBy || userOrderBy.newest,
    skip: options?.skip,
    take: options?.take || 20,
    include: userInclude.withPublishedPosts,
  });
}

/**
 * Verify user's email address
 */
export async function verifyEmail(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<UserBasic> {
  return executeUserOperation<UserBasic>(prisma, 'update', {
    where: { id },
    data: { emailVerified: true },
    select: userSelect.basic,
  });
}

/**
 * Activate user account (remove ban)
 */
export async function activate(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<UserBasic> {
  return executeUserOperation<UserBasic>(prisma, 'update', {
    where: { id },
    data: {
      banned: false,
      banReason: null,
      banExpires: null,
    },
    select: userSelect.basic,
  });
}

/**
 * Deactivate user account (ban with optional reason and expiration)
 */
export async function deactivate(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  reason?: string,
  expiresAt?: Date,
): Promise<UserBasic> {
  return executeUserOperation<UserBasic>(prisma, 'update', {
    where: { id },
    data: {
      banned: true,
      banReason: reason || null,
      banExpires: expiresAt || null,
    },
    select: userSelect.basic,
  });
}
