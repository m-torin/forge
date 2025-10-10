import { getDefaultClientSync } from '../../node/index';
import type {
  Passkey,
  PasskeyCreateInput,
  PasskeyInclude,
  PasskeyOrderByWithRelationInput,
  PasskeyUpdateInput,
  PasskeyWhereInput,
  PasskeyWhereUniqueInput,
} from '../types/auth';
import type { AnyPrismaClient, PaginatedResult, PaginationOptions } from '../types/shared';
import { pagination } from '../utils';

// ==================== SMART DRY HELPERS ====================

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
    where?: PasskeyWhereInput | PasskeyWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: PasskeyOrderByWithRelationInput;
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
  return await (prisma.passkey as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

export async function createPasskeyOrm(
  data: PasskeyCreateInput,
  prisma?: AnyPrismaClient,
): Promise<Passkey> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

export async function findFirstPasskeyOrm(
  where?: PasskeyWhereInput,
  include?: PasskeyInclude,
  prisma?: AnyPrismaClient,
): Promise<Passkey | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

export async function findUniquePasskeyOrm(
  where: PasskeyWhereUniqueInput,
  include?: PasskeyInclude,
  prisma?: AnyPrismaClient,
): Promise<Passkey | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

export async function findManyPasskeysOrm(
  where?: PasskeyWhereInput,
  orderBy?: PasskeyOrderByWithRelationInput,
  include?: PasskeyInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Passkey>> {
  const client = prisma || getDefaultClientSync();
  const { skip, take, page, pageSize } = pagination.getOffsetLimit(paginationOptions || {});
  const [data, total] = await Promise.all([
    executeOperation<Passkey[]>(client, 'findMany', { where, orderBy, include, skip, take }),
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

export async function updatePasskeyOrm(
  where: PasskeyWhereUniqueInput,
  data: PasskeyUpdateInput,
  include?: PasskeyInclude,
  prisma?: AnyPrismaClient,
): Promise<Passkey> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

export async function deletePasskeyOrm(
  where: PasskeyWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Passkey> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

export async function findPasskeysByUserIdOrm(
  userId: string,
  include?: PasskeyInclude,
  paginationOptions?: PaginationOptions,
  prisma?: AnyPrismaClient,
): Promise<PaginatedResult<Passkey>> {
  return findManyPasskeysOrm({ userId }, { createdAt: 'desc' }, include, paginationOptions, prisma);
}

export async function findPasskeyByWebauthnUserIDOrm(
  webauthnUserID: string,
  include?: PasskeyInclude,
  prisma?: AnyPrismaClient,
): Promise<Passkey | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: { webauthnUserID },
    include,
  });
}

export async function updatePasskeyLastUsedOrm(
  where: PasskeyWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Passkey> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: {
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
