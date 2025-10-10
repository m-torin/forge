import { Prisma, type PrismaClient } from '../../generated/client/client';
import type {
  PostOrderByWithRelationInput,
  PostUpdateManyMutationInput,
  PostWhereInput,
  PostWhereUniqueInput,
} from '../../generated/client/models';
import type { BatchPayload } from '../../generated/edge/internal/prismaNamespace';
import { postgresSearch } from '../types';
import {
  postOrderBy,
  postSelect,
  postValidation,
  postWhere,
  type PostBasic,
  type PostMinimal,
  type PostWithAuthor,
} from './fragments';
import { deleteGeneric, existsByIdGeneric } from './shared-operations';
import type {
  PaginatedResult,
  PaginationOptions,
  PrismaTransactionClient,
  SearchOptions,
  SearchResult,
} from './types';
import { monitoring, pagination, query, validation } from './utils';

// ==================== SMART DRY HELPERS ====================

/**
 * Smart generic function that handles all Prisma operations selectively
 */
async function executePostOperation<T = any>(
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
    where?: PostWhereInput | PostWhereUniqueInput;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: PostOrderByWithRelationInput;
    skip?: number;
    take?: number;
    create?: any;
    update?: any;
    validate?: boolean;
  } = {},
): Promise<T> {
  const { where, data, select, include, orderBy, skip, take, validate = true } = params;

  // Smart validation for operations that need it
  if (
    validate &&
    data &&
    (operation === 'create' || operation === 'update' || operation === 'upsert')
  ) {
    const validated = validation.validatePostInput({
      title: data.title || 'temp',
      ...data,
    });

    if (!validated.success && (operation === 'create' || data.title)) {
      throw new Error(`Validation failed: ${validated.errors.join(', ')}`);
    }
  }

  // Smart select/include handling
  const queryOptions: any = { where };
  if (select) queryOptions.select = select;
  if (include) queryOptions.include = include;
  if (orderBy) queryOptions.orderBy = orderBy;
  if (skip !== undefined) queryOptions.skip = skip;
  if (take !== undefined) queryOptions.take = take;

  // Execute operation selectively
  switch (operation) {
    case 'findUnique':
      return (prisma.post as any).findUnique(queryOptions);
    case 'findMany':
      return (prisma.post as any).findMany(queryOptions);
    case 'create':
      return (prisma.post as any).create({
        data: validate ? postValidation.createInput({ ...data, authorId: data.authorId }) : data,
        select: select || postSelect.basic,
      });
    case 'update':
      return (prisma.post as any).update({
        where,
        data: validate ? postValidation.updateInput(data) : data,
        select: select || postSelect.basic,
      });
    case 'delete':
      return (prisma.post as any).delete({ where, select: select || postSelect.basic });
    case 'count':
      return (prisma.post as any).count({ where });
    case 'upsert':
      return (prisma.post as any).upsert({
        where,
        create: validate
          ? postValidation.createInput({ ...params.create, authorId: params.create.authorId })
          : params.create,
        update: validate ? postValidation.updateInput(params.update) : params.update,
        select: select || postSelect.basic,
      });
    case 'createMany':
      return (prisma.post as any).createMany({ data, skipDuplicates: true });
    case 'updateMany':
      return (prisma.post as any).updateMany({ where, data });
    case 'deleteMany':
      return (prisma.post as any).deleteMany({ where });
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

/**
 * Smart pagination helper that works with any find operation
 */
async function executeWithPagination<T>(
  prisma: PrismaClient | PrismaTransactionClient,
  options: PaginationOptions & {
    where?: PostWhereInput;
    orderBy?: PostOrderByWithRelationInput;
    select?: any;
    include?: any;
  },
): Promise<PaginatedResult<T>> {
  const { skip, take, page, pageSize } = pagination.getOffsetLimit(options);

  const [data, total] = await Promise.all([
    executePostOperation<T[]>(prisma, 'findMany', {
      where: options.where,
      orderBy: options.orderBy || postOrderBy.newest,
      select: options.select || postSelect.basic,
      include: options.include,
      skip,
      take,
    }),
    executePostOperation<number>(prisma, 'count', { where: options.where }),
  ]);

  return pagination.createPaginatedResult(data, total, { page, pageSize });
}

/**
 * Smart where clause builder that combines conditions intelligently
 */
function buildSmartWhere(
  ...conditions: (PostWhereInput | undefined)[]
): PostWhereInput | undefined {
  return query.combineWhere(...conditions);
}

/**
 * Create a new post with validation
 */
export async function createPost(
  prisma: PrismaClient | PrismaTransactionClient,
  data: { title: string; content?: string; published?: boolean; authorId: string },
): Promise<PostBasic> {
  return executePostOperation<PostBasic>(prisma, 'create', { data });
}

/**
 * Create post with author connection (optimized)
 */
export async function createPostWithAuthor(
  prisma: PrismaClient | PrismaTransactionClient,
  data: { title: string; content?: string; published?: boolean; authorId: string },
): Promise<PostWithAuthor> {
  const validated = validation.validatePostInput(data);

  if (!validated.success) {
    throw new Error(`Validation failed: ${validated.errors.join(', ')}`);
  }

  return monitoring
    .timeQuery('createPostWithAuthor', async () => {
      return prisma.post.create({
        data: postValidation.createInput({ ...validated.sanitized!, authorId: data.authorId }),
        select: postSelect.withAuthor,
      });
    })
    .then(r => r.result);
}

/**
 * Find post by ID with optimized select
 */
export async function find(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<PostBasic | null> {
  return executePostOperation<PostBasic | null>(prisma, 'findUnique', {
    where: { id },
    select: postSelect.basic,
  });
}

/**
 * Find minimal post by ID (for references)
 */
export async function findPostByIdMinimal(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<PostMinimal | null> {
  return executePostOperation<PostMinimal | null>(prisma, 'findUnique', {
    where: { id },
    select: postSelect.minimal,
  });
}

/**
 * Find post by ID with author
 */
export async function findPostByIdWithAuthor(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<PostWithAuthor | null> {
  return executePostOperation<PostWithAuthor | null>(prisma, 'findUnique', {
    where: { id },
    select: postSelect.withAuthor,
  });
}

/**
 * Find many posts with pagination
 */
export async function findManyPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    where?: PostWhereInput;
    orderBy?: PostOrderByWithRelationInput;
    select?: typeof postSelect.basic | typeof postSelect.minimal | typeof postSelect.withAuthor;
  },
): Promise<PaginatedResult<PostBasic>> {
  return executeWithPagination<PostBasic>(prisma, {
    ...options,
    select: options?.select || postSelect.basic,
  });
}

/**
 * Find posts by author ID with pagination
 */
export async function findPostsByAuthorId(
  prisma: PrismaClient | PrismaTransactionClient,
  authorId: string,
  options?: PaginationOptions & {
    published?: boolean;
    orderBy?: PostOrderByWithRelationInput;
  },
): Promise<PaginatedResult<PostBasic>> {
  const whereClause = buildSmartWhere(
    { authorId },
    options?.published !== undefined ? { published: options.published } : undefined,
  );

  return executeWithPagination<PostBasic>(prisma, {
    ...options,
    where: whereClause,
  });
}

/**
 * Find published posts with pagination
 */
export async function findPublishedPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    authorId?: string;
    orderBy?: PostOrderByWithRelationInput;
  },
): Promise<PaginatedResult<PostBasic>> {
  const whereClause = {
    ...postWhere.published,
    ...(options?.authorId ? { authorId: options.authorId } : {}),
  };

  return findManyPosts(prisma, {
    ...options,
    where: whereClause,
    orderBy: options?.orderBy || postOrderBy.newest,
  });
}

/**
 * Find draft posts with pagination
 */
export async function findDraftPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  options?: PaginationOptions & {
    authorId?: string;
    orderBy?: PostOrderByWithRelationInput;
  },
): Promise<PaginatedResult<PostBasic>> {
  const whereClause = {
    ...postWhere.draft,
    ...(options?.authorId ? { authorId: options.authorId } : {}),
  };

  return findManyPosts(prisma, {
    ...options,
    where: whereClause,
    orderBy: options?.orderBy || postOrderBy.newest,
  });
}

