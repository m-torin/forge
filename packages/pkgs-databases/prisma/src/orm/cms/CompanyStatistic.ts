import { deleteGeneric, existsGeneric } from '../shared-operations';
import type {
  CompanyStatistic,
  CompanyStatisticCreateInput,
  CompanyStatisticInclude,
  CompanyStatisticOrderByWithRelationInput,
  CompanyStatisticUpdateInput,
  CompanyStatisticWhereInput,
  CompanyStatisticWhereUniqueInput,
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
 * Universal companyStatistic operation executor
 */
async function executeCompanyStatisticOperation<T = any>(
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
    where?: CompanyStatisticWhereInput | CompanyStatisticWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
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

  return (prisma.companyStatistic as any)[operation](args);
}

/**
 * Smart pagination helper for companyStatistics
 */
async function executeWithPagination<T>(
  prisma: PrismaClient | PrismaTransactionClient,
  options: PaginationOptions & {
    where?: CompanyStatisticWhereInput;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
    select?: any;
    include?: any;
  } = {},
): Promise<PaginatedResult<T>> {
  const { skip, take, page, pageSize } = pagination.getOffsetLimit(options);

  const [items, total] = await Promise.all([
    executeCompanyStatisticOperation<T[]>(prisma, 'findMany', {
      where: options.where,
      orderBy: options.orderBy || { displayOrder: 'asc', label: 'asc' },
      select: options.select,
      include: options.include,
      skip,
      take,
    }),
    executeCompanyStatisticOperation<number>(prisma, 'count', { where: options.where }),
  ]);

  return pagination.createPaginatedResult(items, total, { page, pageSize });
}

// ==================== COMPANYSTATISTIC ORM FUNCTIONS ====================

/**
 * Create a new companyStatistic with validation
 */
export async function create(
  prisma: PrismaClient | PrismaTransactionClient,
  data: CompanyStatisticCreateInput,
): Promise<CompanyStatistic> {
  return executeCompanyStatisticOperation<CompanyStatistic>(prisma, 'create', {
    data,
    validate: true,
  });
}

/**
 * Find companyStatistic by ID
 */
export async function find(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  include?: CompanyStatisticInclude,
): Promise<CompanyStatistic | null> {
  return executeCompanyStatisticOperation<CompanyStatistic | null>(prisma, 'findUnique', {
    where: { id },
    include,
  });
}

/**
 * Find companyStatistic by key
 */
export async function findCompanyStatisticByKey(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
  include?: CompanyStatisticInclude,
): Promise<CompanyStatistic | null> {
  return executeCompanyStatisticOperation<CompanyStatistic | null>(prisma, 'findUnique', {
    where: { label: key },
    include,
  });
}

/**
 * Find many companyStatistics with pagination
 */
export async function findMany(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    where?: CompanyStatisticWhereInput;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
    include?: CompanyStatisticInclude;
  },
): Promise<PaginatedResult<CompanyStatistic>> {
  return executeWithPagination<CompanyStatistic>(prisma, options);
}

/**
 * Find companyStatistics by status
 */
