import { getDefaultClientSync } from '../../node/index';
import type {
  TwoFactor,
  TwoFactorCreateInput,
  TwoFactorInclude,
  TwoFactorOrderByWithRelationInput,
  TwoFactorUpdateInput,
  TwoFactorWhereInput,
  TwoFactorWhereUniqueInput,
} from '../types/auth';
import type { AnyPrismaClient } from '../types/shared';

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
    where?: TwoFactorWhereInput | TwoFactorWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: TwoFactorOrderByWithRelationInput;
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
  return await (prisma.twoFactor as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

export async function createTwoFactorOrm(
  data: TwoFactorCreateInput,
  prisma?: AnyPrismaClient,
): Promise<TwoFactor> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

export async function findFirstTwoFactorOrm(
  where?: TwoFactorWhereInput,
  include?: TwoFactorInclude,
  prisma?: AnyPrismaClient,
): Promise<TwoFactor | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

export async function findUniqueTwoFactorOrm(
  where: TwoFactorWhereUniqueInput,
  include?: TwoFactorInclude,
  prisma?: AnyPrismaClient,
): Promise<TwoFactor | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

export async function updateTwoFactorOrm(
  where: TwoFactorWhereUniqueInput,
  data: TwoFactorUpdateInput,
  include?: TwoFactorInclude,
  prisma?: AnyPrismaClient,
): Promise<TwoFactor> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

export async function deleteTwoFactorOrm(
  where: TwoFactorWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<TwoFactor> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

export async function findTwoFactorByUserIdOrm(
  userId: string,
  include?: TwoFactorInclude,
  prisma?: AnyPrismaClient,
): Promise<TwoFactor | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: { userId },
    include,
  });
}

export async function enableTwoFactorOrm(
  where: TwoFactorWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<TwoFactor> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: {
      isEnabled: true,
      updatedAt: new Date(),
    },
  });
}

export async function disableTwoFactorOrm(
  where: TwoFactorWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<TwoFactor> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', {
    where,
    data: {
      isEnabled: false,
      updatedAt: new Date(),
    },
  });
}
