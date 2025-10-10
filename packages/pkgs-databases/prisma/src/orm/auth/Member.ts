import { getDefaultClientSync } from '../../node/index';
import type {
  Member,
  MemberCreateInput,
  MemberInclude,
  MemberOrderByWithRelationInput,
  MemberUpdateInput,
  MemberWhereInput,
  MemberWhereUniqueInput,
} from '../types/auth';
import type { AnyPrismaClient, PaginatedResult, PaginationOptions } from '../types/shared';
import { pagination } from '../utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Universal operation executor for Member operations
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
    where?: MemberWhereInput | MemberWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: MemberOrderByWithRelationInput;
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

  return await (prisma.member as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

/**
 * Create a new member
 */
export async function createMemberOrm(
  data: MemberCreateInput,
  prisma?: AnyPrismaClient,
): Promise<Member> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

/**
 * Find first member matching criteria
 */
export async function findFirstMemberOrm(
  where?: MemberWhereInput,
  include?: MemberInclude,
  prisma?: AnyPrismaClient,
): Promise<Member | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

/**
 * Find unique member by ID or unique field
 */
export async function findUniqueMemberOrm(
  where: MemberWhereUniqueInput,
  include?: MemberInclude,
  prisma?: AnyPrismaClient,
): Promise<Member | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

/**
 * Find many members with filtering, sorting, and pagination
 */
export async function findManyMembersOrm(
  where?: MemberWhereInput,
  orderBy?: MemberOrderByWithRelationInput,
  include?: MemberInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Member>> {
  const client = prisma || getDefaultClientSync();

  const { skip, take, page, pageSize } = pagination.getOffsetLimit(paginationOptions || {});

  const [data, total] = await Promise.all([
    executeOperation<Member[]>(client, 'findMany', {
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
 * Update a member
 */
export async function updateMemberOrm(
  where: MemberWhereUniqueInput,
  data: MemberUpdateInput,
  include?: MemberInclude,
  prisma?: AnyPrismaClient,
): Promise<Member> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

/**
 * Update many members
 */
export async function updateManyMembersOrm(
  where: MemberWhereInput,
  data: MemberUpdateInput,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'updateMany', { where, data });
}

/**
 * Upsert a member
 */
export async function upsertMemberOrm(
  where: MemberWhereUniqueInput,
  create: MemberCreateInput,
  update: MemberUpdateInput,
  include?: MemberInclude,
  prisma?: AnyPrismaClient,
): Promise<Member> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'upsert', { where, create, update, include });
}

/**
 * Delete a member
 */
export async function deleteMemberOrm(
  where: MemberWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Member> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

/**
 * Delete many members
 */
export async function deleteManyMembersOrm(
  where: MemberWhereInput,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'deleteMany', { where });
}

/**
 * Count members
 */
export async function countMembersOrm(
  where?: MemberWhereInput,
  prisma?: AnyPrismaClient,
): Promise<number> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', { where });
}

/**
 * Aggregate member data
 */
export async function aggregateMembersOrm(
  where?: MemberWhereInput,
  prisma?: AnyPrismaClient,
): Promise<any> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'aggregate', { where });
}

/**
 * Group by members
 */
export async function groupByMembersOrm(
  where?: MemberWhereInput,
  prisma?: AnyPrismaClient,
): Promise<any> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'groupBy', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

/**
 * Find members by organization ID
 */
export async function findMembersByOrganizationIdOrm(
  organizationId: string,
  include?: MemberInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Member>> {
  return findManyMembersOrm(
    { organizationId },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find members by user ID
 */
export async function findMembersByUserIdOrm(
  userId: string,
  include?: MemberInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Member>> {
  return findManyMembersOrm({ userId }, { createdAt: 'desc' }, include, paginationOptions, prisma);
}

/**
 * Find member by user and organization
 */
export async function findMemberByUserAndOrganizationOrm(
  userId: string,
  organizationId: string,
  include?: MemberInclude,
  prisma?: AnyPrismaClient,
): Promise<Member | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: {
      userId,
      organizationId,
    },
    include,
  });
}

/**
 * Find members by role
 */
export async function findMembersByRoleOrm(
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
  include?: MemberInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Member>> {
  return findManyMembersOrm({ role }, { createdAt: 'desc' }, include, paginationOptions, prisma);
}

/**
 * Find organization members by role
 */
export async function findOrganizationMembersByRoleOrm(
  organizationId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
  include?: MemberInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Member>> {
  return findManyMembersOrm(
    {
      organizationId,
      role,
    },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find organization owners
 */
export async function findOrganizationOwnersOrm(
  organizationId: string,
  include?: MemberInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Member>> {
  return findOrganizationMembersByRoleOrm(
    organizationId,
    'OWNER',
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find organization admins
 */
export async function findOrganizationAdminsOrm(
  organizationId: string,
  include?: MemberInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Member>> {
  return findOrganizationMembersByRoleOrm(
    organizationId,
    'ADMIN',
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Update member role
 */
export async function updateMemberRoleOrm(
  where: MemberWhereUniqueInput,
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
  prisma?: AnyPrismaClient,
): Promise<Member> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: {
      role,
      updatedAt: new Date(),
    },
  });
}

/**
 * Check if user is member of organization
 */
export async function isUserMemberOfOrganizationOrm(
  userId: string,
  organizationId: string,
  prisma?: AnyPrismaClient,
): Promise<boolean> {
  const member = await findMemberByUserAndOrganizationOrm(
    userId,
    organizationId,
    undefined,
    prisma,
  );
  return member !== null;
}

/**
 * Check if user has specific role in organization
 */
export async function hasUserRoleInOrganizationOrm(
  userId: string,
  organizationId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
  prisma?: AnyPrismaClient,
): Promise<boolean> {
  const member = await findMemberByUserAndOrganizationOrm(
    userId,
    organizationId,
    undefined,
    prisma,
  );
  return member?.role === role;
}

/**
 * Check if user is owner or admin of organization
 */
export async function isUserOwnerOrAdminOrm(
  userId: string,
  organizationId: string,
  prisma?: AnyPrismaClient,
): Promise<boolean> {
  const member = await findMemberByUserAndOrganizationOrm(
    userId,
    organizationId,
    undefined,
    prisma,
  );
  return member?.role === 'OWNER' || member?.role === 'ADMIN';
}

/**
 * Count organization members by role
 */
export async function countMembersByRoleOrm(
  organizationId: string,
  role?: 'OWNER' | 'ADMIN' | 'MEMBER',
  prisma?: AnyPrismaClient,
): Promise<number> {
  const where: MemberWhereInput = { organizationId };
  if (role) {
    where.role = role;
  }

  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', { where });
}

/**
 * Find recent members in organization
 */
export async function findRecentMembersOrm(
  organizationId: string,
  days: number = 30,
  include?: MemberInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Member>> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return findManyMembersOrm(
    {
      organizationId,
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
