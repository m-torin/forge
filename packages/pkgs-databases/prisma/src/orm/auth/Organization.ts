import { getDefaultClientSync } from '../../node/index';
import type {
  Organization,
  OrganizationCreateInput,
  OrganizationInclude,
  OrganizationOrderByWithRelationInput,
  OrganizationUpdateInput,
  OrganizationWhereInput,
  OrganizationWhereUniqueInput,
} from '../types/auth';
import type { AnyPrismaClient, PaginatedResult, PaginationOptions } from '../types/shared';
import { pagination } from '../utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Universal operation executor for Organization operations
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
    where?: OrganizationWhereInput | OrganizationWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: OrganizationOrderByWithRelationInput;
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

  return await (prisma.organization as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

/**
 * Create a new organization
 */
export async function createOrganizationOrm(
  data: OrganizationCreateInput,
  prisma?: AnyPrismaClient,
): Promise<Organization> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

/**
 * Find first organization matching criteria
 */
export async function findFirstOrganizationOrm(
  where?: OrganizationWhereInput,
  include?: OrganizationInclude,
  prisma?: AnyPrismaClient,
): Promise<Organization | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

/**
 * Find unique organization by ID or unique field
 */
export async function findUniqueOrganizationOrm(
  where: OrganizationWhereUniqueInput,
  include?: OrganizationInclude,
  prisma?: AnyPrismaClient,
): Promise<Organization | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

/**
 * Find many organizations with filtering, sorting, and pagination
 */
export async function findManyOrganizationsOrm(
  where?: OrganizationWhereInput,
  orderBy?: OrganizationOrderByWithRelationInput,
  include?: OrganizationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Organization>> {
  const client = prisma || getDefaultClientSync();

  const { skip, take, page, pageSize } = pagination.getOffsetLimit(paginationOptions || {});

  const [data, total] = await Promise.all([
    executeOperation<Organization[]>(client, 'findMany', {
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
 * Update an organization
 */
export async function updateOrganizationOrm(
  where: OrganizationWhereUniqueInput,
  data: OrganizationUpdateInput,
  include?: OrganizationInclude,
  prisma?: AnyPrismaClient,
): Promise<Organization> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

/**
 * Update many organizations
 */
export async function updateManyOrganizationsOrm(
  where: OrganizationWhereInput,
  data: OrganizationUpdateInput,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'updateMany', { where, data });
}

/**
 * Upsert an organization
 */
export async function upsertOrganizationOrm(
  where: OrganizationWhereUniqueInput,
  create: OrganizationCreateInput,
  update: OrganizationUpdateInput,
  include?: OrganizationInclude,
  prisma?: AnyPrismaClient,
): Promise<Organization> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'upsert', { where, create, update, include });
}

/**
 * Delete an organization
 */
export async function deleteOrganizationOrm(
  where: OrganizationWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Organization> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

/**
 * Delete many organizations
 */
export async function deleteManyOrganizationsOrm(
  where: OrganizationWhereInput,
  prisma?: AnyPrismaClient,
): Promise<{ count: number }> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'deleteMany', { where });
}

/**
 * Count organizations
 */
export async function countOrganizationsOrm(
  where?: OrganizationWhereInput,
  prisma?: AnyPrismaClient,
): Promise<number> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', { where });
}

/**
 * Aggregate organization data
 */
export async function aggregateOrganizationsOrm(
  where?: OrganizationWhereInput,
  prisma?: AnyPrismaClient,
): Promise<any> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'aggregate', { where });
}

/**
 * Group by organizations
 */
export async function groupByOrganizationsOrm(
  where?: OrganizationWhereInput,
  prisma?: AnyPrismaClient,
): Promise<any> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'groupBy', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

/**
 * Find organization by slug
 */
export async function findOrganizationBySlugOrm(
  slug: string,
  include?: OrganizationInclude,
  prisma?: AnyPrismaClient,
): Promise<Organization | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: { slug },
    include,
  });
}

/**
 * Search organizations by name
 */
export async function searchOrganizationsByNameOrm(
  searchTerm: string,
  include?: OrganizationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Organization>> {
  return findManyOrganizationsOrm(
    {
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
    { name: 'asc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find organizations with members
 */
export async function findOrganizationsWithMembersOrm(
  include?: OrganizationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Organization>> {
  return findManyOrganizationsOrm(
    {
      members: {
        some: {},
      },
    },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find organizations with members
 */
export async function findOrganizationsWithTeamsOrm(
  include?: OrganizationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Organization>> {
  return findManyOrganizationsOrm(
    {
      members: {
        some: {},
      },
    },
    { createdAt: 'desc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find organization with all relations
 */
export async function findOrganizationWithAllRelationsOrm(
  where: OrganizationWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Organization | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', {
    where,
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      invitations: true,
    },
  });
}

/**
 * Find user's organizations
 */
export async function findUserOrganizationsOrm(
  userId: string,
  include?: OrganizationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Organization>> {
  return findManyOrganizationsOrm(
    {
      members: {
        some: {
          userId,
        },
      },
    },
    { name: 'asc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Find organizations where user has specific role
 */
export async function findUserOrganizationsByRoleOrm(
  userId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
  include?: OrganizationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Organization>> {
  return findManyOrganizationsOrm(
    {
      members: {
        some: {
          userId,
          role,
        },
      },
    },
    { name: 'asc' },
    include,
    paginationOptions,
    prisma,
  );
}

/**
 * Count organization members
 */
export async function countOrganizationMembersOrm(
  organizationId: string,
  prisma?: AnyPrismaClient,
): Promise<number> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', {
    where: {
      id: organizationId,
      members: {
        some: {},
      },
    },
  });
}

/**
 * Count organization members
 */
export async function countOrganizationTeamsOrm(
  organizationId: string,
  prisma?: AnyPrismaClient,
): Promise<number> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'count', {
    where: {
      id: organizationId,
      members: {
        some: {},
      },
    },
  });
}

/**
 * Find recent organizations
 */
export async function findRecentOrganizationsOrm(
  days: number = 30,
  include?: OrganizationInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Organization>> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return findManyOrganizationsOrm(
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

/**
 * Update organization settings
 */
export async function updateOrganizationSettingsOrm(
  where: OrganizationWhereUniqueInput,
  settings: any,
  prisma?: AnyPrismaClient,
): Promise<Organization> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: {
      settings,
      updatedAt: new Date(),
    },
  });
}