/**
 * Search posts using PostgreSQL full-text search with performance optimization
 */
export async function searchPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  searchQuery: string,
  options?: SearchOptions,
): Promise<SearchResult<PostWithAuthor>> {
  const startTime = Date.now();

  if (!searchQuery.trim()) {
    return {
      data: [],
      query: searchQuery,
      searchTime: 0,
      totalMatches: 0,
      pagination: {
        page: 1,
        pageSize: options?.pageSize || 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }

  const { skip, take, page, pageSize } = pagination.getOffsetLimit(options || {});

  // Build search query using PostgreSQL search utilities
  const pgSearchQuery = options?.exact
    ? postgresSearch.phrase(searchQuery)
    : options?.fuzzy
      ? postgresSearch.or([
          postgresSearch.and([searchQuery]),
          postgresSearch.utils.fuzzy(searchQuery),
        ])
      : postgresSearch.and([searchQuery]);

  // Build where clause
  const searchWhere = {
    OR: [{ title: { search: pgSearchQuery } }, { content: { search: pgSearchQuery } }],
  };

  const whereClause = {
    ...searchWhere,
    ...(options?.published !== undefined ? { published: options.published } : {}),
    ...(options?.authorId ? { authorId: options.authorId } : {}),
  };

  // Execute search with relevance ordering
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: whereClause,
      orderBy: {
        _relevance: {
          fields: ['title', 'content'],
          search: searchQuery,
          sort: 'desc',
        },
      } as PostOrderByWithRelationInput,
      skip,
      take,
      select: postSelect.withAuthor,
    }),
    prisma.post.count({ where: whereClause }),
  ]);

  const searchTime = Date.now() - startTime;

  return {
    data: posts,
    query: searchQuery,
    searchTime,
    totalMatches: total,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page < Math.ceil(total / pageSize),
      hasPrevious: page > 1,
    },
  };
}

