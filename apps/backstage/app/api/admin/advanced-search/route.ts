import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { modelConfigs } from '../../../(authenticated)/admin/lib/prisma-model-config';

interface SearchFilter {
  field: string;
  operator: string;
  value: any;
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      modelName, 
      filters = [], 
      sortBy, 
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      include = {}
    } = body;

    if (!modelName) {
      return NextResponse.json({ error: 'Missing model name' }, { status: 400 });
    }

    // Validate model exists
    const modelConfig = modelConfigs.find(config => config.name === modelName);
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model name' }, { status: 400 });
    }

    // Get database delegate
    const delegate = (database as any)[modelName];
    if (!delegate) {
      return NextResponse.json({ error: 'Model not found in database' }, { status: 400 });
    }

    // Build Prisma where clause from filters
    const where = buildWhereClause(filters);

    // Build orderBy clause
    const orderBy = buildOrderByClause(sortBy, sortOrder, modelConfig);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search
    const [records, total] = await Promise.all([
      delegate.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include,
      }),
      delegate.count({ where }),
    ]);

    return NextResponse.json({
      records,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildWhereClause(filters: SearchFilter[]): any {
  const where: any = {};
  const conditions: any[] = [];

  for (const filter of filters) {
    const condition = buildFilterCondition(filter);
    if (condition) {
      conditions.push(condition);
    }
  }

  if (conditions.length === 0) {
    return where;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { AND: conditions };
}

function buildFilterCondition(filter: SearchFilter): any {
  const { field, operator, value, type } = filter;

  if (!field || !operator) {
    return null;
  }

  switch (operator) {
    case 'equals':
      return { [field]: { equals: convertValue(value, type) } };

    case 'notEquals':
      return { [field]: { not: convertValue(value, type) } };

    case 'contains':
      return { [field]: { contains: value, mode: 'insensitive' } };

    case 'notContains':
      return { [field]: { not: { contains: value, mode: 'insensitive' } } };

    case 'startsWith':
      return { [field]: { startsWith: value, mode: 'insensitive' } };

    case 'endsWith':
      return { [field]: { endsWith: value, mode: 'insensitive' } };

    case 'gt':
      return { [field]: { gt: convertValue(value, type) } };

    case 'gte':
      return { [field]: { gte: convertValue(value, type) } };

    case 'lt':
      return { [field]: { lt: convertValue(value, type) } };

    case 'lte':
      return { [field]: { lte: convertValue(value, type) } };

    case 'between':
      if (value?.min !== undefined && value?.max !== undefined) {
        return {
          [field]: {
            gte: convertValue(value.min, type),
            lte: convertValue(value.max, type),
          },
        };
      }
      break;

    case 'notBetween':
      if (value?.min !== undefined && value?.max !== undefined) {
        return {
          OR: [
            { [field]: { lt: convertValue(value.min, type) } },
            { [field]: { gt: convertValue(value.max, type) } },
          ],
        };
      }
      break;

    case 'before':
      return { [field]: { lt: new Date(value) } };

    case 'after':
      return { [field]: { gt: new Date(value) } };

    case 'in':
      if (Array.isArray(value)) {
        return { [field]: { in: value.map(v => convertValue(v, type)) } };
      }
      break;

    case 'notIn':
      if (Array.isArray(value)) {
        return { [field]: { notIn: value.map(v => convertValue(v, type)) } };
      }
      break;

    case 'isEmpty':
      return {
        OR: [
          { [field]: { equals: null } },
          { [field]: { equals: '' } },
        ],
      };

    case 'isNotEmpty':
      return {
        AND: [
          { [field]: { not: null } },
          { [field]: { not: '' } },
        ],
      };

    case 'isNull':
      return { [field]: { equals: null } };

    case 'isNotNull':
      return { [field]: { not: null } };

    // Date-specific operators
    case 'today':
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      return {
        [field]: {
          gte: startOfDay,
          lt: endOfDay,
        },
      };

    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
      return {
        [field]: {
          gte: startOfYesterday,
          lt: endOfYesterday,
        },
      };

    case 'thisWeek':
      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);
      return {
        [field]: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      };

    case 'lastWeek':
      const nowLW = new Date();
      const startOfLastWeek = new Date(nowLW.getFullYear(), nowLW.getMonth(), nowLW.getDate() - nowLW.getDay() - 7);
      const endOfLastWeek = new Date(nowLW.getFullYear(), nowLW.getMonth(), nowLW.getDate() - nowLW.getDay());
      return {
        [field]: {
          gte: startOfLastWeek,
          lt: endOfLastWeek,
        },
      };

    case 'thisMonth':
      const nowTM = new Date();
      const startOfMonth = new Date(nowTM.getFullYear(), nowTM.getMonth(), 1);
      const endOfMonth = new Date(nowTM.getFullYear(), nowTM.getMonth() + 1, 1);
      return {
        [field]: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      };

    case 'lastMonth':
      const nowLM = new Date();
      const startOfLastMonth = new Date(nowLM.getFullYear(), nowLM.getMonth() - 1, 1);
      const endOfLastMonth = new Date(nowLM.getFullYear(), nowLM.getMonth(), 1);
      return {
        [field]: {
          gte: startOfLastMonth,
          lt: endOfLastMonth,
        },
      };

    case 'thisYear':
      const nowTY = new Date();
      const startOfYear = new Date(nowTY.getFullYear(), 0, 1);
      const endOfYear = new Date(nowTY.getFullYear() + 1, 0, 1);
      return {
        [field]: {
          gte: startOfYear,
          lt: endOfYear,
        },
      };

    case 'lastYear':
      const nowLY = new Date();
      const startOfLastYear = new Date(nowLY.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(nowLY.getFullYear(), 0, 1);
      return {
        [field]: {
          gte: startOfLastYear,
          lt: endOfLastYear,
        },
      };

    default:
      return null;
  }

  return null;
}

function buildOrderByClause(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc', modelConfig?: any): any {
  if (!sortBy) {
    // Default sorting
    return { createdAt: 'desc' };
  }

  // Validate field exists in model
  if (modelConfig) {
    const field = modelConfig.fields.find((f: any) => f.name === sortBy);
    if (!field) {
      return { createdAt: 'desc' };
    }
  }

  return { [sortBy]: sortOrder };
}

function convertValue(value: any, type: string): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (type) {
    case 'number':
      const num = Number(value);
      return isNaN(num) ? null : num;

    case 'date':
    case 'datetime':
      return new Date(value);

    case 'checkbox':
    case 'switch':
      return Boolean(value);

    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }

    default:
      return value;
  }
}