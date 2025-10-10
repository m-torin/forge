import { getDefaultClientSync } from '../../node/index';
import type {
  Session,
  SessionCreateInput,
  SessionInclude,
  SessionOrderByWithRelationInput,
  SessionUpdateInput,
  SessionWhereInput,
  SessionWhereUniqueInput,
} from '../types/auth';
import type { AnyPrismaClient, PaginatedResult, PaginationOptions } from '../types/shared';
import { pagination } from '../utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Universal operation executor for Session operations
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
    where?: SessionWhereInput | SessionWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: SessionOrderByWithRelationInput;
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

  return await (prisma.session as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

/**
 * Create a new session
 */
export async function createSessionOrm(
  data: SessionCreateInput,
  prisma?: AnyPrismaClient,
): Promise<Session> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

/**
 * Find first session matching criteria
 */
export async function findFirstSessionOrm(
  where?: SessionWhereInput,
  include?: SessionInclude,
  prisma?: AnyPrismaClient,
): Promise<Session | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

/**
 * Find unique session by ID or unique field
 */
export async function findUniqueSessionOrm(
  where: SessionWhereUniqueInput,
  include?: SessionInclude,
  prisma?: AnyPrismaClient,
): Promise<Session | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

/**
 * Find many sessions with filtering, sorting, and pagination
 */
export async function findManySessionsOrm(
  where?: SessionWhereInput,
  orderBy?: SessionOrderByWithRelationInput,
  include?: SessionInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Session>> {
  const client = prisma || getDefaultClientSync();

  const { skip, take, page, pageSize } = pagination.getOffsetLimit(paginationOptions || {});

  const [data, total] = await Promise.all([
    executeOperation<Session[]>(client, 'findMany', {
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
 * Update a session
 */
export async function updateSessionOrm(
  where: SessionWhereUniqueInput,
  data: SessionUpdateInput,
  include?: SessionInclude,
  prisma?: AnyPrismaClient,
): Promise<Session> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

/**
 * Update many sessions
 */
export async function updateManySessionsOrm(
  where: SessionWhereInput,
  data: SessionUpdateInput,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'updateMany', { where, data });
}

/**
 * Upsert a session
 */
export async function upsertSessionOrm(
  where: SessionWhereUniqueInput,
  create: SessionCreateInput,
  update: SessionUpdateInput,
  include?: SessionInclude,
  prisma?: AnyPrismaClient,
): Promise<Session> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'upsert', { where, create, update, include });
}

/**
 * Delete a session
 */
export async function deleteSessionOrm(
  where: SessionWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Session> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

/**
 * Delete many sessions
 */
export async function deleteManySessionsOrm(
  where: SessionWhereInput,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'deleteMany', { where });
}

/**
 * Count sessions
 */
export async function countSessionsOrm(
  where?: SessionWhereInput,
  prisma?: AnyPrismaClient,
): Promise<number> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', { where });
}

/**
 * Aggregate session data
 */
export async function aggregateSessionsOrm(
  where?: SessionWhereInput,
  prisma?: AnyPrismaClient,
): Promise<any> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'aggregate', { where });
}

/**
 * Group by sessions
 */
export async function groupBySessionsOrm(
  where?: SessionWhereInput,
  prisma?: AnyPrismaClient,
): Promise<any> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'groupBy', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

/**
 * Find sessions by user ID
 */
export async function findSessionsByUserIdOrm(
  userId: string,
  include?: SessionInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Session>> {
  return findManySessionsOrm({ userId }, { createdAt: 'desc' }, include, paginationOptions, prisma);
}

/**
 * Find active sessions for a user
 */
export async function findActiveSessionsForUserOrm(
  userId: string,
  include?: SessionInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Session>> {
  return findManySessionsOrm(
    {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find expired sessions
 */
export async function findExpiredSessionsOrm(
  include?: SessionInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Session>> {
  return findManySessionsOrm(
    {
      expiresAt: {
        lt: new Date(),
      },
    },
    { expiresAt: 'asc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find sessions by token
 */
export async function findSessionByTokenOrm(
  token: string,
  include?: SessionInclude,
  prisma?: AnyPrismaClient,
): Promise<Session | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: { token },
    include,
  });
}

/**
 * Delete expired sessions for cleanup
 */
export async function deleteExpiredSessionsOrm(
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'deleteMany', {
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

/**
 * Delete all sessions for a user (logout from all devices)
 */
export async function deleteAllUserSessionsOrm(
  userId: string,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'deleteMany', {
    where: { userId },
  });
}

/**
 * Update session expiry time
 */
export async function updateSessionExpiryOrm(
  where: SessionWhereUniqueInput,
  expiresAt: Date,
  prisma?: AnyPrismaClient,
): Promise<Session> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: { expiresAt },
  });
}

/**
 * Find recent sessions within specified days
 */
export async function findRecentSessionsOrm(
  days: number = 7,
  include?: SessionInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Session>> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return findManySessionsOrm(
    {
      createdAt: {
        gte: cutoffDate,
      },
    },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}
