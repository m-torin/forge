import { deleteGeneric, existsGeneric } from '../shared-operations';
import type {
  CompanyMember,
  CompanyMemberCreateInput,
  CompanyMemberInclude,
  CompanyMemberOrderByWithRelationInput,
  CompanyMemberUpdateInput,
  CompanyMemberWhereInput,
  CompanyMemberWhereUniqueInput,
  ContentStatus,
} from '../types/cms';
import type {
  PaginatedResult,
  PaginationOptions,
  PrismaClient,
  PrismaTransactionClient,
} from '../types/shared';
import { pagination, validation } from '../utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Universal companyMember operation executor
 */
async function executeCompanyMemberOperation<T = any>(
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
    where?: CompanyMemberWhereInput | CompanyMemberWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: CompanyMemberOrderByWithRelationInput;
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
    args.data = params.validate ? validation.sanitizeInput(params.data) : params.data;
  }

  // Handle upsert-specific create/update
  if (params.create) {
    args.create = params.validate ? validation.sanitizeInput(params.create) : params.create;
  }
  if (params.update) {
    args.update = params.validate ? validation.sanitizeInput(params.update) : params.update;
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
    if (params.take !== undefined) args.take = Math.min(params.take, 100);
  }

  return (prisma.companyMember as any)[operation](args);
}

/**
 * Smart pagination helper for companyMembers
 */
async function executeWithPagination<T>(
  prisma: PrismaClient | PrismaTransactionClient,
  options: PaginationOptions & {
    where?: CompanyMemberWhereInput;
    orderBy?: CompanyMemberOrderByWithRelationInput;
    select?: any;
    include?: any;
  } = {},
): Promise<PaginatedResult<T>> {
  const { skip, take, page, pageSize } = pagination.getOffsetLimit(options);

  const [items, total] = await Promise.all([
    executeCompanyMemberOperation<T[]>(prisma, 'findMany', {
      where: options.where,
      orderBy: options.orderBy || { displayOrder: 'asc', name: 'asc' },
      select: options.select,
      include: options.include,
      skip,
      take,
    }),
    executeCompanyMemberOperation<number>(prisma, 'count', { where: options.where }),
  ]);

  return pagination.createPaginatedResult(items, total, { page, pageSize });
}

// ==================== COMPANYMEMBER ORM FUNCTIONS ====================

/**
 * Create a new companyMember with validation
 */
export async function create(
  prisma: PrismaClient | PrismaTransactionClient,
  data: CompanyMemberCreateInput,
): Promise<CompanyMember> {
  return executeCompanyMemberOperation<CompanyMember>(prisma, 'create', {
    data,
    validate: true,
  });
}

/**
 * Find companyMember by ID
 */
export async function find(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  include?: CompanyMemberInclude,
): Promise<CompanyMember | null> {
  return executeCompanyMemberOperation<CompanyMember | null>(prisma, 'findUnique', {
    where: { id },
    include,
  });
}

/**
 * Find companyMember by slug
 */
export async function findCompanyMemberBySlug(
  prisma: PrismaClient | PrismaTransactionClient,
  slug: string,
  include?: CompanyMemberInclude,
): Promise<CompanyMember | null> {
  return executeCompanyMemberOperation<CompanyMember | null>(prisma, 'findUnique', {
    where: { name: slug },
    include,
  });
}

/**
 * Find companyMember by name
 */
export async function findCompanyMemberByName(
  prisma: PrismaClient | PrismaTransactionClient,
  name: string,
  include?: CompanyMemberInclude,
): Promise<CompanyMember | null> {
  return executeCompanyMemberOperation<CompanyMember | null>(prisma, 'findFirst', {
    where: { name: { equals: name, mode: 'insensitive' } },
    include,
  });
}

/**
 * Find many companyMembers with pagination
 */
export async function findMany(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    where?: CompanyMemberWhereInput;
    orderBy?: CompanyMemberOrderByWithRelationInput;
    include?: CompanyMemberInclude;
  },
): Promise<PaginatedResult<CompanyMember>> {
  return executeWithPagination<CompanyMember>(prisma, options);
}

/**
 * Find companyMembers by status
 */