/**
 * Count posts with optional filtering
 */
export async function countPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  where?: Prisma.PostWhereInput,
): Promise<number> {
  return executePostOperation<number>(prisma, 'count', { where });
}

/**
 * Count published posts
 */
export async function countPublishedPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  where?: Prisma.PostWhereInput,
): Promise<number> {
  return executePostOperation<number>(prisma, 'count', {
    where: buildSmartWhere(postWhere.published, where),
  });
}

/**
 * Count draft posts
 */
export async function countDraftPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  where?: Prisma.PostWhereInput,
): Promise<number> {
  return executePostOperation<number>(prisma, 'count', {
    where: buildSmartWhere(postWhere.draft, where),
  });
}

/**
 * Update post by ID with validation
 */
export async function update(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
  data: { title?: string; content?: string; published?: boolean },
): Promise<PostBasic> {
  return executePostOperation<PostBasic>(prisma, 'update', { where: { id }, data });
}

/**
 * Update many posts
 */
export async function updateManyPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  where: PostWhereInput,
  data: PostUpdateManyMutationInput,
): Promise<BatchPayload> {
  return executePostOperation<Prisma.BatchPayload>(prisma, 'updateMany', { where, data });
}

/**
 * Publish post by ID
 */
export async function publishPostById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<PostBasic> {
  return executePostOperation<PostBasic>(prisma, 'update', {
    where: { id },
    data: { published: true },
  });
}

/**
 * Unpublish post by ID
 */
export async function unpublishPostById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<PostBasic> {
  return executePostOperation<PostBasic>(prisma, 'update', {
    where: { id },
    data: { published: false },
  });
}

/**
 * Publish many posts
 */
export async function publishManyPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  where: PostWhereInput,
): Promise<BatchPayload> {
  return executePostOperation<Prisma.BatchPayload>(prisma, 'updateMany', {
    where,
    data: { published: true },
  });
}

/**
 * Unpublish many posts
 */
