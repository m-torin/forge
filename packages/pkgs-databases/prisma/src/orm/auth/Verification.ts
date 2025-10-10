import { getDefaultClientSync } from '../../node/index';
import type {
  Verification,
  VerificationCreateInput,
  // VerificationInclude, // Doesn't exist - Verification has no relations
  VerificationOrderByWithRelationInput,
  VerificationUpdateInput,
  VerificationWhereInput,
  VerificationWhereUniqueInput,
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
    where?: VerificationWhereInput | VerificationWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: VerificationOrderByWithRelationInput;
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
  // Note: Validation is handled at the application layer
  return await (prisma.verification as any)[operation](args);
}

// ==================== CORE OPERATIONS ====================

export async function createVerificationOrm(
  data: VerificationCreateInput,
  prisma?: AnyPrismaClient,
): Promise<Verification> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'create', { data });
}

export async function findFirstVerificationOrm(
  where?: VerificationWhereInput,
  include?: any, // Note: Verification has no relations
  prisma?: AnyPrismaClient,
): Promise<Verification | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', { where, include });
}

export async function findUniqueVerificationOrm(
  where: VerificationWhereUniqueInput,
  include?: any, // Note: Verification has no relations
  prisma?: AnyPrismaClient,
): Promise<Verification | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findUnique', { where, include });
}

export async function updateVerificationOrm(
  where: VerificationWhereUniqueInput,
  data: VerificationUpdateInput,
  include?: any, // Note: Verification has no relations
  prisma?: AnyPrismaClient,
): Promise<Verification> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'update', { where, data, include });
}

export async function deleteVerificationOrm(
  where: VerificationWhereUniqueInput,
  prisma?: AnyPrismaClient,
): Promise<Verification> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'delete', { where });
}

// ==================== SPECIALIZED OPERATIONS ====================

export async function findVerificationByValueOrm(
  value: string,
  include?: any, // Note: Verification has no relations
  prisma?: AnyPrismaClient,
): Promise<Verification | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: { value },
    include,
  });
}

export async function findVerificationByIdentifierAndValueOrm(
  identifier: string,
  value: string,
  include?: any, // Note: Verification has no relations
  prisma?: AnyPrismaClient,
): Promise<Verification | null> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findFirst', {
    where: {
      identifier,
      value,
    },
    include,
  });
}

export async function findExpiredVerificationsOrm(
  include?: any, // Note: Verification has no relations
  prisma?: AnyPrismaClient,
): Promise<Verification[]> {
  const client = prisma || getDefaultClientSync();
  return executeOperation(client, 'findMany', {
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
    include,
  });
}

export async function deleteExpiredVerificationsOrm(
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
