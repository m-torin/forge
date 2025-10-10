/**
 * Model helper factory - produces strongly-typed helpers for a Prisma model delegate
 * PoC for Story model usage
 */
import {
  existsBySlugCI,
  existsFirstGeneric,
  existsGeneric,
  searchByContainsCI,
  transactionArray as sharedTransactionArray,
  transactionInteractive as sharedTransactionInteractive,
  transactionWithRetry as sharedTransactionWithRetry,
} from '../shared-operations';
import type {
  PaginatedResult,
  PaginationOptions,
  PrismaClient,
  PrismaTransactionClient,
} from '../types/shared';
import { pagination } from '../utils';

export function createModelHelpers<
  ItemType,
  D extends {
    findUnique?: (args: any) => Promise<any>;
    findFirst?: (args: any) => Promise<any>;
    findMany?: (args: any) => Promise<any[]>;
    create?: (args: any) => Promise<any>;
    createMany?: (args: any) => Promise<any>;
    update?: (args: any) => Promise<any>;
    updateMany?: (args: any) => Promise<any>;
    delete?: (args: any) => Promise<any>;
    deleteMany?: (args: any) => Promise<any>;
    count?: (args: any) => Promise<number>;
    upsert?: (args: any) => Promise<any>;
    aggregate?: (args: any) => Promise<any>;
    groupBy?: (args: any) => Promise<any>;
  },
