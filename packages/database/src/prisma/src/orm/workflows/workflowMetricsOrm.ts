'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new workflow metrics record
 */
export async function createWorkflowMetricsOrm(args: Prisma.WorkflowMetricsCreateArgs) {
  try {
    return await prisma.workflowMetrics.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first workflow metrics matching criteria
 */
export async function findFirstWorkflowMetricsOrm(args?: Prisma.WorkflowMetricsFindFirstArgs) {
  return await prisma.workflowMetrics.findFirst(args);
}

/**
 * Find unique workflow metrics
 */
export async function findUniqueWorkflowMetricsOrm(args: Prisma.WorkflowMetricsFindUniqueArgs) {
  return await prisma.workflowMetrics.findUnique(args);
}

/**
 * Find unique workflow metrics or throw error if not found
 */
export async function findUniqueWorkflowMetricsOrmOrThrow(
  args: Prisma.WorkflowMetricsFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.workflowMetrics.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowMetrics not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many workflow metrics
 */
export async function findManyWorkflowMetricsOrm(args?: Prisma.WorkflowMetricsFindManyArgs) {
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Update workflow metrics
 */
export async function updateWorkflowMetricsOrm(args: Prisma.WorkflowMetricsUpdateArgs) {
  try {
    return await prisma.workflowMetrics.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowMetrics not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many workflow metrics
 */
export async function updateManyWorkflowMetricsOrm(args: Prisma.WorkflowMetricsUpdateManyArgs) {
  return await prisma.workflowMetrics.updateMany(args);
}

/**
 * Upsert workflow metrics
 */
export async function upsertWorkflowMetricsOrm(args: Prisma.WorkflowMetricsUpsertArgs) {
  try {
    return await prisma.workflowMetrics.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete workflow metrics
 */
export async function deleteWorkflowMetricsOrm(args: Prisma.WorkflowMetricsDeleteArgs) {
  try {
    return await prisma.workflowMetrics.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowMetrics not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many workflow metrics
 */
export async function deleteManyWorkflowMetricsOrm(args?: Prisma.WorkflowMetricsDeleteManyArgs) {
  return await prisma.workflowMetrics.deleteMany(args);
}

/**
 * Aggregate workflow metrics data
 */
export async function aggregateWorkflowMetricsOrm(args?: Prisma.WorkflowMetricsAggregateArgs) {
  return await prisma.workflowMetrics.aggregate(args ?? {});
}

/**
 * Count workflow metrics
 */
export async function countWorkflowMetricsOrm(args?: Prisma.WorkflowMetricsCountArgs) {
  return await prisma.workflowMetrics.count(args);
}

/**
 * Group workflow metrics by specified fields
 */
export async function groupByWorkflowMetricsOrm(args: Prisma.WorkflowMetricsGroupByArgs) {
  return await prisma.workflowMetrics.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find workflow metrics by execution ID (leverages unique index)
 */
export async function findWorkflowMetricsByExecutionIdOrm(executionId: string) {
  return await prisma.workflowMetrics.findUnique({
    where: { executionId },
  });
}

/**
 * Find workflow metrics by workflow slug (leverages index)
 */
export async function findWorkflowMetricsBySlugOrm(
  workflowSlug: string,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      workflowSlug: workflowSlug,
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics by duration range
 */
export async function findWorkflowMetricsByDurationRangeOrm(
  minDurationMs: number,
  maxDurationMs: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      totalDuration: {
        gte: minDurationMs,
        lte: maxDurationMs,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find long-running workflow metrics (above threshold)
 */
export async function findLongRunningWorkflowMetricsOrm(
  durationThresholdMs: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      totalDuration: {
        gte: durationThresholdMs,
      },
    },
    orderBy: {
      totalDuration: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics by step count range
 */
export async function findWorkflowMetricsByStepCountRangeOrm(
  minSteps: number,
  maxSteps: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stepsPlanned: {
        gte: minSteps,
        lte: maxSteps,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics with failed steps
 */
export async function findWorkflowMetricsWithFailedStepsOrm(
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stepsFailed: {
        gt: 0,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics with retried steps
 */
export async function findWorkflowMetricsWithRetriedStepsOrm(
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stepsRetried: {
        gt: 0,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics with memory usage data
 */
export async function findWorkflowMetricsWithMemoryUsageOrm(
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      memoryUsageMB: {
        not: null,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find high memory usage workflow metrics (above threshold)
 */
export async function findHighMemoryWorkflowMetricsOrm(
  memoryThresholdMB: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      memoryUsageMB: {
        gte: memoryThresholdMB,
      },
    },
    orderBy: {
      memoryUsageMB: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics by CPU usage range
 */
export async function findWorkflowMetricsByCpuUsageRangeOrm(
  minCpuPercent: number,
  maxCpuPercent: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      cpuUsagePercent: {
        gte: minCpuPercent,
        lte: maxCpuPercent,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics by network usage (bytes sent + received)
 */
export async function findWorkflowMetricsByNetworkUsageOrm(
  minNetworkBytes: bigint,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          networkBytesSent: {
            gte: minNetworkBytes,
          },
        },
        {
          networkBytesReceived: {
            gte: minNetworkBytes,
          },
        },
      ],
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics by database query count
 */
export async function findWorkflowMetricsByDatabaseQueriesOrm(
  minQueries: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      databaseQueries: {
        gte: minQueries,
      },
    },
    orderBy: {
      databaseQueries: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics by AI token usage
 */
export async function findWorkflowMetricsByAiTokenUsageOrm(
  minTokens: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      aiTokensUsed: {
        gte: minTokens,
      },
    },
    orderBy: {
      aiTokensUsed: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics with quality scores
 */
export async function findWorkflowMetricsWithQualityScoresOrm(
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      overallQualityScore: {
        not: null,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics by quality score range
 */
export async function findWorkflowMetricsByQualityScoreRangeOrm(
  minScore: number,
  maxScore: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      overallQualityScore: {
        gte: minScore,
        lte: maxScore,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find high quality workflow metrics (above threshold)
 */
export async function findHighQualityWorkflowMetricsOrm(
  qualityThreshold: number = 8.0,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      overallQualityScore: {
        gte: qualityThreshold,
      },
    },
    orderBy: {
      overallQualityScore: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics by cost range (in cents)
 */
export async function findWorkflowMetricsByCostRangeOrm(
  minCostCents: number,
  maxCostCents: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      totalCostCents: {
        gte: minCostCents,
        lte: maxCostCents,
      },
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find expensive workflow metrics (above cost threshold)
 */
export async function findExpensiveWorkflowMetricsOrm(
  costThresholdCents: number,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      totalCostCents: {
        gte: costThresholdCents,
      },
    },
    orderBy: {
      totalCostCents: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// WorkflowMetrics model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find workflow metrics with execution relation
 */
export async function findWorkflowMetricsWithExecutionOrm(id: string) {
  return await prisma.workflowMetrics.findUnique({
    where: { id },
    include: {
      execution: true,
    },
  });
}

/**
 * Find workflow metrics with all relations included
 */
export async function findWorkflowMetricsWithAllRelationsOrm(id: string) {
  return await prisma.workflowMetrics.findUnique({
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
 * Find workflow metrics created after a specific date
 */
export async function findWorkflowMetricsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: date,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find workflow metrics updated after a specific date
 */
export async function findWorkflowMetricsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      updatedAt: {
        gte: date,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find recently created or updated workflow metrics within specified days
 */
export async function findRecentWorkflowMetricsOrm(
  days: number = 7,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          createdAt: {
            gte: cutoffDate,
          },
        },
        {
          updatedAt: {
            gte: cutoffDate,
          },
        },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find workflow metrics with performance issues (slow, high resource usage)
 */
export async function findWorkflowMetricsWithPerformanceIssuesOrm(
  durationThresholdMs: number = 300000, // 5 minutes
  memoryThresholdMB: number = 1024, // 1GB
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          totalDuration: {
            gte: durationThresholdMs,
          },
        },
        {
          memoryUsageMB: {
            gte: memoryThresholdMB,
          },
        },
        {
          stepsFailed: {
            gt: 0,
          },
        },
      ],
    },
    orderBy: {
      totalDuration: 'desc',
    },
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Get workflow metrics summary by workflow slug
 */
export async function getWorkflowMetricsSummaryBySlugOrm(workflowSlug: string) {
  return await prisma.workflowMetrics.aggregate({
    where: { workflowSlug },
    _avg: {
      totalDuration: true,
      memoryUsageMB: true,
      cpuUsagePercent: true,
      overallQualityScore: true,
      totalCostCents: true,
    },
    _sum: {
      stepsPlanned: true,
      stepsExecuted: true,
      stepsSucceeded: true,
      stepsFailed: true,
      databaseQueries: true,
      apiCallsExternal: true,
      aiTokensUsed: true,
      totalCostCents: true,
    },
    _count: {
      id: true,
    },
    _max: {
      totalDuration: true,
      memoryUsageMB: true,
      totalCostCents: true,
    },
    _min: {
      totalDuration: true,
      overallQualityScore: true,
    },
  });
}

/**
 * Find top performing workflows by efficiency (quality vs cost)
 */
export async function findTopPerformingWorkflowMetricsOrm(
  limit: number = 10,
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      overallQualityScore: {
        not: null,
      },
      totalCostCents: {
        gt: 0,
      },
    },
    orderBy: [
      {
        overallQualityScore: 'desc',
      },
      {
        totalCostCents: 'asc',
      },
    ],
    take: limit,
  };
  return await prisma.workflowMetrics.findMany(args);
}

/**
 * Find resource-intensive workflow metrics for optimization
 */
export async function findResourceIntensiveWorkflowMetricsOrm(
  additionalArgs?: Prisma.WorkflowMetricsFindManyArgs,
) {
  const args: Prisma.WorkflowMetricsFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          memoryUsageMB: {
            gte: 512, // 512MB+
          },
        },
        {
          cpuUsagePercent: {
            gte: 80, // 80%+
          },
        },
        {
          databaseQueries: {
            gte: 100, // 100+ queries
          },
        },
        {
          aiTokensUsed: {
            gte: 10000, // 10k+ tokens
          },
        },
      ],
    },
    orderBy: [
      {
        memoryUsageMB: 'desc',
      },
      {
        totalDuration: 'desc',
      },
    ],
  };
  return await prisma.workflowMetrics.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * WorkflowMetrics with execution relation
 */
export type WorkflowMetricsWithExecution = Prisma.WorkflowMetricsGetPayload<{
  include: { execution: true };
}>;

/**
 * WorkflowMetrics with all relations for complete data access
 */
export type WorkflowMetricsWithAllRelations = Prisma.WorkflowMetricsGetPayload<{
  include: {
    execution: true;
  };
}>;

/**
 * WorkflowMetrics search result type for optimized queries
 */
export type WorkflowMetricsSearchResult = Prisma.WorkflowMetricsGetPayload<{
  select: {
    id: true;
    executionId: true;
    workflowSlug: true;
    totalDuration: true;
    stepsPlanned: true;
    stepsExecuted: true;
    stepsSucceeded: true;
    stepsFailed: true;
    memoryUsageMB: true;
    cpuUsagePercent: true;
    overallQualityScore: true;
    totalCostCents: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

/**
 * WorkflowMetrics performance summary
 */
export type WorkflowMetricsPerformanceSummary = Prisma.WorkflowMetricsGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    totalDuration: true;
    setupDuration: true;
    executionDuration: true;
    cleanupDuration: true;
    memoryUsageMB: true;
    cpuUsagePercent: true;
    performanceScore: true;
  };
}>;

/**
 * WorkflowMetrics cost breakdown
 */
export type WorkflowMetricsCostBreakdown = Prisma.WorkflowMetricsGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    computeCostCents: true;
    storageCostCents: true;
    networkCostCents: true;
    externalApiCostCents: true;
    totalCostCents: true;
  };
}>;

/**
 * WorkflowMetrics resource usage summary
 */
export type WorkflowMetricsResourceUsage = Prisma.WorkflowMetricsGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    memoryUsageMB: true;
    cpuUsagePercent: true;
    networkBytesSent: true;
    networkBytesReceived: true;
    databaseQueries: true;
    apiCallsExternal: true;
    fileOperations: true;
    aiTokensUsed: true;
  };
}>;

/**
 * WorkflowMetrics quality assessment
 */
export type WorkflowMetricsQualityAssessment = Prisma.WorkflowMetricsGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    dataQualityScore: true;
    performanceScore: true;
    reliabilityScore: true;
    overallQualityScore: true;
    stepsSucceeded: true;
    stepsFailed: true;
    stepsRetried: true;
  };
}>;

/**
 * WorkflowMetrics aggregation result type
 */
export type WorkflowMetricsAggregationResult = Prisma.GetWorkflowMetricsAggregateType<{
  _avg: {
    totalDuration: true;
    memoryUsageMB: true;
    cpuUsagePercent: true;
    overallQualityScore: true;
    totalCostCents: true;
  };
  _sum: {
    stepsPlanned: true;
    stepsExecuted: true;
    stepsSucceeded: true;
    stepsFailed: true;
    databaseQueries: true;
    apiCallsExternal: true;
    aiTokensUsed: true;
    totalCostCents: true;
  };
  _count: {
    id: true;
  };
  _max: {
    totalDuration: true;
    memoryUsageMB: true;
    totalCostCents: true;
  };
  _min: {
    totalDuration: true;
    overallQualityScore: true;
  };
}>;

//==============================================================================
// SPECIALIZED METRICS OPERATIONS
//==============================================================================

/**
 * Get workflow statistics for a specific workflow
 */
export async function getWorkflowStatisticsOrm(
  workflowSlug: string,
  timeRange?: {
    startDate?: Date;
    endDate?: Date;
  },
) {
  try {
    const whereClause: Prisma.WorkflowMetricsWhereInput = {
      execution: {
        workflowSlug,
      },
    };

    if (timeRange) {
      whereClause.createdAt = {};
      if (timeRange.startDate) {
        whereClause.createdAt.gte = timeRange.startDate;
      }
      if (timeRange.endDate) {
        whereClause.createdAt.lte = timeRange.endDate;
      }
    }

    const [totalExecutions, avgMetrics, recentExecutions] = await Promise.all([
      // Total execution count
      prisma.workflowMetrics.count({
        where: whereClause,
      }),

      // Average metrics
      prisma.workflowMetrics.aggregate({
        where: whereClause,
        _avg: {
          totalDuration: true,
          memoryUsageMB: true,
          totalCostCents: true,
          overallQualityScore: true,
        },
        _sum: {
          totalCostCents: true,
        },
      }),

      // Recent executions for trend analysis
      prisma.workflowMetrics.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          totalDuration: true,
          memoryUsageMB: true,
          totalCostCents: true,
          overallQualityScore: true,
          createdAt: true,
          execution: {
            select: {
              id: true,
              status: true,
              startedAt: true,
              completedAt: true,
            },
          },
        },
      }),
    ]);

    return {
      workflowSlug,
      timeRange,
      summary: {
        totalExecutions,
        avgDuration: avgMetrics._avg.totalDuration,
        avgMemoryUsage: avgMetrics._avg.memoryUsageMB,
        avgQualityScore: avgMetrics._avg.overallQualityScore,
        totalCost: avgMetrics._sum.totalCostCents,
      },
      recentExecutions,
    };
  } catch (error) {
    handlePrismaError(error);
  }
}