export async function unpublishManyPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  where: PostWhereInput,
): Promise<BatchPayload> {
  return executePostOperation<Prisma.BatchPayload>(prisma, 'updateMany', {
    where,
    data: { published: false },
  });
}

/**
 * Upsert post with validation
 */
export async function upsertPost(
  prisma: PrismaClient | PrismaTransactionClient,
  where: PostWhereUniqueInput,
  create: { title: string; content?: string; published?: boolean; authorId: string },
  update: { title?: string; content?: string; published?: boolean },
): Promise<PostBasic> {
  return executePostOperation<PostBasic>(prisma, 'upsert', {
    where,
    create,
    update,
    validate: true,
    select: postSelect.basic,
  });
}

/**
 * Delete post by ID
 */
export async function deleteById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<PostBasic> {
  return deleteGeneric(prisma.post as any, { where: { id }, select: postSelect.basic });
}

/**
 * Delete many posts
 */
export async function deleteManyPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  where: PostWhereInput,
): Promise<BatchPayload> {
  return executePostOperation<Prisma.BatchPayload>(prisma, 'deleteMany', { where });
}

/**
 * Delete all posts by author
 */
export async function deletePostsByAuthorId(
  prisma: PrismaClient | PrismaTransactionClient,
  authorId: string,
): Promise<BatchPayload> {
  return executePostOperation<Prisma.BatchPayload>(prisma, 'deleteMany', {
    where: { authorId },
  });
}

/**
 * Check if post exists by ID
 */
export async function postExistsById(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<boolean> {
  return existsByIdGeneric(prisma as any, 'post', id);
}

/**
 * Get latest posts with optimization (with author)
 */
export async function findLatestPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  limit: number,
  options: {
    published?: boolean;
    authorId?: string;
    includeAuthor: true;
  },
): Promise<PostWithAuthor[]>;

/**
 * Get latest posts with optimization (basic)
 */
export async function findLatestPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  limit?: number,
  options?: {
    published?: boolean;
    authorId?: string;
    includeAuthor?: false;
  },
): Promise<PostBasic[]>;

/**
 * Get latest posts with optimization (implementation)
 */
export async function findLatestPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  limit: number = 10,
  options?: {
    published?: boolean;
    authorId?: string;
    includeAuthor?: boolean;
  },
): Promise<PostBasic[] | PostWithAuthor[]> {
  const whereClause = {
    ...(options?.published !== undefined ? { published: options.published } : {}),
    ...(options?.authorId ? { authorId: options.authorId } : {}),
  };

  return prisma.post.findMany({
    where: whereClause,
    orderBy: postOrderBy.newest,
    take: Math.min(limit, 100), // Cap at 100
    select: options?.includeAuthor ? postSelect.withAuthor : postSelect.basic,
  }) as any;
}

/**
 * Get popular posts (published, recent)
 */
export async function findPopularPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  limit: number = 10,
  options?: {
    authorId?: string;
    includeAuthor?: boolean;
  },
): Promise<PostBasic[] | PostWithAuthor[]> {
  return findLatestPosts(prisma, limit, {
    ...options,
    published: true,
  } as any);
}

/**
 * Bulk create posts with validation and monitoring
 */
export async function createManyPosts(
  prisma: PrismaClient | PrismaTransactionClient,
  data: Array<{ title: string; content?: string; published?: boolean; authorId: string }>,
): Promise<BatchPayload> {
  // Validate all items first
  const validatedItems = data.map(item => {
    const validated = validation.validatePostInput(item);
    if (!validated.success) {
      throw new Error(`Validation failed for "${item.title}": ${validated.errors.join(', ')}`);
    }
    return {
      title: validated.sanitized!.title,
      content: validated.sanitized!.content,
      published: (validated.sanitized as any)?.published ?? item.published ?? false,
      authorId: item.authorId,
    };
  });

  return monitoring
    .timeQuery('createManyPosts', async () => {
      return prisma.post.createMany({
        data: validatedItems,
        skipDuplicates: true,
      });
    })
    .then(r => r.result);
}