>(
  delegate: D,
  options: {
    slugField?: string;
    defaultOrderBy?: any;
    maxPageSize?: number;
  } = {},
) {
  const slugField = options.slugField || 'slug';
  const defaultOrderBy = options.defaultOrderBy;
  const maxPageSize = options.maxPageSize || 100;

  // Strongly-typed delegate function aliases derived from the incoming delegate type D
  type FindUniqueFn = NonNullable<D['findUnique']>;
  type FindFirstFn = NonNullable<D['findFirst']>;
  type FindManyFn = NonNullable<D['findMany']>;
  type CreateFn = NonNullable<D['create']>;
  type CreateManyFn = NonNullable<D['createMany']>;
  type UpdateFn = NonNullable<D['update']>;
  type UpdateManyFn = NonNullable<D['updateMany']>;
  type DeleteFn = NonNullable<D['delete']>;
  type DeleteManyFn = NonNullable<D['deleteMany']>;
  type CountFn = NonNullable<D['count']>;
  type UpsertFn = NonNullable<D['upsert']>;
  type AggregateFn = NonNullable<D['aggregate']>;
  type GroupByFn = NonNullable<D['groupBy']>;

  type FindUniqueArgs = Parameters<FindUniqueFn>[0];
  type FindUniqueReturn = Awaited<ReturnType<FindUniqueFn>>;
  type FindFirstArgs = Parameters<FindFirstFn>[0];
  type FindFirstReturn = Awaited<ReturnType<FindFirstFn>>;
  type FindManyArgs = Parameters<FindManyFn>[0];
  type FindManyReturn = Awaited<ReturnType<FindManyFn>>;
  type CreateArgs = Parameters<CreateFn>[0];
  type CreateReturn = Awaited<ReturnType<CreateFn>>;
  type CreateManyArgs = Parameters<CreateManyFn>[0];
  type UpdateArgs = Parameters<UpdateFn>[0];
  type UpdateReturn = Awaited<ReturnType<UpdateFn>>;
  type DeleteArgs = Parameters<DeleteFn>[0];
  type CountArgs = Parameters<CountFn>[0];
  type DeleteManyArgs = Parameters<DeleteManyFn>[0];
  type UpdateManyArgs = Parameters<UpdateManyFn>[0];
  type UpsertArgs = Parameters<UpsertFn>[0];
  type UpsertReturn = Awaited<ReturnType<UpsertFn>>;

  return {
    // create supports either full Prisma create args or the legacy (data, opts) form
    create(
      argsOrData: CreateArgs | (CreateArgs extends { data: infer U } ? U : any),
      maybeOpts?: Partial<Omit<CreateArgs, 'data' | 'where'>> & { omit?: any },
    ): Promise<CreateReturn> {
      const createFn = delegate.create as CreateFn;
      if (argsOrData && typeof argsOrData === 'object' && 'data' in argsOrData) {
        // full Prisma args passed
        return createFn(argsOrData as CreateArgs) as Promise<CreateReturn>;
      }
      const data = argsOrData as any;
      const opts = maybeOpts as any;
      const args = { data } as any;
      if (opts && typeof opts === 'object') {
        const copy = { ...opts } as any;
        // do not allow overriding data/where from opts in shorthand mode
        delete copy.where;
        delete copy.data;
        Object.assign(args, copy);
      }
      return createFn(args as CreateArgs) as Promise<CreateReturn>;
    },

    // createMany supports full Prisma args or shorthand (array, opts)
    createMany(argsOrData: CreateManyArgs | any, maybeOpts?: any & { omit?: any }) {
      const fn = delegate.createMany as CreateManyFn;
      if (argsOrData && typeof argsOrData === 'object' && 'data' in argsOrData) {
        return fn(argsOrData as CreateManyArgs) as Promise<Awaited<ReturnType<CreateManyFn>>>;
      }
      const data = argsOrData;
      const opts = maybeOpts;
      const args: any = { data };
      if (opts && typeof opts === 'object') {
        Object.assign(args, opts);
      }
      return fn(args as CreateManyArgs) as Promise<Awaited<ReturnType<CreateManyFn>>>;
    },

    // find supports full Prisma findUnique args or legacy (id, include?) form
    find(argOrWhere: FindUniqueArgs | any, include?: any & { omit?: any }) {
      const fn = delegate.findUnique as FindUniqueFn;
      if (argOrWhere && typeof argOrWhere === 'object' && 'where' in argOrWhere) {
        return fn(argOrWhere as FindUniqueArgs) as Promise<FindUniqueReturn>;
      }
      const id = argOrWhere;
      return fn({ where: { id }, include } as FindUniqueArgs) as Promise<FindUniqueReturn>;
    },

    // findBySlug - supports all standard Prisma options (include/select/orderBy/cursor/skip/take/etc)
    findBySlug(slug: string, opts: any & { omit?: any } = {}) {
      const args: any = {
        where: { [slugField]: { equals: slug, mode: 'insensitive' } },
      };
      for (const k in opts) {
        if (k === 'where') continue;
        args[k] = opts[k];
      }
      const fn = delegate.findFirst as FindFirstFn;
      return fn(args as FindFirstArgs) as Promise<FindFirstReturn>;
    },

    // findManyPaginated supports page/pageSize or direct skip/take and forwards all valid Prisma findMany options
    async findManyPaginated(
      opts: PaginationOptions & Partial<FindManyArgs> & { omit?: any } = {},
    ): Promise<PaginatedResult<ItemType>> {
      const {
        skip: paginationSkip,
        take: paginationTake,
        page,
        pageSize,
      } = pagination.getOffsetLimit(opts || {});
      const args: Partial<FindManyArgs> = {} as Partial<FindManyArgs>;
      if ((opts as any).where) {
        (args as any).where = (opts as any).where;
      }
      if ((opts as any).include) {
        (args as any).include = (opts as any).include;
      } else if ((opts as any).select) {
        (args as any).select = (opts as any).select;
      }

      // copy other Prisma-friendly top-level keys (cursor, distinct, relationLoadStrategy, etc.)
      for (const k in opts) {
        if (['where', 'include', 'select', 'page', 'pageSize', 'skip', 'take'].includes(k))
          continue;
        (args as any)[k] = (opts as any)[k];
      }

      (args as any).orderBy = (opts as any).orderBy || defaultOrderBy;
      const skip = (opts as any).skip !== undefined ? (opts as any).skip : paginationSkip;
      const take =
        (opts as any).take !== undefined
          ? Math.min((opts as any).take, maxPageSize)
          : paginationTake !== undefined
            ? Math.min(paginationTake, maxPageSize)
            : undefined;
      if (skip !== undefined) {
        (args as any).skip = skip;
      }
      if (take !== undefined) {
        (args as any).take = take;
      }

      const findManyFn = delegate.findMany as FindManyFn;
      const countFn = delegate.count as CountFn;
      const [items, total] = await Promise.all([
        findManyFn(args as FindManyArgs),
        countFn({ where: (opts as any).where } as CountArgs),
      ]);

      return pagination.createPaginatedResult(items as any, total, { page, pageSize });
    },

    // searchByName forwards extended Prisma options to the CI search helper
    async searchByName(
      searchTerm: string,
      opts: PaginationOptions & Partial<FindManyArgs> & { omit?: any } = {},
    ): Promise<PaginatedResult<ItemType>> {
      const {
        skip: paginationSkip,
        take: paginationTake,
        page,
        pageSize,
      } = pagination.getOffsetLimit(opts || {});
      const searchOpts: any = {
        where: (opts as any).where,
      };

      if ((opts as any).include) searchOpts.include = (opts as any).include;
      else if ((opts as any).select) searchOpts.select = (opts as any).select;

      // copy other Prisma-friendly top-level keys (orderBy, cursor, distinct, relationLoadStrategy, etc.)
      for (const k in opts) {
        if (['where', 'include', 'select', 'page', 'pageSize', 'skip', 'take'].includes(k))
          continue;
        searchOpts[k] = (opts as any)[k];
      }

      searchOpts.orderBy = (opts as any).orderBy || defaultOrderBy;
      searchOpts.skip = (opts as any).skip !== undefined ? (opts as any).skip : paginationSkip;
      searchOpts.take =
        (opts as any).take !== undefined
          ? Math.min((opts as any).take, maxPageSize)
          : paginationTake !== undefined
            ? Math.min(paginationTake, maxPageSize)
            : undefined;

      const { items, total } = await searchByContainsCI(
        delegate as any,
        'name',
        searchTerm,
        searchOpts,
      );
      return pagination.createPaginatedResult(items, total, { page, pageSize });
    },

    // update supports either full Prisma update args or legacy (id, data, opts)
    update(argOrWhere: UpdateArgs | any, dataOrOpts?: any, maybeOpts?: any & { omit?: any }) {
      // If caller passed a single full-args object (where + data), treat it as passthrough
      if (
        dataOrOpts === undefined &&
        maybeOpts === undefined &&
        argOrWhere &&
        typeof argOrWhere === 'object' &&
        'where' in argOrWhere &&
        'data' in argOrWhere
      ) {
        const fn = delegate.update as UpdateFn;
        return fn(argOrWhere as UpdateArgs) as Promise<UpdateReturn>;
      }
      const id = argOrWhere as any;
      const data = dataOrOpts as any;
      const opts = maybeOpts as any;
      const args: any = { where: { id }, data };
      if (opts && typeof opts === 'object') {
        const copy = { ...opts } as any;
        delete copy.where;
        delete copy.data;
        Object.assign(args, copy);
      }
      const fn = delegate.update as UpdateFn;
      return fn(args as UpdateArgs) as Promise<UpdateReturn>;
    },

    // updateBySlug implemented here so callers can pass full Prisma options
    async updateBySlug(slug: string, data: any, opts: any & { omit?: any } = {}) {
      const found = await (delegate.findFirst as FindFirstFn)({
        where: { [slugField]: { equals: slug, mode: 'insensitive' } },
        select: { id: true },
      } as FindFirstArgs);
      if (!found) {
        throw new Error(`Record not found for ${slugField} (case-insensitive)`);
      }
      const args: any = { where: { id: (found as any).id }, data };
      for (const k in opts) {
        if (k === 'where' || k === 'data') continue;
        args[k] = opts[k];
      }
      const fn = delegate.update as UpdateFn;
      return fn(args as UpdateArgs) as Promise<UpdateReturn>;
    },

    // deleteById supports either full Prisma delete args or legacy id param
    deleteById(argOrWhere: DeleteArgs | any) {
      const fn = delegate.delete as DeleteFn;
      if (argOrWhere && typeof argOrWhere === 'object' && 'where' in argOrWhere) {
        return fn(argOrWhere as DeleteArgs) as Promise<Awaited<ReturnType<DeleteFn>>>;
      }
      const id = argOrWhere;
      return fn({ where: { id } } as DeleteArgs) as Promise<Awaited<ReturnType<DeleteFn>>>;
    },

    // deleteBySlug implemented here so callers can pass full Prisma options
    async deleteBySlug(slug: string, opts: any & { omit?: any } = {}) {
      const found = await (delegate.findFirst as FindFirstFn)({
        where: { [slugField]: { equals: slug, mode: 'insensitive' } },
        select: { id: true },
      } as FindFirstArgs);
      if (!found) {
        throw new Error(`Record not found for ${slugField} (case-insensitive)`);
      }
      const args: any = { where: { id: (found as any).id } };
      for (const k in opts) {
        if (k === 'where') continue;
        args[k] = opts[k];
      }
      const fn = delegate.delete as DeleteFn;
      return fn(args as DeleteArgs) as Promise<Awaited<ReturnType<DeleteFn>>>;
    },

    // deleteMany forwards to delegate.deleteMany
    deleteMany(args: Parameters<DeleteManyFn>[0]) {
      const fn = delegate.deleteMany as DeleteManyFn;
      return fn(args as Parameters<DeleteManyFn>[0]) as Promise<Awaited<ReturnType<DeleteManyFn>>>;
    },

    // updateMany forwards to delegate.updateMany
    updateMany(args: Parameters<UpdateManyFn>[0]) {
      const fn = delegate.updateMany as UpdateManyFn;
      return fn(args as Parameters<UpdateManyFn>[0]) as Promise<Awaited<ReturnType<UpdateManyFn>>>;
    },

    // count supports either full Prisma count args or legacy where
    count(argsOrWhere?: CountArgs | any) {
      const fn = delegate.count as CountFn;
      if (
        argsOrWhere &&
        typeof argsOrWhere === 'object' &&
        ('where' in argsOrWhere || 'select' in argsOrWhere)
      ) {
        return fn(argsOrWhere as CountArgs) as Promise<number>;
      }
      return fn({ where: argsOrWhere } as CountArgs) as Promise<number>;
    },

    // existsById supports either full findUnique/findFirst args or legacy id
    existsById(argOrWhere: any) {
      if (argOrWhere && typeof argOrWhere === 'object' && 'where' in argOrWhere) {
        return existsGeneric(delegate as any, argOrWhere as any) as Promise<boolean>;
      }
      return existsGeneric(
        delegate as any,
        { where: { id: argOrWhere }, select: { id: true } } as any,
      ) as Promise<boolean>;
    },

    existsBySlug(slug: string) {
      return existsBySlugCI(delegate as any, slugField, slug) as Promise<boolean>;
    },

    existsByName(name: string) {
      return existsFirstGeneric(
        delegate as any,
        {
          where: { name: { equals: name, mode: 'insensitive' } },
          select: { id: true },
        } as any,
      ) as Promise<boolean>;
    },

    // aggregate forwards to delegate.aggregate
    aggregate(args: Parameters<AggregateFn>[0]) {
      const fn = delegate.aggregate as AggregateFn;
      return fn(args as Parameters<AggregateFn>[0]) as Promise<Awaited<ReturnType<AggregateFn>>>;
    },

    // groupBy forwards to delegate.groupBy
    groupBy(args: Parameters<GroupByFn>[0]) {
      const fn = delegate.groupBy as GroupByFn;
      return fn(args as Parameters<GroupByFn>[0]) as Promise<Awaited<ReturnType<GroupByFn>>>;
    },

    // upsert supports either full Prisma upsert args or legacy (where, create, update, opts)
    upsert(
      whereOrArgs: UpsertArgs | any,
      createData?: any,
      updateData?: any,
      maybeOpts?: any & { omit?: any },
    ) {
      const fn = delegate.upsert as UpsertFn;
      if (
        whereOrArgs &&
        typeof whereOrArgs === 'object' &&
        'where' in whereOrArgs &&
        'create' in whereOrArgs &&
        'update' in whereOrArgs &&
        createData === undefined &&
        updateData === undefined &&
        maybeOpts === undefined
      ) {
        return fn(whereOrArgs as UpsertArgs) as Promise<Awaited<ReturnType<UpsertFn>>>;
      }
      const where = whereOrArgs;
      const opts = maybeOpts;
      const args: any = { where, create: createData, update: updateData };
      if (opts && typeof opts === 'object') {
        const copy = { ...opts } as any;
        delete copy.where;
        delete copy.create;
        delete copy.update;
        Object.assign(args, copy);
      }
      return fn(args as UpsertArgs) as Promise<Awaited<ReturnType<UpsertFn>>>;
    },

    // upsertBySlug implemented here to forward arbitrary Prisma options
    async upsertBySlug(
      slug: string,
      createData: any,
      updateData: any,
      opts: any & { omit?: any } = {},
    ) {
      const found = await (delegate.findFirst as FindFirstFn)({
        where: { [slugField]: { equals: slug, mode: 'insensitive' } },
        select: { id: true },
      } as FindFirstArgs);
      if (found) {
        const args: any = { where: { id: (found as any).id }, data: updateData };
        for (const k in opts) {
          if (k === 'where' || k === 'data') continue;
          args[k] = opts[k];
        }
        const fn = delegate.update as UpdateFn;
        return fn(args as UpdateArgs) as Promise<Awaited<ReturnType<UpdateFn>>>;
      }
      const createArgs: any = { data: createData };
      for (const k in opts) {
        if (k === 'where' || k === 'data') continue;
        createArgs[k] = opts[k];
      }
      const fnCreate = delegate.create as CreateFn;
      return fnCreate(createArgs as CreateArgs) as Promise<Awaited<ReturnType<CreateFn>>>;
    },

    // Transaction helpers (require a Prisma client instance)
    transactionArray<T = any>(
      prisma: PrismaClient | PrismaTransactionClient,
      queries: any[],
      options?: any,
    ): Promise<T[]> {
      return sharedTransactionArray<T>(prisma, queries, options);
    },

    transactionInteractive<T = any>(
      prisma: PrismaClient | PrismaTransactionClient,
      fn: (tx: PrismaTransactionClient) => Promise<T>,
      options?: any,
    ): Promise<T> {
      return sharedTransactionInteractive<T>(prisma, fn, options);
    },

    transactionWithRetry<T = any>(
      prisma: PrismaClient | PrismaTransactionClient,
      fn: (tx: PrismaTransactionClient) => Promise<T>,
      txOptions: any = {},
      retryOptions: {
        maxRetries?: number;
        delay?: number;
        backoff?: boolean;
        retryIf?: (err: any) => boolean;
      } = {},
    ): Promise<T> {
      return sharedTransactionWithRetry<T>(prisma, fn, txOptions, retryOptions);
    },
  };
}
