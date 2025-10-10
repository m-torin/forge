import { getDefaultClientSync } from '../../node/index';
import type {
  Invitation,
  InvitationCreateInput,
  InvitationInclude,
  InvitationOrderByWithRelationInput,
  InvitationUpdateInput,
  InvitationWhereInput,
  InvitationWhereUniqueInput,
} from '../types/auth';
import type { AnyPrismaClient, PaginatedResult, PaginationOptions } from '../types/shared';
import { pagination } from '../utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Universal operation executor for Invitation operations
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
    where?: InvitationWhereInput | InvitationWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: InvitationOrderByWithRelationInput;
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

  return await (prisma.invitation as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

/**
 * Create a new invitation
 */
export async function createInvitationOrm(
  data: InvitationCreateInput,
  prisma?: AnyPrismaClient,
): Promise<Invitation> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

/**
 * Find first invitation matching criteria
 */
export async function findFirstInvitationOrm(
  where?: InvitationWhereInput,
  include?: InvitationInclude,
  prisma?: AnyPrismaClient,
): Promise<Invitation | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

/**
 * Find unique invitation by ID or unique field
 */
export async function findUniqueInvitationOrm(
  where: InvitationWhereUniqueInput,
  include?: InvitationInclude,
  prisma?: AnyPrismaClient,
): Promise<Invitation | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

/**
 * Find many invitations with filtering, sorting, and pagination
 */
export async function findManyInvitationsOrm(
  where?: InvitationWhereInput,
  orderBy?: InvitationOrderByWithRelationInput,
  include?: InvitationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Invitation>> {
  const client = prisma || getDefaultClientSync();

  const { skip, take, page, pageSize } = pagination.getOffsetLimit(paginationOptions || {});

  const [data, total] = await Promise.all([
    executeOperation<Invitation[]>(client, 'findMany', {
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
 * Update an invitation
 */
export async function updateInvitationOrm(
  where: InvitationWhereUniqueInput,
  data: InvitationUpdateInput,
  include?: InvitationInclude,
  prisma?: AnyPrismaClient,
): Promise<Invitation> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

/**
 * Delete an invitation
 */
export async function deleteInvitationOrm(
  where: InvitationWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Invitation> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

/**
 * Count invitations
 */
export async function countInvitationsOrm(
  where?: InvitationWhereInput,
  prisma?: AnyPrismaClient,
): Promise<number> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

/**
 * Find invitation by id
 */
export async function findInvitationByIdOrm(
  id: string,
  include?: InvitationInclude,
  prisma?: AnyPrismaClient,
): Promise<Invitation | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', {
    where: { id },
    include,
  });
}

/**
 * Find invitations by organization
 */
export async function findInvitationsByOrganizationOrm(
  organizationId: string,
  include?: InvitationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Invitation>> {
  return findManyInvitationsOrm(
    { organizationId },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find invitations by email
 */
export async function findInvitationsByEmailOrm(
  email: string,
  include?: InvitationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Invitation>> {
  return findManyInvitationsOrm(
    { email },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find pending invitations
 */
export async function findPendingInvitationsOrm(
  include?: InvitationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Invitation>> {
  return findManyInvitationsOrm(
    { status: 'PENDING' },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find expired invitations
 */
export async function findExpiredInvitationsOrm(
  include?: InvitationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Invitation>> {
  return findManyInvitationsOrm(
    {
      expiresAt: {
        lt: new Date(),
      },
      status: 'PENDING',
    },
    { expiresAt: 'asc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Accept invitation
 */
export async function acceptInvitationOrm(
  where: InvitationWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Invitation> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Reject invitation
 */
export async function rejectInvitationOrm(
  where: InvitationWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Invitation> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: {
      status: 'REJECTED',
      updatedAt: new Date(),
    },
  });
}

/**
 * Cancel invitation
 */
export async function cancelInvitationOrm(
  where: InvitationWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Invitation> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: {
      status: 'CANCELLED',
      updatedAt: new Date(),
    },
  });
}

/**
 * Delete expired invitations
 */
export async function deleteExpiredInvitationsOrm(
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'deleteMany', {
    where: {
      expiresAt: {
        lt: new Date(),
      },
      status: 'PENDING',
    },
  });
}
