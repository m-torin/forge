'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new workflow service usage record
 */
export async function createWorkflowServiceUsageOrm(args: Prisma.WorkflowServiceUsageCreateArgs) {
  try {
    return await prisma.workflowServiceUsage.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first workflow service usage matching criteria
 */
export async function findFirstWorkflowServiceUsageOrm(
  args?: Prisma.WorkflowServiceUsageFindFirstArgs,
) {
  return await prisma.workflowServiceUsage.findFirst(args);
}

/**
 * Find unique workflow service usage
 */
export async function findUniqueWorkflowServiceUsageOrm(
  args: Prisma.WorkflowServiceUsageFindUniqueArgs,
) {
  return await prisma.workflowServiceUsage.findUnique(args);
}

/**
 * Find unique workflow service usage or throw error if not found
 */
export async function findUniqueWorkflowServiceUsageOrmOrThrow(
  args: Prisma.WorkflowServiceUsageFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.workflowServiceUsage.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(
        `WorkflowServiceUsage not found with criteria: ${JSON.stringify(args.where)}`,
      );
    }
    handlePrismaError(error);
  }
}

/**
 * Find many workflow service usage records
 */
export async function findManyWorkflowServiceUsagesOrm(
  args?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Update workflow service usage
 */
export async function updateWorkflowServiceUsageOrm(args: Prisma.WorkflowServiceUsageUpdateArgs) {
  try {
    return await prisma.workflowServiceUsage.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowServiceUsage not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many workflow service usage records
 */
export async function updateManyWorkflowServiceUsagesOrm(
  args: Prisma.WorkflowServiceUsageUpdateManyArgs,
) {
  return await prisma.workflowServiceUsage.updateMany(args);
}

/**
 * Upsert workflow service usage
 */
export async function upsertWorkflowServiceUsageOrm(args: Prisma.WorkflowServiceUsageUpsertArgs) {
  try {
    return await prisma.workflowServiceUsage.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete workflow service usage
 */
export async function deleteWorkflowServiceUsageOrm(args: Prisma.WorkflowServiceUsageDeleteArgs) {
  try {
    return await prisma.workflowServiceUsage.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowServiceUsage not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many workflow service usage records
 */
export async function deleteManyWorkflowServiceUsagesOrm(
  args?: Prisma.WorkflowServiceUsageDeleteManyArgs,
) {
  return await prisma.workflowServiceUsage.deleteMany(args);
}

/**
 * Aggregate workflow service usage data
 */
export async function aggregateWorkflowServiceUsagesOrm(
  args?: Prisma.WorkflowServiceUsageAggregateArgs,
) {
  return await prisma.workflowServiceUsage.aggregate(args ?? {});
}

/**
 * Count workflow service usage records
 */
export async function countWorkflowServiceUsagesOrm(args?: Prisma.WorkflowServiceUsageCountArgs) {
  return await prisma.workflowServiceUsage.count(args);
}

/**
 * Group workflow service usage by specified fields
 */
export async function groupByWorkflowServiceUsagesOrm(
  args: Prisma.WorkflowServiceUsageGroupByArgs,
) {
  return await prisma.workflowServiceUsage.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find workflow service usage by execution ID (leverages index)
 */
export async function findWorkflowServiceUsageByExecutionIdOrm(
  executionId: string,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      executionId: executionId,
    },
    orderBy: {
      startedAt: 'asc',
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by workflow slug (leverages index)
 */
export async function findWorkflowServiceUsageBySlugOrm(
  workflowSlug: string,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      workflowSlug: workflowSlug,
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by service name
 */
export async function findWorkflowServiceUsageByServiceNameOrm(
  serviceName: string,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      serviceName: serviceName,
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by service type
 */
export async function findWorkflowServiceUsageByServiceTypeOrm(
  serviceType: string,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      serviceType: serviceType,
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by operation
 */
export async function findWorkflowServiceUsageByOperationOrm(
  operation: string,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      operation: operation,
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by service name and type combination
 */
export async function findWorkflowServiceUsageByServiceAndTypeOrm(
  serviceName: string,
  serviceType: string,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      serviceName: serviceName,
      serviceType: serviceType,
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage with operation count above threshold
 */
export async function findWorkflowServiceUsageByOperationCountOrm(
  minOperations: number,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      operationCount: {
        gte: minOperations,
      },
    },
    orderBy: {
      operationCount: 'desc',
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage with bytes processed
 */
export async function findWorkflowServiceUsageWithBytesProcessedOrm(
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      bytesProcessed: {
        not: null,
      },
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by bytes processed range
 */
export async function findWorkflowServiceUsageByBytesRangeOrm(
  minBytes: bigint,
  maxBytes: bigint,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      bytesProcessed: {
        gte: minBytes,
        lte: maxBytes,
      },
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage with tokens used
 */
export async function findWorkflowServiceUsageWithTokensOrm(
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      tokensUsed: {
        not: null,
      },
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by token usage range
 */
export async function findWorkflowServiceUsageByTokenRangeOrm(
  minTokens: number,
  maxTokens: number,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      tokensUsed: {
        gte: minTokens,
        lte: maxTokens,
      },
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by duration range
 */
export async function findWorkflowServiceUsageByDurationRangeOrm(
  minDurationMs: number,
  maxDurationMs: number,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      durationMs: {
        gte: minDurationMs,
        lte: maxDurationMs,
      },
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find slow workflow service usage (above duration threshold)
 */
export async function findSlowWorkflowServiceUsageOrm(
  durationThresholdMs: number,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      durationMs: {
        gte: durationThresholdMs,
      },
    },
    orderBy: {
      durationMs: 'desc',
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage by cost range (in cents)
 */
export async function findWorkflowServiceUsageByCostRangeOrm(
  minCostCents: number,
  maxCostCents: number,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      costCents: {
        gte: minCostCents,
        lte: maxCostCents,
      },
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find expensive workflow service usage (above cost threshold)
 */
export async function findExpensiveWorkflowServiceUsageOrm(
  costThresholdCents: number,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      costCents: {
        gte: costThresholdCents,
      },
    },
    orderBy: {
      costCents: 'desc',
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage with errors
 */
export async function findWorkflowServiceUsageWithErrorsOrm(
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      errorMessage: {
        not: null,
      },
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find completed workflow service usage
 */
export async function findCompletedWorkflowServiceUsageOrm(
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      completedAt: {
        not: null,
      },
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find pending workflow service usage (not completed)
 */
export async function findPendingWorkflowServiceUsageOrm(
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      completedAt: null,
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// WorkflowServiceUsage model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find workflow service usage with execution relation
 */
export async function findWorkflowServiceUsageWithExecutionOrm(id: string) {
  return await prisma.workflowServiceUsage.findUnique({
    where: { id },
    include: {
      execution: true,
    },
  });
}

/**
 * Find workflow service usage with all relations included
 */
export async function findWorkflowServiceUsageWithAllRelationsOrm(id: string) {
  return await prisma.workflowServiceUsage.findUnique({
    where: { id },
    include: {
      execution: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find workflow service usage started after a specific date (leverages index)
 */
export async function findWorkflowServiceUsageStartedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      startedAt: {
        gte: date,
      },
    },
    orderBy: {
      startedAt: 'desc',
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find workflow service usage completed after a specific date
 */
export async function findWorkflowServiceUsageCompletedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      completedAt: {
        gte: date,
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find recently started workflow service usage within specified days
 */
export async function findRecentWorkflowServiceUsageOrm(
  days: number = 7,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      startedAt: {
        gte: cutoffDate,
      },
    },
    orderBy: {
      startedAt: 'desc',
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Mark workflow service usage as completed
 */
export async function markWorkflowServiceUsageCompletedOrm(id: string) {
  try {
    return await prisma.workflowServiceUsage.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowServiceUsage not found for completion marking: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Get workflow service usage summary by service name
 */
export async function getWorkflowServiceUsageSummaryByServiceOrm(serviceName: string) {
  return await prisma.workflowServiceUsage.aggregate({
    where: { serviceName },
    _sum: {
      operationCount: true,
      tokensUsed: true,
      costCents: true,
    },
    _avg: {
      durationMs: true,
      costCents: true,
    },
    _count: {
      id: true,
    },
    _max: {
      durationMs: true,
      costCents: true,
      bytesProcessed: true,
      tokensUsed: true,
    },
  });
}

/**
 * Get workflow service usage summary by workflow slug
 */
export async function getWorkflowServiceUsageSummaryBySlugOrm(workflowSlug: string) {
  return await prisma.workflowServiceUsage.aggregate({
    where: { workflowSlug },
    _sum: {
      operationCount: true,
      tokensUsed: true,
      costCents: true,
    },
    _avg: {
      durationMs: true,
      costCents: true,
    },
    _count: {
      id: true,
    },
  });
}

/**
 * Find workflow service usage in date range
 */
export async function findWorkflowServiceUsageInDateRangeOrm(
  startDate: Date,
  endDate: Date,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      startedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      startedAt: 'asc',
    },
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

/**
 * Find most used services by operation count
 */
export async function findMostUsedServicesOrm(
  limit: number = 10,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  return await prisma.workflowServiceUsage.groupBy({
    by: ['serviceName', 'serviceType'],
    where: additionalArgs?.where,
    _sum: {
      operationCount: true,
      costCents: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        operationCount: 'desc',
      },
    },
    take: limit,
  });
}

/**
 * Find most expensive services by cost
 */
export async function findMostExpensiveServicesOrm(
  limit: number = 10,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  return await prisma.workflowServiceUsage.groupBy({
    by: ['serviceName', 'serviceType'],
    where: additionalArgs?.where,
    _sum: {
      costCents: true,
      operationCount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        costCents: 'desc',
      },
    },
    take: limit,
  });
}

/**
 * Find service usage efficiency (operations per cost)
 */
export async function findServiceUsageEfficiencyOrm(
  minOperations: number = 1,
  additionalArgs?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  const args: Prisma.WorkflowServiceUsageFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      operationCount: {
        gte: minOperations,
      },
      costCents: {
        gt: 0,
      },
    },
    orderBy: [
      {
        operationCount: 'desc',
      },
      {
        costCents: 'asc',
      },
    ],
  };
  return await prisma.workflowServiceUsage.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * WorkflowServiceUsage with execution relation
 */
export type WorkflowServiceUsageWithExecution = Prisma.WorkflowServiceUsageGetPayload<{
  include: { execution: true };
}>;

/**
 * WorkflowServiceUsage with all relations for complete data access
 */
export type WorkflowServiceUsageWithAllRelations = Prisma.WorkflowServiceUsageGetPayload<{
  include: {
    execution: true;
  };
}>;

/**
 * WorkflowServiceUsage search result type for optimized queries
 */
export type WorkflowServiceUsageSearchResult = Prisma.WorkflowServiceUsageGetPayload<{
  select: {
    id: true;
    executionId: true;
    workflowSlug: true;
    serviceName: true;
    serviceType: true;
    operation: true;
    operationCount: true;
    bytesProcessed: true;
    tokensUsed: true;
    durationMs: true;
    costCents: true;
    startedAt: true;
    completedAt: true;
    errorMessage: true;
  };
}>;

/**
 * WorkflowServiceUsage cost summary
 */
export type WorkflowServiceUsageCostSummary = Prisma.WorkflowServiceUsageGetPayload<{
  select: {
    id: true;
    serviceName: true;
    serviceType: true;
    operation: true;
    operationCount: true;
    costCents: true;
    durationMs: true;
  };
}>;

/**
 * WorkflowServiceUsage performance metrics
 */
export type WorkflowServiceUsagePerformance = Prisma.WorkflowServiceUsageGetPayload<{
  select: {
    id: true;
    serviceName: true;
    serviceType: true;
    operation: true;
    operationCount: true;
    bytesProcessed: true;
    tokensUsed: true;
    durationMs: true;
    startedAt: true;
    completedAt: true;
  };
}>;

/**
 * WorkflowServiceUsage aggregation result for service summary
 */
export type WorkflowServiceUsageAggregationResult = Prisma.GetWorkflowServiceUsageAggregateType<{
  _sum: {
    operationCount: true;
    tokensUsed: true;
    costCents: true;
  };
  _avg: {
    durationMs: true;
    costCents: true;
  };
  _count: {
    id: true;
  };
  _max: {
    durationMs: true;
    costCents: true;
    bytesProcessed: true;
    tokensUsed: true;
  };
}>;

/**
 * WorkflowServiceUsage group by result for service analysis
 */
export type WorkflowServiceUsageGroupByResult = Prisma.WorkflowServiceUsageGroupByOutputType;

/**
 * WorkflowServiceUsage timeline entry for execution tracking
 */
export type WorkflowServiceUsageTimelineEntry = Prisma.WorkflowServiceUsageGetPayload<{
  select: {
    id: true;
    serviceName: true;
    serviceType: true;
    operation: true;
    startedAt: true;
    completedAt: true;
    durationMs: true;
    errorMessage: true;
  };
}>;

//==============================================================================
// SPECIALIZED SERVICE USAGE OPERATIONS
//==============================================================================

/**
 * Track service usage with timing
 */
export async function trackServiceUsageOrm(
  usageData: Prisma.WorkflowServiceUsageCreateInput & {
    startTime?: Date;
    endTime?: Date;
  },
) {
  try {
    const { startTime, endTime, ...usageInput } = usageData;

    const durationMs = startTime && endTime ? endTime.getTime() - startTime.getTime() : undefined;

    return await prisma.workflowServiceUsage.create({
      data: {
        ...usageInput,
        startedAt: startTime || new Date(),
        completedAt: endTime,
        durationMs,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}