export async function findCompanyStatisticsByStatus(
  prisma: PrismaClient | PrismaTransactionClient,
  status: ContentStatus,
  options?: PaginationOptions & {
    include?: CompanyStatisticInclude;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyStatistic>> {
  return executeWithPagination<CompanyStatistic>(prisma, {
    ...options,
    where: { isActive: status === 'PUBLISHED' },
  });
}

/**
 * Find published companyStatistics
 */
export async function findPublishedCompanyStatistics(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    include?: CompanyStatisticInclude;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyStatistic>> {
  return executeWithPagination<CompanyStatistic>(prisma, {
    ...options,
    where: { isActive: true },
  });
}

/**
 * Find companyStatistics by type
 */
export async function findCompanyStatisticsByType(
  prisma: PrismaClient | PrismaTransactionClient,
  type: string,
  options?: PaginationOptions & {
    include?: CompanyStatisticInclude;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyStatistic>> {
  return executeWithPagination<CompanyStatistic>(prisma, {
    ...options,
    where: {
      label: {
        contains: type,
        mode: 'insensitive',
      },
    },
  });
}

/**
 * Find companyStatistics by value range
 */
export async function findCompanyStatisticsByValueRange(
  prisma: PrismaClient | PrismaTransactionClient,
  minValue: number,
  maxValue: number,
  options?: PaginationOptions & {
    include?: CompanyStatisticInclude;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyStatistic>> {
  return executeWithPagination<CompanyStatistic>(prisma, {
    ...options,
    where: {
      value: {
        gte: String(minValue),
        lte: String(maxValue),
      },
    },
  });
}

/**
 * Find featured companyStatistics
 */
export async function findFeaturedCompanyStatistics(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    include?: CompanyStatisticInclude;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyStatistic>> {
  return executeWithPagination<CompanyStatistic>(prisma, {
    ...options,
    where: { isActive: true },
  });
}

/**
 * Search companyStatistics by label (case-insensitive)
 */
export async function searchCompanyStatisticsByLabel(
  prisma: PrismaClient | PrismaTransactionClient,
  searchTerm: string,
  options?: PaginationOptions & {
    include?: CompanyStatisticInclude;
    orderBy?: CompanyStatisticOrderByWithRelationInput;
  },
): Promise<PaginatedResult<CompanyStatistic>> {
  return executeWithPagination<CompanyStatistic>(prisma, {
    ...options,
    where: {
      label: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  });
}

/**
 * Update companyStatistic by ID
 */
export async function update(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  data: CompanyStatisticUpdateInput,
): Promise<CompanyStatistic> {
  return executeCompanyStatisticOperation<CompanyStatistic>(prisma, 'update', {
    where: { id },
    data,
    validate: true,
  });
}

/**
 * Update companyStatistic by key
 */
export async function updateCompanyStatisticByKey(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
  data: CompanyStatisticUpdateInput,
): Promise<CompanyStatistic> {
  return executeCompanyStatisticOperation<CompanyStatistic>(prisma, 'update', {
    where: { label: key },
    data,
    validate: true,
  });
}

/**
 * Delete companyStatistic by ID
 */
export async function deleteById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<CompanyStatistic> {
  return deleteGeneric(prisma.companyStatistic as any, { where: { id } });
}

/**
 * Delete companyStatistic by key
 */
export async function deleteCompanyStatisticByKey(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
): Promise<CompanyStatistic> {
  return deleteGeneric(prisma.companyStatistic as any, { where: { label: key } });
}

/**
 * Count companyStatistics with optional filtering
 */
export async function countCompanyStatistics(
  prisma: PrismaClient | PrismaTransactionClient,
  where?: CompanyStatisticWhereInput,
): Promise<number> {
  return executeCompanyStatisticOperation<number>(prisma, 'count', { where });
}

/**
 * Check if companyStatistic exists by ID
 */
export async function companyStatisticExistsById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<boolean> {
  return existsGeneric(prisma.companyStatistic as any, { where: { id }, select: { id: true } });
}

/**
 * Check if companyStatistic exists by key
 */
export async function companyStatisticExistsByKey(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
): Promise<boolean> {
  const companyStatistic = await executeCompanyStatisticOperation<{ id: string } | null>(
    prisma,
    'findUnique',
    {
      where: { label: key },
      select: { id: true },
    },
  );
  return !!companyStatistic;
}

/**
 * Upsert companyStatistic (create or update)
 */
export async function upsertCompanyStatistic(
  prisma: PrismaClient | PrismaTransactionClient,
  where: CompanyStatisticWhereUniqueInput,
  create: CompanyStatisticCreateInput,
  update: CompanyStatisticUpdateInput,
): Promise<CompanyStatistic> {
  return executeCompanyStatisticOperation<CompanyStatistic>(prisma, 'upsert', {
    where,
    create,
    update,
    validate: true,
  });
}

/**
 * Upsert companyStatistic by key
 */
export async function upsertCompanyStatisticByKey(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
  create: CompanyStatisticCreateInput,
  update: CompanyStatisticUpdateInput,
): Promise<CompanyStatistic> {
  return executeCompanyStatisticOperation<CompanyStatistic>(prisma, 'upsert', {
    where: { label: key },
    create,
    update,
    validate: true,
  });
}