export async function findCompanyMembersByStatus(
  prisma: PrismaClient | PrismaTransactionClient,
  status: ContentStatus,
  options?: PaginationOptions & {
    include?: CompanyMemberInclude;
    orderBy?: CompanyMemberOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyMember>> {
  return executeWithPagination<CompanyMember>(prisma, {
    ...options,
    where: { isActive: status === 'PUBLISHED' },
  });
}

/**
 * Find published companyMembers
 */
export async function findPublishedCompanyMembers(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    include?: CompanyMemberInclude;
    orderBy?: CompanyMemberOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyMember>> {
  return executeWithPagination<CompanyMember>(prisma, {
    ...options,
    where: { isActive: true },
  });
}

/**
 * Find companyMembers by role
 */
export async function findCompanyMembersByRole(
  prisma: PrismaClient | PrismaTransactionClient,
  role: string,
  options?: PaginationOptions & {
    include?: CompanyMemberInclude;
    orderBy?: CompanyMemberOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyMember>> {
  return executeWithPagination<CompanyMember>(prisma, {
    ...options,
    where: {
      title: {
        contains: role,
        mode: 'insensitive',
      },
    },
  });
}

/**
 * Find companyMembers by department
 */
export async function findCompanyMembersByDepartment(
  prisma: PrismaClient | PrismaTransactionClient,
  department: string,
  options?: PaginationOptions & {
    include?: CompanyMemberInclude;
    orderBy?: CompanyMemberOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyMember>> {
  return executeWithPagination<CompanyMember>(prisma, {
    ...options,
    where: {
      title: {
        contains: department,
        mode: 'insensitive',
      },
    },
  });
}

/**
 * Find featured companyMembers
 */
export async function findFeaturedCompanyMembers(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    include?: CompanyMemberInclude;
    orderBy?: CompanyMemberOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyMember>> {
  return executeWithPagination<CompanyMember>(prisma, {
    ...options,
    where: { isFeatured: true },
  });
}

/**
 * Search companyMembers by name (case-insensitive)
 */
export async function searchCompanyMembersByName(
  prisma: PrismaClient | PrismaTransactionClient,
  searchTerm: string,
  options?: PaginationOptions & {
    include?: CompanyMemberInclude;
    orderBy?: CompanyMemberOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyMember>> {
  return executeWithPagination<CompanyMember>(prisma, {
    ...options,
    where: {
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  });
}

/**
 * Update companyMember by ID
 */
export async function update(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  data: CompanyMemberUpdateInput,
): Promise<CompanyMember> {
  return executeCompanyMemberOperation<CompanyMember>(prisma, 'update', {
    where: { id },
    data,
    validate: true,
  });
}

/**
 * Update companyMember by slug
 */
export async function updateCompanyMemberBySlug(
  prisma: PrismaClient | PrismaTransactionClient,
  slug: string,
  data: CompanyMemberUpdateInput,
): Promise<CompanyMember> {
  return executeCompanyMemberOperation<CompanyMember>(prisma, 'update', {
    where: { name: slug },
    data,
    validate: true,
  });
}

/**
 * Delete companyMember by ID
 */
export async function deleteById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<CompanyMember> {
  return deleteGeneric(prisma.companyMember as any, { where: { id } });
}

/**
 * Delete companyMember by slug
 */
export async function deleteCompanyMemberBySlug(
  prisma: PrismaClient | PrismaTransactionClient,
  slug: string,
): Promise<CompanyMember> {
  return deleteGeneric(prisma.companyMember as any, { where: { name: slug } });
}

/**
 * Count companyMembers with optional filtering
 */
export async function countCompanyMembers(
  prisma: PrismaClient | PrismaTransactionClient,
  where?: CompanyMemberWhereInput,
): Promise<number> {
  return executeCompanyMemberOperation<number>(prisma, 'count', { where });
}

/**
 * Check if companyMember exists by ID
 */
export async function companyMemberExistsById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<boolean> {
  return existsGeneric(prisma.companyMember as any, { where: { id }, select: { id: true } });
}

/**
 * Check if companyMember exists by slug
 */
export async function companyMemberExistsBySlug(
  prisma: PrismaClient | PrismaTransactionClient,
  slug: string,
): Promise<boolean> {
  const companyMember = await executeCompanyMemberOperation<{ id: string } | null>(
    prisma,
    'findUnique',
    {
      where: { name: slug },
      select: { id: true },
    },
  );
  return !!companyMember;
}

/**
 * Check if companyMember exists by name
 */
export async function companyMemberExistsByName(
  prisma: PrismaClient | PrismaTransactionClient,
  name: string,
): Promise<boolean> {
  const companyMember = await executeCompanyMemberOperation<{ id: string } | null>(
    prisma,
    'findFirst',
    {
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    },
  );
  return !!companyMember;
}

/**
 * Upsert companyMember (create or update)
 */
export async function upsertCompanyMember(
  prisma: PrismaClient | PrismaTransactionClient,
  where: CompanyMemberWhereUniqueInput,
  create: CompanyMemberCreateInput,
  update: CompanyMemberUpdateInput,
): Promise<CompanyMember> {
  return executeCompanyMemberOperation<CompanyMember>(prisma, 'upsert', {
    where,
    create,
    update,
    validate: true,
  });
}

/**
 * Upsert companyMember by slug
 */
export async function upsertCompanyMemberBySlug(
  prisma: PrismaClient | PrismaTransactionClient,
  slug: string,
  create: CompanyMemberCreateInput,
  update: CompanyMemberUpdateInput,
): Promise<CompanyMember> {
  return executeCompanyMemberOperation<CompanyMember>(prisma, 'upsert', {
    where: { name: slug },
    create,
    update,
    validate: true,
  });
}
