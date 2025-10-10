import { deleteGeneric } from '../shared-operations';
import type {
  Article,
  ArticleCreateInput,
  ArticleInclude,
  ArticleOrderByWithRelationInput,
  ArticleUpdateInput,
  ArticleWhereInput,
} from '../types/community';
import type {
  PaginatedResult,
  PaginationOptions,
  PrismaClient,
  PrismaTransactionClient,
} from '../types/shared';
import { pagination, validation } from '../utils';

/* Article ORM functions */
export async function create(
  prisma: PrismaClient | PrismaTransactionClient,
  data: ArticleCreateInput,
): Promise<Article> {
  return prisma.article.create({ data: validation.sanitizeInput(data) });
}

export async function find(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  include?: ArticleInclude,
): Promise<Article | null> {
  return prisma.article.findUnique({ where: { id }, include });
}

export async function findMany(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    where?: ArticleWhereInput;
    orderBy?: ArticleOrderByWithRelationInput;
    include?: ArticleInclude;
  },
): Promise<PaginatedResult<Article>> {
  const { skip, take, page, pageSize } = pagination.getOffsetLimit(options || {});

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: options?.include,
      skip,
      take,
    }),
    prisma.article.count({ where: options?.where }),
  ]);

  return pagination.createPaginatedResult(items, total, { page, pageSize });
}

export async function update(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  data: ArticleUpdateInput,
): Promise<Article> {
  return prisma.article.update({
    where: { id },
    data: validation.sanitizeInput(data),
  });
}

export async function deleteById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<Article> {
  return deleteGeneric(prisma.article as any, { where: { id } });
}
