import { Prisma, type PrismaClient } from '../../generated/client/client';
import type { PrismaTransactionClient } from './types';

//==============================================================================
// SESSION FRAGMENTS
//==============================================================================

export const sessionSelectBasic = {
  select: {
    id: true,
    token: true,
    userId: true,
    expiresAt: true,
    createdAt: true,
  },
} as const satisfies Prisma.SessionDefaultArgs;

export const sessionSelectFull = {
  select: {
    id: true,
    expiresAt: true,
    token: true,
    createdAt: true,
    updatedAt: true,
    ipAddress: true,
    userAgent: true,
    userId: true,
    activeOrganizationId: true,
    impersonatedBy: true,
  },
} as const satisfies Prisma.SessionDefaultArgs;

export const sessionWithUser = {
  include: {
    user: true,
  },
} as const satisfies Prisma.SessionDefaultArgs;

//==============================================================================
// SMART DRY HELPER
//==============================================================================

async function executeSessionOperation<T = any>(
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
    where?: Prisma.SessionWhereInput | Prisma.SessionWhereUniqueInput;
    data?: Prisma.SessionCreateInput | Prisma.SessionUpdateInput | Prisma.SessionCreateInput[];
    select?: Prisma.SessionSelect;
    include?: Prisma.SessionInclude;
    orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[];
    skip?: number;
    take?: number;
    create?: Prisma.SessionCreateInput;
    update?: Prisma.SessionUpdateInput;
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

  return (prisma.session as any)[operation](args);
}

async function executeWithPagination<T = any>(
  prisma: PrismaClient | PrismaTransactionClient,
  operation: 'findMany',
  params: {
    where?: Prisma.SessionWhereInput;
    select?: Prisma.SessionSelect;
    include?: Prisma.SessionInclude;
    orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[];
    page?: number;
    limit?: number;
  } = {},
): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
  const { page = 1, limit = 10, ...rest } = params;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    executeSessionOperation<T[]>(prisma, operation, { ...rest, skip, take: limit }),
    executeSessionOperation<number>(prisma, 'count', { where: rest.where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

//==============================================================================
// SESSION ORM FUNCTIONS
//==============================================================================

export async function createSession(
  prisma: PrismaClient | PrismaTransactionClient,
  data: Prisma.SessionCreateInput,
) {
  return executeSessionOperation(prisma, 'create', { data });
}

export async function find(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  options: { select?: Prisma.SessionSelect; include?: Prisma.SessionInclude } = {},
) {
  return executeSessionOperation(prisma, 'findUnique', {
    where: { id },
    ...options,
  });
}

export async function findSessionByToken(
  prisma: PrismaClient | PrismaTransactionClient,
  token: string,
  options: { select?: Prisma.SessionSelect; include?: Prisma.SessionInclude } = {},
) {
  return executeSessionOperation(prisma, 'findUnique', {
    where: { token },
    ...options,
  });
}

export async function findSessionsByUserId(
  prisma: PrismaClient | PrismaTransactionClient,
  userId: string,
  options: {
    select?: Prisma.SessionSelect;
    include?: Prisma.SessionInclude;
    orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  } = {},
) {
  return executeSessionOperation(prisma, 'findMany', {
    where: { userId },
    ...options,
  });
}

export async function findManySessions(
  prisma: PrismaClient | PrismaTransactionClient,
  options: {
    where?: Prisma.SessionWhereInput;
    select?: Prisma.SessionSelect;
    include?: Prisma.SessionInclude;
    orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  } = {},
) {
  return executeSessionOperation(prisma, 'findMany', options);
}

export async function findSessionsWithPagination(
  prisma: PrismaClient | PrismaTransactionClient,
  options: {
    where?: Prisma.SessionWhereInput;
    select?: Prisma.SessionSelect;
    include?: Prisma.SessionInclude;
    orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[];
    page?: number;
    limit?: number;
  } = {},
) {
  return executeWithPagination(prisma, 'findMany', options);
}

export async function updateSession(
  prisma: PrismaClient | PrismaTransactionClient,
  where: Prisma.SessionWhereUniqueInput,
  data: Prisma.SessionUpdateInput,
) {
  return executeSessionOperation(prisma, 'update', { where, data });
}

export async function updateManySessions(
  prisma: PrismaClient | PrismaTransactionClient,
  where: Prisma.SessionWhereInput,
  data: Prisma.SessionUpdateManyMutationInput,
) {
  return executeSessionOperation(prisma, 'updateMany', { where, data });
}

export async function upsertSession(
  prisma: PrismaClient | PrismaTransactionClient,
  where: Prisma.SessionWhereUniqueInput,
  create: Prisma.SessionCreateInput,
  update: Prisma.SessionUpdateInput,
) {
  return executeSessionOperation(prisma, 'upsert', { where, create, update });
}

export async function deleteSession(
  prisma: PrismaClient | PrismaTransactionClient,
  where: Prisma.SessionWhereUniqueInput,
) {
  return executeSessionOperation(prisma, 'delete', { where });
}

export async function deleteManySessions(
  prisma: PrismaClient | PrismaTransactionClient,
  where: Prisma.SessionWhereInput,
) {
  return executeSessionOperation(prisma, 'deleteMany', { where });
}

export async function deleteExpiredSessions(
  prisma: PrismaClient | PrismaTransactionClient,
  currentDate: Date = new Date(),
) {
  return executeSessionOperation(prisma, 'deleteMany', {
    where: {
      expiresAt: {
        lt: currentDate,
      },
    },
  });
}

export async function countSessions(
  prisma: PrismaClient | PrismaTransactionClient,
  where?: Prisma.SessionWhereInput,
) {
  return executeSessionOperation(prisma, 'count', { where });
}

//==============================================================================
// SESSION TYPE EXPORTS
//==============================================================================

export type SessionBasic = Prisma.SessionGetPayload<typeof sessionSelectBasic>;
export type SessionFull = Prisma.SessionGetPayload<typeof sessionSelectFull>;
export type SessionWithUser = Prisma.SessionGetPayload<typeof sessionWithUser>;
