import { deleteGeneric } from '../shared-operations';
import type {
  CompanyContent,
  CompanyContentCreateInput,
  CompanyContentInclude,
  CompanyContentOrderByWithRelationInput,
  CompanyContentUpdateInput,
  CompanyContentWhereInput,
} from '../types/cms';
import type {
  PaginatedResult,
  PaginationOptions,
  PrismaClient,
  PrismaTransactionClient,
} from '../types/shared';
import { pagination, validation } from '../utils';

// ==================== COMPANY CONTENT ORM FUNCTIONS ====================

export async function create(
  prisma: PrismaClient | PrismaTransactionClient,
  data: CompanyContentCreateInput,
): Promise<CompanyContent> {
  return prisma.companyContent.create({ data: validation.sanitizeInput(data) });
}

export async function find(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  include?: CompanyContentInclude,
): Promise<CompanyContent | null> {
  return prisma.companyContent.findUnique({ where: { id }, include });
}

export async function findBySlug(
  prisma: PrismaClient | PrismaTransactionClient,
  slug: string,
  include?: CompanyContentInclude,
): Promise<CompanyContent | null> {
  return prisma.companyContent.findUnique({ where: { slug }, include });
}

export async function findMany(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    where?: CompanyContentWhereInput;
    orderBy?: CompanyContentOrderByWithRelationInput;
    include?: CompanyContentInclude;
  },
): Promise<PaginatedResult<CompanyContent>> {
  const { skip, take, page, pageSize } = pagination.getOffsetLimit(options || {});

  const [items, total] = await Promise.all([
    prisma.companyContent.findMany({
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: options?.include,
      skip,
      take,
    }),
    prisma.companyContent.count({ where: options?.where }),
  ]);

  return pagination.createPaginatedResult(items, total, { page, pageSize });
}

export async function update(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  data: CompanyContentUpdateInput,
): Promise<CompanyContent> {
  return prisma.companyContent.update({
    where: { id },
    data: validation.sanitizeInput(data),
  });
}

export async function deleteById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<CompanyContent> {
  return deleteGeneric(prisma.companyContent as any, { where: { id } });
}

export async function publish(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<CompanyContent> {
  return prisma.companyContent.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
}

export async function unpublish(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<CompanyContent> {
  return prisma.companyContent.update({
    where: { id },
    data: {
      status: 'DRAFT',
      publishedAt: null,
    },
  });
}
