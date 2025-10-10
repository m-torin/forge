/**
 * Core shared operations: executeOperation, pagination, error, retry, and input sanitization
 */
import type { PrismaClient, PrismaTransactionClient } from '../types/shared';
import type { CompoundKeyPattern } from './compound';
import { handleCompoundKeys } from './compound';

// Internal sanitization utility
function sanitizeInput(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === null || sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = (sanitized[key] as string).trim();
    }
  });
  return sanitized;
}

export async function executeOperation<T = any>(
  prisma: PrismaClient | PrismaTransactionClient,
  modelName: string,
  operation: string,
  params: {
    where?: any;
    data?: any;
    select?: any;
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    create?: any;
    update?: any;
    validate?: boolean;
  } = {},
  options: {
    maxTake?: number;
    defaultOrderBy?: any;
    compoundKeyPattern?: CompoundKeyPattern;
  } = {},
): Promise<T> {
  const args: any = {};
  if (params.where) {
    args.where = handleCompoundKeys(params.where, options.compoundKeyPattern);
  }
  if (params.data) {
    args.data = params.validate ? sanitizeInput(params.data) : params.data;
  }
  if (params.create) {
    args.create = params.validate ? sanitizeInput(params.create) : params.create;
  }
  if (params.update) {
    args.update = params.validate ? sanitizeInput(params.update) : params.update;
  }
  if (params.include) {
    args.include = params.include;
  } else if (params.select) {
    args.select = params.select;
  }
  if (operation === 'findMany') {
    if (params.orderBy) {
      args.orderBy = params.orderBy;
    } else if (options.defaultOrderBy) {
      args.orderBy = options.defaultOrderBy;
    }
    if (params.skip !== undefined) args.skip = params.skip;
    if (params.take !== undefined) {
      args.take = Math.min(params.take, options.maxTake || 100);
    }
  }
  try {
    const model = (prisma as any)[modelName];
    if (!model) {
      throw new Error(`Model '${modelName}' not found on Prisma client`);
    }
    const operationFn = model[operation];
    if (!operationFn) {
      throw new Error(`Operation '${operation}' not found on model '${modelName}'`);
    }
    return await operationFn(args);
  } catch (error) {
    throw new OperationError({
      modelName,
      operation,
      params: args,
      originalError: error,
      context: `Failed to execute ${operation} on ${modelName}`,
    });
  }
}

export async function executeWithPagination<T>(
  prisma: PrismaClient | PrismaTransactionClient,
  modelName: string,
  options: {
    where?: any;
    orderBy?: any;
    select?: any;
    include?: any;
    page?: number;
    pageSize?: number;
    maxPageSize?: number;
    compoundKeyPattern?: CompoundKeyPattern;
  } = {},
): Promise<{
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}> {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(options.pageSize || 20, options.maxPageSize || 100);
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    executeOperation<T[]>(
      prisma,
      modelName,
      'findMany',
      {
        where: options.where,
        orderBy: options.orderBy,
        select: options.select,
        include: options.include,
        skip,
        take: pageSize,
      },
      { compoundKeyPattern: options.compoundKeyPattern },
    ),
    executeOperation<number>(
      prisma,
      modelName,
      'count',
      { where: options.where },
      { compoundKeyPattern: options.compoundKeyPattern },
    ),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

export class OperationError extends Error {
  public readonly modelName: string;
  public readonly operation: string;
  public readonly params: any;
  public readonly originalError: unknown;
  public readonly context: string;

  constructor(options: {
    modelName: string;
    operation: string;
    params: any;
    originalError: unknown;
    context: string;
  }) {
    const message = `${options.context}: ${
      options.originalError instanceof Error
        ? options.originalError.message
        : String(options.originalError)
    }`;
    super(message);
    this.name = 'OperationError';
    this.modelName = options.modelName;
    this.operation = options.operation;
    this.params = options.params;
    this.originalError = options.originalError;
    this.context = options.context;
  }

  getDetails(): {
    modelName: string;
    operation: string;
    params: any;
    originalError: unknown;
    context: string;
    stack?: string;
  } {
    return {
      modelName: this.modelName,
      operation: this.operation,
      params: this.params,
      originalError: this.originalError,
      context: this.context,
      stack: this.stack,
    };
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    retryIf?: (error: unknown) => boolean;
  } = {},
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.delay || 1000;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (options.retryIf && !options.retryIf(error)) {
        throw error;
      }
      if (attempt === maxRetries) {
        break;
      }
      const delay = options.backoff ? baseDelay * Math.pow(2, attempt - 1) : baseDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
